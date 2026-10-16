import { useEffect, useState, type KeyboardEvent } from 'react'
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
  resolvedQuery: string
  reflexFallback: boolean
  onQueryChange: (value: string) => void
  onSelect: (id: number) => void
}

export function Search({
  query,
  results,
  status,
  error,
  loading,
  resolvedQuery,
  reflexFallback,
  onQueryChange,
  onSelect,
}: SearchProps) {
  const hasQuery = query.trim() !== ''
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Reset the keyboard highlight whenever the query or results change.
  useEffect(() => {
    setSelectedIndex(-1)
  }, [query, results])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      if (results.length === 0) return
      event.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      if (results.length === 0) return
      event.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, -1))
    } else if (event.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        event.preventDefault()
        onSelect(results[selectedIndex].id)
      }
    }
  }

  return (
    <section>
      <SearchBar
        value={query}
        loading={loading}
        onChange={onQueryChange}
        onKeyDown={handleKeyDown}
      />
      {status === 'ready' && reflexFallback && results.length > 0 && (
        <p className="mt-3 px-1 text-sm text-slate-400">
          Showing results for{' '}
          <span className="font-semibold text-violet-300">“{resolvedQuery}”</span>
        </p>
      )}
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
        selectedIndex={selectedIndex}
      />
    </section>
  )
}
