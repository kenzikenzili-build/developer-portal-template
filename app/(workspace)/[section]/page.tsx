import { notFound } from 'next/navigation'

import { PortalDashboard } from '@/components/portal-dashboard'
import { DASHBOARD_SEGMENTS, isDashboardSegment } from '@/lib/auth/routes'

export function generateStaticParams() {
  return DASHBOARD_SEGMENTS.map((section) => ({ section }))
}

export default async function WorkspaceSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!isDashboardSegment(section)) notFound()
  return <PortalDashboard />
}
