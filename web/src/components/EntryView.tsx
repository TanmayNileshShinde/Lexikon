import type { Entry, RelationItem, RelationKey } from '../lib/api'
import { morphFields } from '../lib/morphology'
import { useEntry } from '../lib/useEntry'
import { ArticleChips } from './ArticleChips'

interface EntryViewProps {
  id: number
  onBack: () => void
  onSelectTerm: (term: string) => void
}

const RELATION_LABELS: { key: RelationKey; label: string }[] = [
  { key: 'synonyms', label: 'Synonyms' },
  { key: 'antonyms', label: 'Antonyms' },
  { key: 'derived', label: 'Derived' },
  { key: 'related', label: 'Related' },
  { key: 'hypernyms', label: 'Hypernyms' },
  { key: 'hyponyms', label: 'Hyponyms' },
  { key: 'holonyms', label: 'Holonyms' },
  { key: 'meronyms', label: 'Meronyms' },
  { key: 'coordinate_terms', label: 'Coordinate terms' },
]

/** Solid, vibrant part-of-speech badges. */
const POS_STYLES: Record<string, string> = {
  noun: 'bg-purple-600',
  verb: 'bg-sky-600',
  adj: 'bg-amber-500',
  adv: 'bg-teal-600',
  name: 'bg-rose-600',
  phrase: 'bg-indigo-600',
}
const POS_FALLBACK = 'bg-slate-500'

const BADGE =
  'inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white'

/** Drop malformed strings (lone surrogates / U+FFFD) from the kaikki IPA data. */
function isWellFormed(s: string): boolean {
  const withoutPairs = s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
  return !/[\uD800-\uDFFF]/.test(withoutPairs)
}

function ipasOf(entry: Entry): string[] {
  return (entry.sounds ?? [])
    .map((s) => s.ipa)
    .filter((ipa): ipa is string => Boolean(ipa) && isWellFormed(ipa))
    .slice(0, 3)
}

function relationSections(entry: Entry): { label: string; items: RelationItem[] }[] {
  const sections: { label: string; items: RelationItem[] }[] = []
  for (const { key, label } of RELATION_LABELS) {
    const items = entry[key]
    if (!Array.isArray(items) || items.length === 0) continue
    const seen = new Set<string>()
    const unique = items.filter((item) => {
      if (!item?.word || seen.has(item.word)) return false
      seen.add(item.word)
      return true
    })
    if (unique.length) sections.push({ label, items: unique })
  }
  return sections
}

function PosBadge({ pos }: { pos: string }) {
  return <span className={`${BADGE} ${POS_STYLES[pos] ?? POS_FALLBACK}`}>{pos}</span>
}

/** Dark label badge attached to a light value badge, e.g. [Plural | Dächer]. */
function FormBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex overflow-hidden rounded text-xs font-bold shadow-sm">
      <span className="bg-neutral-800 px-2 py-0.5 uppercase tracking-wide text-neutral-50 dark:bg-neutral-200 dark:text-neutral-900">
        {label}
      </span>
      <span className="bg-neutral-100 px-2 py-0.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
        {value}
      </span>
    </span>
  )
}

function EntryDetails({
  entry,
  onSelectTerm,
}: {
  entry: Entry
  onSelectTerm: (term: string) => void
}) {
  const fields = morphFields(entry)
  const ipas = ipasOf(entry)
  const senses = entry.senses ?? []
  const relations = relationSections(entry)

  return (
    <article className="flex flex-col gap-8">
      <header>
        <h2 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl dark:text-white">
          {entry.word}
        </h2>

        {ipas.length > 0 && (
          <p className="mt-1 font-mono text-base text-neutral-400 dark:text-neutral-500">
            {ipas.join('  ·  ')}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <PosBadge pos={entry.pos} />
          <ArticleChips article={entry.article} variant="solid" />
          {entry.separable && (
            <span className={`${BADGE} bg-orange-500`}>separable</span>
          )}
          {!entry.article && entry.gender && (
            <span className={`${BADGE} bg-neutral-500`}>{entry.gender}</span>
          )}
          {fields.map((field) => (
            <FormBadge
              key={field.label}
              label={field.label}
              value={field.value}
            />
          ))}
        </div>
      </header>

      {senses.length > 0 && (
        <ol className="flex list-decimal flex-col gap-4 pl-5 marker:font-semibold marker:text-neutral-400 dark:marker:text-neutral-600">
          {senses.map((sense, i) => (
            <li key={i} className="pl-1">
              <p className="text-lg font-medium leading-relaxed text-neutral-900 dark:text-white">
                {sense.glosses[0]}
                {sense.glosses.slice(1).map((gloss, gi) => (
                  <span
                    key={gi}
                    className="font-normal text-neutral-500 dark:text-neutral-400"
                  >
                    , {gloss}
                  </span>
                ))}
              </p>
              {sense.examples?.map((example, ei) => (
                <blockquote
                  key={ei}
                  className="mt-2 border-l-2 border-neutral-200 pl-4 dark:border-neutral-700"
                >
                  <p className="text-sm italic text-neutral-600 dark:text-neutral-300">
                    {example.text}
                  </p>
                  {example.en && (
                    <p className="mt-0.5 text-sm italic text-neutral-400 dark:text-neutral-500">
                      {example.en}
                    </p>
                  )}
                </blockquote>
              ))}
            </li>
          ))}
        </ol>
      )}

      {relations.map((section) => (
        <section key={section.label}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {section.label}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {section.items.map((item) => (
              <button
                key={item.word}
                type="button"
                onClick={() => onSelectTerm(item.word)}
                className="cursor-pointer rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                {item.word}
                {item.roman && (
                  <span className="text-neutral-400 dark:text-neutral-500">
                    {' '}
                    · {item.roman}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      ))}
    </article>
  )
}

export function EntryView({ id, onBack, onSelectTerm }: EntryViewProps) {
  const { entry, status, error } = useEntry(id)

  return (
    <section className="animate-fade-in-up flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer self-start text-sm text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Back to search
      </button>

      {status === 'loading' && (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          Loading…
        </p>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error ?? 'Could not load this entry.'}
        </p>
      )}

      {entry && status === 'ready' && (
        <EntryDetails entry={entry} onSelectTerm={onSelectTerm} />
      )}
    </section>
  )
}
