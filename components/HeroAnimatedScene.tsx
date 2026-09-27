'use client'

import { cn } from '@/lib/utils'

/**
 * Cute chibi solid pictogram workstation — big head, stubby limbs,
 * desk, laptop, coffee, and minimalist bookshelf.
 */
export function HeroAnimatedScene({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'pointer-events-none relative flex h-full w-full items-center justify-center overflow-hidden',
        className,
      )}
    >
    <div
      className={cn(
        'relative h-full w-full',
        compact ? 'max-h-full max-w-full' : 'max-h-[220px] max-w-[620px]',
      )}
    >
      {compact ? null : (
        <>
          <span className="hero-dev-glyph hero-dev-glyph-1 text-slate-600 dark:text-slate-300">{`{}`}</span>
          <span className="hero-dev-glyph hero-dev-glyph-2 text-slate-600 dark:text-slate-300">{`</>`}</span>
          <span className="hero-dev-glyph hero-dev-glyph-3 text-slate-600 dark:text-slate-300">{`[]`}</span>
          <span className="hero-dev-glyph hero-dev-glyph-4 text-slate-600 dark:text-slate-300">{`=>`}</span>
        </>
      )}

      <svg
        viewBox={compact ? '250 28 270 186' : '0 0 700 240'}
        preserveAspectRatio={compact ? 'xMaxYMin meet' : 'xMidYMid meet'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full select-none"
      >
        {/* 1. Background Minimalist Bookshelf (Right Side) */}
        <g
          className="stroke-slate-400/50 dark:stroke-slate-600/50"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="420" y="35" width="85" height="135" rx="4" />
          <line x1="420" y1="80" x2="505" y2="80" />
          <line x1="420" y1="125" x2="505" y2="125" />
          <line x1="432" y1="78" x2="432" y2="50" strokeWidth="3" />
          <line x1="438" y1="78" x2="438" y2="52" strokeWidth="3" />
          <line x1="444" y1="78" x2="444" y2="48" strokeWidth="3" />
          <line x1="454" y1="78" x2="447" y2="54" strokeWidth="3" />
          <rect x="432" y="102" width="22" height="7" rx="1.5" className="fill-slate-400/30" />
          <rect x="430" y="111" width="26" height="7" rx="1.5" className="fill-slate-400/30" />
          <line x1="472" y1="123" x2="472" y2="92" strokeWidth="4" />
          <line x1="478" y1="123" x2="478" y2="95" strokeWidth="4" />
          <line x1="484" y1="123" x2="484" y2="90" strokeWidth="4" />
          <line x1="430" y1="170" x2="430" y2="185" />
          <line x1="495" y1="170" x2="495" y2="185" />
        </g>

        {/* 2. Sleek Workstation Desk */}
        <g>
          <rect
            x="250"
            y="145"
            width="250"
            height="5"
            rx="2.5"
            className="fill-slate-900 dark:fill-slate-200"
          />
          <line
            x1="475"
            y1="150"
            x2="495"
            y2="200"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-slate-900 dark:stroke-slate-200"
          />
          <line
            x1="265"
            y1="150"
            x2="255"
            y2="200"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-slate-900 dark:stroke-slate-200"
          />
        </g>

        {/* 3. Ergonomic Task Stool */}
        <g className="stroke-slate-900 dark:stroke-slate-200" strokeLinecap="round">
          <path d="M265 158 Q285 158 302 158" strokeWidth="6" />
          <line x1="283" y1="158" x2="283" y2="190" strokeWidth="4" />
          <line x1="262" y1="190" x2="304" y2="190" strokeWidth="3.5" />
          <circle cx="264" cy="194" r="2.5" className="fill-slate-900 dark:fill-slate-200" />
          <circle cx="302" cy="194" r="2.5" className="fill-slate-900 dark:fill-slate-200" />
        </g>

        {/* 4. Cute Chibi Solid Pictogram Figure */}
        <g className="character-root">
          <circle cx="295" cy="80" r="18" className="fill-slate-900 dark:fill-white" />
          <path
            d="M285 96 C276 112 274 134 282 150 C290 152 300 150 306 142 C302 128 300 110 298 96 Z"
            className="fill-slate-900 dark:fill-white"
          />
          <path
            d="M283 148 L296 156 L298 185"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-slate-900 dark:fill-none dark:stroke-white"
          />
          <path
            d="M294 148 L308 156 L310 185"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-slate-900 dark:fill-none dark:stroke-white"
          />
          <path
            d="M292 108 L310 134 L335 137"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="character-arms animate-pulse stroke-slate-900 dark:fill-none dark:stroke-white"
          />
        </g>

        {/* 5. Minimalist Open Laptop */}
        <g className="laptop-group">
          <rect
            x="330"
            y="141"
            width="46"
            height="4"
            rx="2"
            className="fill-slate-900 dark:fill-slate-200"
          />
          <line
            x1="368"
            y1="141"
            x2="384"
            y2="105"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-slate-900 dark:stroke-slate-200"
          />
          <line
            x1="365"
            y1="138"
            x2="379"
            y2="107"
            strokeWidth="1.5"
            className="stroke-sky-400"
          />
        </g>

        {/* 6. Coffee Mug with Rising Steam */}
        <g className="coffee-group">
          <rect
            x="395"
            y="132"
            width="13"
            height="13"
            rx="2.5"
            className="fill-slate-900 dark:fill-white"
          />
          <path
            d="M408 135 Q412 138 408 142"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-slate-900 dark:stroke-white"
          />
          <path
            d="M399 128 Q397 123 400 118 Q402 113 399 108"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="coffee-steam coffee-steam-1 stroke-slate-500/70 dark:stroke-slate-400"
          />
          <path
            d="M404 126 Q406 121 403 116 Q401 111 404 106"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="coffee-steam coffee-steam-2 stroke-slate-500/70 dark:stroke-slate-400"
          />
          <path
            d="M401 127 Q403 122 400 117 Q398 112 401 107"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="coffee-steam coffee-steam-3 stroke-slate-500/70 dark:stroke-slate-400"
          />
        </g>
      </svg>
    </div>
    </div>
  )
}
