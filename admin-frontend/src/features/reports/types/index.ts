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
