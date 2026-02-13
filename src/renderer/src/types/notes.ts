export type ThemeMode = 'dark' | 'light'

export type SyncState = 'synced' | 'syncing' | 'offline'

export type EditorViewMode = 'edit' | 'preview'

export interface Notebook {
  id: string
  label: string
  icon: string
}

export interface NoteTag {
  id: string
  label: string
  color: string
}

export interface NoteItem {
  id: string
  title: string
  excerpt: string
  content: string
  updatedAt: string
  notebookId: string
  tagIds: string[]
  favorite: boolean
}

