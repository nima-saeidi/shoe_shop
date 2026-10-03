import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { wholesaleService } from '../services/wholesaleService'

export const wholesaleKeys = {
  all: ['wholesale-requests'] as const,
  list: (status: string) => [...wholesaleKeys.all, status] as const,
}

export function useWholesaleRequests(status: string) {
  return useQuery({ queryKey: wholesaleKeys.list(status), queryFn: () => wholesaleService.list(status) })
}

export function useDecideWholesale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, approve }: { userId: number; approve: boolean }) => wholesaleService.decide(userId, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wholesaleKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
