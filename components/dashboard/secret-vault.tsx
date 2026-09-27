'use client'

import { Check, Copy, Eye, EyeOff, Info, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { mockVaultEntries } from '@/config/mockData'

/**
 * Secret vault — UI DEMO ONLY.
 *
 * Every value below is an obvious placeholder. There is no encryption, no key
 * derivation and no network call: this card exists to show the interaction
 * pattern. Wire it to your own secret manager (Vault, 1Password, SSM, …) and
 * render values server-side only — never bake real secrets into a static bundle.
 */
export function SecretVault() {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <section id="vault" className="scroll-mt-20">
      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm md:p-5 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Secret Vault
            </h3>
            <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              UI DEMO
            </span>
          </div>
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/Security"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
          >
            <Info className="size-3.5" />
            Secrets must be fetched server-side
          </a>
        </div>

        <div className="mb-4 rounded-xl border border-amber-300/70 bg-amber-50 px-3.5 py-2.5 text-[11px] font-medium leading-relaxed text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-100">
          This card renders placeholder values only. Do not store credentials in a client bundle —
          proxy reads through your backend and return masked values.
        </div>

        <div className="space-y-3">
          {mockVaultEntries.map((entry) => {
            const isRevealed = Boolean(revealedIds[entry.id])
            return (
              <div
                key={entry.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {entry.label}
                    </span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {entry.service}
                    </span>
                  </div>
                  <p className="break-all font-mono text-xs text-slate-600 dark:text-slate-400">
                    {isRevealed ? entry.demoValue : entry.maskedValue}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleReveal(entry.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {isRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    <span>{isRevealed ? 'Mask' : 'Reveal'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(entry.id, entry.demoValue)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {copiedId === entry.id ? (
                      <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>{copiedId === entry.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
