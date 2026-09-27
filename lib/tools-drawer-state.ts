import { siteConfig } from '@/config/site'

/** Open/closed accordion state for Tools Launcher categories. `true` = expanded. */
export const TOOLS_DRAWER_STORAGE_KEY = `${siteConfig.storagePrefix}.tools-drawer-state`

export type ToolsDrawerState = Record<string, boolean>

function canUseStorage() {
  return typeof window !== 'undefined'
}

/** Read persisted open map. Missing / invalid → `{}` (callers default categories to open). */
export function loadToolsDrawerState(): ToolsDrawerState {
  if (!canUseStorage()) return {}
  try {
    const raw = window.localStorage.getItem(TOOLS_DRAWER_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const next: ToolsDrawerState = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof key !== 'string' || !key || typeof value !== 'boolean') continue
      next[key] = value
    }
    return next
  } catch {
    return {}
  }
}

export function saveToolsDrawerState(state: ToolsDrawerState) {
  if (!canUseStorage()) return
  try {
    const cleaned: ToolsDrawerState = {}
    for (const [key, value] of Object.entries(state)) {
      if (typeof key !== 'string' || !key || typeof value !== 'boolean') continue
      cleaned[key] = value
    }
    window.localStorage.setItem(TOOLS_DRAWER_STORAGE_KEY, JSON.stringify(cleaned))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/** Unspecified categories default to open (`true`). */
export function isToolsCategoryOpen(
  category: string,
  state: Partial<Record<string, boolean>>,
): boolean {
  return state[category] !== false
}

export function areAllCategoriesOpen(
  categories: readonly string[],
  state: Partial<Record<string, boolean>>,
): boolean {
  return categories.length > 0 && categories.every((category) => isToolsCategoryOpen(category, state))
}

export function setAllCategoriesOpen(
  categories: readonly string[],
  open: boolean,
): ToolsDrawerState {
  const next: ToolsDrawerState = {}
  for (const category of categories) {
    if (typeof category !== 'string' || !category) continue
    next[category] = open
  }
  return next
}
