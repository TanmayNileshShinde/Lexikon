interface SearchBarProps {
  value: string
  loading: boolean
  onChange: (value: string) => void
}

export function SearchBar({ value, loading, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search a German word…"
        aria-label="Search a German word"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-11 text-lg text-neutral-900 placeholder:text-neutral-400 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200/60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:ring-neutral-800"
      />
      {loading && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <svg
            className="h-4 w-4 animate-spin text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </span>
      )}
    </div>
  )
}
