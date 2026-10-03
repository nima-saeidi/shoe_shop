import type { Metadata } from 'next'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { CartView } from '@/features/cart/components/CartView'

export const metadata: Metadata = { title: 'سبد خرید', robots: { index: false } }

export default function CartPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">سبد خرید</h1>
      <AuthGuard>
        <CartView />
      </AuthGuard>
    </div>
  )
}
