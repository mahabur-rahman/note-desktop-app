const overviewItems = [
  'Create and manage notes in a clean distraction-free editor.',
  'Use insert/edit tools for date-time, characters, emoji, and find-replace.',
  'Save, export, and print your notes for daily work.'
] as const

const workflowSteps = [
  {
    title: '1. Open App',
    description: 'Launch the workspace from browser using /app and start a note instantly.'
  },
  {
    title: '2. Write & Edit',
    description: 'Use menu actions and keyboard shortcuts to format and refine your content.'
  },
  {
    title: '3. Save & Share',
    description: 'Save as text file, print output, and continue from the same note later.'
  }
] as const

const compatibilityItems = [
  { platform: 'Web Browser', support: 'Chrome, Edge, Firefox (latest versions)' },
  { platform: 'Desktop App', support: 'Windows, Linux, macOS builds via Electron' },
  { platform: 'Input Methods', support: 'Keyboard + mouse with shortcut-first workflow' }
] as const

const valueHighlights = [
  {
    title: 'Fast Daily Workflow',
    description: 'Designed to capture ideas and complete edits quickly without UI clutter.'
  },
  {
    title: 'Cross-Platform Continuity',
    description: 'The same writing experience is available across browser and desktop environments.'
  },
  {
    title: 'Reliable Export Pipeline',
    description: 'Save As and print features help you share notes cleanly for external use.'
  }
] as const

