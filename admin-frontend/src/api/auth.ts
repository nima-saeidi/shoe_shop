import { apiClient } from './client'
import type { AuthTokens, CurrentUser } from '../types'

export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/login', { email, password })
  return data
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>('/users/me')
  return data
}
