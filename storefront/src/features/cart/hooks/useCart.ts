import { create } from 'zustand'
import type { Cart } from '@/types'

interface CartState {
  cart: Cart | null
  setCart: (cart: Cart | null) => void
}

/** Mirrors the server-side cart so the header badge and cart page share one source of truth. */
export const useCartStore = create<CartState>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
}))
