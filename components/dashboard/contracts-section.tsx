'use client'

import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { CancelledServicesPanel } from '@/components/dashboard/cancelled-services-panel'
import { ContractDrawer } from '@/components/dashboard/contract-drawer'
import { mockContracts, type ContractItem, type ContractUrgency } from '@/config/contracts'
import { sectionLabelClass, sectionTitleClass, softPillClass } from '@/lib/ui'

type ContractsView = 'active' | 'cancelled'

const urgencyPillClass: Record<ContractUrgency, string> = {
  active:
    'border-emerald-300/70 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200',
  recontract:
    'border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-400/35 dark:bg-amber-500/15 dark:text-amber-100',
  urgent:
    'border-rose-300/70 bg-rose-50 text-rose-800 dark:border-rose-400/40 dark:bg-rose-500/20 dark:text-rose-100',
}

export function ContractsSection() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [view, setView] = useState<ContractsView>('active')

  const contracts: ContractItem[] = mockContracts

  const handleSaveSuccess = () => {
    setIsDrawerOpen(false)
  }

  const { activeCount, expiringSoon } = useMemo(() => {
    const active = contracts.length
    const expiring = contracts.filter(
      (item) => item.daysRemaining !== null && item.daysRemaining <= 30,
    ).length
    return { activeCount: active, expiringSoon: expiring }
  }, [contracts])

  return (
    <section id="contracts" className="scroll-mt-20 pb-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={sectionLabelClass}>Contracts & Subscription Lifecycle</h2>
            <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${softPillClass}`}>
              {activeCount} Active · {expiringSoon} Expiring Soon
            </span>
          </div>
          <p className={sectionTitleClass}>
            {view === 'active'
              ? 'Renewals, deadlines, and recurring spend'
              : 'Cancelled services and recovered monthly spend'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 p-1 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => setView('active')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-out ${
                view === 'active'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white/20 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Active Contracts
            </button>
            <button
              type="button"
              onClick={() => setView('cancelled')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-out ${
                view === 'cancelled'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white/20 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Cancelled History
            </button>
          </div>
          {view === 'active' ? (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition hover:border-slate-300 dark:hover:border-slate-600 ${softPillClass}`}
            >
              <Plus className="size-4" />
              New Contract
            </button>
          ) : null}
        </div>
      </div>

      <div className={view === 'active' ? '' : 'hidden'}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {contracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      </div>

      <div className={view === 'cancelled' ? '' : 'hidden'}>
        <CancelledServicesPanel />
      </div>

      <ContractDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSaveSuccess={handleSaveSuccess}
      />
    </section>
  )
}

function ContractCard({ contract }: { contract: ContractItem }) {
  return (
    <article className="rounded-2xl border border-white bg-white/95 p-4 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition hover:border-slate-200 md:p-5 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-100 dark:shadow-none dark:hover:border-slate-700/80">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-800 dark:border-slate-700/80 dark:bg-transparent dark:text-slate-300">
          {contract.category}
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${urgencyPillClass[contract.urgency]}`}
        >
          {contract.statusLabel}
        </span>
      </div>

      <h3 className="mt-3 text-base font-bold tracking-[-0.02em] text-slate-900 dark:text-white">{contract.name}</h3>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{contract.scheduleLabel}</p>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-200/60 pt-4 dark:border-slate-800/80">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Recurring</span>
        <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{contract.costLabel}</span>
      </div>
    </article>
  )
}
