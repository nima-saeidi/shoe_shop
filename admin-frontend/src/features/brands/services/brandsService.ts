import { apiClient } from '@/services/apiClient'
import type { Page } from '@/types'
import type { Brand, BrandInput } from '../types'

export const brandsService = {
  async list(page = 1, pageSize = 100): Promise<Page<Brand>> {
    const { data } = await apiClient.get<Page<Brand>>('/brands', { params: { page, page_size: pageSize } })
    return data
  },

  async create(input: BrandInput): Promise<Brand> {
    const { data } = await apiClient.post<Brand>('/brands', input)
    return data
  },

  async update(id: number, input: Partial<BrandInput>): Promise<Brand> {
    const { data } = await apiClient.put<Brand>(`/brands/${id}`, input)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/brands/${id}`)
  },

  async uploadLogo(id: number, file: File): Promise<Brand> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post<Brand>(`/brands/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
