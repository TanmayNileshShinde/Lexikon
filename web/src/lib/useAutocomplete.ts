import { useEffect, useState } from 'react'
import { fetchAutocomplete, type AutocompleteItem } from './api'

/**
 * Prefix suggestions for the text being typed. Debounced and abortable; a
 * failed request just yields no suggestions (the normal results still work).
 */
export function useAutocomplete(query: string, debounceMs = 90) {
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([])
  const trimmed = query.trim()

  useEffect(() => {
    if (!trimmed) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      fetchAutocomplete(trimmed, controller.signal)
        .then(setSuggestions)
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setSuggestions([])
        })
    }, debounceMs)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, debounceMs])

  return suggestions
}
