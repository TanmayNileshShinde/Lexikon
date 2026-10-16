export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'lexikon-theme'

/** The theme currently applied to <html> (set before paint by index.html). */
export function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* storage unavailable (private mode): theme still applies this session */
  }
}
