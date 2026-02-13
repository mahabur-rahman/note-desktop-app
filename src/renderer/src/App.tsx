import { useCallback, useEffect, useMemo, useState } from 'react'
import { nanoid } from 'nanoid'
import { fakeNotes, notebooks, tags } from './data/fakeData'
import { NoteWorkspace } from './components/editor/NoteWorkspace'
import { AppChrome } from './components/layout/AppChrome'
import { NotesListPanel } from './components/notes/NotesListPanel'
import { NavigationSidebar } from './components/sidebar/NavigationSidebar'
import { EditorViewMode, NoteItem, SyncState, ThemeMode } from './types/notes'

const isSystemNotebook = (id: string): boolean => ['all-notes', 'favorites'].includes(id)
const NOTES_STORAGE_KEY = 'desk-note-notes-v1'
const formatUpdatedAt = (): string =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short'
  }).format(new Date())

const buildExcerpt = (content: string): string =>
  content
    .replaceAll('#', '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'Empty note'

const getCreateNotebookId = (activeNotebookId: string): string => {
  if (activeNotebookId === 'all-notes' || activeNotebookId === 'favorites' || activeNotebookId === 'trash') {
    return 'personal'
  }
  return activeNotebookId
}

const createNote = (notebookId: string, favorite: boolean): NoteItem => ({
  id: `note-${nanoid(10)}`,
  title: 'Untitled note',
  excerpt: 'Start writing your note...',
  content: '# Untitled note\n\n',
  updatedAt: formatUpdatedAt(),
  notebookId,
  tagIds: [],
  favorite
})

const isNoteItem = (value: unknown): value is NoteItem => {
  if (!value || typeof value !== 'object') return false
  const note = value as Partial<NoteItem>
  return (
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.excerpt === 'string' &&
    typeof note.content === 'string' &&
    typeof note.updatedAt === 'string' &&
    typeof note.notebookId === 'string' &&
    Array.isArray(note.tagIds) &&
    typeof note.favorite === 'boolean'
  )
}

const loadInitialNotes = (): NoteItem[] => {
  if (typeof window === 'undefined') return fakeNotes

  try {
    const raw = window.localStorage.getItem(NOTES_STORAGE_KEY)
    if (!raw) return fakeNotes

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return fakeNotes

    const validNotes = parsed.filter(isNoteItem)
    return validNotes.length > 0 ? validNotes : fakeNotes
  } catch {
    return fakeNotes
  }
}

function App(): React.JSX.Element {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [syncState] = useState<SyncState>('synced')
  const [activeNotebookId, setActiveNotebookId] = useState<string>('all-notes')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [notes, setNotes] = useState<NoteItem[]>(() => loadInitialNotes())
  const [activeNoteId, setActiveNoteId] = useState<string>('')
  const [editorMode, setEditorMode] = useState<EditorViewMode>('edit')
  const [isDirty, setIsDirty] = useState<boolean>(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

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

  useEffect(() => {
    if (visibleNotes.length === 0) {
      if (activeNoteId) setActiveNoteId('')
      return
    }

    if (!activeNoteId) {
      setActiveNoteId(visibleNotes[0].id)
      return
    }

    const hasActive = visibleNotes.some((note) => note.id === activeNoteId)
    if (!hasActive) {
      setActiveNoteId(visibleNotes[0].id)
    }
  }, [activeNoteId, visibleNotes])

  const updateActiveTitle = (nextTitle: string): void => {
    if (!activeNote) return
    if (activeNote.title === nextTitle) return
    setIsDirty(true)
    setNotes((prev) =>
      prev.map((note) =>
        note.id === activeNote.id
          ? {
              ...note,
              title: nextTitle || 'Untitled note',
              updatedAt: formatUpdatedAt()
            }
          : note
      )
    )
  }

  const updateActiveContent = (nextContent: string): void => {
    if (!activeNote) return
    if (activeNote.content === nextContent) return
    setIsDirty(true)
    const nextExcerpt = buildExcerpt(nextContent)

    setNotes((prev) =>
      prev.map((note) =>
        note.id === activeNote.id
          ? { ...note, content: nextContent, excerpt: nextExcerpt, updatedAt: formatUpdatedAt() }
          : note
      )
    )
  }

  const handleCreateNote = (): void => {
    const notebookId = getCreateNotebookId(activeNotebookId)
    const nextNote = createNote(notebookId, activeNotebookId === 'favorites')

    setNotes((prev) => [nextNote, ...prev])
    setActiveNoteId(nextNote.id)
    setEditorMode('edit')
    setIsDirty(true)

    if (activeNotebookId === 'trash') {
      setActiveNotebookId('all-notes')
    }
  }

  const handleDeleteActiveNote = (): void => {
    if (!activeNote) return
    const confirmed = window.confirm(`Delete "${activeNote.title}"?`)
    if (!confirmed) return

    setNotes((prev) => prev.filter((note) => note.id !== activeNote.id))
    setActiveNoteId('')
    setIsDirty(true)
  }

  const saveNotes = useCallback((): void => {
    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
      setIsDirty(false)
      setLastSavedAt(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      )
    } catch (error) {
      console.error('Failed to save notes', error)
    }
  }, [notes])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveNotes()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [saveNotes])

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
        onCreateNote={handleCreateNote}
      />

      <NoteWorkspace
        note={activeNote}
        mode={editorMode}
        isDirty={isDirty}
        lastSavedAt={lastSavedAt}
        onModeChange={setEditorMode}
        onTitleChange={updateActiveTitle}
        onContentChange={updateActiveContent}
        onSave={saveNotes}
        onDeleteNote={handleDeleteActiveNote}
      />
    </AppChrome>
  )
}

export default App
