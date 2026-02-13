import { FiEdit2, FiSearch } from 'react-icons/fi'
import { NoteItem } from '../../types/notes'

interface NotesListPanelProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  notes: NoteItem[]
  activeNoteId: string
  onNoteSelect: (noteId: string) => void
  onCreateNote: () => void
}

export function NotesListPanel({
  searchQuery,
  onSearchQueryChange,
  notes,
  activeNoteId,
  onNoteSelect,
  onCreateNote
}: NotesListPanelProps): React.JSX.Element {
  return (
    <section className="column-list">
      <label className="search-wrap">
        <span className="search-icon">
          <FiSearch aria-hidden />
        </span>
        <input
          className="search-input"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />
      </label>

      <div className="recent-head">
        <h2>Recent Notes</h2>
        <button type="button" onClick={onCreateNote}>
          <FiEdit2 aria-hidden />
          <span>New</span>
        </button>
      </div>

      <div className="notes-scroll">
        {notes.length === 0 ? (
          <div className="notes-empty">
            <p>No notes found</p>
            <button type="button" onClick={onCreateNote}>
              Create note
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => onNoteSelect(note.id)}
              className={`recent-note ${note.id === activeNoteId ? 'recent-note-active' : ''}`}
            >
              <div className="recent-note-row">
                <strong>{note.title}</strong>
                <span>{note.updatedAt}</span>
              </div>
              <p>{note.excerpt}</p>
            </button>
          ))
        )}
      </div>
    </section>
  )
}
