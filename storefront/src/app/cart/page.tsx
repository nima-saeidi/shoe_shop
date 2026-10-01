import type { Metadata } from 'next'
import { AuthGuard } from '@/components/account/AuthGuard'
import { CartView } from '@/components/cart/CartView'

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
