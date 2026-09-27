export const THEME_STORAGE_KEY = 'theme'
export const DEFAULT_THEME = 'light'

export function readStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (value === 'dark' || value === 'light') return value
    return DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}
