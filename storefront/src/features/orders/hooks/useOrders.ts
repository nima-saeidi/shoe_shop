import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '@/features/auth/hooks/useAuth'
import { cartKeys } from '@/features/cart/hooks/useCart'
import { walletKeys } from '@/features/wallet/hooks/useWallet'
import { ordersService } from '../services/ordersService'
import type { Order } from '../types'

export const orderKeys = {
  all: ['orders'] as const,
  list: (page: number, pageSize: number) => [...orderKeys.all, 'list', page, pageSize] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
}

export function useMyOrders(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: orderKeys.list(page, pageSize),
    queryFn: () => ordersService.mine(page, pageSize),
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id: number) {
  return useQuery({ queryKey: orderKeys.detail(id), queryFn: () => ordersService.get(id) })
}

/** Paying or cancelling can move money: refresh the order lists, the wallet and the profile balance. */
function useOrderChanged() {
  const queryClient = useQueryClient()
  return (order: Order) => {
    queryClient.setQueryData(orderKeys.detail(order.id), order)
    queryClient.invalidateQueries({ queryKey: orderKeys.all })
    queryClient.invalidateQueries({ queryKey: walletKeys.all })
    queryClient.invalidateQueries({ queryKey: authKeys.me })
  }
}

export function useCancelOrder(id: number) {
  const onSuccess = useOrderChanged()
  return useMutation({ mutationFn: () => ordersService.cancel(id), onSuccess })
}

export function usePayOrderFromWallet(id: number) {
  const onSuccess = useOrderChanged()
  return useMutation({ mutationFn: () => ordersService.payFromWallet(id), onSuccess })
}

export function useCheckout() {
  const onOrderChanged = useOrderChanged()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersService.checkout,
    onSuccess: (order) => {
      onOrderChanged(order)
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}