export function LandingPage(): React.JSX.Element {
  return (
    <main
      className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff_0%,#eef3ff_42%,#e9f0fc_100%)] text-[#1f2d45]"
      style={{ fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif' }}
    >
      <header className="sticky top-0 z-20 border-b border-[#263d66] bg-[linear-gradient(90deg,#0b1324_0%,#162b4c_55%,#15335b_100%)] backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between px-5">
          <a href="/" className="text-sm font-semibold tracking-[0.14em] text-white">
            NOTENOVA STUDIO
          </a>
          <nav className="flex items-center gap-5 text-xs font-semibold text-[#dce2ed]">
            <a href="#overview" className="transition hover:text-white">
              Overview
            </a>
            <a href="#workflow" className="transition hover:text-white">
              How It Works
            </a>
            <a href="#compatibility" className="transition hover:text-white">
              Compatibility
            </a>
            <a
              href="/app"
              className="rounded bg-[#4f63f6] px-4 py-2 text-[11px] tracking-wide text-white transition hover:bg-[#4257ea]"
            >
              Open App
            </a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#d8dfed]/70">
        <div className="pointer-events-none absolute -top-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#4f63f6]/20 blur-3xl" />
        <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit rounded-full border border-[#cfd7e8] bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-[#3b4e71]">
              Professional Writing Workspace
            </p>
            <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
              <span className="bg-[linear-gradient(90deg,#294685_0%,#4f63f6_48%,#3ea8e0_100%)] bg-clip-text text-transparent">
                Write Faster.
              </span>
              <br />
              <span className="bg-[linear-gradient(90deg,#1e355f_0%,#5a42dc_52%,#2c9de0_100%)] bg-clip-text text-transparent">
                Ship Cleaner Notes.
              </span>
            </h1>
            <p className="mt-5 max-w-[620px] text-base leading-7 text-[#475d81] md:text-lg">
              NoteNova Studio helps you draft, edit, and export notes in seconds. Built for speed
              with a practical interface across web and desktop.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/app"
                className="inline-flex min-w-[150px] items-center justify-center rounded bg-[#4f63f6] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4156e8]"
              >
                Launch Workspace
              </a>
              <a
                href="/keyboard-shortcuts"
                className="inline-flex min-w-[150px] items-center justify-center rounded border border-[#c9d2e4] bg-white px-6 py-3 text-sm font-semibold text-[#304462] transition hover:bg-[#f4f7fd]"
              >
                View Shortcuts
              </a>
            </div>

            <div className="mt-8 rounded-lg border border-[#d3dbeb] bg-white px-4 py-4">
              <h2 className="text-sm font-semibold tracking-wide text-[#2b3e5f] uppercase">
                About
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#4b5f7e]">
                This editor is designed for everyday writing tasks with stable menus, quick insert
                actions, and a desktop-ready workflow using the same product logic.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#cad4e8] bg-white p-4 shadow-[0_18px_36px_rgba(27,45,75,0.12)]">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-xs font-semibold tracking-[0.1em] text-[#3e5477] uppercase">
                Application Screenshot
              </p>
              <span className="rounded bg-[#e5ebfd] px-2 py-1 text-[11px] font-semibold text-[#3856ca]">
                Live Preview
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-[#d7deec] bg-[#f0f3fb]">
              <iframe
                title="NoteNova Studio App Preview"
                src="/app"
                loading="lazy"
                className="h-[420px] w-full bg-white md:h-[480px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="mx-auto w-full max-w-[1180px] px-5 py-12 md:py-14">
        <div className="rounded-xl border border-[#ced7e8] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#1f2d45] md:text-3xl">
            <span className="bg-[linear-gradient(90deg,#2f4f93_0%,#4f63f6_50%,#2f8ccb_100%)] bg-clip-text text-transparent">
              Overview
            </span>
          </h2>
          <div className="mt-5 grid gap-3">
            {overviewItems.map((item) => (
              <article
                key={item}
                className="rounded border border-[#d7deed] bg-[#f7f9fd] px-4 py-3"
              >
                <p className="text-sm leading-6 text-[#465c7f]">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto w-full max-w-[1180px] px-5 pb-12 md:pb-14">
        <div className="rounded-xl border border-[#ced7e8] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#1f2d45] md:text-3xl">
            <span className="bg-[linear-gradient(90deg,#2f4f93_0%,#4f63f6_50%,#2f8ccb_100%)] bg-clip-text text-transparent">
              How does it work?
            </span>
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <article
                key={step.title}
                className="rounded border border-[#d7deed] bg-[#f7f9fd] p-4"
              >
                <h3 className="text-base font-semibold text-[#2a3e5f]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#4b607f]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="compatibility" className="mx-auto w-full max-w-[1180px] px-5 pb-12 md:pb-14">
        <div className="rounded-xl border border-[#ced7e8] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#1f2d45] md:text-3xl">
            <span className="bg-[linear-gradient(90deg,#2f4f93_0%,#4f63f6_50%,#2f8ccb_100%)] bg-clip-text text-transparent">
              Compatibility
            </span>
          </h2>
          <div className="mt-5 overflow-hidden rounded-lg border border-[#d8dfed]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#eef2fb] text-[#2f4567]">
                <tr>
                  <th className="border-b border-[#d8dfed] px-4 py-3 font-semibold">Platform</th>
                  <th className="border-b border-[#d8dfed] px-4 py-3 font-semibold">Support</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {compatibilityItems.map((item) => (
                  <tr key={item.platform}>
                    <td className="border-b border-[#e5eaf4] px-4 py-3 font-medium text-[#2c405f]">
                      {item.platform}
                    </td>
                    <td className="border-b border-[#e5eaf4] px-4 py-3 text-[#4e627f]">
                      {item.support}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-5 pb-12 md:pb-14">
        <div className="rounded-xl border border-[#cbd6ea] bg-[linear-gradient(90deg,#f7f9ff_0%,#f2f7ff_100%)] p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#203658] md:text-3xl">
            <span className="bg-[linear-gradient(90deg,#2f4f93_0%,#4f63f6_50%,#2f8ccb_100%)] bg-clip-text text-transparent">
              Why teams choose NoteNova
            </span>
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {valueHighlights.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-[#d2dcef] bg-white p-4 shadow-[0_8px_20px_rgba(28,44,77,0.06)]"
              >
                <h3 className="text-base font-semibold text-[#294165]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#4d617f]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#294068] bg-[linear-gradient(90deg,#0c1528_0%,#18325b_58%,#214677_100%)] text-[#d8e2f5]">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-5 py-6 text-sm md:flex-row md:items-center md:justify-between">
          <p>NoteNova Studio</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="/keyboard-shortcuts" className="transition hover:text-white">
              Keyboard Shortcuts
            </a>
            <a href="/app" className="transition hover:text-white">
              Open App
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
