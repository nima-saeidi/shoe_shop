import { apiClient } from '@/services/apiClient'
import type { Page } from '@/types'
import type { Coupon, CouponInput, CouponUpdateInput } from '../types'

export const couponsService = {
  async list(page = 1, pageSize = 50): Promise<Page<Coupon>> {
    const { data } = await apiClient.get<Page<Coupon>>('/coupons', { params: { page, page_size: pageSize } })
    return data
  },

  async create(input: CouponInput): Promise<Coupon> {
    const { data } = await apiClient.post<Coupon>('/coupons', input)
    return data
  },

  async update(id: number, input: CouponUpdateInput): Promise<Coupon> {
    const { data } = await apiClient.put<Coupon>(`/coupons/${id}`, input)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/coupons/${id}`)
  },
}
