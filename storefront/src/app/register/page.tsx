import type { Metadata } from 'next'
import { Suspense } from 'react'
import { RegisterForm } from '@/components/account/RegisterForm'

export const metadata: Metadata = { title: 'ثبت‌نام', robots: { index: false } }

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
