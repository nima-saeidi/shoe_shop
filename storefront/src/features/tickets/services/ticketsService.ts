import { apiClient } from '@/services/apiClient'
import type { Ticket, TicketCreateInput } from '../types'

export const ticketsService = {
  mine: () => apiClient.get<Ticket[]>('/tickets/my').then((r) => r.data),
  get: (id: number) => apiClient.get<Ticket>(`/tickets/${id}`).then((r) => r.data),
  create: (input: TicketCreateInput) => apiClient.post<Ticket>('/tickets', input).then((r) => r.data),
  reply: (id: number, message: string) => apiClient.post<Ticket>(`/tickets/${id}/reply`, { message }).then((r) => r.data),
}
