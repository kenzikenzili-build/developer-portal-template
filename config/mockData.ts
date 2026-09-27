import type { CuratedNewsDatabase } from '@/lib/news-schema'
import { buildBudgetSnapshot, type BudgetTelemetrySnapshot } from '@/lib/budget/schema'
import { buildWealthSnapshot, type WealthTelemetrySnapshot } from '@/lib/wealth/compute'
import type { SprintCatalog } from '@/lib/sprint'

import { mockContracts } from '@/config/contracts'
import { mockReports } from '@/config/reports'
import { wealthConfig } from '@/config/wealth'

/**
 * Central mock data registry.
 *
 * Every dashboard section reads from here by default, so the shell renders a
 * complete, believable UI with zero backend. To go live, fetch your own payload
 * and drop it into the same shapes — no component changes required.
 */

export { mockContracts, mockReports, wealthConfig }

/* -------------------------------------------------------------------------- */
/* Delivery board                                                             */
/* -------------------------------------------------------------------------- */

export const mockSprintCatalog: SprintCatalog = {
  sprints: [
    {
      sprintId: 'sprint-00',
      sprintName: 'Sprint 00: Foundation',
      state: 'Completed',
      lastUpdated: '2026-01-16',
      goal: 'Lock the repository scaffolding, CI baseline, and design tokens.',
      items: [
        { id: 's00-1', project: 'core-platform', title: 'Monorepo scaffolding & workspace tooling', status: 'Done' },
        { id: 's00-2', project: 'core-platform', title: 'CI pipeline with typecheck and preview deploy', status: 'Done' },
        { id: 's00-3', project: 'design-system', title: 'Design token export (colour, spacing, type)', status: 'Done' },
        { id: 's00-4', project: 'api-gateway', title: 'OpenAPI baseline for the public surface', status: 'Done' },
        { id: 's00-5', project: 'portfolio-site', title: 'Static export hosting proof of concept', status: 'Done' },
      ],
    },
    {
      sprintId: 'sprint-01',
      sprintName: 'Sprint 01: Shell & Telemetry',
      state: 'Active',
      lastUpdated: '2026-02-06',
      goal: 'Ship the decoupled dashboard shell backed by mock data channels.',
      items: [
        { id: 's01-01', project: 'core-platform', title: 'Dashboard shell layout & navigation', status: 'Done' },
        { id: 's01-02', project: 'core-platform', title: 'Theme provider with light/dark persistence', status: 'Done' },
        { id: 's01-03', project: 'core-platform', title: 'Static export verification in CI', status: 'Done' },
        { id: 's01-04', project: 'design-system', title: 'Card, pill and telemetry badge primitives', status: 'Done' },
        { id: 's01-05', project: 'design-system', title: 'Animated weather + scene illustration set', status: 'Done' },
        { id: 's01-06', project: 'design-system', title: 'Accessibility pass on interactive controls', status: 'In Progress' },
        { id: 's01-07', project: 'api-gateway', title: 'Mock data registry for every section', status: 'Done' },
        { id: 's01-08', project: 'api-gateway', title: 'Replace mock registry with adapter interface', status: 'In Progress' },
        { id: 's01-09', project: 'api-gateway', title: 'Retry and backoff policy for remote feeds', status: 'Backlog' },
        { id: 's01-10', project: 'core-platform', title: 'Command palette coverage for all sections', status: 'In Progress' },
        { id: 's01-11', project: 'core-platform', title: 'Task board with local persistence', status: 'In Progress' },
        { id: 's01-12', project: 'portfolio-site', title: 'Public case study page for the shell', status: 'Backlog' },
        { id: 's01-13', project: 'portfolio-site', title: 'Screenshot gallery automation', status: 'Backlog' },
        { id: 's01-14', project: 'design-system', title: 'Density scale for compact data tables', status: 'Backlog' },
      ],
    },
    {
      sprintId: 'sprint-02',
      sprintName: 'Sprint 02: Integrations',
      state: 'Planning',
      lastUpdated: '2026-02-20',
      goal: 'Wire real adapters behind the existing mock contract.',
      items: [
        { id: 's02-01', project: 'api-gateway', title: 'Adapter interface for every feed', status: 'Backlog' },
        { id: 's02-02', project: 'api-gateway', title: 'Signed read-only tokens per integration', status: 'Backlog' },
        { id: 's02-03', project: 'core-platform', title: 'Optimistic writes for task board', status: 'Backlog' },
        { id: 's02-04', project: 'design-system', title: 'Empty, loading and error state catalogue', status: 'Backlog' },
        { id: 's02-05', project: 'portfolio-site', title: 'Release notes page generated from git', status: 'Backlog' },
      ],
    },
  ],
}

