export type TicketStatus = 'open' | 'answered' | 'closed'

export interface TicketMessage {
  id: number
  sender_id: number
  sender_name: string | null
  is_admin: boolean
  message: string
  created_at: string
}

export interface Ticket {
  id: number
  subject: string
  status: TicketStatus
  created_at: string
  updated_at: string
  customer_name: string | null
  messages: TicketMessage[]
}
