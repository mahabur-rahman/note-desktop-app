import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { BiBold, BiItalic, BiStrikethrough, BiUnderline } from 'react-icons/bi'
import { FiChevronLeft, FiCode, FiDownload, FiImage, FiLink2, FiList, FiMaximize2, FiRotateCcw, FiShare2 } from 'react-icons/fi'
import { MdFormatListNumbered, MdHistory } from 'react-icons/md'
import { EditorViewMode, NoteItem } from '../../types/notes'

interface NoteWorkspaceProps {
  note: NoteItem | null
  mode: EditorViewMode
  onModeChange: (mode: EditorViewMode) => void
  onTitleChange: (value: string) => void
  onContentChange: (value: string) => void
}

export function NoteWorkspace({
  note,
  mode,
  onModeChange,
  onTitleChange,
  onContentChange
}: NoteWorkspaceProps): React.JSX.Element {
  if (!note) {
    return <section className="column-editor empty-state">Select a note to continue.</section>
  }

  return (
    <section className="column-editor">
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
            <button type="button" className="mode-icon-btn" aria-label="Back">
              <FiChevronLeft aria-hidden />
            </button>
            <button type="button" className="mode-icon-btn" aria-label="Expand">
              <FiMaximize2 aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div className="editor-toolbar">
        <button type="button" title="Bold">
          <BiBold aria-hidden />
        </button>
        <button type="button" title="Italic">
          <BiItalic aria-hidden />
        </button>
        <button type="button" title="Underline">
          <BiUnderline aria-hidden />
        </button>
        <button type="button" title="Strike">
          <BiStrikethrough aria-hidden />
        </button>
        <button type="button" title="Bullet list">
          <FiList aria-hidden />
        </button>
        <button type="button" title="Numbered list">
          <MdFormatListNumbered aria-hidden />
        </button>
        <button type="button" title="Code block">
          <FiCode aria-hidden />
        </button>
        <button type="button" title="Insert image">
          <FiImage aria-hidden />
        </button>
        <button type="button" title="Insert link">
          <FiLink2 aria-hidden />
        </button>
      </div>

      {mode === 'edit' ? (
        <textarea
          className="editor-textarea-v2"
          value={note.content}
          onChange={(event) => onContentChange(event.target.value)}
        />
      ) : (
        <article className="preview-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {note.content}
          </ReactMarkdown>
        </article>
      )}

      <footer className="editor-footer">
        <div className="attachment">Attachment: report.pdf</div>
        <div className="footer-actions">
          <button type="button">
            <MdHistory aria-hidden />
            <span>Version History</span>
          </button>
          <button type="button">
            <FiDownload aria-hidden />
            <span>Export PDF</span>
          </button>
          <button type="button">
            <FiRotateCcw aria-hidden />
            <span>Reset</span>
          </button>
          <button type="button" className="footer-btn-primary">
            <FiShare2 aria-hidden />
            <span>Share</span>
          </button>
        </div>
      </footer>
    </section>
  )
}
