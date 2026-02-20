import type { NoteSummary } from '../types/ui'

export const APP_TITLE = 'Online Notes'

export const MENU_ITEMS = ['File', 'Edit', 'Insert', 'Format', 'Tools', 'View', 'Help'] as const

export const ACTIVE_NOTE: NoteSummary = {
  title: 'Untitled Note',
  excerpt: 'Blank',
  relativeTime: 'just now'
}
