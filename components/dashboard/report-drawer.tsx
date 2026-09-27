'use client'

import { Check, ExternalLink, X } from 'lucide-react'
import { useEffect } from 'react'

import { ReportMarkdownBlock, renderInlineMarkdown } from '@/components/dashboard/report-markdown'
import type { IntelReport } from '@/config/reports'
import { formatReportTimestamp } from '@/lib/reports/time'
import { glassCardClass, mutedTextClass, primaryTextClass, softPillClass } from '@/lib/ui'

type ReportDrawerProps = {
  report: IntelReport | null
  open: boolean
  onClose: () => void
  isRead: boolean
  onMarkReadAndClose: (reportId: string) => void
  onMarkUnread: (reportId: string) => void
}

export function ReportDrawer({
  report,
  open,
  onClose,
  isRead,
  onMarkReadAndClose,
  onMarkUnread,
}: ReportDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close report drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 dark:bg-slate-950/70 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={report?.title ?? 'Report'}
        className={`fixed top-0 left-0 z-50 flex h-[88vh] w-full flex-col border-b border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out dark:border-slate-800/80 dark:bg-slate-950/95 ${
          open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-start justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="min-w-0">
            <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${mutedTextClass}`}>
              {report?.source ?? 'Mission Control Demo'}
            </p>
            <h2 className={`mt-2 truncate text-xl font-semibold tracking-[-0.02em] sm:text-2xl ${primaryTextClass}`}>
              {report?.title ?? 'Report'}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {report ? (
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${softPillClass}`}>
                  {report.category}
                </span>
              ) : null}
              {report?.priority === 'high' ? (
                <span className="rounded-md border border-rose-300/70 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200">
                  High priority
                </span>
              ) : report ? (
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${softPillClass}`}>
                  Normal
                </span>
              ) : null}
              {report ? (
                <span className={`font-mono text-[10px] uppercase tracking-widest ${mutedTextClass}`}>
                  {formatReportTimestamp(report)}
                </span>
              ) : null}
              {report ? (
                isRead ? (
                  <span className="rounded-md border border-emerald-300/60 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
                    Read
                  </span>
                ) : (
                  <span className="rounded-md border border-rose-300/70 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200">
                    Unread
                  </span>
                )
              ) : null}
              {report ? (
                <span className={`text-[11px] ${mutedTextClass}`}>
                  Source: {report.source || 'Mission Control Demo'}
                </span>
              ) : null}
              {report?.sourceUrl ? (
                <a
                  href={report.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 underline-offset-4 hover:underline dark:text-slate-300"
                >
                  Open Source <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {report && isRead ? (
              <button
                type="button"
                onClick={() => onMarkUnread(report.id)}
                className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
              >
                Mark as Unread
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-200"
              aria-label="Close"
            >
              <X className="size-4" />
              <span className="hidden font-mono text-[10px] tracking-widest text-slate-500 sm:inline">ESC</span>
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1400px] flex-1 overflow-y-auto px-5 pb-8 lg:px-8">
          {report ? (
            <>
              {report.takeaways.length > 0 ? (
                <div className={`p-5 ${glassCardClass}`}>
                  <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${mutedTextClass}`}>
                    Key Takeaways
                  </p>
                  <ul className="mt-3 space-y-2">
                    {report.takeaways.map((item, index) => (
                      <li key={`${report.id}-takeaway-${index}`} className={`text-sm leading-6 ${primaryTextClass}`}>
                        • {renderInlineMarkdown(item, `${report.id}-tk-${index}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <article className="mt-6 space-y-3 pb-4">
                {report.body.map((block, index) => (
                  <ReportMarkdownBlock
                    key={`${report.id}-block-${index}`}
                    block={block}
                    blockKey={`${report.id}-block-${index}`}
                    headingClass={primaryTextClass}
                    bodyClass={mutedTextClass}
                  />
                ))}
              </article>

              <div className="sticky bottom-0 mt-4 border-t border-slate-200/70 bg-gradient-to-t from-white via-white to-white/80 py-5 dark:border-slate-800/80 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950/80">
                <button
                  type="button"
                  onClick={() => onMarkReadAndClose(report.id)}
                  className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0 active:scale-[0.99] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  <Check className="size-4" aria-hidden />
                  Mark as Read &amp; Close
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
