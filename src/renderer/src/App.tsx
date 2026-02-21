import { DesktopNotesLayout } from './components/layout/DesktopNotesLayout'
import { APP_TITLE, MENU_ITEMS } from './constants/ui'

function App(): React.JSX.Element {
  return <DesktopNotesLayout appTitle={APP_TITLE} menuItems={MENU_ITEMS} />
}

export default App
