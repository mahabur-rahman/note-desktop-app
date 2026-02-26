import { useEffect, useRef, useState } from 'react'
import {
  FiAlignLeft,
  FiCheck,
  FiDownloadCloud,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiX
} from 'react-icons/fi'
import type { NoteSummary, SidebarSortMode, SidebarViewMode } from '../../types/ui'
import { IconButton } from '../common/IconButton'

interface NotesSidebarProps {
  notes: NoteSummary[]
  activeNoteId: string
  onCreateNote: () => void
  onSelectNote: (noteId: string) => void
  viewMode: SidebarViewMode
  onChangeViewMode: (viewMode: SidebarViewMode) => void
  sortMode: SidebarSortMode
  onChangeSortMode: (sortMode: SidebarSortMode) => void
  onBackup: () => void
  onClear: () => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  hasAnyNotes: boolean
}

export function NotesSidebar({
  notes,
  activeNoteId,
  onCreateNote,
  onSelectNote,
  viewMode,
  onChangeViewMode,
  sortMode,
  onChangeSortMode,
  onBackup,
  onClear,
  searchQuery,
  onSearchQueryChange,
  hasAnyNotes
}: NotesSidebarProps): React.JSX.Element {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const sortMenuRef = useRef<HTMLDivElement | null>(null)
  const actionsMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isActionsMenuOpen && !isSortMenuOpen) return

    const handleClickOutside = (event: MouseEvent): void => {
      const clickTarget = event.target as Node

      const isInsideActionsMenu = Boolean(actionsMenuRef.current?.contains(clickTarget))
      const isInsideSortMenu = Boolean(sortMenuRef.current?.contains(clickTarget))
      if (isInsideActionsMenu || isInsideSortMenu) return

      setIsSortMenuOpen(false)
      setIsActionsMenuOpen(false)
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [isActionsMenuOpen, isSortMenuOpen])

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#f7f9ff_0%,#f0f4fc_100%)]">
      <div className="border-b border-[#d9e1ef]">
        <button
          className="mx-3 my-4 inline-flex h-[50px] w-[calc(100%_-_24px)] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#2a5d93] bg-[linear-gradient(90deg,#163a63_0%,#235886_55%,#2d6ea5_100%)] text-sm font-semibold text-white shadow-[0_10px_18px_rgba(25,58,97,0.28)] transition hover:brightness-110"
          type="button"
          onClick={onCreateNote}
        >
          <FiPlus className="text-lg" />
          <span>Create Note</span>
        </button>

        <div className="relative border-y border-[#d9e1ef] bg-[#f8faff]">
          <input
            className="h-12 w-full border-0 bg-transparent px-4 pr-10 text-sm text-[#34435f] outline-none placeholder:text-[#8a97ae]"
            aria-label="Search notes"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
          <FiSearch className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-lg text-[#8090aa]" />
        </div>

        <div className="relative flex h-11 items-center justify-between border-b border-[#d9e1ef] bg-[#f4f7fd] px-3">
          <div ref={sortMenuRef}>
            <IconButton
              ariaLabel="Sort notes"
              className="cursor-pointer rounded p-1 text-lg text-[#5b6b85] transition hover:bg-[#e7edf9]"
              onClick={() => {
                setIsSortMenuOpen((prev) => !prev)
                setIsActionsMenuOpen(false)
              }}
            >
              <FiAlignLeft />
            </IconButton>

            {isSortMenuOpen && (
              <div className="absolute top-[42px] left-0 z-20 min-w-[188px] overflow-hidden rounded-lg border border-[#ced8e9] bg-[#f8faff] shadow-[0_14px_26px_rgba(30,47,77,0.14)]">
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#e9effc]"
                  onClick={() => {
                    onChangeSortMode('alphabetical')
                    setIsSortMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">
                    {sortMode === 'alphabetical' ? <FiCheck /> : null}
                  </span>
                  <span>Alphabetical</span>
                </button>
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#e9effc]"
                  onClick={() => {
                    onChangeSortMode('creation-date')
                    setIsSortMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">
                    {sortMode === 'creation-date' ? <FiCheck /> : null}
                  </span>
                  <span>Creation date</span>
                </button>
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#e9effc]"
                  onClick={() => {
                    onChangeSortMode('last-modified')
                    setIsSortMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">
                    {sortMode === 'last-modified' ? <FiCheck /> : null}
                  </span>
                  <span>Last modified</span>
                </button>
              </div>
            )}
          </div>
          <div ref={actionsMenuRef}>
            <IconButton
              ariaLabel="More actions"
              className="cursor-pointer rounded p-1 text-lg text-[#5b6b85] transition hover:bg-[#e7edf9]"
              onClick={() => {
                setIsActionsMenuOpen((prev) => !prev)
                setIsSortMenuOpen(false)
              }}
            >
              <FiMoreVertical />
            </IconButton>

            {isActionsMenuOpen && (
              <div className="absolute top-[42px] right-0 z-20 min-w-[188px] overflow-hidden rounded-lg border border-[#ced8e9] bg-[#f8faff] shadow-[0_14px_26px_rgba(30,47,77,0.14)]">
                <button
                  type="button"
                  className={[
                    'flex h-10 w-full items-center gap-3 px-4 text-left text-[14px] transition',
                    viewMode === 'compact'
                      ? 'bg-[#e9effc] text-[#1f3356]'
                      : 'bg-[#f8faff] text-[#2f425f] hover:bg-[#edf2fd]'
                  ].join(' ')}
                  onClick={() => {
                    onChangeViewMode('compact')
                    setIsActionsMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">
                    {viewMode === 'compact' ? <FiCheck /> : null}
                  </span>
                  <span>Compact View</span>
                </button>
                <button
                  type="button"
                  className={[
                    'flex h-10 w-full items-center gap-3 px-4 text-left text-[14px] transition',
                    viewMode === 'detailed'
                      ? 'bg-[#e9effc] text-[#1f3356]'
                      : 'bg-[#f8faff] text-[#2f425f] hover:bg-[#edf2fd]'
                  ].join(' ')}
                  onClick={() => {
                    onChangeViewMode('detailed')
                    setIsActionsMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">
                    {viewMode === 'detailed' ? <FiCheck /> : null}
                  </span>
                  <span>Detailed View</span>
                </button>
                <div className="h-px w-full bg-[#dbe3f1]" />
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
        {notes.length === 0 ? (
          <div className="border-t border-[#d9e1ef] p-4 text-sm text-[#51607b]">
            {hasAnyNotes && searchQuery.trim() ? 'No matching notes.' : 'No saved notes.'}
          </div>
        ) : (
          notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => onSelectNote(note.id)}
              className={[
                'w-full border-t border-[#d9e1ef] text-left transition',
                note.id === activeNoteId
                  ? 'bg-[linear-gradient(90deg,#e7edff_0%,#edf2ff_100%)]'
                  : 'bg-[#f7f9ff] hover:bg-[#eff4ff]'
              ].join(' ')}
            >
              <div className={viewMode === 'compact' ? 'px-3 py-2.5' : 'p-4'}>
                <h3 className="m-0 text-[17px] leading-[1.2] font-semibold text-[#263a5a]">
                  {note.title || 'Untitled Note'}
                </h3>
                {viewMode === 'detailed' && (
                  <p className="my-1 text-[15px] text-[#4d5f7e]">{note.excerpt}</p>
                )}
                <span
                  className={
                    viewMode === 'compact'
                      ? 'text-xs font-medium text-[#667895]'
                      : 'text-[13px] font-medium text-[#667895]'
                  }
                >
                  {note.relativeTime}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
