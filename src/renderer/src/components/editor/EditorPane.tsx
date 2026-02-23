import { useEffect, useRef, useState } from 'react'
import type { EditorFontSettings } from '../../types/ui'
import { EmojisModal } from './EmojisModal'
import { FindReplaceModal, type FindReplacePayload } from './FindReplaceModal'
import { FontSettingsModal } from './FontSettingsModal'
import { NoteTitleRow } from './NoteTitleRow'
import { SpecialCharactersModal } from './SpecialCharactersModal'
import { TopMenu } from './TopMenu'

interface EditorPaneProps {
  menuItems: readonly string[]
  onFileNew: () => void
  onFileOpen: () => void
  onFileSave: () => void
  onFileSaveAs: () => void
  onFilePrint: () => void
  onHelpShortcuts: () => void
  onHelpPrivacy: () => void
  onHelpAbout: () => void
  noteTitle: string | null
  noteContent: string | null
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
  onDeleteNote: () => void
  isExpandedView: boolean
  onToggleExpandedView: () => void
}

export function EditorPane({
  menuItems,
  onFileNew,
  onFileOpen,
  onFileSave,
  onFileSaveAs,
  onFilePrint,
  onHelpShortcuts,
  onHelpPrivacy,
  onHelpAbout,
  noteTitle,
  noteContent,
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
  onDeleteNote,
  isExpandedView,
  onToggleExpandedView
}: EditorPaneProps): React.JSX.Element {
  const hasNote = noteTitle !== null
  const resolvedFontFamily = editorFontSettings.fontFamily === 'default' ? undefined : editorFontSettings.fontFamily
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const actionToastTimeoutRef = useRef<number | null>(null)
  const [isSpecialCharactersOpen, setIsSpecialCharactersOpen] = useState(false)
  const [isEmojisOpen, setIsEmojisOpen] = useState(false)
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false)
  const [actionToastMessage, setActionToastMessage] = useState<string | null>(null)

  const focusTextarea = (): HTMLTextAreaElement | null => {
    const textarea = textareaRef.current
    if (!textarea) return null
    textarea.focus()
    return textarea
  }

  const executeTextareaCommand = (command: 'undo' | 'redo' | 'cut' | 'copy' | 'delete'): boolean => {
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
      currentContent.slice(0, selectionStart) + insertValue + currentContent.slice(Math.max(selectionEnd, selectionStart))
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

    const nextContent = currentContent.slice(0, normalizedStart) + currentContent.slice(normalizedEnd)

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

    const nextContent = currentContent.slice(0, normalizedStart) + currentContent.slice(normalizedEnd)
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

  const handleFindReplace = ({ findText, replaceText, matchCase, wholeWords }: FindReplacePayload): void => {
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
      const nextContent = currentContent.slice(0, normalizedStart) + replaceText + currentContent.slice(normalizedEnd)
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
    const nextContent = currentContent.slice(0, matchIndex) + replaceText + currentContent.slice(matchEnd)
    const replaceEnd = matchIndex + replaceText.length

    onChangeNoteContent(nextContent)
    window.requestAnimationFrame(() => {
      const target = textareaRef.current
      if (!target) return
      target.focus()
      target.setSelectionRange(matchIndex, replaceEnd)
    })
  }

  return (
    <>
      <section
        className={[
          'grid h-full min-h-[62dvh] bg-[#f8f8f9] md:min-h-0',
          isStatusBarVisible
            ? 'grid-rows-[44px_54px_minmax(320px,1fr)_28px] md:grid-rows-[46px_62px_minmax(0,1fr)_28px]'
            : 'grid-rows-[44px_54px_minmax(320px,1fr)] md:grid-rows-[46px_62px_minmax(0,1fr)]'
        ].join(' ')}
      >
        <TopMenu
          items={menuItems}
          onFileNew={onFileNew}
          onFileOpen={onFileOpen}
          onFileSave={onFileSave}
          onFileSaveAs={onFileSaveAs}
          onFilePrint={onFilePrint}
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
        />
        <NoteTitleRow title={noteTitle} onChangeTitle={onChangeNoteTitle} onDeleteNote={onDeleteNote} />
        <div className="bg-[#f7f7f8] p-4 md:p-5">
          <textarea
            className={[
              'h-full w-full resize-none border-0 bg-transparent text-[15px] text-[#2f3440] outline-none',
              hasNote ? 'cursor-text' : 'cursor-not-allowed text-[#8f97a4]',
              isWordWrapEnabled ? 'whitespace-pre-wrap' : 'overflow-x-auto whitespace-pre'
            ].join(' ')}
            style={{
              fontFamily: resolvedFontFamily,
              fontSize: `${editorFontSettings.fontSize}px`,
              fontWeight: editorFontSettings.fontWeight,
              fontStyle: editorFontSettings.fontStyle,
              lineHeight: editorFontSettings.lineHeight
            }}
            placeholder="Write your note..."
            value={noteContent ?? ''}
            ref={textareaRef}
            disabled={!hasNote}
            wrap={isWordWrapEnabled ? 'soft' : 'off'}
            spellCheck={isSpellCheckEnabled}
            onChange={(event) => onChangeNoteContent(event.target.value)}
          />
        </div>
        {isStatusBarVisible && (
          <div className="flex items-center justify-start border-t border-[#d9dee5] px-3 text-sm text-[#3d66f8] md:px-4">
            <span>{`Characters: ${characterCount}`}</span>
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

      {actionToastMessage && (
        <div className="pointer-events-none fixed bottom-7 left-1/2 z-[70] -translate-x-1/2 rounded bg-[#343536] px-12 py-3 text-[15px] text-[#f5f6f8] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
          {actionToastMessage}
        </div>
      )}
    </>
  )
}
