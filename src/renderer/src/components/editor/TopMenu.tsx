import { useEffect, useRef, useState } from 'react'
import {
  FiCheck,
  FiCheckSquare,
  FiClock,
  FiCopy,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiMaximize2,
  FiMinimize2,
  FiScissors,
  FiSearch,
  FiSmile,
  FiType,
  FiX
} from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

interface TopMenuProps {
  items: readonly string[]
  isExpandedView: boolean
  onToggleExpandedView: () => void
  isStatusBarVisible: boolean
  onToggleStatusBar: () => void
  isWordWrapEnabled: boolean
  onToggleWordWrap: () => void
  onInsertDateTime: () => void
  onOpenSpecialCharacters: () => void
  onOpenEmojis: () => void
  onUndo: () => void
  onRedo: () => void
  onCut: () => void
  onCopy: () => void
  onDeleteSelection: () => void
  onSelectAll: () => void
  onOpenFindReplace: () => void
  onOpenFontSettings: () => void
  isSpellCheckEnabled: boolean
  onToggleSpellCheck: () => void
}

export function TopMenu({
  items,
  isExpandedView,
  onToggleExpandedView,
  isStatusBarVisible,
  onToggleStatusBar,
  isWordWrapEnabled,
  onToggleWordWrap,
  onInsertDateTime,
  onOpenSpecialCharacters,
  onOpenEmojis,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onDeleteSelection,
  onSelectAll,
  onOpenFindReplace,
  onOpenFontSettings,
  isSpellCheckEnabled,
  onToggleSpellCheck
}: TopMenuProps): React.JSX.Element {
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false)
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false)
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false)
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false)
  const editMenuRef = useRef<HTMLDivElement | null>(null)
  const viewMenuRef = useRef<HTMLDivElement | null>(null)
  const toolsMenuRef = useRef<HTMLDivElement | null>(null)
  const formatMenuRef = useRef<HTMLDivElement | null>(null)
  const insertMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isEditMenuOpen && !isViewMenuOpen && !isToolsMenuOpen && !isFormatMenuOpen && !isInsertMenuOpen) return

    const handlePointerDownOutside = (event: PointerEvent): void => {
      const clickTarget = event.target as Node
      if (editMenuRef.current?.contains(clickTarget)) return
      if (viewMenuRef.current?.contains(clickTarget)) return
      if (toolsMenuRef.current?.contains(clickTarget)) return
      if (formatMenuRef.current?.contains(clickTarget)) return
      if (insertMenuRef.current?.contains(clickTarget)) return
      setIsEditMenuOpen(false)
      setIsViewMenuOpen(false)
      setIsToolsMenuOpen(false)
      setIsFormatMenuOpen(false)
      setIsInsertMenuOpen(false)
    }

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      setIsEditMenuOpen(false)
      setIsViewMenuOpen(false)
      setIsToolsMenuOpen(false)
      setIsFormatMenuOpen(false)
      setIsInsertMenuOpen(false)
    }

    const handleWindowBlur = (): void => {
      setIsEditMenuOpen(false)
      setIsViewMenuOpen(false)
      setIsToolsMenuOpen(false)
      setIsFormatMenuOpen(false)
      setIsInsertMenuOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDownOutside, true)
    window.addEventListener('keydown', handleEscapeKey)
    window.addEventListener('blur', handleWindowBlur)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside, true)
      window.removeEventListener('keydown', handleEscapeKey)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [isEditMenuOpen, isFormatMenuOpen, isInsertMenuOpen, isToolsMenuOpen, isViewMenuOpen])

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
                    setIsEditMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsFormatMenuOpen(false)
                    setIsInsertMenuOpen(false)
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
            ) : item === 'Edit' ? (
              <div ref={editMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap bg-transparent p-0 text-sm text-[#2f3440] md:text-[15px]',
                    isEditMenuOpen ? 'text-[#1f232d]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsEditMenuOpen((prev) => !prev)
                    setIsViewMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsFormatMenuOpen(false)
                    setIsInsertMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isEditMenuOpen && (
                  <div className="absolute top-7 left-0 z-40 min-w-[186px] border border-[#d2d7de] bg-[#f4f4f5] shadow-[0_10px_24px_rgba(25,32,45,0.12)]">
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onUndo()
                        setIsEditMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiCornerUpLeft />
                      </span>
                      <span>Undo</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onRedo()
                        setIsEditMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiCornerUpRight />
                      </span>
                      <span>Redo</span>
                    </button>
                    <div className="h-px w-full bg-[#d8dde4]" />
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onCut()
                        setIsEditMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiScissors />
                      </span>
                      <span>Cut</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onCopy()
                        setIsEditMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiCopy />
                      </span>
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onDeleteSelection()
                        setIsEditMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiX />
                      </span>
                      <span>Delete</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onSelectAll()
                        setIsEditMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiCheckSquare />
                      </span>
                      <span>Select All</span>
                    </button>
                    <div className="h-px w-full bg-[#d8dde4]" />
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onOpenFindReplace()
                        setIsEditMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiSearch />
                      </span>
                      <span>Find &amp; Replace</span>
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
                    setIsEditMenuOpen(false)
                    setIsViewMenuOpen(false)
                    setIsFormatMenuOpen(false)
                    setIsInsertMenuOpen(false)
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
            ) : item === 'Insert' ? (
              <div ref={insertMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap bg-transparent p-0 text-sm text-[#2f3440] md:text-[15px]',
                    isInsertMenuOpen ? 'text-[#1f232d]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsInsertMenuOpen((prev) => !prev)
                    setIsEditMenuOpen(false)
                    setIsViewMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsFormatMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isInsertMenuOpen && (
                  <div className="absolute top-7 left-0 z-40 min-w-[186px] border border-[#d2d7de] bg-[#f4f4f5] shadow-[0_10px_24px_rgba(25,32,45,0.12)]">
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onInsertDateTime()
                        setIsInsertMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiClock />
                      </span>
                      <span>Date/Time</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onOpenSpecialCharacters()
                        setIsInsertMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">Ω</span>
                      <span>Characters</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onOpenEmojis()
                        setIsInsertMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiSmile />
                      </span>
                      <span>Emojis</span>
                    </button>
                  </div>
                )}
              </div>
            ) : item === 'Format' ? (
              <div ref={formatMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap bg-transparent p-0 text-sm text-[#2f3440] md:text-[15px]',
                    isFormatMenuOpen ? 'text-[#1f232d]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsFormatMenuOpen((prev) => !prev)
                    setIsEditMenuOpen(false)
                    setIsViewMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsInsertMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isFormatMenuOpen && (
                  <div className="absolute top-7 left-0 z-40 min-w-[186px] border border-[#d2d7de] bg-[#f4f4f5] shadow-[0_10px_24px_rgba(25,32,45,0.12)]">
                    <button
                      type="button"
                      className={[
                        'flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]',
                        isWordWrapEnabled ? 'bg-[#eceeef]' : 'bg-transparent'
                      ].join(' ')}
                      onClick={() => {
                        onToggleWordWrap()
                        setIsFormatMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        {isWordWrapEnabled ? <FiCheck /> : null}
                      </span>
                      <span>Word Wrap</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[15px] text-[#2f3642] hover:bg-[#eceeef]"
                      onClick={() => {
                        onOpenFontSettings()
                        setIsFormatMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiType />
                      </span>
                      <span>Font</span>
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
