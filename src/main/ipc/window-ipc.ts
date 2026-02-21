import { BrowserWindow, ipcMain } from 'electron'

export function registerWindowIpcHandlers(): void {
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
}
