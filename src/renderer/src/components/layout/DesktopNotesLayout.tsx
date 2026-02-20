import type { NoteSummary } from '../../types/ui'
import { EditorPane } from '../editor/EditorPane'
import { NotesSidebar } from '../sidebar/NotesSidebar'

interface DesktopNotesLayoutProps {
  appTitle: string
  activeNote: NoteSummary
  menuItems: readonly string[]
}

export function DesktopNotesLayout({ appTitle, activeNote, menuItems }: DesktopNotesLayoutProps): React.JSX.Element {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[#f5f6f8] font-sans text-[#2f3340] md:grid md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[332px_minmax(0,1fr)]">
      <NotesSidebar appTitle={appTitle} note={activeNote} />
      <EditorPane menuItems={menuItems} noteTitle={activeNote.title} />
    </main>
  )
}
