import type { App } from 'electron'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NotesBackupRecord, NotesBackupResult } from '../types/notes'
import { createSingleFileZipBuffer } from './zip-utils'

export function createNotesBackup(app: App, notes: NotesBackupRecord[]): NotesBackupResult {
  const backupDir = join(app.getPath('documents'), 'OnlineNotes', 'backups')
  const backupName = `notes-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`
  const backupPath = join(backupDir, backupName)
  const backupPayload = JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      count: notes.length,
      notes
    },
    null,
    2
  )
  const zipBuffer = createSingleFileZipBuffer('notes.json', Buffer.from(backupPayload, 'utf8'))

  mkdirSync(backupDir, { recursive: true })
  writeFileSync(backupPath, zipBuffer)

  return {
    path: backupPath,
    count: notes.length
  }
}
