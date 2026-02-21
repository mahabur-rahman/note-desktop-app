export interface NoteRecord {
  id: string
  title: string
  excerpt: string
  content: string
  relativeTime: string
}

export interface NoteInsertRecord extends NoteRecord {
  createdAt: number
  updatedAt: number
}

export interface NoteUpdatePayload {
  id: string
  title: string
  content: string
}

export interface NotesBackupRecord extends NoteRecord {
  createdAt: number
  updatedAt: number
}

export interface NotesBackupResult {
  path: string
  count: number
}
