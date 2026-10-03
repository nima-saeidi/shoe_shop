import type { Metadata } from 'next'
import { TicketDetailPage } from '@/features/tickets/pages/TicketDetailPage'

export const metadata: Metadata = { title: 'تیکت پشتیبانی' }

export default function Page() {
  return <TicketDetailPage />
}
