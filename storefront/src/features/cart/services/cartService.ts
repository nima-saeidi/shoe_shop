import { apiClient } from '@/services/apiClient'
import type { Cart } from '../types'

export const cartService = {
  get: () => apiClient.get<Cart>('/cart').then((r) => r.data),
  add: (variant_id: number, quantity = 1) => apiClient.post<Cart>('/cart/items', { variant_id, quantity }).then((r) => r.data),
  update: (itemId: number, quantity: number) => apiClient.put<Cart>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  remove: (itemId: number) => apiClient.delete<Cart>(`/cart/items/${itemId}`).then((r) => r.data),
}
