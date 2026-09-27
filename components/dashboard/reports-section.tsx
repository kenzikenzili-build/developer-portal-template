'use client'

import { Check, CheckCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ReportDrawer } from '@/components/dashboard/report-drawer'
import { mockReports, type IntelReport } from '@/config/reports'
import { useReportSync } from '@/hooks/useReportSync'
import { isReportMarkedRead } from '@/lib/reports/read-state'
import { formatReportTimestamp, sortReportsByUnreadThenNewest } from '@/lib/reports/time'
import { sectionLabelClass, softPillClass } from '@/lib/ui'

type ReportsView = 'top8' | 'all'

const TOP_COUNT = 8
const TOAST_MS = 1800
const EMPTY_COPY =
  'No reports yet. Point NEXT_PUBLIC_REPORTS_ENDPOINT at your own feed to populate this grid.'

function withDemoTimestamps(reports: IntelReport[]): IntelReport[] {
  const now = Date.now()
  return reports.map((report, index) => ({
    ...report,
    createdAt: report.createdAt ?? new Date(now - index * 60 * 60 * 1000).toISOString(),
  }))
}

export function ReportsSection() {
  const { readIds, isRead, markRead, markUnread, markAllRead } = useReportSync()
  const [active, setActive] = useState<IntelReport | null>(null)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<ReportsView>('top8')
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  const showToast = (message: string) => {
    if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, TOAST_MS)
  }

  const baseCatalog = useMemo(() => withDemoTimestamps(mockReports), [])

  const catalog = useMemo(
    () => sortReportsByUnreadThenNewest(baseCatalog, (id) => isReportMarkedRead(id, readIds)),
    [baseCatalog, readIds],
  )

  const visible = useMemo(
    () => (view === 'top8' ? catalog.slice(0, TOP_COUNT) : catalog),
    [catalog, view],
  )

  const openReport = (report: IntelReport) => {
    setActive(report)
    setOpen(true)
    if (!isRead(report.id)) {
      markRead(report.id)
    }
  }

  const closeReport = () => setOpen(false)

  const handleMarkReadAndClose = (reportId: string) => {
    if (!isRead(reportId)) {
      markRead(reportId)
    }
    setOpen(false)
    showToast('Marked as read')
  }

  const handleMarkUnread = (reportId: string) => {
    markUnread(reportId)
    showToast('Marked as unread')
  }

  const handleMarkAllRead = () => {
    const allIds = catalog.map((report) => report.id)
    if (allIds.length > 0) {
      markAllRead(allIds)
      showToast('All reports marked as read')
    }
  }

  const unreadCount = catalog.filter((report) => !isRead(report.id)).length

  return (
    <section id="reports" className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className={sectionLabelClass}>Intel &amp; Strategy Reports</h2>
          <p className="mt-1 max-w-full break-words font-mono text-[11px] uppercase tracking-[0.12em] text-slate-600 md:mt-2 md:tracking-[0.18em] dark:text-slate-400">
            {`Mock data · Showing ${visible.length} of ${catalog.length} reports`}
            {unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <CheckCheck className="size-3.5" aria-hidden />
              <span>Mark all read</span>
            </button>
          ) : null}

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 p-1 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => setView('top8')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-out ${
                view === 'top8'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white/20 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Top 8
            </button>
            <button
              type="button"
              onClick={() => setView('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-out ${
                view === 'all'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white/20 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All reports
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
        {visible.map((report, index) => {
            const read = isRead(report.id)
            return (
              <button
                key={report.id}
                type="button"
                onClick={() => openReport(report)}
                style={
                  view === 'all'
                    ? {
                        animationDelay: `${Math.min(index, 15) * 40}ms`,
                      }
                    : undefined
                }
                className={`relative flex h-[180px] cursor-pointer flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-left backdrop-blur-xl transition-all duration-300 ease-out md:p-5 dark:border-slate-800/80 dark:bg-slate-900/50 ${
                  view === 'all' ? 'animate-[report-fade-up_0.45s_ease-out_both]' : ''
                } ${read ? 'opacity-55' : 'opacity-100'} hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-lg dark:hover:border-slate-600`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${softPillClass}`}>
                      {report.category}
                    </span>
                    {report.priority === 'high' ? (
                      <span className="rounded-md border border-rose-300/70 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200">
                        High
                      </span>
                    ) : null}
                    {read ? (
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-emerald-300/60 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
                        <Check className="size-3" aria-hidden />
                        Read
                      </span>
                    ) : (
                      <span className="rounded-md border border-rose-300/70 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200">
                        Unread
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {formatReportTimestamp(report)}
                    </span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900 md:text-base dark:text-white">
                    {report.title}
                  </h3>
                </div>
                <p className="mt-3 line-clamp-2 overflow-hidden text-ellipsis text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {report.excerpt}
                </p>
              </button>
            )
          })}
      </div>

      {toast ? (
        <p
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-slate-200/80 bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg dark:border-slate-700 dark:bg-white dark:text-slate-950"
        >
          {toast}
        </p>
      ) : null}

      <ReportDrawer
        report={active}
        open={open}
        onClose={closeReport}
        isRead={active ? isRead(active.id) : false}
        onMarkReadAndClose={handleMarkReadAndClose}
        onMarkUnread={handleMarkUnread}
      />
    </section>
  )
}
