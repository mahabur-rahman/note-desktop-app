import type { App } from 'electron'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NotesBackupRecord, NotesBackupResult } from '../types/notes'
import { createZipBuffer } from './zip-utils'

const backupFolderName = 'backup'

function sanitizeFileName(fileName: string): string {
  const normalized = fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')

  if (!normalized) return 'Untitled Note'
  return normalized.slice(0, 120)
}

function buildNoteFileContent(note: NotesBackupRecord): string {
  const title = note.title.trim() || 'Untitled Note'
  const bodyContent = note.content.trim()
  const excerptContent = note.excerpt.trim() === 'Blank' ? '' : note.excerpt.trim()
  const noteText = bodyContent || excerptContent || ''

  return [
    `Title: ${title}`,
    `Created: ${new Date(note.createdAt).toISOString()}`,
    `Last Modified: ${new Date(note.updatedAt).toISOString()}`,
    '',
    noteText
  ].join('\n')
}

export function createNotesBackup(app: App, notes: NotesBackupRecord[]): NotesBackupResult {
  const backupDir = join(app.getPath('documents'), 'OnlineNotes', 'backups')
  const backupName = 'backup.zip'
  const backupPath = join(backupDir, backupName)
  const duplicateNameCounter = new Map<string, number>()
  const zipEntries: Array<{ name: string; content: Buffer; isDirectory?: boolean; modifiedAt?: Date }> = [
    {
      name: `${backupFolderName}/`,
      content: Buffer.alloc(0),
      isDirectory: true
    }
  ]

  for (const note of notes) {
    const fileBaseName = sanitizeFileName(note.title || 'Untitled Note')
    const normalizedKey = fileBaseName.toLocaleLowerCase()
    const duplicateCount = duplicateNameCounter.get(normalizedKey) ?? 0
    duplicateNameCounter.set(normalizedKey, duplicateCount + 1)

    const finalFileBaseName = duplicateCount === 0 ? fileBaseName : `${fileBaseName} ${duplicateCount + 1}`
    const fileName = `${backupFolderName}/${finalFileBaseName}.txt`
    const fileContent = buildNoteFileContent(note)

    zipEntries.push({
      name: fileName,
      content: Buffer.from(fileContent, 'utf8'),
      modifiedAt: new Date(note.updatedAt)
    })
  }

  const zipBuffer = createZipBuffer(zipEntries)

  mkdirSync(backupDir, { recursive: true })
  writeFileSync(backupPath, zipBuffer)

  return {
    path: backupPath,
    count: notes.length
  }
}
