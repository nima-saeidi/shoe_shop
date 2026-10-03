import { serverHttp } from '../server-http'
import type { Category, Page, Product, Review } from '@/types'

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

// Catalog reads run on the server (SSR/ISR). Failures degrade to empty data so a backend hiccup
// never takes the whole storefront down.
export async function getProducts(query: ProductQuery = {}): Promise<Page<Product>> {
  try {
    const { data } = await serverHttp.get<Page<Product>>('/products', { params: query })
    return data
  } catch {
    return { items: [], total: 0, page: 1, page_size: query.page_size ?? 20, pages: 1 }
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data } = await serverHttp.get<Product>(`/products/slug/${encodeURIComponent(slug)}`)
    return data.is_active ? data : null
  } catch {
    return null
  }
}

export async function getReviews(productId: number): Promise<Review[]> {
  try {
    const { data } = await serverHttp.get<Page<Review>>(`/products/${productId}/reviews`, { params: { page_size: 20 } })
    return data.items
  } catch {
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await serverHttp.get<Page<Category>>('/categories', { params: { page_size: 100 } })
    return data.items.filter((c) => c.is_active)
  } catch {
    return []
  }
}