/* -------------------------------------------------------------------------- */
/* Cloud cost telemetry (FinOps)                                              */
/* -------------------------------------------------------------------------- */

export type FinOpsProviderMetric = {
  id: string
  provider: string
  /** Short monogram rendered in the provider tile. */
  monogram: string
  /** Tailwind background class for the provider tile. */
  tileClass: string
  monthToDate: string
  trend: number
}

export const mockFinopsMetrics: FinOpsProviderMetric[] = [
  {
    id: 'primary-cloud',
    provider: 'Primary Cloud',
    monogram: 'PC',
    tileClass: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
    monthToDate: '1,284.60',
    trend: -8,
  },
  {
    id: 'secondary-cloud',
    provider: 'Secondary Cloud',
    monogram: 'SC',
    tileClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    monthToDate: '742.15',
    trend: 3,
  },
  {
    id: 'edge-cdn',
    provider: 'Edge CDN',
    monogram: 'CDN',
    tileClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    monthToDate: '186.40',
    trend: -12,
  },
  {
    id: 'ai-apis',
    provider: 'AI APIs',
    monogram: 'AI',
    tileClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    monthToDate: '418.75',
    trend: 9,
  },
]

/* -------------------------------------------------------------------------- */
/* Commute telemetry                                                          */
/* -------------------------------------------------------------------------- */

/** One boardable service for a leg — rendered as a single ETA card. */
export type CommuteOption = {
  route: string
  etaMinutes: number
  destination: string
}

export type CommuteLeg = {
  id: string
  label: string
  route: string
  from: string
  to: string
  minutes: number
  walkMinutes?: number
  note?: string
  /**
   * Every service that can be boarded for THIS leg only. The hub shows one leg
   * at a time (Leg 1 / Leg 2) and crowns the fastest option inside that leg, so
   * options live on the leg instead of on the whole window.
   */
  options: CommuteOption[]
}

export type CommuteWindow = {
  id: 'morning' | 'evening'
  title: string
  subtitle: string
  origin: string
  destination: string
  transferHub: string
  legs: CommuteLeg[]
  alerts: { id: string; title: string; summary: string }[]
}

export const mockCommute = {
  /** Windows that auto-expand the panel. Purely cosmetic for the demo. */
  peakWindowsLabel: '07:00–09:30 / 17:30–19:30',
  peakHours: { morning: [7, 9.5] as [number, number], evening: [17.5, 19.5] as [number, number] },
  windows: [
    {
      id: 'morning',
      title: 'Morning · Inbound',
      subtitle: 'Home base → Core District',
      origin: 'Home Base Terminal',
      destination: 'Core District',
      transferHub: 'Riverside Interchange',
      legs: [
        {
          id: 'm-1',
          label: 'Leg 1 · Feeder loop',
          route: 'Route A1',
          from: 'Home Base Terminal',
          to: 'Riverside Interchange',
          minutes: 4,
          walkMinutes: 3,
          note: 'Frequent service, every 6 minutes at peak.',
          options: [
            { route: 'Route A1', etaMinutes: 4, destination: 'Riverside Interchange' },
            { route: 'Route A1X', etaMinutes: 9, destination: 'Riverside Interchange' },
            { route: 'Route A2', etaMinutes: 14, destination: 'Riverside Interchange' },
          ],
        },
        {
          id: 'm-2',
          label: 'Leg 2 · Trunk line',
          route: 'Route P7',
          from: 'Riverside Interchange',
          to: 'Core District',
          minutes: 18,
          note: 'Express trunk line, limited stops.',
          options: [
            { route: 'Route P7', etaMinutes: 5, destination: 'Core District' },
            { route: 'Route P7X', etaMinutes: 11, destination: 'Core District' },
            { route: 'Route P9', etaMinutes: 16, destination: 'Core District' },
          ],
        },
      ],
      alerts: [
        {
          id: 'alert-am-1',
          title: 'Signal works',
          summary: 'Single-lane running on the trunk line until 09:00. Allow +4 minutes.',
        },
      ],
    },
    {
      id: 'evening',
      title: 'Evening · Outbound',
      subtitle: 'Core District → Home Base',
      origin: 'Core District',
      destination: 'Home Base Terminal',
      transferHub: 'Harbour Link',
      legs: [
        {
          id: 'e-1',
          label: 'Leg 1 · Express',
          route: 'Route P7',
          from: 'Core District',
          to: 'Harbour Link',
          minutes: 18,
          note: 'Departures every 8 minutes until 20:00.',
          options: [
            { route: 'Route P7', etaMinutes: 4, destination: 'Harbour Link' },
            { route: 'Route P7X', etaMinutes: 10, destination: 'Harbour Link' },
            { route: 'Route P9', etaMinutes: 17, destination: 'Harbour Link' },
          ],
        },
        {
          id: 'e-2',
          label: 'Leg 2 · Feeder loop',
          route: 'Route B3',
          from: 'Harbour Link',
          to: 'Home Base Terminal',
          minutes: 6,
          walkMinutes: 3,
          note: 'Circular service, alight at the terminal stop.',
          options: [
            { route: 'Route B3', etaMinutes: 4, destination: 'Home Base Terminal' },
            { route: 'Route B3', etaMinutes: 11, destination: 'Home Base Terminal' },
            { route: 'Route B5', etaMinutes: 19, destination: 'Home Base Terminal' },
          ],
        },
      ],
      alerts: [
        {
          id: 'alert-pm-1',
          title: 'Road closure',
          summary: 'Outbound feeder loop diverted via North Gate. Expect +2 minutes.',
        },
      ],
    },
  ] satisfies CommuteWindow[],
}

