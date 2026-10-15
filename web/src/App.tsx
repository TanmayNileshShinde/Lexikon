import { useState } from 'react'
import { EntryView } from './components/EntryView'
import { Search } from './components/Search'
import { useSearch } from './lib/useSearch'

export default function App() {
  const search = useSearch()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selectTerm = (term: string) => {
    search.setQuery(term)
    setSelectedId(null)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-tr from-[#060814] via-[#0B0F1D] to-[#0F172A] font-sans text-slate-100 antialiased selection:bg-violet-500/30 selection:text-violet-200">
      {/* cosmic backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10rem] top-[-10rem] h-[40rem] w-[40rem] rounded-full bg-violet-600/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[5rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-cyan-600/10 blur-[120px]"
      />

      <main className="relative mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
              German Dictionary
            </h1>
            <span className="rounded-full border border-slate-700/60 bg-slate-800/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              V1.0
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Fast, ad-free German to English lookup.
          </p>
        </header>

        {selectedId === null ? (
          <Search
            query={search.query}
            results={search.results}
            status={search.status}
            error={search.error}
            loading={search.loading}
            onQueryChange={search.setQuery}
            onSelect={setSelectedId}
          />
        ) : (
          <EntryView
            id={selectedId}
            onBack={() => setSelectedId(null)}
            onSelectTerm={selectTerm}
          />
        )}
      </main>
    </div>
  )
}
