/**
 * Single source of truth for template branding.
 *
 * Everything user-facing that used to be hardcoded to a private workspace lives
 * here. Fork the repo, edit this file, and the whole shell rebrands.
 */
export const siteConfig = {
  /** Full product name shown in metadata, footer, and architecture modal. */
  name: 'Developer Mission Control',
  /** Short name used by the PWA manifest. */
  shortName: 'Mission Control',
  /** Two-letter monogram rendered in the nav / app icon. */
  monogram: 'MC',
  /** One-line promise shown on the login screen. */
  tagline: 'Your work, in one orbit',
  /** Longer blurb for metadata / README-style surfaces. */
  description:
    'A decoupled, backend-agnostic dashboard shell for engineering teams. Ships with mock data so it renders beautifully before you connect a single API.',
  /** Repo / deployment label rendered in the footer. */
  footerLabel: 'developer-portal-template',
  /** Fake session shown in the shell when no auth provider is wired up. */
  operator: {
    id: 'operator',
    name: 'Mission Operator',
    email: 'operator@example.com',
  },
  /** Focus chip rendered in the hero cover. */
  focusChip: 'Quarter Focus: Platform Reliability & Delivery',
  /** Locale + timezone used by every clock / date formatter in the shell. */
  locale: 'en-US',
  timeZone: 'UTC',
  /** Label for the mocked weather card. */
  weatherLocation: 'Metro City',
  /** Prefix used for every localStorage key so forks never collide. */
  storagePrefix: 'developer-portal',
} as const

export type SiteConfig = typeof siteConfig
