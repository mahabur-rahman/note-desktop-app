import { useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import type {
  EditorFontSettings,
  NoteSummary,
  SidebarSortMode,
  SidebarViewMode
} from '../../types/ui'
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
const statusBarVisibleStorageKey = 'online-notes:status-bar-visible:v2'
const spellCheckEnabledStorageKey = 'online-notes:spell-check-enabled'
const wordWrapEnabledStorageKey = 'online-notes:word-wrap-enabled'
const editorFontSettingsStorageKey = 'online-notes:editor-font-settings'
const productionWebAppBaseUrl = 'https://onlinenotepad.org'
const privacyPolicyPath = '/privacy'
const shortcutsPath = '/keyboard-shortcuts'

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
  const withoutControlChars = Array.from(fileName, (character) =>
    character.charCodeAt(0) < 32 ? ' ' : character
  ).join('')
  const normalized = withoutControlChars
    .replace(/[<>:"/\\|?*]/g, ' ')
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

function buildUrlFromBase(path: string, baseUrl: string): string {
  try {
    return new URL(path, baseUrl).toString()
  } catch {
    return `${baseUrl.replace(/\/+$/, '')}${path}`
  }
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
    if (
      rawValue === 'alphabetical' ||
      rawValue === 'creation-date' ||
      rawValue === 'last-modified'
    ) {
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
    if (rawValue === null) return true
    return rawValue === 'true'
  } catch {
    return true
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

export function DesktopNotesLayout({
  appTitle,
  menuItems
}: DesktopNotesLayoutProps): React.JSX.Element {
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
  const [editorFontSettings, setEditorFontSettings] =
    useState<EditorFontSettings>(loadEditorFontSettings)
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
            normalizedTitle.includes(normalizedSearchQuery) ||
            normalizedContent.includes(normalizedSearchQuery)
          )
        })
  const sortedFilteredNotes = [...filteredNotes].sort((firstNote, secondNote) => {
    if (sidebarSortMode === 'alphabetical') {
      const titleCompare = firstNote.title.localeCompare(secondNote.title, undefined, {
        sensitivity: 'base'
      })
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
          notesApi && typeof notesApi.list === 'function'
            ? await notesApi.list()
            : loadBrowserNotes()
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
        await window.electron.ipcRenderer.invoke(
          'window:set-spell-check-enabled',
          isSpellCheckEnabled
        )
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
            const updatedNotes = prev.map((item) =>
              item.id === updatedNote.id ? updatedNote : item
            )
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
          notesApi && typeof notesApi.delete === 'function'
            ? await notesApi.delete(deletingNoteId)
            : true
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

  const upsertActiveNoteFromExternalContent = async (
    title: string,
    content: string
  ): Promise<void> => {
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

    const baseFileName = ensureTxtExtension(
      sanitizeDownloadFileName(activeNote.title || 'Untitled Note')
    )
    downloadNoteAsText(baseFileName, activeNote.content)
  }

  const handleFileSaveAs = (): void => {
    if (!activeNote) return

    const defaultFileName = ensureTxtExtension(
      sanitizeDownloadFileName(activeNote.title || 'Untitled Note')
    )
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

  const openHelpUrl = (path: string): void => {
    const browserBaseUrl =
      window.location.protocol === 'http:' || window.location.protocol === 'https:'
        ? window.location.origin
        : productionWebAppBaseUrl
    const browserUrl = buildUrlFromBase(path, browserBaseUrl)
    const isLocalDevelopmentOrigin =
      browserBaseUrl.startsWith('http://localhost:') ||
      browserBaseUrl.startsWith('http://127.0.0.1:')
    const desktopUrl = isLocalDevelopmentOrigin
      ? buildUrlFromBase(path, browserBaseUrl)
      : buildUrlFromBase(path, productionWebAppBaseUrl)

    const openInBrowserTab = (): void => {
      window.open(browserUrl, '_blank', 'noopener,noreferrer')
    }

    if (!window.electron?.ipcRenderer?.invoke) {
      openInBrowserTab()
      return
    }

    const openInDesktop = async (): Promise<void> => {
      try {
        const isOpened = await window.electron.ipcRenderer.invoke(
          'window:open-external',
          desktopUrl
        )
        if (!isOpened) window.open(desktopUrl, '_blank', 'noopener,noreferrer')
      } catch {
        window.open(desktopUrl, '_blank', 'noopener,noreferrer')
      }
    }

    void openInDesktop()
  }

  const handleOpenShortcutsPage = (): void => {
    const isDesktopApp = /Electron/i.test(navigator.userAgent)
    if (isDesktopApp) {
      window.location.hash = '#/keyboard-shortcuts'
      return
    }

    openHelpUrl(shortcutsPath)
  }

  const handleOpenPrivacyPage = (): void => {
    const isDesktopApp = /Electron/i.test(navigator.userAgent)
    if (isDesktopApp) {
      window.location.hash = '#/privacy'
      return
    }

    openHelpUrl(privacyPolicyPath)
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
          window.alert(
            `Backup completed.\nSaved: ${backupResult.path}\nNotes: ${backupResult.count}`
          )
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
          const currentNotes =
            notesApi && typeof notesApi.list === 'function' ? await notesApi.list() : notes
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
    <main className="flex h-screen w-full flex-col bg-[radial-gradient(circle_at_top,#f7faff_0%,#edf4ff_45%,#e6eefb_100%)] font-sans text-[#2f3340]">
      {!isExpandedView && (
        <AppTopBar
          title={appTitle}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      )}

      <div
        className={[
          'flex min-h-0 flex-1',
          isExpandedView ? '' : 'gap-3 px-3 pt-3 pb-3 md:gap-4 md:px-4 md:pt-4 md:pb-4'
        ].join(' ')}
      >
        <div
          className={[
            'min-h-0 shrink-0 overflow-hidden transition-[width] duration-200 ease-out',
            isSidebarOpen
              ? [
                  'w-[288px] xl:w-[340px]',
                  'rounded-2xl border border-[#ccd7ea] bg-[#f4f7fd]',
                  'shadow-[0_10px_24px_rgba(32,49,82,0.08)]'
                ].join(' ')
              : 'w-0 border-0'
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

        <div
          className={[
            'min-h-0 min-w-0 flex-1 overflow-hidden border border-[#ccd7ea] bg-[#f7f9ff]',
            isExpandedView
              ? 'rounded-none shadow-none'
              : 'rounded-2xl shadow-[0_14px_30px_rgba(28,43,75,0.09)]'
          ].join(' ')}
        >
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
            <span className="app-print-note-time">
              {printTimestamp || formatPrintTimestamp(new Date())}
            </span>
            <span className="app-print-note-title">{printTitle}</span>
            <span />
          </div>
          <pre className="app-print-note-body">{printContent}</pre>
        </main>
      </div>
    </main>
  )
}
