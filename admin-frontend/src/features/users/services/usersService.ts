import { apiClient } from '@/services/apiClient'
import type { Page } from '@/types'
import type { AdminUser, AdminUserUpdateInput } from '../types'

export const usersService = {
  async list(page = 1, pageSize = 20): Promise<Page<AdminUser>> {
    const { data } = await apiClient.get<Page<AdminUser>>('/admin/users', { params: { page, page_size: pageSize } })
    return data
  },

  async update(id: number, input: AdminUserUpdateInput): Promise<AdminUser> {
    const { data } = await apiClient.put<AdminUser>(`/admin/users/${id}`, input)
    return data
  },
}
