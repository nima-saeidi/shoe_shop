import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/services/apiClient'
import { productsService } from '../services/productsService'
import type { ProductInput, ProductListParams, ProductUpdateInput, ProductVariantInput } from '../types'

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductListParams) => [...productKeys.all, 'list', params] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
}

export function useProducts(params: ProductListParams) {
  return useQuery({ queryKey: productKeys.list(params), queryFn: () => productsService.list(params) })
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? 0),
    queryFn: () => productsService.get(id!),
    enabled: id !== undefined,
  })
}

/** Invalidates every product query (lists + details). */
function useInvalidateProducts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all })
}

/**
 * Creates the product and uploads the picked images. An image upload failure does not fail the
 * mutation (the product already exists); it is reported back as `imageError` instead.
 */
export function useCreateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: async ({ input, files }: { input: ProductInput; files: File[] }) => {
      const product = await productsService.create(input)
      let imageError: string | null = null
      if (files.length) {
        try {
          await productsService.uploadImages(product.id, files)
        } catch (err) {
          imageError = getApiErrorMessage(err)
        }
      }
      return { product, imageError }
    },
    onSuccess: invalidate,
  })
}

export function useUpdateProduct(productId: number) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (input: ProductUpdateInput) => productsService.update(productId, input),
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({ mutationFn: productsService.remove, onSuccess: invalidate })
}

export function useAddVariant(productId: number) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (input: ProductVariantInput) => productsService.addVariant(productId, input),
    onSuccess: invalidate,
  })
}

export function useDeleteVariant() {
  const invalidate = useInvalidateProducts()
  return useMutation({ mutationFn: productsService.removeVariant, onSuccess: invalidate })
}

export function useUploadProductImages(productId: number) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ files, color }: { files: File[]; color?: string }) => productsService.uploadImages(productId, files, color),
    onSuccess: invalidate,
  })
}

export function useDeleteProductImage() {
  const invalidate = useInvalidateProducts()
  return useMutation({ mutationFn: productsService.removeImage, onSuccess: invalidate })
}

export function useSetPrimaryImage(productId: number) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (imageId: number) => productsService.setPrimaryImage(productId, imageId),
    onSuccess: invalidate,
  })
}
