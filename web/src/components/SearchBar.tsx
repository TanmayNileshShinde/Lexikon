import type { KeyboardEvent } from 'react'

interface SearchBarProps {
  value: string
  loading: boolean
  onChange: (value: string) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
}

export function SearchBar({
  value,
  loading,
  onChange,
  onKeyDown,
}: SearchBarProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-[#1E293B] bg-[#0F172A]/80 p-4 backdrop-blur-md transition-all duration-300 focus-within:border-violet-500/50 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.1)] focus-within:ring-2 focus-within:ring-violet-500/10">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0 text-slate-500"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search a German word…"
        aria-label="Search a German word"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full bg-transparent text-lg font-medium tracking-tight text-white outline-none placeholder:text-slate-500"
      />

      {loading && (
        <svg
          className="h-5 w-5 shrink-0 animate-spin text-violet-400"
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
      )}
    </div>
  )
}
