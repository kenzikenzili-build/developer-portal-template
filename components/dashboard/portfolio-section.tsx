'use client'

import { Bell, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { TelemetryBadge } from '@/components/TelemetryBadge'
import { mockBudgetTelemetry, mockWealthTelemetry, wealthConfig } from '@/config/mockData'
import { siteConfig } from '@/config/site'
import {
  BUDGET_CATEGORY_KEYS,
  categoryBarColor,
  categoryProgress,
  formatNextBillDate,
  isCategoryOverLimit,
} from '@/lib/budget/schema'
import {
  cardPadClass,
  glassCardClass,
  mutedTextClass,
  primaryTextClass,
  sectionLabelClass,
  sectionTitleClass,
  softPillClass,
} from '@/lib/ui'
import { cn } from '@/lib/utils'
import { computeWealthMetrics, WEALTH_MILESTONES } from '@/lib/wealth/compute'

const HIDDEN_VALUE = '••••••'
const METRIC_LABEL_CLASS = 'text-xs uppercase tracking-wider text-slate-400'
const METRIC_VALUE_CLASS = 'font-mono font-bold tracking-tight tabular-nums'

const HERO_METRIC = {
  key: 'totalLiquid',
  label: 'Total Liquid Assets',
  formula: 'Brokerage + Savings + Checking',
} as const

const SECONDARY_METRICS = [
  { key: 'netLiquid', label: 'Net Liquid Assets', formula: 'Liquid − Loans' },
  { key: 'trueNetWorth', label: 'True Net Worth', formula: 'Net liquid + Retirement' },
] as const

const BREAKDOWN = [
  { key: 'brokerage', label: 'Brokerage', tone: 'neutral' },
  { key: 'savings', label: 'Savings', tone: 'neutral' },
  { key: 'checking', label: 'Checking', tone: 'neutral' },
  { key: 'totalLoan', label: 'Loans', tone: 'loan' },
  { key: 'retirement', label: 'Retirement', tone: 'neutral' },
] as const

const MILESTONES = [
  {
    key: 'shortProgress',
    label: `Short-term ${(WEALTH_MILESTONES.short / 1_000_000).toFixed(1)}M`,
    barClass: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
  },
  {
    key: 'midProgress',
    label: `Mid-term ${(WEALTH_MILESTONES.mid / 1_000_000).toFixed(1)}M`,
    barClass: 'bg-gradient-to-r from-sky-400 to-blue-600',
  },
  {
    key: 'longProgress',
    label: `Long-term ${(WEALTH_MILESTONES.long / 1_000_000).toFixed(1)}M`,
    barClass: 'bg-gradient-to-r from-indigo-400 to-violet-600',
  },
] as const

function formatMoney(amount: number, hidden: boolean, prefix: string) {
  if (hidden) return HIDDEN_VALUE
  return `${prefix} ${Math.round(amount).toLocaleString(siteConfig.locale)}`
}

function formatCash(amount: number, hidden: boolean, prefix: string) {
  if (hidden) return HIDDEN_VALUE
  return `${prefix} ${amount.toLocaleString(siteConfig.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatNetCashFlow(amount: number, hidden: boolean, prefix: string) {
  if (hidden) return HIDDEN_VALUE
  const abs = Math.abs(amount).toLocaleString(siteConfig.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amount < 0 ? `-${prefix} ${abs}` : `${prefix} ${abs}`
}

function formatPercent(value: number, hidden: boolean) {
  if (hidden) return HIDDEN_VALUE
  return `${Number(value).toFixed(1)}%`
}

function formatUpdatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(siteConfig.locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: siteConfig.timeZone,
  })
}

/**
 * Portfolio telemetry.
 *
 * Renders `mockWealthTelemetry` + `mockBudgetTelemetry` out of the box. The
 * numbers are neutral placeholders — swap them for your own feed and the layout
 * does not change.
 */
export function PortfolioSection() {
  const [hidden, setHidden] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  const config = wealthConfig
  const snapshot = { ...mockWealthTelemetry, ...computeWealthMetrics(mockWealthTelemetry) }
  const budget = mockBudgetTelemetry
  const prefix = config.amountPrefix

  return (
    <section id="portfolio" className="scroll-mt-20">
      <div className={`relative mb-4 transition hover:border-slate-200 dark:hover:border-slate-700 ${glassCardClass}`}>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-controls="portfolio-panel"
          aria-label={isOpen ? 'Collapse portfolio telemetry' : 'Expand portfolio telemetry'}
          className="absolute inset-0 z-0 cursor-pointer rounded-2xl"
        />
        <div className="pointer-events-none relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className={sectionLabelClass}>Portfolio &amp; Cash Flow</h2>
            <p className={sectionTitleClass}>Liquid assets, net worth and monthly cash flow</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <TelemetryBadge status="sandbox" lastUpdated={snapshot.updatedAt} />
            <button
              type="button"
              onClick={() => setHidden((value) => !value)}
              className={`pointer-events-auto relative z-10 inline-flex min-h-9 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition hover:border-slate-300 md:min-h-11 md:gap-2 md:px-3 md:py-2 md:text-sm dark:hover:border-slate-700 ${softPillClass}`}
              aria-pressed={hidden}
            >
              {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              {hidden ? 'Show values' : 'Hide values'}
            </button>
            <ChevronDown
              className={`size-5 shrink-0 text-slate-500 transition-transform duration-300 ease-out dark:text-slate-400 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div
        id="portfolio-panel"
        className={`grid overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[2400px] grid-rows-[1fr] opacity-100' : 'max-h-0 grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="min-h-0">
          <div className="grid gap-4 xl:grid-cols-2">
            <div className={`${cardPadClass} ${glassCardClass}`}>
              <p className={sectionLabelClass}>{config.telemetryLabel}</p>

              <div className="mt-4 rounded-2xl border border-slate-700/50 bg-slate-900/90 p-4 text-white shadow-md">
                <p className={METRIC_LABEL_CLASS}>{HERO_METRIC.label}</p>
                <p className={cn(METRIC_VALUE_CLASS, 'mt-2 text-2xl text-emerald-300 sm:text-3xl')}>
                  {formatMoney(snapshot[HERO_METRIC.key], hidden, prefix)}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-wider text-slate-500">
                  {HERO_METRIC.formula}
                </p>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                {SECONDARY_METRICS.map((item) => (
                  <div
                    key={item.key}
                    className="min-w-0 rounded-xl border border-slate-200/50 bg-white/70 p-3 dark:border-slate-700/50 dark:bg-slate-800/70"
                  >
                    <p className={METRIC_LABEL_CLASS}>{item.label}</p>
                    <p className={cn(METRIC_VALUE_CLASS, `mt-1.5 text-base sm:text-lg ${primaryTextClass}`)}>
                      {formatMoney(snapshot[item.key], hidden, prefix)}
                    </p>
                    <p className={`mt-1 font-mono text-[10px] tracking-wider ${mutedTextClass}`}>
                      {item.formula}
                    </p>
                  </div>
                ))}
              </div>


              <div className="my-3 grid grid-cols-2 gap-1.5">
                {BREAKDOWN.map((item) => {
                  const isLoan = item.tone === 'loan'
                  return (
                    <div
                      key={item.key}
                      className={cn(
                        'flex min-w-0 items-center justify-between gap-1.5 rounded-lg px-2 py-1.5 text-xs',
                        isLoan
                          ? 'bg-rose-50/50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'border border-slate-200/50 bg-white/70 text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/70 dark:text-slate-200',
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className={cn(METRIC_VALUE_CLASS, 'shrink-0')}>
                        {formatMoney(snapshot[item.key], hidden, prefix)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-xl border border-slate-200/50 bg-white/70 p-3 dark:border-slate-700/50 dark:bg-slate-800/70">
                <div className="space-y-2.5">
                  {MILESTONES.map((item) => {
                    const progress = snapshot[item.key]
                    return (
                      <div key={item.key}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className={METRIC_LABEL_CLASS}>{item.label}</span>
                          <span className={cn(METRIC_VALUE_CLASS, `text-xs ${primaryTextClass}`)}>
                            {formatPercent(progress, hidden)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/70">
                          <div
                            className={cn('h-2 rounded-full transition-all duration-500', item.barClass)}
                            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <p className={`mt-4 font-mono text-[10px] uppercase tracking-[0.16em] ${mutedTextClass}`}>
                {snapshot.note ? `${snapshot.note} · ` : ''}
                Updated {formatUpdatedAt(snapshot.updatedAt)}
              </p>
            </div>


            <div className={`${cardPadClass} ${glassCardClass}`}>
              <p className={sectionLabelClass}>{config.budgetLabel}</p>

              <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p
                    className={cn(
                      'text-2xl font-bold tracking-[-0.03em]',
                      budget.netCashFlow < 0
                        ? 'text-red-500'
                        : budget.netCashFlow > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : primaryTextClass,
                    )}
                  >
                    {formatNetCashFlow(budget.netCashFlow, hidden, prefix)}
                  </p>
                  <p className={`mt-1 text-xs ${mutedTextClass}`}>Net cash flow · {budget.month}</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className={primaryTextClass}>In {formatCash(budget.income, hidden, prefix)}</p>
                  <p className={mutedTextClass}>
                    Out {formatCash(budget.totalExpense, hidden, prefix)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {BUDGET_CATEGORY_KEYS.map((key) => {
                  const category = budget.categories[key]
                  const overLimit = isCategoryOverLimit(category)
                  const width = `${categoryProgress(category, budget.totalExpense)}%`
                  return (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span
                          className={`text-sm ${overLimit ? 'font-bold text-red-500' : primaryTextClass}`}
                        >
                          {category.label}
                        </span>
                        <span
                          className={`font-mono text-xs tabular-nums ${
                            overLimit ? 'font-semibold text-red-500' : mutedTextClass
                          }`}
                        >
                          {hidden
                            ? HIDDEN_VALUE
                            : category.limit !== undefined
                              ? `${formatCash(category.spent, false, prefix)} / ${formatCash(category.limit, false, prefix)}`
                              : formatCash(category.spent, false, prefix)}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full border border-slate-200/60 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-800/80">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width, backgroundColor: categoryBarColor(key, category) }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100">
                <Bell className="size-4 shrink-0" aria-hidden />
                <span>
                  Next due: {formatNextBillDate(budget.nextBill.date)} — {budget.nextBill.task}
                </span>
              </div>

              <p className={`mt-4 font-mono text-[10px] uppercase tracking-[0.16em] ${mutedTextClass}`}>
                Mock data · Updated {formatUpdatedAt(budget.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

