import { apiClient } from './client'
import type { Coupon, CouponInput, CouponUpdateInput, Page } from '../types'

export async function listCoupons(page = 1, pageSize = 50): Promise<Page<Coupon>> {
  const { data } = await apiClient.get<Page<Coupon>>('/coupons', { params: { page, page_size: pageSize } })
  return data
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  const { data } = await apiClient.post<Coupon>('/coupons', input)
  return data
}

export async function updateCoupon(id: number, input: CouponUpdateInput): Promise<Coupon> {
  const { data } = await apiClient.put<Coupon>(`/coupons/${id}`, input)
  return data
}

export async function deleteCoupon(id: number): Promise<void> {
  await apiClient.delete(`/coupons/${id}`)
}
