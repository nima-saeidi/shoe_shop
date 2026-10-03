'use client'

import { SessionBootstrap } from '@/features/auth/components/SessionBootstrap'
import { QueryProvider } from './QueryProvider'

/** Client-side providers for the whole storefront (mounted once in the root layout). */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionBootstrap />
      {children}
    </QueryProvider>
  )
}
