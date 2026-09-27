/**
 * Contract / subscription lifecycle types + generic seed catalog.
 */
export type ContractCategory =
  | 'Telecom'
  | 'Cloud & Dev'
  | 'AI Systems'
  | 'SaaS'
  | 'Utilities'
  | 'Personal'

export type ContractUrgency = 'active' | 'recontract' | 'urgent'

export type ContractItem = {
  id: string
  name: string
  category: ContractCategory
  statusLabel: string
  urgency: ContractUrgency
  costLabel: string
  scheduleLabel: string
  /** Remaining days until end; null means auto-renew / open-ended. */
  daysRemaining: number | null
}

export const contractCategoryOptions = [
  'Telecom',
  'SaaS',
  'Cloud',
  'Utilities',
  'Personal',
] as const

export const mockContracts: ContractItem[] = [
  {
    id: 'fiber-broadband',
    name: 'Fibre Broadband 1000M',
    category: 'Telecom',
    statusLabel: 'Re-contract window',
    urgency: 'recontract',
    costLabel: 'US$ 48/mo',
    scheduleLabel: 'Ends in 48 days',
    daysRemaining: 48,
  },
  {
    id: 'edge-platform',
    name: 'Edge Platform Paid Plan',
    category: 'Cloud & Dev',
    statusLabel: 'Active',
    urgency: 'active',
    costLabel: 'US$ 5/mo',
    scheduleLabel: 'Auto-renews next month',
    daysRemaining: null,
  },
  {
    id: 'mobile-5g',
    name: 'Mobile 5G Plan',
    category: 'Telecom',
    statusLabel: 'Renewal urgency',
    urgency: 'urgent',
    costLabel: 'US$ 32/mo',
    scheduleLabel: 'Ends in 12 days',
    daysRemaining: 12,
  },
  {
    id: 'ai-assistant-seat',
    name: 'AI Assistant Seat',
    category: 'AI Systems',
    statusLabel: 'Active',
    urgency: 'active',
    costLabel: 'US$ 20/mo',
    scheduleLabel: 'Monthly',
    daysRemaining: null,
  },
  {
    id: 'team-workspace',
    name: 'Team Workspace Starter',
    category: 'SaaS',
    statusLabel: 'Active',
    urgency: 'active',
    costLabel: 'US$ 7/user/mo',
    scheduleLabel: 'Auto-renews annually',
    daysRemaining: null,
  },
]

export type CostCadence = 'monthly' | 'annual'

export type CancelledService = {
  id: string
  name: string
  amount: number
  cadence: CostCadence
  cancelledOn: string
  notes: string
}

export const CANCELLED_SERVICES_STORAGE_KEY = 'developer-portal.cancelled-services'
