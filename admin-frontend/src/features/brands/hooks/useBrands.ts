import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MAX_PAGE_SIZE } from '@/services/apiClient'
import { brandsService } from '../services/brandsService'
import type { BrandInput } from '../types'

export const brandKeys = {
  all: ['brands'] as const,
}

export function useBrands() {
  return useQuery({ queryKey: brandKeys.all, queryFn: () => brandsService.list(1, MAX_PAGE_SIZE) })
}

function useInvalidateBrands() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: brandKeys.all })
}

/** Creates the brand, then uploads its logo when one was picked. */
export function useCreateBrand() {
  const invalidate = useInvalidateBrands()
  return useMutation({
    mutationFn: async ({ input, file }: { input: BrandInput; file?: File }) => {
      const brand = await brandsService.create(input)
      if (file) await brandsService.uploadLogo(brand.id, file)
      return brand
    },
    onSuccess: invalidate,
  })
}

export function useUpdateBrand() {
  const invalidate = useInvalidateBrands()
  return useMutation({
    mutationFn: async ({ id, input, file }: { id: number; input: Partial<BrandInput>; file?: File }) => {
      const brand = await brandsService.update(id, input)
      if (file) await brandsService.uploadLogo(id, file)
      return brand
    },
    onSuccess: invalidate,
  })
}

export function useDeleteBrand() {
  const invalidate = useInvalidateBrands()
  return useMutation({ mutationFn: brandsService.remove, onSuccess: invalidate })
}

export function useUploadBrandLogo() {
  const invalidate = useInvalidateBrands()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => brandsService.uploadLogo(id, file),
    onSuccess: invalidate,
  })
}
