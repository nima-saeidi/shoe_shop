import { apiClient } from '@/services/apiClient'
import type { WalletBalance, WalletTransaction } from '../types'

export const walletService = {
  balance: () => apiClient.get<WalletBalance>('/wallet/balance').then((r) => r.data),
  transactions: () => apiClient.get<WalletTransaction[]>('/wallet/transactions').then((r) => r.data),
}
