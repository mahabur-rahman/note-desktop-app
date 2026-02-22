import { BrowserWindow, ipcMain } from 'electron'

function getTargetWindow(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null
}

export function registerWindowIpcHandlers(): void {
  ipcMain.handle('window:toggle-maximize', () => {
    const targetWindow = getTargetWindow()
    if (!targetWindow) return false

    if (targetWindow.isMaximized()) {
      targetWindow.unmaximize()
      return false
    }

    targetWindow.maximize()
    return true
  })

  ipcMain.handle('window:is-maximized', () => {
    const targetWindow = getTargetWindow()
    return targetWindow?.isMaximized() ?? false
  })

  ipcMain.handle('window:toggle-full-screen', () => {
    const targetWindow = getTargetWindow()
    if (!targetWindow) return false

    const nextState = !targetWindow.isFullScreen()
    targetWindow.setFullScreen(nextState)
    return nextState
  })

  ipcMain.handle('window:is-full-screen', () => {
    const targetWindow = getTargetWindow()
    return targetWindow?.isFullScreen() ?? false
  })
}
