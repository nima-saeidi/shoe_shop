import { apiClient } from '@/services/apiClient'
import type { AuthTokens, CurrentUser, LoginInput } from '../types'

export const authService = {
  async login({ email, password }: LoginInput): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>('/auth/login', { email, password })
    return data
  },

  async getCurrentUser(): Promise<CurrentUser> {
    const { data } = await apiClient.get<CurrentUser>('/users/me')
    return data
  },
}
