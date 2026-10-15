import type { ReactNode } from 'react'
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

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
      {children}
    </h3>
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
    <article className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="text-3xl font-semibold tracking-tight">
            {entry.word}
          </h2>
          <ArticleChips article={entry.article} />
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            {entry.pos}
          </span>
          {entry.separable && (
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              separable
            </span>
          )}
          {!entry.article && entry.gender && (
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {entry.gender}
            </span>
          )}
        </div>
        {ipas.length > 0 && (
          <p className="mt-2 font-mono text-sm text-neutral-500 dark:text-neutral-400">
            {ipas.join('  ·  ')}
          </p>
        )}
      </header>

      {fields.length > 0 && (
        <section>
          <SectionTitle>Morphology</SectionTitle>
          <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-1.5">
            {fields.map((field) => (
              <div key={field.label} className="flex gap-2 text-sm">
                <dt className="text-neutral-400 dark:text-neutral-500">
                  {field.label}
                </dt>
                <dd className="font-medium text-neutral-800 dark:text-neutral-200">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {senses.length > 0 && (
        <section>
          <SectionTitle>Meanings</SectionTitle>
          <ol className="mt-2 list-decimal space-y-3 pl-5 marker:font-medium marker:text-neutral-400 dark:marker:text-neutral-600">
            {senses.map((sense, i) => (
              <li key={i} className="pl-1">
                <p className="text-[15px] leading-relaxed">
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {sense.glosses[0]}
                  </span>
                  {sense.glosses.slice(1).map((gloss, gi) => (
                    <span
                      key={gi}
                      className="text-neutral-500 dark:text-neutral-400"
                    >
                      , {gloss}
                    </span>
                  ))}
                </p>
                {sense.examples?.map((example, ei) => (
                  <blockquote
                    key={ei}
                    className="mt-1.5 border-l-2 border-neutral-200 pl-3 text-sm dark:border-neutral-700"
                  >
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {example.text}
                    </p>
                    {example.en && (
                      <p className="italic text-neutral-400 dark:text-neutral-500">
                        {example.en}
                      </p>
                    )}
                  </blockquote>
                ))}
              </li>
            ))}
          </ol>
        </section>
      )}

      {relations.map((section) => (
        <section key={section.label}>
          <SectionTitle>{section.label}</SectionTitle>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {section.items.map((item) => (
              <button
                key={item.word}
                type="button"
                onClick={() => onSelectTerm(item.word)}
                className="cursor-pointer rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
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
    <section className="flex flex-col gap-6">
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
