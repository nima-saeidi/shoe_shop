import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageFallback } from '@/components/ui/PageFallback'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ProtectedRoute } from './ProtectedRoute'

// Every feature page is code-split; only the login page ships in the main bundle.
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage').then((m) => ({ default: m.ProductListPage })))
const ProductFormPage = lazy(() => import('@/features/products/pages/ProductFormPage').then((m) => ({ default: m.ProductFormPage })))
const CategoryListPage = lazy(() => import('@/features/categories/pages/CategoryListPage').then((m) => ({ default: m.CategoryListPage })))
const BrandListPage = lazy(() => import('@/features/brands/pages/BrandListPage').then((m) => ({ default: m.BrandListPage })))
const OrderListPage = lazy(() => import('@/features/orders/pages/OrderListPage').then((m) => ({ default: m.OrderListPage })))
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })))
const ManualOrderPage = lazy(() => import('@/features/orders/pages/ManualOrderPage').then((m) => ({ default: m.ManualOrderPage })))
const CouponListPage = lazy(() => import('@/features/coupons/pages/CouponListPage').then((m) => ({ default: m.CouponListPage })))
const WholesaleListPage = lazy(() => import('@/features/wholesale/pages/WholesaleListPage').then((m) => ({ default: m.WholesaleListPage })))
const WalletSearchPage = lazy(() => import('@/features/wallet/pages/WalletSearchPage').then((m) => ({ default: m.WalletSearchPage })))
const WalletDetailPage = lazy(() => import('@/features/wallet/pages/WalletDetailPage').then((m) => ({ default: m.WalletDetailPage })))
const ReturnListPage = lazy(() => import('@/features/returns/pages/ReturnListPage').then((m) => ({ default: m.ReturnListPage })))
const TicketListPage = lazy(() => import('@/features/tickets/pages/TicketListPage').then((m) => ({ default: m.TicketListPage })))
const TicketDetailPage = lazy(() => import('@/features/tickets/pages/TicketDetailPage').then((m) => ({ default: m.TicketDetailPage })))
const UserListPage = lazy(() => import('@/features/users/pages/UserListPage').then((m) => ({ default: m.UserListPage })))
const ReviewListPage = lazy(() => import('@/features/reviews/pages/ReviewListPage').then((m) => ({ default: m.ReviewListPage })))
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const LogListPage = lazy(() => import('@/features/logs/pages/LogListPage').then((m) => ({ default: m.LogListPage })))
const SystemLogPage = lazy(() => import('@/features/logs/pages/SystemLogPage').then((m) => ({ default: m.SystemLogPage })))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />

              <Route path="products" element={<ProductListPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />

              <Route path="categories" element={<CategoryListPage />} />
              <Route path="brands" element={<BrandListPage />} />

              <Route path="orders" element={<OrderListPage />} />
              <Route path="orders/manual/new" element={<ManualOrderPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />

              <Route path="coupons" element={<CouponListPage />} />
              <Route path="wholesale" element={<WholesaleListPage />} />

              <Route path="wallet" element={<WalletSearchPage />} />
              <Route path="wallet/:userId" element={<WalletDetailPage />} />

              <Route path="returns" element={<ReturnListPage />} />

              <Route path="tickets" element={<TicketListPage />} />
              <Route path="tickets/:id" element={<TicketDetailPage />} />

              <Route path="reviews" element={<ReviewListPage />} />
              <Route path="users" element={<UserListPage />} />
              <Route path="reports" element={<ReportsPage />} />

              <Route path="logs" element={<LogListPage />} />
              <Route path="logs/system" element={<SystemLogPage />} />

              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
