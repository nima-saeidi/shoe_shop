'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { isTokenExpired } from '@/lib/jwt'
import { useAuthStore } from '@/store/auth'

/** Client-side gate for pages that need a signed-in customer. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useAuthStore((s) => s.hydrated)
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)

  const authed = Boolean(accessToken) && !isTokenExpired(refreshToken)

  useEffect(() => {
    if (hydrated && !authed) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [hydrated, authed, router, pathname])

  if (!hydrated || !authed) return <Spinner />
  return <>{children}</>
}
