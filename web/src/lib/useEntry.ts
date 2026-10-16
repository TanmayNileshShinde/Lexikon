import { useEffect, useState } from 'react'
import { ApiError, fetchEntry, type Entry } from './api'

export type EntryStatus = 'loading' | 'ready' | 'error'

export function useEntry(id: number | null) {
  const [entry, setEntry] = useState<Entry | null>(null)
  const [status, setStatus] = useState<EntryStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id === null) return

    const controller = new AbortController()
    setStatus('loading')
    setEntry(null)
    setError(null)
    setNotFound(false)

    fetchEntry(id, controller.signal)
      .then((data) => {
        setEntry(data)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setNotFound(err instanceof ApiError && err.status === 404)
        setError(
          err instanceof ApiError && err.status === 404
            ? 'Entry not found.'
            : 'Could not load this entry.',
        )
        setStatus('error')
      })

    return () => controller.abort()
  }, [id])

  return { entry, status, error, notFound }
}
