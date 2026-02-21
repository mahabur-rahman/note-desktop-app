import { NoteTitleRow } from './NoteTitleRow'
import { TopMenu } from './TopMenu'

interface EditorPaneProps {
  menuItems: readonly string[]
  noteTitle: string | null
  noteContent: string | null
  characterCount: number
  onChangeNoteTitle: (title: string) => void
  onChangeNoteContent: (content: string) => void
  onDeleteNote: () => void
  isExpandedView: boolean
  onToggleExpandedView: () => void
}

export function EditorPane({
  menuItems,
  noteTitle,
  noteContent,
  characterCount,
  onChangeNoteTitle,
  onChangeNoteContent,
  onDeleteNote,
  isExpandedView,
  onToggleExpandedView
}: EditorPaneProps): React.JSX.Element {
  const hasNote = noteTitle !== null

  return (
    <section className="grid h-full min-h-[62dvh] grid-rows-[44px_54px_minmax(320px,1fr)_28px] bg-[#f8f8f9] md:min-h-0 md:grid-rows-[46px_62px_minmax(0,1fr)_28px]">
      <TopMenu items={menuItems} isExpandedView={isExpandedView} onToggleExpandedView={onToggleExpandedView} />
      <NoteTitleRow title={noteTitle} onChangeTitle={onChangeNoteTitle} onDeleteNote={onDeleteNote} />
      <div className="bg-[#f7f7f8] p-4 md:p-5">
        <textarea
          className={[
            'h-full w-full resize-none border-0 bg-transparent text-[15px] leading-7 text-[#2f3440] outline-none',
            hasNote ? 'cursor-text' : 'cursor-not-allowed text-[#8f97a4]'
          ].join(' ')}
          placeholder="Write your note..."
          value={noteContent ?? ''}
          disabled={!hasNote}
          onChange={(event) => onChangeNoteContent(event.target.value)}
        />
      </div>
      <div className="flex items-center justify-end px-3 pb-1 text-sm text-[#3d66f8] md:px-4">
        <span>{`Characters: ${characterCount}`}</span>
      </div>
    </section>
  )
}
