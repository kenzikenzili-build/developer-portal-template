import type { Metadata, Viewport } from 'next'
import { Fraunces, Manrope, Playfair_Display, Share_Tech_Mono } from 'next/font/google'

import { ArchitectureModal } from '@/components/ArchitectureModal'
import { CommandMenu } from '@/components/CommandMenu'
import { CustomCursorMount } from '@/components/custom-cursor-mount'
import { SystemModalProvider } from '@/components/providers/modal-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { WorkspaceAuthProvider } from '@/components/providers/workspace-auth-provider'
import { siteConfig } from '@/config/site'

import './globals.css'

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const artistic = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['400', '600', '700'],
  variable: '--font-artistic',
  display: 'swap',
})

const digital = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-digital',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.shortName,
  },
  icons: {
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#080E1A' },
  ],
}

/**
 * Build id injected by `next.config.mjs`. When a new deployment lands, stale
 * Cache Storage entries and previously registered service workers are purged so
 * clients can never get stuck on an old app shell.
 */
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev'

const CACHE_KILL_SWITCH = `
(function () {
  var BUILD_ID = ${JSON.stringify(BUILD_ID)};
  var VERSION_KEY = ${JSON.stringify(`${siteConfig.storagePrefix}.build-id`)};
  try {
    var previous = null;
    try { previous = window.localStorage.getItem(VERSION_KEY); } catch (e) {}
    if (previous !== BUILD_ID) {
      try { window.localStorage.setItem(VERSION_KEY, BUILD_ID); } catch (e) {}
      if ('caches' in window) {
        caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (key) { return caches.delete(key); }));
        }).catch(function () {});
      }
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (var i = 0; i < registrations.length; i++) {
          registrations[i].unregister();
        }
      }).catch(function () {});
    }
  } catch (err) {
    console.warn('[shell] cache kill-switch skipped', err);
  }
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${artistic.variable} ${digital.variable}`}
      suppressHydrationWarning
    >
      <body className="overflow-x-hidden bg-transparent antialiased">
        <script dangerouslySetInnerHTML={{ __html: CACHE_KILL_SWITCH }} />

        <ThemeProvider>
          <WorkspaceAuthProvider>
            <SystemModalProvider>
              {children}
              <CommandMenu />
              <ArchitectureModal />
            </SystemModalProvider>
          </WorkspaceAuthProvider>
        </ThemeProvider>
        <CustomCursorMount />
      </body>
    </html>
  )
}
