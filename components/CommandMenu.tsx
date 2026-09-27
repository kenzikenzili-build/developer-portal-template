'use client'

import { Command } from 'cmdk'
import {
  Activity,
  Boxes,
  Cpu,
  FileText,
  LayoutDashboard,
  Search,
  Wallet,
} from 'lucide-react'
import { useCallback, useEffect } from 'react'

import { useSystemModals } from '@/components/providers/modal-provider'
import { siteConfig } from '@/config/site'

export function CommandMenu() {
  const { commandMenuOpen, setCommandMenuOpen, openArchitectureModal } = useSystemModals()

  useEffect(() => {
    if (!commandMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCommandMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [commandMenuOpen, setCommandMenuOpen])

  const scrollTo = useCallback(
    (id: string) => {
      setCommandMenuOpen(false)
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    [setCommandMenuOpen],
  )

  if (!commandMenuOpen) return null

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      onClick={() => setCommandMenuOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-2xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command Palette" className="flex flex-col w-full">
          <div className="flex items-center border-b border-slate-200/80 px-3.5 dark:border-slate-800">
            <Search className="size-4 shrink-0 text-slate-400 dark:text-slate-500" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search sections..."
              className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[320px] overflow-y-auto p-2 text-slate-700 dark:text-slate-300">
            <Command.Empty className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Views & Navigation"
              className="px-2 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              <Command.Item
                onSelect={() => scrollTo('sprint')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800/70"
              >
                <LayoutDashboard className="size-4 text-emerald-500" />
                <span>Delivery Board</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">#sprint</span>
              </Command.Item>

              <Command.Item
                onSelect={() => scrollTo('tools')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800/70"
              >
                <Boxes className="size-4 text-indigo-500" />
                <span>Workspace Launcher</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">#tools</span>
              </Command.Item>

              <Command.Item
                onSelect={() => scrollTo('intelligence')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800/70"
              >
                <Activity className="size-4 text-sky-500" />
                <span>Intelligence Feed</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">#intelligence</span>
              </Command.Item>

              <Command.Item
                onSelect={() => scrollTo('tasks')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800/70"
              >
                <LayoutDashboard className="size-4 text-emerald-500" />
                <span>Task Board</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">#tasks</span>
              </Command.Item>

              <Command.Item
                onSelect={() => scrollTo('knowledge')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800/70"
              >
                <Boxes className="size-4 text-violet-500" />
                <span>Knowledge Hub</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">#knowledge</span>
              </Command.Item>

              <Command.Item
                onSelect={() => scrollTo('reports')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800/70"
              >
                <FileText className="size-4 text-rose-500" />
                <span>Intel &amp; Strategy Reports</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">#reports</span>
              </Command.Item>

              <Command.Item
                onSelect={() => scrollTo('portfolio')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800/70"
              >
                <Wallet className="size-4 text-amber-500" />
                <span>Portfolio &amp; Cash Flow Telemetry</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">#portfolio</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="my-1 h-px bg-slate-200/80 dark:bg-slate-800" />

            <Command.Group
              heading="System & Architecture"
              className="px-2 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              <Command.Item
                onSelect={openArchitectureModal}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-cyan-600 transition hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/40 aria-selected:bg-cyan-50 dark:aria-selected:bg-cyan-950/40"
              >
                <Cpu className="size-4 text-cyan-500" />
                <span>View System Architecture Showcase</span>
                <span className="ml-auto font-mono text-[10px] uppercase text-cyan-500/80">Modal</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="my-1 h-px bg-slate-200/80 dark:bg-slate-800" />

            <Command.Group
              heading="FinOps & Contracts"
              className="px-2 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              <Command.Item
                onSelect={() => scrollTo('finops')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800/70"
              >
                <Activity className="size-4 text-blue-500" />
                <span>FinOps Cloud Cost Control</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">#finops</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-2.5 font-mono text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <span>{siteConfig.name}</span>
          </div>
        </Command>
      </div>
    </div>
  )
}
