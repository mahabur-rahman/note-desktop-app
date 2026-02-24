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
  { action: 'Highlight all', pc: 'Ctrl + A', mac: 'Command + A' },
  { action: 'Find and replace', pc: 'Ctrl + Shift + R', mac: 'Command + Shift + R' },
  { action: 'Insert date & time', pc: 'Ctrl + Shift + D', mac: 'Command + Shift + D' },
  { action: 'Open characters', pc: 'Ctrl + Shift + C', mac: 'Command + Shift + C' },
  { action: 'Open emoji list', pc: 'Ctrl + Shift + E', mac: 'Command + Shift + E' },
  { action: 'Open font preference', pc: 'Ctrl + Shift + G', mac: 'Command + Shift + G' },
  { action: 'Toggle fullscreen', pc: 'Ctrl + Shift + F', mac: 'Command + Shift + F' }
] as const

export function ShortcutsPage(): React.JSX.Element {
  return (
    <HelpPageLayout heading="Keyboard Shortcuts in Online Notepad">
      <h2 className="mb-3 text-4xl font-semibold">Shortcuts</h2>
      <p className="mb-5 text-sm leading-6">
        Here is the complete list of key combinations that will help you speed things up when using
        Online Notepad&apos;s editor.
      </p>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#e8ebef]">
            <th className="border border-[#c9ced6] px-3 py-2 text-left">Action</th>
            <th className="border border-[#c9ced6] px-3 py-2 text-center">PC</th>
            <th className="border border-[#c9ced6] px-3 py-2 text-center">Mac</th>
          </tr>
        </thead>
        <tbody>
          {shortcutRows.map((row) => (
            <tr key={row.action}>
              <td className="border border-[#c9ced6] px-3 py-2">{row.action}</td>
              <td className="border border-[#c9ced6] px-3 py-2 text-center">{row.pc}</td>
              <td className="border border-[#c9ced6] px-3 py-2 text-center">{row.mac}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 bg-[#e8ebef] px-4 py-3 text-sm leading-6 text-[#667892]">
        Note: Most web browsers have built-in additional shortcuts. You may need to click within the
        editor context to activate the shortcuts listed above.
      </div>
    </HelpPageLayout>
  )
}
