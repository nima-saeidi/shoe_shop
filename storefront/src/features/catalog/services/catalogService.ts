import { serverClient } from '@/services/serverClient'
import type { Page } from '@/types'
import type { Category, Product, ProductQuery, Review } from '../types'

// Catalog reads run on the server (SSR/ISR) so the pages are fully rendered for search engines.
// Failures degrade to empty data so a backend hiccup never takes the whole storefront down.
export const catalogService = {
  async getProducts(query: ProductQuery = {}): Promise<Page<Product>> {
    try {
      const { data } = await serverClient.get<Page<Product>>('/products', { params: query })
      return data
    } catch {
      return { items: [], total: 0, page: 1, page_size: query.page_size ?? 20, pages: 1 }
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const { data } = await serverClient.get<Product>(`/products/slug/${encodeURIComponent(slug)}`)
      return data.is_active ? data : null
    } catch {
      return null
    }
  },

  async getReviews(productId: number): Promise<Review[]> {
    try {
      const { data } = await serverClient.get<Page<Review>>(`/products/${productId}/reviews`, { params: { page_size: 20 } })
      return data.items
    } catch {
      return []
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const { data } = await serverClient.get<Page<Category>>('/categories', { params: { page_size: 100 } })
      return data.items.filter((c) => c.is_active)
    } catch {
      return []
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return (await catalogService.getCategories()).find((c) => c.slug === slug) ?? null
  },
}
