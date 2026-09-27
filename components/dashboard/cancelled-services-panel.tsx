'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  CANCELLED_SERVICES_STORAGE_KEY,
  type CancelledService,
  type CostCadence,
} from '@/config/contracts'
import { siteConfig } from '@/config/site'
import { mutedTextClass, primaryTextClass, sectionLabelClass, softPillClass } from '@/lib/ui'

const frostCardClass =
  'rounded-2xl border border-white/20 bg-white/40 p-5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/40'

const fieldClass =
  'min-h-11 w-full rounded-xl border border-slate-200/60 bg-white/70 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-400 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-100 dark:focus:border-slate-600'

function monthlyAmount(item: CancelledService) {
  return item.cadence === 'annual' ? item.amount / 12 : item.amount
}

function formatMoney(amount: number) {
  return `US$ ${Math.round(amount).toLocaleString(siteConfig.locale)}`
}

function formatCost(item: CancelledService) {
  const suffix = item.cadence === 'annual' ? '/yr' : '/mo'
  return `${formatMoney(item.amount)}${suffix}`
}

function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(siteConfig.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function readStoredServices(): CancelledService[] {
  try {
    const raw = window.localStorage.getItem(CANCELLED_SERVICES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCancelledService)
  } catch {
    return []
  }
}

function isCancelledService(value: unknown): value is CancelledService {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<CancelledService>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.amount === 'number' &&
    Number.isFinite(item.amount) &&
    (item.cadence === 'monthly' || item.cadence === 'annual') &&
    typeof item.cancelledOn === 'string' &&
    typeof item.notes === 'string'
  )
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function CancelledServicesPanel() {
  const [items, setItems] = useState<CancelledService[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [cadence, setCadence] = useState<CostCadence>('monthly')
  const [cancelledOn, setCancelledOn] = useState(todayIso)
  const [notes, setNotes] = useState('')
  const [formOpen, setFormOpen] = useState(true)

  useEffect(() => {
    setItems(readStoredServices())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(CANCELLED_SERVICES_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota / private-mode failures.
    }
  }, [hydrated, items])

  const monthlySaved = useMemo(
    () => items.reduce((sum, item) => sum + monthlyAmount(item), 0),
    [items],
  )

  const canSave = name.trim().length > 0 && Number(amount) > 0 && cancelledOn.length > 0

  const saveService = () => {
    const parsedAmount = Number(amount)
    if (!name.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return

    const next: CancelledService = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `cancelled-${Date.now()}`,
      name: name.trim(),
      amount: parsedAmount,
      cadence,
      cancelledOn,
      notes: notes.trim(),
    }

    setItems((current) => [next, ...current])
    setName('')
    setAmount('')
    setCadence('monthly')
    setCancelledOn(todayIso())
    setNotes('')
  }

  const removeService = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className={frostCardClass}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={sectionLabelClass}>Cancelled Services Log</p>
            <p className={`mt-2 text-2xl font-bold tracking-[-0.03em] ${primaryTextClass}`}>
              Total recovered spend: {formatMoney(monthlySaved)}/mo saved
            </p>
            <p className={`mt-1 text-sm ${mutedTextClass}`}>
              {items.length === 0
                ? 'Log a cancelled subscription to start tracking recovered spend.'
                : `${items.length} cancelled ${items.length === 1 ? 'service' : 'services'} in the archive.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium ${softPillClass}`}
            aria-expanded={formOpen}
          >
            <Plus className={`size-4 transition-transform duration-300 ${formOpen ? 'rotate-45' : ''}`} />
            {formOpen ? 'Hide form' : 'Log cancelled service'}
          </button>
        </div>

        <div
          className={`grid overflow-hidden transition-all duration-300 ${
            formOpen ? 'mt-5 max-h-[720px] grid-rows-[1fr] opacity-100' : 'max-h-0 grid-rows-[0fr] opacity-0'
          }`}
        >
          <form
            className="min-h-0 grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              saveService()
            }}
          >
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Service Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder='e.g. "Legacy hosting plan", "Team seat"'
                className={fieldClass}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Monthly / Annual Cost
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="380"
                  className={fieldClass}
                />
                <select
                  value={cadence}
                  onChange={(event) => setCadence(event.target.value as CostCadence)}
                  className={`${fieldClass} max-w-[7.5rem] shrink-0`}
                  aria-label="Billing cadence"
                >
                  <option value="monthly">US$/mo</option>
                  <option value="annual">US$/yr</option>
                </select>
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Cancellation Date
              </span>
              <input
                type="date"
                value={cancelledOn}
                onChange={(event) => setCancelledOn(event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Reason / Notes (optional)
              </span>
              <input
                type="text"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Why it was cancelled"
                className={fieldClass}
              />
            </label>

            <button
              type="submit"
              disabled={!canSave}
              className="min-h-11 rounded-xl border border-slate-300/80 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2 dark:border-slate-700/80 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              Save cancelled service
            </button>
          </form>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={`${frostCardClass} text-sm ${mutedTextClass}`}>
          Nothing cancelled yet. Use the form above to archive a cancelled subscription.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <article className={frostCardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-500">
                      Cancelled {formatDate(item.cancelledOn)}
                    </p>
                    <h3 className="mt-2 truncate text-base font-semibold tracking-[-0.02em] line-through text-slate-400 dark:text-slate-500">
                      {item.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(item.id)}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/50 hover:text-rose-600 dark:hover:bg-slate-800/80 dark:hover:text-rose-300"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm font-medium tabular-nums line-through text-slate-400 dark:text-slate-500">
                  {formatCost(item)}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {formatMoney(monthlyAmount(item))}/mo recovered
                </p>
                {item.notes ? (
                  <p className={`mt-3 text-sm ${mutedTextClass}`}>{item.notes}</p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
