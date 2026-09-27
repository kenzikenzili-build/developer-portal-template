'use client'

import { Cpu, GitBranch, Search } from 'lucide-react'

import { useSystemModals } from '@/components/providers/modal-provider'
import { siteConfig } from '@/config/site'

export function DashboardFooter() {
  const { openArchitectureModal, openCommandMenu } = useSystemModals()

  return (
    <footer className="mt-8 border-t border-slate-200/60 py-8 text-slate-600 dark:border-slate-800/60 dark:text-slate-400">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 md:px-5 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white">{siteConfig.name}</span>
          <span className="font-mono text-xs text-slate-400">· Decoupled dashboard shell</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <GitBranch className="size-3.5" />
            <span>{siteConfig.footerLabel}</span>
          </a>

          <button
            type="button"
            onClick={openArchitectureModal}
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-500/20 dark:border-cyan-400/30 dark:text-cyan-300"
          >
            <Cpu className="size-3.5 text-cyan-500" />
            <span>How it fits together</span>
          </button>

          <button
            type="button"
            onClick={openCommandMenu}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Search className="size-3.5" />
            <span>Command Palette (⌘K)</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
