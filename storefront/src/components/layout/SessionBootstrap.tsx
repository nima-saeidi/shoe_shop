'use client'

import { useEffect } from 'react'
import { authApi, cartApi } from '@/lib/api/account'
import { isTokenExpired } from '@/lib/jwt'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

/** On first load, restores the session: validates the stored tokens and loads user + cart. */
export function SessionBootstrap() {
  const hydrated = useAuthStore((s) => s.hydrated)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!hydrated) return
    const { refreshToken, logout, setUser } = useAuthStore.getState()
    if (!accessToken) {
      useCartStore.getState().setCart(null)
      return
    }
    if (isTokenExpired(refreshToken)) {
      logout()
      return
    }
    authApi.me().then(setUser).catch(() => undefined)
    cartApi
      .get()
      .then((c) => useCartStore.getState().setCart(c))
      .catch(() => undefined)
  }, [hydrated, accessToken])

  return null
}
