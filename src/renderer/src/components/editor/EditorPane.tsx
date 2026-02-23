import { useRef, useState } from 'react'
import type { EditorFontSettings } from '../../types/ui'
import { EmojisModal } from './EmojisModal'
import { FindReplaceModal, type FindReplacePayload } from './FindReplaceModal'
import { FontSettingsModal } from './FontSettingsModal'
import { NoteTitleRow } from './NoteTitleRow'
import { SpecialCharactersModal } from './SpecialCharactersModal'
import { TopMenu } from './TopMenu'

interface EditorPaneProps {
  menuItems: readonly string[]
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
  const [isSpecialCharactersOpen, setIsSpecialCharactersOpen] = useState(false)
  const [isEmojisOpen, setIsEmojisOpen] = useState(false)
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false)

  const focusTextarea = (): HTMLTextAreaElement | null => {
    const textarea = textareaRef.current
    if (!textarea) return null
    textarea.focus()
    return textarea
  }

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
    if (!focusTextarea()) return
    if (typeof document.execCommand === 'function') {
      document.execCommand('undo')
    }
  }

  const handleRedo = (): void => {
    if (!hasNote) return
    if (!focusTextarea()) return
    if (typeof document.execCommand === 'function') {
      document.execCommand('redo')
    }
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

    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(selectedText).catch(() => {
        // Ignore clipboard permission failures.
      })
    }
  }

  const handleDeleteSelection = (): void => {
    if (!hasNote) return

    const textarea = focusTextarea()
    if (!textarea) return
    const currentContent = noteContent ?? ''
    const { normalizedStart, normalizedEnd } = getSelectionRange(textarea, currentContent)

    let nextContent = currentContent
    let nextCursorPosition = normalizedStart

    if (normalizedStart !== normalizedEnd) {
      nextContent = currentContent.slice(0, normalizedStart) + currentContent.slice(normalizedEnd)
    } else if (normalizedStart < currentContent.length) {
      nextContent = currentContent.slice(0, normalizedStart) + currentContent.slice(normalizedStart + 1)
    } else {
      return
    }

    onChangeNoteContent(nextContent)
    window.requestAnimationFrame(() => {
      const target = textareaRef.current
      if (!target) return
      target.focus()
      target.setSelectionRange(nextCursorPosition, nextCursorPosition)
    })
  }

  const handleCut = (): void => {
    if (!hasNote) return

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
    textarea.setSelectionRange(0, currentContent.length)
  }

  const handleOpenFindReplace = (): void => {
    if (!hasNote) return
    setIsFindReplaceOpen(true)
  }

  const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const handleFindReplace = ({ findText, replaceText, matchCase, wholeWords }: FindReplacePayload): void => {
    if (!hasNote) return

    const normalizedFindText = findText.trim()
    if (!normalizedFindText) return

    const currentContent = noteContent ?? ''
    const escapedFindText = escapeRegExp(normalizedFindText)
    const pattern = wholeWords ? `\\b${escapedFindText}\\b` : escapedFindText
    const flags = matchCase ? 'g' : 'gi'
    const replaceRegex = new RegExp(pattern, flags)
    const matches = currentContent.match(replaceRegex)

    if (!matches || matches.length === 0) return

    const nextContent = currentContent.replace(replaceRegex, replaceText)
    onChangeNoteContent(nextContent)
    window.requestAnimationFrame(() => {
      const target = textareaRef.current
      if (!target) return
      target.focus()
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
    </>
  )
}
