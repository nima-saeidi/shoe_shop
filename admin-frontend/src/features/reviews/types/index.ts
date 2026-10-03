export interface Review {
  id: number
  product_id: number
  user_id: number
  product_name: string | null
  customer_name: string | null
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
}
