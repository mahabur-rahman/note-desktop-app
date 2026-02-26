import { HelpPageLayout } from './HelpPageLayout'

const shortcutRows = [
  { action: 'Open file', pc: 'Ctrl + O', mac: 'Command + O' },
  { action: 'Save', pc: 'Ctrl + S', mac: 'Command + S' },
  { action: 'Save As', pc: 'Ctrl + Shift + S', mac: 'Command + Shift + S' },
  { action: 'Print', pc: 'Ctrl + P', mac: 'Command + P' },
  { action: 'Undo', pc: 'Ctrl + Z', mac: 'Command + Z' },
  { action: 'Redo', pc: 'Ctrl + Y', mac: 'Command + Y' },
  { action: 'Cut selected text', pc: 'Ctrl + X', mac: 'Command + X' },
  { action: 'Copy selected text', pc: 'Ctrl + C', mac: 'Command + C' },
  { action: 'Select all', pc: 'Ctrl + A', mac: 'Command + A' },
  { action: 'Find and replace', pc: 'Ctrl + Shift + R', mac: 'Command + Shift + R' },
  { action: 'Insert date & time', pc: 'Ctrl + Shift + D', mac: 'Command + Shift + D' },
  { action: 'Open characters', pc: 'Ctrl + Shift + C', mac: 'Command + Shift + C' },
  { action: 'Open emoji list', pc: 'Ctrl + Shift + E', mac: 'Command + Shift + E' },
  { action: 'Open font preference', pc: 'Ctrl + Shift + G', mac: 'Command + Shift + G' },
  { action: 'Toggle fullscreen', pc: 'Ctrl + Shift + F', mac: 'Command + Shift + F' }
] as const

export function ShortcutsPage(): React.JSX.Element {
  return (
    <HelpPageLayout heading="Keyboard Shortcuts">
      <section className="rounded-xl border border-[#cfd9eb] bg-white p-5 shadow-[0_16px_30px_rgba(24,39,68,0.08)] md:p-7">
        <h2 className="text-3xl font-semibold text-[#22395c]">NoteNova Shortcuts</h2>
        <p className="mt-3 max-w-[760px] text-sm leading-7 text-[#4b6182] md:text-[15px]">
          Speed up editing with keyboard-first actions in NoteNova Studio. These shortcuts are
          designed to keep writing, formatting, and exporting quick in both browser and desktop
          workflows.
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border border-[#d5deee]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[linear-gradient(90deg,#e9efff_0%,#edf7ff_100%)] text-[#2c4262]">
              <tr>
                <th className="border-b border-[#d5deee] px-4 py-3 text-left font-semibold">
                  Action
                </th>
                <th className="border-b border-[#d5deee] px-4 py-3 text-center font-semibold">
                  Windows / Linux
                </th>
                <th className="border-b border-[#d5deee] px-4 py-3 text-center font-semibold">
                  macOS
                </th>
              </tr>
            </thead>
            <tbody>
              {shortcutRows.map((row, index) => (
                <tr key={row.action} className={index % 2 === 0 ? 'bg-[#f9fbff]' : 'bg-white'}>
                  <td className="border-b border-[#e6ecf7] px-4 py-3 text-[#2b415f]">
                    {row.action}
                  </td>
                  <td className="border-b border-[#e6ecf7] px-4 py-3 text-center font-medium text-[#3a557c]">
                    {row.pc}
                  </td>
                  <td className="border-b border-[#e6ecf7] px-4 py-3 text-center font-medium text-[#3a557c]">
                    {row.mac}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-[#d5deee] bg-[linear-gradient(90deg,#f2f6ff_0%,#f5fbff_100%)] p-4 text-sm leading-7 text-[#4e6382]">
        <p>
          Note: Some browsers reserve default key combinations. Click inside the editor first, then
          run shortcuts for the best behavior.
        </p>
      </section>
    </HelpPageLayout>
  )
}
