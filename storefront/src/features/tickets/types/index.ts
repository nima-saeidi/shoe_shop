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
  status: string
  created_at: string
  updated_at: string
  messages: TicketMessage[]
}

export interface TicketCreateInput {
  subject: string
  message: string
}
