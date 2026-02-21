import { useEffect, useRef, useState } from 'react'
import type { NoteSummary } from '../../types/ui'
import { ConfirmModal } from '../common/ConfirmModal'
import { EditorPane } from '../editor/EditorPane'
import { AppTopBar } from './AppTopBar'
import { NotesSidebar } from '../sidebar/NotesSidebar'

interface DesktopNotesLayoutProps {
  appTitle: string
  menuItems: readonly string[]
}

interface NotesApi {
  list: () => Promise<NoteSummary[]>
  create: () => Promise<NoteSummary>
  update: (payload: { id: string; title: string; content: string }) => Promise<NoteSummary | null>
  delete: (noteId: string) => Promise<boolean>
}

const browserNotesStorageKey = 'online-notes:web-notes'

function generateNoteId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function buildExcerpt(content: string): string {
  const normalizedContent = content.replace(/\s+/g, ' ').trim()
  if (!normalizedContent) return 'Blank'
  return normalizedContent.slice(0, 72)
}

function loadBrowserNotes(): NoteSummary[] {
  try {
    const rawValue = window.localStorage.getItem(browserNotesStorageKey)
    if (!rawValue) return []
    const parsedValue = JSON.parse(rawValue) as Array<Partial<NoteSummary>>
    if (!Array.isArray(parsedValue)) return []
    return parsedValue.map((note) => ({
      id: typeof note.id === 'string' ? note.id : generateNoteId(),
      title: typeof note.title === 'string' ? note.title : 'Untitled Note',
      excerpt: typeof note.excerpt === 'string' ? note.excerpt : 'Blank',
      content: typeof note.content === 'string' ? note.content : '',
      relativeTime: typeof note.relativeTime === 'string' ? note.relativeTime : 'just now'
    }))
  } catch {
    return []
  }
}

function saveBrowserNotes(notes: NoteSummary[]): void {
  try {
    window.localStorage.setItem(browserNotesStorageKey, JSON.stringify(notes))
  } catch {
    // Ignore localStorage failures in restricted contexts.
  }
}

function getNotesApi(): NotesApi | null {
  const desktopApi = (window as Window & { api?: { notes?: NotesApi } }).api?.notes
  return desktopApi ?? null
}

