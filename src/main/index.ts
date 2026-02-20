import { app, BrowserWindow, nativeImage } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Suppress Chromium/DevTools internal protocol noise in terminal output.
app.commandLine.appendSwitch('disable-logging')
app.commandLine.appendSwitch('log-level', '3')

app.setName('Online Notes')
if (process.platform === 'linux') {
  ;(app as Electron.App & { setDesktopName?: (name: string) => void }).setDesktopName?.('online-notes.desktop')
}

function createWindow(): void {
  const shouldOpenDevTools = is.dev && process.env['OPEN_DEVTOOLS'] !== '0'

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
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

app.whenReady().then(() => {
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
