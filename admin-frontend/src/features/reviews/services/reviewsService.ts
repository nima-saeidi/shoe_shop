import { apiClient } from '@/services/apiClient'
import type { Page } from '@/types'
import type { Review } from '../types'

export const reviewsService = {
  async list(page = 1, pageSize = 20): Promise<Page<Review>> {
    const { data } = await apiClient.get<Page<Review>>('/admin/reviews', { params: { page, page_size: pageSize } })
    return data
  },

  async moderate(id: number, isApproved: boolean): Promise<Review> {
    const { data } = await apiClient.put<Review>(`/admin/reviews/${id}`, { is_approved: isApproved })
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/reviews/${id}`)
  },
}
