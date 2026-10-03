export type WalletTxType = 'topup' | 'deduct' | 'refund' | 'order_payment'

export interface WalletTransaction {
  id: number
  tx_type: WalletTxType
  amount: number
  balance_after: number
  description: string | null
  created_at: string
}

export interface WalletUserSummary {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  wallet_balance: number
}

export interface WalletDetail {
  user_id: number
  full_name: string
  balance: number
  transactions: WalletTransaction[]
}

export interface WalletTopupInput {
  amount: number
  description?: string
}
