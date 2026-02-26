export interface NoteVersionRecord {
  id: string
  title: string
  content: string
  savedAt: number
}

export interface NoteSummary {
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

export type SidebarViewMode = 'compact' | 'detailed'
export type SidebarSortMode = 'alphabetical' | 'creation-date' | 'last-modified'

export interface EditorFontSettings {
  fontFamily: string
  fontSize: number
  fontWeight: 400 | 700
  fontStyle: 'normal' | 'italic'
  lineHeight: 1 | 1.15 | 1.5 | 2
}

export type AppTheme = 'light' | 'sepia' | 'dark'
