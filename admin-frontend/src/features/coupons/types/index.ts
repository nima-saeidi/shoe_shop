export type DiscountType = 'percent' | 'fixed'

export interface Coupon {
  id: number
  code: string
  discount_type: DiscountType
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  used_count: number
  is_active: boolean
  valid_from: string | null
  valid_until: string | null
}

export interface CouponInput {
  code: string
  discount_type: DiscountType
  discount_value: number
  min_order_amount: number
  max_uses?: number | null
  is_active: boolean
  valid_from?: string | null
  valid_until?: string | null
}

export type CouponUpdateInput = Partial<Omit<CouponInput, 'code' | 'discount_type'>>
