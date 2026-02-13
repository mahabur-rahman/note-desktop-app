import { useMemo, useState } from 'react'
import { fakeNotes, notebooks, tags } from './data/fakeData'
import { NoteWorkspace } from './components/editor/NoteWorkspace'
import { AppChrome } from './components/layout/AppChrome'
import { NotesListPanel } from './components/notes/NotesListPanel'
import { NavigationSidebar } from './components/sidebar/NavigationSidebar'
import { EditorViewMode, NoteItem, SyncState, ThemeMode } from './types/notes'

const isSystemNotebook = (id: string): boolean => ['all-notes', 'favorites'].includes(id)

function App(): React.JSX.Element {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [syncState] = useState<SyncState>('synced')
  const [activeNotebookId, setActiveNotebookId] = useState<string>('all-notes')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [notes, setNotes] = useState<NoteItem[]>(fakeNotes)
  const [activeNoteId, setActiveNoteId] = useState<string>(fakeNotes[1]?.id ?? '')
  const [editorMode, setEditorMode] = useState<EditorViewMode>('preview')

  const visibleNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return notes.filter((note) => {
      const notebookMatch =
        activeNotebookId === 'all-notes'
          ? true
          : activeNotebookId === 'favorites'
            ? note.favorite
            : note.notebookId === activeNotebookId

      const text = `${note.title} ${note.excerpt} ${note.content}`.toLowerCase()
      const queryMatch = query.length === 0 ? true : text.includes(query)

      return notebookMatch && queryMatch
    })
  }, [activeNotebookId, notes, searchQuery])

  const activeNote = useMemo(
    () => visibleNotes.find((note) => note.id === activeNoteId) ?? visibleNotes[0] ?? null,
    [activeNoteId, visibleNotes]
  )

  const updateActiveTitle = (nextTitle: string): void => {
    if (!activeNote) return
    setNotes((prev) => prev.map((note) => (note.id === activeNote.id ? { ...note, title: nextTitle } : note)))
  }

  const updateActiveContent = (nextContent: string): void => {
    if (!activeNote) return
    const nextExcerpt =
      nextContent
        .replaceAll('#', '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80) || 'Empty note'

    setNotes((prev) =>
      prev.map((note) =>
        note.id === activeNote.id ? { ...note, content: nextContent, excerpt: nextExcerpt } : note
      )
    )
  }

  return (
    <AppChrome
      title="Notes & Markdown Desktop Application"
      mode={mode}
      syncState={syncState}
      onToggleMode={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
    >
      <NavigationSidebar
        notebooks={notebooks}
        tags={tags}
        activeNotebookId={activeNotebookId}
        onNotebookChange={(notebookId) => {
          setActiveNotebookId(notebookId)
          if (isSystemNotebook(notebookId)) return
          const firstNote = notes.find((note) => note.notebookId === notebookId)
          if (firstNote) setActiveNoteId(firstNote.id)
        }}
      />

      <NotesListPanel
        notes={visibleNotes}
        activeNoteId={activeNote?.id ?? ''}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onNoteSelect={setActiveNoteId}
      />

      <NoteWorkspace
        note={activeNote}
        mode={editorMode}
        onModeChange={setEditorMode}
        onTitleChange={updateActiveTitle}
        onContentChange={updateActiveContent}
      />
    </AppChrome>
  )
}

export default App

