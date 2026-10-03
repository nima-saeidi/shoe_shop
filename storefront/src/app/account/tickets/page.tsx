import type { Metadata } from 'next'
import { TicketsPage } from '@/features/tickets/pages/TicketsPage'

export const metadata: Metadata = { title: 'تیکت‌های پشتیبانی' }

export default function Page() {
  return <TicketsPage />
}
