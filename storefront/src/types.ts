export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  parent_id: number | null
  is_active: boolean
}

export interface Brand {
  id: number
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
}

export interface ProductImage {
  id: number
  image_url: string
  alt_text: string | null
  color: string | null
  sort_order: number
  is_primary: boolean
}

export interface ProductVariant {
  id: number
  size: string
  color: string
  stock_quantity: number
  extra_price: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  discount_price: number | null
  wholesale_price: number | null
  wholesale_min_qty: number
  sku: string
  gender: string
  category_id: number
  brand_id: number
  is_active: boolean
  is_featured: boolean
  created_at: string
  category: Category
  brand: Brand
  images: ProductImage[]
  variants: ProductVariant[]
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface User {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  role: 'customer' | 'wholesale' | 'admin' | 'superadmin' | string
  is_active: boolean
  company_name: string | null
  wholesale_status: string
  wallet_balance: number
  created_at: string
}

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

export interface Address {
  id: number
  full_name: string
  phone_number: string
  city: string
  address_line: string
  postal_code: string
  is_default: boolean
}

export type AddressInput = Omit<Address, 'id'>

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

export interface CheckoutInput {
  shipping_full_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_postal_code: string
  payment_method: 'cod' | 'wallet' | string
  coupon_code?: string
  notes?: string
}

export interface WalletTransaction {
  id: number
  tx_type: string
  amount: number
  balance_after: number
  description: string | null
  created_at: string
}

export interface Review {
  id: number
  product_id: number
  customer_name: string | null
  rating: number
  comment: string | null
  created_at: string
}
