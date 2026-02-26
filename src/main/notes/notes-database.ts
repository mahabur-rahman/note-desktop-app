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
      updated_at INTEGER NOT NULL,
      folder TEXT NOT NULL DEFAULT 'General',
      tags_json TEXT NOT NULL DEFAULT '[]',
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      deleted_at INTEGER,
      versions_json TEXT NOT NULL DEFAULT '[]'
    )
  `)

  const tableColumns = db.prepare(`PRAGMA table_info(notes)`).all() as Array<{ name: string }>

  if (!tableColumns.some((column) => column.name === 'content')) {
    db.exec(`ALTER TABLE notes ADD COLUMN content TEXT NOT NULL DEFAULT ''`)
  }

  if (!tableColumns.some((column) => column.name === 'updated_at')) {
    db.exec(`ALTER TABLE notes ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`)
  }
  if (!tableColumns.some((column) => column.name === 'folder')) {
    db.exec(`ALTER TABLE notes ADD COLUMN folder TEXT NOT NULL DEFAULT 'General'`)
  }
  if (!tableColumns.some((column) => column.name === 'tags_json')) {
    db.exec(`ALTER TABLE notes ADD COLUMN tags_json TEXT NOT NULL DEFAULT '[]'`)
  }
  if (!tableColumns.some((column) => column.name === 'is_pinned')) {
    db.exec(`ALTER TABLE notes ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0`)
  }
  if (!tableColumns.some((column) => column.name === 'is_deleted')) {
    db.exec(`ALTER TABLE notes ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0`)
  }
  if (!tableColumns.some((column) => column.name === 'deleted_at')) {
    db.exec(`ALTER TABLE notes ADD COLUMN deleted_at INTEGER`)
  }
  if (!tableColumns.some((column) => column.name === 'versions_json')) {
    db.exec(`ALTER TABLE notes ADD COLUMN versions_json TEXT NOT NULL DEFAULT '[]'`)
  }

  const parseStringArray = (rawValue: unknown): string[] => {
    if (Array.isArray(rawValue)) {
      return rawValue.filter((value): value is string => typeof value === 'string')
    }

    if (typeof rawValue !== 'string') return []

    try {
      const parsed = JSON.parse(rawValue) as unknown
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === 'string')
        : []
    } catch {
      return []
    }
  }

  const parseVersions = (
    rawValue: unknown
  ): Array<{ id: string; title: string; content: string; savedAt: number }> => {
    if (typeof rawValue !== 'string') return []

    try {
      const parsed = JSON.parse(rawValue) as unknown
      if (!Array.isArray(parsed)) return []
      return parsed
        .filter(
          (item): item is Record<string, unknown> => typeof item === 'object' && item !== null
        )
        .map((item) => ({
          id: typeof item.id === 'string' ? item.id : randomUUID(),
          title: typeof item.title === 'string' ? item.title : 'Untitled Note',
          content: typeof item.content === 'string' ? item.content : '',
          savedAt: typeof item.savedAt === 'number' ? item.savedAt : Date.now()
        }))
    } catch {
      return []
    }
  }

  const toNoteRecord = (row: Record<string, unknown>): NoteRecord => ({
    id: typeof row.id === 'string' ? row.id : randomUUID(),
    title: typeof row.title === 'string' ? row.title : 'Untitled Note',
    excerpt: typeof row.excerpt === 'string' ? row.excerpt : 'Blank',
    content: typeof row.content === 'string' ? row.content : '',
    relativeTime: typeof row.relativeTime === 'string' ? row.relativeTime : 'just now',
    createdAt: typeof row.createdAt === 'number' ? row.createdAt : Date.now(),
    updatedAt: typeof row.updatedAt === 'number' ? row.updatedAt : Date.now(),
    folder: typeof row.folder === 'string' && row.folder.trim().length > 0 ? row.folder : 'General',
    tags: parseStringArray(row.tagsJson),
    isPinned: Number(row.isPinned) === 1,
    isDeleted: Number(row.isDeleted) === 1,
    deletedAt: typeof row.deletedAt === 'number' ? row.deletedAt : null,
    versions: parseVersions(row.versionsJson)
  })

  const listNotesStatement = db.prepare(`
    SELECT
      id,
      title,
      excerpt,
      content,
      relative_time AS relativeTime,
      created_at AS createdAt,
      updated_at AS updatedAt,
      folder,
      tags_json AS tagsJson,
      is_pinned AS isPinned,
      is_deleted AS isDeleted,
      deleted_at AS deletedAt,
      versions_json AS versionsJson
    FROM notes
    ORDER BY updated_at DESC, created_at DESC
  `)

  const createNoteStatement = db.prepare(`
    INSERT INTO notes (
      id, title, excerpt, content, relative_time, created_at, updated_at, folder, tags_json,
      is_pinned, is_deleted, deleted_at, versions_json
    )
    VALUES (
      @id, @title, @excerpt, @content, @relative_time, @created_at, @updated_at, @folder, @tags_json,
      @is_pinned, @is_deleted, @deleted_at, @versions_json
    )
  `)

  const updateNoteStatement = db.prepare(`
    UPDATE notes
    SET
      title = @title,
      excerpt = @excerpt,
      content = @content,
      relative_time = @relative_time,
      updated_at = @updated_at,
      folder = @folder,
      tags_json = @tags_json,
      is_pinned = @is_pinned,
      is_deleted = @is_deleted,
      deleted_at = @deleted_at,
      versions_json = @versions_json
    WHERE id = @id
  `)
  const getNoteTimestampsStatement = db.prepare(`
    SELECT
      created_at AS createdAt,
      folder,
      tags_json AS tagsJson,
      is_pinned AS isPinned,
      is_deleted AS isDeleted,
      deleted_at AS deletedAt,
      versions_json AS versionsJson
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
      updated_at AS updatedAt,
      folder,
      tags_json AS tagsJson,
      is_pinned AS isPinned,
      is_deleted AS isDeleted,
      deleted_at AS deletedAt,
      versions_json AS versionsJson
    FROM notes
    ORDER BY updated_at DESC, created_at DESC
  `)

  return {
    listNotes: () =>
      (listNotesStatement.all() as Array<Record<string, unknown>>).map((row) => toNoteRecord(row)),
    createNote: () => {
      const now = Date.now()
      const note: NoteInsertRecord = {
        id: randomUUID(),
        title: 'Untitled Note',
        excerpt: 'Blank',
        content: '',
        relativeTime: 'just now',
        createdAt: now,
        updatedAt: now,
        folder: 'General',
        tags: [],
        isPinned: false,
        isDeleted: false,
        deletedAt: null,
        versions: []
      }

      createNoteStatement.run({
        id: note.id,
        title: note.title,
        excerpt: note.excerpt,
        content: note.content,
        relative_time: note.relativeTime,
        created_at: note.createdAt,
        updated_at: note.updatedAt,
        folder: note.folder,
        tags_json: JSON.stringify(note.tags),
        is_pinned: note.isPinned ? 1 : 0,
        is_deleted: note.isDeleted ? 1 : 0,
        deleted_at: note.deletedAt,
        versions_json: JSON.stringify(note.versions)
      })

      return note
    },
    updateNote: (payload: NoteUpdatePayload) => {
      const noteId = typeof payload?.id === 'string' ? payload.id : ''
      if (!noteId) return null
      const existingTimestamps = getNoteTimestampsStatement.get(noteId) as
        | {
            createdAt: number
            folder: string
            tagsJson: string
            isPinned: number
            isDeleted: number
            deletedAt: number | null
            versionsJson: string
          }
        | undefined
      if (!existingTimestamps) return null

      const title = typeof payload.title === 'string' ? payload.title.trim() : ''
      const content = typeof payload.content === 'string' ? payload.content : ''
      const folder =
        typeof payload.folder === 'string' && payload.folder.trim().length > 0
          ? payload.folder.trim()
          : existingTimestamps.folder || 'General'
      const tags = Array.isArray(payload.tags)
        ? payload.tags.filter(
            (tag): tag is string => typeof tag === 'string' && tag.trim().length > 0
          )
        : parseStringArray(existingTimestamps.tagsJson)
      const versions = Array.isArray(payload.versions)
        ? payload.versions
            .filter(
              (item): item is { id: string; title: string; content: string; savedAt: number } =>
                typeof item === 'object' &&
                item !== null &&
                typeof item.id === 'string' &&
                typeof item.title === 'string' &&
                typeof item.content === 'string' &&
                typeof item.savedAt === 'number'
            )
            .slice(0, 50)
        : parseVersions(existingTimestamps.versionsJson)

      const note: NoteRecord = {
        id: noteId,
        title,
        content,
        excerpt: buildExcerpt(content),
        relativeTime: 'just now',
        createdAt: existingTimestamps.createdAt,
        updatedAt: Date.now(),
        folder,
        tags,
        isPinned: Boolean(payload.isPinned),
        isDeleted: Boolean(payload.isDeleted),
        deletedAt: typeof payload.deletedAt === 'number' ? payload.deletedAt : null,
        versions
      }

      const result = updateNoteStatement.run({
        id: note.id,
        title: note.title,
        excerpt: note.excerpt,
        content: note.content,
        relative_time: note.relativeTime,
        updated_at: note.updatedAt,
        folder: note.folder,
        tags_json: JSON.stringify(note.tags),
        is_pinned: note.isPinned ? 1 : 0,
        is_deleted: note.isDeleted ? 1 : 0,
        deleted_at: note.deletedAt,
        versions_json: JSON.stringify(note.versions)
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
    listNotesForBackup: () =>
      (listNotesForBackupStatement.all() as Array<Record<string, unknown>>).map((row) =>
        toNoteRecord(row)
      ) as NotesBackupRecord[]
  }
}
