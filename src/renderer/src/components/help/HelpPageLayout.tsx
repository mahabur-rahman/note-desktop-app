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
    <main className="min-h-screen bg-[#efeff1] text-[#1f2d45]">
      <header className="flex h-10 items-center justify-between bg-[#0c1117] px-4 text-sm text-[#f4f7fb]">
        <span className="font-medium tracking-wide">ONLINE NOTEPAD</span>
        <button
          type="button"
          onClick={handleBack}
          className="rounded border border-transparent px-3 py-1 text-sm font-medium uppercase tracking-wide text-[#f4f7fb] transition hover:border-[#f4f7fb]/40 hover:bg-[#f4f7fb]/10"
        >
          Back
        </button>
      </header>

      <section className="grid min-h-24 place-items-center bg-[#3d5be0] px-4 py-8 text-white">
        <h1 className="text-center text-2xl font-normal md:text-5xl">{heading}</h1>
      </section>

      <section className="mx-auto max-w-[760px] px-4 py-8">{children}</section>
    </main>
  )
}
