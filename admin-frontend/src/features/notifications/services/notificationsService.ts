import { apiClient } from '@/services/apiClient'
import type { LogEntry } from '@/features/logs/types'

export const notificationsService = {
  async list(limit = 30): Promise<LogEntry[]> {
    const { data } = await apiClient.get<LogEntry[]>('/admin/notifications', { params: { limit } })
    return data
  },
}
