import { ReactNode } from 'react'
import { FiBell, FiChevronDown, FiCornerUpRight, FiMessageSquare, FiMoon, FiRefreshCcw, FiSun, FiUser } from 'react-icons/fi'
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

        <div className="window-quickbar">
          <div className="quickbar-icons">
            <button type="button" className="quickbar-btn" aria-label="Messages">
              <FiMessageSquare aria-hidden />
            </button>
            <button type="button" className="quickbar-btn" aria-label="Notifications">
              <FiBell aria-hidden />
            </button>
            <button type="button" className="quickbar-btn" aria-label="Share options">
              <FiCornerUpRight aria-hidden />
            </button>
            <button type="button" className="quickbar-btn" aria-label="Profile">
              <FiUser aria-hidden />
            </button>
            <button type="button" className="quickbar-btn" aria-label="More">
              <FiChevronDown aria-hidden />
            </button>
          </div>
        </div>

        <section className="window-content">{children}</section>
      </div>
    </main>
  )
}
