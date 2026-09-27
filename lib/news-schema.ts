/**
 * Curated intelligence feed schema.
 *
 * Category keys are intentionally generic. Point `config/mockData.ts` at your
 * own JSON feed (same shape) and the feed component will render it untouched.
 */
export type NewsCategoryKey =
  | 'engineering'
  | 'ai_frontier'
  | 'market_signals'
  | 'platform_status'
  | 'product'

export type NewsTabKey = 'all' | NewsCategoryKey

export interface NewsTabDef {
  id: NewsTabKey
  label: string
  shortLabel: string
  description: string
}

export const NEWS_CATEGORY_KEYS: NewsCategoryKey[] = [
  'engineering',
  'ai_frontier',
  'market_signals',
  'platform_status',
  'product',
]

export const NEWS_TABS: NewsTabDef[] = [
  { id: 'all', label: 'All Signals', shortLabel: 'All', description: 'Cross-category signal stream' },
  { id: 'engineering', label: 'Engineering', shortLabel: 'Eng', description: 'Platform, infra and developer tooling' },
  { id: 'ai_frontier', label: 'AI Frontier', shortLabel: 'AI', description: 'Model and tooling breakthroughs' },
  { id: 'market_signals', label: 'Market Signals', shortLabel: 'Market', description: 'Macro moves that touch the roadmap' },
  { id: 'platform_status', label: 'Platform Status', shortLabel: 'Status', description: 'Incidents, capacity and reliability' },
  { id: 'product', label: 'Product', shortLabel: 'Product', description: 'Roadmap and release chatter' },
]

export interface NewsHighlight {
  label: string
  value: string
}

export interface CuratedNewsItem {
  id: string
  category: NewsCategoryKey
  updated_at: string
  title: string
  key_points: string[]
  source_tag: string
  url?: string
  /** Optional structured highlights rendered as key/value rows. */
  highlights?: NewsHighlight[]
  /** Optional severity used for the badge tone. */
  severity?: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO'
  /** Optional free-form call to action. */
  action?: string
}

export interface CuratedNewsDatabase {
  updated_at: string
  version?: string
  categories: Record<NewsCategoryKey, CuratedNewsItem[]>
}

function emptyByCategory(): Record<NewsCategoryKey, CuratedNewsItem[]> {
  return {
    engineering: [],
    ai_frontier: [],
    market_signals: [],
    platform_status: [],
    product: [],
  }
}

function pickCategoryItems(source: Record<string, unknown>, key: NewsCategoryKey): CuratedNewsItem[] {
  const value = source[key]
  return Array.isArray(value) ? (value as CuratedNewsItem[]) : []
}

/**
 * Accepts either `{ categories: {...} }`, top-level category keys, or a flat
 * array of items that each carry a `category` field. Always resolves to the
 * same normalized shape so the feed stays defensive against bad payloads.
 */
export function normalizeNewsDatabase(raw: unknown): {
  updatedAt: string
  itemsByCategory: Record<NewsCategoryKey, CuratedNewsItem[]>
  allItems: CuratedNewsItem[]
} {
  const fallback = {
    updatedAt: new Date().toISOString(),
    itemsByCategory: emptyByCategory(),
    allItems: [] as CuratedNewsItem[],
  }

  if (!raw || typeof raw !== 'object') return fallback

  const data = raw as Record<string, unknown>
  const updatedAt = typeof data.updated_at === 'string' ? data.updated_at : fallback.updatedAt

  const container =
    data.categories && typeof data.categories === 'object' && !Array.isArray(data.categories)
      ? (data.categories as Record<string, unknown>)
      : data

  const itemsByCategory = emptyByCategory()
  for (const key of NEWS_CATEGORY_KEYS) {
    itemsByCategory[key] = pickCategoryItems(container, key)
  }

  const hasStructuredItems = NEWS_CATEGORY_KEYS.some((key) => itemsByCategory[key].length > 0)
  if (hasStructuredItems) {
    return { updatedAt, itemsByCategory, allItems: Object.values(itemsByCategory).flat() }
  }

  // Fall back to a flat list of items that each declare their own category.
  const rawList = Array.isArray(data) ? data : Array.isArray(data.items) ? (data.items as unknown[]) : []
  const flatItems: CuratedNewsItem[] = []
  for (const entry of rawList) {
    if (!entry || typeof entry !== 'object') continue
    const item = entry as CuratedNewsItem
    const key = item.category as NewsCategoryKey
    if (NEWS_CATEGORY_KEYS.includes(key)) {
      itemsByCategory[key].push(item)
    }
    flatItems.push(item)
  }

  return { updatedAt, itemsByCategory, allItems: flatItems }
}
