export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed'
export type ReturnReason = 'wrong_size' | 'defective' | 'not_as_described' | 'changed_mind' | 'other'

export interface ReturnRequestItem {
  id: number
  order_id: number
  order_item_id: number
  reason: ReturnReason
  description: string | null
  status: ReturnStatus
  admin_note: string | null
  created_at: string
  order_number: string | null
  product_name: string | null
  size: string | null
  color: string | null
  customer_name: string | null
}
