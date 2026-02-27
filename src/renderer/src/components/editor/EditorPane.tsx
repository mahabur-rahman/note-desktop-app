import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppTheme, EditorFontSettings } from '../../types/ui'
import { EmojisModal } from './EmojisModal'
import { FindReplaceModal, type FindReplacePayload } from './FindReplaceModal'
import { FontSettingsModal } from './FontSettingsModal'
import { NoteTitleRow } from './NoteTitleRow'
import { SpecialCharactersModal } from './SpecialCharactersModal'
import { TopMenu } from './TopMenu'

/* eslint-disable react-hooks/exhaustive-deps */

type SaveState = 'saving' | 'saved' | 'error'

interface EditorPaneProps {
  menuItems: readonly string[]
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
  noteId: string | null
  noteTitle: string | null
  noteContent: string | null
  noteFolder: string | null
  noteTags: string[]
  availableFolders: string[]
  isNotePinned: boolean
  isNoteDeleted: boolean
  characterCount: number
  isStatusBarVisible: boolean
  onToggleStatusBar: () => void
  isWordWrapEnabled: boolean
  onToggleWordWrap: () => void
  isFontSettingsOpen: boolean
  onOpenFontSettings: () => void
  onCloseFontSettings: () => void
  editorFontSettings: EditorFontSettings
  onChangeEditorFontSettings: (settings: EditorFontSettings) => void
  onResetEditorFontSettings: () => void
  isSpellCheckEnabled: boolean
  onToggleSpellCheck: () => void
  onChangeNoteTitle: (title: string) => void
  onChangeNoteContent: (content: string) => void
  onChangeNoteFolder: (folder: string) => void
  onChangeNoteTags: (tags: string[]) => void
  onDeleteNote: () => void
  onRestoreNote: () => void
  onPermanentDeleteNote: () => void
  onTogglePinNote: () => void
  onOpenVersionHistory: () => void
  saveState: SaveState
  lastSavedAt: number | null
  isExpandedView: boolean
  onToggleExpandedView: () => void
  appTheme: AppTheme
  onChangeTheme: (theme: AppTheme) => void
  isMarkdownPreviewEnabled: boolean
  onToggleMarkdownPreview: () => void
  onOpenCommandPalette: () => void
}

function getSavedLabel(saveState: SaveState, lastSavedAt: number | null): string {
  if (saveState === 'saving') return 'Saving...'
  if (saveState === 'error') return 'Save failed'
  if (!lastSavedAt) return 'Saved'

  const now = Date.now()
  const diffMs = Math.max(now - lastSavedAt, 0)
  if (diffMs < 60_000) return 'Saved just now'
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) return `Saved ${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `Saved ${hours}h ago`
}

function escapeHtml(rawValue: string): string {
  return rawValue
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInlineMarkdown(rawValue: string): string {
  let output = escapeHtml(rawValue)
  output = output.replace(/`([^`]+)`/g, '<code>$1</code>')
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  output = output.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  output = output.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  )
  return output
}

function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const htmlParts: string[] = []
  let isInList = false
  let isInCodeBlock = false

  const closeList = (): void => {
    if (!isInList) return
    htmlParts.push('</ul>')
    isInList = false
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      closeList()
      if (!isInCodeBlock) {
        htmlParts.push('<pre><code>')
      } else {
        htmlParts.push('</code></pre>')
      }
      isInCodeBlock = !isInCodeBlock
      continue
    }

    if (isInCodeBlock) {
      htmlParts.push(`${escapeHtml(line)}\n`)
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      if (!isInList) {
        htmlParts.push('<ul>')
        isInList = true
      }
      const itemText = line.replace(/^\s*[-*]\s+/, '')
      htmlParts.push(`<li>${renderInlineMarkdown(itemText)}</li>`)
      continue
    }

    closeList()

    if (!line.trim()) {
      htmlParts.push('<div class="md-spacer"></div>')
      continue
    }

    if (line.startsWith('### ')) {
      htmlParts.push(`<h3>${renderInlineMarkdown(line.slice(4))}</h3>`)
      continue
    }

    if (line.startsWith('## ')) {
      htmlParts.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`)
      continue
    }

    if (line.startsWith('# ')) {
      htmlParts.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`)
      continue
    }

    if (line.startsWith('> ')) {
      htmlParts.push(`<blockquote>${renderInlineMarkdown(line.slice(2))}</blockquote>`)
      continue
    }

    htmlParts.push(`<p>${renderInlineMarkdown(line)}</p>`)
  }

  closeList()
  if (isInCodeBlock) htmlParts.push('</code></pre>')

  return htmlParts.join('')
}

