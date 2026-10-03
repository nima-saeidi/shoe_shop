'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore, useIsAuthenticated } from '@/app/store/authStore'
import { Spinner } from '@/components/ui/Spinner'

/** Client-side gate for pages that need a signed-in customer. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useAuthStore((s) => s.hydrated)
  const signedOut = useAuthStore((s) => s.signedOut)
  const authed = useIsAuthenticated()

  useEffect(() => {
    // After a deliberate sign-out the logout itself navigates away; don't race it to /login.
    if (hydrated && !authed && !signedOut) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [hydrated, authed, signedOut, router, pathname])

  if (!authed) return <Spinner />
  return <>{children}</>
}
