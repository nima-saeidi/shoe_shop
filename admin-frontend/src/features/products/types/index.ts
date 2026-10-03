import type { Brand } from '@/features/brands/types'
import type { Category } from '@/features/categories/types'

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

export interface ProductListParams {
  q?: string
  category_id?: number
  brand_id?: number
  is_active?: boolean
  page?: number
  page_size?: number
}
