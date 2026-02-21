import type { NoteSummary } from '../types/ui'

export const APP_TITLE = 'ONLINE NOTEPAD'

export const MENU_ITEMS = ['File', 'Edit', 'Insert', 'Format', 'Tools', 'View', 'Help'] as const

export const INITIAL_NOTES: NoteSummary[] = [
  {
    id: 'note-1',
    title: 'Untitled Note',
    excerpt: 'Blank',
    relativeTime: 'just now'
  }
]
