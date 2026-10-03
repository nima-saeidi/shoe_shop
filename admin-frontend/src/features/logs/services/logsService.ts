import { apiClient } from '@/services/apiClient'
import type { Page } from '@/types'
import type { LogEntry, LogListParams } from '../types'

export const logsService = {
  async list(params: LogListParams = {}): Promise<Page<LogEntry>> {
    const { data } = await apiClient.get<Page<LogEntry>>('/admin/logs', { params })
    return data
  },

  async categories(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>('/admin/logs/categories')
    return data
  },

  async system(lines = 300): Promise<string[]> {
    const { data } = await apiClient.get<string[]>('/admin/logs/system', { params: { lines } })
    return data
  },
}
