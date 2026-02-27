import { FiCommand, FiEdit3, FiFileText, FiLayers, FiSearch, FiShield } from 'react-icons/fi'
import { HelpPageLayout } from './HelpPageLayout'

interface ShortcutRow {
  action: string
  pc: string
  mac: string
}

interface ShortcutSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  rows: ShortcutRow[]
}

const shortcutSections: ShortcutSection[] = [
  {
    id: 'file',
    title: 'File Workflow',
    description: 'Create, open, save, and print notes quickly.',
    icon: <FiFileText />,
    rows: [
      { action: 'Open file', pc: 'Ctrl + O', mac: 'Command + O' },
      { action: 'Save', pc: 'Ctrl + S', mac: 'Command + S' },
      { action: 'Save As', pc: 'Ctrl + Shift + S', mac: 'Command + Shift + S' },
      { action: 'Print', pc: 'Ctrl + P', mac: 'Command + P' }
    ]
  },
  {
    id: 'editing',
    title: 'Editing Essentials',
    description: 'Core text editing actions for daily writing.',
    icon: <FiEdit3 />,
    rows: [
      { action: 'Undo', pc: 'Ctrl + Z', mac: 'Command + Z' },
      { action: 'Redo', pc: 'Ctrl + Y', mac: 'Command + Y' },
      { action: 'Cut selected text', pc: 'Ctrl + X', mac: 'Command + X' },
      { action: 'Copy selected text', pc: 'Ctrl + C', mac: 'Command + C' },
      { action: 'Select all', pc: 'Ctrl + A', mac: 'Command + A' },
      { action: 'Find and replace', pc: 'Ctrl + Shift + R', mac: 'Command + Shift + R' }
    ]
  },
  {
    id: 'insert-format',
    title: 'Insert & Format',
    description: 'Advanced insert menus, formatting, and fullscreen.',
    icon: <FiLayers />,
    rows: [
      { action: 'Insert date & time', pc: 'Ctrl + Shift + D', mac: 'Command + Shift + D' },
      { action: 'Open characters', pc: 'Ctrl + Shift + C', mac: 'Command + Shift + C' },
      { action: 'Open emoji list', pc: 'Ctrl + Shift + E', mac: 'Command + Shift + E' },
      { action: 'Open font preference', pc: 'Ctrl + Shift + G', mac: 'Command + Shift + G' },
      { action: 'Toggle fullscreen', pc: 'Ctrl + Shift + F', mac: 'Command + Shift + F' }
    ]
  }
]

const totalShortcutCount = shortcutSections.reduce((sum, section) => sum + section.rows.length, 0)

function renderKeyChips(combo: string): React.JSX.Element {
  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      {combo.split('+').map((segment) => (
        <kbd
          key={`${combo}-${segment.trim()}`}
          className="rounded-md border border-[#c6d4ee] bg-[#f2f6ff] px-2 py-0.5 text-xs font-semibold text-[#334d74] shadow-[0_1px_0_rgba(23,41,74,0.08)]"
        >
          {segment.trim()}
        </kbd>
      ))}
    </div>
  )
}

export function ShortcutsPage(): React.JSX.Element {
  return (
    <HelpPageLayout heading="Keyboard Shortcuts">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-[#cfdbef] bg-[linear-gradient(135deg,#ffffff_0%,#f4f8ff_100%)] p-5 shadow-[0_12px_26px_rgba(30,49,84,0.08)]">
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] text-[#4a6285] uppercase">
            <FiCommand />
            <span>Total Shortcuts</span>
          </p>
          <p className="mt-3 text-3xl font-semibold text-[#203b60]">{totalShortcutCount}</p>
          <p className="mt-2 text-sm leading-6 text-[#4e6487]">
            Core actions available directly from keyboard.
          </p>
        </article>

        <article className="rounded-xl border border-[#cfdbef] bg-[linear-gradient(135deg,#ffffff_0%,#f4f8ff_100%)] p-5 shadow-[0_12px_26px_rgba(30,49,84,0.08)]">
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] text-[#4a6285] uppercase">
            <FiSearch />
            <span>Power Action</span>
          </p>
          <p className="mt-3 text-2xl font-semibold text-[#203b60]">Ctrl/Cmd + K</p>
          <p className="mt-2 text-sm leading-6 text-[#4e6487]">
            Open Command Palette to run actions quickly.
          </p>
        </article>

        <article className="rounded-xl border border-[#cfdbef] bg-[linear-gradient(135deg,#ffffff_0%,#f4f8ff_100%)] p-5 shadow-[0_12px_26px_rgba(30,49,84,0.08)]">
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] text-[#4a6285] uppercase">
            <FiShield />
            <span>Desktop & Web</span>
          </p>
          <p className="mt-3 text-2xl font-semibold text-[#203b60]">Cross Platform</p>
          <p className="mt-2 text-sm leading-6 text-[#4e6487]">
            Works in browser and desktop with platform-specific keys.
          </p>
        </article>
      </section>

      <section className="mt-5 rounded-xl border border-[#cfd9eb] bg-white p-5 shadow-[0_16px_30px_rgba(24,39,68,0.08)] md:p-7">
        <h2 className="text-3xl font-semibold text-[#22395c]">Shortcut Reference</h2>
        <p className="mt-3 max-w-[760px] text-sm leading-7 text-[#4b6182] md:text-[15px]">
          This page is organized by workflow so users can memorize shortcuts faster and apply them
          during writing sessions.
        </p>

        <div className="mt-6 space-y-6">
          {shortcutSections.map((section) => (
            <article
              key={section.id}
              className="overflow-hidden rounded-xl border border-[#d4dff1] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)]"
            >
              <div className="flex items-center gap-2 border-b border-[#dbe4f3] bg-[#eef3ff] px-4 py-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#dfe9ff] text-[#314f76]">
                  {section.icon}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#243e61]">{section.title}</h3>
                  <p className="text-xs text-[#587093]">{section.description}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#f6f9ff] text-[#2c4262]">
                    <tr>
                      <th className="border-b border-[#d5deee] px-4 py-2.5 text-left font-semibold">
                        Action
                      </th>
                      <th className="border-b border-[#d5deee] px-4 py-2.5 text-left font-semibold">
                        Windows / Linux
                      </th>
                      <th className="border-b border-[#d5deee] px-4 py-2.5 text-left font-semibold">
                        macOS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, index) => (
                      <tr
                        key={row.action}
                        className={index % 2 === 0 ? 'bg-[#fbfdff]' : 'bg-white'}
                      >
                        <td className="border-b border-[#e6ecf7] px-4 py-2.5 text-[#2b415f]">
                          {row.action}
                        </td>
                        <td className="border-b border-[#e6ecf7] px-4 py-2.5 text-[#3a557c]">
                          {renderKeyChips(row.pc)}
                        </td>
                        <td className="border-b border-[#e6ecf7] px-4 py-2.5 text-[#3a557c]">
                          {renderKeyChips(row.mac)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-[#d5deee] bg-[linear-gradient(90deg,#f2f6ff_0%,#f5fbff_100%)] p-4 text-sm leading-7 text-[#4e6382]">
        <p>
          Tip: Browser-specific shortcuts can override app keys. Click inside the editor before
          using shortcuts for consistent behavior.
        </p>
      </section>
    </HelpPageLayout>
  )
}
