import { useQuery } from '@tanstack/react-query'
import { settingsService } from '../services/settingsService'

export const settingsKeys = {
  status: ['settings-status'] as const,
}

export function useSettingsStatus() {
  return useQuery({ queryKey: settingsKeys.status, queryFn: settingsService.getStatus })
}
