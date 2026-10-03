import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewsService } from '../services/reviewsService'

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (page: number) => [...reviewKeys.all, page] as const,
}

export function useReviews(page: number) {
  return useQuery({ queryKey: reviewKeys.list(page), queryFn: () => reviewsService.list(page, 20), placeholderData: keepPreviousData })
}

function useInvalidateReviews() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: reviewKeys.all })
}

export function useModerateReview() {
  const invalidate = useInvalidateReviews()
  return useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) => reviewsService.moderate(id, approved),
    onSuccess: invalidate,
  })
}

export function useDeleteReview() {
  const invalidate = useInvalidateReviews()
  return useMutation({ mutationFn: reviewsService.remove, onSuccess: invalidate })
}
