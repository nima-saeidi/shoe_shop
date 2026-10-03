import { apiClient } from '@/services/apiClient'
import type { ReturnCreateInput, ReturnRequest } from '../types'

export const returnsService = {
  mine: () => apiClient.get<ReturnRequest[]>('/returns/my').then((r) => r.data),
  create: (input: ReturnCreateInput) => apiClient.post<ReturnRequest>('/returns', input).then((r) => r.data),
}
