import { useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import type { EditorFontSettings, NoteSummary, SidebarSortMode, SidebarViewMode } from '../../types/ui'
import { AboutModal } from '../common/AboutModal'
import { ConfirmModal } from '../common/ConfirmModal'
import { SaveAsModal } from '../common/SaveAsModal'
import { EditorPane } from '../editor/EditorPane'
import { AppTopBar } from './AppTopBar'
import { NotesSidebar } from '../sidebar/NotesSidebar'

interface DesktopNotesLayoutProps {
  appTitle: string
  menuItems: readonly string[]
}

interface NotesApi {
  list: () => Promise<NoteSummary[]>
  create: () => Promise<NoteSummary>
  update: (payload: { id: string; title: string; content: string }) => Promise<NoteSummary | null>
  delete: (noteId: string) => Promise<boolean>
  clear: () => Promise<number>
  backup: () => Promise<{ path: string; count: number }>
}

const browserNotesStorageKey = 'online-notes:web-notes'
const sidebarViewModeStorageKey = 'online-notes:sidebar-view-mode'
const sidebarSortModeStorageKey = 'online-notes:sidebar-sort-mode'
const statusBarVisibleStorageKey = 'online-notes:status-bar-visible'
const spellCheckEnabledStorageKey = 'online-notes:spell-check-enabled'
const wordWrapEnabledStorageKey = 'online-notes:word-wrap-enabled'
const editorFontSettingsStorageKey = 'online-notes:editor-font-settings'

const defaultEditorFontSettings: EditorFontSettings = {
  fontFamily: 'default',
  fontSize: 14,
  fontWeight: 400,
  fontStyle: 'normal',
  lineHeight: 1.5
}

function generateNoteId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function buildExcerpt(content: string): string {
  const normalizedContent = content.replace(/\s+/g, ' ').trim()
  if (!normalizedContent) return 'Blank'
  return normalizedContent.slice(0, 72)
}

function sanitizeDownloadFileName(fileName: string): string {
  const normalized = fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')
  return normalized || 'Untitled Note'
}

function deriveNoteTitleFromFileName(fileName: string): string {
  const sanitizedName = fileName.trim()
  if (!sanitizedName) return 'Untitled Note'
  const strippedExtension = sanitizedName.replace(/\.[^/.]+$/, '')
  const normalizedTitle = strippedExtension.trim()
  return normalizedTitle || 'Untitled Note'
}

function ensureTxtExtension(fileName: string): string {
  return fileName.toLowerCase().endsWith('.txt') ? fileName : `${fileName}.txt`
}

function formatPrintTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function buildHelpPageHtml(pageTitle: string, heading: string, contentHtml: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${pageTitle}</title>
    <style>
      body {
        margin: 0;
        background: #efeff1;
        color: #1f2d45;
        font-family: Arial, sans-serif;
      }
      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 34px;
        padding: 0 16px;
        background: #0c1117;
        color: #f4f7fb;
        font-size: 11px;
      }
      .hero {
        display: grid;
        place-items: center;
        min-height: 96px;
        background: #3d5be0;
        color: #f4f7fb;
      }
      .hero h1 {
        margin: 0;
        font-size: 34px;
        font-weight: 500;
      }
      .content {
        max-width: 680px;
        margin: 0 auto;
        padding: 28px 16px 44px;
      }
      .content h2 {
        margin: 0 0 14px;
        font-size: 36px;
      }
      .content h3 {
        margin: 20px 0 8px;
        font-size: 18px;
      }
      .content p {
        margin: 0 0 12px;
        font-size: 14px;
        line-height: 1.55;
      }
      .shortcut-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      .shortcut-table th,
      .shortcut-table td {
        border: 1px solid #c9ced6;
        padding: 9px 12px;
        text-align: left;
      }
      .shortcut-table thead th {
        background: #e8ebef;
        font-weight: 700;
      }
      .shortcut-table tbody td:nth-child(2),
      .shortcut-table tbody td:nth-child(3) {
        text-align: center;
      }
    </style>
  </head>
  <body>
    <header class="topbar">
      <span>ONLINE NOTEPAD</span>
      <span>HOME &nbsp;&nbsp; NOTEPAD</span>
    </header>
    <section class="hero">
      <h1>${heading}</h1>
    </section>
    <main class="content">
      ${contentHtml}
    </main>
  </body>
</html>`
}

function openHelpPageInNewTab(pageTitle: string, heading: string, contentHtml: string): void {
  const popupWindow = window.open('', '_blank', 'noopener,noreferrer,width=1100,height=900')
  if (!popupWindow) return
  popupWindow.document.open()
  popupWindow.document.write(buildHelpPageHtml(pageTitle, heading, contentHtml))
  popupWindow.document.close()
}

function getPrivacyPolicyContentHtml(): string {
  return `
    <h3>Consent</h3>
    <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>

    <h3>Information We Collect</h3>
    <p>When you use Online Notepad, we may collect limited technical details such as browser type, device information, and standard diagnostic logs for performance and reliability.</p>
    <p>We do not ask for sensitive personal information to use basic note editing features.</p>

    <h3>How We Use Information</h3>
    <p>We use collected information to operate the service, improve editor performance, detect abuse, and maintain security.</p>
    <p>Any analytics data is used in aggregated form to understand trends and improve usability.</p>

    <h3>Log Files</h3>
    <p>Online Notepad follows a standard procedure of using log files. These files may include IP address, browser type, ISP, date and time stamp, and referring/exit pages.</p>

    <h3>Cookies</h3>
    <p>Like most websites, we may use cookies to store preferences such as editor settings. You can disable cookies via browser settings, though some functionality may be affected.</p>

    <h3>Third-Party Policies</h3>
    <p>This Privacy Policy does not apply to other advertisers or websites. Please review the privacy policies of third-party services for more details.</p>

    <h3>GDPR Data Protection Rights</h3>
    <p>You have the right to access, rectify, erase, or restrict processing of your personal data where applicable by law.</p>

    <h3>Children's Information</h3>
    <p>Online Notepad does not knowingly collect personally identifiable information from children under 13.</p>

    <h3>Contact Us</h3>
    <p>If you have questions about this policy, contact: onlinenotepad.org@gmail.com</p>
  `
}

function getShortcutsContentHtml(): string {
  return `
    <h2>Shortcuts</h2>
    <p>Here is the complete list of key combinations to help you move faster while using Online Notepad.</p>
    <table class="shortcut-table">
      <thead>
        <tr>
          <th>Action</th>
          <th>PC</th>
          <th>Mac</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Open file</td><td>Ctrl + O</td><td>Command + O</td></tr>
        <tr><td>Save</td><td>Ctrl + S</td><td>Command + S</td></tr>
        <tr><td>Save As</td><td>Ctrl + Shift + S</td><td>Command + Shift + S</td></tr>
        <tr><td>Print</td><td>Ctrl + P</td><td>Command + P</td></tr>
        <tr><td>Undo</td><td>Ctrl + Z</td><td>Command + Z</td></tr>
        <tr><td>Redo</td><td>Ctrl + Y</td><td>Command + Y</td></tr>
        <tr><td>Cut selected text</td><td>Ctrl + X</td><td>Command + X</td></tr>
        <tr><td>Copy selected text</td><td>Ctrl + C</td><td>Command + C</td></tr>
        <tr><td>Highlight all</td><td>Ctrl + A</td><td>Command + A</td></tr>
        <tr><td>Find and replace</td><td>Ctrl + Shift + R</td><td>Command + Shift + R</td></tr>
        <tr><td>Insert date & time</td><td>Ctrl + Shift + D</td><td>Command + Shift + D</td></tr>
        <tr><td>Open characters</td><td>Ctrl + Shift + C</td><td>Command + Shift + C</td></tr>
        <tr><td>Open emojis</td><td>Ctrl + Shift + E</td><td>Command + Shift + E</td></tr>
        <tr><td>Open font settings</td><td>Ctrl + Shift + G</td><td>Command + Shift + G</td></tr>
        <tr><td>Toggle fullscreen</td><td>Ctrl + Shift + F</td><td>Command + Shift + F</td></tr>
      </tbody>
    </table>
  `
}

function loadBrowserNotes(): NoteSummary[] {
  try {
    const rawValue = window.localStorage.getItem(browserNotesStorageKey)
    if (!rawValue) return []
    const parsedValue = JSON.parse(rawValue) as Array<Partial<NoteSummary>>
    return normalizeNotes(parsedValue)
  } catch {
    return []
  }
}

function saveBrowserNotes(notes: NoteSummary[]): void {
  try {
    window.localStorage.setItem(browserNotesStorageKey, JSON.stringify(notes))
  } catch {
    // Ignore localStorage failures in restricted contexts.
  }
}

function getNotesApi(): Partial<NotesApi> | null {
  const desktopApi = (window as Window & { api?: { notes?: Partial<NotesApi> } }).api?.notes
  return desktopApi ?? null
}

function normalizeTimestamp(rawValue: unknown, fallbackValue: number): number {
  if (typeof rawValue !== 'number' || Number.isNaN(rawValue)) return fallbackValue
  if (rawValue <= 0) return fallbackValue
  if (rawValue < 1_000_000_000_000) return Math.trunc(rawValue * 1000)
  return Math.trunc(rawValue)
}

function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const safeTimestamp = Number.isFinite(timestamp) ? timestamp : now
  const diffMs = Math.max(0, now - safeTimestamp)

  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (diffMs < minuteMs) return 'just now'

  if (diffMs < hourMs) {
    const minutes = Math.floor(diffMs / minuteMs)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  const days = Math.floor(diffMs / dayMs)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function normalizeNotes(notes: Array<Partial<NoteSummary>>): NoteSummary[] {
  if (!Array.isArray(notes)) return []
  return notes.map((note) => {
    const now = Date.now()
    const createdAt = normalizeTimestamp(note.createdAt, now)
    const updatedAt = normalizeTimestamp(note.updatedAt, createdAt)
    return {
      id: typeof note.id === 'string' ? note.id : generateNoteId(),
      title: typeof note.title === 'string' ? note.title : 'Untitled Note',
      excerpt: typeof note.excerpt === 'string' ? note.excerpt : 'Blank',
      content: typeof note.content === 'string' ? note.content : '',
      relativeTime: formatRelativeTime(updatedAt),
      createdAt,
      updatedAt
    }
  })
}

function loadSidebarViewMode(): SidebarViewMode {
  try {
    const rawValue = window.localStorage.getItem(sidebarViewModeStorageKey)
    return rawValue === 'compact' ? 'compact' : 'detailed'
  } catch {
    return 'detailed'
  }
}

function loadSidebarSortMode(): SidebarSortMode {
  try {
    const rawValue = window.localStorage.getItem(sidebarSortModeStorageKey)
    if (rawValue === 'alphabetical' || rawValue === 'creation-date' || rawValue === 'last-modified') {
      return rawValue
    }
    return 'last-modified'
  } catch {
    return 'last-modified'
  }
}

function loadStatusBarVisibility(): boolean {
  try {
    const rawValue = window.localStorage.getItem(statusBarVisibleStorageKey)
    return rawValue === 'true'
  } catch {
    return false
  }
}

function loadSpellCheckEnabled(): boolean {
  try {
    const rawValue = window.localStorage.getItem(spellCheckEnabledStorageKey)
    return rawValue !== 'false'
  } catch {
    return true
  }
}

function loadWordWrapEnabled(): boolean {
  try {
    const rawValue = window.localStorage.getItem(wordWrapEnabledStorageKey)
    return rawValue !== 'false'
  } catch {
    return true
  }
}

function loadEditorFontSettings(): EditorFontSettings {
  try {
    const rawValue = window.localStorage.getItem(editorFontSettingsStorageKey)
    if (!rawValue) return defaultEditorFontSettings

    const parsedValue = JSON.parse(rawValue) as Partial<EditorFontSettings>
    const fontSize = [14, 16, 18, 20, 22].includes(Number(parsedValue.fontSize))
      ? Number(parsedValue.fontSize)
      : defaultEditorFontSettings.fontSize
    const fontWeight = Number(parsedValue.fontWeight) === 700 ? 700 : 400
    const fontStyle = parsedValue.fontStyle === 'italic' ? 'italic' : 'normal'
    const lineHeight = [1, 1.15, 1.5, 2].includes(Number(parsedValue.lineHeight))
      ? (Number(parsedValue.lineHeight) as 1 | 1.15 | 1.5 | 2)
      : defaultEditorFontSettings.lineHeight

    const allowedFontFamilies = [
      'default',
      'Arial, sans-serif',
      '"Comic Sans MS", "Comic Sans", cursive',
      '"Courier New", monospace',
      'Georgia, serif'
    ]
    const fontFamily = allowedFontFamilies.includes(String(parsedValue.fontFamily))
      ? String(parsedValue.fontFamily)
      : defaultEditorFontSettings.fontFamily

    return {
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      lineHeight
    }
  } catch {
    return defaultEditorFontSettings
  }
}

function downloadBrowserBackup(notes: NoteSummary[]): string {
  const backupName = `notes-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const backupBlob = new Blob(
    [
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          count: notes.length,
          notes
        },
        null,
        2
      )
    ],
    { type: 'application/json' }
  )

  const downloadUrl = URL.createObjectURL(backupBlob)
  const anchorElement = document.createElement('a')
  anchorElement.href = downloadUrl
  anchorElement.download = backupName
  document.body.appendChild(anchorElement)
  anchorElement.click()
  anchorElement.remove()
  URL.revokeObjectURL(downloadUrl)

  return backupName
}

