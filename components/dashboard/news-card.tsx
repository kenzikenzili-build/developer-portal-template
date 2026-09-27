'use client'

import { Bookmark, Check, ExternalLink, Eye, EyeOff } from 'lucide-react'

import { siteConfig } from '@/config/site'
import type { CuratedNewsItem } from '@/lib/news-schema'
import { cn } from '@/lib/utils'

const SEVERITY_STYLE: Record<NonNullable<CuratedNewsItem['severity']>, string> = {
  CRITICAL: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200',
  HIGH: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-500/40 dark:bg-orange-950/40 dark:text-orange-200',
  WARNING: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100',
  INFO: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
}

export type NoteSaveStatus = 'idle' | 'saving' | 'saved'

type NewsCardProps = {
  item: CuratedNewsItem
  isRead: boolean
  onToggleRead: (id: string) => void
  onSaveNote?: (item: CuratedNewsItem) => void
  noteStatus?: NoteSaveStatus
}

export function NewsCard({ item, isRead, onToggleRead, onSaveNote, noteStatus = 'idle' }: NewsCardProps) {
  return (
    <article
      className={cn(
        'flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-xl transition dark:border-slate-800/80 dark:bg-slate-900/50',
        isRead ? 'opacity-60' : 'opacity-100',
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {item.severity ? (
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                SEVERITY_STYLE[item.severity],
              )}
            >
              {item.severity}
            </span>
          ) : null}
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {item.source_tag}
          </span>
          <button
            type="button"
            onClick={() => onToggleRead(item.id)}
            className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-slate-200"
            aria-pressed={isRead}
          >
            {isRead ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
            {isRead ? 'Mark unread' : 'Mark read'}
          </button>
        </div>

        <h3 className="mt-3 text-sm font-bold leading-snug tracking-[-0.01em] text-slate-900 dark:text-white">
          {item.title}
        </h3>

        <ul className="mt-3 space-y-1.5">
          {item.key_points.map((point) => (
            <li key={point} className="flex gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {item.highlights?.length ? (
          <dl className="mt-3 grid grid-cols-2 gap-1.5">
            {item.highlights.map((highlight) => (
              <div
                key={highlight.label}
                className="rounded-lg border border-slate-200/70 bg-slate-50/70 px-2 py-1.5 dark:border-slate-700/70 dark:bg-slate-800/60"
              >
                <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {highlight.label}
                </dt>
                <dd className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {highlight.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {item.action ? (
          <p className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2 text-[11px] font-medium text-sky-900 dark:border-sky-500/40 dark:bg-sky-950/40 dark:text-sky-100">
            {item.action}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          {onSaveNote ? (
            <button
              type="button"
              onClick={() => onSaveNote(item)}
              disabled={noteStatus !== 'idle'}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {noteStatus === 'saved' ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Bookmark className="size-3.5" />
              )}
              {noteStatus === 'saving' ? 'Saving…' : noteStatus === 'saved' ? 'Saved' : 'Save'}
            </button>
          ) : null}
          {item.url && item.url !== '#' ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ExternalLink className="size-3.5" />
              Source
            </a>
          ) : null}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {new Date(item.updated_at).toLocaleString(siteConfig.locale, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: siteConfig.timeZone,
          })}
        </span>
      </div>
    </article>
  )
}
