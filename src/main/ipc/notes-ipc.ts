import { ipcMain, type App } from 'electron'
import { createNotesBackup } from '../notes/notes-backup'
import { openNotesDatabase } from '../notes/notes-database'
import type { NoteUpdatePayload } from '../types/notes'

export function registerNotesIpcHandlers(app: App): void {
  const notesDb = openNotesDatabase(app)

  ipcMain.handle('notes:list', () => notesDb.listNotes())
  ipcMain.handle('notes:create', () => notesDb.createNote())
  ipcMain.handle('notes:update', (_event, payload: NoteUpdatePayload) => notesDb.updateNote(payload))
  ipcMain.handle('notes:delete', (_event, noteId: string) => notesDb.deleteNote(noteId))
  ipcMain.handle('notes:clear', () => notesDb.clearNotes())
  ipcMain.handle('notes:backup', () => createNotesBackup(app, notesDb.listNotesForBackup()))
}
