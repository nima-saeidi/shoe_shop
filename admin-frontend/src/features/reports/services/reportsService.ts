import { apiClient } from '@/services/apiClient'
import type { ReportsData } from '../types'

export const reportsService = {
  async get(days = 14): Promise<ReportsData> {
    const { data } = await apiClient.get<ReportsData>('/admin/reports', { params: { days } })
    return data
  },
}
