export interface NoteSummary {
  id: string
  title: string
  excerpt: string
  content: string
  relativeTime: string
  createdAt: number
  updatedAt: number
}

export type SidebarViewMode = 'compact' | 'detailed'
export type SidebarSortMode = 'alphabetical' | 'creation-date' | 'last-modified'