export function DesktopNotesLayout({ appTitle, menuItems }: DesktopNotesLayoutProps): React.JSX.Element {
  const [notes, setNotes] = useState<NoteSummary[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isExpandedView, setIsExpandedView] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const updateTimeoutIdRef = useRef<number | null>(null)
  const activeNote = notes.find((note) => note.id === activeNoteId) ?? notes[0] ?? null

  const clearPendingUpdate = (): void => {
    if (updateTimeoutIdRef.current === null) return
    window.clearTimeout(updateTimeoutIdRef.current)
    updateTimeoutIdRef.current = null
  }

  useEffect(() => {
    const loadNotes = async (): Promise<void> => {
      try {
        const notesApi = getNotesApi()
        const storedNotes = notesApi ? await notesApi.list() : loadBrowserNotes()
        setNotes(storedNotes)
        setActiveNoteId(storedNotes[0]?.id ?? '')
      } catch (error) {
        console.error('Failed to load notes', error)
      }
    }

    void loadNotes()
  }, [])

  useEffect(() => {
    if (activeNote) {
      if (activeNoteId !== activeNote.id) setActiveNoteId(activeNote.id)
      return
    }

    if (activeNoteId) setActiveNoteId('')
  }, [activeNote, activeNoteId])

  useEffect(() => {
    const syncMaximizedState = async (): Promise<void> => {
      try {
        const isMaximized = await window.electron.ipcRenderer.invoke('window:is-maximized')
        setIsExpandedView(Boolean(isMaximized))
      } catch {
        // Keep UI-only fallback state if Electron IPC is unavailable.
      }
    }

    void syncMaximizedState()
  }, [])

  useEffect(() => {
    return () => {
      clearPendingUpdate()
    }
  }, [])

  const queuePersistNote = (note: NoteSummary): void => {
    clearPendingUpdate()
    updateTimeoutIdRef.current = window.setTimeout(() => {
      const persistNote = async (): Promise<void> => {
        try {
          const notesApi = getNotesApi()
          const updatedNote = notesApi
            ? await notesApi.update({
                id: note.id,
                title: note.title,
                content: note.content
              })
            : note

          if (!updatedNote) return
          setNotes((prev) => {
            const updatedNotes = prev.map((item) => (item.id === updatedNote.id ? updatedNote : item))
            if (!notesApi) saveBrowserNotes(updatedNotes)
            return updatedNotes
          })
        } catch (error) {
          console.error('Failed to update note', error)
        } finally {
          updateTimeoutIdRef.current = null
        }
      }

      void persistNote()
    }, 250)
  }

  const handleChangeActiveNoteTitle = (title: string): void => {
    if (!activeNote) return

    const nextNote: NoteSummary = {
      ...activeNote,
      title,
      relativeTime: 'just now'
    }

    setNotes((prev) => prev.map((note) => (note.id === activeNote.id ? nextNote : note)))
    queuePersistNote(nextNote)
  }

  const handleChangeActiveNoteContent = (content: string): void => {
    if (!activeNote) return

    const nextNote: NoteSummary = {
      ...activeNote,
      content,
      excerpt: buildExcerpt(content),
      relativeTime: 'just now'
    }

    setNotes((prev) => prev.map((note) => (note.id === activeNote.id ? nextNote : note)))
    queuePersistNote(nextNote)
  }

  const handleToggleExpandedView = (): void => {
    const toggleWindow = async (): Promise<void> => {
      try {
        const isMaximized = await window.electron.ipcRenderer.invoke('window:toggle-maximize')
        setIsExpandedView(Boolean(isMaximized))
      } catch {
        // Fallback for non-Electron environments.
        setIsExpandedView((prev) => !prev)
      }
    }

    void toggleWindow()
  }

  const handleRequestDeleteActiveNote = (): void => {
    if (!activeNote) return
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDeleteActiveNote = (): void => {
    if (!activeNote) return
    const deletingNoteId = activeNote.id

    const deleteNote = async (): Promise<void> => {
      try {
        clearPendingUpdate()
        const notesApi = getNotesApi()
        const isDeleted = notesApi ? await notesApi.delete(deletingNoteId) : true
        if (!isDeleted) return
        setNotes((prev) => {
          const remainingNotes = prev.filter((note) => note.id !== deletingNoteId)
          if (!notesApi) saveBrowserNotes(remainingNotes)
          return remainingNotes
        })
      } catch (error) {
        console.error('Failed to delete note', error)
      } finally {
        setIsDeleteModalOpen(false)
      }
    }

    void deleteNote()
  }

  const handleCreateNote = (): void => {
    const createNote = async (): Promise<void> => {
      try {
        const notesApi = getNotesApi()
        const createdNote = notesApi
          ? await notesApi.create()
          : {
              id: generateNoteId(),
              title: 'Untitled Note',
              excerpt: 'Blank',
              content: '',
              relativeTime: 'just now'
            }

        setNotes((prev) => {
          const nextNotes = [createdNote, ...prev]
          if (!notesApi) saveBrowserNotes(nextNotes)
          return nextNotes
        })
        setActiveNoteId(createdNote.id)
      } catch (error) {
        console.error('Failed to create note', error)
      }
    }

    void createNote()
  }

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#f5f6f8] font-sans text-[#2f3340]">
      {!isExpandedView && (
        <AppTopBar
          title={appTitle}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      )}

      <div className="flex min-h-0 flex-1">
        <div
          className={[
            'shrink-0 overflow-hidden transition-[width] duration-200 ease-out',
            isSidebarOpen ? 'w-[280px] border-r border-[#d9dee5] xl:w-[332px]' : 'w-0 border-r-0'
          ].join(' ')}
        >
          <NotesSidebar
            notes={notes}
            activeNoteId={activeNote?.id ?? ''}
            onCreateNote={handleCreateNote}
            onSelectNote={setActiveNoteId}
          />
        </div>

        <div className="min-w-0 flex-1">
          <EditorPane
            menuItems={menuItems}
            noteTitle={activeNote?.title ?? null}
            noteContent={activeNote?.content ?? null}
            onChangeNoteTitle={handleChangeActiveNoteTitle}
            onChangeNoteContent={handleChangeActiveNoteContent}
            onDeleteNote={handleRequestDeleteActiveNote}
            isExpandedView={isExpandedView}
            onToggleExpandedView={handleToggleExpandedView}
          />
        </div>
      </div>

      <ConfirmModal
        title="Confirm"
        message="Are you sure you want to delete this note?"
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDeleteActiveNote}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </main>
  )
}
