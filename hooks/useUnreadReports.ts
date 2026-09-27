'use client'

import { useMemo } from 'react'

import { mockReports } from '@/config/mockData'
import { useReportSync } from '@/hooks/useReportSync'
import { isReportMarkedRead } from '@/lib/reports/read-state'

/** Unread badge count for the navigation. Backed by the mock report registry. */
export function useUnreadReportCount(): number {
  const { readIds } = useReportSync()

  return useMemo(
    () => mockReports.filter((report) => !isReportMarkedRead(report.id, readIds)).length,
    [readIds],
  )
}
