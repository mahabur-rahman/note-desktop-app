import { useEffect, useRef, useState } from 'react'
import {
  FiCheck,
  FiCheckSquare,
  FiClock,
  FiCommand,
  FiCopy,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiFile,
  FiFolder,
  FiInfo,
  FiKey,
  FiMaximize2,
  FiMinimize2,
  FiMoon,
  FiPrinter,
  FiScissors,
  FiSearch,
  FiSave,
  FiShield,
  FiSmile,
  FiSun,
  FiType,
  FiUploadCloud,
  FiX
} from 'react-icons/fi'
import type { AppTheme } from '../../types/ui'
import { IconButton } from '../common/IconButton'

interface TopMenuProps {
  items: readonly string[]
  onFileNew: () => void
  onFileOpen: () => void
  onFileSave: () => void
  onFileSaveAs: () => void
  onFilePrint: () => void
  onFileExportMarkdown: () => void
  onFileExportPdf: () => void
  onHelpShortcuts: () => void
  onHelpPrivacy: () => void
  onHelpAbout: () => void
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
  appTheme: AppTheme
  onChangeTheme: (theme: AppTheme) => void
  isMarkdownPreviewEnabled: boolean
  onToggleMarkdownPreview: () => void
  onOpenCommandPalette: () => void
}

