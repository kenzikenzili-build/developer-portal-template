/**
 * Intel report shape + generic seed catalog.
 *
 * The shell renders these cards out of the box. Replace `mockReports` with data
 * from your own API (see `config/mockData.ts`) and keep the `IntelReport`
 * contract so every component keeps working untouched.
 */
export const REPORT_CATEGORIES = [
  'Platform',
  'Architecture',
  'Delivery',
  'AI Systems',
  'FinOps',
  'Security',
  'Analytics',
] as const

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]

export type ReportPriority = 'high' | 'normal'

export type IntelReport = {
  id: string
  title: string
  category: string
  source: string
  sourceUrl: string
  excerpt: string
  syncedAt: string
  takeaways: string[]
  body: string[]
  /** ISO timestamp when published through an external pipeline. */
  createdAt?: string
  priority?: ReportPriority
}

export function isReportCategory(value: string): value is ReportCategory {
  return (REPORT_CATEGORIES as readonly string[]).includes(value)
}

export const mockReports: IntelReport[] = [
  {
    id: 'platform-reliability-review',
    title: 'Platform Reliability Review — Weekly',
    category: 'Platform',
    source: 'Mission Control Demo',
    sourceUrl: '#',
    excerpt:
      'Error budget burn is inside target. Two noisy alerts were folded into one synthetic probe and p95 latency dropped 11%.',
    syncedAt: '18M AGO',
    priority: 'normal',
    takeaways: [
      'Fold duplicated alert rules into synthetic probes.',
      'Keep p95 latency budget under 250ms on the edge tier.',
      'Log every incident follow-up as a tracked delivery item.',
    ],
    body: [
      '## Snapshot',
      'Availability held at 99.96% across the week with no customer-visible regressions.',
      '## What changed',
      'Alert deduplication removed false positives from the on-call rotation.',
      '## Next',
      'Promote the probe template into the shared reliability library.',
    ],
  },
  {
    id: 'zero-trust-rollout-notes',
    title: 'Zero Trust Rollout Notes',
    category: 'Security',
    source: 'Mission Control Demo',
    sourceUrl: '#',
    excerpt:
      'Access policies mapped for internal tools with device posture checks. Worker namespaces isolated per integration.',
    syncedAt: '42M AGO',
    priority: 'high',
    takeaways: [
      'Require device posture for every admin route.',
      'Isolate webhook traffic in a dedicated worker namespace.',
      'Roll out access policies in two waves: internal first, then public dashboards.',
    ],
    body: [
      '## Objective',
      'Harden private endpoints without slowing day-to-day tool switching.',
      '## Policy map',
      'Admin dashboards require SSO plus a healthy device posture signal.',
      '## Next steps',
      'Publish the route matrix and attach it to the architecture doc.',
    ],
  },
  {
    id: 'delivery-throughput-report',
    title: 'Delivery Throughput Report',
    category: 'Delivery',
    source: 'Mission Control Demo',
    sourceUrl: '#',
    excerpt:
      'Cycle time improved 14% sprint over sprint. Backlog hygiene is the remaining bottleneck for the platform squad.',
    syncedAt: '1H AGO',
    priority: 'normal',
    takeaways: [
      'Cap work in progress at three items per engineer.',
      'Groom the backlog before the sprint boundary, not during it.',
      'Tag every task with a project key so the board stays filterable.',
    ],
    body: [
      '## Signal',
      'Smaller batches correlated with fewer carried-over items.',
      '## Response',
      'Keep the two-day review cadence and prune stale backlog weekly.',
    ],
  },
  {
    id: 'cloud-cost-optimization',
    title: 'Cloud Cost Optimization Plan',
    category: 'FinOps',
    source: 'Mission Control Demo',
    sourceUrl: '#',
    excerpt:
      'A one-year savings plan covers 62% of the steady-state baseline. Leave burst workloads on demand.',
    syncedAt: '3D AGO',
    priority: 'normal',
    takeaways: [
      'Cover baseline only — leave burst capacity on demand.',
      'Revisit commitments after the next traffic season.',
      'Tag every savings-eligible resource with an owner.',
    ],
    body: [
      '## Analysis',
      'Steady workloads are predictable enough for a one-year term.',
      '## Risk',
      'Sandbox and experimental environments stay on demand.',
    ],
  },
  {
    id: 'developer-experience-metrics',
    title: 'Developer Experience Metrics',
    category: 'Analytics',
    source: 'Mission Control Demo',
    sourceUrl: '#',
    excerpt:
      'Time-to-first-commit for new contributors is down to 38 minutes. The tool launcher is the most used surface.',
    syncedAt: '4D AGO',
    priority: 'normal',
    takeaways: [
      'Keep the top apps path to two clicks or fewer.',
      'Instrument onboarding as a first-class funnel.',
      'Track launcher engagement per release.',
    ],
    body: [
      '## Metrics',
      'Authenticated engagement dominates total time-on-site.',
      '## UX',
      'Prioritise launcher discoverability in the next polish pass.',
    ],
  },
  {
    id: 'release-readiness-checklist',
    title: 'Release Readiness Checklist',
    category: 'Architecture',
    source: 'Mission Control Demo',
    sourceUrl: '#',
    excerpt:
      'Static export verification, cache invalidation, and rollback plan signed off for the next shell release.',
    syncedAt: '5D AGO',
    priority: 'high',
    takeaways: [
      'Verify the static export before every release.',
      'Invalidate the CDN cache as part of the deploy job.',
      'Keep a one-command rollback documented.',
    ],
    body: [
      '## Scope',
      'The shell must build with `output: "export"` and no server runtime.',
      '## Verification',
      'Smoke-test every dashboard section against mock data.',
    ],
  },
]
