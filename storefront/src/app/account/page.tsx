import type { Metadata } from 'next'
import { AccountDashboardPage } from '@/features/account/pages/AccountDashboardPage'

export const metadata: Metadata = { title: 'داشبورد' }

export default function Page() {
  return <AccountDashboardPage />
}
