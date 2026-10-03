import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService } from '../services/usersService'
import type { AdminUserUpdateInput } from '../types'

export const userKeys = {
  all: ['users'] as const,
  list: (page: number) => [...userKeys.all, page] as const,
}

export function useUsers(page: number) {
  return useQuery({ queryKey: userKeys.list(page), queryFn: () => usersService.list(page, 20), placeholderData: keepPreviousData })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdminUserUpdateInput }) => usersService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}
