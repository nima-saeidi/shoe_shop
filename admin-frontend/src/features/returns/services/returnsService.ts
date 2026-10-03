import { apiClient } from '@/services/apiClient'
import type { ReturnRequestItem, ReturnStatus } from '../types'

export const returnsService = {
  async list(status?: string): Promise<ReturnRequestItem[]> {
    const { data } = await apiClient.get<ReturnRequestItem[]>('/returns', { params: status ? { status } : undefined })
    return data
  },

  async moderate(id: number, status: ReturnStatus, adminNote?: string): Promise<ReturnRequestItem> {
    const { data } = await apiClient.put<ReturnRequestItem>(`/returns/${id}`, { status, admin_note: adminNote })
    return data
  },
}
