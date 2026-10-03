import { apiClient } from './client'
import type { Ticket } from '../types'

export async function listTickets(status?: string): Promise<Ticket[]> {
  const { data } = await apiClient.get<Ticket[]>('/tickets', { params: status ? { status } : undefined })
  return data
}

export async function getTicket(id: number): Promise<Ticket> {
  const { data } = await apiClient.get<Ticket>(`/admin/tickets/${id}`)
  return data
}

export async function adminReplyTicket(id: number, message: string): Promise<Ticket> {
  const { data } = await apiClient.post<Ticket>(`/tickets/${id}/admin-reply`, { message })
  return data
}

export async function closeTicket(id: number): Promise<Ticket> {
  const { data } = await apiClient.post<Ticket>(`/tickets/${id}/close`)
  return data
}
