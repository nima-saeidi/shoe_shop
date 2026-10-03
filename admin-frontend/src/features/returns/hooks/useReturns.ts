import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { returnsService } from '../services/returnsService'
import type { ReturnStatus } from '../types'

export const returnKeys = {
  all: ['returns'] as const,
  list: (status?: string) => [...returnKeys.all, status ?? 'all'] as const,
}

export function useReturns(status?: string) {
  return useQuery({ queryKey: returnKeys.list(status), queryFn: () => returnsService.list(status) })
}

export function useModerateReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReturnStatus }) => returnsService.moderate(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: returnKeys.all }),
  })
}
