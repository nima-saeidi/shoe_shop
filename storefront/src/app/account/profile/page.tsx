import type { Metadata } from 'next'
import { ProfilePage } from '@/features/account/pages/ProfilePage'

export const metadata: Metadata = { title: 'پروفایل من' }

export default function Page() {
  return <ProfilePage />
}
