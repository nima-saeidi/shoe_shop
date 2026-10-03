import { apiClient } from '@/services/apiClient'
import type { DashboardStats } from '../types'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<DashboardStats>('/admin/dashboard')
    return data
  },
}
