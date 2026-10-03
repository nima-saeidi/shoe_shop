export interface CartItem {
  id: number
  variant_id: number
  quantity: number
  product_name: string
  size: string
  color: string
  unit_price: number
  line_total: number
  image_url: string | null
}

export interface Cart {
  id: number
  items: CartItem[]
  subtotal: number
  total_items: number
}
