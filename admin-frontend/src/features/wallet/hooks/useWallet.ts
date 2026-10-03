import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { walletService } from '../services/walletService'
import type { WalletTopupInput } from '../types'

export const walletKeys = {
  all: ['wallet'] as const,
  search: (q: string) => [...walletKeys.all, 'search', q] as const,
  detail: (userId: number) => [...walletKeys.all, 'detail', userId] as const,
}

/** Customer search; only runs once at least two characters were typed. */
export function useWalletUserSearch(q: string) {
  return useQuery({
    queryKey: walletKeys.search(q),
    queryFn: () => walletService.searchUsers(q),
    enabled: q.length > 1,
  })
}

export function useWalletDetail(userId: number) {
  return useQuery({ queryKey: walletKeys.detail(userId), queryFn: () => walletService.getDetail(userId) })
}

export function useTopupWallet(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: WalletTopupInput) => walletService.topup(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
