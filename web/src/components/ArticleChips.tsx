const CHIP_STYLES: Record<string, string> = {
  der: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  die: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  das: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

const NEUTRAL_CHIP =
  'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'

interface ArticleChipsProps {
  article: string | null
}

export function ArticleChips({ article }: ArticleChipsProps) {
  if (!article) return null
  const articles = article
    .split('/')
    .map((a) => a.trim())
    .filter(Boolean)

  return (
    <span className="flex items-center gap-1">
      {articles.map((a) => (
        <span
          key={a}
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
            CHIP_STYLES[a] ?? NEUTRAL_CHIP
          }`}
        >
          {a}
        </span>
      ))}
    </span>
  )
}
