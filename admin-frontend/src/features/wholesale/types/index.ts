import type { WholesaleStatus } from '@/features/auth/types'

export interface WholesaleRequest {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  company_name: string | null
  wholesale_status: WholesaleStatus
  wholesale_requested_at: string | null
}
