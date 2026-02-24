import type { App } from 'electron'
import Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import type {
  NoteInsertRecord,
  NoteRecord,
  NotesBackupRecord,
  NoteUpdatePayload
} from '../types/notes'

function buildExcerpt(content: string): string {
  const normalizedContent = content.replace(/\s+/g, ' ').trim()
  if (!normalizedContent) return 'Blank'
  return normalizedContent.slice(0, 72)
}

export interface NotesDatabase {
  listNotes: () => NoteRecord[]
  createNote: () => NoteRecord
  updateNote: (payload: NoteUpdatePayload) => NoteRecord | null
  deleteNote: (noteId: string) => boolean
  clearNotes: () => number
  listNotesForBackup: () => NotesBackupRecord[]
}

export function openNotesDatabase(app: App): NotesDatabase {
  const dbPath = join(app.getPath('userData'), 'notes.sqlite3')
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      relative_time TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  const tableColumns = db.prepare(`PRAGMA table_info(notes)`).all() as Array<{ name: string }>

  if (!tableColumns.some((column) => column.name === 'content')) {
    db.exec(`ALTER TABLE notes ADD COLUMN content TEXT NOT NULL DEFAULT ''`)
  }

  if (!tableColumns.some((column) => column.name === 'updated_at')) {
    db.exec(`ALTER TABLE notes ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`)
  }

  const listNotesStatement = db.prepare(`
    SELECT
      id,
      title,
      excerpt,
      content,
      relative_time AS relativeTime,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM notes
    ORDER BY updated_at DESC, created_at DESC
  `)

  const createNoteStatement = db.prepare(`
    INSERT INTO notes (id, title, excerpt, content, relative_time, created_at, updated_at)
    VALUES (@id, @title, @excerpt, @content, @relative_time, @created_at, @updated_at)
  `)

  const updateNoteStatement = db.prepare(`
    UPDATE notes
    SET
      title = @title,
      excerpt = @excerpt,
      content = @content,
      relative_time = @relative_time,
      updated_at = @updated_at
    WHERE id = @id
  `)
  const getNoteTimestampsStatement = db.prepare(`
    SELECT
      created_at AS createdAt
    FROM notes
    WHERE id = ?
    LIMIT 1
  `)

  const deleteNoteStatement = db.prepare(`DELETE FROM notes WHERE id = ?`)
  const clearNotesStatement = db.prepare(`DELETE FROM notes`)

  const listNotesForBackupStatement = db.prepare(`
    SELECT
      id,
      title,
      excerpt,
      content,
      relative_time AS relativeTime,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM notes
    ORDER BY updated_at DESC, created_at DESC
  `)

  return {
    listNotes: () => listNotesStatement.all() as NoteRecord[],
    createNote: () => {
      const now = Date.now()
      const note: NoteInsertRecord = {
        id: randomUUID(),
        title: 'Untitled Note',
        excerpt: 'Blank',
        content: '',
        relativeTime: 'just now',
        createdAt: now,
        updatedAt: now
      }

      createNoteStatement.run({
        id: note.id,
        title: note.title,
        excerpt: note.excerpt,
        content: note.content,
        relative_time: note.relativeTime,
        created_at: note.createdAt,
        updated_at: note.updatedAt
      })

      return note
    },
    updateNote: (payload: NoteUpdatePayload) => {
      const noteId = typeof payload?.id === 'string' ? payload.id : ''
      if (!noteId) return null
      const existingTimestamps = getNoteTimestampsStatement.get(noteId) as
        | { createdAt: number }
        | undefined
      if (!existingTimestamps) return null

      const title = typeof payload.title === 'string' ? payload.title.trim() : ''
      const content = typeof payload.content === 'string' ? payload.content : ''
      const note: NoteRecord = {
        id: noteId,
        title,
        content,
        excerpt: buildExcerpt(content),
        relativeTime: 'just now',
        createdAt: existingTimestamps.createdAt,
        updatedAt: Date.now()
      }

      const result = updateNoteStatement.run({
        id: note.id,
        title: note.title,
        excerpt: note.excerpt,
        content: note.content,
        relative_time: note.relativeTime,
        updated_at: note.updatedAt
      })

      if (result.changes === 0) return null

      return note
    },
    deleteNote: (noteId: string) => {
      const result = deleteNoteStatement.run(noteId)
      return result.changes > 0
    },
    clearNotes: () => {
      const result = clearNotesStatement.run()
      return result.changes
    },
    listNotesForBackup: () => listNotesForBackupStatement.all() as NotesBackupRecord[]
  }
}
