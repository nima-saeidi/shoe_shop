import type { Metadata } from 'next'
import { AddressesPage } from '@/features/addresses/pages/AddressesPage'

export const metadata: Metadata = { title: 'آدرس‌ها' }

export default function Page() {
  return <AddressesPage />
}
