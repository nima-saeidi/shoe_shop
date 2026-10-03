import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { returnsService } from '../services/returnsService'

export const returnKeys = {
  all: ['returns'] as const,
}

export function useMyReturns() {
  return useQuery({ queryKey: returnKeys.all, queryFn: returnsService.mine })
}

export function useCreateReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: returnsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: returnKeys.all }),
  })
}
