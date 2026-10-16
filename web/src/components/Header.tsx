import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  /** Go back to the main (search) page with an empty query. */
  onHome: () => void
}

export function Header({ onHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-900">
      <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4">
        <h1 className="m-0 text-2xl font-extrabold tracking-tight">
          <a
            href="/"
            onClick={(e) => {
              // Let modified clicks (new tab/window) use the real link.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
              e.preventDefault()
              onHome()
            }}
            className="inline-flex min-h-10 items-center rounded-lg text-white no-underline transition-colors hover:text-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            Lexikon
          </a>
        </h1>
        <ThemeToggle />
      </div>
    </header>
  )
}
