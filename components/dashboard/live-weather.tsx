'use client'

import {
  AnimatedWeatherIcon,
  type WeatherCondition,
} from '@/components/dashboard/animated-weather-icon'
import { TelemetryBadge } from '@/components/TelemetryBadge'
import { mockWeather } from '@/config/mockData'
import { siteConfig } from '@/config/site'

/**
 * Weather card.
 *
 * Ships with mock values so the shell never blocks on a network call. Point this
 * at a real provider (any fetch in a `useEffect`) once you have one — the card
 * only needs `temperature`, `condition` and `label`.
 */
export function LiveWeather({ compact = false }: { compact?: boolean }) {
  const weather = mockWeather
  const condition = weather.condition as WeatherCondition

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={weather.label}>
        <AnimatedWeatherIcon condition={condition} className="h-4 w-4" />
        <span className="text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-100">
          {weather.temperature}°
        </span>
      </div>
    )
  }

  return (
    <div className="relative flex w-full min-w-0 max-w-full items-center gap-3 rounded-3xl border border-white/40 bg-white/70 p-3 shadow-sm backdrop-blur-xl sm:gap-4 sm:p-4 md:gap-6 md:p-7 lg:w-auto lg:min-w-[280px] dark:border-white/10 dark:bg-slate-900/40 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] dark:backdrop-blur-2xl">
      <div className="absolute right-2 top-2">
        <TelemetryBadge status="sandbox" />
      </div>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/60 p-2 shadow-inner sm:h-16 sm:w-16 md:h-24 md:w-24 md:p-3 dark:border-white/10 dark:bg-white/10">
        <AnimatedWeatherIcon condition={condition} className="h-9 w-9 sm:h-11 sm:w-11 md:h-16 md:w-16" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-600 md:text-sm dark:text-slate-300">
          {siteConfig.weatherLocation}
        </p>
        <p className="my-0.5 text-2xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
          {weather.temperature}°C
        </p>
        <p className="text-sm font-medium capitalize text-slate-600 dark:text-slate-300">
          {weather.label}
        </p>
        <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {weather.humidity} humidity · {weather.wind} wind
        </p>
      </div>
    </div>
  )
}
