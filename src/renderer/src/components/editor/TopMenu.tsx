import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

interface TopMenuProps {
  items: readonly string[]
  isExpandedView: boolean
  onToggleExpandedView: () => void
  isStatusBarVisible: boolean
  onToggleStatusBar: () => void
}

export function TopMenu({
  items,
  isExpandedView,
  onToggleExpandedView,
  isStatusBarVisible,
  onToggleStatusBar
}: TopMenuProps): React.JSX.Element {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const viewMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isViewMenuOpen) return

    const handleClickOutside = (event: MouseEvent): void => {
      const clickTarget = event.target as Node
      if (viewMenuRef.current?.contains(clickTarget)) return
      setIsViewMenuOpen(false)
    }

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsViewMenuOpen(false)
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscapeKey)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isViewMenuOpen])

  return (
    <header className="flex items-center justify-between border-b border-[#d9dee5] bg-[#f6f6f7] pr-2 pl-2.5 md:pr-2.5 md:pl-4">
      <nav className="flex min-w-0 items-center gap-3 overflow-x-auto overflow-y-visible md:gap-5">
        {items.map((item) => (
          <div key={item} className="relative">
            {item === 'View' ? (
              <div ref={viewMenuRef}>
                <button
                  className="cursor-pointer whitespace-nowrap bg-transparent p-0 text-sm text-[#2f3440] md:text-[15px]"
                  type="button"
                  onClick={() => setIsViewMenuOpen((prev) => !prev)}
                >
                  {item}
                </button>
                {isViewMenuOpen && (
                  <div className="absolute top-7 left-0 z-20 min-w-[156px] border border-[#d2d7de] bg-[#f4f4f5] shadow-[0_10px_24px_rgba(25,32,45,0.12)]">
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-3 px-4 text-left text-[15px] text-[#2f3642]"
                      onClick={() => {
                        onToggleStatusBar()
                        setIsViewMenuOpen(false)
                      }}
                    >
                      <span className="w-4 text-[18px]">{isStatusBarVisible ? <FiCheck /> : null}</span>
                      <span>Status Bar</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-3 px-4 text-left text-[15px] text-[#2f3642]"
                      onClick={() => {
                        onToggleExpandedView()
                        setIsViewMenuOpen(false)
                      }}
                    >
                      <span className="w-4 text-[18px]">{isExpandedView ? <FiCheck /> : null}</span>
                      <span>Full Screen</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="cursor-default whitespace-nowrap bg-transparent p-0 text-sm text-[#2f3440] md:text-[15px]"
                type="button"
              >
                {item}
              </button>
            )}
          </div>
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
