import { FiCheckCircle } from 'react-icons/fi'
import { NoteTitleRow } from './NoteTitleRow'
import { TopMenu } from './TopMenu'

interface EditorPaneProps {
  menuItems: readonly string[]
  noteTitle: string | null
  onDeleteNote: () => void
  isExpandedView: boolean
  onToggleExpandedView: () => void
}

export function EditorPane({
  menuItems,
  noteTitle,
  onDeleteNote,
  isExpandedView,
  onToggleExpandedView
}: EditorPaneProps): React.JSX.Element {
  return (
    <section className="grid h-full min-h-[62dvh] grid-rows-[44px_54px_minmax(320px,1fr)_28px] bg-[#f8f8f9] md:min-h-0 md:grid-rows-[46px_62px_minmax(0,1fr)_28px]">
      <TopMenu items={menuItems} isExpandedView={isExpandedView} onToggleExpandedView={onToggleExpandedView} />
      <NoteTitleRow title={noteTitle} onDeleteNote={onDeleteNote} />
      <div className="bg-[#f7f7f8]" />
      <div className="flex items-center justify-end px-2.5 pb-1 text-xl text-[#3d66f8]" aria-hidden="true">
        <FiCheckCircle />
      </div>
    </section>
  )
}
