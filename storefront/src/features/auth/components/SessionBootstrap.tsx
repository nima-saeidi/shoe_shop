'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/store/authStore'
import { isTokenExpired } from '@/utils/jwt'
import { useMe } from '../hooks/useAuth'

/** On first load, restores the session: drops dead tokens and keeps the stored user in sync with the API. */
export function SessionBootstrap() {
  const queryClient = useQueryClient()
  const hydrated = useAuthStore((s) => s.hydrated)
  const accessToken = useAuthStore((s) => s.accessToken)
  const { data: user } = useMe()
  const pathname = usePathname()

  // The persisted tokens are read from localStorage synchronously when the store is created in the
  // browser, so by the time any effect runs the state is ready: flag it for the guards.
  useEffect(() => {
    useAuthStore.setState({ hydrated: true })
  }, [])

  useEffect(() => {
    if (!hydrated) return
    // Signed out (or the session was dropped): no customer data may stay cached.
    if (!accessToken) {
      queryClient.removeQueries()
      return
    }
    if (isTokenExpired(useAuthStore.getState().refreshToken)) useAuthStore.getState().logout()
  }, [hydrated, accessToken, queryClient])

  useEffect(() => {
    if (user) useAuthStore.getState().setUser(user)
  }, [user])

  // The sign-out flag only has to outlive the logout's own navigation.
  useEffect(() => {
    if (useAuthStore.getState().signedOut) useAuthStore.setState({ signedOut: false })
  }, [pathname])

  return null
}
