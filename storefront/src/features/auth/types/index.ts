export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface User {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  role: 'customer' | 'wholesale' | 'admin' | 'superadmin' | string
  is_active: boolean
  company_name: string | null
  wholesale_status: string
  wallet_balance: number
  created_at: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  full_name: string
  email: string
  phone_number?: string
  password: string
}

export interface ProfileUpdateInput {
  full_name?: string
  phone_number?: string
}

export interface ChangePasswordInput {
  current_password: string
  new_password: string
}