export function EditorPane({
  menuItems,
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
  noteId,
  noteTitle,
  noteContent,
  noteFolder,
  noteTags,
  availableFolders,
  isNotePinned,
  isNoteDeleted,
  characterCount,
  isStatusBarVisible,
  onToggleStatusBar,
  isWordWrapEnabled,
  onToggleWordWrap,
  isFontSettingsOpen,
  onOpenFontSettings,
  onCloseFontSettings,
  editorFontSettings,
  onChangeEditorFontSettings,
  onResetEditorFontSettings,
  isSpellCheckEnabled,
  onToggleSpellCheck,
  onChangeNoteTitle,
  onChangeNoteContent,
  onChangeNoteFolder,
  onChangeNoteTags,
  onDeleteNote,
  onRestoreNote,
  onPermanentDeleteNote,
  onTogglePinNote,
  onOpenVersionHistory,
  saveState,
  lastSavedAt,
  isExpandedView,
  onToggleExpandedView,
  appTheme,
  onChangeTheme,
  isMarkdownPreviewEnabled,
  onToggleMarkdownPreview,
  onOpenCommandPalette
}: EditorPaneProps): React.JSX.Element {
  const hasNote = noteTitle !== null
  const noteLineCount = noteContent ? noteContent.split(/\r?\n/).length : 0
  const resolvedFontFamily =
    editorFontSettings.fontFamily === 'default' ? undefined : editorFontSettings.fontFamily
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const actionToastTimeoutRef = useRef<number | null>(null)
  const [isSpecialCharactersOpen, setIsSpecialCharactersOpen] = useState(false)
  const [isEmojisOpen, setIsEmojisOpen] = useState(false)
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false)
  const [actionToastMessage, setActionToastMessage] = useState<string | null>(null)

  const previewHtml = useMemo(() => renderMarkdownToHtml(noteContent ?? ''), [noteContent])

  const focusTextarea = (): HTMLTextAreaElement | null => {
    const textarea = textareaRef.current
    if (!textarea) return null
    textarea.focus()
    return textarea
  }

  const executeTextareaCommand = (
    command: 'undo' | 'redo' | 'cut' | 'copy' | 'delete'
  ): boolean => {
    const textarea = focusTextarea()
    if (!textarea) return false
    if (typeof document.execCommand !== 'function') return false
    return document.execCommand(command)
  }

  const restoreSelection = (selectionStart: number, selectionEnd: number): void => {
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      textarea.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const showActionToast = (message: string): void => {
    if (actionToastTimeoutRef.current !== null) {
      window.clearTimeout(actionToastTimeoutRef.current)
      actionToastTimeoutRef.current = null
    }

    setActionToastMessage(message)
    actionToastTimeoutRef.current = window.setTimeout(() => {
      setActionToastMessage(null)
      actionToastTimeoutRef.current = null
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (actionToastTimeoutRef.current === null) return
      window.clearTimeout(actionToastTimeoutRef.current)
    }
  }, [])

  const getSelectionRange = (
    textarea: HTMLTextAreaElement,
    content: string
  ): { start: number; end: number; normalizedStart: number; normalizedEnd: number } => {
    const start = textarea.selectionStart ?? content.length
    const end = textarea.selectionEnd ?? content.length
    return {
      start,
      end,
      normalizedStart: Math.min(start, end),
      normalizedEnd: Math.max(start, end)
    }
  }

  const insertTextAtCursor = (insertValue: string): void => {
    if (!hasNote) return

    const textarea = textareaRef.current
    const currentContent = noteContent ?? ''

    if (!textarea) {
      onChangeNoteContent(`${currentContent}${insertValue}`)
      return
    }

    const selectionStart = textarea.selectionStart ?? currentContent.length
    const selectionEnd = textarea.selectionEnd ?? currentContent.length
    const nextContent =
      currentContent.slice(0, selectionStart) +
      insertValue +
      currentContent.slice(Math.max(selectionEnd, selectionStart))
    const nextCursorPosition = selectionStart + insertValue.length

    onChangeNoteContent(nextContent)
    window.requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCursorPosition, nextCursorPosition)
    })
  }

  const handleInsertDateTime = (): void => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const year = now.getFullYear()
    const hours24 = now.getHours()
    const hours12 = hours24 % 12 || 12
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const meridiem = hours24 >= 12 ? 'pm' : 'am'
    const dateTimeText = `${month}/${day}/${year} ${hours12}:${minutes} ${meridiem}`
    insertTextAtCursor(dateTimeText)
  }

  const handleOpenSpecialCharacters = (): void => {
    if (!hasNote) return
    setIsSpecialCharactersOpen(true)
  }

  const handleOpenEmojis = (): void => {
    if (!hasNote) return
    setIsEmojisOpen(true)
  }

  const handleUndo = (): void => {
    if (!hasNote) return
    executeTextareaCommand('undo')
  }

  const handleRedo = (): void => {
    if (!hasNote) return
    executeTextareaCommand('redo')
  }

  const handleCopy = (): void => {
    if (!hasNote) return

    const textarea = focusTextarea()
    if (!textarea) return
    const currentContent = noteContent ?? ''
    const { normalizedStart, normalizedEnd } = getSelectionRange(textarea, currentContent)
    if (normalizedStart === normalizedEnd) return

    const selectedText = currentContent.slice(normalizedStart, normalizedEnd)
    if (!selectedText) return

    const onCopySuccess = (): void => {
      restoreSelection(normalizedStart, normalizedEnd)
      showActionToast('Copied')
    }

    if (executeTextareaCommand('copy')) {
      onCopySuccess()
      return
    }

    if (navigator.clipboard?.writeText) {
      void navigator.clipboard
        .writeText(selectedText)
        .then(() => {
          onCopySuccess()
        })
        .catch(() => {
          restoreSelection(normalizedStart, normalizedEnd)
        })
      return
    }

    restoreSelection(normalizedStart, normalizedEnd)
  }

  const handleDeleteSelection = (): void => {
    if (!hasNote) return

    const textarea = focusTextarea()
    if (!textarea) return
    const currentContent = noteContent ?? ''
    const { normalizedStart, normalizedEnd } = getSelectionRange(textarea, currentContent)
    const hasSelection = normalizedStart !== normalizedEnd
    if (!hasSelection) return

    const nextCursorPosition = normalizedStart

    if (typeof document.execCommand === 'function' && document.execCommand('delete')) {
      showActionToast('Deleted')
      return
    }

    const nextContent =
      currentContent.slice(0, normalizedStart) + currentContent.slice(normalizedEnd)

    onChangeNoteContent(nextContent)
    window.requestAnimationFrame(() => {
      const target = textareaRef.current
      if (!target) return
      target.focus()
      target.setSelectionRange(nextCursorPosition, nextCursorPosition)
    })
    showActionToast('Deleted')
  }

  const handleCut = (): void => {
    if (!hasNote) return
    if (executeTextareaCommand('cut')) return

    const textarea = focusTextarea()
    if (!textarea) return
    const currentContent = noteContent ?? ''
    const { normalizedStart, normalizedEnd } = getSelectionRange(textarea, currentContent)
    if (normalizedStart === normalizedEnd) return

    const selectedText = currentContent.slice(normalizedStart, normalizedEnd)
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(selectedText).catch(() => {
        // Ignore clipboard permission failures.
      })
    }

    const nextContent =
      currentContent.slice(0, normalizedStart) + currentContent.slice(normalizedEnd)
    onChangeNoteContent(nextContent)
    window.requestAnimationFrame(() => {
      const target = textareaRef.current
      if (!target) return
      target.focus()
      target.setSelectionRange(normalizedStart, normalizedStart)
    })
  }

  const handleSelectAll = (): void => {
    if (!hasNote) return

    const textarea = focusTextarea()
    if (!textarea) return
    const currentContent = noteContent ?? ''
    const endPosition = currentContent.length

    textarea.select()
    textarea.setSelectionRange(0, endPosition)

    window.requestAnimationFrame(() => {
      const target = textareaRef.current
      if (!target) return
      target.focus()
      target.setSelectionRange(0, endPosition)
    })
  }

  const handleOpenFindReplace = (): void => {
    if (!hasNote) return
    setIsFindReplaceOpen(true)
  }

  const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const handleFindReplace = ({
    findText,
    replaceText,
    matchCase,
    wholeWords
  }: FindReplacePayload): void => {
    if (!hasNote) return
    if (findText.length === 0) return

    const currentContent = noteContent ?? ''
    if (currentContent.length === 0) return

    const escapedFindText = escapeRegExp(findText)
    const pattern = wholeWords ? `\\b${escapedFindText}\\b` : escapedFindText
    const flags = matchCase ? '' : 'i'

    const textarea = focusTextarea()
    if (!textarea) return
    const { normalizedStart, normalizedEnd } = getSelectionRange(textarea, currentContent)

    const exactMatchRegex = new RegExp(`^(?:${pattern})$`, flags)
    const selectedText = currentContent.slice(normalizedStart, normalizedEnd)
    const hasSelectedMatch = normalizedStart !== normalizedEnd && exactMatchRegex.test(selectedText)

    if (hasSelectedMatch) {
      const nextContent =
        currentContent.slice(0, normalizedStart) + replaceText + currentContent.slice(normalizedEnd)
      const replaceEnd = normalizedStart + replaceText.length

      onChangeNoteContent(nextContent)
      window.requestAnimationFrame(() => {
        const target = textareaRef.current
        if (!target) return
        target.focus()
        target.setSelectionRange(normalizedStart, replaceEnd)
      })
      return
    }

    const searchRegex = new RegExp(pattern, flags)
    const startFrom = normalizedEnd
    const tailText = currentContent.slice(startFrom)
    const tailMatch = searchRegex.exec(tailText)

    let matchIndex = -1
    let matchText = ''

    if (tailMatch) {
      matchIndex = startFrom + tailMatch.index
      matchText = tailMatch[0]
    } else {
      const headText = currentContent.slice(0, normalizedStart)
      const headMatch = searchRegex.exec(headText)
      if (!headMatch) return
      matchIndex = headMatch.index
      matchText = headMatch[0]
    }

    const matchEnd = matchIndex + matchText.length
    const nextContent =
      currentContent.slice(0, matchIndex) + replaceText + currentContent.slice(matchEnd)
    const replaceEnd = matchIndex + replaceText.length

    onChangeNoteContent(nextContent)
    window.requestAnimationFrame(() => {
      const target = textareaRef.current
      if (!target) return
      target.focus()
      target.setSelectionRange(matchIndex, replaceEnd)
    })
  }

  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent): void => {
      const isModPressed = event.ctrlKey || event.metaKey
      if (!isModPressed) return
      const key = event.key.toLocaleLowerCase()
      const isTextareaFocused = document.activeElement === textareaRef.current

      if (event.shiftKey && key === 'r') {
        event.preventDefault()
        handleOpenFindReplace()
        return
      }

      if (event.shiftKey && key === 'd') {
        event.preventDefault()
        handleInsertDateTime()
        return
      }

      if (event.shiftKey && key === 'c') {
        event.preventDefault()
        handleOpenSpecialCharacters()
        return
      }

      if (event.shiftKey && key === 'e') {
        event.preventDefault()
        handleOpenEmojis()
        return
      }

      if (event.shiftKey && key === 'g') {
        event.preventDefault()
        onOpenFontSettings()
        return
      }

      if (event.shiftKey && key === 'f') {
        event.preventDefault()
        onToggleExpandedView()
        return
      }

      if (key === 'k') {
        event.preventDefault()
        onOpenCommandPalette()
        return
      }

      if (key === 'n') {
        event.preventDefault()
        onFileNew()
        return
      }

      if (key === 'o') {
        event.preventDefault()
        onFileOpen()
        return
      }

      if (key === 's') {
        event.preventDefault()
        if (event.shiftKey) {
          onFileSaveAs()
        } else {
          onFileSave()
        }
        return
      }

      if (key === 'p') {
        event.preventDefault()
        onFilePrint()
        return
      }

      if (!isTextareaFocused) return

      if (key === 'z') {
        event.preventDefault()
        handleUndo()
        return
      }

      if (key === 'y') {
        event.preventDefault()
        handleRedo()
        return
      }

      if (key === 'x') {
        event.preventDefault()
        handleCut()
        return
      }

      if (key === 'c') {
        event.preventDefault()
        handleCopy()
        return
      }

      if (key === 'a') {
        event.preventDefault()
        handleSelectAll()
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcuts)
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [
    handleCopy,
    handleCut,
    handleInsertDateTime,
    handleOpenEmojis,
    handleOpenFindReplace,
    handleOpenSpecialCharacters,
    handleRedo,
    handleSelectAll,
    handleUndo,
    hasNote,
    noteContent,
    onFileNew,
    onFileOpen,
    onFileSave,
    onFileSaveAs,
    onFilePrint,
    onOpenFontSettings,
    onOpenCommandPalette,
    onToggleExpandedView
  ])

  useEffect(() => {
    const handleEditorCommand = (event: Event): void => {
      const command = (event as CustomEvent<string>).detail
      if (typeof command !== 'string') return

      if (command === 'open-find-replace') {
        handleOpenFindReplace()
      }
    }

    window.addEventListener('notepad:editor-command', handleEditorCommand as EventListener)
    return () => {
      window.removeEventListener('notepad:editor-command', handleEditorCommand as EventListener)
    }
  }, [handleOpenFindReplace])

  const themeBodyClass =
    appTheme === 'dark'
      ? 'bg-[#0f1724] text-[#d2ddef]'
      : appTheme === 'sepia'
        ? 'bg-[#fbf5e8] text-[#493d2b]'
        : 'bg-[#f8faff] text-[#243650]'

  const themePreviewClass =
    appTheme === 'dark'
      ? 'border-[#263650] bg-[#111d2f] text-[#d5e0f1]'
      : appTheme === 'sepia'
        ? 'border-[#dcc9ac] bg-[#fffaf0] text-[#4e402f]'
        : 'border-[#d6dfef] bg-white text-[#2c405f]'

  return (
    <>
      <section
        className={[
          'grid h-full min-h-[62dvh] bg-[linear-gradient(180deg,#f9fbff_0%,#f5f8ff_100%)] md:min-h-0',
          isStatusBarVisible
            ? 'grid-rows-[48px_auto_minmax(320px,1fr)_24px] md:grid-rows-[52px_auto_minmax(0,1fr)_26px]'
            : 'grid-rows-[48px_auto_minmax(320px,1fr)] md:grid-rows-[52px_auto_minmax(0,1fr)]'
        ].join(' ')}
      >
        <TopMenu
          items={menuItems}
          onFileNew={onFileNew}
          onFileOpen={onFileOpen}
          onFileSave={onFileSave}
          onFileSaveAs={onFileSaveAs}
          onFilePrint={onFilePrint}
          onFileExportMarkdown={onFileExportMarkdown}
          onFileExportPdf={onFileExportPdf}
          onHelpShortcuts={onHelpShortcuts}
          onHelpPrivacy={onHelpPrivacy}
          onHelpAbout={onHelpAbout}
          isExpandedView={isExpandedView}
          onToggleExpandedView={onToggleExpandedView}
          isStatusBarVisible={isStatusBarVisible}
          onToggleStatusBar={onToggleStatusBar}
          isWordWrapEnabled={isWordWrapEnabled}
          onToggleWordWrap={onToggleWordWrap}
          onInsertDateTime={handleInsertDateTime}
          onOpenSpecialCharacters={handleOpenSpecialCharacters}
          onOpenEmojis={handleOpenEmojis}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCut={handleCut}
          onCopy={handleCopy}
          onDeleteSelection={handleDeleteSelection}
          onSelectAll={handleSelectAll}
          onOpenFindReplace={handleOpenFindReplace}
          onOpenFontSettings={onOpenFontSettings}
          isSpellCheckEnabled={isSpellCheckEnabled}
          onToggleSpellCheck={onToggleSpellCheck}
          appTheme={appTheme}
          onChangeTheme={onChangeTheme}
          isMarkdownPreviewEnabled={isMarkdownPreviewEnabled}
          onToggleMarkdownPreview={onToggleMarkdownPreview}
          onOpenCommandPalette={onOpenCommandPalette}
        />
        <NoteTitleRow
          key={noteId ?? 'empty-note'}
          title={noteTitle}
          folder={noteFolder}
          tags={noteTags}
          availableFolders={availableFolders}
          isPinned={isNotePinned}
          isDeleted={isNoteDeleted}
          onChangeTitle={onChangeNoteTitle}
          onChangeFolder={onChangeNoteFolder}
          onChangeTags={onChangeNoteTags}
          onTogglePinned={onTogglePinNote}
          onDeleteNote={onDeleteNote}
          onRestoreNote={onRestoreNote}
          onPermanentDeleteNote={onPermanentDeleteNote}
          onOpenVersionHistory={onOpenVersionHistory}
        />

        <div className={[themeBodyClass, 'p-4 md:p-5'].join(' ')}>
          {isMarkdownPreviewEnabled ? (
            <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-2">
              <textarea
                className={[
                  'h-full w-full resize-none rounded-xl border px-4 py-3 text-[15px] shadow-[inset_0_1px_2px_rgba(20,35,64,0.04)] outline-none focus:border-[#93a8d2] md:px-5 md:py-4',
                  themePreviewClass,
                  hasNote ? 'cursor-text' : 'cursor-not-allowed opacity-70',
                  isWordWrapEnabled ? 'whitespace-pre-wrap' : 'overflow-x-auto whitespace-pre'
                ].join(' ')}
                style={{
                  fontFamily: resolvedFontFamily,
                  fontSize: `${editorFontSettings.fontSize}px`,
                  fontWeight: editorFontSettings.fontWeight,
                  fontStyle: editorFontSettings.fontStyle,
                  lineHeight: editorFontSettings.lineHeight
                }}
                placeholder="Start writing your note..."
                value={noteContent ?? ''}
                ref={textareaRef}
                disabled={!hasNote}
                wrap={isWordWrapEnabled ? 'soft' : 'off'}
                spellCheck={isSpellCheckEnabled}
                onChange={(event) => onChangeNoteContent(event.target.value)}
              />

              <article
                className={[
                  'markdown-preview h-full overflow-auto rounded-xl border px-4 py-3 md:px-5 md:py-4',
                  themePreviewClass
                ].join(' ')}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          ) : (
            <textarea
              className={[
                'h-full w-full resize-none rounded-xl border px-4 py-3 text-[15px] shadow-[inset_0_1px_2px_rgba(20,35,64,0.04)] outline-none focus:border-[#93a8d2] md:px-5 md:py-4',
                themePreviewClass,
                hasNote ? 'cursor-text' : 'cursor-not-allowed opacity-70',
                isWordWrapEnabled ? 'whitespace-pre-wrap' : 'overflow-x-auto whitespace-pre'
              ].join(' ')}
              style={{
                fontFamily: resolvedFontFamily,
                fontSize: `${editorFontSettings.fontSize}px`,
                fontWeight: editorFontSettings.fontWeight,
                fontStyle: editorFontSettings.fontStyle,
                lineHeight: editorFontSettings.lineHeight
              }}
              placeholder="Start writing your note..."
              value={noteContent ?? ''}
              ref={textareaRef}
              disabled={!hasNote}
              wrap={isWordWrapEnabled ? 'soft' : 'off'}
              spellCheck={isSpellCheckEnabled}
              onChange={(event) => onChangeNoteContent(event.target.value)}
            />
          )}
        </div>

        {isStatusBarVisible && (
          <div className="flex items-center justify-between border-t border-[#9eb8df] bg-[linear-gradient(90deg,#dfe8fb_0%,#d8e3f8_50%,#d2def4_100%)] px-3 text-[11px] font-semibold text-[#334e78] md:px-4 md:text-xs">
            <div className="inline-flex items-center gap-3">
              <span>{`Characters: ${characterCount}`}</span>
              <span>{`Lines: ${noteLineCount}`}</span>
            </div>
            <span>{getSavedLabel(saveState, lastSavedAt)}</span>
          </div>
        )}
      </section>

      <FontSettingsModal
        isOpen={isFontSettingsOpen}
        settings={editorFontSettings}
        onChange={onChangeEditorFontSettings}
        onReset={onResetEditorFontSettings}
        onClose={onCloseFontSettings}
      />

      <SpecialCharactersModal
        isOpen={isSpecialCharactersOpen}
        onClose={() => setIsSpecialCharactersOpen(false)}
        onInsert={(character) => insertTextAtCursor(character)}
      />

      <EmojisModal
        isOpen={isEmojisOpen}
        onClose={() => setIsEmojisOpen(false)}
        onInsert={(emoji) => insertTextAtCursor(emoji)}
      />

      <FindReplaceModal
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
        onReplace={handleFindReplace}
      />

      <style>{`
        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3 {
          margin: 0 0 0.55rem;
          font-weight: 700;
          line-height: 1.25;
        }

        .markdown-preview h1 {
          font-size: 1.5rem;
        }

        .markdown-preview h2 {
          font-size: 1.28rem;
        }

        .markdown-preview h3 {
          font-size: 1.12rem;
        }

        .markdown-preview p {
          margin: 0 0 0.55rem;
          line-height: 1.58;
          font-size: 0.95rem;
        }

        .markdown-preview ul {
          margin: 0 0 0.6rem;
          padding-left: 1.2rem;
        }

        .markdown-preview li {
          margin: 0.2rem 0;
        }

        .markdown-preview blockquote {
          margin: 0 0 0.6rem;
          padding: 0.5rem 0.65rem;
          border-left: 3px solid #96a7d1;
          border-radius: 0.3rem;
          background: rgba(148, 167, 208, 0.14);
          font-style: italic;
        }

        .markdown-preview code {
          padding: 0.12rem 0.28rem;
          border-radius: 0.3rem;
          background: rgba(90, 109, 140, 0.14);
          font-size: 0.88rem;
        }

        .markdown-preview pre {
          margin: 0 0 0.75rem;
          overflow: auto;
          border-radius: 0.5rem;
          padding: 0.75rem;
          background: rgba(90, 109, 140, 0.16);
        }

        .markdown-preview pre code {
          padding: 0;
          background: transparent;
        }

        .markdown-preview a {
          color: #3f55de;
          text-decoration: underline;
        }

        .markdown-preview .md-spacer {
          height: 0.55rem;
        }
      `}</style>

      {actionToastMessage && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-[#1d2432] px-10 py-3 text-sm font-medium text-[#f5f8ff] shadow-[0_10px_28px_rgba(11,18,32,0.35)]">
          {actionToastMessage}
        </div>
      )}
    </>
  )
}
