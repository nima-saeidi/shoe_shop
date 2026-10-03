import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MAX_PAGE_SIZE } from '@/services/apiClient'
import { categoriesService } from '../services/categoriesService'
import type { CategoryInput } from '../types'

export const categoryKeys = {
  all: ['categories'] as const,
}

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.all, queryFn: () => categoriesService.list(1, MAX_PAGE_SIZE) })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({ mutationFn: categoriesService.create, onSuccess: invalidate })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CategoryInput> }) => categoriesService.update(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({ mutationFn: categoriesService.remove, onSuccess: invalidate })
}
