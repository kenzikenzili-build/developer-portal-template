'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { CommuteTelemetryBar } from '@/components/dashboard/commute-telemetry-bar'
import { ContractsSection } from '@/components/dashboard/contracts-section'
import { DashboardFooter } from '@/components/dashboard/dashboard-footer'
import { FinOpsSection } from '@/components/dashboard/finops-section'
import { HeroCover } from '@/components/dashboard/hero-cover'
import { IntelligenceFeed } from '@/components/dashboard/intelligence-feed'
import { KnowledgeHubSection } from '@/components/dashboard/knowledge-hub-section'
import { ReportsSection } from '@/components/dashboard/reports-section'
import { SecretVault } from '@/components/dashboard/secret-vault'
import { SprintTrackerCard } from '@/components/dashboard/sprint-tracker-card'
import { TaskBoard } from '@/components/dashboard/task-board'
import { ToolsSection } from '@/components/dashboard/tools-section'
import { TopNav } from '@/components/dashboard/top-nav'
import { PortfolioSection } from '@/components/dashboard/portfolio-section'
import { SprintCatalogProvider } from '@/hooks/useSprintCatalog'
import { isDashboardSegment } from '@/lib/auth/routes'
import type { WorkspaceUser } from '@/lib/auth/types'

type AuthorizedDashboardProps = {
  user: WorkspaceUser
  onSignOut: () => void
}

/**
 * Modular Command Center dashboard.
 *
 * Every section renders from `config/mockData.ts` by default. Identity is
 * supplied by the parent code-split guard / WorkspaceAuthProvider.
 */
export default function AuthorizedDashboard(_props: AuthorizedDashboardProps) {
  const pathname = usePathname()

  useEffect(() => {
    const section = pathname.replace(/^\//, '')
    if (!section || !isDashboardSegment(section)) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  return (
    <div className="relative z-10 min-h-screen overflow-x-hidden text-slate-900 dark:text-slate-100">
      <TopNav />
      <SprintCatalogProvider>
        <div className="mx-auto flex min-w-0 max-w-[1400px] flex-col gap-4 px-4 py-4 md:gap-6 md:px-5 md:py-6 lg:gap-8 lg:px-8 lg:py-8">
          <HeroCover />
          <SprintTrackerCard />
          <CommuteTelemetryBar />
          <KnowledgeHubSection />
          <IntelligenceFeed />
          <ToolsSection />
          <ReportsSection />
          <PortfolioSection />
          <FinOpsSection />
          <ContractsSection />
          <TaskBoard />
          <SecretVault />
        </div>
      </SprintCatalogProvider>
      <DashboardFooter />
    </div>
  )
}
