import { ReactNode } from 'react'
import { FiMoon, FiRefreshCcw, FiSun, FiUser } from 'react-icons/fi'
import { SyncState, ThemeMode } from '../../types/notes'

interface AppChromeProps {
  title: string
  mode: ThemeMode
  syncState: SyncState
  onToggleMode: () => void
  children: ReactNode
}

const syncText: Record<SyncState, string> = {
  synced: 'Synced',
  syncing: 'Syncing...',
  offline: 'Offline'
}

export function AppChrome({
  title,
  mode,
  syncState,
  onToggleMode,
  children
}: AppChromeProps): React.JSX.Element {
  return (
    <main className={`shell-root ${mode === 'light' ? 'theme-light' : 'theme-dark'}`}>
      <div className="desktop-window">
        <header className="window-titlebar">
          <h1 className="window-title">{title}</h1>
          <div className="window-actions">
            <button className="window-chip" onClick={onToggleMode} type="button">
              {mode === 'dark' ? <FiMoon aria-hidden /> : <FiSun aria-hidden />}
              <span>{mode === 'dark' ? 'Dark' : 'Light'} Mode</span>
            </button>
            <span className="window-chip">
              <FiRefreshCcw aria-hidden />
              <span>Sync: {syncText[syncState]}</span>
            </span>
            <span className="avatar-chip">
              <FiUser aria-hidden />
            </span>
          </div>
        </header>

        <section className="window-content">{children}</section>
      </div>
    </main>
  )
}
