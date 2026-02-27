import { FiClock, FiRotateCcw, FiStar, FiTrash2 } from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

interface NoteTitleRowProps {
  title: string | null
  folder: string | null
  tags: string[]
  availableFolders: string[]
  isPinned: boolean
  isDeleted: boolean
  onChangeTitle: (title: string) => void
  onChangeFolder: (folder: string) => void
  onChangeTags: (tags: string[]) => void
  onTogglePinned: () => void
  onDeleteNote: () => void
  onRestoreNote: () => void
  onPermanentDeleteNote: () => void
  onOpenVersionHistory: () => void
}

function parseTags(rawValue: string): string[] {
  const uniqueTags = new Set<string>()
  rawValue
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .forEach((tag) => uniqueTags.add(tag))

  return [...uniqueTags]
}

export function NoteTitleRow({
  title,
  folder,
  tags,
  availableFolders,
  isPinned,
  isDeleted,
  onChangeTitle,
  onChangeFolder,
  onChangeTags,
  onTogglePinned,
  onDeleteNote,
  onRestoreNote,
  onPermanentDeleteNote,
  onOpenVersionHistory
}: NoteTitleRowProps): React.JSX.Element {
  const hasNote = title !== null

  return (
    <div className="border-b border-[#d7dfef] bg-[#f8faff]">
      <div className="grid grid-cols-[minmax(0,1fr)_44px_44px_44px] items-center md:grid-cols-[minmax(0,1fr)_48px_48px_48px]">
        <input
          className={[
            'h-full w-full border-0 bg-transparent px-3 py-3 text-sm font-medium text-[#3e4f6d] outline-none placeholder:text-[#8a97ad] md:px-5 md:text-[15px]',
            hasNote ? 'cursor-text' : 'cursor-not-allowed'
          ].join(' ')}
          aria-label="Note title"
          value={title ?? ''}
          placeholder="No note selected"
          disabled={!hasNote}
          onChange={(event) => onChangeTitle(event.target.value)}
        />

        <IconButton
          ariaLabel={isPinned ? 'Unpin note' : 'Pin note'}
          className={[
            'bg-transparent p-1 text-lg md:text-[22px]',
            hasNote
              ? [
                  'cursor-pointer transition',
                  isPinned
                    ? 'text-[#d08f11] hover:text-[#b17406]'
                    : 'text-[#8e9bb0] hover:text-[#6f7f97]'
                ].join(' ')
              : 'cursor-not-allowed text-[#9aa2af]'
          ].join(' ')}
          onClick={hasNote ? onTogglePinned : undefined}
        >
          <FiStar />
        </IconButton>

        <IconButton
          ariaLabel="Open version history"
          className={[
            'bg-transparent p-1 text-lg md:text-[22px]',
            hasNote
              ? 'cursor-pointer text-[#41638d] transition hover:text-[#2f4d73]'
              : 'cursor-not-allowed text-[#9aa2af]'
          ].join(' ')}
          onClick={hasNote ? onOpenVersionHistory : undefined}
        >
          <FiClock />
        </IconButton>

        <IconButton
          ariaLabel={isDeleted ? 'Delete permanently' : 'Move note to trash'}
          className={[
            'bg-transparent p-1 text-lg md:text-[22px]',
            hasNote
              ? 'cursor-pointer text-[#c63d56] transition hover:text-[#ad2f47]'
              : 'cursor-not-allowed text-[#9aa2af]'
          ].join(' ')}
          onClick={hasNote ? (isDeleted ? onPermanentDeleteNote : onDeleteNote) : undefined}
        >
          <FiTrash2 />
        </IconButton>
      </div>

      <div className="grid grid-cols-1 gap-2 border-t border-[#dce3f1] px-3 py-2 md:grid-cols-[220px_minmax(0,1fr)_auto] md:items-center md:px-5">
        <label className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-2 text-[13px] text-[#536886]">
          <span>Folder</span>
          <input
            list="note-folder-options"
            value={folder ?? ''}
            disabled={!hasNote || isDeleted}
            onChange={(event) => onChangeFolder(event.target.value)}
            placeholder="Optional"
            className={[
              'h-8 rounded border border-[#cdd8ec] bg-white px-2 text-[13px] text-[#304564] outline-none focus:border-[#9bb0d7]',
              !hasNote || isDeleted ? 'cursor-not-allowed opacity-70' : 'cursor-text'
            ].join(' ')}
          />
          <datalist id="note-folder-options">
            {availableFolders.map((folderName) => (
              <option key={folderName} value={folderName} />
            ))}
          </datalist>
        </label>

        <label className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-2 text-[13px] text-[#536886]">
          <span>Tags</span>
          <input
            type="text"
            value={tags.join(', ')}
            disabled={!hasNote || isDeleted}
            onChange={(event) => onChangeTags(parseTags(event.target.value))}
            placeholder="work, ideas, project"
            className={[
              'h-8 rounded border border-[#cdd8ec] bg-white px-2 text-[13px] text-[#304564] outline-none focus:border-[#9bb0d7]',
              !hasNote || isDeleted ? 'cursor-not-allowed opacity-70' : 'cursor-text'
            ].join(' ')}
          />
        </label>

        {isDeleted && hasNote && (
          <button
            type="button"
            onClick={onRestoreNote}
            className="inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded bg-[#5064f5] px-3 text-sm font-semibold text-white transition hover:bg-[#4058e8]"
          >
            <FiRotateCcw />
            <span>Restore</span>
          </button>
        )}
      </div>
    </div>
  )
}
