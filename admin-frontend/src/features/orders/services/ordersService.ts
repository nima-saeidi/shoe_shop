import { apiClient } from '@/services/apiClient'
import type { Page } from '@/types'
import type { ManualOrderInput, Order, OrderListParams, OrderStatusUpdateInput } from '../types'

export const ordersService = {
  async list(params: OrderListParams = {}): Promise<Page<Order>> {
    const { data } = await apiClient.get<Page<Order>>('/orders', { params })
    return data
  },

  async get(id: number): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/admin/orders/${id}`)
    return data
  },

  async updateStatus(id: number, input: OrderStatusUpdateInput): Promise<Order> {
    const { data } = await apiClient.put<Order>(`/orders/${id}/status`, input)
    return data
  },

  async createManual(input: ManualOrderInput): Promise<Order> {
    const { data } = await apiClient.post<Order>('/orders/manual', input)
    return data
  },
}
