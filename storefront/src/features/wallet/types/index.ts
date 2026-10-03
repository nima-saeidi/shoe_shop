export interface WalletTransaction {
  id: number
  tx_type: string
  amount: number
  balance_after: number
  description: string | null
  created_at: string
}

export interface WalletBalance {
  balance: number
}
