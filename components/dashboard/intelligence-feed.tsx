'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { NewsCard, type NoteSaveStatus } from '@/components/dashboard/news-card'
import { NewsTabBar } from '@/components/dashboard/news-tab-bar'
import { mockIntelligence } from '@/config/mockData'
import { siteConfig } from '@/config/site'
import { normalizeNewsDatabase, type CuratedNewsItem, type NewsTabKey } from '@/lib/news-schema'

const READ_STORAGE_KEY = `${siteConfig.storagePrefix}.intel-read`
const NOTES_STORAGE_KEY = `${siteConfig.storagePrefix}.knowledge-notes`

/**
 * Curated intelligence feed.
 *
 * Renders `mockIntelligence` with no network dependency. Replace the source with
 * a `fetch` to your own endpoint (same payload shape) when you have one; the tab
 * counts and read-state behaviour keep working unchanged.
 */
export function IntelligenceFeed() {
  const [activeTab, setActiveTab] = useState<NewsTabKey>('all')
  const [readIds, setReadIds] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState<string>('')
  const [noteStatus, setNoteStatus] = useState<Record<string, NoteSaveStatus>>({})

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(READ_STORAGE_KEY)
      if (raw) setReadIds(JSON.parse(raw) as string[])
    } catch {
      // Ignore malformed payloads.
    }
  }, [])

  const { updatedAt, itemsByCategory, allItems } = useMemo(
    () => normalizeNewsDatabase(mockIntelligence),
    [],
  )

  const displayedItems = useMemo(() => {
    if (activeTab === 'all') return allItems
    return itemsByCategory[activeTab] ?? []
  }, [activeTab, allItems, itemsByCategory])

  const getItemCount = useCallback(
    (tab: NewsTabKey) => (tab === 'all' ? allItems.length : (itemsByCategory[tab]?.length ?? 0)),
    [allItems.length, itemsByCategory],
  )

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => window.setTimeout(resolve, 350))
    setRefreshedAt(
      new Date().toLocaleTimeString(siteConfig.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: siteConfig.timeZone,
      }),
    )
    setIsRefreshing(false)
  }, [])

  const handleToggleRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage failures.
      }
      return next
    })
  }, [])

  const handleSaveNote = useCallback(async (item: CuratedNewsItem) => {
    setNoteStatus((prev) => ({ ...prev, [item.id]: 'saving' }))
    try {
      const raw = window.localStorage.getItem(NOTES_STORAGE_KEY)
      const existing = raw ? (JSON.parse(raw) as unknown[]) : []
      const note = {
        id: `note-${item.id}`,
        tag: 'research',
        content: `${item.title} — ${item.key_points[0] ?? ''}`,
        savedAt: new Date().toISOString().slice(0, 10),
      }
      window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([note, ...existing]))
      setNoteStatus((prev) => ({ ...prev, [item.id]: 'saved' }))
    } catch {
      setNoteStatus((prev) => ({ ...prev, [item.id]: 'idle' }))
    }
  }, [])

  const formattedUpdate =
    refreshedAt ||
    new Date(updatedAt).toLocaleString(siteConfig.locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: siteConfig.timeZone,
    })

  return (
    <section id="intelligence" className="scroll-mt-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900 md:text-xs dark:text-slate-300">
                INTELLIGENCE FEED
              </h2>
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Mock data
              </span>
            </div>
            <p className="mt-1 text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              Curated signal stream
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden flex-col text-right font-mono text-[11px] text-slate-500 sm:flex dark:text-slate-400">
              <span>Last sync ({siteConfig.timeZone})</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {formattedUpdate}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-xs transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing…' : 'Refresh'}
            </button>
          </div>
        </div>

        <NewsTabBar activeTab={activeTab} onSelectTab={setActiveTab} getItemCount={getItemCount} />

        <div className="mt-5">
          {displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <AlertCircle className="size-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Nothing new in this category
              </h3>
              <p className="mt-1 max-w-md text-xs font-medium text-slate-600 dark:text-slate-400">
                The feed only surfaces signals above the relevance threshold — no filler content.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedItems.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  isRead={readIds.includes(item.id)}
                  onToggleRead={handleToggleRead}
                  onSaveNote={(target) => void handleSaveNote(target)}
                  noteStatus={noteStatus[item.id] ?? 'idle'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

