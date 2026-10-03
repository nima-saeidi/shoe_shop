import { useQuery } from '@tanstack/react-query'
import { walletService } from '../services/walletService'

export const walletKeys = {
  all: ['wallet'] as const,
  balance: ['wallet', 'balance'] as const,
  transactions: ['wallet', 'transactions'] as const,
}

export function useWalletBalance() {
  return useQuery({ queryKey: walletKeys.balance, queryFn: walletService.balance })
}

export function useWalletTransactions() {
  return useQuery({ queryKey: walletKeys.transactions, queryFn: walletService.transactions })
}
