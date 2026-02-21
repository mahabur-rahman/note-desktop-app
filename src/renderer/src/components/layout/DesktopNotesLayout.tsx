import { useState } from 'react'
import type { NoteSummary } from '../../types/ui'
import { EditorPane } from '../editor/EditorPane'
import { AppTopBar } from './AppTopBar'
import { NotesSidebar } from '../sidebar/NotesSidebar'

interface DesktopNotesLayoutProps {
  appTitle: string
  activeNote: NoteSummary
  menuItems: readonly string[]
}

export function DesktopNotesLayout({ appTitle, activeNote, menuItems }: DesktopNotesLayoutProps): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#f5f6f8] font-sans text-[#2f3340]">
      <AppTopBar title={appTitle} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="flex min-h-0 flex-1">
        <div
          className={[
            'shrink-0 overflow-hidden transition-[width] duration-200 ease-out',
            isSidebarOpen ? 'w-[280px] border-r border-[#d9dee5] xl:w-[332px]' : 'w-0 border-r-0'
          ].join(' ')}
        >
          <NotesSidebar note={activeNote} />
        </div>

        <div className="min-w-0 flex-1">
          <EditorPane menuItems={menuItems} noteTitle={activeNote.title} />
        </div>
      </div>
    </main>
  )
}
