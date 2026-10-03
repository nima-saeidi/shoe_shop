import { apiClient } from '@/services/apiClient'
import type { Address, AddressInput } from '../types'

export const addressesService = {
  list: () => apiClient.get<Address[]>('/addresses').then((r) => r.data),
  create: (input: AddressInput) => apiClient.post<Address>('/addresses', input).then((r) => r.data),
  update: (id: number, input: Partial<AddressInput>) => apiClient.put<Address>(`/addresses/${id}`, input).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/addresses/${id}`).then((r) => r.data),
}
