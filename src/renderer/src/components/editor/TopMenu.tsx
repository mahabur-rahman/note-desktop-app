import { FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

interface TopMenuProps {
  items: readonly string[]
  isExpandedView: boolean
  onToggleExpandedView: () => void
}

export function TopMenu({ items, isExpandedView, onToggleExpandedView }: TopMenuProps): React.JSX.Element {
  return (
    <header className="flex items-center justify-between border-b border-[#d9dee5] bg-[#f6f6f7] pr-2 pl-2.5 md:pr-2.5 md:pl-4">
      <nav className="flex min-w-0 items-center gap-3 overflow-x-auto md:gap-5">
        {items.map((item) => (
          <button
            key={item}
            className="cursor-default whitespace-nowrap bg-transparent p-0 text-sm text-[#2f3440] md:text-[15px]"
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <IconButton
        ariaLabel={isExpandedView ? 'Restore layout' : 'Expand layout'}
        className="cursor-pointer bg-transparent p-1 text-lg text-[#1f232d] md:text-[22px]"
        onClick={onToggleExpandedView}
      >
        {isExpandedView ? <FiMinimize2 /> : <FiMaximize2 />}
      </IconButton>
    </header>
  )
}