export function DesktopNotesLayout({ appTitle, menuItems }: DesktopNotesLayoutProps): React.JSX.Element {
  const [notes, setNotes] = useState<NoteSummary[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarViewMode, setSidebarViewMode] = useState<SidebarViewMode>(loadSidebarViewMode)
  const [sidebarSortMode, setSidebarSortMode] = useState<SidebarSortMode>(loadSidebarSortMode)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isExpandedView, setIsExpandedView] = useState(false)
  const [isStatusBarVisible, setIsStatusBarVisible] = useState(loadStatusBarVisibility)
  const [isSpellCheckEnabled, setIsSpellCheckEnabled] = useState(loadSpellCheckEnabled)
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(loadWordWrapEnabled)
  const [editorFontSettings, setEditorFontSettings] = useState<EditorFontSettings>(loadEditorFontSettings)
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [saveAsFileName, setSaveAsFileName] = useState('')
  const [printTimestamp, setPrintTimestamp] = useState('')
  const [timeNow, setTimeNow] = useState(() => Date.now())
  const updateTimeoutIdRef = useRef<number | null>(null)
  const printContentRef = useRef<HTMLDivElement | null>(null)
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase()
  const filteredNotes =
    normalizedSearchQuery === ''
      ? notes
      : notes.filter((note) => {
          const normalizedTitle = note.title.toLocaleLowerCase()
          const normalizedContent = note.content.toLocaleLowerCase()
          return (
            normalizedTitle.includes(normalizedSearchQuery) || normalizedContent.includes(normalizedSearchQuery)
          )
        })
  const sortedFilteredNotes = [...filteredNotes].sort((firstNote, secondNote) => {
    if (sidebarSortMode === 'alphabetical') {
      const titleCompare = firstNote.title.localeCompare(secondNote.title, undefined, { sensitivity: 'base' })
      if (titleCompare !== 0) return titleCompare
      return secondNote.updatedAt - firstNote.updatedAt
    }

    if (sidebarSortMode === 'creation-date') {
      return secondNote.createdAt - firstNote.createdAt
    }

    return secondNote.updatedAt - firstNote.updatedAt
  })
  const notesForSidebar = sortedFilteredNotes.map((note) => ({
    ...note,
    relativeTime: formatRelativeTime(note.updatedAt, timeNow)
  }))
  const activeNote = notes.find((note) => note.id === activeNoteId) ?? notes[0] ?? null
  const activeNoteCharacterCount = Array.from(activeNote?.content ?? '').length
  const printTitle = activeNote?.title?.trim() || 'Untitled Note'
  const printContent = activeNote?.content ?? ''

  const reactToPrint = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: printTitle
  })

  const clearPendingUpdate = (): void => {
    if (updateTimeoutIdRef.current === null) return
    window.clearTimeout(updateTimeoutIdRef.current)
    updateTimeoutIdRef.current = null
  }

  useEffect(() => {
    const loadNotes = async (): Promise<void> => {
      try {
        const notesApi = getNotesApi()
        const storedNotes = normalizeNotes(
          notesApi && typeof notesApi.list === 'function' ? await notesApi.list() : loadBrowserNotes()
        )
        setNotes(storedNotes)
        setActiveNoteId(storedNotes[0]?.id ?? '')
      } catch (error) {
        console.error('Failed to load notes', error)
      }
    }

    void loadNotes()
  }, [])

  useEffect(() => {
    if (activeNote) {
      if (activeNoteId !== activeNote.id) setActiveNoteId(activeNote.id)
      return
    }

    if (activeNoteId) setActiveNoteId('')
  }, [activeNote, activeNoteId])

  useEffect(() => {
    const syncFullScreenState = async (): Promise<void> => {
      try {
        const isFullScreen = await window.electron.ipcRenderer.invoke('window:is-full-screen')
        setIsExpandedView(Boolean(isFullScreen))
      } catch {
        // Keep UI-only fallback state if Electron IPC is unavailable.
      }
    }

    void syncFullScreenState()
  }, [])

  useEffect(() => {
    const syncSpellCheckState = async (): Promise<void> => {
      try {
        const isEnabled = await window.electron.ipcRenderer.invoke('window:is-spell-check-enabled')
        setIsSpellCheckEnabled(Boolean(isEnabled))
      } catch {
        // Keep UI fallback state if Electron IPC is unavailable.
      }
    }

    void syncSpellCheckState()
  }, [])

  useEffect(() => {
    return () => {
      clearPendingUpdate()
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => setTimeNow(Date.now()), 60 * 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarViewModeStorageKey, sidebarViewMode)
    } catch {
      // Ignore localStorage failures in restricted contexts.
    }
  }, [sidebarViewMode])

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarSortModeStorageKey, sidebarSortMode)
    } catch {
      // Ignore localStorage failures in restricted contexts.
    }
  }, [sidebarSortMode])

  useEffect(() => {
    try {
      window.localStorage.setItem(statusBarVisibleStorageKey, String(isStatusBarVisible))
    } catch {
      // Ignore localStorage failures in restricted contexts.
    }
  }, [isStatusBarVisible])

  useEffect(() => {
    try {
      window.localStorage.setItem(spellCheckEnabledStorageKey, String(isSpellCheckEnabled))
    } catch {
      // Ignore localStorage failures in restricted contexts.
    }

    const syncSpellCheck = async (): Promise<void> => {
      try {
        await window.electron.ipcRenderer.invoke('window:set-spell-check-enabled', isSpellCheckEnabled)
      } catch {
        // Ignore IPC failures in non-Electron contexts.
      }
    }

    void syncSpellCheck()
  }, [isSpellCheckEnabled])

  useEffect(() => {
    try {
      window.localStorage.setItem(wordWrapEnabledStorageKey, String(isWordWrapEnabled))
    } catch {
      // Ignore localStorage failures in restricted contexts.
    }
  }, [isWordWrapEnabled])

  useEffect(() => {
    try {
      window.localStorage.setItem(editorFontSettingsStorageKey, JSON.stringify(editorFontSettings))
    } catch {
      // Ignore localStorage failures in restricted contexts.
    }
  }, [editorFontSettings])

  const queuePersistNote = (note: NoteSummary): void => {
    clearPendingUpdate()
    updateTimeoutIdRef.current = window.setTimeout(() => {
      const persistNote = async (): Promise<void> => {
        try {
          const notesApi = getNotesApi()
          const updatedNote =
            notesApi && typeof notesApi.update === 'function'
              ? await notesApi.update({
                id: note.id,
                title: note.title,
                content: note.content
              })
              : note

          if (!updatedNote) return
          setNotes((prev) => {
            const updatedNotes = prev.map((item) => (item.id === updatedNote.id ? updatedNote : item))
            if (!notesApi) saveBrowserNotes(updatedNotes)
            return updatedNotes
          })
        } catch (error) {
          console.error('Failed to update note', error)
        } finally {
          updateTimeoutIdRef.current = null
        }
      }

      void persistNote()
    }, 250)
  }

  const handleChangeActiveNoteTitle = (title: string): void => {
    if (!activeNote) return

    const now = Date.now()
    const nextNote: NoteSummary = {
      ...activeNote,
      title,
      relativeTime: 'just now',
      updatedAt: now
    }

    setNotes((prev) => prev.map((note) => (note.id === activeNote.id ? nextNote : note)))
    queuePersistNote(nextNote)
  }

  const handleChangeActiveNoteContent = (content: string): void => {
    if (!activeNote) return

    const now = Date.now()
    const nextNote: NoteSummary = {
      ...activeNote,
      content,
      excerpt: buildExcerpt(content),
      relativeTime: 'just now',
      updatedAt: now
    }

    setNotes((prev) => prev.map((note) => (note.id === activeNote.id ? nextNote : note)))
    queuePersistNote(nextNote)
  }

  const handleToggleExpandedView = (): void => {
    const toggleFullScreen = async (): Promise<void> => {
      try {
        const isFullScreen = await window.electron.ipcRenderer.invoke('window:toggle-full-screen')
        setIsExpandedView(Boolean(isFullScreen))
      } catch {
        // Fallback for non-Electron environments.
        setIsExpandedView((prev) => !prev)
      }
    }

    void toggleFullScreen()
  }

  const handleRequestDeleteActiveNote = (): void => {
    if (!activeNote) return
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDeleteActiveNote = (): void => {
    if (!activeNote) return
    const deletingNoteId = activeNote.id

    const deleteNote = async (): Promise<void> => {
      try {
        clearPendingUpdate()
        const notesApi = getNotesApi()
        const isDeleted =
          notesApi && typeof notesApi.delete === 'function' ? await notesApi.delete(deletingNoteId) : true
        if (!isDeleted) return
        setNotes((prev) => {
          const remainingNotes = prev.filter((note) => note.id !== deletingNoteId)
          if (!notesApi) saveBrowserNotes(remainingNotes)
          return remainingNotes
        })
      } catch (error) {
        console.error('Failed to delete note', error)
      } finally {
        setIsDeleteModalOpen(false)
      }
    }

    void deleteNote()
  }

  const handleCreateNote = (): void => {
    const createNote = async (): Promise<void> => {
      try {
        const notesApi = getNotesApi()
        const now = Date.now()
        const createdNote =
          notesApi && typeof notesApi.create === 'function'
            ? normalizeNotes([await notesApi.create()])[0]
            : {
              id: generateNoteId(),
              title: 'Untitled Note',
              excerpt: 'Blank',
              content: '',
              relativeTime: 'just now',
              createdAt: now,
              updatedAt: now
            }

        setNotes((prev) => {
          const nextNotes = [createdNote, ...prev]
          if (!notesApi) saveBrowserNotes(nextNotes)
          return nextNotes
        })
        setActiveNoteId(createdNote.id)
      } catch (error) {
        console.error('Failed to create note', error)
      }
    }

    void createNote()
  }

  const upsertActiveNoteFromExternalContent = async (title: string, content: string): Promise<void> => {
    const normalizedTitle = title.trim() || 'Untitled Note'
    const normalizedContent = typeof content === 'string' ? content : ''
    const now = Date.now()

    clearPendingUpdate()

    if (activeNote) {
      const nextNote: NoteSummary = {
        ...activeNote,
        title: normalizedTitle,
        content: normalizedContent,
        excerpt: buildExcerpt(normalizedContent),
        relativeTime: 'just now',
        updatedAt: now
      }

      setNotes((prev) => prev.map((note) => (note.id === activeNote.id ? nextNote : note)))
      queuePersistNote(nextNote)
      return
    }

    const notesApi = getNotesApi()
    const createdNote =
      notesApi && typeof notesApi.create === 'function'
        ? normalizeNotes([await notesApi.create()])[0]
        : {
          id: generateNoteId(),
          title: 'Untitled Note',
          excerpt: 'Blank',
          content: '',
          relativeTime: 'just now',
          createdAt: now,
          updatedAt: now
        }

    const nextNote: NoteSummary = {
      ...createdNote,
      title: normalizedTitle,
      content: normalizedContent,
      excerpt: buildExcerpt(normalizedContent),
      relativeTime: 'just now',
      updatedAt: now
    }

    setNotes((prev) => {
      const nextNotes = [nextNote, ...prev]
      if (!notesApi) saveBrowserNotes(nextNotes)
      return nextNotes
    })
    setActiveNoteId(nextNote.id)
    queuePersistNote(nextNote)
  }

  const downloadNoteAsText = (fileName: string, content: string): void => {
    const fileContent = typeof content === 'string' ? content : ''
    const textBlob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(textBlob)
    const anchorElement = document.createElement('a')
    anchorElement.href = downloadUrl
    anchorElement.download = fileName
    document.body.appendChild(anchorElement)
    anchorElement.click()
    anchorElement.remove()
    URL.revokeObjectURL(downloadUrl)
  }

  const handleFileNew = (): void => {
    handleCreateNote()
  }

  const handleFileOpen = (): void => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.txt,.md,.markdown,text/plain'

    fileInput.onchange = () => {
      const selectedFile = fileInput.files?.[0]
      if (!selectedFile) return

      const openFile = async (): Promise<void> => {
        try {
          const fileContent = await selectedFile.text()
          const fileTitle = deriveNoteTitleFromFileName(selectedFile.name)
          await upsertActiveNoteFromExternalContent(fileTitle, fileContent)
        } catch (error) {
          console.error('Failed to open file', error)
        }
      }

      void openFile()
    }

    fileInput.click()
  }

  const handleFileSave = (): void => {
    if (!activeNote) return

    const baseFileName = ensureTxtExtension(sanitizeDownloadFileName(activeNote.title || 'Untitled Note'))
    downloadNoteAsText(baseFileName, activeNote.content)
  }

  const handleFileSaveAs = (): void => {
    if (!activeNote) return

    const defaultFileName = ensureTxtExtension(sanitizeDownloadFileName(activeNote.title || 'Untitled Note'))
    setSaveAsFileName(defaultFileName)
    setIsSaveAsModalOpen(true)
  }

  const handleCancelSaveAs = (): void => {
    setIsSaveAsModalOpen(false)
  }

  const handleConfirmSaveAs = (): void => {
    if (!activeNote) return

    const normalizedName = sanitizeDownloadFileName(saveAsFileName)
    if (!normalizedName) return

    const targetFileName = ensureTxtExtension(normalizedName)
    downloadNoteAsText(targetFileName, activeNote.content)
    setIsSaveAsModalOpen(false)
  }

  const handleFilePrint = (): void => {
    if (!activeNote) return

    setPrintTimestamp(formatPrintTimestamp(new Date()))
    window.requestAnimationFrame(() => {
      reactToPrint()
    })
  }

  const handleOpenShortcutsPage = (): void => {
    openHelpPageInNewTab('Keyboard Shortcuts in Online Notepad', 'Keyboard Shortcuts in Online Notepad', getShortcutsContentHtml())
  }

  const handleOpenPrivacyPage = (): void => {
    openHelpPageInNewTab('Privacy Policy', 'Privacy Policy', getPrivacyPolicyContentHtml())
  }

  const handleOpenAboutModal = (): void => {
    setIsAboutModalOpen(true)
  }

  const handleBackupNotes = (): void => {
    const backupNotes = async (): Promise<void> => {
      try {
        const notesApi = getNotesApi()
        if (notesApi && typeof notesApi.backup === 'function') {
          const backupResult = await notesApi.backup()
          window.alert(`Backup completed.\nSaved: ${backupResult.path}\nNotes: ${backupResult.count}`)
          return
        }

        const notesForBackup = normalizeNotes(
          notesApi && typeof notesApi.list === 'function' ? await notesApi.list() : notes
        )
        const backupName = downloadBrowserBackup(notesForBackup)
        window.alert(`Backup downloaded as ${backupName}`)
      } catch (error) {
        console.error('Failed to backup notes', error)
      }
    }

    void backupNotes()
  }

  const handleRequestClearNotes = (): void => {
    if (notes.length === 0) return
    setIsClearModalOpen(true)
  }

  const handleConfirmClearNotes = (): void => {
    const clearNotes = async (): Promise<void> => {
      try {
        clearPendingUpdate()
        const notesApi = getNotesApi()
        if (notesApi && typeof notesApi.clear === 'function') {
          await notesApi.clear()
        } else if (notesApi && typeof notesApi.delete === 'function') {
          const deleteNote = notesApi.delete
          const currentNotes = notesApi && typeof notesApi.list === 'function' ? await notesApi.list() : notes
          await Promise.all(currentNotes.map((note) => deleteNote(note.id)))
        } else {
          saveBrowserNotes([])
        }

        setNotes([])
        setActiveNoteId('')
      } catch (error) {
        console.error('Failed to clear notes', error)
      } finally {
        setIsClearModalOpen(false)
      }
    }

    void clearNotes()
  }

  return (
    <main className="flex h-screen w-full flex-col bg-[#f5f6f8] font-sans text-[#2f3340]">
      {!isExpandedView && (
        <AppTopBar
          title={appTitle}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      )}

      <div className="flex min-h-0 flex-1">
        <div
          className={[
            'min-h-0 shrink-0 overflow-hidden transition-[width] duration-200 ease-out',
            isSidebarOpen ? 'w-[280px] border-r border-[#d9dee5] xl:w-[332px]' : 'w-0 border-r-0'
          ].join(' ')}
        >
          <NotesSidebar
            notes={notesForSidebar}
            activeNoteId={activeNote?.id ?? ''}
            onCreateNote={handleCreateNote}
            onSelectNote={setActiveNoteId}
            viewMode={sidebarViewMode}
            onChangeViewMode={setSidebarViewMode}
            sortMode={sidebarSortMode}
            onChangeSortMode={setSidebarSortMode}
            onBackup={handleBackupNotes}
            onClear={handleRequestClearNotes}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            hasAnyNotes={notes.length > 0}
          />
        </div>

        <div className="min-h-0 min-w-0 flex-1">
          <EditorPane
            menuItems={menuItems}
            onFileNew={handleFileNew}
            onFileOpen={handleFileOpen}
            onFileSave={handleFileSave}
            onFileSaveAs={handleFileSaveAs}
            onFilePrint={handleFilePrint}
            onHelpShortcuts={handleOpenShortcutsPage}
            onHelpPrivacy={handleOpenPrivacyPage}
            onHelpAbout={handleOpenAboutModal}
            noteTitle={activeNote?.title ?? null}
            noteContent={activeNote?.content ?? null}
            characterCount={activeNoteCharacterCount}
            isStatusBarVisible={isStatusBarVisible}
            onToggleStatusBar={() => setIsStatusBarVisible((prev) => !prev)}
            isWordWrapEnabled={isWordWrapEnabled}
            onToggleWordWrap={() => setIsWordWrapEnabled((prev) => !prev)}
            isFontSettingsOpen={isFontSettingsOpen}
            onOpenFontSettings={() => setIsFontSettingsOpen(true)}
            onCloseFontSettings={() => setIsFontSettingsOpen(false)}
            editorFontSettings={editorFontSettings}
            onChangeEditorFontSettings={setEditorFontSettings}
            onResetEditorFontSettings={() => setEditorFontSettings(defaultEditorFontSettings)}
            isSpellCheckEnabled={isSpellCheckEnabled}
            onToggleSpellCheck={() => setIsSpellCheckEnabled((prev) => !prev)}
            onChangeNoteTitle={handleChangeActiveNoteTitle}
            onChangeNoteContent={handleChangeActiveNoteContent}
            onDeleteNote={handleRequestDeleteActiveNote}
            isExpandedView={isExpandedView}
            onToggleExpandedView={handleToggleExpandedView}
          />
        </div>
      </div>

      <ConfirmModal
        title="Confirm"
        message="Are you sure you want to delete this note?"
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDeleteActiveNote}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <ConfirmModal
        title="Confirm"
        message="Are you sure you want to clear all notes?"
        isOpen={isClearModalOpen}
        onConfirm={handleConfirmClearNotes}
        onCancel={() => setIsClearModalOpen(false)}
      />

      <SaveAsModal
        isOpen={isSaveAsModalOpen}
        fileName={saveAsFileName}
        onFileNameChange={setSaveAsFileName}
        onSave={handleConfirmSaveAs}
        onCancel={handleCancelSaveAs}
      />

      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />

      <div ref={printContentRef} className="app-print-note-content">
        <style>{`
          .app-print-note-content {
            overflow: hidden;
            height: 0;
          }

          @media print {
            .app-print-note-content {
              overflow: visible !important;
              height: auto !important;
            }

            @page {
              size: auto;
              margin: 20mm 16mm;
            }

            .app-print-note-page {
              font-family: Arial, sans-serif;
              color: #1f232d;
              background: #ffffff;
            }

            .app-print-note-meta {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              align-items: center;
              margin: 0 0 16px;
              font-size: 12px;
            }

            .app-print-note-time {
              justify-self: start;
            }

            .app-print-note-title {
              justify-self: center;
              color: #8e213a;
            }

            .app-print-note-body {
              margin: 0;
              white-space: pre-wrap;
              word-break: break-word;
              font-size: 34px;
              line-height: 1.35;
              font-style: italic;
              font-weight: 700;
            }
          }
        `}</style>
        <main className="app-print-note-page">
          <div className="app-print-note-meta">
            <span className="app-print-note-time">{printTimestamp || formatPrintTimestamp(new Date())}</span>
            <span className="app-print-note-title">{printTitle}</span>
            <span />
          </div>
          <pre className="app-print-note-body">{printContent}</pre>
        </main>
      </div>
    </main>
  )
}
