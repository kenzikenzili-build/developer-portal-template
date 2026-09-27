'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { siteConfig } from '@/config/site'
import type { WorkspaceAuthState, WorkspaceUser } from '@/lib/auth/types'

/**
 * localStorage key for the mocked session. Swap this provider for a real auth
 * provider and this key disappears.
 */
const AUTH_USER_KEY = `${siteConfig.storagePrefix}.session`

const MOCK_USER: WorkspaceUser = {
  id: siteConfig.operator.id,
  email: siteConfig.operator.email,
  name: siteConfig.operator.name,
}

const WorkspaceAuthContext = createContext<WorkspaceAuthState | null>(null)

/**
 * Mock session provider.
 *
 * The shell is authenticated by default so `npm run dev` paints the full
 * dashboard immediately. `logout()` drops the session and the dashboard
 * redirects to `/login`, which is the seam where a real provider would slot in.
 */
export function WorkspaceAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WorkspaceUser | null>(MOCK_USER)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_USER_KEY)
      if (raw === 'signed-out') {
        setUser(null)
      } else if (raw) {
        setUser(JSON.parse(raw) as WorkspaceUser)
      }
    } catch {
      // Ignore private-mode / quota failures and keep the default session.
    } finally {
      setIsHydrated(true)
    }
  }, [])

  const login = useCallback(async () => {
    setUser(MOCK_USER)
    try {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(MOCK_USER))
    } catch {
      // Ignore storage errors.
    }
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    try {
      window.localStorage.setItem(AUTH_USER_KEY, 'signed-out')
    } catch {
      // Ignore storage errors.
    }
  }, [])

  const value = useMemo<WorkspaceAuthState>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: !isHydrated,
      isMockData: true,
      login,
      logout,
    }),
    [isHydrated, login, logout, user],
  )

  return <WorkspaceAuthContext.Provider value={value}>{children}</WorkspaceAuthContext.Provider>
}

export function useWorkspaceAuthContext(): WorkspaceAuthState {
  const context = useContext(WorkspaceAuthContext)
  if (!context) {
    throw new Error('useWorkspaceAuth must be used within a WorkspaceAuthProvider')
  }
  return context
}
