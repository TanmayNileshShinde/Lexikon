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
    <div className="min-h-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            German Dictionary
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
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
