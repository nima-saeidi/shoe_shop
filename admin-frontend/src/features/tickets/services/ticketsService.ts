import { apiClient } from '@/services/apiClient'
import type { Ticket } from '../types'

export const ticketsService = {
  async list(status?: string): Promise<Ticket[]> {
    const { data } = await apiClient.get<Ticket[]>('/tickets', { params: status ? { status } : undefined })
    return data
  },

  async get(id: number): Promise<Ticket> {
    const { data } = await apiClient.get<Ticket>(`/admin/tickets/${id}`)
    return data
  },

  async reply(id: number, message: string): Promise<Ticket> {
    const { data } = await apiClient.post<Ticket>(`/tickets/${id}/admin-reply`, { message })
    return data
  },

  async close(id: number): Promise<Ticket> {
    const { data } = await apiClient.post<Ticket>(`/tickets/${id}/close`)
    return data
  },
}
