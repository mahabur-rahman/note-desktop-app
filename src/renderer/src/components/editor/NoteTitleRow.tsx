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
    <div className="grid grid-cols-[minmax(0,1fr)_42px] items-center border-b border-[#d7dfef] bg-[#f8faff] md:grid-cols-[minmax(0,1fr)_48px]">
      <input
        className={[
          'h-full w-full border-0 bg-transparent px-3 text-sm font-medium text-[#3e4f6d] outline-none placeholder:text-[#8a97ad] md:px-5 md:text-[15px]',
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
          hasNote
            ? 'cursor-pointer text-[#c63d56] transition hover:text-[#ad2f47]'
            : 'cursor-not-allowed text-[#9aa2af]'
        ].join(' ')}
        onClick={hasNote ? onDeleteNote : undefined}
      >
        <FiTrash2 />
      </IconButton>
    </div>
  )
}
