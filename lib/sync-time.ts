import { siteConfig } from '@/config/site'

export const LIVE_SYNC_FRESH_MS = 5 * 60 * 1000

export function parseTimestamp(value: string | number | Date | undefined): Date | null {
  if (value === undefined || value === null) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof value !== 'string' || !value.trim()) return null
  const raw = value.trim()
  const iso = new Date(raw)
  if (!Number.isNaN(iso.getTime())) return iso
  const dateOnly = new Date(`${raw}T00:00:00`)
  return Number.isNaN(dateOnly.getTime()) ? null : dateOnly
}

function monthLabel(date: Date): string {
  return date
    .toLocaleString(siteConfig.locale, { timeZone: siteConfig.timeZone, month: 'short' })
    .replace('.', '')
    .toUpperCase()
}

function dayLabel(date: Date): string {
  return date.toLocaleString(siteConfig.locale, { timeZone: siteConfig.timeZone, day: '2-digit' })
}

/** e.g. "30 AUG, 09:10" in the configured timezone. */
export function formatSyncTimestamp(value: string | number | Date | undefined): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const date = parseTimestamp(`${value.trim()}T00:00:00`)
    if (!date) return value
    return `${dayLabel(date)} ${monthLabel(date)}`
  }

  const date = parseTimestamp(value)
  if (!date) return typeof value === 'string' ? value : ''

  const time = date.toLocaleString(siteConfig.locale, {
    timeZone: siteConfig.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${dayLabel(date)} ${monthLabel(date)}, ${time}`
}

export function isFreshSync(fetchedAt: number | undefined, now = Date.now()): boolean {
  if (fetchedAt === undefined) return false
  return now - fetchedAt < LIVE_SYNC_FRESH_MS
}
