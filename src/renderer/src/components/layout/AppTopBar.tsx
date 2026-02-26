import { FiMenu } from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

interface AppTopBarProps {
  title: string
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AppTopBar({
  title,
  isSidebarOpen,
  onToggleSidebar
}: AppTopBarProps): React.JSX.Element {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-[#2a5787] bg-[linear-gradient(90deg,#102744_0%,#1a4873_52%,#1f5f97_100%)] px-4 text-white md:px-5">
      <IconButton
        ariaLabel={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        className="cursor-pointer rounded p-1 text-lg text-[#eaf2ff] transition hover:bg-[#2f618f]"
        onClick={onToggleSidebar}
      >
        <FiMenu />
      </IconButton>
      <h1 className="m-0 text-sm font-semibold tracking-[0.1em] text-[#f7fbff] md:text-base">
        {title}
      </h1>
    </header>
  )
}
