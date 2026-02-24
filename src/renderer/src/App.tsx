import { DesktopNotesLayout } from './components/layout/DesktopNotesLayout'
import { PrivacyPolicyPage } from './components/help/PrivacyPolicyPage'
import { ShortcutsPage } from './components/help/ShortcutsPage'
import { APP_TITLE, MENU_ITEMS } from './constants/ui'

function App(): React.JSX.Element {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const normalizedHashPath = window.location.hash.replace(/^#/, '').replace(/\/+$/, '') || '/'
  const activePath = normalizedHashPath !== '/' ? normalizedHashPath : normalizedPath

  if (activePath === '/keyboard-shortcuts' || activePath === '/shortcuts') {
    return <ShortcutsPage />
  }

  if (activePath === '/privacy' || activePath === '/privacy-policy') {
    return <PrivacyPolicyPage />
  }

  return <DesktopNotesLayout appTitle={APP_TITLE} menuItems={MENU_ITEMS} />
}

export default App
