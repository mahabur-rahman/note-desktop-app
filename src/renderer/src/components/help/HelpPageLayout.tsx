interface HelpPageLayoutProps {
  heading: string
  children: React.ReactNode
}

export function HelpPageLayout({ heading, children }: HelpPageLayoutProps): React.JSX.Element {
  return (
    <main className="min-h-screen bg-[#efeff1] text-[#1f2d45]">
      <header className="flex h-8 items-center justify-between bg-[#0c1117] px-4 text-[10px] text-[#f4f7fb]">
        <span>ONLINE NOTEPAD</span>
        <span>HOME &nbsp;&nbsp; NOTEPAD</span>
      </header>

      <section className="grid min-h-24 place-items-center bg-[#3d5be0] px-4 py-8 text-white">
        <h1 className="text-center text-2xl font-normal md:text-5xl">{heading}</h1>
      </section>

      <section className="mx-auto max-w-[760px] px-4 py-8">{children}</section>
    </main>
  )
}
