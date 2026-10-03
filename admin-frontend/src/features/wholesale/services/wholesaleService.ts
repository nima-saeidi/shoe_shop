import { apiClient } from './client'
import type { WholesaleRequest } from '../types'

export async function listWholesaleRequests(status = 'pending'): Promise<WholesaleRequest[]> {
  const { data } = await apiClient.get<WholesaleRequest[]>('/wholesale', { params: { status, page_size: 100 } })
  return data
}

export async function decideWholesaleRequest(userId: number, approve: boolean): Promise<void> {
  await apiClient.post(`/wholesale/${userId}/decision`, { approve })
}
