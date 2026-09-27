'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShieldCheck } from 'lucide-react'

import { SkyBackground } from '@/components/sky-background'
import { siteConfig } from '@/config/site'
import { useWorkspaceAuth } from '@/hooks/useWorkspaceAuth'

/**
 * Sign-in seam.
 *
 * This is deliberately provider-free: it starts a local mock session so the
 * shell is explorable out of the box. Replace `handleEnter` with your real
 * OAuth / SSO call and the rest of the app needs no changes.
 */
export function LoginScreen() {
  const router = useRouter()
  const { login } = useWorkspaceAuth()
  const [isEntering, setIsEntering] = useState(false)

  const handleEnter = async () => {
    setIsEntering(true)
    try {
      await login()
      router.replace('/')
    } finally {
      setIsEntering(false)
    }
  }

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
      <SkyBackground />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-lg flex-col items-center text-center"
      >
        <div className="mb-8 font-mono text-xs font-medium tracking-[0.28em] text-slate-800/70 drop-shadow-sm dark:text-white/80">
          {siteConfig.name.toUpperCase()}
        </div>

        <div className="w-full rounded-3xl border border-white/25 bg-white/25 p-8 shadow-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-2xl md:p-12">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-700/80 dark:text-slate-200/80">
            Decoupled Dashboard Shell
          </p>
          <h1 className="mb-2 mt-4 text-center font-[family-name:var(--font-artistic)] text-4xl font-normal italic leading-[1.1] tracking-[0.01em] text-slate-900 drop-shadow-sm md:text-6xl dark:text-white">
            {siteConfig.tagline}
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-700/90 dark:text-slate-300/90">
            {siteConfig.description}
          </p>

          <div className="my-8 flex w-full flex-col items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={isEntering}
              onClick={handleEnter}
              className="inline-flex items-center gap-3 rounded-xl border border-white/40 bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.35)] disabled:cursor-wait disabled:opacity-70"
            >
              {isEntering ? 'Opening…' : 'Enter demo workspace'}
              <ArrowRight className="size-4" />
            </motion.button>

            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700/80 dark:text-slate-300/80">
              <ShieldCheck className="size-3.5" />
              Runs entirely on bundled mock data — no API keys required.
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
