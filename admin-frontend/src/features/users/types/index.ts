import type { UserRole } from '@/features/auth/types'

export interface AdminUser {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  role: UserRole
  is_active: boolean
  company_name: string | null
  wallet_balance: number
  created_at: string
}

export interface AdminUserUpdateInput {
  role?: UserRole
  is_active?: boolean
}