export function TopMenu({
  items,
  onFileNew,
  onFileOpen,
  onFileSave,
  onFileSaveAs,
  onFilePrint,
  onFileExportMarkdown,
  onFileExportPdf,
  onHelpShortcuts,
  onHelpPrivacy,
  onHelpAbout,
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
  onToggleSpellCheck,
  appTheme,
  onChangeTheme,
  isMarkdownPreviewEnabled,
  onToggleMarkdownPreview,
  onOpenCommandPalette
}: TopMenuProps): React.JSX.Element {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false)
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false)
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false)
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false)
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false)
  const fileMenuRef = useRef<HTMLDivElement | null>(null)
  const editMenuRef = useRef<HTMLDivElement | null>(null)
  const viewMenuRef = useRef<HTMLDivElement | null>(null)
  const toolsMenuRef = useRef<HTMLDivElement | null>(null)
  const formatMenuRef = useRef<HTMLDivElement | null>(null)
  const insertMenuRef = useRef<HTMLDivElement | null>(null)
  const helpMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (
      !isFileMenuOpen &&
      !isEditMenuOpen &&
      !isViewMenuOpen &&
      !isToolsMenuOpen &&
      !isFormatMenuOpen &&
      !isInsertMenuOpen &&
      !isHelpMenuOpen
    ) {
      return
    }

    const handlePointerDownOutside = (event: PointerEvent): void => {
      const clickTarget = event.target as Node
      if (fileMenuRef.current?.contains(clickTarget)) return
      if (editMenuRef.current?.contains(clickTarget)) return
      if (viewMenuRef.current?.contains(clickTarget)) return
      if (toolsMenuRef.current?.contains(clickTarget)) return
      if (formatMenuRef.current?.contains(clickTarget)) return
      if (insertMenuRef.current?.contains(clickTarget)) return
      if (helpMenuRef.current?.contains(clickTarget)) return
      setIsFileMenuOpen(false)
      setIsEditMenuOpen(false)
      setIsViewMenuOpen(false)
      setIsToolsMenuOpen(false)
      setIsFormatMenuOpen(false)
      setIsInsertMenuOpen(false)
      setIsHelpMenuOpen(false)
    }

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      setIsFileMenuOpen(false)
      setIsEditMenuOpen(false)
      setIsViewMenuOpen(false)
      setIsToolsMenuOpen(false)
      setIsFormatMenuOpen(false)
      setIsInsertMenuOpen(false)
      setIsHelpMenuOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDownOutside, true)
    window.addEventListener('keydown', handleEscapeKey)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside, true)
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [
    isEditMenuOpen,
    isFileMenuOpen,
    isFormatMenuOpen,
    isHelpMenuOpen,
    isInsertMenuOpen,
    isToolsMenuOpen,
    isViewMenuOpen
  ])

  const closeAllMenus = (): void => {
    setIsFileMenuOpen(false)
    setIsEditMenuOpen(false)
    setIsViewMenuOpen(false)
    setIsToolsMenuOpen(false)
    setIsFormatMenuOpen(false)
    setIsInsertMenuOpen(false)
    setIsHelpMenuOpen(false)
  }

  return (
    <header className="flex items-center justify-between border-b border-[#d7dfef] bg-[#f6f9ff] pr-2 pl-2.5 md:pr-2.5 md:pl-4">
      <nav className="flex min-w-0 flex-1 items-center gap-3 overflow-visible md:gap-5">
        {items.map((item) => (
          <div key={item} className="relative">
            {item === 'View' ? (
              <div ref={viewMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap rounded px-1.5 py-1 text-sm font-medium text-[#324562] transition hover:bg-[#eaf0fc] hover:text-[#1f2f4e] md:text-[15px]',
                    isViewMenuOpen ? 'bg-[#e6edff] text-[#1f2f52]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsViewMenuOpen((prev) => !prev)
                    setIsFileMenuOpen(false)
                    setIsEditMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsFormatMenuOpen(false)
                    setIsInsertMenuOpen(false)
                    setIsHelpMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isViewMenuOpen && (
                  <div className="absolute top-9 left-0 z-40 min-w-[220px] overflow-hidden rounded-lg border border-[#ccd6e8] bg-[#f8faff] shadow-[0_16px_28px_rgba(26,42,71,0.16)]">
                    <button
                      type="button"
                      className={[
                        'flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]',
                        isStatusBarVisible ? 'bg-[#e5ecfa]' : 'bg-transparent'
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
                        'flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]',
                        isExpandedView ? 'bg-[#e5ecfa]' : 'bg-transparent'
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
                    <button
                      type="button"
                      className={[
                        'flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]',
                        isMarkdownPreviewEnabled ? 'bg-[#e5ecfa]' : 'bg-transparent'
                      ].join(' ')}
                      onClick={() => {
                        onToggleMarkdownPreview()
                        setIsViewMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        {isMarkdownPreviewEnabled ? <FiCheck /> : null}
                      </span>
                      <span>Markdown Preview</span>
                    </button>
                    <div className="h-px w-full bg-[#d9e2f2]" />
                    <p className="m-0 px-4 pt-2 pb-1 text-[11px] font-semibold tracking-[0.04em] text-[#6a7f9f] uppercase">
                      Theme
                    </p>
                    <button
                      type="button"
                      className={[
                        'flex h-9 w-full items-center gap-2 px-4 text-left text-[14px] transition hover:bg-[#edf2fd]',
                        appTheme === 'light' ? 'bg-[#e5ecfa] text-[#233753]' : 'text-[#2f425f]'
                      ].join(' ')}
                      onClick={() => {
                        onChangeTheme('light')
                        setIsViewMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiSun />
                      </span>
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      className={[
                        'flex h-9 w-full items-center gap-2 px-4 text-left text-[14px] transition hover:bg-[#edf2fd]',
                        appTheme === 'sepia' ? 'bg-[#e5ecfa] text-[#233753]' : 'text-[#2f425f]'
                      ].join(' ')}
                      onClick={() => {
                        onChangeTheme('sepia')
                        setIsViewMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiSun />
                      </span>
                      <span>Sepia</span>
                    </button>
                    <button
                      type="button"
                      className={[
                        'flex h-9 w-full items-center gap-2 px-4 text-left text-[14px] transition hover:bg-[#edf2fd]',
                        appTheme === 'dark' ? 'bg-[#e5ecfa] text-[#233753]' : 'text-[#2f425f]'
                      ].join(' ')}
                      onClick={() => {
                        onChangeTheme('dark')
                        setIsViewMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiMoon />
                      </span>
                      <span>Dark</span>
                    </button>
                  </div>
                )}
              </div>
            ) : item === 'File' ? (
              <div ref={fileMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap rounded px-1.5 py-1 text-sm font-medium text-[#324562] transition hover:bg-[#eaf0fc] hover:text-[#1f2f4e] md:text-[15px]',
                    isFileMenuOpen ? 'bg-[#e6edff] text-[#1f2f52]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsFileMenuOpen((prev) => !prev)
                    setIsEditMenuOpen(false)
                    setIsViewMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsFormatMenuOpen(false)
                    setIsInsertMenuOpen(false)
                    setIsHelpMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isFileMenuOpen && (
                  <div className="absolute top-9 left-0 z-40 min-w-[220px] overflow-hidden rounded-lg border border-[#ccd6e8] bg-[#f8faff] shadow-[0_16px_28px_rgba(26,42,71,0.16)]">
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onFileNew()
                        setIsFileMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiFile />
                      </span>
                      <span>New</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onFileOpen()
                        setIsFileMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiFolder />
                      </span>
                      <span>Open</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onFileSave()
                        setIsFileMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiSave />
                      </span>
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onFileSaveAs()
                        setIsFileMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiUploadCloud />
                      </span>
                      <span>Save As</span>
                    </button>
                    <div className="h-px w-full bg-[#d9e2f2]" />
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onFileExportMarkdown()
                        setIsFileMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiUploadCloud />
                      </span>
                      <span>Export TXT</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onFileExportPdf()
                        setIsFileMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiPrinter />
                      </span>
                      <span>Export PDF</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onFilePrint()
                        setIsFileMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiPrinter />
                      </span>
                      <span>Print</span>
                    </button>
                  </div>
                )}
              </div>
            ) : item === 'Edit' ? (
              <div ref={editMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap rounded px-1.5 py-1 text-sm font-medium text-[#324562] transition hover:bg-[#eaf0fc] hover:text-[#1f2f4e] md:text-[15px]',
                    isEditMenuOpen ? 'bg-[#e6edff] text-[#1f2f52]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsEditMenuOpen((prev) => !prev)
                    setIsFileMenuOpen(false)
                    setIsViewMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsFormatMenuOpen(false)
                    setIsInsertMenuOpen(false)
                    setIsHelpMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isEditMenuOpen && (
                  <div className="absolute top-9 left-0 z-40 min-w-[196px] overflow-hidden rounded-lg border border-[#ccd6e8] bg-[#f8faff] shadow-[0_16px_28px_rgba(26,42,71,0.16)]">
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                    <div className="h-px w-full bg-[#d9e2f2]" />
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                    <div className="h-px w-full bg-[#d9e2f2]" />
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                    'cursor-pointer whitespace-nowrap rounded px-1.5 py-1 text-sm font-medium text-[#324562] transition hover:bg-[#eaf0fc] hover:text-[#1f2f4e] md:text-[15px]',
                    isToolsMenuOpen ? 'bg-[#e6edff] text-[#1f2f52]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsToolsMenuOpen((prev) => !prev)
                    setIsFileMenuOpen(false)
                    setIsEditMenuOpen(false)
                    setIsViewMenuOpen(false)
                    setIsFormatMenuOpen(false)
                    setIsInsertMenuOpen(false)
                    setIsHelpMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isToolsMenuOpen && (
                  <div className="absolute top-9 left-0 z-40 min-w-[196px] overflow-hidden rounded-lg border border-[#ccd6e8] bg-[#f8faff] shadow-[0_16px_28px_rgba(26,42,71,0.16)]">
                    <button
                      type="button"
                      className={[
                        'flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]',
                        isSpellCheckEnabled ? 'bg-[#e5ecfa]' : 'bg-transparent'
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
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onOpenCommandPalette()
                        closeAllMenus()
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiCommand />
                      </span>
                      <span>Command Palette</span>
                    </button>
                  </div>
                )}
              </div>
            ) : item === 'Insert' ? (
              <div ref={insertMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap rounded px-1.5 py-1 text-sm font-medium text-[#324562] transition hover:bg-[#eaf0fc] hover:text-[#1f2f4e] md:text-[15px]',
                    isInsertMenuOpen ? 'bg-[#e6edff] text-[#1f2f52]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsInsertMenuOpen((prev) => !prev)
                    setIsFileMenuOpen(false)
                    setIsEditMenuOpen(false)
                    setIsViewMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsFormatMenuOpen(false)
                    setIsHelpMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isInsertMenuOpen && (
                  <div className="absolute top-9 left-0 z-40 min-w-[196px] overflow-hidden rounded-lg border border-[#ccd6e8] bg-[#f8faff] shadow-[0_16px_28px_rgba(26,42,71,0.16)]">
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onOpenSpecialCharacters()
                        setIsInsertMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        Ω
                      </span>
                      <span>Characters</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
                    'cursor-pointer whitespace-nowrap rounded px-1.5 py-1 text-sm font-medium text-[#324562] transition hover:bg-[#eaf0fc] hover:text-[#1f2f4e] md:text-[15px]',
                    isFormatMenuOpen ? 'bg-[#e6edff] text-[#1f2f52]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsFormatMenuOpen((prev) => !prev)
                    setIsFileMenuOpen(false)
                    setIsEditMenuOpen(false)
                    setIsViewMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsInsertMenuOpen(false)
                    setIsHelpMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isFormatMenuOpen && (
                  <div className="absolute top-9 left-0 z-40 min-w-[196px] overflow-hidden rounded-lg border border-[#ccd6e8] bg-[#f8faff] shadow-[0_16px_28px_rgba(26,42,71,0.16)]">
                    <button
                      type="button"
                      className={[
                        'flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]',
                        isWordWrapEnabled ? 'bg-[#e5ecfa]' : 'bg-transparent'
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
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
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
            ) : item === 'Help' ? (
              <div ref={helpMenuRef}>
                <button
                  className={[
                    'cursor-pointer whitespace-nowrap rounded px-1.5 py-1 text-sm font-medium text-[#324562] transition hover:bg-[#eaf0fc] hover:text-[#1f2f4e] md:text-[15px]',
                    isHelpMenuOpen ? 'bg-[#e6edff] text-[#1f2f52]' : ''
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsHelpMenuOpen((prev) => !prev)
                    setIsFileMenuOpen(false)
                    setIsEditMenuOpen(false)
                    setIsViewMenuOpen(false)
                    setIsToolsMenuOpen(false)
                    setIsFormatMenuOpen(false)
                    setIsInsertMenuOpen(false)
                  }}
                >
                  {item}
                </button>
                {isHelpMenuOpen && (
                  <div className="absolute top-9 left-0 z-40 min-w-[196px] overflow-hidden rounded-lg border border-[#ccd6e8] bg-[#f8faff] shadow-[0_16px_28px_rgba(26,42,71,0.16)]">
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onHelpShortcuts()
                        setIsHelpMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiKey />
                      </span>
                      <span>Shortcuts</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onHelpPrivacy()
                        setIsHelpMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiShield />
                      </span>
                      <span>Privacy Policy</span>
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center gap-2 px-4 text-left text-[14px] text-[#2f425f] transition hover:bg-[#edf2fd]"
                      onClick={() => {
                        onHelpAbout()
                        setIsHelpMenuOpen(false)
                      }}
                    >
                      <span className="inline-flex w-5 items-center justify-center text-[16px]">
                        <FiInfo />
                      </span>
                      <span>About</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="cursor-default whitespace-nowrap rounded px-1.5 py-1 text-sm font-medium text-[#5d6f8f] md:text-[15px]"
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
        className="cursor-pointer rounded p-1 text-lg text-[#304a72] transition hover:bg-[#eaf0fd] md:text-[22px]"
        onClick={onToggleExpandedView}
      >
        {isExpandedView ? <FiMinimize2 /> : <FiMaximize2 />}
      </IconButton>
    </header>
  )
}