/* -------------------------------------------------------------------------- */
/* Weather                                                                    */
/* -------------------------------------------------------------------------- */

export const mockWeather = {
  temperature: 21,
  condition: 'partly-cloudy' as const,
  label: 'Partly cloudy',
  humidity: '64%',
  wind: '12 km/h',
}

/* -------------------------------------------------------------------------- */
/* Portfolio + cash-flow telemetry                                            */
/* -------------------------------------------------------------------------- */

export const mockWealthTelemetry: WealthTelemetrySnapshot = buildWealthSnapshot(
  {
    brokerage: 820_000,
    savings: 240_000,
    checking: 60_000,
    loanPrimary: 40_000,
    loanSecondary: 15_000,
    retirement: 310_000,
    note: 'Demo snapshot',
  },
  'SIMULATED',
)

export const mockBudgetTelemetry: BudgetTelemetrySnapshot = buildBudgetSnapshot(
  {
    month: '2026-02',
    income: 42_000,
    totalExpense: 36_500,
    netCashFlow: 5_500,
    categories: {
      infrastructure: { label: 'Cloud & Infrastructure', spent: 18_400, limit: 20_000 },
      tooling: { label: 'SaaS Tooling', spent: 12_100 },
      teamCards: { label: 'Team Cards', spent: 6_000, limit: 5_000 },
    },
    nextBill: { date: '2026-03-07', task: 'Cloud invoice auto-pay' },
  },
  'SIMULATED',
)


/* -------------------------------------------------------------------------- */
/* Curated intelligence feed                                                  */
/* -------------------------------------------------------------------------- */

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

export const mockIntelligence: CuratedNewsDatabase = {
  updated_at: hoursAgo(0),
  version: 'demo-1',
  categories: {
    engineering: [
      {
        id: 'eng-incremental-builds',
        category: 'engineering',
        updated_at: hoursAgo(2),
        title: 'Incremental build cache cut CI time by 46%',
        source_tag: 'Engineering Blog',
        key_points: [
          'Remote cache keys are derived from the dependency graph, not the lockfile hash.',
          'Cold builds still take 9 minutes; warm builds now finish in under 5.',
          'Cache hit rate stabilised at 91% after enabling per-package granularity.',
        ],
        highlights: [
          { label: 'Build time', value: '9m 10s → 4m 55s' },
          { label: 'Cache hit rate', value: '91%' },
        ],
        severity: 'INFO',
        url: '#',
      },
      {
        id: 'eng-static-export',
        category: 'engineering',
        updated_at: hoursAgo(9),
        title: 'Static export removes the need for a server runtime',
        source_tag: 'Architecture Notes',
        key_points: [
          'The dashboard compiles to plain HTML/CSS/JS in `out/`.',
          'Deploys become a bucket sync plus a CDN invalidation.',
          'Route handlers are unavailable by design, which keeps the shell honest.',
        ],
        url: '#',
      },
    ],
    ai_frontier: [
      {
        id: 'ai-small-models',
        category: 'ai_frontier',
        updated_at: hoursAgo(5),
        title: 'Small instruction models now match older flagship quality',
        source_tag: 'Research Digest',
        key_points: [
          'A 3B parameter model matched a 12-month-old 70B baseline on the eval suite.',
          'Quantised builds run comfortably on a single mid-range GPU.',
          'Licences are permissive for the leading open checkpoints.',
        ],
        highlights: [
          { label: 'Eval delta', value: '+0.4% vs prior flagship' },
          { label: 'Footprint', value: '3B params, 4-bit' },
        ],
        severity: 'INFO',
        url: '#',
      },
    ],
    market_signals: [
      {
        id: 'market-cloud-pricing',
        category: 'market_signals',
        updated_at: hoursAgo(11),
        title: 'Committed-use discounts widened for steady workloads',
        source_tag: 'Market Signal',
        key_points: [
          'One-year commitments now cover up to 62% of a predictable baseline.',
          'Burst and experimental capacity stays cheapest on demand.',
          'Review commitments quarterly rather than annually.',
        ],
        severity: 'WARNING',
        action: 'Re-check savings-plan coverage before the next billing cycle.',
        url: '#',
      },
    ],
    platform_status: [
      {
        id: 'status-degraded-cache',
        category: 'platform_status',
        updated_at: hoursAgo(1),
        title: 'Degraded cache performance in one region',
        source_tag: 'Status Page',
        key_points: [
          'p95 cache latency rose to 480ms for 22 minutes.',
          'Traffic was shifted to the secondary region automatically.',
          'Post-incident review scheduled for tomorrow.',
        ],
        highlights: [
          { label: 'Duration', value: '22 minutes' },
          { label: 'Impact', value: 'Read-heavy endpoints only' },
        ],
        severity: 'HIGH',
        url: '#',
      },
    ],
    product: [
      {
        id: 'product-shell-release',
        category: 'product',
        updated_at: hoursAgo(20),
        title: 'Dashboard shell v0.2 ships with the task board',
        source_tag: 'Release Notes',
        key_points: [
          'Delivery board, task board and intelligence feed are all mock-data ready.',
          'Dark mode now respects the system preference on first paint.',
          'Every section exposes an anchor route for deep linking.',
        ],
        url: '#',
      },
    ],
  },
}

