'use client'

import { Cpu, LogOut, Moon, Search, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { useSystemModals } from '@/components/providers/modal-provider'
import { siteConfig } from '@/config/site'
import { useUnreadReportCount } from '@/hooks/useUnreadReports'
import { useWorkspaceAuth } from '@/hooks/useWorkspaceAuth'
import { getDisplayName } from '@/lib/display-name'

const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#sprint', label: 'Delivery' },
  { href: '#intelligence', label: 'Intel' },
  { href: '#tools', label: 'Tools' },
  { href: '#reports', label: 'Reports' },
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#finops', label: 'FinOps' },
  { href: '#contracts', label: 'Contracts' },
] as const

export function TopNav() {
  const { user, logout, isMockData } = useWorkspaceAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const { openCommandMenu, openArchitectureModal } = useSystemModals()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const displayName = user ? getDisplayName(user) : 'Operator'
  const isDark = mounted && resolvedTheme === 'dark'
  const unreadReports = useUnreadReportCount()

  const scrollTo = (href: string) => {
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-2xl dark:border-slate-800/50 dark:bg-slate-950/60">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-3 md:gap-3 md:px-5 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg border border-slate-200/90 bg-slate-950 text-[11px] font-bold tracking-[-0.06em] text-white dark:border-slate-800/80">
            {siteConfig.monogram}
          </span>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="relative flex size-2">
              <span
                className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${
                  isMockData ? 'bg-sky-400/40' : 'bg-emerald-400/40'
                }`}
              />
              <span
                className={`relative inline-flex size-2 rounded-full ${
                  isMockData ? 'bg-sky-500' : 'bg-emerald-500'
                }`}
              />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400">
              {isMockData ? 'Mock Data' : 'Live Sync'}
            </span>
          </div>
        </div>

        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => scrollTo(link.href)}
              className="relative rounded-lg px-2.5 py-1.5 text-sm text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
            >
              {link.label}
              {link.href === '#reports' && unreadReports > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white">
                  {unreadReports > 9 ? '9+' : unreadReports}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openArchitectureModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-500/20 dark:border-cyan-400/30 dark:text-cyan-300"
            title="View the decoupled shell architecture"
          >
            <Cpu className="size-3.5 text-cyan-500" />
            <span className="hidden sm:inline">Architecture</span>
          </button>

          <button
            type="button"
            onClick={openCommandMenu}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-slate-700"
            title="Open Command Palette (Cmd+K / Ctrl+K)"
          >
            <Search className="size-3.5" />
            <span className="hidden text-slate-400 lg:inline">Search</span>
            <kbd className="hidden rounded border border-slate-200/90 bg-white px-1 text-[10px] font-mono text-slate-500 sm:inline-block dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="grid size-9 place-items-center rounded-lg border border-slate-200/60 bg-slate-50 text-slate-800 transition hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <span className="hidden max-w-28 truncate text-sm font-medium text-slate-800 sm:inline dark:text-slate-300">
            {displayName}
          </span>

          <button
            type="button"
            onClick={() => void logout()}
            className="grid size-9 place-items-center rounded-lg border border-slate-200/60 bg-slate-50 text-slate-800 transition hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

