import { useEffect, useState } from 'react'
import { fetchSuggest, type SuggestResult } from './api'
import { useDebouncedValue } from './useDebouncedValue'

export type SearchStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Search state lives here (owned by App) rather than inside the Search view,
 * so switching to the entry view and back never loses the query or results.
 */
export function useSearch(debounceMs = 175, initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebouncedValue(query, debounceMs)

  const [results, setResults] = useState<SuggestResult[]>([])
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  // Set when the server resolved the query to a different term (e.g. dropping
  // the reflexive "sich " prefix from "sich verlieben" -> "verlieben").
  const [resolvedQuery, setResolvedQuery] = useState('')
  const [reflexFallback, setReflexFallback] = useState(false)

  const trimmed = debouncedQuery.trim()

  useEffect(() => {
    if (!trimmed) {
      setResults([])
      setStatus('idle')
      setError(null)
      setResolvedQuery('')
      setReflexFallback(false)
      return
    }

    const controller = new AbortController()
    setStatus('loading')
    setError(null)

    fetchSuggest(trimmed, controller.signal)
      .then((data) => {
        setResults(data.results)
        setResolvedQuery(data.resolvedQuery ?? trimmed)
        setReflexFallback(Boolean(data.reflexFallback))
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setResults([])
        setResolvedQuery('')
        setReflexFallback(false)
        setError('Could not reach the dictionary API.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [trimmed])

  const loading =
    query.trim() !== debouncedQuery.trim() || status === 'loading'

  return {
    query,
    debouncedQuery,
    setQuery,
    results,
    status,
    error,
    loading,
    resolvedQuery,
    reflexFallback,
  }
}
