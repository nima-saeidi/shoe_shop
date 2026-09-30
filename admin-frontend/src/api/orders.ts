import { apiClient } from './client'
import type { ManualOrderInput, Order, OrderStatusUpdateInput, Page } from '../types'

export interface OrderListParams {
  status?: string
  order_type?: string
  page?: number
  page_size?: number
}

export async function listOrders(params: OrderListParams = {}): Promise<Page<Order>> {
  const { data } = await apiClient.get<Page<Order>>('/orders', { params })
  return data
}

export async function getOrder(id: number): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/admin/orders/${id}`)
  return data
}

export async function updateOrderStatus(id: number, input: OrderStatusUpdateInput): Promise<Order> {
  const { data } = await apiClient.put<Order>(`/orders/${id}/status`, input)
  return data
}

export async function createManualOrder(input: ManualOrderInput): Promise<Order> {
  const { data } = await apiClient.post<Order>('/orders/manual', input)
  return data
}
