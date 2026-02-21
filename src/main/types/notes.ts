export interface NoteRecord {
  id: string
  title: string
  excerpt: string
  content: string
  relativeTime: string
  createdAt: number
  updatedAt: number
}

export type NoteInsertRecord = NoteRecord

export interface NoteUpdatePayload {
  id: string
  title: string
  content: string
}

export type NotesBackupRecord = NoteRecord

export interface NotesBackupResult {
  path: string
  count: number
}
