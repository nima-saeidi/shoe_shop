import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrentUser } from '../types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: CurrentUser | null
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: CurrentUser) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      isAdmin: () => {
        const role = get().user?.role
        return role === 'admin' || role === 'superadmin'
      },
    }),
    {
      name: 'shoe-shop-admin-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
