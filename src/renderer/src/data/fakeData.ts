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
    content: `<h1>Meeting Notes</h1>
<h2>Weekly goals</h2>
<ul>
  <li>Finalize desktop navigation flow</li>
  <li>Move fake data to DB adapter</li>
  <li>Add autosave indicator</li>
</ul>
<h3>Action points</h3>
<ol>
  <li>Finish editor toolbar interactions</li>
  <li>Prepare import/export action sheet</li>
  <li>Add keyboard shortcuts list</li>
</ol>`,
    updatedAt: '11 Feb',
    notebookId: 'work',
    tagIds: ['meeting', 'todo'],
    favorite: true
  },
  {
    id: 'note-guide',
    title: 'Markdown Guide',
    excerpt: 'Learn more markdown and formatting.',
    content: `<h1>Markdown Guide</h1>
<p>Learn the basics of rich text formatting.</p>
<h2>Basic Syntax</h2>
<ul>
  <li><strong>Bold Text</strong></li>
  <li><em>Italic Text</em></li>
  <li>Bullet lists</li>
</ul>
<ol>
  <li>Numbered lists</li>
</ol>
<p><code>Inline code</code></p>
<h3>Image &amp; Link</h3>
<p>
  <img src="https://media.istockphoto.com/id/486309106/photo/evening-view-of-ama-dablam.jpg?s=612x612&w=0&k=20&c=nYB9IkZRtIHbew5p1acHiZXjxuIFKkC9fuXMwGrhf2w=" alt="Mountain" />
</p>
<p><a href="https://openai.com">OpenAI Website</a></p>`,
    updatedAt: '04 Jan',
    notebookId: 'project-ideas',
    tagIds: ['tech'],
    favorite: false
  },
  {
    id: 'note-roadmap',
    title: 'Project Roadmap',
    excerpt: 'Update sprint goals and actions for release.',
    content: `<h1>Project Roadmap</h1>
<h2>Q1 Focus</h2>
<ul>
  <li>Notes list virtualization</li>
  <li>Export pipeline</li>
  <li>Search ranking improvements</li>
</ul>
<h2>Metrics</h2>
<ul>
  <li>App launch under 2s</li>
  <li>Save latency under 100ms</li>
</ul>`,
    updatedAt: '02 Jan',
    notebookId: 'work',
    tagIds: ['tech', 'todo'],
    favorite: false
  },
  {
    id: 'note-diary',
    title: 'Daily Journal',
    excerpt: 'This is the morning update from today.',
    content: `<h1>Daily Journal</h1>
<p>Today was focused on UI architecture.</p>
<ul>
  <li>Split layout into reusable components</li>
  <li>Added strict TypeScript models</li>
  <li>Prepared fake data layer before DB integration</li>
</ul>`,
    updatedAt: '21 Jan',
    notebookId: 'personal',
    tagIds: ['travel'],
    favorite: false
  }
]
