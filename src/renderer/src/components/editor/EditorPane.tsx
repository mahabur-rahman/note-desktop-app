import { useRef, useState } from 'react'
import type { EditorFontSettings } from '../../types/ui'
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
    </>
  )
}
