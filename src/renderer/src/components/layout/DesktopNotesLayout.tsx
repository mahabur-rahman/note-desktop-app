import { useEffect, useRef, useState } from 'react'
import type { NoteSummary, SidebarSortMode, SidebarViewMode } from '../../types/ui'
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
  clear: () => Promise<number>
  backup: () => Promise<{ path: string; count: number }>
}

const browserNotesStorageKey = 'online-notes:web-notes'
const sidebarViewModeStorageKey = 'online-notes:sidebar-view-mode'
const sidebarSortModeStorageKey = 'online-notes:sidebar-sort-mode'

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
    return normalizeNotes(parsedValue)
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

function getNotesApi(): Partial<NotesApi> | null {
  const desktopApi = (window as Window & { api?: { notes?: Partial<NotesApi> } }).api?.notes
  return desktopApi ?? null
}

function normalizeNotes(notes: Array<Partial<NoteSummary>>): NoteSummary[] {
  if (!Array.isArray(notes)) return []
  return notes.map((note) => {
    const now = Date.now()
    const createdAt = typeof note.createdAt === 'number' ? note.createdAt : now
    return {
      id: typeof note.id === 'string' ? note.id : generateNoteId(),
      title: typeof note.title === 'string' ? note.title : 'Untitled Note',
      excerpt: typeof note.excerpt === 'string' ? note.excerpt : 'Blank',
      content: typeof note.content === 'string' ? note.content : '',
      relativeTime: typeof note.relativeTime === 'string' ? note.relativeTime : 'just now',
      createdAt,
      updatedAt: typeof note.updatedAt === 'number' ? note.updatedAt : createdAt
    }
  })
}

function loadSidebarViewMode(): SidebarViewMode {
  try {
    const rawValue = window.localStorage.getItem(sidebarViewModeStorageKey)
    return rawValue === 'compact' ? 'compact' : 'detailed'
  } catch {
    return 'detailed'
  }
}

function loadSidebarSortMode(): SidebarSortMode {
  try {
    const rawValue = window.localStorage.getItem(sidebarSortModeStorageKey)
    if (rawValue === 'alphabetical' || rawValue === 'creation-date' || rawValue === 'last-modified') {
      return rawValue
    }
    return 'last-modified'
  } catch {
    return 'last-modified'
  }
}

