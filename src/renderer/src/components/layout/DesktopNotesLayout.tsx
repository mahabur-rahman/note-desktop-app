import { useEffect, useMemo, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import type {
  AppTheme,
  EditorFontSettings,
  NoteSummary,
  NoteVersionRecord,
  SidebarSortMode,
  SidebarViewMode
} from '../../types/ui'
import { AboutModal } from '../common/AboutModal'
import { CommandPaletteModal, type CommandPaletteAction } from '../common/CommandPaletteModal'
import { ConfirmModal } from '../common/ConfirmModal'
import { SaveAsModal } from '../common/SaveAsModal'
import { VersionHistoryModal } from '../common/VersionHistoryModal'
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
  update: (payload: {
    id: string
    title: string
    content: string
    folder: string
    tags: string[]
    isPinned: boolean
    isDeleted: boolean
    deletedAt: number | null
    versions: NoteVersionRecord[]
  }) => Promise<NoteSummary | null>
  delete: (noteId: string) => Promise<boolean>
  clear: () => Promise<number>
  backup: () => Promise<{ path: string; count: number }>
}

type SaveState = 'saving' | 'saved' | 'error'
type BackupExportFormat = 'json' | 'txt' | 'md' | 'pdf'

const browserNotesStorageKey = 'online-notes:web-notes'
const sidebarViewModeStorageKey = 'online-notes:sidebar-view-mode'
const sidebarSortModeStorageKey = 'online-notes:sidebar-sort-mode'
const statusBarVisibleStorageKey = 'online-notes:status-bar-visible:v2'
const spellCheckEnabledStorageKey = 'online-notes:spell-check-enabled'
const wordWrapEnabledStorageKey = 'online-notes:word-wrap-enabled'
const editorFontSettingsStorageKey = 'online-notes:editor-font-settings'
const selectedFolderStorageKey = 'online-notes:selected-folder-filter'
const selectedTagsStorageKey = 'online-notes:selected-tag-filters'
const trashViewStorageKey = 'online-notes:is-trash-view'
const pinnedOnlyStorageKey = 'online-notes:pinned-only-filter'
const appThemeStorageKey = 'online-notes:theme'
const markdownPreviewStorageKey = 'online-notes:markdown-preview-enabled'
const productionWebAppBaseUrl = 'https://onlinenotepad.org'
const privacyPolicyPath = '/privacy'
const shortcutsPath = '/keyboard-shortcuts'
const backupMarkerStart = '---NOTENOVA_BACKUP_BEGIN---'
const backupMarkerEnd = '---NOTENOVA_BACKUP_END---'

const defaultEditorFontSettings: EditorFontSettings = {
  fontFamily: 'default',
  fontSize: 14,
  fontWeight: 400,
  fontStyle: 'normal',
  lineHeight: 1.5
}
const minVersionSnapshotIntervalMs = 30 * 1000

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

function chunkText(rawValue: string, chunkSize: number): string[] {
  const chunks: string[] = []
  for (let index = 0; index < rawValue.length; index += chunkSize) {
    chunks.push(rawValue.slice(index, index + chunkSize))
  }
  return chunks
}

function encodeBase64Utf8(rawValue: string): string {
  const bytes = new TextEncoder().encode(rawValue)
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize))
  }
  return btoa(binary)
}

function decodeBase64Utf8(rawValue: string): string {
  const binary = atob(rawValue)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function escapePdfText(rawValue: string): string {
  return rawValue
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function createPdfDocument(lines: string[]): Uint8Array {
  const streamCommands: string[] = ['BT', '/F1 10 Tf', '40 780 Td']

  lines.forEach((line, index) => {
    if (index > 0) streamCommands.push('0 -14 Td')
    streamCommands.push(`(${escapePdfText(line)}) Tj`)
  })

  streamCommands.push('ET')
  const contentStream = streamCommands.join('\n')

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n'
  ]

  let pdfSource = '%PDF-1.4\n'
  const offsets: number[] = [0]

  objects.forEach((objectSource) => {
    offsets.push(pdfSource.length)
    pdfSource += objectSource
  })

  const xrefStart = pdfSource.length
  pdfSource += `xref\n0 ${objects.length + 1}\n`
  pdfSource += '0000000000 65535 f \n'
  for (let index = 1; index <= objects.length; index += 1) {
    pdfSource += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }
  pdfSource += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new TextEncoder().encode(pdfSource)
}

function buildUrlFromBase(path: string, baseUrl: string): string {
  try {
    return new URL(path, baseUrl).toString()
  } catch {
    return `${baseUrl.replace(/\/+$/, '')}${path}`
  }
}

function normalizeTimestamp(rawValue: unknown, fallbackValue: number): number {
  if (typeof rawValue !== 'number' || Number.isNaN(rawValue)) return fallbackValue
  if (rawValue <= 0) return fallbackValue
  if (rawValue < 1_000_000_000_000) return Math.trunc(rawValue * 1000)
  return Math.trunc(rawValue)
}

function normalizeTagList(rawValue: unknown): string[] {
  if (!Array.isArray(rawValue)) return []
  const tags = rawValue
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  return [...new Set(tags)]
}

function normalizeVersions(rawValue: unknown): NoteVersionRecord[] {
  if (!Array.isArray(rawValue)) return []
  return rawValue
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : generateNoteId(),
      title: typeof item.title === 'string' ? item.title : 'Untitled Note',
      content: typeof item.content === 'string' ? item.content : '',
      savedAt: normalizeTimestamp(item.savedAt, Date.now())
    }))
    .slice(0, 50)
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

