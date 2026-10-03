import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/features/auth/types'
import { isTokenExpired } from '@/utils/jwt'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  /** true once the client has mounted (localStorage state is loaded synchronously by then) */
  hydrated: boolean
  /** true after the customer signed out on purpose (guards then leave the navigation to the logout) */
  signedOut: boolean
  setTokens: (access: string, refresh: string) => void
  setUser: (user: User | null) => void
  logout: () => void
  /** Deliberate sign-out from the UI; `logout` is the forced one (expired session). */
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hydrated: false,
      signedOut: false,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken, signedOut: false }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      signOut: () => set({ accessToken: null, refreshToken: null, user: null, signedOut: true }),
    }),
    {
      name: 'panik-auth',
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }),
    },
  ),
)

/** Signed in with a session that can still be renewed (false until the store is hydrated). */
export function useIsAuthenticated() {
  return useAuthStore((s) => s.hydrated && Boolean(s.accessToken) && !isTokenExpired(s.refreshToken))
}
