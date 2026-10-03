import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { couponsService } from '../services/couponsService'
import type { Coupon } from '../types'

export const couponKeys = {
  all: ['coupons'] as const,
}

export function useCoupons() {
  return useQuery({ queryKey: couponKeys.all, queryFn: () => couponsService.list(1, 100) })
}

function useInvalidateCoupons() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: couponKeys.all })
}

export function useCreateCoupon() {
  const invalidate = useInvalidateCoupons()
  return useMutation({ mutationFn: couponsService.create, onSuccess: invalidate })
}

export function useToggleCoupon() {
  const invalidate = useInvalidateCoupons()
  return useMutation({
    mutationFn: (coupon: Coupon) => couponsService.update(coupon.id, { is_active: !coupon.is_active }),
    onSuccess: invalidate,
  })
}

export function useDeleteCoupon() {
  const invalidate = useInvalidateCoupons()
  return useMutation({ mutationFn: couponsService.remove, onSuccess: invalidate })
}
