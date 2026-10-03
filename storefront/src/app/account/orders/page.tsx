import type { Metadata } from 'next'
import { OrdersPage } from '@/features/orders/pages/OrdersPage'

export const metadata: Metadata = { title: 'سفارش‌های من' }

export default function Page() {
  return <OrdersPage />
}
