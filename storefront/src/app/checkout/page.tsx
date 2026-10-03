import type { Metadata } from 'next'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { CheckoutForm } from '@/features/cart/components/CheckoutForm'

export const metadata: Metadata = { title: 'ثبت سفارش', robots: { index: false } }

export default function CheckoutPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">ثبت سفارش</h1>
      <AuthGuard>
        <CheckoutForm />
      </AuthGuard>
    </div>
  )
}
