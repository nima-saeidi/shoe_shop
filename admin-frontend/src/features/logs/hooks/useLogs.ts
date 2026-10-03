import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { logsService } from '../services/logsService'
import type { LogListParams } from '../types'

export const logKeys = {
  all: ['logs'] as const,
  list: (params: LogListParams) => [...logKeys.all, 'list', params] as const,
  categories: ['logs', 'categories'] as const,
  system: (lines: number) => ['logs', 'system', lines] as const,
}

export function useLogs(params: LogListParams) {
  return useQuery({ queryKey: logKeys.list(params), queryFn: () => logsService.list(params), placeholderData: keepPreviousData })
}

export function useLogCategories() {
  return useQuery({ queryKey: logKeys.categories, queryFn: logsService.categories, staleTime: 5 * 60_000 })
}

export function useSystemLog(lines = 300) {
  return useQuery({ queryKey: logKeys.system(lines), queryFn: () => logsService.system(lines) })
}
