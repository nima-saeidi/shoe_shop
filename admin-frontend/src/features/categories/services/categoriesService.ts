import { apiClient } from '@/services/apiClient'
import type { Page } from '@/types'
import type { Category, CategoryInput } from '../types'

export const categoriesService = {
  async list(page = 1, pageSize = 100): Promise<Page<Category>> {
    const { data } = await apiClient.get<Page<Category>>('/categories', { params: { page, page_size: pageSize } })
    return data
  },

  async create(input: CategoryInput): Promise<Category> {
    const { data } = await apiClient.post<Category>('/categories', input)
    return data
  },

  async update(id: number, input: Partial<CategoryInput>): Promise<Category> {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, input)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`)
  },
}
