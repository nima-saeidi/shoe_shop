import { apiClient } from '@/services/apiClient'
import type { WalletDetail, WalletTopupInput, WalletUserSummary } from '../types'

export const walletService = {
  async searchUsers(q: string): Promise<WalletUserSummary[]> {
    const { data } = await apiClient.get<WalletUserSummary[]>('/wallet/users/search', { params: { q } })
    return data
  },

  async getDetail(userId: number): Promise<WalletDetail> {
    const { data } = await apiClient.get<WalletDetail>(`/wallet/users/${userId}`)
    return data
  },

  async topup(userId: number, { amount, description }: WalletTopupInput): Promise<void> {
    await apiClient.post(`/wallet/${userId}/topup`, { amount, description })
  },
}
