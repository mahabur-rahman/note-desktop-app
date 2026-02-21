import { useEffect, useRef, useState } from 'react'
import { FiAlignLeft, FiCheck, FiDownloadCloud, FiMoreVertical, FiPlus, FiSearch, FiX } from 'react-icons/fi'
import type { NoteSummary, SidebarViewMode } from '../../types/ui'
import { IconButton } from '../common/IconButton'

interface NotesSidebarProps {
  notes: NoteSummary[]
  activeNoteId: string
  onCreateNote: () => void
  onSelectNote: (noteId: string) => void
  viewMode: SidebarViewMode
  onChangeViewMode: (viewMode: SidebarViewMode) => void
  onBackup: () => void
  onClear: () => void
}

export function NotesSidebar({
  notes,
  activeNoteId,
  onCreateNote,
  onSelectNote,
  viewMode,
  onChangeViewMode,
  onBackup,
  onClear
}: NotesSidebarProps): React.JSX.Element {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const actionsMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isActionsMenuOpen) return

    const handleClickOutside = (event: MouseEvent): void => {
      if (!actionsMenuRef.current) return
      if (actionsMenuRef.current.contains(event.target as Node)) return
      setIsActionsMenuOpen(false)
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [isActionsMenuOpen])

  return (
    <aside className="flex h-full flex-col bg-[#f3f4f6]">
      <div className="border-b border-[#d9dee5]">
        <button
          className="mx-3 my-4 inline-flex h-[52px] w-[calc(100%_-_24px)] cursor-pointer items-center justify-center gap-2 rounded bg-[#5165f7] text-base font-normal text-white"
          type="button"
          onClick={onCreateNote}
        >
          <FiPlus className="text-lg" />
          <span>Create new</span>
        </button>

        <div className="relative border-y border-[#d9dee5] bg-[#f5f6f8]">
          <input
            className="h-14 w-full cursor-default border-0 bg-transparent px-4 pr-10 text-base text-[#7d828d] outline-none"
            aria-label="Search notes"
            placeholder="Search..."
            readOnly
          />
          <FiSearch className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-lg text-[#8b909a]" />
        </div>

        <div className="relative flex h-10 items-center justify-between border-b border-[#d9dee5] bg-[#f4f5f7] px-3">
          <IconButton
            ariaLabel="Filter notes"
            className="cursor-default bg-transparent p-0.5 text-lg text-[#646a75]"
          >
            <FiAlignLeft />
          </IconButton>
          <div ref={actionsMenuRef}>
            <IconButton
              ariaLabel="More actions"
              className="cursor-pointer bg-transparent p-0.5 text-lg text-[#646a75]"
              onClick={() => setIsActionsMenuOpen((prev) => !prev)}
            >
              <FiMoreVertical />
            </IconButton>

            {isActionsMenuOpen && (
              <div className="absolute top-[38px] right-0 z-20 min-w-[188px] border border-[#d2d7de] bg-[#f4f4f5] shadow-[0_10px_24px_rgba(25,32,45,0.12)]">
                <button
                  type="button"
                  className={[
                    'flex h-10 w-full items-center gap-3 px-4 text-left text-[15px]',
                    viewMode === 'compact' ? 'bg-[#eceeef] text-[#202733]' : 'bg-[#f4f4f5] text-[#2f3642]'
                  ].join(' ')}
                  onClick={() => {
                    onChangeViewMode('compact')
                    setIsActionsMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">{viewMode === 'compact' ? <FiCheck /> : null}</span>
                  <span>Compact View</span>
                </button>
                <button
                  type="button"
                  className={[
                    'flex h-10 w-full items-center gap-3 px-4 text-left text-[15px]',
                    viewMode === 'detailed' ? 'bg-[#eceeef] text-[#202733]' : 'bg-[#f4f4f5] text-[#2f3642]'
                  ].join(' ')}
                  onClick={() => {
                    onChangeViewMode('detailed')
                    setIsActionsMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">{viewMode === 'detailed' ? <FiCheck /> : null}</span>
                  <span>Detailed View</span>
                </button>
                <div className="h-px w-full bg-[#d8dde4]" />
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-[15px] text-[#2f3642]"
                  onClick={() => {
                    onBackup()
                    setIsActionsMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">
                    <FiDownloadCloud />
                  </span>
                  <span>Backup</span>
                </button>
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-[15px] text-[#2f3642]"
                  onClick={() => {
                    onClear()
                    setIsActionsMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">
                    <FiX />
                  </span>
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="border-t border-[#d9dee5] p-4 text-[15px] text-[#3f4654]">No saved notes.</div>
      ) : (
        notes.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => onSelectNote(note.id)}
            className={[
              'w-full border-t border-[#d9dee5] text-left',
              note.id === activeNoteId ? 'bg-[#e6e7e9]' : 'bg-[#f3f4f6]'
            ].join(' ')}
          >
            <div className={viewMode === 'compact' ? 'px-3 py-2.5' : 'p-4'}>
              <h3 className="m-0 text-lg leading-[1.2] font-bold text-[#2f3440]">{note.title || 'Untitled Note'}</h3>
              {viewMode === 'detailed' && <p className="my-1 text-base text-[#444a56]">{note.excerpt}</p>}
              <span className={viewMode === 'compact' ? 'text-sm text-[#4f5562]' : 'text-[15px] text-[#4f5562]'}>
                {note.relativeTime}
              </span>
            </div>
          </button>
        ))
      )}
    </aside>
  )
}
