import { apiClient } from '@/services/apiClient'
import type { SettingsStatus } from '../types'

export const settingsService = {
  async getStatus(): Promise<SettingsStatus> {
    const { data } = await apiClient.get<SettingsStatus>('/admin/settings')
    return data
  },
}
