import { FiAlignLeft, FiMoreVertical, FiPlus, FiSearch } from 'react-icons/fi'
import type { NoteSummary } from '../../types/ui'
import { IconButton } from '../common/IconButton'

interface NotesSidebarProps {
  notes: NoteSummary[]
  activeNoteId: string
  onCreateNote: () => void
  onSelectNote: (noteId: string) => void
}

export function NotesSidebar({ notes, activeNoteId, onCreateNote, onSelectNote }: NotesSidebarProps): React.JSX.Element {
  return (
    <aside className="flex h-full flex-col bg-[#f3f4f6]">
      <div className="border-b border-[#d9dee5]">
        <button
          className="mx-3 my-4 inline-flex h-[52px] w-[calc(100%_-_24px)] cursor-pointer items-center justify-center gap-2 rounded bg-[#5165f7] text-base font-normal text-white"
          type="button"
          onClick={onCreateNote}
        >
          <FiPlus className="text-lg" />
          <span>Create new</span>
        </button>

        <div className="relative border-y border-[#d9dee5] bg-[#f5f6f8]">
          <input
            className="h-14 w-full cursor-default border-0 bg-transparent px-4 pr-10 text-base text-[#7d828d] outline-none"
            aria-label="Search notes"
            placeholder="Search..."
            readOnly
          />
          <FiSearch className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-lg text-[#8b909a]" />
        </div>

        <div className="flex h-10 items-center justify-between border-b border-[#d9dee5] bg-[#f4f5f7] px-3">
          <IconButton
            ariaLabel="Filter notes"
            className="cursor-default bg-transparent p-0.5 text-lg text-[#646a75]"
          >
            <FiAlignLeft />
          </IconButton>
          <IconButton
            ariaLabel="More actions"
            className="cursor-default bg-transparent p-0.5 text-lg text-[#646a75]"
          >
            <FiMoreVertical />
          </IconButton>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="border-t border-[#d9dee5] p-4 text-[15px] text-[#3f4654]">No saved notes.</div>
      ) : (
        notes.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => onSelectNote(note.id)}
            className={[
              'w-full border-t border-[#d9dee5] p-4 text-left',
              note.id === activeNoteId ? 'bg-[#e6e7e9]' : 'bg-[#f3f4f6]'
            ].join(' ')}
          >
            <h3 className="m-0 text-lg leading-[1.2] font-bold text-[#2f3440]">{note.title || 'Untitled Note'}</h3>
            <p className="my-1 text-base text-[#444a56]">{note.excerpt}</p>
            <span className="text-[15px] text-[#4f5562]">{note.relativeTime}</span>
          </button>
        ))
      )}
    </aside>
  )
}
