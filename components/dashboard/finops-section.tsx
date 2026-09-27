'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

import { TelemetryBadge } from '@/components/TelemetryBadge'
import { mockFinopsMetrics } from '@/config/mockData'
import { siteConfig } from '@/config/site'
import {
  cardPadClass,
  glassCardClass,
  mutedTextClass,
  primaryTextClass,
  sectionLabelClass,
  sectionTitleClass,
} from '@/lib/ui'

/**
 * Cloud cost control.
 *
 * Renders `mockFinopsMetrics` out of the box. Point this at your billing API and
 * keep the same `{ provider, monthToDate, trend, icon }` shape.
 */
export function FinOpsSection() {
  const total = mockFinopsMetrics.reduce(
    (sum, metric) => sum + Number(metric.monthToDate.replace(/,/g, '')),
    0,
  )

  return (
    <section id="finops" className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={sectionLabelClass}>FINOPS TELEMETRY</h2>
            <TelemetryBadge status="sandbox" errorMessage="Bundled mock cost data" />
          </div>
          <p className={sectionTitleClass}>Cloud cost control &amp; optimisation</p>
        </div>
        <p className={`font-mono text-xs ${mutedTextClass}`}>
          Month-to-date total ·{' '}
          <span className={primaryTextClass}>
            $
            {total.toLocaleString(siteConfig.locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockFinopsMetrics.map((item) => {
          const isNegative = item.trend < 0
          const TrendIcon = isNegative ? TrendingDown : TrendingUp

          return (
            <div key={item.id} className={`${cardPadClass} ${glassCardClass}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-12 items-center justify-center rounded-2xl font-mono text-xs font-bold tracking-tight ${item.tileClass}`}
                  >
                    {item.monogram}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${mutedTextClass}`}>
                      {item.provider}
                    </p>
                    <p className={`mt-0.5 text-2xl font-bold font-mono tracking-tight ${primaryTextClass}`}>
                      ${item.monthToDate}
                    </p>
                    <p className={`mt-0.5 text-[11px] font-mono ${mutedTextClass}`}>Month-to-date</p>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium font-mono ${
                    isNegative
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                  }`}
                >
                  <TrendIcon className="size-3.5" />
                  <span>
                    {isNegative ? '↓' : '↑'} {Math.abs(item.trend)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
