'use client'

import { AlertTriangle, Boxes, Cpu, Layers, LineChart, Sparkles } from 'lucide-react'

import { NEWS_TABS, type NewsTabKey } from '@/lib/news-schema'

const TAB_ICONS: Record<NewsTabKey, typeof Layers> = {
  all: Layers,
  engineering: Boxes,
  ai_frontier: Cpu,
  market_signals: LineChart,
  platform_status: AlertTriangle,
  product: Sparkles,
}

export function NewsTabBar({
  activeTab,
  onSelectTab,
  getItemCount,
}: {
  activeTab: NewsTabKey
  onSelectTab: (tab: NewsTabKey) => void
  getItemCount: (tab: NewsTabKey) => number
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
      {NEWS_TABS.map((tab) => {
        const count = getItemCount(tab.id)
        const isActive = activeTab === tab.id
        const Icon = TAB_ICONS[tab.id]

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900 dark:bg-white dark:text-slate-950 dark:ring-white'
                : 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Icon className={`size-3.5 ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-600 dark:text-slate-400'}`} />
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 font-mono text-[10px] font-bold ${
                isActive ? 'bg-white/20 text-white dark:bg-slate-900/15 dark:text-slate-950' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
