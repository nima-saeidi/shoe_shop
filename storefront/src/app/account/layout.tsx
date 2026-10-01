import type { Metadata } from 'next'
import { AccountNav } from '@/components/account/AccountNav'
import { AuthGuard } from '@/components/account/AuthGuard'

export const metadata: Metadata = { title: { default: 'پنل کاربری', template: '%s | پنل کاربری' }, robots: { index: false, follow: false } }

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <AccountNav />
        <div className="min-w-0 space-y-5">{children}</div>
      </div>
    </AuthGuard>
  )
}
