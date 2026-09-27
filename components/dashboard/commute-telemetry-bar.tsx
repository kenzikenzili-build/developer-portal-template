'use client'

import { AlertTriangle, ChevronDown, ChevronUp, Footprints, Navigation, RefreshCw, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { mockCommute } from '@/config/mockData'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

function addMinutesToClockTime(baseTime: string, addMins: number): string {
  const parts = baseTime.split(':')
  if (parts.length >= 2) {
    const h = Number.parseInt(parts[0], 10)
    const m = Number.parseInt(parts[1], 10)
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      const total = (h * 60 + m + addMins + 1440) % 1440
      return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
    }
  }
  const fallback = new Date(Date.now() + addMins * 60_000)
  return fallback.toLocaleTimeString(siteConfig.locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: siteConfig.timeZone,
  })
}

function clockNow(): string {
  return new Date().toLocaleTimeString(siteConfig.locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: siteConfig.timeZone,
  })
}

function isPeakWindow(date: Date): boolean {
  let hours = date.getHours() + date.getMinutes() / 60
  try {
    const zoned = new Date(date.toLocaleString(siteConfig.locale, { timeZone: siteConfig.timeZone }))
    if (!Number.isNaN(zoned.getTime())) {
      hours = zoned.getHours() + zoned.getMinutes() / 60
    }
  } catch {
    // Fall back to the browser clock.
  }
  const { morning, evening } = mockCommute.peakHours
  return (hours >= morning[0] && hours < morning[1]) || (hours >= evening[0] && hours < evening[1])
}

export function CommuteTelemetryBar() {
  const [tick, setTick] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [isInPeakWindow, setIsInPeakWindow] = useState(false)
  const [manualOverride, setManualOverride] = useState<{ window: boolean; expanded: boolean } | null>(
    null,
  )
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  const isExpanded =
    manualOverride && manualOverride.window === isInPeakWindow
      ? manualOverride.expanded
      : isInPeakWindow

  useEffect(() => {
    const sync = () => setIsInPeakWindow(isPeakWindow(new Date()))
    sync()
    const timer = window.setInterval(sync, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 300))
    setTick((value) => value + 1)
    setLastUpdated(clockNow())
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const interval = window.setInterval(() => void refresh(), 40_000)
    return () => window.clearInterval(interval)
  }, [refresh])

  const windows = useMemo(
    () =>
      mockCommute.windows.map((window) => {
        const alternates = window.alternates.map((alt, index) => {
          const jitter = ((tick + index * 3) % 4) - 1
          const minutes = Math.max(1, alt.etaMinutes + jitter)
          return { ...alt, etaMinutes: minutes, eta: addMinutesToClockTime(clockNow(), minutes) }
        })
        const totalMinutes = window.legs.reduce(
          (sum, leg) => sum + leg.minutes + (leg.walkMinutes ?? 0),
          0,
        )
        const departIn = alternates[0]?.etaMinutes ?? 0
        const arrival = addMinutesToClockTime(clockNow(), departIn + totalMinutes)
        return { window, alternates, totalMinutes, arrival }
      }),
    [tick],
  )

  const activeAlert = mockCommute.windows
    .flatMap((window) => window.alerts)
    .find((alert) => !dismissedAlerts.includes(alert.id))

  return (
    <section id="commute" className="w-full scroll-mt-20 space-y-3">
      {activeAlert ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-rose-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 shrink-0 animate-pulse text-rose-600" />
            <p className="text-xs font-medium">
              <span className="font-bold">{activeAlert.title}</span> — {activeAlert.summary}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedAlerts((prev) => [...prev, activeAlert.id])}
            className="text-rose-500 transition hover:text-rose-800"
            aria-label="Dismiss service alert"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm md:p-5 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Navigation className="size-5" />
            </span>
            <div>
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900 md:text-xs dark:text-slate-300">
                COMMUTE TELEMETRY
              </h2>
              <p className="mt-1 text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Two-way service health
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Peak windows {mockCommute.peakWindowsLabel} ·{' '}
                {lastUpdated ? `updated ${lastUpdated}` : 'syncing…'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Re-simulate the ETA feed"
            >
              <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
              {loading ? 'Syncing…' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={() => setManualOverride({ window: isInPeakWindow, expanded: !isExpanded })}
              aria-expanded={isExpanded}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {windows.map(({ window, alternates, totalMinutes, arrival }) => (
            <article
              key={window.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 md:p-4 dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {window.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">
                    {window.origin} → {window.destination}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200">
                  ETA {arrival}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {alternates.map((alt) => (
                  <span
                    key={`${window.id}-${alt.route}-${alt.etaMinutes}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    title={`Next ${alt.route} toward ${alt.destination}`}
                  >
                    <span className="font-bold">{alt.route}</span>
                    <span className="text-slate-400">{alt.eta}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {alt.etaMinutes}′
                    </span>
                  </span>
                ))}
              </div>


              <ol className="mt-4 space-y-2.5">
                {window.legs.map((leg, index) => {
                  const offset = window.legs
                    .slice(0, index)
                    .reduce((sum, item) => sum + item.minutes + (item.walkMinutes ?? 0), 0)
                  const start = addMinutesToClockTime(
                    clockNow(),
                    (alternates[0]?.etaMinutes ?? 0) + offset,
                  )
                  const end = addMinutesToClockTime(start, leg.minutes)
                  return (
                    <li key={leg.id} className="flex gap-3">
                      <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-slate-300 bg-white font-mono text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {leg.label}
                          </span>
                          <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            {leg.route}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                          {leg.from} → {leg.to} · {leg.minutes} min · {start}–{end}
                        </p>
                        {leg.walkMinutes ? (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300">
                            <Footprints className="size-3" />
                            {leg.walkMinutes} min walk
                          </p>
                        ) : null}
                        {leg.note ? (
                          <p className="mt-0.5 text-[11px] italic text-slate-500 dark:text-slate-500">
                            {leg.note}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>

              <p className="mt-3 border-t border-slate-200 pt-2.5 font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {window.transferHub} interchange · {totalMinutes} min door-to-door
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Mock data · Edit config/mockData.ts to model your own route
        </p>
      </div>
    </section>
  )
}

