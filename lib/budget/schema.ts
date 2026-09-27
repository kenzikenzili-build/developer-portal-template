/**
 * Cash-flow telemetry schema.
 *
 * Category keys are generic operations buckets. Swap the mock numbers in
 * `config/mockData.ts` for your own feed and keep this contract.
 */
export const BUDGET_CATEGORY_KEYS = ['infrastructure', 'tooling', 'teamCards'] as const

export type BudgetCategoryKey = (typeof BUDGET_CATEGORY_KEYS)[number]

export type BudgetCategoryAmounts = {
  label: string
  spent: number
  limit?: number
}

export type BudgetCategories = Record<BudgetCategoryKey, BudgetCategoryAmounts>

export type NextBill = {
  date: string
  task: string
}

export type BudgetTelemetryInput = {
  month: string
  income: number
  totalExpense: number
  netCashFlow: number
  categories: BudgetCategories
  nextBill: NextBill
}

export type BudgetTelemetrySnapshot = BudgetTelemetryInput & {
  updatedAt: string
}

export const BUDGET_CATEGORY_META: Record<
  BudgetCategoryKey,
  { defaultLabel: string; color: string }
> = {
  infrastructure: { defaultLabel: 'Cloud & Infrastructure', color: '#0f172a' },
  tooling: { defaultLabel: 'SaaS Tooling', color: '#334155' },
  teamCards: { defaultLabel: 'Team Cards', color: '#dc2626' },
}

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/
const DAY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const OVER_LIMIT_COLOR = '#dc2626'
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function invalid(message: string): never {
  throw Object.assign(new Error(message), { code: -32602 })
}

export function readFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

export function parseMonth(value: unknown): string {
  if (typeof value !== 'string' || !MONTH_PATTERN.test(value.trim())) {
    invalid('month must be a YYYY-MM string')
  }
  return value.trim()
}

function parseDay(value: unknown, field: string): string {
  if (typeof value !== 'string' || !DAY_PATTERN.test(value.trim())) {
    invalid(`${field} must be a YYYY-MM-DD string`)
  }
  return value.trim()
}

export function parseCategoryAmounts(value: unknown, key: BudgetCategoryKey): BudgetCategoryAmounts {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    invalid(`categories.${key} must be an object with spent`)
  }
  const record = value as Record<string, unknown>
  const spent = readFiniteNumber(record.spent)
  if (spent === undefined) invalid(`categories.${key}.spent must be a finite number`)

  const label =
    typeof record.label === 'string' && record.label.trim()
      ? record.label.trim()
      : BUDGET_CATEGORY_META[key].defaultLabel

  const category: BudgetCategoryAmounts = { label, spent }
  if (record.limit !== undefined && record.limit !== null) {
    const limit = readFiniteNumber(record.limit)
    if (limit === undefined) invalid(`categories.${key}.limit must be a finite number`)
    category.limit = limit
  }
  return category
}

export function parseNextBill(value: unknown): NextBill {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    invalid('nextBill must be an object with date and task')
  }
  const record = value as Record<string, unknown>
  const date = parseDay(record.date, 'nextBill.date')
  if (typeof record.task !== 'string' || !record.task.trim()) {
    invalid('nextBill.task must be a non-empty string')
  }
  return { date, task: record.task.trim() }
}

export function parseBudgetTelemetryInput(value: unknown): BudgetTelemetryInput {
  const params =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}

  const month = parseMonth(params.month)
  const income = readFiniteNumber(params.income)
  const totalExpense = readFiniteNumber(params.totalExpense)
  if (income === undefined) invalid('income must be a finite number')
  if (totalExpense === undefined) invalid('totalExpense must be a finite number')

  const providedFlow = readFiniteNumber(params.netCashFlow)
  const netCashFlow = providedFlow === undefined ? income - totalExpense : providedFlow

  const rawCategories = params.categories
  if (!rawCategories || typeof rawCategories !== 'object' || Array.isArray(rawCategories)) {
    invalid('categories must be an object')
  }
  const categoryRecord = rawCategories as Record<string, unknown>

  const categories = {} as BudgetCategories
  for (const key of BUDGET_CATEGORY_KEYS) {
    categories[key] = parseCategoryAmounts(categoryRecord[key], key)
  }

  return {
    month,
    income,
    totalExpense,
    netCashFlow,
    categories,
    nextBill: parseNextBill(params.nextBill),
  }
}

export function isCategoryOverLimit(category: BudgetCategoryAmounts): boolean {
  return category.limit !== undefined && category.limit > 0 && category.spent > category.limit
}

export function categoryProgress(category: BudgetCategoryAmounts, fallbackMax: number): number {
  if (category.limit !== undefined && category.limit > 0) {
    return Math.min(100, (category.spent / category.limit) * 100)
  }
  if (!Number.isFinite(fallbackMax) || fallbackMax <= 0) {
    return 0
  }
  return Math.min(100, (category.spent / fallbackMax) * 100)
}

export function categoryBarColor(key: BudgetCategoryKey, category: BudgetCategoryAmounts): string {
  if (isCategoryOverLimit(category)) return OVER_LIMIT_COLOR
  return BUDGET_CATEGORY_META[key].color
}

export function formatNextBillDate(date: string): string {
  const match = DAY_PATTERN.exec(date.trim())
  if (!match) return date
  const monthIndex = Number(match[2]) - 1
  return `${MONTH_NAMES[monthIndex]} ${Number(match[3])}`
}

export function buildBudgetSnapshot(
  input: BudgetTelemetryInput,
  updatedAt = new Date().toISOString(),
): BudgetTelemetrySnapshot {
  return {
    ...input,
    updatedAt,
  }
}
