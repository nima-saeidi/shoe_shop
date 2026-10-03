import type { Order } from '@/features/orders/types'

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
