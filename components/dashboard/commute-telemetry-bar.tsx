'use client'

/**
 * CommuteTelemetryBar — Travel · Commute Telemetry Hub.
 *
 * Layout contract — only ONE "direction × leg" is on screen at a time:
 *   1. The outermost control is just 【Morning】/【Evening】: a single direction
 *      renders instead of two columns side by side. The default direction comes
 *      from the clock (`mockCommute.peakHours`); a manual pick is kept while the
 *      clock has no opinion or is still inside the same window.
 *   2. A 【Leg 1】/【Leg 2】 segmented control on the right of the control row
 *      switches the route list for the selected leg only.
 *   3. The fastest-arriving option is pinned to the first slot and crowned with a
 *      full-box highlight (emerald border + glow + tinted background).
 *   4. Local 1 Hz countdown between polls; the feed re-seeds every 30 s.
 *
 * Data contract: everything renders from `mockCommute` in config/mockData.ts.
 * No backend, no private feed, no hardcoded personal route.
 */

import { AlertTriangle, Navigation, RefreshCw, Sunrise, Sunset, X, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { CommuteRouteCard } from '@/components/dashboard/commute-route-card'
import { mockCommute, type CommuteWindow } from '@/config/mockData'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

type CommuteDirection = CommuteWindow['id']
type LegNumber = 1 | 2

const DIRECTION_ORDER: readonly CommuteDirection[] = ['morning', 'evening']
const LEG_NUMBERS: readonly LegNumber[] = [1, 2]
const POLL_INTERVAL_MS = 30_000
const CLOCK_INTERVAL_MS = 30_000
const TICK_INTERVAL_MS = 1_000

type LegOptionSnapshot = {
  /** Stable React key for the option. */
  key: string
  direction: CommuteDirection
  legIndex: number
  route: string
  destination: string
  /** Absolute arrival timestamp this option counts down to. */
  targetMs: number
}

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

function formatClockTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(siteConfig.locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: siteConfig.timeZone,
  })
}

