import type { App } from 'electron'
import { BrowserWindow, nativeImage } from 'electron'
import { mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'

interface WindowSize {
  width: number
  height: number
}

interface MainWindowOptions {
  iconPath: string
  defaultSize: WindowSize
  minimumSize: WindowSize
}

interface LinuxDesktopEntryOptions {
  iconPath: string
  wmClass: string
}

export function setLinuxWindowClass(app: App, wmClass: string): void {
  if (process.platform !== 'linux') return

  app.commandLine.appendSwitch('class', wmClass)
  ;(app as App & { setDesktopName?: (name: string) => void }).setDesktopName?.(`${wmClass}.desktop`)
}

export function createMainWindow({
  iconPath,
  defaultSize,
  minimumSize
}: MainWindowOptions): BrowserWindow {
  const shouldOpenDevTools = is.dev && process.env['OPEN_DEVTOOLS'] !== '0'
  const mainWindow = new BrowserWindow({
    width: defaultSize.width,
    height: defaultSize.height,
    minWidth: minimumSize.width,
    minHeight: minimumSize.height,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (process.platform === 'linux') {
    ;(mainWindow as BrowserWindow & { setIcon?: (icon: Electron.NativeImage) => void }).setIcon?.(
      nativeImage.createFromPath(iconPath)
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

  return mainWindow
}

export function ensureLinuxDesktopEntry({ iconPath, wmClass }: LinuxDesktopEntryOptions): void {
  if (process.platform !== 'linux') return

  try {
    const applicationsDir = join(homedir(), '.local', 'share', 'applications')
    const desktopEntryPath = join(applicationsDir, `${wmClass}.desktop`)
    const desktopEntry = [
      '[Desktop Entry]',
      'Type=Application',
      'Name=Online Notes',
      'Comment=Online Notes Desktop App',
      `Exec=${process.execPath}`,
      `Icon=${iconPath}`,
      'Terminal=false',
      'Categories=Utility;',
      'StartupNotify=true',
      `StartupWMClass=${wmClass}`,
      ''
    ].join('\n')

    mkdirSync(applicationsDir, { recursive: true })
    writeFileSync(desktopEntryPath, desktopEntry, 'utf8')
  } catch (error) {
    console.error('Failed to write Linux desktop entry', error)
  }
}

export function setMacDockIcon(app: App, iconPath: string): void {
  if (process.platform !== 'darwin' || !app.dock) return
  app.dock.setIcon(nativeImage.createFromPath(iconPath))
}
