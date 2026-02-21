import { useEffect, useState } from 'react'
import type { NoteSummary } from '../../types/ui'
import { ConfirmModal } from '../common/ConfirmModal'
import { EditorPane } from '../editor/EditorPane'
import { AppTopBar } from './AppTopBar'
import { NotesSidebar } from '../sidebar/NotesSidebar'

interface DesktopNotesLayoutProps {
  appTitle: string
  initialNotes: NoteSummary[]
  menuItems: readonly string[]
}

export function DesktopNotesLayout({ appTitle, initialNotes, menuItems }: DesktopNotesLayoutProps): React.JSX.Element {
  const [notes, setNotes] = useState<NoteSummary[]>(initialNotes)
  const [activeNoteId, setActiveNoteId] = useState<string>(initialNotes[0]?.id ?? '')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isExpandedView, setIsExpandedView] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const activeNote = notes.find((note) => note.id === activeNoteId) ?? notes[0] ?? null

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
    setNotes((prev) => prev.filter((note) => note.id !== activeNote.id))
    setIsDeleteModalOpen(false)
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
          <NotesSidebar notes={notes} activeNoteId={activeNote?.id ?? ''} onSelectNote={setActiveNoteId} />
        </div>

        <div className="min-w-0 flex-1">
          <EditorPane
            menuItems={menuItems}
            noteTitle={activeNote?.title ?? null}
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