/** Minutes-of-day in the configured timezone; falls back to the browser clock. */
function minutesOfDay(date: Date): number {
  try {
    const zoned = new Date(date.toLocaleString(siteConfig.locale, { timeZone: siteConfig.timeZone }))
    if (!Number.isNaN(zoned.getTime())) return zoned.getHours() * 60 + zoned.getMinutes()
  } catch {
    // Fall back to the browser clock.
  }
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Direction the clock suggests — `morning` inside the inbound window,
 * `evening` inside the outbound window, `null` when the clock has no opinion.
 */
export function defaultCommuteDirection(date: Date): CommuteDirection | null {
  const minutes = minutesOfDay(date)
  const { morning, evening } = mockCommute.peakHours
  if (minutes >= morning[0] * 60 && minutes < morning[1] * 60) return 'morning'
  if (minutes >= evening[0] * 60 && minutes < evening[1] * 60) return 'evening'
  return null
}

/** Small deterministic wobble so the demo feed looks alive between polls. */
function jitterEta(baseMinutes: number, seed: number): number {
  return Math.max(1, baseMinutes + (((seed % 4) + 4) % 4) - 1)
}

/** Remaining whole minutes until `targetMs`, floored at zero. */
function remainingMinutes(targetMs: number, now: number): number {
  return Math.max(0, Math.ceil((targetMs - now) / 60_000))
}

export function CommuteTelemetryBar() {
  const [mounted, setMounted] = useState(false)
  const [tick, setTick] = useState(0)
  const [now, setNow] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  /*
   * Direction master switch: clock default + a manual override that expires when
   * the clock moves into a different window. The initial value is intentionally
   * null so the static export and the browser cannot disagree about the time.
   */
  const [clockDirection, setClockDirection] = useState<CommuteDirection | null>(null)
  const [manualDirection, setManualDirection] = useState<{
    slot: CommuteDirection | null
    value: CommuteDirection
  } | null>(null)
  const [legNumber, setLegNumber] = useState<LegNumber>(1)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const syncClock = () => setClockDirection(defaultCommuteDirection(new Date()))
    syncClock()
    const timer = window.setInterval(syncClock, CLOCK_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [])

  const refresh = useCallback(() => {
    setIsRefreshing(true)
    setTick((value) => value + 1)
    setLastUpdated(clockNow())
    setNow(Date.now())
    setIsRefreshing(false)
  }, [])

  useEffect(() => {
    refresh()
    const poll = window.setInterval(() => refresh(), POLL_INTERVAL_MS)
    return () => window.clearInterval(poll)
  }, [refresh])

  // 1 Hz local countdown so the ETAs tick between polls without touching the feed.
  useEffect(() => {
    const ticker = window.setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS)
    return () => window.clearInterval(ticker)
  }, [])

  /**
   * Every option of every leg, with an absolute arrival timestamp seeded from
   * `mockCommute` on each poll. This is the only place the mock numbers are
   * applied, so the UI stays a pure function of config/mockData.ts.
   */
  const snapshots = useMemo(() => {
    /** `snapshots[direction][legIndex]` — one slice per direction and leg. */
    const map: Record<string, LegOptionSnapshot[][]> = {}
    for (const directionWindow of mockCommute.windows) {
      map[directionWindow.id] = directionWindow.legs.map((leg, legIndex) =>
        leg.options.map((option, optionIndex) => {
          const minutes = jitterEta(option.etaMinutes, tick + legIndex * 3 + optionIndex)
          return {
            key: `${directionWindow.id}:${leg.id}:${optionIndex}`,
            direction: directionWindow.id,
            legIndex,
            route: option.route,
            destination: option.destination,
            targetMs: Date.now() + minutes * 60_000,
          }
        }),
      )
    }
    return map
  }, [tick])

  const activeDirection: CommuteDirection =
    manualDirection && (clockDirection === null || manualDirection.slot === clockDirection)
      ? manualDirection.value
      : (clockDirection ?? 'morning')

  const activeWindow =
    mockCommute.windows.find((window) => window.id === activeDirection) ?? mockCommute.windows[0]

  const legIndex = legNumber - 1
  const activeLeg = activeWindow.legs[legIndex]
  const legSnapshots = snapshots[activeDirection]?.[legIndex] ?? []

  const selectDirection = (next: CommuteDirection) => {
    setManualDirection({ slot: clockDirection, value: next })
    setLegNumber(1)
  }

  const options = useMemo(
    () =>
      legSnapshots.map((snapshot, index) => ({
        snapshot,
        minutes: now ? remainingMinutes(snapshot.targetMs, now) : activeLeg.options[index].etaMinutes,
      })),
    [activeLeg.options, legSnapshots, now],
  )

  /** Fastest option in the selected leg — always crowned and pinned to slot 1. */
  const fastest = useMemo(
    () =>
      options.reduce<(typeof options)[number] | null>(
        (best, current) => (best === null || current.minutes < best.minutes ? current : best),
        null,
      ),
    [options],
  )

  /** Fastest first; every other option keeps its configured order. */
  const orderedOptions = useMemo(() => {
    if (!fastest) return options
    return [fastest, ...options.filter((entry) => entry.snapshot.key !== fastest.snapshot.key)]
  }, [fastest, options])

  const nextMinutesFor = (key: string): number | undefined => {
    const index = options.findIndex((entry) => entry.snapshot.key === key)
    return options.slice(index + 1)[0]?.minutes
  }

  const totalMinutes = activeWindow.legs
    .slice(0, legNumber)
    .reduce((sum, leg) => sum + leg.minutes + (leg.walkMinutes ?? 0), 0)
  // Only derive a journey time when a service exists to complete the leg.
  const arrival = fastest ? addMinutesToClockTime(clockNow(), fastest.minutes + totalMinutes) : null

  const activeAlert = activeWindow.alerts.find((alert) => !dismissedAlerts.includes(alert.id))

  return (
    <section id="commute" className="w-full scroll-mt-20 space-y-3" aria-label="Travel commute hub">
      {activeAlert ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-rose-900 shadow-xs dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 shrink-0 animate-pulse text-rose-600 dark:text-rose-400" />
            <p className="text-xs font-medium">
              <span className="font-bold">{activeAlert.title}</span> — {activeAlert.summary}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedAlerts((prev) => [...prev, activeAlert.id])}
            className="text-rose-500 transition hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200"
            aria-label="Dismiss service alert"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm md:p-5 dark:border-slate-800 dark:bg-slate-900/90">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Navigation className="size-5" />
            </span>
            <div className="flex flex-col gap-0.5">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900 md:text-xs dark:text-slate-300">
                COMMUTE TELEMETRY HUB
              </h2>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Peak windows {mockCommute.peakWindowsLabel} · one direction, one leg at a time
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <span
                className={cn(
                  'inline-flex size-2 rounded-full',
                  mounted ? 'animate-pulse bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700',
                )}
              />
              {lastUpdated ? `Synced ${lastUpdated}` : 'Idle'}
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              title="Re-seed the mock telemetry feed"
            >
              <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
              {isRefreshing ? 'Syncing…' : 'Sync'}
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {/* 1 · Direction master toggle — only the active direction renders below. */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2"
              role="group"
              aria-label="Travel direction"
            >
              {DIRECTION_ORDER.map((direction) => {
                const directionWindow = mockCommute.windows.find((entry) => entry.id === direction)
                if (!directionWindow) return null
                const isActive = activeDirection === direction
                const Icon = direction === 'morning' ? Sunrise : Sunset
                return (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => selectDirection(direction)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition',
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/60',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-5 shrink-0',
                        isActive
                          ? 'text-white dark:text-slate-900'
                          : 'text-slate-400 dark:text-slate-500',
                      )}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-base font-black tracking-tight">
                        {directionWindow.title}
                      </span>
                      <span
                        className={cn(
                          'truncate font-mono text-[11px]',
                          isActive
                            ? 'text-white/70 dark:text-slate-900/70'
                            : 'text-slate-500 dark:text-slate-400',
                        )}
                      >
                        {directionWindow.subtitle}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* 2 · Leg sub-toggle — switches only the route list of the active direction. */}
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:inline dark:text-slate-500">
                Leg
              </span>
              <div
                className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/70"
                role="group"
                aria-label="Leg switcher"
              >
                {LEG_NUMBERS.map((num) => {
                  const isActive = legNumber === num
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setLegNumber(num)}
                      aria-pressed={isActive}
                      className={cn(
                        'cursor-pointer rounded-md px-4 py-2 text-xs font-black transition',
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-slate-100'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                      )}
                    >
                      Leg {num}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Selected "direction × leg" summary, including the crowned service. */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-black text-slate-900 dark:text-slate-100">
                {activeWindow.origin} → {activeWindow.destination} · via {activeWindow.transferHub}
              </span>
              <span className="truncate font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {arrival
                  ? `${activeLeg.label} · ${totalMinutes} min door-to-door · arrive ${arrival}`
                  : activeLeg.label}
              </span>
            </div>
            {fastest ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 font-mono text-[11px] font-black text-white shadow-xs">
                <Zap className="size-3" />
                FASTEST {fastest.snapshot.route} · {fastest.minutes} min
              </span>
            ) : null}
          </div>

          {/* 3 · Options for the selected leg — fastest pinned first and crowned. */}
          {orderedOptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {orderedOptions.map(({ snapshot, minutes }) => (
                <CommuteRouteCard
                  key={snapshot.key}
                  legNumber={legNumber}
                  legLabel={activeLeg.label}
                  routeCode={snapshot.route}
                  from={activeLeg.from}
                  to={activeLeg.to}
                  destination={snapshot.destination}
                  etaMinutes={minutes}
                  eta={formatClockTime(snapshot.targetMs)}
                  nextEtaMinutes={nextMinutesFor(snapshot.key)}
                  highlight={fastest?.snapshot.key === snapshot.key}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center dark:border-slate-700">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                No services modelled for this leg
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Add entries to options in config/mockData.ts
              </p>
            </div>
          )}

          {activeLeg.note ? (
            <p className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-2.5 text-[11px] italic text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>{activeLeg.note}</span>
              {activeLeg.walkMinutes ? (
                <span>{activeLeg.walkMinutes} min walk at the interchange</span>
              ) : null}
            </p>
          ) : null}

          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Mock feed · edit config/mockData.ts to model your own route
          </p>
        </div>
      </div>
    </section>
  )
}
