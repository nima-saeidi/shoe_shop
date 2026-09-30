import { apiClient } from './client'
import type { Brand, BrandInput, Page } from '../types'

export async function listBrands(page = 1, pageSize = 100): Promise<Page<Brand>> {
  const { data } = await apiClient.get<Page<Brand>>('/brands', { params: { page, page_size: pageSize } })
  return data
}

export async function createBrand(input: BrandInput): Promise<Brand> {
  const { data } = await apiClient.post<Brand>('/brands', input)
  return data
}

export async function updateBrand(id: number, input: Partial<BrandInput>): Promise<Brand> {
  const { data } = await apiClient.put<Brand>(`/brands/${id}`, input)
  return data
}

export async function deleteBrand(id: number): Promise<void> {
  await apiClient.delete(`/brands/${id}`)
}

export async function uploadBrandLogo(id: number, file: File): Promise<Brand> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<Brand>(`/brands/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
