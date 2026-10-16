import { useCallback, useEffect, useRef, useState } from 'react'
import { EntryView } from './components/EntryView'
import { Search } from './components/Search'
import { fetchSuggest, type Entry } from './lib/api'
import { buildPath, parseLocation } from './lib/route'
import { useSearch } from './lib/useSearch'

const BASE_TITLE = 'Lexikon'

export default function App() {
  const initial = useRef(parseLocation(window.location)).current
  const search = useSearch(175, initial.q)
  const [selectedId, setSelectedId] = useState<number | null>(initial.entryId)
  // The word from the URL (/entry/<id>/<word>); used to detect stale ids.
  const slugRef = useRef<string | null>(initial.slug)

  const { setQuery } = search

  // --- URL <-> state ---------------------------------------------------- //

  const showEntry = useCallback((id: number) => {
    slugRef.current = null
    setSelectedId(id)
    window.history.pushState(null, '', buildPath({ entryId: id }))
  }, [])

  const showSearch = useCallback(
    (q: string) => {
      slugRef.current = null
      setSelectedId(null)
      setQuery(q)
      document.title = BASE_TITLE
      window.history.pushState(null, '', buildPath({ q }))
    },
    [setQuery],
  )

  // Browser back/forward.
  useEffect(() => {
    const onPopState = () => {
      const route = parseLocation(window.location)
      slugRef.current = route.slug
      setSelectedId(route.entryId)
      if (route.entryId === null) {
        setQuery(route.q)
        document.title = BASE_TITLE
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [setQuery])

  // Keep ?q= in the address bar while searching (replace, don't pile up).
  useEffect(() => {
    if (selectedId !== null) return
    const path = buildPath({ q: search.debouncedQuery })
    if (path !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, '', path)
    }
  }, [selectedId, search.debouncedQuery])

  // Resolve a stale/removed id by the word stored in the URL.
  const resolveBySlug = useCallback(
    (slug: string) => {
      fetchSuggest(slug, new AbortController().signal)
        .then((data) => {
          const hit = data.results.find((r) => r.word === slug)
          if (hit) {
            slugRef.current = null
            setSelectedId(hit.id)
            window.history.replaceState(
              null,
              '',
              buildPath({ entryId: hit.id, slug: hit.word }),
            )
          } else {
            slugRef.current = null
            setSelectedId(null)
            setQuery(slug)
          }
        })
        .catch(() => {
          /* leave the error state from the entry view in place */
        })
    },
    [setQuery],
  )

  const handleLoaded = useCallback(
    (entry: Entry) => {
      const slug = slugRef.current
      if (slug && entry.word !== slug) {
        resolveBySlug(slug)
        return
      }
      slugRef.current = null
      document.title = `${entry.word} · ${BASE_TITLE}`
      window.history.replaceState(
        null,
        '',
        buildPath({ entryId: entry.id, slug: entry.word }),
      )
    },
    [resolveBySlug],
  )

  const handleMissing = useCallback(() => {
    const slug = slugRef.current
    if (slug) resolveBySlug(slug)
  }, [resolveBySlug])

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
              Lexikon
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
            onSelect={showEntry}
          />
        ) : (
          <EntryView
            id={selectedId}
            onBack={() => showSearch(search.query)}
            onSelectTerm={showSearch}
            onLoaded={handleLoaded}
            onMissing={handleMissing}
          />
        )}
      </main>
    </div>
  )
}
