// Shared domain types — mirror the backend Pydantic schemas (app/schemas/*.py).
// Keeping these hand-written (rather than codegen'd) is fine at this project size,
// but if the API surface grows much further, generating this file from the
// backend's OpenAPI schema (e.g. via openapi-typescript) would be the next step.

export type UserRole = 'customer' | 'wholesale' | 'admin' | 'superadmin'
export type WholesaleStatus = 'none' | 'pending' | 'approved' | 'rejected'
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
export type DiscountType = 'percent' | 'fixed'
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed'
export type ReturnReason = 'wrong_size' | 'defective' | 'not_as_described' | 'changed_mind' | 'other'
export type TicketStatus = 'open' | 'answered' | 'closed'
export type WalletTxType = 'topup' | 'deduct' | 'refund' | 'order_payment'
export type LogLevel = 'info' | 'warning' | 'error'

export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface CurrentUser {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  role: UserRole
  is_active: boolean
  company_name: string | null
  wholesale_status: WholesaleStatus
  wallet_balance: number
  created_at: string
}

// ---- Categories & Brands ----

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  parent_id: number | null
  is_active: boolean
}

export interface CategoryInput {
  name: string
  description?: string | null
  parent_id?: number | null
  is_active: boolean
}

export interface Brand {
  id: number
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
}

export interface BrandInput {
  name: string
  logo_url?: string | null
  is_active: boolean
}

// ---- Products ----

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

export interface ProductVariantInput {
  size: string
  color: string
  stock_quantity: number
  extra_price: number
}

export interface ProductInput {
  name: string
  description?: string | null
  price: number
  discount_price?: number | null
  wholesale_price?: number | null
  wholesale_min_qty: number
  sku: string
  gender: string
  category_id: number
  brand_id: number
  is_active: boolean
  is_featured: boolean
  variants?: ProductVariantInput[]
}

export type ProductUpdateInput = Partial<Omit<ProductInput, 'sku' | 'variants'>>

// ---- Orders ----

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

// ---- Coupons ----

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

// ---- Wholesale ----

export interface WholesaleRequest {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  company_name: string | null
  wholesale_status: WholesaleStatus
  wholesale_requested_at: string | null
}

// ---- Wallet ----

export interface WalletTransaction {
  id: number
  tx_type: WalletTxType
  amount: number
  balance_after: number
  description: string | null
  created_at: string
}

export interface WalletUserSummary {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  wallet_balance: number
}

export interface WalletDetail {
  user_id: number
  full_name: string
  balance: number
  transactions: WalletTransaction[]
}

// ---- Returns ----

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

// ---- Tickets ----

export interface TicketMessage {
  id: number
  sender_id: number
  sender_name: string | null
  is_admin: boolean
  message: string
  created_at: string
}

export interface Ticket {
  id: number
  subject: string
  status: TicketStatus
  created_at: string
  updated_at: string
  customer_name: string | null
  messages: TicketMessage[]
}

// ---- Users (admin) ----

export interface AdminUser {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  role: UserRole
  is_active: boolean
  company_name: string | null
  wallet_balance: number
  created_at: string
}

export interface AdminUserUpdateInput {
  role?: UserRole
  is_active?: boolean
}

// ---- Dashboard & Reports ----

export interface DashboardStats {
  total_orders: number
  total_users: number
  total_products: number
  total_revenue: number
  pending_orders: number
  pending_wholesale: number
  low_stock_count: number
  status_counts: Record<string, number>
  recent_orders: Order[]
}

export interface SalesDay {
  day: string
  revenue: number
  orders: number
}

export interface TopProduct {
  name: string
  qty: number
}

export interface TopSize {
  size: string
  qty: number
}

export interface LowStockVariant {
  id: number
  product_id: number
  product_name: string
  size: string
  color: string
  stock_quantity: number
}

export interface ReportsData {
  sales: SalesDay[]
  top_products: TopProduct[]
  top_sizes: TopSize[]
  revenue_split: { retail: number; wholesale: number }
  low_stock: LowStockVariant[]
}

// ---- Logs & Settings ----

export interface LogEntry {
  id: number
  level: LogLevel
  category: string
  action: string
  message: string
  actor_id: number | null
  actor_name: string | null
  target_type: string | null
  target_id: number | null
  ip_address: string | null
  created_at: string
}

export interface SettingsStatus {
  sms_configured: boolean
  sms_provider: string | null
  payment_configured: boolean
  payment_provider: string | null
}

// ---- Reviews ----

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
