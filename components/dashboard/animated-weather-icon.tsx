'use client'

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'storm'

type AnimatedWeatherIconProps = {
  condition: WeatherCondition
  className?: string
}

/**
 * Enlarged SVG weather glyphs with bold strokes and lightweight CSS motion.
 */
export function AnimatedWeatherIcon({
  condition,
  className = 'h-14 w-14 sm:h-16 sm:w-16',
}: AnimatedWeatherIconProps) {
  switch (condition) {
    case 'clear':
      return (
        <span className={`relative grid place-items-center ${className}`} aria-hidden>
          <svg viewBox="0 0 64 64" className="size-full drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
            <g className="origin-center animate-[spin_12s_linear_infinite]">
              {Array.from({ length: 8 }).map((_, index) => {
                const angle = index * 45
                return (
                  <rect
                    key={angle}
                    x="29.5"
                    y="3"
                    width="5"
                    height="12"
                    rx="2.5"
                    fill="none"
                    stroke="#FCD34D"
                    strokeWidth="2"
                    transform={`rotate(${angle} 32 32)`}
                  />
                )
              })}
            </g>
            <circle cx="32" cy="32" r="13" fill="#FBBF24" />
            <circle cx="32" cy="32" r="8.5" fill="#FDE68A" />
          </svg>
        </span>
      )
    case 'partly-cloudy':
    case 'cloudy':
    case 'fog':
      return (
        <span className={`relative grid place-items-center ${className}`} aria-hidden>
          <svg viewBox="0 0 64 64" className="size-full overflow-visible">
            {condition === 'partly-cloudy' ? (
              <g className="origin-center animate-[spin_16s_linear_infinite]">
                <circle
                  cx="46"
                  cy="18"
                  r="8"
                  fill="#FBBF24"
                  className="drop-shadow-[0_0_10px_rgba(251,191,36,0.55)]"
                />
              </g>
            ) : null}
            <ellipse
              cx="26"
              cy="36"
              rx="17"
              ry="11"
              fill="rgba(148,163,184,0.45)"
              stroke="#E2E8F0"
              strokeWidth="2"
              className="animate-[cloud-drift_4s_ease-in-out_infinite]"
            />
            <ellipse
              cx="40"
              cy="34"
              rx="15"
              ry="10"
              fill="rgba(248,250,252,0.85)"
              stroke="#E2E8F0"
              strokeWidth="2"
              className="animate-[cloud-drift_4s_ease-in-out_infinite]"
              style={{ animationDelay: '0.6s' }}
            />
          </svg>
        </span>
      )
    case 'rain':
    case 'snow':
      return (
        <span className={`relative grid place-items-center ${className}`} aria-hidden>
          <svg viewBox="0 0 64 64" className="size-full overflow-visible">
            <g className="animate-ambient-float">
              <ellipse
                cx="32"
                cy="24"
                rx="17"
                ry="11"
                className="fill-slate-700/80 dark:fill-slate-800"
                stroke="#94A3B8"
                strokeWidth="2.5"
              />
              <ellipse
                cx="22"
                cy="27"
                rx="11"
                ry="8"
                className="fill-slate-700/70 dark:fill-slate-800"
                stroke="#94A3B8"
                strokeWidth="2"
              />
              <ellipse
                cx="42"
                cy="27"
                rx="12"
                ry="8"
                fill="rgba(226,232,240,0.9)"
                stroke="#CBD5E1"
                strokeWidth="2"
              />
            </g>
            {(condition === 'rain' ? [18, 28, 38, 48] : [22, 32, 42]).map((x, index) => (
              <line
                key={x}
                x1={x}
                y1="40"
                x2={x}
                y2={condition === 'rain' ? 56 : 50}
                stroke={condition === 'rain' ? '#38BDF8' : '#E2E8F0'}
                strokeWidth={condition === 'rain' ? 2.5 : 2}
                strokeLinecap="round"
                strokeDasharray={condition === 'rain' ? undefined : '1 3'}
                className="animate-rain-fall"
                style={{ animationDelay: `${index * 0.22}s` }}
              />
            ))}
          </svg>
        </span>
      )
    case 'storm':
      return (
        <span className={`relative grid place-items-center ${className}`} aria-hidden>
          <svg viewBox="0 0 64 64" className="size-full overflow-visible">
            <g className="animate-ambient-float">
              <ellipse
                cx="32"
                cy="22"
                rx="18"
                ry="12"
                className="fill-slate-700/80 dark:fill-slate-800"
                stroke="#64748B"
                strokeWidth="2.5"
              />
              <ellipse
                cx="21"
                cy="26"
                rx="12"
                ry="9"
                className="fill-slate-700/80 dark:fill-slate-800"
                stroke="#475569"
                strokeWidth="2.5"
              />
              <ellipse
                cx="43"
                cy="26"
                rx="13"
                ry="9"
                className="fill-slate-700/70 dark:fill-slate-800"
                stroke="#94A3B8"
                strokeWidth="2.5"
              />
            </g>
            <path
              d="M29 32 37 32 31 43 40 43 26 58 31 46 23 46Z"
              fill="#FBBF24"
              stroke="#FCD34D"
              strokeWidth="1.5"
              className="animate-lightning-flash drop-shadow-[0_0_16px_rgba(250,204,21,0.8)]"
            />
            {[20, 32, 44].map((x, index) => (
              <line
                key={x}
                x1={x}
                y1="42"
                x2={x}
                y2="56"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-rain-fall"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
            ))}
          </svg>
        </span>
      )
    default:
      return null
  }
}

export function weatherConditionFromCode(code: number): WeatherCondition {
  if (code === 0) return 'clear'
  if (code === 1 || code === 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if ([95, 96, 99].includes(code)) return 'storm'
  return 'cloudy'
}
