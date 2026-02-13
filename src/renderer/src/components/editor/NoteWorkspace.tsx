import { useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { BiBold, BiItalic, BiStrikethrough, BiUnderline } from 'react-icons/bi'
import { FiChevronLeft, FiCode, FiDownload, FiImage, FiLink2, FiList, FiMaximize2, FiSave, FiShare2, FiTrash2 } from 'react-icons/fi'
import { MdFormatListNumbered, MdHistory } from 'react-icons/md'
import { EditorViewMode, NoteItem } from '../../types/notes'

interface NoteWorkspaceProps {
  note: NoteItem | null
  mode: EditorViewMode
  isDirty: boolean
  lastSavedAt: string | null
  onModeChange: (mode: EditorViewMode) => void
  onTitleChange: (value: string) => void
  onContentChange: (value: string) => void
  onSave: () => void
  onDeleteNote: () => void
}

interface SelectionRange {
  start: number
  end: number
}

export function NoteWorkspace({
  note,
  mode,
  isDirty,
  lastSavedAt,
  onModeChange,
  onTitleChange,
  onContentChange,
  onSave,
  onDeleteNote
}: NoteWorkspaceProps): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const editorRootRef = useRef<HTMLElement | null>(null)
  const selectionRef = useRef<SelectionRange>({ start: 0, end: 0 })

  if (!note) {
    return <section className="column-editor empty-state">Select a note to continue.</section>
  }

  const updateWithSelection = (nextValue: string, nextSelectionStart: number, nextSelectionEnd: number): void => {
    selectionRef.current = { start: nextSelectionStart, end: nextSelectionEnd }
    onContentChange(nextValue)
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd)
    })
  }

  const rememberSelection = (): void => {
    const textarea = textareaRef.current
    if (!textarea) return
    selectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    }
  }

  const getSelectionSnapshot = (): { content: string; start: number; end: number } | null => {
    const textarea = textareaRef.current
    if (!textarea) return null

    const rawStart =
      document.activeElement === textarea ? textarea.selectionStart : selectionRef.current.start
    const rawEnd = document.activeElement === textarea ? textarea.selectionEnd : selectionRef.current.end
    const start = Math.max(0, Math.min(rawStart, textarea.value.length))
    const end = Math.max(0, Math.min(rawEnd, textarea.value.length))

    return { content: textarea.value, start, end }
  }

  const keepEditorFocus = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
  }

  const runEditorAction = (action: () => void): void => {
    if (mode !== 'edit') {
      onModeChange('edit')
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const textarea = textareaRef.current
          if (!textarea) return
          const { start, end } = selectionRef.current
          textarea.focus()
          textarea.setSelectionRange(start, end)
          action()
        })
      )
      return
    }
    action()
  }

  const wrapSelection = (prefix: string, suffix = prefix, placeholder = 'text'): void => {
    runEditorAction(() => {
      const snapshot = getSelectionSnapshot()
      if (!snapshot) return
      const { content, start, end } = snapshot
      const selectedText = content.slice(start, end) || placeholder
      const nextValue = `${content.slice(0, start)}${prefix}${selectedText}${suffix}${content.slice(end)}`
      const nextStart = start + prefix.length
      const nextEnd = nextStart + selectedText.length

      updateWithSelection(nextValue, nextStart, nextEnd)
    })
  }

  const applyLinePrefix = (prefixBuilder: (index: number) => string): void => {
    runEditorAction(() => {
      const snapshot = getSelectionSnapshot()
      if (!snapshot) return
      const { content, start, end } = snapshot

      const blockStart = content.lastIndexOf('\n', Math.max(start - 1, 0)) + 1
      const blockEndIndex = content.indexOf('\n', end)
      const blockEnd = blockEndIndex === -1 ? content.length : blockEndIndex

      const block = content.slice(blockStart, blockEnd)
      const lines = block.split('\n')
      const transformedBlock = lines
        .map((line, index) => {
          if (line.trim().length === 0) return line
          return `${prefixBuilder(index)}${line}`
        })
        .join('\n')

      const nextValue = `${content.slice(0, blockStart)}${transformedBlock}${content.slice(blockEnd)}`
      updateWithSelection(nextValue, blockStart, blockStart + transformedBlock.length)
    })
  }

  const applyCodeBlock = (): void => {
    runEditorAction(() => {
      const snapshot = getSelectionSnapshot()
      if (!snapshot) return
      const { content, start, end } = snapshot
      const selectedText = content.slice(start, end) || 'code'
      const block = `\`\`\`\n${selectedText}\n\`\`\``
      const nextValue = `${content.slice(0, start)}${block}${content.slice(end)}`

      updateWithSelection(nextValue, start + 4, start + 4 + selectedText.length)
    })
  }

  const insertImage = (): void => {
    runEditorAction(() => {
      const snapshot = getSelectionSnapshot()
      if (!snapshot) return
      const { content, start, end } = snapshot
      const altText = content.slice(start, end) || 'image description'
      const token = `![${altText}](https://example.com/image.jpg)`
      const nextValue = `${content.slice(0, start)}${token}${content.slice(end)}`
      const altStart = start + 2

      updateWithSelection(nextValue, altStart, altStart + altText.length)
    })
  }

  const insertLink = (): void => {
    runEditorAction(() => {
      const snapshot = getSelectionSnapshot()
      if (!snapshot) return
      const { content, start, end } = snapshot
      const linkText = content.slice(start, end) || 'link text'
      const token = `[${linkText}](https://example.com)`
      const nextValue = `${content.slice(0, start)}${token}${content.slice(end)}`
      const linkStart = start + 1

      updateWithSelection(nextValue, linkStart, linkStart + linkText.length)
    })
  }

  const toggleFullscreen = (): void => {
    const root = editorRootRef.current
    if (!root) return

    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void root.requestFullscreen()
    }
  }

  return (
    <section ref={editorRootRef} className="column-editor">
      <header className="editor-head">
        <input
          value={note.title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="editor-title"
        />
        <div className="editor-head-actions">
          <div className="mode-toggle">
            <button
              type="button"
              className={mode === 'edit' ? 'mode-btn mode-btn-active' : 'mode-btn'}
              onClick={() => onModeChange('edit')}
            >
              Edit
            </button>
            <button
              type="button"
              className={mode === 'preview' ? 'mode-btn mode-btn-active' : 'mode-btn'}
              onClick={() => onModeChange('preview')}
            >
              Preview
            </button>
          </div>
          <div className="mode-quick-tools">
            <button type="button" className="mode-icon-btn" aria-label="Back to preview" onClick={() => onModeChange('preview')}>
              <FiChevronLeft aria-hidden />
            </button>
            <button type="button" className="mode-icon-btn" aria-label="Expand editor" onClick={toggleFullscreen}>
              <FiMaximize2 aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div className="editor-toolbar">
        <button type="button" title="Bold" onMouseDown={keepEditorFocus} onClick={() => wrapSelection('**')}>
          <BiBold aria-hidden />
        </button>
        <button type="button" title="Italic" onMouseDown={keepEditorFocus} onClick={() => wrapSelection('*')}>
          <BiItalic aria-hidden />
        </button>
        <button
          type="button"
          title="Underline"
          onMouseDown={keepEditorFocus}
          onClick={() => wrapSelection('<u>', '</u>')}
        >
          <BiUnderline aria-hidden />
        </button>
        <button type="button" title="Strike" onMouseDown={keepEditorFocus} onClick={() => wrapSelection('~~')}>
          <BiStrikethrough aria-hidden />
        </button>
        <button
          type="button"
          title="Bullet list"
          onMouseDown={keepEditorFocus}
          onClick={() => applyLinePrefix(() => '- ')}
        >
          <FiList aria-hidden />
        </button>
        <button
          type="button"
          title="Numbered list"
          onMouseDown={keepEditorFocus}
          onClick={() => applyLinePrefix((index) => `${index + 1}. `)}
        >
          <MdFormatListNumbered aria-hidden />
        </button>
        <button type="button" title="Code block" onMouseDown={keepEditorFocus} onClick={applyCodeBlock}>
          <FiCode aria-hidden />
        </button>
        <button type="button" title="Insert image" onMouseDown={keepEditorFocus} onClick={insertImage}>
          <FiImage aria-hidden />
        </button>
        <button type="button" title="Insert link" onMouseDown={keepEditorFocus} onClick={insertLink}>
          <FiLink2 aria-hidden />
        </button>
      </div>

      {mode === 'edit' ? (
        <textarea
          ref={textareaRef}
          className="editor-textarea-v2"
          value={note.content}
          onChange={(event) => onContentChange(event.target.value)}
          onClick={rememberSelection}
          onKeyUp={rememberSelection}
          onSelect={rememberSelection}
          onBlur={rememberSelection}
        />
      ) : (
        <article className="preview-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {note.content}
          </ReactMarkdown>
        </article>
      )}

      <footer className="editor-footer">
        <div className="attachment">
          <span className="attachment-label">Attachment: report.pdf</span>
          <span className={isDirty ? 'save-status save-status-dirty' : 'save-status'}>
            {isDirty ? 'Unsaved changes' : lastSavedAt ? `Saved at ${lastSavedAt}` : 'Saved'}
          </span>
        </div>
        <div className="footer-actions">
          <button type="button" className="footer-btn-primary" onClick={onSave}>
            <FiSave aria-hidden />
            <span>Save</span>
          </button>
          <button type="button">
            <MdHistory aria-hidden />
            <span>Version History</span>
          </button>
          <button type="button">
            <FiDownload aria-hidden />
            <span>Export PDF</span>
          </button>
          <button type="button" className="footer-btn-danger" onClick={onDeleteNote}>
            <FiTrash2 aria-hidden />
            <span>Delete</span>
          </button>
          <button type="button">
            <FiShare2 aria-hidden />
            <span>Share</span>
          </button>
        </div>
      </footer>
    </section>
  )
}
