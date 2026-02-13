import { NoteItem, Notebook, NoteTag } from '../types/notes'

export const notebooks: Notebook[] = [
  { id: 'all-notes', label: 'All Notes', icon: 'all' },
  { id: 'favorites', label: 'Favorites', icon: 'fav' },
  { id: 'work', label: 'Work', icon: 'work' },
  { id: 'personal', label: 'Personal', icon: 'pers' },
  { id: 'project-ideas', label: 'Project Ideas', icon: 'idea' },
  { id: 'archive', label: 'Archive', icon: 'arch' },
  { id: 'trash', label: 'Trash', icon: 'trash' }
]

export const tags: NoteTag[] = [
  { id: 'meeting', label: 'meeting', color: '#f4b84a' },
  { id: 'tech', label: 'tech', color: '#66d68e' },
  { id: 'todo', label: 'todo', color: '#7c879f' },
  { id: 'travel', label: 'travel', color: '#6fb6ff' }
]

export const fakeNotes: NoteItem[] = [
  {
    id: 'note-meeting',
    title: 'Meeting Notes',
    excerpt: 'Learn the basics of Markdown syntax and formatting.',
    content: `# Meeting Notes

## Weekly goals
- Finalize desktop navigation flow
- Move fake data to DB adapter
- Add autosave indicator

### Action points
1. Finish editor toolbar interactions
2. Prepare import/export action sheet
3. Add keyboard shortcuts list`,
    updatedAt: '11 Feb',
    notebookId: 'work',
    tagIds: ['meeting', 'todo'],
    favorite: true
  },
  {
    id: 'note-guide',
    title: 'Markdown Guide',
    excerpt: 'Learn more markdown and formatting.',
    content: `# Markdown Guide

Learn the basics of Markdown syntax and formatting.

## Basic Syntax
- **Bold Text**
- _Italic Text_
- Bullet lists
1. Numbered lists
- \`Inline code\`
- Code block

### Image & Link
![Mountain](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80)

[OpenAI Website](https://openai.com)`,
    updatedAt: '04 Jan',
    notebookId: 'project-ideas',
    tagIds: ['tech'],
    favorite: false
  },
  {
    id: 'note-roadmap',
    title: 'Project Roadmap',
    excerpt: 'Update sprint goals and actions for release.',
    content: `# Project Roadmap

## Q1 Focus
- Notes list virtualization
- Markdown export pipeline
- Search ranking improvements

## Metrics
- App launch under 2s
- Save latency under 100ms`,
    updatedAt: '02 Jan',
    notebookId: 'work',
    tagIds: ['tech', 'todo'],
    favorite: false
  },
  {
    id: 'note-diary',
    title: 'Daily Journal',
    excerpt: 'This is the morning update from today.',
    content: `# Daily Journal

Today was focused on UI architecture.

- Split layout into reusable components
- Added strict TypeScript models
- Prepared fake data layer before DB integration`,
    updatedAt: '21 Jan',
    notebookId: 'personal',
    tagIds: ['travel'],
    favorite: false
  }
]

