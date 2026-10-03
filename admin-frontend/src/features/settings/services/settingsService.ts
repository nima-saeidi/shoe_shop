import { apiClient } from './client'
import type { SettingsStatus } from '../types'

export async function getSettingsStatus(): Promise<SettingsStatus> {
  const { data } = await apiClient.get<SettingsStatus>('/admin/settings')
  return data
}
