import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAdminRole, useAuthStore } from '@/app/store/authStore'
import { authService } from '../services/authService'
import type { LoginInput } from '../types'

export class NotAdminError extends Error {}

/** Logs in, then verifies the account is an admin before keeping the session. */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { silent: true },
    mutationFn: async (input: LoginInput) => {
      const { setTokens, setUser, logout } = useAuthStore.getState()
      const tokens = await authService.login(input)
      setTokens(tokens.access_token, tokens.refresh_token)
      const user = await authService.getCurrentUser()
      if (!isAdminRole(user.role)) {
        logout()
        throw new NotAdminError('این حساب دسترسی ادمین ندارد.')
      }
      setUser(user)
      return user
    },
    // A previous admin's cached data must never leak into the next session.
    onSuccess: () => queryClient.clear(),
  })
}
