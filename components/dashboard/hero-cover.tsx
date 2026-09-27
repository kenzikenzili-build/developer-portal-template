'use client'

import { Check, ClipboardCopy, Info } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { HeroAnimatedScene } from '@/components/HeroAnimatedScene'
import { LiveWeather } from '@/components/dashboard/live-weather'
import { siteConfig } from '@/config/site'
import { useWorkspaceAuth } from '@/hooks/useWorkspaceAuth'
import { getGreetingName } from '@/lib/display-name'
import { glassCardClass } from '@/lib/ui'

const MEMO_STORAGE_KEY = `${siteConfig.storagePrefix}.memo`
const TOAST_MS = 2400

type ToastState = { message: string; tone: 'success' | 'info' | 'warn' }

function useLiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the execCommand shim below.
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export function HeroCover() {
  const { user } = useWorkspaceAuth()
  const now = useLiveClock()
  const [note, setNote] = useState('')
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  const greetingName = user ? getGreetingName(user) : 'there'
  const greeting = greetingForHour(now.getHours())

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MEMO_STORAGE_KEY)
      if (stored) setNote(stored)
    } catch {
      // Ignore storage failures.
    }
  }, [])

  const clockParts = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return {
      hours: pad(now.getHours()),
      minutes: pad(now.getMinutes()),
      seconds: pad(now.getSeconds()),
    }
  }, [now])

  const dateLabel = useMemo(
    () =>
      now.toLocaleDateString(siteConfig.locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: siteConfig.timeZone,
      }),
    [now],
  )

  const showToast = useCallback((message: string, tone: ToastState['tone']) => {
    if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current)
    setToast({ message, tone })
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, TOAST_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  const saveMemo = useCallback(async () => {
    const text = note.trim()
    if (!text) {
      showToast('Type a memo first.', 'warn')
      return
    }
    try {
      window.localStorage.setItem(MEMO_STORAGE_KEY, text)
    } catch {
      // Ignore storage failures — the clipboard copy still works.
    }
    const copied = await copyToClipboard(text)
    showToast(copied ? 'Memo saved locally & copied to clipboard.' : 'Memo saved locally.', 'success')
  }, [note, showToast])

  return (
    <section id="overview" className="scroll-mt-20">
      <div className="relative mb-4 isolate overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-xl md:mb-6 md:p-8 dark:border-white/10 dark:bg-slate-900/50 dark:shadow-none">
        <div className="pointer-events-none absolute top-3 right-3 z-0 h-28 w-28 overflow-hidden opacity-40 md:hidden">
          <HeroAnimatedScene compact />
        </div>

        <div className="relative z-10 flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:gap-6 md:space-y-0">
          <div className="relative z-10 min-w-0 shrink-0 pr-32 md:pr-0 lg:w-auto">
            <p className="bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 bg-clip-text font-[family-name:var(--font-digital)] text-3xl font-normal tracking-wide text-transparent tabular-nums drop-shadow-[0_2px_8px_rgba(14,165,233,0.18)] md:text-5xl md:tracking-widest dark:from-cyan-300 dark:via-teal-200 dark:to-sky-400 dark:drop-shadow-[0_0_16px_rgba(56,189,248,0.45)]">
              <span>{clockParts.hours}</span>
              <span className="animate-pulse">:</span>
              <span>{clockParts.minutes}</span>
              <span className="animate-pulse">:</span>
              <span>{clockParts.seconds}</span>
            </p>
            <p className="mt-1 max-w-full break-words font-sans text-xs font-medium uppercase tracking-wide text-slate-600 md:text-base md:tracking-widest dark:text-slate-300">
              {dateLabel}
            </p>
            <h1 className="mt-2 max-w-full break-words font-sans text-base font-medium text-slate-600 md:text-xl dark:text-slate-300">
              {greeting}, {greetingName}.
            </h1>
          </div>

          <div className="relative hidden min-h-[200px] min-w-0 flex-1 overflow-hidden md:block">
            <HeroAnimatedScene className="absolute inset-0 opacity-85" />
          </div>

          <div className="relative z-10 mt-6 flex w-full min-w-0 flex-col gap-3 md:mt-0 md:w-auto md:max-w-sm md:shrink-0 md:items-end lg:max-w-none">
            <LiveWeather />
            <span className="inline-flex min-h-9 w-fit max-w-full items-center rounded-full border border-slate-200/70 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-200">
              {siteConfig.focusChip}
            </span>
          </div>
        </div>

        <div className={`relative z-10 mt-4 flex flex-col gap-2 md:mt-6 ${glassCardClass} !p-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Quick memo
            </span>
            {toast ? (
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                  toast.tone === 'success'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : toast.tone === 'warn'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-sky-600 dark:text-sky-400'
                }`}
              >
                {toast.tone === 'success' ? (
                  <Check className="size-3.5" />
                ) : (
                  <Info className="size-3.5" />
                )}
                {toast.message}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="Capture a thought, a follow-up, or the next thing you owe someone…"
              className="min-h-16 flex-1 resize-y rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700/70 dark:bg-slate-950/50 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => void saveMemo()}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200/80 bg-white/80 px-4 text-sm font-medium text-slate-800 transition hover:border-slate-300 sm:self-auto dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-600"
            >
              <ClipboardCopy className="size-4" />
              Save &amp; copy
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

