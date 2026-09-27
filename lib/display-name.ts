import { siteConfig } from '@/config/site'
import type { WorkspaceUser } from '@/lib/auth/types'

type NameSource = Pick<WorkspaceUser, 'name' | 'email'> | { name?: string; email?: string }

const FALLBACK_NAME = siteConfig.operator.name

export function getDisplayName(user: NameSource): string {
  const name = user.name?.trim()
  if (name) return name

  const emailPrefix = user.email?.split('@')[0]?.trim()
  if (emailPrefix) return emailPrefix

  return FALLBACK_NAME
}

export function getGreetingName(user: NameSource): string {
  const displayName = getDisplayName(user)
  const firstName = displayName.split(/\s+/)[0]
  return firstName || FALLBACK_NAME
}
