import { Navigate, Outlet } from 'react-router-dom'
import { Result } from 'antd'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute() {
  const { accessToken, user } = useAuthStore()

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (user && user.role !== 'admin' && user.role !== 'superadmin') {
    return <Result status="403" title="عدم دسترسی" subTitle="حساب شما به پنل مدیریت دسترسی ندارد." />
  }

  return <Outlet />
}
