import { NoteTitleRow } from './NoteTitleRow'
import { TopMenu } from './TopMenu'

interface EditorPaneProps {
  menuItems: readonly string[]
  noteTitle: string | null
  noteContent: string | null
  characterCount: number
  isStatusBarVisible: boolean
  onToggleStatusBar: () => void
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
  isStatusBarVisible,
  onToggleStatusBar,
  onChangeNoteTitle,
  onChangeNoteContent,
  onDeleteNote,
  isExpandedView,
  onToggleExpandedView
}: EditorPaneProps): React.JSX.Element {
  const hasNote = noteTitle !== null

  return (
    <section
      className={[
        'grid h-full min-h-[62dvh] bg-[#f8f8f9] md:min-h-0',
        isStatusBarVisible
          ? 'grid-rows-[44px_54px_minmax(320px,1fr)_28px] md:grid-rows-[46px_62px_minmax(0,1fr)_28px]'
          : 'grid-rows-[44px_54px_minmax(320px,1fr)] md:grid-rows-[46px_62px_minmax(0,1fr)]'
      ].join(' ')}
    >
      <TopMenu
        items={menuItems}
        isExpandedView={isExpandedView}
        onToggleExpandedView={onToggleExpandedView}
        isStatusBarVisible={isStatusBarVisible}
        onToggleStatusBar={onToggleStatusBar}
      />
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
      {isStatusBarVisible && (
        <div className="flex items-center justify-start border-t border-[#d9dee5] px-3 text-sm text-[#3d66f8] md:px-4">
          <span>{`Characters: ${characterCount}`}</span>
        </div>
      )}
    </section>
  )
}
