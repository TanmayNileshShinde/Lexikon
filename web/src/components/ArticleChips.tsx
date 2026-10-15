const SUBTLE_STYLES: Record<string, string> = {
  der: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  die: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  das: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

const SOLID_STYLES: Record<string, string> = {
  der: 'bg-blue-600 text-white',
  die: 'bg-red-600 text-white',
  das: 'bg-emerald-600 text-white',
}

const NEUTRAL_SUBTLE =
  'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
const NEUTRAL_SOLID = 'bg-neutral-500 text-white'

interface ArticleChipsProps {
  article: string | null
  variant?: 'subtle' | 'solid'
}

export function ArticleChips({ article, variant = 'subtle' }: ArticleChipsProps) {
  if (!article) return null
  const articles = article
    .split('/')
    .map((a) => a.trim())
    .filter(Boolean)

  const solid = variant === 'solid'

  return (
    <span className="flex items-center gap-1">
      {articles.map((a) => (
        <span
          key={a}
          className={
            solid
              ? `rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                  SOLID_STYLES[a] ?? NEUTRAL_SOLID
                }`
              : `rounded px-1.5 py-0.5 text-xs font-medium ${
                  SUBTLE_STYLES[a] ?? NEUTRAL_SUBTLE
                }`
          }
        >
          {a}
        </span>
      ))}
    </span>
  )
}
