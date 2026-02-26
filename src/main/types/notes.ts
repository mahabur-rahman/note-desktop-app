export interface NoteVersionRecord {
  id: string
  title: string
  content: string
  savedAt: number
}

export interface NoteRecord {
  id: string
  title: string
  excerpt: string
  content: string
  relativeTime: string
  createdAt: number
  updatedAt: number
  folder: string
  tags: string[]
  isPinned: boolean
  isDeleted: boolean
  deletedAt: number | null
  versions: NoteVersionRecord[]
}

export type NoteInsertRecord = NoteRecord

export interface NoteUpdatePayload {
  id: string
  title: string
  content: string
  folder: string
  tags: string[]
  isPinned: boolean
  isDeleted: boolean
  deletedAt: number | null
  versions: NoteVersionRecord[]
}

export type NotesBackupRecord = NoteRecord

export interface NotesBackupResult {
  path: string
  count: number
}
