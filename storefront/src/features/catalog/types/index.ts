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

export interface Review {
  id: number
  product_id: number
  customer_name: string | null
  rating: number
  comment: string | null
  created_at: string
}

export interface ProductQuery {
  q?: string
  category_id?: number
  gender?: string
  min_price?: number
  max_price?: number
  is_featured?: boolean
  order_by?: string
  page?: number
  page_size?: number
}
