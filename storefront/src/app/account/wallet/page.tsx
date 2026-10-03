import type { Metadata } from 'next'
import { WalletPage } from '@/features/wallet/pages/WalletPage'

export const metadata: Metadata = { title: 'کیف پول' }

export default function Page() {
  return <WalletPage />
}