/* -------------------------------------------------------------------------- */
/* Task board                                                                 */
/* -------------------------------------------------------------------------- */

export type MockTask = {
  id: string
  title: string
  status: 'open' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due: string
  project: string
}

export const mockTasks: MockTask[] = [
  {
    id: 'task-1',
    title: 'Replace the mock registry with typed adapters',
    status: 'in_progress',
    priority: 'high',
    due: '2026-02-14',
    project: 'api-gateway',
  },
  {
    id: 'task-2',
    title: 'Add empty / loading / error states to every card',
    status: 'open',
    priority: 'medium',
    due: '2026-02-18',
    project: 'design-system',
  },
  {
    id: 'task-3',
    title: 'Publish the static export deploy workflow',
    status: 'open',
    priority: 'high',
    due: '2026-02-20',
    project: 'core-platform',
  },
  {
    id: 'task-4',
    title: 'Write the contributor onboarding guide',
    status: 'done',
    priority: 'low',
    due: '2026-02-04',
    project: 'portfolio-site',
  },
  {
    id: 'task-5',
    title: 'Audit keyboard navigation on the launcher grid',
    status: 'open',
    priority: 'medium',
    due: '2026-02-24',
    project: 'design-system',
  },
]


/* -------------------------------------------------------------------------- */
/* Secret vault (UI demo only — these are NOT real credentials)               */
/* -------------------------------------------------------------------------- */

export type MockVaultEntry = {
  id: string
  label: string
  service: string
  maskedValue: string
  /** Obviously fake placeholder rendered when the row is revealed. */
  demoValue: string
}

export const mockVaultEntries: MockVaultEntry[] = [
  {
    id: 'vault-1',
    label: 'CI Deploy Token',
    service: 'Deploy Pipeline',
    maskedValue: '••••••••••••••••••••••••',
    demoValue: 'demo-token-not-a-real-secret-0001',
  },
  {
    id: 'vault-2',
    label: 'Analytics Read Key',
    service: 'Analytics API',
    maskedValue: '••••••••••••••••••••••••',
    demoValue: 'demo-key-not-a-real-secret-0002',
  },
  {
    id: 'vault-3',
    label: 'Object Storage Access',
    service: 'Storage Bucket',
    maskedValue: '••••••••••••••••••••••••',
    demoValue: 'demo-access-not-a-real-secret-0003',
  },
]

/* -------------------------------------------------------------------------- */
/* Knowledge hub seed                                                         */
/* -------------------------------------------------------------------------- */

export type MockKnowledgeNote = {
  id: string
  tag: string
  content: string
  savedAt: string
}

export const mockKnowledgeNotes: MockKnowledgeNote[] = [
  {
    id: 'note-1',
    tag: 'architecture',
    content:
      'The shell is intentionally backend-free: static export plus a mock registry means the UI can be reviewed before any API exists.',
    savedAt: '2026-02-05',
  },
  {
    id: 'note-2',
    tag: 'delivery',
    content:
      'Keep work in progress at three items per engineer. Smaller batches correlated with fewer carried-over tasks.',
    savedAt: '2026-02-04',
  },
  {
    id: 'note-3',
    tag: 'design-system',
    content:
      'Telemetry badges cover four states: live, loading, error and mock. Every data card should render all four.',
    savedAt: '2026-02-02',
  },
]

export const mockKnowledgeTags = [
  'unfiled',
  'architecture',
  'delivery',
  'design-system',
  'tooling',
  'research',
]

