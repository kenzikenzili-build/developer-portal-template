import { siteConfig } from '@/config/site'
import type { IntelReport } from '@/config/reports'

export const REPORT_RETENTION_MS = 48 * 60 * 60 * 1000

export function reportTimestampMs(report: IntelReport): number {
  if (typeof report.createdAt === 'string' && report.createdAt.trim()) {
    const parsed = Date.parse(report.createdAt)
    if (!Number.isNaN(parsed)) return parsed
  }
  return 0
}

/** Keep only reports created within the last 48 hours. */
export function filterReportsLast48Hours(
  reports: readonly IntelReport[],
  now = Date.now(),
): IntelReport[] {
  return reports.filter((report) => {
    const created = reportTimestampMs(report)
    if (!created) return false
    return now - created <= REPORT_RETENTION_MS
  })
}

/** Newest first (strict timestamp descending). */
export function sortReportsByNewest(reports: readonly IntelReport[]): IntelReport[] {
  return [...reports].sort((a, b) => reportTimestampMs(b) - reportTimestampMs(a))
}

/**
 * Two-tier UI sort:
 * 1) Unread reports before read reports
 * 2) Within each group, newest `createdAt` first
 */
export function sortReportsByUnreadThenNewest(
  reports: readonly IntelReport[],
  isRead: (reportId: string) => boolean,
): IntelReport[] {
  return [...reports].sort((a, b) => {
    const aRead = isRead(a.id)
    const bRead = isRead(b.id)
    if (aRead !== bRead) {
      return aRead ? 1 : -1
    }
    return reportTimestampMs(b) - reportTimestampMs(a)
  })
}

export function formatReportTimestamp(report: IntelReport): string {
  const ms = reportTimestampMs(report)
  if (!ms) return report.syncedAt || '—'
  return new Date(ms).toLocaleString(siteConfig.locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: siteConfig.timeZone,
  })
}
