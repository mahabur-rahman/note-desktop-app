import { FiEdit2, FiSearch } from 'react-icons/fi'
import { NoteItem } from '../../types/notes'

interface NotesListPanelProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  notes: NoteItem[]
  activeNoteId: string
  onNoteSelect: (noteId: string) => void
}

export function NotesListPanel({
  searchQuery,
  onSearchQueryChange,
  notes,
  activeNoteId,
  onNoteSelect
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
        <button type="button">
          <FiEdit2 aria-hidden />
          <span>Edit</span>
        </button>
      </div>

      <div className="notes-scroll">
        {notes.map((note) => (
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
        ))}
      </div>
    </section>
  )
}
