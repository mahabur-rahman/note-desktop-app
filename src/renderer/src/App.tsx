import { DesktopNotesLayout } from './components/layout/DesktopNotesLayout'
import { ACTIVE_NOTE, MENU_ITEMS } from './constants/ui'

function App(): React.JSX.Element {
  return <DesktopNotesLayout activeNote={ACTIVE_NOTE} menuItems={MENU_ITEMS} />
}

export default App
