import type { SuggestResult } from '../lib/api'
import type { SearchStatus } from '../lib/useSearch'
import { SearchBar } from './SearchBar'
import { ResultsList } from './ResultsList'

interface SearchProps {
  query: string
  results: SuggestResult[]
  status: SearchStatus
  error: string | null
  loading: boolean
  onQueryChange: (value: string) => void
  onSelect: (id: number) => void
}

export function Search({
  query,
  results,
  status,
  error,
  loading,
  onQueryChange,
  onSelect,
}: SearchProps) {
  const hasQuery = query.trim() !== ''

  return (
    <section>
      <SearchBar value={query} loading={loading} onChange={onQueryChange} />
      {status === 'ready' && results.length > 0 && (
        <p className="mt-3 px-1 text-xs font-medium uppercase tracking-widest text-slate-500">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </p>
      )}
      <ResultsList
        results={results}
        loading={status === 'loading'}
        hasQuery={hasQuery}
        error={error}
        onSelect={onSelect}
      />
    </section>
  )
}
