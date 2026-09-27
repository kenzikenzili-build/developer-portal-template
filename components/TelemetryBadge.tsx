'use client'

import { useEffect, useState } from 'react'

import { formatSyncTimestamp, isFreshSync } from '@/lib/sync-time'

export type TelemetryStatus = 'live' | 'error' | 'sandbox' | 'loading'

type TelemetryBadgeProps = {
  status: TelemetryStatus
  errorMessage?: string
  className?: string
  /** Payload lastUpdated / snapshot.updatedAt — shown as "30 AUG, 09:10". */
  lastUpdated?: string
  /** Epoch ms of the last successful client fetch. */
  fetchedAt?: number
}

/**
 * Transparent telemetry chip for Command Center cards.
 * Green pulse when the last successful fetch is within 5 minutes.
 */
export function TelemetryBadge({
  status,
  errorMessage,
  className = '',
  lastUpdated,
  fetchedAt,
}: TelemetryBadgeProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (status !== 'live') return
    const id = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(id)
  }, [status])

  const fresh = status === 'live' && (fetchedAt === undefined || isFreshSync(fetchedAt, now))
  const stamp = lastUpdated ? formatSyncTimestamp(lastUpdated) : ''

  const config = {
    live: {
      pulse: fresh,
      color: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      text: 'LIVE SYNC',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-900/40',
    },
    error: {
      pulse: true,
      color: 'bg-amber-500',
      ping: 'bg-red-400/80',
      text: 'API ERROR',
      textClass: 'text-amber-800 dark:text-amber-300',
      bgClass: 'bg-amber-50 border-red-300/50 dark:bg-red-950/30 dark:border-red-900/40',
    },
    sandbox: {
      pulse: false,
      color: 'bg-slate-400',
      ping: 'bg-slate-400',
      text: 'MOCK DATA',
      textClass: 'text-slate-600 dark:text-slate-400',
      bgClass: 'bg-slate-50 border-slate-200/60 dark:bg-slate-900/30 dark:border-slate-800/40',
    },
    loading: {
      pulse: true,
      color: 'bg-sky-500',
      ping: 'bg-sky-400',
      text: 'FETCHING',
      textClass: 'text-sky-700 dark:text-sky-400',
      bgClass: 'bg-sky-50 border-sky-200/60 dark:bg-sky-950/30 dark:border-sky-900/40',
    },
  }

  const { pulse, color, ping, text, textClass, bgClass } = config[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 ${bgClass} ${className}`}
      title={errorMessage || [text, stamp ? `UPDATED ${stamp}` : ''].filter(Boolean).join(' · ')}
    >
      <span className="relative flex size-2">
        {pulse ? (
          <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${ping}`} />
        ) : null}
        <span className={`relative inline-flex size-2 rounded-full ${color}`} />
      </span>
      <span className={`text-[10px] font-medium uppercase tracking-wider ${textClass}`}>
        {text}
        {status === 'live' && stamp ? (
          <span className="ml-1.5 font-mono tracking-[0.12em] opacity-80">UPDATED {stamp}</span>
        ) : null}
      </span>
    </span>
  )
}
