export interface OrderItem {
  id: number
  product_name: string
  size: string
  color: string
  unit_price: number
  quantity: number
  line_total: number
}

export interface Order {
  id: number
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  subtotal: number
  discount_total: number
  shipping_cost: number
  grand_total: number
  shipping_full_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_postal_code: string
  shipping_provider: string | null
  tracking_code: string | null
  created_at: string
  items: OrderItem[]
}

export interface ShippingInfo {
  shipping_full_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_postal_code: string
}

export interface CheckoutInput extends ShippingInfo {
  payment_method: 'cod' | 'wallet' | string
  coupon_code?: string
  notes?: string
}
