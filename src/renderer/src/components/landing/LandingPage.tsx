const overviewCards = [
  {
    title: 'Focused Writing',
    description:
      'A distraction-free workspace with practical menus, keyboard shortcuts, and fast note flow.'
  },
  {
    title: 'Power Editing',
    description:
      'Built-in tools for find and replace, insert helpers, markdown preview, themes, and version restore.'
  },
  {
    title: 'Safe Output',
    description: 'Export to TXT, MD, and PDF with consistent layout for sharing and documentation.'
  }
] as const

const workflowSteps = [
  {
    title: 'Start a Note',
    description: 'Open the app, create a note, and begin writing immediately.'
  },
  {
    title: 'Organize Smartly',
    description: 'Use folders, tags, pinning, and search filters to manage large note collections.'
  },
  {
    title: 'Ship Anywhere',
    description: 'Save, export, print, and back up in formats that work across teams and devices.'
  }
] as const

const compatibilityRows = [
  {
    platform: 'Web',
    details: 'Full editor workspace is available in browser via /app, with direct installer downloads.'
  },
  {
    platform: 'Desktop',
    details: 'Electron app for Linux, macOS, and Windows with native window-level controls.'
  },
  {
    platform: 'Data',
    details: 'Local persistence with backup/import workflow for safe migration and restore.'
  }
] as const

const featureHighlights = [
  'Folder + tag filtering',
  'Pin / favorite notes',
  'Recycle bin restore',
  'Autosave status + version history',
  'Markdown split preview',
  'Quick command palette'
] as const

