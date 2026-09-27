'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { siteConfig } from '@/config/site'
import {
  ACTIVE_SPRINT_ID,
  bundledSprintCatalog,
  setSprintItemStatus,
  type SprintCatalog,
  type SprintStatus,
} from '@/lib/sprint'

const SPRINT_STORAGE_KEY = `${siteConfig.storagePrefix}.sprint-catalog`

type SprintCatalogContextValue = {
  catalog: SprintCatalog
  error: Error | undefined
  isLoading: boolean
  fetchedAt: number | undefined
  lastUpdated: string | undefined
  updateItemStatus: (itemId: string, status: SprintStatus) => void
  resetCatalog: () => void
}

const SprintCatalogContext = createContext<SprintCatalogContextValue | null>(null)

function readStoredCatalog(): SprintCatalog | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SPRINT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SprintCatalog
    return Array.isArray(parsed?.sprints) && parsed.sprints.length > 0 ? parsed : null
  } catch {
    return null
  }
}

/**
 * Sprint data channel.
 *
 * The board is seeded from `config/mockData.ts` and persisted to localStorage so
 * status tweaks survive a reload. Replace this provider with a SWR/fetch hook
 * when you connect a real API — the context contract stays identical.
 */
export function SprintCatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<SprintCatalog>(bundledSprintCatalog)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchedAt, setFetchedAt] = useState<number | undefined>(undefined)

  useEffect(() => {
    const stored = readStoredCatalog()
    if (stored) setCatalog(stored)
    setFetchedAt(Date.now())
    setIsLoading(false)
  }, [])

  const persist = useCallback((next: SprintCatalog) => {
    try {
      window.localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage failures; the in-memory state is still correct.
    }
  }, [])

  const updateItemStatus = useCallback(
    (itemId: string, status: SprintStatus) => {
      setCatalog((current) => {
        const next = setSprintItemStatus(current, itemId, status)
        persist(next)
        return next
      })
    },
    [persist],
  )

  const resetCatalog = useCallback(() => {
    setCatalog(bundledSprintCatalog)
    try {
      window.localStorage.removeItem(SPRINT_STORAGE_KEY)
    } catch {
      // Ignore.
    }
  }, [])

  const lastUpdated =
    catalog.sprints.find((sprint) => sprint.sprintId === ACTIVE_SPRINT_ID)?.lastUpdated ??
    catalog.sprints.find((sprint) => sprint.state === 'Active')?.lastUpdated ??
    catalog.sprints[0]?.lastUpdated

  const value = useMemo<SprintCatalogContextValue>(
    () => ({
      catalog,
      error: undefined,
      isLoading,
      fetchedAt,
      lastUpdated,
      updateItemStatus,
      resetCatalog,
    }),
    [catalog, fetchedAt, isLoading, lastUpdated, resetCatalog, updateItemStatus],
  )

  return <SprintCatalogContext.Provider value={value}>{children}</SprintCatalogContext.Provider>
}

export function useSprintCatalog() {
  const context = useContext(SprintCatalogContext)
  if (!context) {
    throw new Error('useSprintCatalog must be used within SprintCatalogProvider')
  }
  return context
}
