interface HelpPageLayoutProps {
  heading: string
  children: React.ReactNode
}

export function HelpPageLayout({ heading, children }: HelpPageLayoutProps): React.JSX.Element {
  const handleBack = (): void => {
    if (window.location.hash.startsWith('#/')) {
      window.location.hash = '#/app'
      return
    }

    if (window.history.length > 1) {
      window.history.back()
      return
    }

    window.location.assign(new URL('/app', window.location.href).toString())
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f5fbfa_0%,#eaf5f4_45%,#e3efef_100%)] text-[#1f2d45]">
      <header className="flex h-12 items-center justify-between border-b border-[#1f4e58] bg-[linear-gradient(90deg,#0c2228_0%,#133840_55%,#1b4f57_100%)] px-4 text-sm text-[#f4f7fb]">
        <span className="font-semibold tracking-[0.12em]">NOTENOVA STUDIO</span>
        <button
          type="button"
          onClick={handleBack}
          className="rounded border border-[#3a6d78] bg-[#1f4952] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#f4f8ff] transition hover:bg-[#2a5f6a]"
        >
          Back
        </button>
      </header>

      <section className="grid min-h-28 place-items-center bg-[linear-gradient(90deg,#1b5f63_0%,#228081_52%,#2e9898_100%)] px-4 py-9 text-white">
        <h1 className="text-center text-2xl font-semibold md:text-5xl">{heading}</h1>
      </section>

      <section className="mx-auto max-w-[920px] px-4 py-9">{children}</section>
    </main>
  )
}
