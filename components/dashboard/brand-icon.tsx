'use client'

import type { ToolBrand } from '@/config/tools'

type BrandIconProps = {
  brand: ToolBrand
  className?: string
  draggable?: boolean
}

/**
 * Brand tile.
 *
 * Renders a monogram tile instead of third-party logos, which keeps this
 * template free of trademark assets while still giving every tool a recognisable
 * colour and initials. Swap in your own icon set if you own the marks.
 */
const BRAND_TILES: Record<ToolBrand, { label: string; bg: string; textClass?: string }> = {
  stripe: { label: 'S', bg: 'bg-[#635BFF]' },
  chase: { label: 'C', bg: 'bg-[#117ACA]' },
  robinhood: { label: 'R', bg: 'bg-[#00C805]', textClass: 'text-slate-950' },
  revolut: { label: 'R', bg: 'bg-slate-950' },
  brex: { label: 'B', bg: 'bg-[#F36B21]' },
  workday: { label: 'W', bg: 'bg-[#0875E1]' },
  salesforce: { label: 'SF', bg: 'bg-[#00A1E0]' },
  servicenow: { label: 'SN', bg: 'bg-[#81B5A1]', textClass: 'text-slate-950' },
  jira: { label: 'J', bg: 'bg-[#0052CC]' },
  figma: { label: 'F', bg: 'bg-gradient-to-br from-[#F24E1E] via-[#A259FF] to-[#0ACF83]' },
  linear: { label: 'L', bg: 'bg-slate-950' },
  notion: { label: 'N', bg: 'bg-slate-200', textClass: 'text-slate-900' },
  box: { label: 'BX', bg: 'bg-[#0061D5]' },
  cloudflare: { label: 'CF', bg: 'bg-[#F38020]' },
  gcp: { label: 'GC', bg: 'bg-[#4285F4]' },
  aws: { label: 'AW', bg: 'bg-[#FF9900]', textClass: 'text-slate-950' },
  github: { label: 'GH', bg: 'bg-slate-900' },
  datadog: { label: 'DD', bg: 'bg-[#632CA6]' },
  postman: { label: 'PM', bg: 'bg-[#FF6C37]' },
  docker: { label: 'DK', bg: 'bg-[#2496ED]' },
  vercel: { label: '▲', bg: 'bg-slate-950' },
  supabase: { label: 'SB', bg: 'bg-[#3ECF8E]', textClass: 'text-slate-950' },
  claude: { label: 'CL', bg: 'bg-[#D4A27F]', textClass: 'text-slate-950' },
  openai: { label: 'AI', bg: 'bg-slate-800' },
  perplexity: { label: 'PX', bg: 'bg-[#20808D]' },
  slack: { label: 'SL', bg: 'bg-[#4A154B]' },
  zoom: { label: 'Z', bg: 'bg-[#2D8CFF]' },
  gmail: { label: 'GM', bg: 'bg-[#EA4335]' },
}

export function BrandIcon({ brand, className = '', draggable = false }: BrandIconProps) {
  const tile = BRAND_TILES[brand]

  return (
    <span
      role="img"
      aria-label={brand}
      draggable={draggable}
      className={`grid shrink-0 place-items-center rounded-2xl ${tile?.bg ?? 'bg-slate-800'} ${className}`}
    >
      <span className={`text-sm font-black tracking-tight ${tile?.textClass ?? 'text-white'}`}>
        {tile?.label ?? '•'}
      </span>
    </span>
  )
}
