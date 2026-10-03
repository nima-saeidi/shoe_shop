import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export const dashboardKeys = {
  stats: ['dashboard'] as const,
}

export function useDashboardStats() {
  return useQuery({ queryKey: dashboardKeys.stats, queryFn: dashboardService.getStats })
}
