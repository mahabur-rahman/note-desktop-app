import { ElectronAPI } from '@electron-toolkit/preload'

interface NoteSummary {
  id: string
  title: string
  excerpt: string
  content: string
  relativeTime: string
}

interface NoteUpdateInput {
  id: string
  title: string
  content: string
}

interface DesktopApi {
  notes: {
    list: () => Promise<NoteSummary[]>
    create: () => Promise<NoteSummary>
    update: (payload: NoteUpdateInput) => Promise<NoteSummary | null>
    delete: (noteId: string) => Promise<boolean>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DesktopApi
  }
}
