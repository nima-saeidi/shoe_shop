import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '../services/ordersService'
import type { OrderListParams, OrderStatusUpdateInput } from '../types'

export const orderKeys = {
  all: ['orders'] as const,
  list: (params: OrderListParams) => [...orderKeys.all, 'list', params] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
}

export function useOrders(params: OrderListParams) {
  return useQuery({ queryKey: orderKeys.list(params), queryFn: () => ordersService.list(params) })
}

export function useOrder(id: number) {
  return useQuery({ queryKey: orderKeys.detail(id), queryFn: () => ordersService.get(id) })
}

export function useUpdateOrderStatus(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: OrderStatusUpdateInput) => ordersService.updateStatus(id, input),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(id), order)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCreateManualOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersService.createManual,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
