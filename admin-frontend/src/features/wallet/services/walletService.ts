import { apiClient } from './client'
import type { WalletDetail, WalletUserSummary } from '../types'

export async function searchWalletUsers(q: string): Promise<WalletUserSummary[]> {
  const { data } = await apiClient.get<WalletUserSummary[]>('/wallet/users/search', { params: { q } })
  return data
}

export async function getWalletDetail(userId: number): Promise<WalletDetail> {
  const { data } = await apiClient.get<WalletDetail>(`/wallet/users/${userId}`)
  return data
}

export async function topupWallet(userId: number, amount: number, description?: string): Promise<void> {
  await apiClient.post(`/wallet/${userId}/topup`, { amount, description })
}
