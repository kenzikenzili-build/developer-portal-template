import { siteConfig } from '@/config/site'

const CATEGORY_BOX_PREFIX = 'cat:'
const CATEGORY_PILL_PREFIX = 'pill:'

/** Persisted Tools Launcher category order (filter pills + accordion sections). */
export const CATEGORY_ORDER_STORAGE_KEY = `${siteConfig.storagePrefix}.category-order`

/** Persisted Tools Launcher drag-and-drop lock. Default is locked. */
export const TOOLS_LOCK_STORAGE_KEY = `${siteConfig.storagePrefix}.tools-locked`
/** @deprecated Prefer TOOLS_LOCK_STORAGE_KEY. Read as fallback only. */
export const CATEGORY_LOCK_STORAGE_KEY = `${siteConfig.storagePrefix}.category-lock-state`

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function categoryBoxId(name: string): string {
  return `${CATEGORY_BOX_PREFIX}${name}`
}

export function categoryPillId(name: string): string {
  return `${CATEGORY_PILL_PREFIX}${name}`
}

export function isCategoryBoxId(id: string): boolean {
  return typeof id === 'string' && id.startsWith(CATEGORY_BOX_PREFIX)
}

export function isCategoryPillId(id: string): boolean {
  return typeof id === 'string' && id.startsWith(CATEGORY_PILL_PREFIX)
}

export function isCategoryDndId(id: string): boolean {
  return isCategoryBoxId(id) || isCategoryPillId(id)
}

export function parseCategoryDndId(id: string): string | null {
  if (isCategoryBoxId(id)) {
    const name = id.slice(CATEGORY_BOX_PREFIX.length)
    return name.length > 0 ? name : null
  }
  if (isCategoryPillId(id)) {
    const name = id.slice(CATEGORY_PILL_PREFIX.length)
    return name.length > 0 ? name : null
  }
  return null
}

export function categoryDndPrefix(id: string): typeof CATEGORY_BOX_PREFIX | typeof CATEGORY_PILL_PREFIX | null {
  if (isCategoryBoxId(id)) return CATEGORY_BOX_PREFIX
  if (isCategoryPillId(id)) return CATEGORY_PILL_PREFIX
  return null
}

/** Raw stored names. Invalid / missing → `[]` (callers fall back to defaults). */
export function loadCategoryOrder(): string[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(CATEGORY_ORDER_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((name): name is string => typeof name === 'string' && name.length > 0)
  } catch {
    return []
  }
}

export function saveCategoryOrder(order: string[]) {
  if (!canUseStorage()) return
  try {
    const cleaned = [
      ...new Set(order.filter((name): name is string => typeof name === 'string' && name.length > 0)),
    ]
    window.localStorage.setItem(CATEGORY_ORDER_STORAGE_KEY, JSON.stringify(cleaned))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function clearCategoryOrder() {
  if (!canUseStorage()) return
  try {
    window.localStorage.removeItem(CATEGORY_ORDER_STORAGE_KEY)
  } catch {
    // Ignore
  }
}

/**
 * localStorage stores booleans as the strings `"true"` / `"false"`.
 * Never use `Boolean(saved)` — `Boolean("false") === true`.
 */
export function parseToolsLockFlag(saved: string | null): boolean {
  return saved !== null ? saved === 'true' : true
}

function readLockRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Missing / invalid → locked (`true`). Prefers TOOLS_LOCK_STORAGE_KEY. */
export function loadToolsLockState(): boolean {
  if (!canUseStorage()) return true
  const saved = readLockRaw(TOOLS_LOCK_STORAGE_KEY)
  if (saved !== null) return parseToolsLockFlag(saved)
  return parseToolsLockFlag(readLockRaw(CATEGORY_LOCK_STORAGE_KEY))
}

/** @deprecated Use loadToolsLockState */
export const loadCategoryLockState = loadToolsLockState

export function saveToolsLockState(locked: boolean) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(TOOLS_LOCK_STORAGE_KEY, locked ? 'true' : 'false')
    window.localStorage.removeItem(CATEGORY_LOCK_STORAGE_KEY)
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/** @deprecated Use saveToolsLockState */
export const saveCategoryLockState = saveToolsLockState

/** Keep known categories from `stored`, then append any new defaults. */
export function applyCategoryOrder<T extends string>(
  defaults: readonly T[],
  stored: readonly string[] | null | undefined,
): T[] {
  const allowed = new Set<string>(defaults)
  const next: T[] = []
  const seen = new Set<string>()

  if (Array.isArray(stored)) {
    for (const name of stored) {
      if (typeof name !== 'string' || !allowed.has(name) || seen.has(name)) continue
      next.push(name as T)
      seen.add(name)
    }
  }

  for (const name of defaults) {
    if (seen.has(name)) continue
    next.push(name)
    seen.add(name)
  }

  return next
}

/** Immutable reorder used by category pill/box drag-end. */
export function arrayMove<T>(items: readonly T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return [...items]
  }
  const next = items.slice()
  const [removed] = next.splice(from, 1)
  if (removed === undefined) return [...items]
  next.splice(to, 0, removed)
  return next
}

export function reorderCategoryNames<T extends string>(
  order: readonly T[],
  activeName: string,
  overName: string,
): T[] {
  const from = order.indexOf(activeName as T)
  const to = order.indexOf(overName as T)
  return arrayMove(order, from, to)
}
