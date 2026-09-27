'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

import { DEFAULT_THEME, THEME_STORAGE_KEY } from '@/lib/theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={DEFAULT_THEME}
      enableSystem={false}
      forcedTheme={undefined}
      storageKey={THEME_STORAGE_KEY}
    >
      {children}
    </NextThemesProvider>
  )
}
