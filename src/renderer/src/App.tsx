import { DesktopNotesLayout } from './components/layout/DesktopNotesLayout'
import { ACTIVE_NOTE, APP_TITLE, MENU_ITEMS } from './constants/ui'

function App(): React.JSX.Element {
  return <DesktopNotesLayout appTitle={APP_TITLE} activeNote={ACTIVE_NOTE} menuItems={MENU_ITEMS} />
}

export default App
