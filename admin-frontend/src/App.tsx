import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import { AdminLayout } from './layout/AdminLayout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { LoginPage } from './pages/Login/LoginPage'

const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ProductListPage = lazy(() => import('./pages/Products/ProductListPage').then((m) => ({ default: m.ProductListPage })))
const ProductFormPage = lazy(() => import('./pages/Products/ProductFormPage').then((m) => ({ default: m.ProductFormPage })))
const CategoryListPage = lazy(() => import('./pages/Categories/CategoryListPage').then((m) => ({ default: m.CategoryListPage })))
const BrandListPage = lazy(() => import('./pages/Brands/BrandListPage').then((m) => ({ default: m.BrandListPage })))
const OrderListPage = lazy(() => import('./pages/Orders/OrderListPage').then((m) => ({ default: m.OrderListPage })))
const OrderDetailPage = lazy(() => import('./pages/Orders/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })))
const ManualOrderPage = lazy(() => import('./pages/Orders/ManualOrderPage').then((m) => ({ default: m.ManualOrderPage })))
const CouponListPage = lazy(() => import('./pages/Coupons/CouponListPage').then((m) => ({ default: m.CouponListPage })))
const WholesaleListPage = lazy(() => import('./pages/Wholesale/WholesaleListPage').then((m) => ({ default: m.WholesaleListPage })))
const WalletSearchPage = lazy(() => import('./pages/Wallet/WalletSearchPage').then((m) => ({ default: m.WalletSearchPage })))
const WalletDetailPage = lazy(() => import('./pages/Wallet/WalletDetailPage').then((m) => ({ default: m.WalletDetailPage })))
const ReturnListPage = lazy(() => import('./pages/Returns/ReturnListPage').then((m) => ({ default: m.ReturnListPage })))
const TicketListPage = lazy(() => import('./pages/Tickets/TicketListPage').then((m) => ({ default: m.TicketListPage })))
const TicketDetailPage = lazy(() => import('./pages/Tickets/TicketDetailPage').then((m) => ({ default: m.TicketDetailPage })))
const UserListPage = lazy(() => import('./pages/Users/UserListPage').then((m) => ({ default: m.UserListPage })))
const ReviewListPage = lazy(() => import('./pages/Reviews/ReviewListPage').then((m) => ({ default: m.ReviewListPage })))
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const LogListPage = lazy(() => import('./pages/Logs/LogListPage').then((m) => ({ default: m.LogListPage })))
const SystemLogPage = lazy(() => import('./pages/Logs/SystemLogPage').then((m) => ({ default: m.SystemLogPage })))
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  )
}

export default function App() {
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
