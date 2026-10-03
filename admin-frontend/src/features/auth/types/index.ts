export type UserRole = 'customer' | 'wholesale' | 'admin' | 'superadmin'
export type WholesaleStatus = 'none' | 'pending' | 'approved' | 'rejected'

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface CurrentUser {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  role: UserRole
  is_active: boolean
  company_name: string | null
  wholesale_status: WholesaleStatus
  wallet_balance: number
  created_at: string
}

export interface LoginInput {
  email: string
  password: string
}
