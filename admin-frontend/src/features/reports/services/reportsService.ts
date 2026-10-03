import { apiClient } from './client'
import type { ReportsData } from '../types'

export async function getReports(days = 14): Promise<ReportsData> {
  const { data } = await apiClient.get<ReportsData>('/admin/reports', { params: { days } })
  return data
}
