/**
 * Visual configuration for the portfolio telemetry card.
 * Swap the mock numbers in `config/mockData.ts` for your own feed.
 */
export type AssetSlice = {
  name: string
  value: number
  color: string
  /** Optional absolute amount label, used instead of a percentage. */
  amountLabel?: string
}

export type WealthConfig = {
  telemetryLabel: string
  budgetLabel: string
  amountPrefix: string
  netWorthLabel: string
  netWorthMasked: string
  ytdChange: string
  allocation: AssetSlice[]
}

export const wealthConfig: WealthConfig = {
  telemetryLabel: 'Portfolio Telemetry',
  budgetLabel: 'Monthly Cash Flow',
  amountPrefix: 'US$',
  netWorthLabel: 'US$ 1,284,500',
  netWorthMasked: 'US$ ••••••',
  ytdChange: 'Snapshot 2026-02-06',
  allocation: [
    { name: 'Brokerage', value: 68, color: '#64748b' },
    { name: 'Savings', value: 19, color: '#94a3b8' },
    { name: 'Checking', value: 13, color: '#cbd5e1' },
  ],
}