function normalizeSearchText(rawValue: string): string {
  return rawValue
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
}

function normalizeNotes(notes: Array<Partial<NoteSummary>>): NoteSummary[] {
  if (!Array.isArray(notes)) return []
  return notes.map((note) => {
    const now = Date.now()
    const createdAt = normalizeTimestamp(note.createdAt, now)
    const updatedAt = normalizeTimestamp(note.updatedAt, createdAt)
    const normalizedContent = typeof note.content === 'string' ? note.content : ''
    const normalizedTitle = typeof note.title === 'string' ? note.title : 'Untitled Note'

    return {
      id: typeof note.id === 'string' ? note.id : generateNoteId(),
      title: normalizedTitle,
      excerpt: typeof note.excerpt === 'string' ? note.excerpt : buildExcerpt(normalizedContent),
      content: normalizedContent,
      relativeTime: formatRelativeTime(updatedAt),
      createdAt,
      updatedAt,
      folder: typeof note.folder === 'string' ? note.folder : '',
      tags: normalizeTagList(note.tags),
      isPinned: Boolean(note.isPinned),
      isDeleted: Boolean(note.isDeleted),
      deletedAt: typeof note.deletedAt === 'number' ? note.deletedAt : null,
      versions: normalizeVersions(note.versions)
    }
  })
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

function loadSelectedFolder(): string {
  try {
    return window.localStorage.getItem(selectedFolderStorageKey) || 'all'
  } catch {
    return 'all'
  }
}

function loadSelectedTags(): string[] {
  try {
    const rawValue = window.localStorage.getItem(selectedTagsStorageKey)
    if (!rawValue) return []
    return normalizeTagList(JSON.parse(rawValue))
  } catch {
    return []
  }
}

function loadTrashView(): boolean {
  try {
    return window.localStorage.getItem(trashViewStorageKey) === 'true'
  } catch {
    return false
  }
}

function loadPinnedOnlyFilter(): boolean {
  try {
    return window.localStorage.getItem(pinnedOnlyStorageKey) === 'true'
  } catch {
    return false
  }
}

function loadAppTheme(): AppTheme {
  try {
    const rawValue = window.localStorage.getItem(appThemeStorageKey)
    if (rawValue === 'dark' || rawValue === 'sepia') return rawValue
    return 'light'
  } catch {
    return 'light'
  }
}

function loadMarkdownPreviewEnabled(): boolean {
  try {
    return window.localStorage.getItem(markdownPreviewStorageKey) === 'true'
  } catch {
    return false
  }
}

function downloadNoteFile(fileName: string, content: string | Uint8Array, mimeType: string): void {
  const normalizedContent =
    typeof content === 'string'
      ? content
      : (() => {
          const arrayBuffer = new ArrayBuffer(content.byteLength)
          new Uint8Array(arrayBuffer).set(content)
          return arrayBuffer
        })()
  const blob = new Blob([normalizedContent], { type: mimeType })
  const downloadUrl = URL.createObjectURL(blob)
  const anchorElement = document.createElement('a')
  anchorElement.href = downloadUrl
  anchorElement.download = fileName
  document.body.appendChild(anchorElement)
  anchorElement.click()
  anchorElement.remove()
  URL.revokeObjectURL(downloadUrl)
}

function createVersionSnapshot(note: NoteSummary, savedAt: number): NoteVersionRecord {
  return {
    id: generateNoteId(),
    title: note.title.trim() || 'Untitled Note',
    content: note.content,
    savedAt
  }
}

function attachVersionSnapshot(note: NoteSummary, savedAt: number): NoteSummary {
  const latestVersion = note.versions[0]
  const nextSnapshot = createVersionSnapshot(note, savedAt)

  if (latestVersion && savedAt - latestVersion.savedAt < minVersionSnapshotIntervalMs) {
    return {
      ...note,
      versions: note.versions.slice(0, 50)
    }
  }

  if (
    latestVersion &&
    latestVersion.title === nextSnapshot.title &&
    latestVersion.content === nextSnapshot.content
  ) {
    return {
      ...note,
      versions: note.versions.slice(0, 50)
    }
  }

  return {
    ...note,
    versions: [nextSnapshot, ...note.versions].slice(0, 50)
  }
}

function buildBackupExportResource(
  notes: NoteSummary[],
  format: BackupExportFormat
): { fileName: string; content: string | Uint8Array; mimeType: string } {
  const payload = {
    createdAt: new Date().toISOString(),
    count: notes.length,
    notes
  }
  const payloadJson = JSON.stringify(payload, null, 2)
  const base64Payload = encodeBase64Utf8(payloadJson)
  const encodedChunks = chunkText(base64Payload, 96)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  if (format === 'json') {
    return {
      fileName: `notes-backup-${timestamp}.json`,
      content: payloadJson,
      mimeType: 'application/json'
    }
  }

  if (format === 'txt') {
    const content = [
      'NoteNova Studio Backup',
      `Created: ${payload.createdAt}`,
      `Total notes: ${payload.count}`,
      'Import this file from Backup > Import backup in the app.',
      '',
      backupMarkerStart,
      ...encodedChunks,
      backupMarkerEnd
    ].join('\n')
    return {
      fileName: `notes-backup-${timestamp}.txt`,
      content,
      mimeType: 'text/plain;charset=utf-8'
    }
  }

  if (format === 'md') {
    const content = [
      '# NoteNova Studio Backup',
      '',
      `- Created: ${payload.createdAt}`,
      `- Total notes: ${payload.count}`,
      '',
      '> Import this file from **Backup > Import backup** in NoteNova Studio.',
      '',
      backupMarkerStart,
      ...encodedChunks,
      backupMarkerEnd
    ].join('\n')
    return {
      fileName: `notes-backup-${timestamp}.md`,
      content,
      mimeType: 'text/markdown;charset=utf-8'
    }
  }

  const pdfLines = [
    'NoteNova Studio Backup',
    `Created: ${payload.createdAt}`,
    `Total notes: ${payload.count}`,
    'Import this file from Backup > Import backup in NoteNova Studio.',
    backupMarkerStart,
    ...encodedChunks,
    backupMarkerEnd
  ]

  return {
    fileName: `notes-backup-${timestamp}.pdf`,
    content: createPdfDocument(pdfLines),
    mimeType: 'application/pdf'
  }
}

function parseBackupPayload(rawContent: string): NoteSummary[] {
  const extractNotesFromJson = (rawText: string): NoteSummary[] => {
    let parsed: unknown
    try {
      parsed = JSON.parse(rawText) as unknown
    } catch {
      return []
    }

    if (Array.isArray(parsed)) {
      return normalizeNotes(parsed as Array<Partial<NoteSummary>>)
    }

    if (typeof parsed === 'object' && parsed !== null && 'notes' in parsed) {
      const payload = parsed as { notes?: Array<Partial<NoteSummary>> }
      return normalizeNotes(payload.notes ?? [])
    }

    return []
  }
  const directNotes = extractNotesFromJson(rawContent)
  if (directNotes.length > 0) return directNotes

  const markerPattern = new RegExp(`${backupMarkerStart}([\\s\\S]*?)${backupMarkerEnd}`, 'm')
  const markerMatch = rawContent.match(markerPattern)
  if (!markerMatch) return []

  const base64Payload = markerMatch[1].replace(/[^A-Za-z0-9+/=]/g, '')
  if (!base64Payload) return []

  try {
    const decodedJson = decodeBase64Utf8(base64Payload)
    return extractNotesFromJson(decodedJson)
  } catch {
    return []
  }
}

function focusEditorWithCommand(command: string): void {
  window.dispatchEvent(new CustomEvent('notepad:editor-command', { detail: command }))
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
  const [selectedFolder, setSelectedFolder] = useState(loadSelectedFolder)
  const [selectedTags, setSelectedTags] = useState<string[]>(loadSelectedTags)
  const [isTrashView, setIsTrashView] = useState(loadTrashView)
  const [isPinnedOnly, setIsPinnedOnly] = useState(loadPinnedOnlyFilter)
  const [appTheme, setAppTheme] = useState<AppTheme>(loadAppTheme)
  const [isMarkdownPreviewEnabled, setIsMarkdownPreviewEnabled] = useState(
    loadMarkdownPreviewEnabled
  )
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [commandPaletteSession, setCommandPaletteSession] = useState(0)
  const [saveAsFileName, setSaveAsFileName] = useState('')
  const [printTimestamp, setPrintTimestamp] = useState('')
  const [timeNow, setTimeNow] = useState(() => Date.now())
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const updateTimeoutIdRef = useRef<number | null>(null)
  const printContentRef = useRef<HTMLDivElement | null>(null)

  const activeNote = notes.find((note) => note.id === activeNoteId) ?? null

  const scopedNotes = useMemo(
    () => notes.filter((note) => (isTrashView ? note.isDeleted : !note.isDeleted)),
    [isTrashView, notes]
  )

  const availableFolders = useMemo(() => {
    const folderCounts = new Map<string, number>()
    notes
      .filter((note) => !note.isDeleted)
      .forEach((note) => {
        const folder = note.folder.trim()
        if (!folder) return
        folderCounts.set(folder, (folderCounts.get(folder) ?? 0) + 1)
      })

    return [...folderCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }, [notes])

  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    notes
      .filter((note) => !note.isDeleted)
      .forEach((note) => {
        note.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1))
      })

    return [...tagCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }, [notes])

  const normalizedSearchQuery = normalizeSearchText(searchQuery.trim())

  const filteredNotes = useMemo(() => {
    return scopedNotes.filter((note) => {
      if (
        !isTrashView &&
        selectedFolder !== 'all' &&
        note.folder !== selectedFolder &&
        !note.folder.startsWith(`${selectedFolder}/`)
      ) {
        return false
      }
      if (!isTrashView && selectedTags.length > 0) {
        const noteTagSet = new Set(note.tags)
        if (!selectedTags.every((tag) => noteTagSet.has(tag))) return false
      }
      if (!isTrashView && isPinnedOnly && !note.isPinned) return false

      if (normalizedSearchQuery === '') return true
      const haystack = [note.title, note.content, note.folder, note.tags.join(' ')].join(' ')
      return normalizeSearchText(haystack).includes(normalizedSearchQuery)
    })
  }, [isPinnedOnly, isTrashView, normalizedSearchQuery, scopedNotes, selectedFolder, selectedTags])

  const sortedFilteredNotes = useMemo(() => {
    return [...filteredNotes].sort((firstNote, secondNote) => {
      if (!isTrashView && firstNote.isPinned !== secondNote.isPinned) {
        return firstNote.isPinned ? -1 : 1
      }

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
  }, [filteredNotes, isTrashView, sidebarSortMode])

  const notesForSidebar = useMemo(
    () =>
      sortedFilteredNotes.map((note) => ({
        ...note,
        relativeTime: formatRelativeTime(note.updatedAt, timeNow)
      })),
    [sortedFilteredNotes, timeNow]
  )

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
        const loadedNotes =
          notesApi && typeof notesApi.list === 'function'
            ? await notesApi.list()
            : loadBrowserNotes()
        const normalizedNotes = normalizeNotes(loadedNotes)
        setNotes(normalizedNotes)
        const firstActiveNote =
          normalizedNotes.find((note) => !note.isDeleted) ??
          normalizedNotes.find((note) => note.isDeleted) ??
          null
        setActiveNoteId(firstActiveNote?.id ?? '')
        setLastSavedAt(Date.now())
      } catch (error) {
        console.error('Failed to load notes', error)
      }
    }

    void loadNotes()
  }, [])

  useEffect(() => {
    const firstScopedNote = scopedNotes[0]
    if (!firstScopedNote) {
      if (activeNoteId) setActiveNoteId('')
      return
    }

    const hasActiveInScope = scopedNotes.some((note) => note.id === activeNoteId)
    if (!hasActiveInScope) setActiveNoteId(firstScopedNote.id)
  }, [activeNoteId, scopedNotes])

  useEffect(() => {
    const intervalId = window.setInterval(() => setTimeNow(Date.now()), 60 * 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    return () => {
      clearPendingUpdate()
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarViewModeStorageKey, sidebarViewMode)
      window.localStorage.setItem(sidebarSortModeStorageKey, sidebarSortMode)
      window.localStorage.setItem(statusBarVisibleStorageKey, String(isStatusBarVisible))
      window.localStorage.setItem(spellCheckEnabledStorageKey, String(isSpellCheckEnabled))
      window.localStorage.setItem(wordWrapEnabledStorageKey, String(isWordWrapEnabled))
      window.localStorage.setItem(editorFontSettingsStorageKey, JSON.stringify(editorFontSettings))
      window.localStorage.setItem(selectedFolderStorageKey, selectedFolder)
      window.localStorage.setItem(selectedTagsStorageKey, JSON.stringify(selectedTags))
      window.localStorage.setItem(trashViewStorageKey, String(isTrashView))
      window.localStorage.setItem(pinnedOnlyStorageKey, String(isPinnedOnly))
      window.localStorage.setItem(appThemeStorageKey, appTheme)
      window.localStorage.setItem(markdownPreviewStorageKey, String(isMarkdownPreviewEnabled))
    } catch {
      // Ignore localStorage failures in restricted contexts.
    }
  }, [
    appTheme,
    editorFontSettings,
    isMarkdownPreviewEnabled,
    isSpellCheckEnabled,
    isStatusBarVisible,
    isTrashView,
    isPinnedOnly,
    isWordWrapEnabled,
    selectedFolder,
    selectedTags,
    sidebarSortMode,
    sidebarViewMode
  ])

  useEffect(() => {
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
    const syncFullScreenState = async (): Promise<void> => {
      try {
        const isFullScreen = await window.electron.ipcRenderer.invoke('window:is-full-screen')
        setIsExpandedView(Boolean(isFullScreen))
      } catch {
        // Keep fallback state if IPC unavailable.
      }
    }

    void syncFullScreenState()
  }, [])

  const persistSingleNote = async (note: NoteSummary): Promise<NoteSummary | null> => {
    const notesApi = getNotesApi()
    const noteWithVersion = attachVersionSnapshot(note, Date.now())

    if (notesApi && typeof notesApi.update === 'function') {
      const updatedNote = await notesApi.update({
        id: noteWithVersion.id,
        title: noteWithVersion.title,
        content: noteWithVersion.content,
        folder: noteWithVersion.folder,
        tags: noteWithVersion.tags,
        isPinned: noteWithVersion.isPinned,
        isDeleted: noteWithVersion.isDeleted,
        deletedAt: noteWithVersion.deletedAt,
        versions: noteWithVersion.versions
      })

      if (!updatedNote) return null
      return normalizeNotes([updatedNote])[0] ?? null
    }

    return noteWithVersion
  }

  const queuePersistNote = (note: NoteSummary, delayMs: number = 250): void => {
    clearPendingUpdate()
    setSaveState('saving')

    updateTimeoutIdRef.current = window.setTimeout(() => {
      const persistNote = async (): Promise<void> => {
        try {
          const persistedNote = await persistSingleNote(note)
          if (!persistedNote) {
            setSaveState('error')
            return
          }

          setNotes((prev) => {
            const updatedNotes = prev.map((item) =>
              item.id === persistedNote.id ? persistedNote : item
            )
            const notesApi = getNotesApi()
            if (!notesApi) saveBrowserNotes(updatedNotes)
            return updatedNotes
          })
          setSaveState('saved')
          setLastSavedAt(Date.now())
        } catch (error) {
          console.error('Failed to update note', error)
          setSaveState('error')
        } finally {
          updateTimeoutIdRef.current = null
        }
      }

      void persistNote()
    }, delayMs)
  }

  const updateNoteById = (
    noteId: string,
    updater: (note: NoteSummary) => NoteSummary,
    options: { persist?: boolean; delayMs?: number } = {}
  ): void => {
    let updatedNote: NoteSummary | null = null

    setNotes((prev) => {
      const next = prev.map((note) => {
        if (note.id !== noteId) return note
        const nextNote = updater(note)
        updatedNote = nextNote
        return nextNote
      })

      const notesApi = getNotesApi()
      if (!notesApi) saveBrowserNotes(next)
      return next
    })

    if (updatedNote && options.persist !== false) {
      queuePersistNote(updatedNote, options.delayMs)
    }
  }

  const handleChangeActiveNoteTitle = (title: string): void => {
    if (!activeNote) return
    const now = Date.now()

    updateNoteById(activeNote.id, (note) => ({
      ...note,
      title,
      relativeTime: 'just now',
      updatedAt: now
    }))
  }

  const handleChangeActiveNoteContent = (content: string): void => {
    if (!activeNote) return
    const now = Date.now()

    updateNoteById(activeNote.id, (note) => ({
      ...note,
      content,
      excerpt: buildExcerpt(content),
      relativeTime: 'just now',
      updatedAt: now
    }))
  }

  const handleChangeActiveNoteFolder = (folder: string): void => {
    if (!activeNote || activeNote.isDeleted) return
    const normalizedFolder = folder.trim()
    const now = Date.now()

    updateNoteById(activeNote.id, (note) => ({
      ...note,
      folder: normalizedFolder,
      relativeTime: 'just now',
      updatedAt: now
    }))
  }

  const handleChangeActiveNoteTags = (tags: string[]): void => {
    if (!activeNote || activeNote.isDeleted) return
    const now = Date.now()

    updateNoteById(activeNote.id, (note) => ({
      ...note,
      tags,
      relativeTime: 'just now',
      updatedAt: now
    }))
  }

  const handleTogglePinNote = (): void => {
    if (!activeNote || activeNote.isDeleted) return
    const now = Date.now()

    updateNoteById(
      activeNote.id,
      (note) => ({
        ...note,
        isPinned: !note.isPinned,
        relativeTime: 'just now',
        updatedAt: now
      }),
      { delayMs: 0 }
    )
  }

  const moveNoteToTrash = (noteId: string): void => {
    const now = Date.now()

    updateNoteById(
      noteId,
      (note) => ({
        ...note,
        isDeleted: true,
        deletedAt: now,
        isPinned: false,
        relativeTime: 'just now',
        updatedAt: now
      }),
      { delayMs: 0 }
    )
  }

  const restoreNoteFromTrash = (noteId: string): void => {
    const now = Date.now()

    updateNoteById(
      noteId,
      (note) => ({
        ...note,
        isDeleted: false,
        deletedAt: null,
        relativeTime: 'just now',
        updatedAt: now
      }),
      { delayMs: 0 }
    )
  }

  const permanentlyDeleteNote = (noteId: string): void => {
    const deleteNote = async (): Promise<void> => {
      try {
        clearPendingUpdate()
        const notesApi = getNotesApi()
        const isDeleted =
          notesApi && typeof notesApi.delete === 'function' ? await notesApi.delete(noteId) : true

        if (!isDeleted) return

        setNotes((prev) => {
          const remainingNotes = prev.filter((note) => note.id !== noteId)
          if (!notesApi) saveBrowserNotes(remainingNotes)
          return remainingNotes
        })
        setSaveState('saved')
      } catch (error) {
        console.error('Failed to delete note', error)
        setSaveState('error')
      }
    }

    void deleteNote()
  }

  const handleToggleExpandedView = (): void => {
    const toggleFullScreen = async (): Promise<void> => {
      try {
        const isFullScreen = await window.electron.ipcRenderer.invoke('window:toggle-full-screen')
        setIsExpandedView(Boolean(isFullScreen))
      } catch {
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

    if (activeNote.isDeleted) {
      permanentlyDeleteNote(activeNote.id)
    } else {
      moveNoteToTrash(activeNote.id)
    }

    setIsDeleteModalOpen(false)
  }

  const handleCreateNote = (): void => {
    if (isTrashView) return

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
                updatedAt: now,
                folder: selectedFolder === 'all' ? '' : selectedFolder,
                tags: [],
                isPinned: false,
                isDeleted: false,
                deletedAt: null,
                versions: []
              }

        if (!createdNote) return

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

    if (activeNote && !activeNote.isDeleted) {
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
            updatedAt: now,
            folder: selectedFolder === 'all' ? '' : selectedFolder,
            tags: [],
            isPinned: false,
            isDeleted: false,
            deletedAt: null,
            versions: []
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
    downloadNoteFile(baseFileName, activeNote.content, 'text/plain;charset=utf-8')
  }

  const handleFileExportMarkdown = (): void => {
    if (!activeNote) return

    const fileName = ensureTxtExtension(
      sanitizeDownloadFileName(activeNote.title || 'Untitled Note')
    )
    downloadNoteFile(fileName, activeNote.content, 'text/plain;charset=utf-8')
  }

  const handleFileExportPdf = (): void => {
    if (!activeNote) return

    setPrintTimestamp(formatPrintTimestamp(new Date()))
    window.requestAnimationFrame(() => {
      reactToPrint()
    })
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
    downloadNoteFile(targetFileName, activeNote.content, 'text/plain;charset=utf-8')
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
    const rawFormat = window
      .prompt('Choose backup format: json, txt, md, pdf', 'json')
      ?.trim()
      .toLowerCase()

    if (!rawFormat) return
    if (!['json', 'txt', 'md', 'pdf'].includes(rawFormat)) {
      window.alert('Invalid format. Use one of: json, txt, md, pdf')
      return
    }

    const format = rawFormat as BackupExportFormat
    const backupResource = buildBackupExportResource(notes, format)
    downloadNoteFile(backupResource.fileName, backupResource.content, backupResource.mimeType)
    window.alert(`Backup exported as ${backupResource.fileName}`)
  }

  const handleImportBackupNotes = (): void => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept =
      '.json,.txt,.md,.pdf,application/json,text/plain,text/markdown,application/pdf'

    fileInput.onchange = () => {
      const selectedFile = fileInput.files?.[0]
      if (!selectedFile) return

      const importBackup = async (): Promise<void> => {
        try {
          const rawContent = await selectedFile.text()
          const importedNotes = parseBackupPayload(rawContent)
          if (importedNotes.length === 0) {
            window.alert('No valid notes found in backup file.')
            return
          }

          const notesApi = getNotesApi()

          if (
            notesApi &&
            typeof notesApi.clear === 'function' &&
            typeof notesApi.create === 'function' &&
            typeof notesApi.update === 'function'
          ) {
            await notesApi.clear()
            const restored: NoteSummary[] = []

            for (const importedNote of importedNotes) {
              const createdNote = await notesApi.create()
              const updated = await notesApi.update({
                id: createdNote.id,
                title: importedNote.title,
                content: importedNote.content,
                folder: importedNote.folder,
                tags: importedNote.tags,
                isPinned: importedNote.isPinned,
                isDeleted: importedNote.isDeleted,
                deletedAt: importedNote.deletedAt,
                versions: importedNote.versions
              })

              if (updated) restored.push(normalizeNotes([updated])[0] as NoteSummary)
            }

            setNotes(restored)
            const firstScopedNote = restored.find((note) =>
              isTrashView ? note.isDeleted : !note.isDeleted
            )
            setActiveNoteId(firstScopedNote?.id ?? '')
          } else {
            setNotes(importedNotes)
            saveBrowserNotes(importedNotes)
            const firstScopedNote = importedNotes.find((note) =>
              isTrashView ? note.isDeleted : !note.isDeleted
            )
            setActiveNoteId(firstScopedNote?.id ?? '')
          }

          setSaveState('saved')
          setLastSavedAt(Date.now())
          window.alert(`Imported ${importedNotes.length} notes from backup.`)
        } catch (error) {
          console.error('Failed to import backup', error)
          window.alert('Backup import failed. Please use a valid JSON backup file.')
        }
      }

      void importBackup()
    }

    fileInput.click()
  }

  const handleRequestClearNotes = (): void => {
    if (scopedNotes.length === 0) return
    setIsClearModalOpen(true)
  }

  const handleConfirmClearNotes = (): void => {
    const clearNotes = async (): Promise<void> => {
      try {
        clearPendingUpdate()
        const targetNotes = notes.filter((note) => (isTrashView ? note.isDeleted : !note.isDeleted))
        if (targetNotes.length === 0) return

        const notesApi = getNotesApi()

        if (isTrashView) {
          if (notesApi && typeof notesApi.delete === 'function') {
            const deleteNote = notesApi.delete
            await Promise.all(targetNotes.map((note) => deleteNote(note.id)))
          }

          setNotes((prev) => {
            const remaining = prev.filter((note) => !note.isDeleted)
            if (!notesApi) saveBrowserNotes(remaining)
            return remaining
          })
        } else {
          const now = Date.now()
          const movedToTrash = targetNotes.map((note) => ({
            ...note,
            isDeleted: true,
            deletedAt: now,
            isPinned: false,
            updatedAt: now,
            relativeTime: 'just now'
          }))

          setNotes((prev) => {
            const movedMap = new Map(movedToTrash.map((note) => [note.id, note]))
            const next = prev.map((note) => movedMap.get(note.id) ?? note)
            if (!notesApi) saveBrowserNotes(next)
            return next
          })

          if (notesApi && typeof notesApi.update === 'function') {
            const updateNote = notesApi.update
            await Promise.all(
              movedToTrash.map((note) =>
                updateNote({
                  id: note.id,
                  title: note.title,
                  content: note.content,
                  folder: note.folder,
                  tags: note.tags,
                  isPinned: note.isPinned,
                  isDeleted: note.isDeleted,
                  deletedAt: note.deletedAt,
                  versions: note.versions
                })
              )
            )
          }
        }

        setSaveState('saved')
        setLastSavedAt(Date.now())
      } catch (error) {
        console.error('Failed to clear notes', error)
        setSaveState('error')
      } finally {
        setIsClearModalOpen(false)
      }
    }

    void clearNotes()
  }

  const handleRestoreVersion = (versionId: string): void => {
    if (!activeNote) return

    const targetVersion = activeNote.versions.find((version) => version.id === versionId)
    if (!targetVersion) return

    const now = Date.now()
    const nextNote: NoteSummary = {
      ...activeNote,
      title: targetVersion.title,
      content: targetVersion.content,
      excerpt: buildExcerpt(targetVersion.content),
      updatedAt: now,
      relativeTime: 'just now'
    }

    setNotes((prev) => prev.map((note) => (note.id === nextNote.id ? nextNote : note)))
    queuePersistNote(nextNote, 0)
  }

  const commandPaletteActions: CommandPaletteAction[] = [
    {
      id: 'new-note',
      title: 'New note',
      subtitle: 'Create a new blank note',
      keywords: ['new', 'note', 'create'],
      onSelect: handleCreateNote
    },
    {
      id: 'open-file',
      title: 'Open file',
      subtitle: 'Import .txt or .md into active note',
      keywords: ['open', 'file', 'import'],
      onSelect: handleFileOpen
    },
    {
      id: 'save-note',
      title: 'Save as .txt',
      subtitle: 'Export active note as text file',
      keywords: ['save', 'txt', 'export'],
      onSelect: handleFileSave
    },
    {
      id: 'save-md',
      title: 'Export TXT',
      subtitle: 'Export active note as .txt',
      keywords: ['text', 'txt', 'export'],
      onSelect: handleFileExportMarkdown
    },
    {
      id: 'print',
      title: 'Print / Export PDF',
      subtitle: 'Open print dialog with clean print theme',
      keywords: ['print', 'pdf'],
      onSelect: handleFilePrint
    },
    {
      id: 'export-backup',
      title: 'Export backup',
      subtitle: 'Create portable JSON backup file',
      keywords: ['backup', 'export', 'sync'],
      onSelect: handleBackupNotes
    },
    {
      id: 'import-backup',
      title: 'Import backup',
      subtitle: 'Restore notes from backup JSON file',
      keywords: ['backup', 'import', 'restore'],
      onSelect: handleImportBackupNotes
    },
    {
      id: 'find-replace',
      title: 'Find and replace',
      subtitle: 'Open find & replace modal',
      keywords: ['find', 'replace', 'search'],
      onSelect: () => focusEditorWithCommand('open-find-replace')
    },
    {
      id: 'toggle-word-wrap',
      title: 'Toggle word wrap',
      subtitle: 'Enable or disable wrapping',
      keywords: ['wrap', 'line', 'format'],
      onSelect: () => setIsWordWrapEnabled((prev) => !prev)
    },
    {
      id: 'toggle-pinned-filter',
      title: isPinnedOnly ? 'Show all notes' : 'Show pinned only',
      subtitle: 'Quick filter for priority notes',
      keywords: ['pinned', 'favorite', 'star'],
      onSelect: () => setIsPinnedOnly((prev) => !prev)
    },
    {
      id: 'toggle-trash-view',
      title: isTrashView ? 'Switch to notes view' : 'Switch to trash view',
      subtitle: 'Jump between active notes and recycle bin',
      keywords: ['trash', 'recycle', 'deleted'],
      onSelect: () => setIsTrashView((prev) => !prev)
    },
    {
      id: 'toggle-markdown-preview',
      title: 'Toggle markdown preview',
      subtitle: 'Switch split view for markdown preview',
      keywords: ['preview', 'markdown', 'split'],
      onSelect: () => setIsMarkdownPreviewEnabled((prev) => !prev)
    },
    {
      id: 'theme-light',
      title: 'Set theme: Light',
      subtitle: 'Switch to light mode',
      keywords: ['theme', 'light'],
      onSelect: () => setAppTheme('light')
    },
    {
      id: 'theme-sepia',
      title: 'Set theme: Sepia',
      subtitle: 'Switch to sepia mode',
      keywords: ['theme', 'sepia'],
      onSelect: () => setAppTheme('sepia')
    },
    {
      id: 'theme-dark',
      title: 'Set theme: Dark',
      subtitle: 'Switch to dark mode',
      keywords: ['theme', 'dark'],
      onSelect: () => setAppTheme('dark')
    },
    {
      id: 'help-shortcuts',
      title: 'Open keyboard shortcuts',
      subtitle: 'See available productivity shortcuts',
      keywords: ['help', 'shortcut', 'keyboard'],
      onSelect: handleOpenShortcutsPage
    },
    {
      id: 'open-version-history',
      title: 'Open version history',
      subtitle: 'Restore previous content snapshots',
      keywords: ['history', 'version', 'restore'],
      onSelect: () => setIsVersionHistoryOpen(true)
    }
  ]

  useEffect(() => {
    const handleGlobalCommandShortcut = (event: KeyboardEvent): void => {
      const isModPressed = event.ctrlKey || event.metaKey
      if (!isModPressed) return
      if (event.key.toLocaleLowerCase() !== 'k') return

      event.preventDefault()
      setCommandPaletteSession((prev) => prev + 1)
      setIsCommandPaletteOpen(true)
    }

    window.addEventListener('keydown', handleGlobalCommandShortcut)
    return () => window.removeEventListener('keydown', handleGlobalCommandShortcut)
  }, [])

  const themeWrapperClass =
    appTheme === 'dark'
      ? 'bg-[radial-gradient(circle_at_top,#101a2d_0%,#0c1422_50%,#0a111e_100%)] text-[#dce6f7]'
      : appTheme === 'sepia'
        ? 'bg-[radial-gradient(circle_at_top,#f8eed7_0%,#f5e8cf_52%,#efe0c5_100%)] text-[#4f412d]'
        : 'bg-[radial-gradient(circle_at_top,#f7faff_0%,#edf4ff_45%,#e6eefb_100%)] text-[#2f3340]'

  return (
    <main className={`flex h-screen w-full flex-col font-sans ${themeWrapperClass}`}>
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
                  'w-[300px] xl:w-[356px]',
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
            onBackupExport={handleBackupNotes}
            onBackupImport={handleImportBackupNotes}
            onClear={handleRequestClearNotes}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            hasAnyNotes={scopedNotes.length > 0}
            isTrashView={isTrashView}
            onChangeTrashView={(value) => {
              setIsTrashView(value)
              setSelectedFolder('all')
              setSelectedTags([])
              setIsPinnedOnly(false)
            }}
            availableFolders={availableFolders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            isPinnedOnly={isPinnedOnly}
            onTogglePinnedOnly={() => setIsPinnedOnly((prev) => !prev)}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onToggleTag={(tag) => {
              setSelectedTags((prev) =>
                prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
              )
            }}
            onClearTagFilters={() => setSelectedTags([])}
            onTogglePin={(noteId) => {
              updateNoteById(
                noteId,
                (note) => ({
                  ...note,
                  isPinned: !note.isPinned,
                  updatedAt: Date.now(),
                  relativeTime: 'just now'
                }),
                { delayMs: 0 }
              )
            }}
            onRestoreNote={restoreNoteFromTrash}
            onMoveNoteToTrash={moveNoteToTrash}
            onPermanentDeleteNote={permanentlyDeleteNote}
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
            onFileExportMarkdown={handleFileExportMarkdown}
            onFileExportPdf={handleFileExportPdf}
            onHelpShortcuts={handleOpenShortcutsPage}
            onHelpPrivacy={handleOpenPrivacyPage}
            onHelpAbout={handleOpenAboutModal}
            noteId={activeNote?.id ?? null}
            noteTitle={activeNote?.title ?? null}
            noteContent={activeNote?.content ?? null}
            noteFolder={activeNote?.folder ?? null}
            noteTags={activeNote?.tags ?? []}
            availableFolders={availableFolders.map((item) => item.name)}
            isNotePinned={Boolean(activeNote?.isPinned)}
            isNoteDeleted={Boolean(activeNote?.isDeleted)}
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
            onChangeNoteFolder={handleChangeActiveNoteFolder}
            onChangeNoteTags={handleChangeActiveNoteTags}
            onDeleteNote={handleRequestDeleteActiveNote}
            onRestoreNote={() => {
              if (!activeNote) return
              restoreNoteFromTrash(activeNote.id)
            }}
            onPermanentDeleteNote={() => {
              if (!activeNote) return
              permanentlyDeleteNote(activeNote.id)
            }}
            onTogglePinNote={handleTogglePinNote}
            onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
            saveState={saveState}
            lastSavedAt={lastSavedAt}
            isExpandedView={isExpandedView}
            onToggleExpandedView={handleToggleExpandedView}
            appTheme={appTheme}
            onChangeTheme={setAppTheme}
            isMarkdownPreviewEnabled={isMarkdownPreviewEnabled}
            onToggleMarkdownPreview={() => setIsMarkdownPreviewEnabled((prev) => !prev)}
            onOpenCommandPalette={() => {
              setCommandPaletteSession((prev) => prev + 1)
              setIsCommandPaletteOpen(true)
            }}
          />
        </div>
      </div>

      <ConfirmModal
        title="Confirm"
        message={
          activeNote?.isDeleted ? 'Delete this note permanently?' : 'Move this note to trash?'
        }
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDeleteActiveNote}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <ConfirmModal
        title="Confirm"
        message={
          isTrashView ? 'Permanently delete all notes in trash?' : 'Move all active notes to trash?'
        }
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

      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        versions={activeNote?.versions ?? []}
        onRestoreVersion={handleRestoreVersion}
        onClose={() => setIsVersionHistoryOpen(false)}
      />

      <CommandPaletteModal
        key={commandPaletteSession}
        isOpen={isCommandPaletteOpen}
        actions={commandPaletteActions}
        onClose={() => setIsCommandPaletteOpen(false)}
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
              margin: 16mm;
            }

            .app-print-note-page {
              font-family: "Segoe UI", Arial, sans-serif;
              color: #1f2735;
              background: #ffffff;
            }

            .app-print-note-meta {
              display: grid;
              grid-template-columns: 1fr 1fr;
              align-items: center;
              margin: 0 0 14px;
              border-bottom: 1px solid #d8deea;
              padding-bottom: 8px;
              font-size: 12px;
            }

            .app-print-note-time {
              justify-self: start;
              color: #5e6f8d;
            }

            .app-print-note-title {
              justify-self: end;
              color: #203758;
              font-weight: 600;
            }

            .app-print-note-body {
              margin: 0;
              white-space: pre-wrap;
              word-break: break-word;
              font-size: 15px;
              line-height: 1.5;
              font-style: normal;
              font-weight: 400;
            }
          }
        `}</style>
        <main className="app-print-note-page">
          <div className="app-print-note-meta">
            <span className="app-print-note-time">
              {printTimestamp || formatPrintTimestamp(new Date())}
            </span>
            <span className="app-print-note-title">{printTitle}</span>
          </div>
          <pre className="app-print-note-body">{printContent}</pre>
        </main>
      </div>
    </main>
  )
}