function downloadBrowserBackup(notes: NoteSummary[]): string {
  const backupName = `notes-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const backupBlob = new Blob(
    [
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          count: notes.length,
          notes
        },
        null,
        2
      )
    ],
    { type: 'application/json' }
  )

  const downloadUrl = URL.createObjectURL(backupBlob)
  const anchorElement = document.createElement('a')
  anchorElement.href = downloadUrl
  anchorElement.download = backupName
  document.body.appendChild(anchorElement)
  anchorElement.click()
  anchorElement.remove()
  URL.revokeObjectURL(downloadUrl)

  return backupName
}

export function DesktopNotesLayout({ appTitle, menuItems }: DesktopNotesLayoutProps): React.JSX.Element {
  const [notes, setNotes] = useState<NoteSummary[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarViewMode, setSidebarViewMode] = useState<SidebarViewMode>(loadSidebarViewMode)
  const [sidebarSortMode, setSidebarSortMode] = useState<SidebarSortMode>(loadSidebarSortMode)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isExpandedView, setIsExpandedView] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const updateTimeoutIdRef = useRef<number | null>(null)
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase()
  const filteredNotes =
    normalizedSearchQuery === ''
      ? notes
      : notes.filter((note) => {
          const normalizedTitle = note.title.toLocaleLowerCase()
          const normalizedContent = note.content.toLocaleLowerCase()
          return (
            normalizedTitle.includes(normalizedSearchQuery) || normalizedContent.includes(normalizedSearchQuery)
          )
        })
  const sortedFilteredNotes = [...filteredNotes].sort((firstNote, secondNote) => {
    if (sidebarSortMode === 'alphabetical') {
      const titleCompare = firstNote.title.localeCompare(secondNote.title, undefined, { sensitivity: 'base' })
      if (titleCompare !== 0) return titleCompare
      return secondNote.updatedAt - firstNote.updatedAt
    }

    if (sidebarSortMode === 'creation-date') {
      return secondNote.createdAt - firstNote.createdAt
    }

    return secondNote.updatedAt - firstNote.updatedAt
  })
  const activeNote = notes.find((note) => note.id === activeNoteId) ?? notes[0] ?? null
  const activeNoteCharacterCount = Array.from(activeNote?.content ?? '').length

  const clearPendingUpdate = (): void => {
    if (updateTimeoutIdRef.current === null) return
    window.clearTimeout(updateTimeoutIdRef.current)
    updateTimeoutIdRef.current = null
  }

  useEffect(() => {
    const loadNotes = async (): Promise<void> => {
      try {
        const notesApi = getNotesApi()
        const storedNotes = normalizeNotes(
          notesApi && typeof notesApi.list === 'function' ? await notesApi.list() : loadBrowserNotes()
        )
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

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarViewModeStorageKey, sidebarViewMode)
    } catch {
      // Ignore localStorage failures in restricted contexts.
    }
  }, [sidebarViewMode])

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarSortModeStorageKey, sidebarSortMode)
    } catch {
      // Ignore localStorage failures in restricted contexts.
    }
  }, [sidebarSortMode])

  const queuePersistNote = (note: NoteSummary): void => {
    clearPendingUpdate()
    updateTimeoutIdRef.current = window.setTimeout(() => {
      const persistNote = async (): Promise<void> => {
        try {
          const notesApi = getNotesApi()
          const updatedNote =
            notesApi && typeof notesApi.update === 'function'
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

    const now = Date.now()
    const nextNote: NoteSummary = {
      ...activeNote,
      title,
      relativeTime: 'just now',
      updatedAt: now
    }

    setNotes((prev) => prev.map((note) => (note.id === activeNote.id ? nextNote : note)))
    queuePersistNote(nextNote)
  }

  const handleChangeActiveNoteContent = (content: string): void => {
    if (!activeNote) return

    const now = Date.now()
    const nextNote: NoteSummary = {
      ...activeNote,
      content,
      excerpt: buildExcerpt(content),
      relativeTime: 'just now',
      updatedAt: now
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
        const isDeleted =
          notesApi && typeof notesApi.delete === 'function' ? await notesApi.delete(deletingNoteId) : true
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
        const now = Date.now()
        const createdNote =
          notesApi && typeof notesApi.create === 'function'
            ? normalizeNotes([await notesApi.create()])[0]
            : {
              id: generateNoteId(),
              title: 'Untitled Note',
              excerpt: 'Blank',
              content: '',
              relativeTime: 'just now',
              createdAt: now,
              updatedAt: now
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

  const handleBackupNotes = (): void => {
    const backupNotes = async (): Promise<void> => {
      try {
        const notesApi = getNotesApi()
        if (notesApi && typeof notesApi.backup === 'function') {
          const backupResult = await notesApi.backup()
          window.alert(`Backup completed.\nSaved: ${backupResult.path}\nNotes: ${backupResult.count}`)
          return
        }

        const notesForBackup = normalizeNotes(
          notesApi && typeof notesApi.list === 'function' ? await notesApi.list() : notes
        )
        const backupName = downloadBrowserBackup(notesForBackup)
        window.alert(`Backup downloaded as ${backupName}`)
      } catch (error) {
        console.error('Failed to backup notes', error)
      }
    }

    void backupNotes()
  }

  const handleRequestClearNotes = (): void => {
    if (notes.length === 0) return
    setIsClearModalOpen(true)
  }

  const handleConfirmClearNotes = (): void => {
    const clearNotes = async (): Promise<void> => {
      try {
        clearPendingUpdate()
        const notesApi = getNotesApi()
        if (notesApi && typeof notesApi.clear === 'function') {
          await notesApi.clear()
        } else if (notesApi && typeof notesApi.delete === 'function') {
          const deleteNote = notesApi.delete
          const currentNotes = notesApi && typeof notesApi.list === 'function' ? await notesApi.list() : notes
          await Promise.all(currentNotes.map((note) => deleteNote(note.id)))
        } else {
          saveBrowserNotes([])
        }

        setNotes([])
        setActiveNoteId('')
      } catch (error) {
        console.error('Failed to clear notes', error)
      } finally {
        setIsClearModalOpen(false)
      }
    }

    void clearNotes()
  }

  return (
    <main className="flex h-screen w-full flex-col bg-[#f5f6f8] font-sans text-[#2f3340]">
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
            'min-h-0 shrink-0 overflow-hidden transition-[width] duration-200 ease-out',
            isSidebarOpen ? 'w-[280px] border-r border-[#d9dee5] xl:w-[332px]' : 'w-0 border-r-0'
          ].join(' ')}
        >
          <NotesSidebar
            notes={sortedFilteredNotes}
            activeNoteId={activeNote?.id ?? ''}
            onCreateNote={handleCreateNote}
            onSelectNote={setActiveNoteId}
            viewMode={sidebarViewMode}
            onChangeViewMode={setSidebarViewMode}
            sortMode={sidebarSortMode}
            onChangeSortMode={setSidebarSortMode}
            onBackup={handleBackupNotes}
            onClear={handleRequestClearNotes}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            hasAnyNotes={notes.length > 0}
          />
        </div>

        <div className="min-h-0 min-w-0 flex-1">
          <EditorPane
            menuItems={menuItems}
            noteTitle={activeNote?.title ?? null}
            noteContent={activeNote?.content ?? null}
            characterCount={activeNoteCharacterCount}
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

      <ConfirmModal
        title="Confirm"
        message="Are you sure you want to clear all notes?"
        isOpen={isClearModalOpen}
        onConfirm={handleConfirmClearNotes}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </main>
  )
}
