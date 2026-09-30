import { apiClient } from './client'
import type { ReturnRequestItem, ReturnStatus } from '../types'

export async function listReturns(status?: string): Promise<ReturnRequestItem[]> {
  const { data } = await apiClient.get<ReturnRequestItem[]>('/returns', { params: status ? { status } : undefined })
  return data
}

export async function moderateReturn(id: number, status: ReturnStatus, adminNote?: string): Promise<ReturnRequestItem> {
  const { data } = await apiClient.put<ReturnRequestItem>(`/returns/${id}`, { status, admin_note: adminNote })
  return data
}
