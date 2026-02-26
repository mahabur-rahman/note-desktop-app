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
    <header className="flex h-14 items-center gap-3 border-b border-[#1f2e4b] bg-[linear-gradient(90deg,#09101d_0%,#0e1b31_100%)] px-4 text-white md:px-5">
      <IconButton
        ariaLabel={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        className="cursor-pointer rounded p-1 text-lg text-[#e7eefc] transition hover:bg-[#1d2a44]"
        onClick={onToggleSidebar}
      >
        <FiMenu />
      </IconButton>
      <h1 className="m-0 text-sm font-semibold tracking-[0.1em] text-[#f3f7ff] md:text-base">
        {title}
      </h1>
    </header>
  )
}
