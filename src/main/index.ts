import { app, BrowserWindow, nativeImage } from 'electron'
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
