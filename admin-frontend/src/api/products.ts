import { apiClient } from './client'
import type { Page, Product, ProductImage, ProductInput, ProductUpdateInput, ProductVariant, ProductVariantInput } from '../types'

export interface ProductListParams {
  q?: string
  category_id?: number
  brand_id?: number
  is_active?: boolean
  page?: number
  page_size?: number
}

export async function listProducts(params: ProductListParams = {}): Promise<Page<Product>> {
  const { data } = await apiClient.get<Page<Product>>('/admin/products', { params })
  return data
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`)
  return data
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', input)
  return data
}

export async function updateProduct(id: number, input: ProductUpdateInput): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/products/${id}`, input)
  return data
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}

export async function addVariant(productId: number, input: ProductVariantInput): Promise<ProductVariant> {
  const { data } = await apiClient.post<ProductVariant>(`/products/${productId}/variants`, input)
  return data
}

export async function deleteVariant(variantId: number): Promise<void> {
  await apiClient.delete(`/products/variants/${variantId}`)
}

export async function uploadProductImages(productId: number, files: File[], color?: string): Promise<ProductImage[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const { data } = await apiClient.post<ProductImage[]>(`/products/${productId}/images/bulk`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: color ? { color } : undefined,
  })
  return data
}

export async function deleteProductImage(imageId: number): Promise<void> {
  await apiClient.delete(`/products/images/${imageId}`)
}

export async function setPrimaryImage(productId: number, imageId: number): Promise<void> {
  await apiClient.put(`/products/${productId}/images/${imageId}/primary`)
}
