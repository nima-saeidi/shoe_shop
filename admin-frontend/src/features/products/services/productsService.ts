import { apiClient } from '@/services/apiClient'
import type { Page } from '@/types'
import type {
  Product,
  ProductImage,
  ProductInput,
  ProductListParams,
  ProductUpdateInput,
  ProductVariant,
  ProductVariantInput,
} from '../types'

export const productsService = {
  async list(params: ProductListParams = {}): Promise<Page<Product>> {
    const { data } = await apiClient.get<Page<Product>>('/admin/products', { params })
    return data
  },

  async get(id: number): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`)
    return data
  },

  async create(input: ProductInput): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', input)
    return data
  },

  async update(id: number, input: ProductUpdateInput): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/products/${id}`, input)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`)
  },

  async addVariant(productId: number, input: ProductVariantInput): Promise<ProductVariant> {
    const { data } = await apiClient.post<ProductVariant>(`/products/${productId}/variants`, input)
    return data
  },

  async removeVariant(variantId: number): Promise<void> {
    await apiClient.delete(`/products/variants/${variantId}`)
  },

  async uploadImages(productId: number, files: File[], color?: string): Promise<ProductImage[]> {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    const { data } = await apiClient.post<ProductImage[]>(`/products/${productId}/images/bulk`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: color ? { color } : undefined,
    })
    return data
  },

  async removeImage(imageId: number): Promise<void> {
    await apiClient.delete(`/products/images/${imageId}`)
  },

  async setPrimaryImage(productId: number, imageId: number): Promise<void> {
    await apiClient.put(`/products/${productId}/images/${imageId}/primary`)
  },
}
