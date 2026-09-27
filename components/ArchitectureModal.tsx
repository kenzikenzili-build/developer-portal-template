'use client'

import { Boxes, Cloud, Cpu, KeyRound, Layers, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useSystemModals } from '@/components/providers/modal-provider'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

type ArchitectureNode = {
  id: string
  step: string
  title: string
  subtitle: string
  badge: string
  icon: typeof Layers
  accentColor: string
  borderColor: string
  rationale: string
  metrics: string[]
}

const NODES: ArchitectureNode[] = [
  {
    id: 'shell',
    step: 'Layer 1',
    title: 'Decoupled dashboard shell',
    subtitle: 'Next.js App Router · React 19 · Tailwind v4',
    badge: 'Presentation',
    icon: Layers,
    accentColor: 'text-emerald-500 dark:text-emerald-400',
    borderColor: 'hover:border-emerald-500/60',
    rationale:
      'Every section is a standalone client component with no server dependency. The shell builds with `output: "export"`, so it can be hosted on any static bucket or CDN.',
    metrics: ['Static export', 'Zero server runtime', 'Route-per-section anchors'],
  },
  {
    id: 'mock',
    step: 'Layer 2',
    title: 'Mock data registry',
    subtitle: 'config/mockData.ts + domain contracts',
    badge: 'Default data',
    icon: Boxes,
    accentColor: 'text-sky-500 dark:text-sky-400',
    borderColor: 'hover:border-sky-500/60',
    rationale:
      'Delivery board, commute, intelligence, FinOps, portfolio, contracts, tasks and vault all read from one typed registry. This is what makes `npm run dev` render a complete UI before any API exists.',
    metrics: ['Typed payloads', 'No network calls', 'One file to fork'],
  },
  {
    id: 'adapters',
    step: 'Layer 3',
    title: 'Adapter seam',
    subtitle: 'Swap mock for your own API',
    badge: 'Integration',
    icon: Cpu,
    accentColor: 'text-indigo-500 dark:text-indigo-400',
    borderColor: 'hover:border-indigo-500/60',
    rationale:
      'Each section consumes a documented shape. Replace the registry import with a fetch/SWR hook that returns the same type and the layout, filters and empty states keep working unchanged.',
    metrics: ['Same type contract', 'SWR-friendly', 'Per-section rollout'],
  },
  {
    id: 'auth',
    step: 'Layer 4',
    title: 'Auth seam',
    subtitle: 'WorkspaceAuthProvider (mock session)',
    badge: 'Identity',
    icon: KeyRound,
    accentColor: 'text-amber-500 dark:text-amber-400',
    borderColor: 'hover:border-amber-500/60',
    rationale:
      'A provider-agnostic `WorkspaceAuthState` contract keeps the dashboard ignorant of the identity vendor. Swap the provider for NextAuth, Cognito or Clerk without touching a single section.',
    metrics: ['Provider agnostic', 'Sign-out resets session', 'No secrets in bundle'],
  },
  {
    id: 'delivery',
    step: 'Layer 5',
    title: 'Static delivery',
    subtitle: 'S3 + CloudFront, Pages, Netlify, Nginx',
    badge: 'Hosting',
    icon: Cloud,
    accentColor: 'text-violet-500 dark:text-violet-400',
    borderColor: 'hover:border-violet-500/60',
    rationale:
      'The build output is plain HTML/CSS/JS. Deploy it by syncing `out/` to a bucket and invalidating the CDN. A build id baked into the bundle purges stale service-worker caches on release.',
    metrics: ['Bucket sync deploy', 'CDN cache purge', 'Build-id cache busting'],
  },
]

export function ArchitectureModal() {
  const { architectureModalOpen, setArchitectureModalOpen } = useSystemModals()
  const [activeNode, setActiveNode] = useState<ArchitectureNode>(NODES[1])

  useEffect(() => {
    if (!architectureModalOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setArchitectureModalOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    const originalStyle = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalStyle
    }
  }, [architectureModalOpen, setArchitectureModalOpen])

  if (!architectureModalOpen) return null

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Shell architecture and data flow"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md sm:p-6"
      onClick={() => setArchitectureModalOpen(false)}
    >
      <div
        className="relative my-auto w-full max-w-5xl rounded-3xl border border-slate-200/80 bg-white/95 p-6 text-slate-900 shadow-2xl backdrop-blur-2xl md:p-8 dark:border-slate-800/80 dark:bg-slate-950/95 dark:text-slate-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <Layers className="size-3" />
              Architecture
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {siteConfig.name}
            </h2>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
              Five layers, zero backend coupling. Fork the shell and replace one layer at a time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setArchitectureModalOpen(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="size-4" />
            <span className="hidden font-mono text-[10px] tracking-widest text-slate-400 sm:inline">
              ESC
            </span>
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="space-y-2.5 lg:col-span-2">
            {NODES.map((node) => {
              const Icon = node.icon
              const isActive = activeNode.id === node.id
              return (
                <button
                  key={node.id}
                  type="button"
                  onMouseEnter={() => setActiveNode(node)}
                  onFocus={() => setActiveNode(node)}
                  onClick={() => setActiveNode(node)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition',
                    isActive
                      ? 'border-slate-400/70 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/80'
                      : 'border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/40',
                    node.borderColor,
                  )}
                >
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                    <Icon className={cn('size-4', node.accentColor)} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                        {node.step}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {node.badge}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm font-bold tracking-tight">{node.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-400">
                      {node.subtitle}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>


          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/50">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              {activeNode.step}
            </p>
            <h3 className="mt-1.5 text-base font-bold tracking-tight">{activeNode.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {activeNode.rationale}
            </p>
            <ul className="mt-4 space-y-1.5">
              {activeNode.metrics.map((metric) => (
                <li
                  key={metric}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
                >
                  {metric}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-5 border-t border-slate-200/80 pt-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:border-slate-800">
          Hover any layer to inspect its responsibility · data flows top-down
        </p>
      </div>
    </div>
  )
}

