import { apiClient } from '@/services/apiClient'
import type { WholesaleRequest } from '../types'

export const wholesaleService = {
  async list(status = 'pending'): Promise<WholesaleRequest[]> {
    const { data } = await apiClient.get<WholesaleRequest[]>('/wholesale', { params: { status, page_size: 100 } })
    return data
  },

  async decide(userId: number, approve: boolean): Promise<void> {
    await apiClient.post(`/wholesale/${userId}/decision`, { approve })
  },
}
