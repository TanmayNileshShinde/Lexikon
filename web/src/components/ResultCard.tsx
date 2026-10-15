import type { SuggestResult } from '../lib/api'
import { ArticleChips } from './ArticleChips'

interface ResultCardProps {
  result: SuggestResult
  onSelect: (id: number) => void
}

export function ResultCard({ result, onSelect }: ResultCardProps) {
  return (
    <li className="list-none">
      <button
        type="button"
        onClick={() => onSelect(result.id)}
        aria-label={`Open full entry for ${result.word}`}
        className="w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60 dark:focus-visible:outline-neutral-600"
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {result.word}
          </span>
          <ArticleChips article={result.article} />
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            {result.pos}
          </span>
          {result.plural && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              pl. {result.plural}
            </span>
          )}
        </div>
        {result.snippet && (
          <p className="mt-1 text-sm leading-snug text-neutral-600 dark:text-neutral-400">
            {result.snippet}
          </p>
        )}
      </button>
    </li>
  )
}
