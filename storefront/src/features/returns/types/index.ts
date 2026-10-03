export interface ReturnRequest {
  id: number
  order_id: number
  order_item_id: number
  reason: string
  description: string | null
  status: string
  admin_note: string | null
  created_at: string
  order_number: string | null
  product_name: string | null
  size: string | null
  color: string | null
}

export interface ReturnCreateInput {
  order_item_id: number
  reason: string
  description?: string
}
