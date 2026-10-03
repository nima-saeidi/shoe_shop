import type { Metadata } from 'next'
import { ReturnsPage } from '@/features/returns/pages/ReturnsPage'

export const metadata: Metadata = { title: 'مرجوعی‌ها' }

export default function Page() {
  return <ReturnsPage />
}
