import type { Metadata } from 'next'
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage'

export const metadata: Metadata = { title: 'جزئیات سفارش' }

export default function Page() {
  return <OrderDetailPage />
}
