import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addressesService } from '../services/addressesService'
import type { AddressInput } from '../types'

export const addressKeys = {
  all: ['addresses'] as const,
}

export function useAddresses() {
  return useQuery({ queryKey: addressKeys.all, queryFn: addressesService.list })
}

function useInvalidateAddresses() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: addressKeys.all })
}

/** Creates a new address, or updates the one with `id`. */
export function useSaveAddress() {
  const onSuccess = useInvalidateAddresses()
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: AddressInput }) =>
      id ? addressesService.update(id, input) : addressesService.create(input),
    onSuccess,
  })
}

export function useDeleteAddress() {
  const onSuccess = useInvalidateAddresses()
  return useMutation({ mutationFn: addressesService.remove, onSuccess })
}
