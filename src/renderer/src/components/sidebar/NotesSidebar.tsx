import { useEffect, useRef, useState } from 'react'
import {
  FiAlignLeft,
  FiArchive,
  FiCheck,
  FiDownloadCloud,
  FiFolder,
  FiMoreVertical,
  FiPlus,
  FiRotateCcw,
  FiSearch,
  FiStar,
  FiTag,
  FiTrash2,
  FiUploadCloud,
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
  onBackupExport: () => void
  onBackupImport: () => void
  onClear: () => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  hasAnyNotes: boolean
  isTrashView: boolean
  onChangeTrashView: (isTrashView: boolean) => void
  availableFolders: Array<{ name: string; count: number }>
  selectedFolder: string
  onSelectFolder: (folderName: string) => void
  isPinnedOnly: boolean
  onTogglePinnedOnly: () => void
  availableTags: Array<{ name: string; count: number }>
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClearTagFilters: () => void
  onTogglePin: (noteId: string) => void
  onRestoreNote: (noteId: string) => void
  onMoveNoteToTrash: (noteId: string) => void
  onPermanentDeleteNote: (noteId: string) => void
}

interface FolderTreeNode {
  path: string
  label: string
  depth: number
  count: number
}

function buildFolderTreeNodes(folders: Array<{ name: string; count: number }>): FolderTreeNode[] {
  const treeMap = new Map<string, { count: number; depth: number }>()

  folders.forEach((folder) => {
    const tokens = folder.name
      .split('/')
      .map((token) => token.trim())
      .filter((token) => token.length > 0)
    if (tokens.length === 0) return

    let currentPath = ''
    tokens.forEach((token, index) => {
      currentPath = currentPath ? `${currentPath}/${token}` : token
      const existing = treeMap.get(currentPath)
      if (existing) {
        existing.count += folder.count
        return
      }

      treeMap.set(currentPath, {
        count: folder.count,
        depth: index
      })
    })
  })

  return [...treeMap.entries()]
    .map(([path, data]) => ({
      path,
      label: path.split('/').pop() ?? path,
      depth: data.depth,
      count: data.count
    }))
    .sort((first, second) =>
      first.path.localeCompare(second.path, undefined, { sensitivity: 'base' })
    )
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
  onBackupExport,
  onBackupImport,
  onClear,
  searchQuery,
  onSearchQueryChange,
  hasAnyNotes,
  isTrashView,
  onChangeTrashView,
  availableFolders,
  selectedFolder,
  onSelectFolder,
  isPinnedOnly,
  onTogglePinnedOnly,
  availableTags,
  selectedTags,
  onToggleTag,
  onClearTagFilters,
  onTogglePin,
  onRestoreNote,
  onMoveNoteToTrash,
  onPermanentDeleteNote
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

  const pinnedCount = notes.filter((note) => note.isPinned).length
  const folderTreeNodes = buildFolderTreeNodes(availableFolders)
  const regularNotes = notes.filter((note) => !note.isPinned)
  const pinnedNotes = notes.filter((note) => note.isPinned)

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#f7f9ff_0%,#f0f4fc_100%)]">
      <div className="border-b border-[#d9e1ef]">
        <button
          className={[
            'mx-3 my-4 inline-flex h-[50px] w-[calc(100%_-_24px)] items-center justify-center gap-2 rounded-lg border border-[#2a5d93] text-sm font-semibold text-white shadow-[0_10px_18px_rgba(25,58,97,0.28)] transition',
            isTrashView
              ? 'cursor-not-allowed bg-[#8da1be] opacity-80'
              : 'cursor-pointer bg-[linear-gradient(90deg,#163a63_0%,#235886_55%,#2d6ea5_100%)] hover:brightness-110'
          ].join(' ')}
          type="button"
          onClick={isTrashView ? undefined : onCreateNote}
        >
          <FiPlus className="text-lg" />
          <span>Create Note</span>
        </button>

        <div className="grid grid-cols-2 border-y border-[#d9e1ef] bg-[#eef3fd] p-1">
          <button
            type="button"
            className={[
              'h-9 cursor-pointer rounded-md text-sm font-semibold transition',
              !isTrashView
                ? 'bg-white text-[#25436b] shadow-sm'
                : 'text-[#607595] hover:bg-[#e5ecfa]'
            ].join(' ')}
            onClick={() => onChangeTrashView(false)}
          >
            Notes
          </button>
          <button
            type="button"
            className={[
              'h-9 cursor-pointer rounded-md text-sm font-semibold transition',
              isTrashView
                ? 'bg-white text-[#25436b] shadow-sm'
                : 'text-[#607595] hover:bg-[#e5ecfa]'
            ].join(' ')}
            onClick={() => onChangeTrashView(true)}
          >
            Trash
          </button>
        </div>

        <div className="relative border-y border-[#d9e1ef] bg-[#f8faff]">
          <input
            className="h-12 w-full border-0 bg-transparent px-4 pr-10 text-sm text-[#34435f] outline-none placeholder:text-[#8a97ae]"
            aria-label="Search notes"
            placeholder={isTrashView ? 'Search trash...' : 'Search notes...'}
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
          <FiSearch className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-lg text-[#8090aa]" />
        </div>

        {!isTrashView && (
          <>
            <div className="border-b border-[#d9e1ef] px-3 py-2">
              <p className="m-0 mb-1.5 flex items-center gap-1 text-[12px] font-semibold tracking-[0.04em] text-[#4d6385] uppercase">
                <FiFolder className="text-[13px]" />
                <span>Folders</span>
              </p>
              <div className="flex max-h-[108px] flex-col overflow-y-auto rounded-md border border-[#d5deee] bg-[#f8faff] p-1">
                <button
                  type="button"
                  className={[
                    'flex h-8 cursor-pointer items-center justify-between rounded px-2 text-left text-[13px] transition',
                    selectedFolder === 'all'
                      ? 'bg-[#dfe8fb] text-[#1f3356]'
                      : 'text-[#375173] hover:bg-[#edf2fd]'
                  ].join(' ')}
                  onClick={() => onSelectFolder('all')}
                >
                  <span>All folders</span>
                  <span>{availableFolders.reduce((sum, folder) => sum + folder.count, 0)}</span>
                </button>
                {folderTreeNodes.map((folderNode) => (
                  <button
                    key={folderNode.path}
                    type="button"
                    className={[
                      'flex h-8 cursor-pointer items-center justify-between rounded px-2 text-left text-[13px] transition',
                      selectedFolder === folderNode.path
                        ? 'bg-[#dfe8fb] text-[#1f3356]'
                        : 'text-[#375173] hover:bg-[#edf2fd]'
                    ].join(' ')}
                    onClick={() => onSelectFolder(folderNode.path)}
                  >
                    <span
                      className="truncate"
                      style={{ paddingLeft: `${Math.min(folderNode.depth, 4) * 12}px` }}
                    >
                      {folderNode.label}
                    </span>
                    <span>{folderNode.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b border-[#d9e1ef] px-3 py-2">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="m-0 flex items-center gap-1 text-[12px] font-semibold tracking-[0.04em] text-[#4d6385] uppercase">
                  <FiTag className="text-[13px]" />
                  <span>Tags</span>
                </p>
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearTagFilters}
                    className="cursor-pointer text-[11px] font-semibold text-[#4a63f5] hover:text-[#334fd9]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {availableTags.length === 0 ? (
                <p className="m-0 text-[12px] text-[#70839e]">No tags yet.</p>
              ) : (
                <div className="flex max-h-[88px] flex-wrap gap-1 overflow-y-auto">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.name)
                    return (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => onToggleTag(tag.name)}
                        className={[
                          'inline-flex h-7 cursor-pointer items-center gap-1 rounded-full border px-2 text-xs font-semibold transition',
                          isSelected
                            ? 'border-[#4d63f6] bg-[#4d63f6] text-white'
                            : 'border-[#cfd9ec] bg-white text-[#466082] hover:bg-[#edf2fd]'
                        ].join(' ')}
                      >
                        <span>{tag.name}</span>
                        <span className={isSelected ? 'text-[#dbe3ff]' : 'text-[#7a8eab]'}>
                          {tag.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

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
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#5b6f8f]">
            {!isTrashView && pinnedCount > 0 && (
              <>
                <button
                  type="button"
                  onClick={onTogglePinnedOnly}
                  className={[
                    'inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition',
                    isPinnedOnly
                      ? 'bg-[#d08f11] text-white'
                      : 'bg-[#e7eefc] text-[#5b6f8f] hover:bg-[#dbe6fb]'
                  ].join(' ')}
                >
                  <FiStar className={isPinnedOnly ? 'text-white' : 'text-[#d08f11]'} />
                  <span>{isPinnedOnly ? 'Pinned only' : `${pinnedCount}`}</span>
                </button>
              </>
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
              <div className="absolute top-[42px] right-0 z-20 min-w-[196px] overflow-hidden rounded-lg border border-[#ced8e9] bg-[#f8faff] shadow-[0_14px_26px_rgba(30,47,77,0.14)]">
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
                    onBackupExport()
                    setIsActionsMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">
                    <FiDownloadCloud />
                  </span>
                  <span>Export backup</span>
                </button>
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                  onClick={() => {
                    onBackupImport()
                    setIsActionsMenuOpen(false)
                  }}
                >
                  <span className="w-4 text-[18px]">
                    <FiUploadCloud />
                  </span>
                  <span>Import backup</span>
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
                  <span>{isTrashView ? 'Empty trash' : 'Clear notes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
        {notes.length === 0 ? (
          <div className="border-t border-[#d9e1ef] p-4 text-sm text-[#51607b]">
            {hasAnyNotes && searchQuery.trim()
              ? 'No matching notes.'
              : isTrashView
                ? 'Trash is empty.'
                : 'No saved notes.'}
          </div>
        ) : (
          <>
            {!isTrashView && !isPinnedOnly && pinnedNotes.length > 0 && (
              <>
                <div className="sticky top-0 z-[1] border-y border-[#d9e1ef] bg-[#eaf0fe] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[#4d6385] uppercase">
                  Pinned
                </div>
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    activeNoteId={activeNoteId}
                    viewMode={viewMode}
                    isTrashView={isTrashView}
                    onSelectNote={onSelectNote}
                    onTogglePin={onTogglePin}
                    onMoveNoteToTrash={onMoveNoteToTrash}
                    onRestoreNote={onRestoreNote}
                    onPermanentDeleteNote={onPermanentDeleteNote}
                  />
                ))}
                {regularNotes.length > 0 && (
                  <div className="sticky top-0 z-[1] border-y border-[#d9e1ef] bg-[#f0f4fd] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[#5c6f8c] uppercase">
                    Notes
                  </div>
                )}
              </>
            )}

            {(isTrashView || isPinnedOnly ? notes : regularNotes).map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                activeNoteId={activeNoteId}
                viewMode={viewMode}
                isTrashView={isTrashView}
                onSelectNote={onSelectNote}
                onTogglePin={onTogglePin}
                onMoveNoteToTrash={onMoveNoteToTrash}
                onRestoreNote={onRestoreNote}
                onPermanentDeleteNote={onPermanentDeleteNote}
              />
            ))}
          </>
        )}
      </div>
    </aside>
  )
}

interface NoteCardProps {
  note: NoteSummary
  activeNoteId: string
  viewMode: SidebarViewMode
  isTrashView: boolean
  onSelectNote: (noteId: string) => void
  onTogglePin: (noteId: string) => void
  onMoveNoteToTrash: (noteId: string) => void
  onRestoreNote: (noteId: string) => void
  onPermanentDeleteNote: (noteId: string) => void
}

function NoteCard({
  note,
  activeNoteId,
  viewMode,
  isTrashView,
  onSelectNote,
  onTogglePin,
  onMoveNoteToTrash,
  onRestoreNote,
  onPermanentDeleteNote
}: NoteCardProps): React.JSX.Element {
  return (
    <div
      className={[
        'border-t border-[#d9e1ef] transition',
        note.id === activeNoteId
          ? 'bg-[linear-gradient(90deg,#e7edff_0%,#edf2ff_100%)]'
          : 'bg-[#f7f9ff] hover:bg-[#eff4ff]'
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => onSelectNote(note.id)}
        className="w-full cursor-pointer text-left"
      >
        <div className={viewMode === 'compact' ? 'px-3 py-2.5' : 'p-4'}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="m-0 line-clamp-1 text-[16px] leading-[1.2] font-semibold text-[#263a5a]">
              {note.title || 'Untitled Note'}
            </h3>
            {!isTrashView && note.isPinned && (
              <FiStar className="shrink-0 text-[15px] text-[#d08f11]" />
            )}
          </div>
          {viewMode === 'detailed' && (
            <p className="my-1 line-clamp-2 text-[14px] text-[#4d5f7e]">{note.excerpt}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                viewMode === 'compact'
                  ? 'text-xs font-medium text-[#667895]'
                  : 'text-[13px] font-medium text-[#667895]'
              }
            >
              {note.relativeTime}
            </span>
            {!isTrashView && note.folder.trim().length > 0 && (
              <span className="rounded-full bg-[#e9effc] px-2 py-0.5 text-[11px] font-semibold text-[#4f6484]">
                {note.folder}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="flex items-center justify-end gap-1 border-t border-[#dde5f3] px-2 py-1.5">
        {!isTrashView ? (
          <>
            <button
              type="button"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#7b8ca7] transition hover:bg-[#e7edf9] hover:text-[#d08f11]"
              onClick={() => onTogglePin(note.id)}
            >
              <FiStar />
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#8b9ab1] transition hover:bg-[#e7edf9] hover:text-[#b9324b]"
              onClick={() => onMoveNoteToTrash(note.id)}
              title="Move to trash"
            >
              <FiArchive />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="inline-flex h-7 cursor-pointer items-center gap-1 rounded bg-[#4f63f6] px-2 text-xs font-semibold text-white transition hover:bg-[#4158e8]"
              onClick={() => onRestoreNote(note.id)}
            >
              <FiRotateCcw />
              <span>Restore</span>
            </button>
            <button
              type="button"
              className="inline-flex h-7 cursor-pointer items-center gap-1 rounded bg-[#f3e4e9] px-2 text-xs font-semibold text-[#b72b46] transition hover:bg-[#f0d8df]"
              onClick={() => onPermanentDeleteNote(note.id)}
            >
              <FiTrash2 />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
