import { apiClient } from './client'
import type { Page, Review } from '../types'

export async function listReviews(page = 1, pageSize = 20): Promise<Page<Review>> {
  const { data } = await apiClient.get<Page<Review>>('/admin/reviews', { params: { page, page_size: pageSize } })
  return data
}

export async function moderateReview(id: number, isApproved: boolean): Promise<Review> {
  const { data } = await apiClient.put<Review>(`/admin/reviews/${id}`, { is_approved: isApproved })
  return data
}

export async function deleteReview(id: number): Promise<void> {
  await apiClient.delete(`/admin/reviews/${id}`)
}
