import type { App } from 'electron'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NotesBackupRecord, NotesBackupResult } from '../types/notes'

export function createNotesBackup(app: App, notes: NotesBackupRecord[]): NotesBackupResult {
  const backupDir = join(app.getPath('documents'), 'OnlineNotes', 'backups')
  const backupName = `notes-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const backupPath = join(backupDir, backupName)

  mkdirSync(backupDir, { recursive: true })
  writeFileSync(
    backupPath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        count: notes.length,
        notes
      },
      null,
      2
    ),
    'utf8'
  )

  return {
    path: backupPath,
    count: notes.length
  }
}
