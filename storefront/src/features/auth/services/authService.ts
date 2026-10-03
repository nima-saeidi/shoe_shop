import { apiClient } from '@/services/apiClient'
import type { AuthTokens, ChangePasswordInput, LoginInput, ProfileUpdateInput, RegisterInput, User } from '../types'

export const authService = {
  login: (input: LoginInput) => apiClient.post<AuthTokens>('/auth/login', input).then((r) => r.data),
  register: (input: RegisterInput) => apiClient.post<User>('/auth/register', input).then((r) => r.data),
  me: () => apiClient.get<User>('/users/me').then((r) => r.data),
  updateMe: (input: ProfileUpdateInput) => apiClient.put<User>('/users/me', input).then((r) => r.data),
  changePassword: (input: ChangePasswordInput) => apiClient.post('/users/me/change-password', input).then((r) => r.data),
}
