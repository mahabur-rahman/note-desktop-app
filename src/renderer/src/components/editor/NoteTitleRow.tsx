import { FiTrash2 } from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

interface NoteTitleRowProps {
  title: string | null
  onChangeTitle: (title: string) => void
  onDeleteNote: () => void
}

export function NoteTitleRow({
  title,
  onChangeTitle,
  onDeleteNote
}: NoteTitleRowProps): React.JSX.Element {
  const hasNote = title !== null

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_42px] items-center border-b border-[#d9dee5] bg-[#f7f7f8] md:grid-cols-[minmax(0,1fr)_48px]">
      <input
        className={[
          'h-full w-full border-0 bg-transparent px-3 text-sm text-[#505664] outline-none md:px-5 md:text-[15px]',
          hasNote ? 'cursor-text' : 'cursor-not-allowed'
        ].join(' ')}
        aria-label="Note title"
        value={title ?? ''}
        placeholder="No note selected"
        disabled={!hasNote}
        onChange={(event) => onChangeTitle(event.target.value)}
      />
      <IconButton
        ariaLabel="Delete note"
        className={[
          'bg-transparent p-1 text-lg md:text-[22px]',
          hasNote ? 'cursor-pointer text-[#1f232d]' : 'cursor-not-allowed text-[#9aa2af]'
        ].join(' ')}
        onClick={hasNote ? onDeleteNote : undefined}
      >
        <FiTrash2 />
      </IconButton>
    </div>
  )
}
