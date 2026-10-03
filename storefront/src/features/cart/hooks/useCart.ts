import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useIsAuthenticated } from '@/app/store/authStore'
import { cartService } from '../services/cartService'
import type { Cart } from '../types'

export const cartKeys = {
  all: ['cart'] as const,
}

/** The server-side cart; one cache entry shared by the header badge, cart page and checkout. */
export function useCart() {
  const enabled = useIsAuthenticated()
  return useQuery({ queryKey: cartKeys.all, queryFn: cartService.get, enabled })
}

/** Every cart endpoint answers with the whole updated cart: write it straight into the cache. */
function useSetCart() {
  const queryClient = useQueryClient()
  return (cart: Cart) => queryClient.setQueryData(cartKeys.all, cart)
}

export function useAddToCart() {
  const onSuccess = useSetCart()
  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: number; quantity: number }) => cartService.add(variantId, quantity),
    onSuccess,
  })
}

export function useUpdateCartItem() {
  const onSuccess = useSetCart()
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) => cartService.update(itemId, quantity),
    onSuccess,
  })
}

export function useRemoveCartItem() {
  const onSuccess = useSetCart()
  return useMutation({ mutationFn: (itemId: number) => cartService.remove(itemId), onSuccess })
}
