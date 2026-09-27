'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { siteConfig } from '@/config/site'

const READ_STATE_STORAGE_KEY = `${siteConfig.storagePrefix}.read-reports`

/**
 * Report read-state, persisted in localStorage.
 *
 * The shape matches what a server round-trip would return, so swapping this hook
 * for a fetch/SWR implementation is a drop-in change.
 */
export function useReportSync() {
  const [readIdsList, setReadIdsList] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const persist = useCallback((ids: string[]) => {
    try {
      window.localStorage.setItem(READ_STATE_STORAGE_KEY, JSON.stringify({ readIds: ids }))
    } catch {
      // Ignore storage failures.
    }
  }, [])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(READ_STATE_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { readIds?: unknown }
        if (Array.isArray(parsed.readIds)) {
          setReadIdsList(parsed.readIds.filter((id): id is string => typeof id === 'string'))
        }
      }
    } catch {
      // Ignore malformed payloads.
    } finally {
      setIsLoading(false)
    }
  }, [])

  const readIds = useMemo(() => new Set(readIdsList), [readIdsList])

  const isRead = useCallback((id: string) => readIds.has(id), [readIds])

  const markRead = useCallback(
    (reportId: string) => {
      if (!reportId) return
      setReadIdsList((prev) => {
        if (prev.includes(reportId)) return prev
        const next = [...prev, reportId]
        persist(next)
        return next
      })
    },
    [persist],
  )

  const markUnread = useCallback(
    (reportId: string) => {
      if (!reportId) return
      setReadIdsList((prev) => {
        const next = prev.filter((id) => id !== reportId)
        persist(next)
        return next
      })
    },
    [persist],
  )

  const markAllRead = useCallback(
    (allIds: string[]) => {
      if (!allIds.length) return
      setReadIdsList((prev) => {
        const next = Array.from(new Set([...prev, ...allIds]))
        persist(next)
        return next
      })
    },
    [persist],
  )

  return {
    readIds,
    readIdsList,
    isLoading,
    error: undefined as Error | undefined,
    isRead,
    markRead,
    markUnread,
    markAllRead,
  }
}
