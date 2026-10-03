import { apiClient } from './client'
import type { AdminUser, AdminUserUpdateInput, Page } from '../types'

export async function listUsers(page = 1, pageSize = 20): Promise<Page<AdminUser>> {
  const { data } = await apiClient.get<Page<AdminUser>>('/admin/users', { params: { page, page_size: pageSize } })
  return data
}

export async function updateUser(id: number, input: AdminUserUpdateInput): Promise<AdminUser> {
  const { data } = await apiClient.put<AdminUser>(`/admin/users/${id}`, input)
  return data
}
