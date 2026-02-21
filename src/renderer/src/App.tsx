import { DesktopNotesLayout } from './components/layout/DesktopNotesLayout'
import { APP_TITLE, INITIAL_NOTES, MENU_ITEMS } from './constants/ui'

function App(): React.JSX.Element {
  return <DesktopNotesLayout appTitle={APP_TITLE} initialNotes={INITIAL_NOTES} menuItems={MENU_ITEMS} />
}

export default App
