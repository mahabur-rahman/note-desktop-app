import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

interface TopMenuProps {
  items: readonly string[]
  isExpandedView: boolean
  onToggleExpandedView: () => void
  isStatusBarVisible: boolean
  onToggleStatusBar: () => void
  isSpellCheckEnabled: boolean
  onToggleSpellCheck: () => void
}

export function TopMenu({
  items,
  isExpandedView,
  onToggleExpandedView,
  isStatusBarVisible,
  onToggleStatusBar,
  isSpellCheckEnabled,
  onToggleSpellCheck
}: TopMenuProps): React.JSX.Element {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false)
  const viewMenuRef = useRef<HTMLDivElement | null>(null)
  const toolsMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isViewMenuOpen && !isToolsMenuOpen) return

    const handlePointerDownOutside = (event: PointerEvent): void => {
      const clickTarget = event.target as Node
      if (viewMenuRef.current?.contains(clickTarget)) return
      if (toolsMenuRef.current?.contains(clickTarget)) return
      setIsViewMenuOpen(false)
      setIsToolsMenuOpen(false)
    }

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      setIsViewMenuOpen(false)
      setIsToolsMenuOpen(false)
    }

    const handleWindowBlur = (): void => {
      setIsViewMenuOpen(false)
      setIsToolsMenuOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDownOutside, true)
    window.addEventListener('keydown', handleEscapeKey)
    window.addEventListener('blur', handleWindowBlur)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside, true)
      window.removeEventListener('keydown', handleEscapeKey)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [isToolsMenuOpen, isViewMenuOpen])

  return (
    <header className="flex items-center justify-between border-b border-[#d9dee5] bg-[#f6f6f7] pr-2 pl-2.5 md:pr-2.5 md:pl-4">
      <nav className="flex min-w-0 flex-1 items-center gap-3 overflow-visible md:gap-5">
        {items.map((item) => (
          <div key={item} className="relative">
            {item === 'View' ? (
              <div ref={viewMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap bg-transparent p-0 text-sm text-[#2f3440] md:text-[15px]',
                    isViewMenuOpen ? 'text-[#1f232d]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsViewMenuOpen((prev) => !prev)
                    setIsToolsMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isViewMenuOpen && (
                  <div className="absolute top-7 left-0 z-40 min-w-[186px] border border-[#d2d7de] bg-[#f4f4f5] shadow-[0_10px_24px_rgba(25,32,45,0.12)]">
                    <button
                      type="button"
                      className={[
                        'flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]',
                        isStatusBarVisible ? 'bg-[#eceeef]' : 'bg-transparent'
                      ].join(' ')}
                      onClick={() => {
                        onToggleStatusBar()
                        setIsViewMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        {isStatusBarVisible ? <FiCheck /> : null}
                      </span>
                      <span>Status Bar</span>
                    </button>
                    <button
                      type="button"
                      className={[
                        'flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]',
                        isExpandedView ? 'bg-[#eceeef]' : 'bg-transparent'
                      ].join(' ')}
                      onClick={() => {
                        onToggleExpandedView()
                        setIsViewMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        {isExpandedView ? <FiCheck /> : null}
                      </span>
                      <span>Full Screen</span>
                    </button>
                  </div>
                )}
              </div>
            ) : item === 'Tools' ? (
              <div ref={toolsMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap bg-transparent p-0 text-sm text-[#2f3440] md:text-[15px]',
                    isToolsMenuOpen ? 'text-[#1f232d]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsToolsMenuOpen((prev) => !prev)
                    setIsViewMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isToolsMenuOpen && (
                  <div className="absolute top-7 left-0 z-40 min-w-[186px] border border-[#d2d7de] bg-[#f4f4f5] shadow-[0_10px_24px_rgba(25,32,45,0.12)]">
                    <button
                      type="button"
                      className={[
                        'flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]',
                        isSpellCheckEnabled ? 'bg-[#eceeef]' : 'bg-transparent'
                      ].join(' ')}
                      onClick={() => {
                        onToggleSpellCheck()
                        setIsToolsMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        {isSpellCheckEnabled ? <FiCheck /> : null}
                      </span>
                      <span>Spell check</span>
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
        ariaLabel={isExpandedView ? 'Exit full screen' : 'Enter full screen'}
        className="cursor-pointer bg-transparent p-1 text-lg text-[#1f232d] md:text-[22px]"
        onClick={onToggleExpandedView}
      >
        {isExpandedView ? <FiMinimize2 /> : <FiMaximize2 />}
      </IconButton>
    </header>
  )
}
