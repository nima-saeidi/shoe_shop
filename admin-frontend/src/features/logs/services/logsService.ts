import { apiClient } from './client'
import type { LogEntry, Page } from '../types'

export interface LogListParams {
  category?: string
  level?: string
  q?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}

export async function listLogs(params: LogListParams = {}): Promise<Page<LogEntry>> {
  const { data } = await apiClient.get<Page<LogEntry>>('/admin/logs', { params })
  return data
}

export async function listLogCategories(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/admin/logs/categories')
  return data
}

export async function getSystemLog(lines = 300): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/admin/logs/system', { params: { lines } })
  return data
}
