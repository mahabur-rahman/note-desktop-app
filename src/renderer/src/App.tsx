import { useEffect, useState } from 'react'
import { DesktopNotesLayout } from './components/layout/DesktopNotesLayout'
import { PrivacyPolicyPage } from './components/help/PrivacyPolicyPage'
import { ShortcutsPage } from './components/help/ShortcutsPage'
import { APP_TITLE, MENU_ITEMS } from './constants/ui'

function getActivePath(): string {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const normalizedHashPath = window.location.hash.replace(/^#/, '').replace(/\/+$/, '') || '/'
  return normalizedHashPath !== '/' ? normalizedHashPath : normalizedPath
}

function App(): React.JSX.Element {
  const [activePath, setActivePath] = useState<string>(() => getActivePath())

  useEffect(() => {
    const handleLocationChange = (): void => {
      setActivePath(getActivePath())
    }

    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)

    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  if (activePath === '/keyboard-shortcuts' || activePath === '/shortcuts') {
    return <ShortcutsPage />
  }

  if (activePath === '/privacy' || activePath === '/privacy-policy') {
    return <PrivacyPolicyPage />
  }

  return <DesktopNotesLayout appTitle={APP_TITLE} menuItems={MENU_ITEMS} />
}

export default App
