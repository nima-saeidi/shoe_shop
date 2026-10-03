import { apiClient } from '@/services/apiClient'
import type { Page } from '@/types'
import type { CheckoutInput, Order } from '../types'

export const ordersService = {
  checkout: (input: CheckoutInput) => apiClient.post<Order>('/orders/checkout', input).then((r) => r.data),
  mine: (page = 1, page_size = 10) =>
    apiClient.get<Page<Order>>('/orders/my', { params: { page, page_size } }).then((r) => r.data),
  get: (id: number) => apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),
  cancel: (id: number) => apiClient.post<Order>(`/orders/${id}/cancel`).then((r) => r.data),
  payFromWallet: (id: number) => apiClient.post<Order>(`/orders/${id}/pay-from-wallet`).then((r) => r.data),
}
