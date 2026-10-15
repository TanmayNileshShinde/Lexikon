const ARTICLE_STYLES: Record<string, string> = {
  der: 'bg-blue-950/80 border border-blue-800 text-blue-400',
  die: 'bg-rose-950/80 border border-rose-800 text-rose-400',
  das: 'bg-emerald-950/80 border border-emerald-800 text-emerald-400',
}

const NEUTRAL = 'bg-slate-800/60 border border-slate-700 text-slate-300'

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
    <span className="flex items-center gap-1.5">
      {articles.map((a) => (
        <span
          key={a}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-widest ${
            ARTICLE_STYLES[a] ?? NEUTRAL
          }`}
        >
          {a}
        </span>
      ))}
    </span>
  )
}
