export type LogLevel = 'info' | 'warning' | 'error'

export interface LogEntry {
  id: number
  level: LogLevel
  category: string
  action: string
  message: string
  actor_id: number | null
  actor_name: string | null
  target_type: string | null
  target_id: number | null
  ip_address: string | null
  created_at: string
}

export interface LogListParams {
  category?: string
  level?: string
  q?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}
