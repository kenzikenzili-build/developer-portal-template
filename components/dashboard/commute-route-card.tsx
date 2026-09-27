'use client'

import { Clock, MapPin, Zap } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * CommuteRouteCard — the single uniform sub-card used by BOTH travel directions
 * (Morning · Inbound / Evening · Outbound 共用同一組件與版面).
 *
 * Layout contract:
 *   1. Journey markers — the boarding stop and the alighting stop are labelled
 *      explicitly at the top of the card.
 *   2. Route code — high-contrast badge so the service number is scannable.
 *   3. Remaining time — oversized "X min" readout.
 *   4. Next service — small "next in Y min" preview line.
 *
 * Highlight contract: the fastest-arriving option inside its leg is crowned with
 * a full-box emerald border + glow (never just a tag), so the winner reads at a
 * glance from across the room.
 */
export type CommuteRouteCardProps = {
  /** 1-based journey leg the option belongs to. */
  legNumber: 1 | 2
  /** Human label of the leg, e.g. "Leg 2 · Trunk line". */
  legLabel: string
  /** Service number rendered as the badge, e.g. "Route P7". */
  routeCode: string
  /** Boarding stop. */
  from: string
  /** Alighting stop. */
  to: string
  /** Where this service terminates. */
  destination: string
  /** Remaining minutes until the next arrival. */
  etaMinutes: number
  /** Clock time of that arrival, e.g. "08:12". */
  eta: string
  /** Remaining minutes for the following service, when the feed models one. */
  nextEtaMinutes?: number
  /** Crown the fastest-arriving service inside its leg. */
  highlight?: boolean
}

export function CommuteRouteCard({
  legNumber,
  legLabel,
  routeCode,
  from,
  to,
  destination,
  etaMinutes,
  eta,
  nextEtaMinutes,
  highlight = false,
}: CommuteRouteCardProps) {
  return (
    <article
      data-fastest={highlight ? 'true' : undefined}
      aria-label={`${routeCode} ${from} to ${to}${highlight ? ' (fastest arrival)' : ''}`}
      className={cn(
        'relative flex flex-col gap-3 rounded-xl border-2 bg-white p-4 transition-all dark:bg-slate-900/90',
        highlight
          ? 'border-emerald-500 bg-emerald-50/70 shadow-[0_0_0_4px_rgba(16,185,129,0.16),0_14px_34px_-14px_rgba(16,185,129,0.6)] ring-1 ring-emerald-400/60 dark:border-emerald-400/70 dark:bg-emerald-950/30'
          : 'border-slate-200 shadow-xs dark:border-slate-800',
      )}
    >
      {/* 1 · Journey markers */}
      <header className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white dark:bg-slate-100 dark:text-slate-900">
              {legNumber}
            </span>
            <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {legLabel}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Board
              </span>
              <span className="truncate font-bold text-slate-900 dark:text-slate-100">{from}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Alight
              </span>
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">{to}</span>
            </span>
          </div>
        </div>

        {highlight ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
            <Zap className="size-3" />
            Fastest
          </span>
        ) : null}
      </header>

      {/* 2 · Route code badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md border border-slate-900/90 bg-slate-900 px-2.5 py-1 font-mono text-sm font-black tracking-tight text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900">
          {routeCode}
        </span>
        <span className="truncate font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
          <MapPin className="mr-1 inline size-3 align-[-2px]" />
          {destination}
        </span>
      </div>

      {/* 3 · Remaining time */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              'text-4xl font-black leading-none tracking-tight',
              highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100',
            )}
          >
            {etaMinutes}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            min
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
          <Clock className="size-3.5" />
          {eta}
        </span>
      </div>

      {/* 4 · Next service */}
      {nextEtaMinutes !== undefined ? (
        <p className="border-t border-slate-100 pt-2 font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:text-slate-500">
          Next in {nextEtaMinutes} min
        </p>
      ) : null}
    </article>
  )
}
