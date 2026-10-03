export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderType = 'retail' | 'wholesale'

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
  user_id: number
  is_manual: boolean
  order_type: OrderType
  status: OrderStatus
  payment_status: PaymentStatus
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

export interface OrderStatusUpdateInput {
  status?: OrderStatus
  payment_status?: PaymentStatus
  shipping_provider?: string | null
  tracking_code?: string | null
}

export interface ManualOrderItemInput {
  variant_id: number
  quantity: number
}

export interface ManualOrderInput {
  user_id: number
  items: ManualOrderItemInput[]
  shipping_full_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_postal_code: string
  payment_method: string
  notes?: string | null
}

export interface OrderListParams {
  status?: string
  order_type?: string
  page?: number
  page_size?: number
}
