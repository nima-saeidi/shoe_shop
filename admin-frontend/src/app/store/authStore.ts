import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrentUser } from '@/features/auth/types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: CurrentUser | null
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: CurrentUser) => void
  logout: () => void
  isAdmin: () => boolean
}

export const isAdminRole = (role: string | undefined) => role === 'admin' || role === 'superadmin'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      isAdmin: () => isAdminRole(get().user?.role),
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
