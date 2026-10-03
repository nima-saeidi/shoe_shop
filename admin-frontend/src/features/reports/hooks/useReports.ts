import { useQuery } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'

export const reportKeys = {
  byDays: (days: number) => ['reports', days] as const,
}

export function useReports(days = 14) {
  return useQuery({ queryKey: reportKeys.byDays(days), queryFn: () => reportsService.get(days) })
}
