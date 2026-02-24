import { app, BrowserWindow } from 'electron'
import {
  APP_NAME,
  DEFAULT_WINDOW_SIZE,
  LINUX_WM_CLASS,
  MINIMUM_WINDOW_SIZE
} from './config/app-config'
import { registerNotesIpcHandlers } from './ipc/notes-ipc'
import { registerWindowIpcHandlers } from './ipc/window-ipc'
import {
  createMainWindow,
  ensureLinuxDesktopEntry,
  setLinuxWindowClass,
  setMacDockIcon
} from './window/main-window'
import icon from '../../resources/icon.png?asset'

// Suppress Chromium/DevTools internal protocol noise in terminal output.
app.commandLine.appendSwitch('disable-logging')
app.commandLine.appendSwitch('log-level', '3')

app.setName(APP_NAME)
setLinuxWindowClass(app, LINUX_WM_CLASS)

app.whenReady().then(() => {
  registerNotesIpcHandlers(app)
  registerWindowIpcHandlers()

  ensureLinuxDesktopEntry({ iconPath: icon, wmClass: LINUX_WM_CLASS })
  setMacDockIcon(app, icon)

  createMainWindow({
    iconPath: icon,
    defaultSize: DEFAULT_WINDOW_SIZE,
    minimumSize: MINIMUM_WINDOW_SIZE
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow({
        iconPath: icon,
        defaultSize: DEFAULT_WINDOW_SIZE,
        minimumSize: MINIMUM_WINDOW_SIZE
      })
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
