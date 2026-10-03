import { apiClient } from './client'
import type { Category, CategoryInput, Page } from '../types'

export async function listCategories(page = 1, pageSize = 100): Promise<Page<Category>> {
  const { data } = await apiClient.get<Page<Category>>('/categories', { params: { page, page_size: pageSize } })
  return data
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data } = await apiClient.post<Category>('/categories', input)
  return data
}

export async function updateCategory(id: number, input: Partial<CategoryInput>): Promise<Category> {
  const { data } = await apiClient.put<Category>(`/categories/${id}`, input)
  return data
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}
