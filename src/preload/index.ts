import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

const api = {
  notes: {
    list: () => ipcRenderer.invoke('notes:list') as Promise<NoteSummary[]>,
    create: () => ipcRenderer.invoke('notes:create') as Promise<NoteSummary>,
    update: (payload: NoteUpdateInput) =>
      ipcRenderer.invoke('notes:update', payload) as Promise<NoteSummary | null>,
    delete: (noteId: string) => ipcRenderer.invoke('notes:delete', noteId) as Promise<boolean>,
    clear: () => ipcRenderer.invoke('notes:clear') as Promise<number>,
    backup: () => ipcRenderer.invoke('notes:backup') as Promise<NotesBackupResult>
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
