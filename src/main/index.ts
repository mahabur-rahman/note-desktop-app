import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Suppress Chromium/DevTools internal protocol noise in terminal output.
app.commandLine.appendSwitch('disable-logging')
app.commandLine.appendSwitch('log-level', '3')

const linuxWmClass = 'online-notes'
const defaultWindowSize = { width: 1200, height: 760 }
const minimumWindowSize = { width: 900, height: 560 }

interface NoteRecord {
  id: string
  title: string
  excerpt: string
  content: string
  relativeTime: string
}

interface NoteInsertRecord extends NoteRecord {
  createdAt: number
  updatedAt: number
}

interface NoteUpdatePayload {
  id: string
  title: string
  content: string
}

interface NotesBackupRecord extends NoteRecord {
  createdAt: number
  updatedAt: number
}

interface NotesBackupResult {
  path: string
  count: number
}

function buildExcerpt(content: string): string {
  const normalizedContent = content.replace(/\s+/g, ' ').trim()
  if (!normalizedContent) return 'Blank'
  return normalizedContent.slice(0, 72)
}

function openNotesDatabase() {
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
  const tableColumns = db
    .prepare(`PRAGMA table_info(notes)`)
    .all() as Array<{ name: string }>

  if (!tableColumns.some((column) => column.name === 'content')) {
    db.exec(`ALTER TABLE notes ADD COLUMN content TEXT NOT NULL DEFAULT ''`)
  }

  if (!tableColumns.some((column) => column.name === 'updated_at')) {
    db.exec(`ALTER TABLE notes ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`)
  }

  const listNotes = db.prepare(`
    SELECT
      id,
      title,
      excerpt,
      content,
      relative_time AS relativeTime
    FROM notes
    ORDER BY updated_at DESC, created_at DESC
  `)

  const createNote = db.prepare(`
    INSERT INTO notes (id, title, excerpt, content, relative_time, created_at, updated_at)
    VALUES (@id, @title, @excerpt, @content, @relative_time, @created_at, @updated_at)
  `)

  const updateNote = db.prepare(`
    UPDATE notes
    SET
      title = @title,
      excerpt = @excerpt,
      content = @content,
      relative_time = @relative_time,
      updated_at = @updated_at
    WHERE id = @id
  `)

  const deleteNote = db.prepare(`DELETE FROM notes WHERE id = ?`)
  const clearNotes = db.prepare(`DELETE FROM notes`)

  const listNotesForBackup = db.prepare(`
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

  return { listNotes, createNote, updateNote, deleteNote, clearNotes, listNotesForBackup }
}

app.setName('Online Notes')
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('class', linuxWmClass)
  ;(app as Electron.App & { setDesktopName?: (name: string) => void }).setDesktopName?.(`${linuxWmClass}.desktop`)
}

function createWindow(): void {
  const shouldOpenDevTools = is.dev && process.env['OPEN_DEVTOOLS'] !== '0'

  const mainWindow = new BrowserWindow({
    width: defaultWindowSize.width,
    height: defaultWindowSize.height,
    minWidth: minimumWindowSize.width,
    minHeight: minimumWindowSize.height,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (process.platform === 'linux') {
    ;(mainWindow as BrowserWindow & { setIcon?: (icon: Electron.NativeImage) => void }).setIcon?.(
      nativeImage.createFromPath(icon)
    )
  }

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (shouldOpenDevTools) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.webContents.on('console-message', (event, _level, message, _line, sourceId) => {
    const isDevToolsAutofillNoise =
      sourceId.startsWith('devtools://') &&
      (message.includes('Autofill.enable') || message.includes('Autofill.setAddresses'))

    if (isDevToolsAutofillNoise) {
      event.preventDefault()
    }
  })
}

function ensureLinuxDesktopEntry(): void {
  if (process.platform !== 'linux') return

  try {
    const applicationsDir = join(homedir(), '.local', 'share', 'applications')
    const desktopEntryPath = join(applicationsDir, `${linuxWmClass}.desktop`)
    const desktopEntry = [
      '[Desktop Entry]',
      'Type=Application',
      'Name=Online Notes',
      'Comment=Online Notes Desktop App',
      `Exec=${process.execPath}`,
      `Icon=${icon}`,
      'Terminal=false',
      'Categories=Utility;',
      'StartupNotify=true',
      `StartupWMClass=${linuxWmClass}`,
      ''
    ].join('\n')

    mkdirSync(applicationsDir, { recursive: true })
    writeFileSync(desktopEntryPath, desktopEntry, 'utf8')
  } catch (error) {
    console.error('Failed to write Linux desktop entry', error)
  }
}

app.whenReady().then(() => {
  const notesDb = openNotesDatabase()

  ipcMain.handle('notes:list', () => {
    return notesDb.listNotes.all() as NoteRecord[]
  })

  ipcMain.handle('notes:create', () => {
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

    notesDb.createNote.run({
      id: note.id,
      title: note.title,
      excerpt: note.excerpt,
      content: note.content,
      relative_time: note.relativeTime,
      created_at: note.createdAt,
      updated_at: note.updatedAt
    })

    const { createdAt: _createdAt, updatedAt: _updatedAt, ...createdNote } = note
    return createdNote
  })

  ipcMain.handle('notes:update', (_event, payload: NoteUpdatePayload) => {
    const noteId = typeof payload?.id === 'string' ? payload.id : ''
    if (!noteId) return null

    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const content = typeof payload.content === 'string' ? payload.content : ''
    const note: NoteRecord & { updatedAt: number } = {
      id: noteId,
      title,
      content,
      excerpt: buildExcerpt(content),
      relativeTime: 'just now',
      updatedAt: Date.now()
    }

    const result = notesDb.updateNote.run({
      id: note.id,
      title: note.title,
      excerpt: note.excerpt,
      content: note.content,
      relative_time: note.relativeTime,
      updated_at: note.updatedAt
    })

    if (result.changes === 0) return null

    const { updatedAt: _updatedAt, ...updatedNote } = note
    return updatedNote
  })

  ipcMain.handle('notes:delete', (_event, noteId: string) => {
    const result = notesDb.deleteNote.run(noteId)
    return result.changes > 0
  })

  ipcMain.handle('notes:clear', () => {
    const result = notesDb.clearNotes.run()
    return result.changes
  })

  ipcMain.handle('notes:backup', () => {
    const notes = notesDb.listNotesForBackup.all() as NotesBackupRecord[]
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

    const result: NotesBackupResult = {
      path: backupPath,
      count: notes.length
    }

    return result
  })

  ipcMain.handle('window:toggle-maximize', () => {
    const targetWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
    if (!targetWindow) return false

    if (targetWindow.isMaximized()) {
      targetWindow.unmaximize()
      return false
    }

    targetWindow.maximize()
    return true
  })

  ipcMain.handle('window:is-maximized', () => {
    const targetWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
    return targetWindow?.isMaximized() ?? false
  })

  ensureLinuxDesktopEntry()

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(nativeImage.createFromPath(icon))
  }

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
