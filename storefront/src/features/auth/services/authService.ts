import { http } from '../http'
import type {
  Address,
  AddressInput,
  AuthTokens,
  Cart,
  CheckoutInput,
  Order,
  Page,
  ReturnRequest,
  Ticket,
  User,
  WalletTransaction,
} from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    http.post<AuthTokens>('/auth/login', { email, password }).then((r) => r.data),
  register: (input: { full_name: string; email: string; phone_number?: string; password: string }) =>
    http.post<User>('/auth/register', input).then((r) => r.data),
  me: () => http.get<User>('/users/me').then((r) => r.data),
  updateMe: (input: { full_name?: string; phone_number?: string }) =>
    http.put<User>('/users/me', input).then((r) => r.data),
  changePassword: (current_password: string, new_password: string) =>
    http.post('/users/me/change-password', { current_password, new_password }).then((r) => r.data),
}

export const cartApi = {
  get: () => http.get<Cart>('/cart').then((r) => r.data),
  add: (variant_id: number, quantity = 1) => http.post<Cart>('/cart/items', { variant_id, quantity }).then((r) => r.data),
  update: (itemId: number, quantity: number) => http.put<Cart>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  remove: (itemId: number) => http.delete<Cart>(`/cart/items/${itemId}`).then((r) => r.data),
}

export const orderApi = {
  checkout: (input: CheckoutInput) => http.post<Order>('/orders/checkout', input).then((r) => r.data),
  mine: (page = 1, page_size = 10) =>
    http.get<Page<Order>>('/orders/my', { params: { page, page_size } }).then((r) => r.data),
  get: (id: number) => http.get<Order>(`/orders/${id}`).then((r) => r.data),
  cancel: (id: number) => http.post<Order>(`/orders/${id}/cancel`).then((r) => r.data),
  payFromWallet: (id: number) => http.post<Order>(`/orders/${id}/pay-from-wallet`).then((r) => r.data),
}

export const addressApi = {
  list: () => http.get<Address[]>('/addresses').then((r) => r.data),
  create: (input: AddressInput) => http.post<Address>('/addresses', input).then((r) => r.data),
  update: (id: number, input: Partial<AddressInput>) => http.put<Address>(`/addresses/${id}`, input).then((r) => r.data),
  remove: (id: number) => http.delete(`/addresses/${id}`).then((r) => r.data),
}

export const walletApi = {
  balance: () => http.get<{ balance: number }>('/wallet/balance').then((r) => r.data),
  transactions: () => http.get<WalletTransaction[]>('/wallet/transactions').then((r) => r.data),
}

export const ticketApi = {
  mine: () => http.get<Ticket[]>('/tickets/my').then((r) => r.data),
  get: (id: number) => http.get<Ticket>(`/tickets/${id}`).then((r) => r.data),
  create: (subject: string, message: string) => http.post<Ticket>('/tickets', { subject, message }).then((r) => r.data),
  reply: (id: number, message: string) => http.post<Ticket>(`/tickets/${id}/reply`, { message }).then((r) => r.data),
}

export const returnApi = {
  mine: () => http.get<ReturnRequest[]>('/returns/my').then((r) => r.data),
  create: (order_item_id: number, reason: string, description?: string) =>
    http.post<ReturnRequest>('/returns', { order_item_id, reason, description }).then((r) => r.data),
}
