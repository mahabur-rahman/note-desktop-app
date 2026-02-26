import { ElectronAPI } from '@electron-toolkit/preload'

interface NoteSummary {
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
  versions: Array<{
    id: string
    title: string
    content: string
    savedAt: number
  }>
}

interface NoteUpdateInput {
  id: string
  title: string
  content: string
  folder: string
  tags: string[]
  isPinned: boolean
  isDeleted: boolean
  deletedAt: number | null
  versions: Array<{
    id: string
    title: string
    content: string
    savedAt: number
  }>
}

interface NotesBackupResult {
  path: string
  count: number
}

interface DesktopApi {
  notes: {
    list: () => Promise<NoteSummary[]>
    create: () => Promise<NoteSummary>
    update: (payload: NoteUpdateInput) => Promise<NoteSummary | null>
    delete: (noteId: string) => Promise<boolean>
    clear: () => Promise<number>
    backup: () => Promise<NotesBackupResult>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DesktopApi
  }
}