export function LandingPage(): React.JSX.Element {
  return (
    <main
      className="min-h-screen bg-[linear-gradient(180deg,#f3f7ff_0%,#ecf2ff_34%,#e8f0ff_100%)] text-[#1d2f4e]"
      style={{ fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif' }}
    >
      <header className="sticky top-0 z-30 border-b border-[#2a3b67] bg-[linear-gradient(90deg,#0c1426_0%,#16294a_56%,#1e3f6e_100%)]">
        <div className="mx-auto flex h-16 w-full max-w-[1220px] items-center justify-between px-5">
          <a href="/" className="text-sm font-semibold tracking-[0.16em] text-white">
            NOTENOVA STUDIO
          </a>
          <nav className="hidden items-center gap-6 text-xs font-semibold tracking-wide text-[#dbe6fb] md:flex">
            <a href="#overview" className="transition hover:text-white">
              Overview
            </a>
            <a href="#workflow" className="transition hover:text-white">
              How It Works
            </a>
            <a href="#compatibility" className="transition hover:text-white">
              Compatibility
            </a>
            <a href="/app" className="rounded-md bg-[#4b64f5] px-4 py-2 text-white transition hover:bg-[#3f56e5]">
              Open Web App
            </a>
          </nav>
          <a
            href="/app"
            className="inline-flex rounded-md bg-[#4b64f5] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3f56e5] md:hidden"
          >
            Open App
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#d8e3fa]">
        <div className="pointer-events-none absolute -top-12 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#6b86ff]/30 blur-3xl" />
        <div className="mx-auto grid w-full max-w-[1220px] gap-10 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit rounded-full border border-[#c7d5f4] bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-[#3a4f76]">
              Professional Notes Platform
            </p>
            <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
              <span className="bg-[linear-gradient(90deg,#1f3767_0%,#4d63f6_48%,#2293d1_100%)] bg-clip-text text-transparent">
                Write Clearly.
              </span>
              <br />
              <span className="bg-[linear-gradient(90deg,#2c4b8e_0%,#7d49e5_48%,#2a9ccf_100%)] bg-clip-text text-transparent">
                Organize Effortlessly.
              </span>
            </h1>
            <p className="mt-5 max-w-[620px] text-base leading-7 text-[#4a6085] md:text-lg">
              NoteNova Studio combines speed, structure, and export-ready output in one modern
              workspace for web and desktop users.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/app"
                className="inline-flex min-w-[180px] items-center justify-center rounded-md border border-[#c7d5f4] bg-white px-6 py-3 text-sm font-semibold text-[#2e456a] transition hover:bg-[#f5f8ff]"
              >
                Use in Browser
              </a>
            </div>

            <div id="downloads" className="mt-3 flex flex-wrap gap-3">
              <a
                href="/downloads/notenova-windows.exe"
                download
                className="inline-flex min-w-[180px] items-center justify-center rounded-md bg-[#2f5792] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#284c7f]"
              >
                Download for Windows
              </a>
              <a
                href="/downloads/notenova-linux.AppImage"
                download
                className="inline-flex min-w-[180px] items-center justify-center rounded-md bg-[#2f5792] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#284c7f]"
              >
                Download for Linux
              </a>
              <a
                href="/downloads/notenova-macos.dmg"
                download
                className="inline-flex min-w-[180px] items-center justify-center rounded-md bg-[#2f5792] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#284c7f]"
              >
                Download for macOS
              </a>
            </div>

            <div className="mt-6 rounded-xl border border-[#c5d5f5] bg-white/80 p-4">
              <p className="text-sm font-semibold text-[#2e466f]">Install Guide</p>
              <p className="mt-1 text-xs text-[#5b7397]">
                Use /app instantly in browser, or download the installer for your OS to use the
                desktop application locally.
              </p>
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {featureHighlights.map((item) => (
                <p
                  key={item}
                  className="rounded-md border border-[#d4e0f6] bg-white px-3 py-2 text-sm text-[#425a80]"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#ccdaf8] bg-white p-4 shadow-[0_20px_45px_rgba(21,39,72,0.14)]">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-xs font-semibold tracking-[0.1em] text-[#3d547a] uppercase">
                Desktop-First Workspace
              </p>
              <span className="rounded bg-[#e5ecff] px-2 py-1 text-[11px] font-semibold text-[#3456cd]">
                Windows / Linux / macOS
              </span>
            </div>
            <div className="rounded-xl border border-[#d4e0f6] bg-[linear-gradient(180deg,#f7f9ff_0%,#eef3ff_100%)] p-5">
              <p className="text-sm leading-7 text-[#3f567b]">
                The full editor experience is available in the desktop build. Use the download
                buttons to install NoteNova on your local machine.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#4b6286]">
                <li>Rich note editing with keyboard shortcuts</li>
                <li>Folder/tag organization with fast filtering</li>
                <li>Autosave, version restore, export and print</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="mx-auto w-full max-w-[1220px] px-5 py-12 md:py-14">
        <div className="rounded-2xl border border-[#cfdbf4] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold md:text-3xl">
            <span className="bg-[linear-gradient(90deg,#284a8b_0%,#4b64f5_48%,#238ec8_100%)] bg-clip-text text-transparent">
              Overview
            </span>
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {overviewCards.map((card) => (
              <article
                key={card.title}
                className="rounded-xl border border-[#d8e3f8] bg-[#f8fbff] p-4 md:p-5"
              >
                <h3 className="text-lg font-semibold text-[#263f67]">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#496184]">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto w-full max-w-[1220px] px-5 pb-12 md:pb-14">
        <div className="rounded-2xl border border-[#cfdbf4] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold md:text-3xl">
            <span className="bg-[linear-gradient(90deg,#284a8b_0%,#4b64f5_48%,#238ec8_100%)] bg-clip-text text-transparent">
              How does it work?
            </span>
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-xl border border-[#d8e3f8] bg-[#f8fbff] p-4 md:p-5"
              >
                <p className="mb-2 text-xs font-semibold tracking-[0.1em] text-[#5c74a1] uppercase">
                  Step {index + 1}
                </p>
                <h3 className="text-lg font-semibold text-[#263f67]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#496184]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="compatibility" className="mx-auto w-full max-w-[1220px] px-5 pb-12 md:pb-14">
        <div className="rounded-2xl border border-[#cfdbf4] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold md:text-3xl">
            <span className="bg-[linear-gradient(90deg,#284a8b_0%,#4b64f5_48%,#238ec8_100%)] bg-clip-text text-transparent">
              Compatibility
            </span>
          </h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-[#d8e3f8]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#eef4ff] text-[#2e466f]">
                <tr>
                  <th className="border-b border-[#d8e3f8] px-4 py-3 font-semibold">Platform</th>
                  <th className="border-b border-[#d8e3f8] px-4 py-3 font-semibold">Support</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {compatibilityRows.map((item) => (
                  <tr key={item.platform}>
                    <td className="border-b border-[#e6edfb] px-4 py-3 font-medium text-[#2b4268]">
                      {item.platform}
                    </td>
                    <td className="border-b border-[#e6edfb] px-4 py-3 text-[#4b6286]">
                      {item.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1220px] px-5 pb-12 md:pb-14">
        <div className="rounded-2xl border border-[#cad9f8] bg-[linear-gradient(90deg,#e9f0ff_0%,#ecf2ff_45%,#f3f7ff_100%)] p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#203a63] md:text-3xl">
            Production-ready note workflow for everyday teams
          </h2>
          <p className="mt-3 max-w-[760px] text-sm leading-7 text-[#4b6285] md:text-base">
            Use one consistent experience in browser and desktop. Keep your notes searchable,
            recoverable, and exportable with a reliable writing pipeline.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/app"
              className="inline-flex min-w-[150px] items-center justify-center rounded-md bg-[#4b64f5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3f56e5]"
            >
              Open Web App
            </a>
            <a
              href="/privacy"
              className="inline-flex min-w-[150px] items-center justify-center rounded-md border border-[#c5d5f5] bg-white px-5 py-3 text-sm font-semibold text-[#2e466f] transition hover:bg-[#f6f9ff]"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#273f68] bg-[linear-gradient(90deg,#0c1528_0%,#17325a_56%,#214a7b_100%)] text-[#d9e4f8]">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-4 px-5 py-8 text-sm md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} NoteNova Studio. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#downloads" className="transition hover:text-white">
              Downloads
            </a>
            <a href="/keyboard-shortcuts" className="transition hover:text-white">
              Shortcuts
            </a>
            <a href="/privacy" className="transition hover:text-white">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
