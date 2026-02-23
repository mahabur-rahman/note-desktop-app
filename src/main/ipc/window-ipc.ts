import { BrowserWindow, ipcMain, shell } from 'electron'

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

  ipcMain.handle('window:set-spell-check-enabled', (_event, enabled: boolean) => {
    const targetWindow = getTargetWindow()
    if (!targetWindow) return false

    const nextState = Boolean(enabled)
    targetWindow.webContents.session.setSpellCheckerEnabled(nextState)
    return nextState
  })

  ipcMain.handle('window:is-spell-check-enabled', () => {
    const targetWindow = getTargetWindow()
    if (!targetWindow) return false
    return targetWindow.webContents.session.isSpellCheckerEnabled()
  })

  ipcMain.handle('window:open-external', async (_event, rawUrl: string) => {
    if (typeof rawUrl !== 'string') return false

    let targetUrl: URL
    try {
      targetUrl = new URL(rawUrl)
    } catch {
      return false
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol)) return false

    try {
      await shell.openExternal(targetUrl.toString())
      return true
    } catch {
      return false
    }
  })
}
