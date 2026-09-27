'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'

import { SkyBackground } from '@/components/sky-background'
import { useWorkspaceAuth } from '@/hooks/useWorkspaceAuth'
import type { WorkspaceUser } from '@/lib/auth/types'

type DashboardProps = {
  user: WorkspaceUser
  onSignOut: () => void
}

/**
 * Code-split guard: the dashboard bundle only downloads once a session exists.
 */
async function loadAuthorizedDashboard(): Promise<ComponentType<DashboardProps>> {
  const mod = await import('@/components/dashboard/authorized-dashboard')
  return mod.default as ComponentType<DashboardProps>
}

function StealthDashboard({ user, onSignOut }: DashboardProps) {
  const [Dashboard, setDashboard] = useState<ComponentType<DashboardProps> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadAuthorizedDashboard()
      .then((Comp) => {
        if (!cancelled) setDashboard(() => Comp)
      })
      .catch((err) => {
        console.error('Failed to load dashboard module:', err)
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <p className="text-sm font-semibold text-rose-500">Failed to load dashboard module</p>
        <p className="mt-1 text-xs text-slate-400">{loadError}</p>
      </div>
    )
  }

  if (!Dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full border border-slate-800/80 bg-slate-900/60" />
      </div>
    )
  }

  return <Dashboard user={user} onSignOut={onSignOut} />
}

export function PortalDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useWorkspaceAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="relative z-10 min-h-screen">
      <SkyBackground />

      {isLoading || !isAuthenticated ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full border border-slate-800/80 bg-slate-900/60" />
        </div>
      ) : null}

      {!isLoading && isAuthenticated && user ? (
        <StealthDashboard user={user} onSignOut={logout} />
      ) : null}
    </div>
  )
}
