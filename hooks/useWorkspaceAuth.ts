'use client'

import { useWorkspaceAuthContext } from '@/components/providers/workspace-auth-provider'
import type { WorkspaceAuthState } from '@/lib/auth/types'

/**
 * Decoupled workspace auth hook.
 *
 * UI components use this hook to access client-side auth context.
 */
export function useWorkspaceAuth(): WorkspaceAuthState {
  return useWorkspaceAuthContext()
}
