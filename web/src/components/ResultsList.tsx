import type { SuggestResult } from '../lib/api'
import { ResultCard } from './ResultCard'

interface ResultsListProps {
  results: SuggestResult[]
  loading: boolean
  hasQuery: boolean
  error: string | null
  onSelect: (id: number) => void
}

export function ResultsList({
  results,
  loading,
  hasQuery,
  error,
  onSelect,
}: ResultsListProps) {
  if (error) {
    return <p className="mt-6 text-sm text-rose-400">{error}</p>
  }

  if (!hasQuery) {
    return (
      <p className="mt-6 text-sm text-slate-500">
        Type a German word to see its English translation.
      </p>
    )
  }

  if (results.length === 0) {
    if (loading) return null
    return <p className="mt-6 text-sm text-slate-500">No results found.</p>
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {results.map((result) => (
        <ResultCard
          key={`${result.id}-${result.kind}`}
          result={result}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
