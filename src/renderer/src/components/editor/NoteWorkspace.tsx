import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef } from 'react'
import { BiBold, BiItalic, BiStrikethrough, BiUnderline } from 'react-icons/bi'
import {
  FiChevronLeft,
  FiCode,
  FiDownload,
  FiImage,
  FiLink2,
  FiList,
  FiMaximize2,
  FiSave,
  FiShare2,
  FiTrash2
} from 'react-icons/fi'
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
  const editorRootRef = useRef<HTMLElement | null>(null)
  const onContentChangeRef = useRef(onContentChange)

  useEffect(() => {
    onContentChangeRef.current = onContentChange
  }, [onContentChange])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: true
      }),
      Image.configure({
        allowBase64: true,
        inline: false
      })
    ],
    content: note?.content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'tiptap-input'
      }
    },
    onUpdate: ({ editor: activeEditor }) => {
      onContentChangeRef.current(activeEditor.getHTML())
    }
  })

  useEffect(() => {
    if (!editor || !note) return
    if (editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || '<p></p>', { emitUpdate: false })
    }
  }, [editor, note])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(mode === 'edit')
  }, [editor, mode])

  if (!note) {
    return <section className="column-editor empty-state">Select a note to continue.</section>
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

  const withEditor = (runner: (activeEditor: Editor) => void): void => {
    if (!editor) return
    if (mode !== 'edit') {
      onModeChange('edit')
      requestAnimationFrame(() => {
        runner(editor)
      })
      return
    }
    runner(editor)
  }

  const setLink = (): void => {
    withEditor((activeEditor) => {
      const previousHref = activeEditor.getAttributes('link').href as string | undefined
      const url = window.prompt('Enter URL', previousHref ?? 'https://')
      if (url === null) return
      if (url.trim().length === 0) {
        activeEditor.chain().focus().unsetLink().run()
        return
      }
      activeEditor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
    })
  }

  const setImage = (): void => {
    withEditor((activeEditor) => {
      const url = window.prompt('Image URL', 'https://')
      if (!url || url.trim().length === 0) return
      activeEditor.chain().focus().setImage({ src: url.trim() }).run()
    })
  }

  const isReadonly = mode !== 'edit'

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
            <button
              type="button"
              className="mode-icon-btn"
              aria-label="Back to preview"
              onClick={() => onModeChange('preview')}
            >
              <FiChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              className="mode-icon-btn"
              aria-label="Expand editor"
              onClick={toggleFullscreen}
            >
              <FiMaximize2 aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div className="editor-toolbar">
        <button
          type="button"
          title="Bold"
          disabled={isReadonly}
          onClick={() => withEditor((activeEditor) => activeEditor.chain().focus().toggleBold().run())}
        >
          <BiBold aria-hidden />
        </button>
        <button
          type="button"
          title="Italic"
          disabled={isReadonly}
          onClick={() => withEditor((activeEditor) => activeEditor.chain().focus().toggleItalic().run())}
        >
          <BiItalic aria-hidden />
        </button>
        <button
          type="button"
          title="Underline"
          disabled={isReadonly}
          onClick={() => withEditor((activeEditor) => activeEditor.chain().focus().toggleUnderline().run())}
        >
          <BiUnderline aria-hidden />
        </button>
        <button
          type="button"
          title="Strike"
          disabled={isReadonly}
          onClick={() => withEditor((activeEditor) => activeEditor.chain().focus().toggleStrike().run())}
        >
          <BiStrikethrough aria-hidden />
        </button>
        <button
          type="button"
          title="Bullet list"
          disabled={isReadonly}
          onClick={() => withEditor((activeEditor) => activeEditor.chain().focus().toggleBulletList().run())}
        >
          <FiList aria-hidden />
        </button>
        <button
          type="button"
          title="Numbered list"
          disabled={isReadonly}
          onClick={() => withEditor((activeEditor) => activeEditor.chain().focus().toggleOrderedList().run())}
        >
          <MdFormatListNumbered aria-hidden />
        </button>
        <button
          type="button"
          title="Code block"
          disabled={isReadonly}
          onClick={() => withEditor((activeEditor) => activeEditor.chain().focus().toggleCodeBlock().run())}
        >
          <FiCode aria-hidden />
        </button>
        <button type="button" title="Insert image" disabled={isReadonly} onClick={setImage}>
          <FiImage aria-hidden />
        </button>
        <button type="button" title="Insert link" disabled={isReadonly} onClick={setLink}>
          <FiLink2 aria-hidden />
        </button>
      </div>

      <div className={`tiptap-shell ${isReadonly ? 'tiptap-shell-readonly' : ''}`}>
        <EditorContent editor={editor} />
      </div>

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
