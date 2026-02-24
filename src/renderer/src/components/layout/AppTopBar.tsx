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
    <header className="flex h-12 items-center gap-3 border-t border-[#1d9ac2] bg-[#05070b] px-4 text-white">
      <IconButton
        ariaLabel={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        className="cursor-pointer bg-transparent p-0 text-lg text-white"
        onClick={onToggleSidebar}
      >
        <FiMenu />
      </IconButton>
      <h1 className="m-0 text-base font-normal tracking-[0.05em]">{title}</h1>
    </header>
  )
}
