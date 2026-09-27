/**
 * Portfolio telemetry math.
 *
 * Field names are deliberately generic so the template ships with neutral mock
 * numbers instead of anyone's real broker accounts.
 */
export const WEALTH_MILESTONES = {
  short: 1_600_000,
  mid: 3_000_000,
  long: 5_000_000,
} as const

export const WEALTH_TELEMETRY_FIELDS = [
  'brokerage',
  'savings',
  'checking',
  'loanPrimary',
  'loanSecondary',
  'retirement',
] as const

export type WealthTelemetryField = (typeof WEALTH_TELEMETRY_FIELDS)[number]

export type WealthTelemetryInput = {
  brokerage: number
  savings: number
  checking: number
  loanPrimary: number
  loanSecondary: number
  retirement: number
  note?: string
}

export type WealthTelemetryComputed = {
  totalLiquid: number
  totalLoan: number
  netLiquid: number
  trueNetWorth: number
  shortProgress: number
  midProgress: number
  longProgress: number
}

export type WealthTelemetrySnapshot = WealthTelemetryInput &
  WealthTelemetryComputed & {
    updatedAt: string
  }

export function milestoneProgress(trueNetWorth: number, target: number): number {
  if (!Number.isFinite(trueNetWorth) || !Number.isFinite(target) || target <= 0) {
    return 0
  }
  return Math.min(100, Math.round((trueNetWorth / target) * 10000) / 100)
}

export function computeWealthMetrics(input: WealthTelemetryInput): WealthTelemetryComputed {
  const totalLiquid = input.brokerage + input.savings + input.checking
  const totalLoan = input.loanPrimary + input.loanSecondary
  const netLiquid = totalLiquid - totalLoan
  const trueNetWorth = netLiquid + input.retirement
  return {
    totalLiquid,
    totalLoan,
    netLiquid,
    trueNetWorth,
    shortProgress: milestoneProgress(trueNetWorth, WEALTH_MILESTONES.short),
    midProgress: milestoneProgress(trueNetWorth, WEALTH_MILESTONES.mid),
    longProgress: milestoneProgress(trueNetWorth, WEALTH_MILESTONES.long),
  }
}

export function buildWealthSnapshot(
  input: WealthTelemetryInput,
  updatedAt = new Date().toISOString(),
): WealthTelemetrySnapshot {
  const note = input.note?.trim()
  return {
    ...input,
    ...computeWealthMetrics(input),
    ...(note ? { note } : {}),
    updatedAt,
  }
}

export function readFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

export function parseWealthTelemetryInput(value: unknown): WealthTelemetryInput {
  const params =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}

  const input = {} as WealthTelemetryInput
  for (const field of WEALTH_TELEMETRY_FIELDS) {
    const amount = readFiniteNumber(params[field])
    if (amount === undefined) {
      throw Object.assign(new Error(`${field} must be a finite number`), { code: -32602 })
    }
    input[field] = amount
  }

  if (params.note !== undefined && params.note !== null) {
    if (typeof params.note !== 'string') {
      throw Object.assign(new Error('note must be a string'), { code: -32602 })
    }
    const note = params.note.trim()
    if (note) input.note = note
  }

  return input
}
