/**
 * Provider-agnostic auth types.
 *
 * The template ships with a local mock session so the shell renders instantly.
 * Swap the provider for NextAuth / Cognito / Clerk later without touching any
 * dashboard component — they only depend on this contract.
 */
export type WorkspaceUser = {
  id?: string
  email: string
  name: string
  image?: string | null
}

export type WorkspaceAuthState = {
  user: WorkspaceUser | null
  isAuthenticated: boolean
  isLoading: boolean
  /**
   * True while the shell renders bundled mock data instead of a live API.
   * Every dashboard section keys off this flag, so a fork can flip it to
   * `false` in one place once a real backend is wired up.
   */
  isMockData: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}
