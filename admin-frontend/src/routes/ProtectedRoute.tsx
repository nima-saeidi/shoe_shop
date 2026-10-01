import { Navigate, Outlet } from 'react-router-dom'
import { Result } from 'antd'
import { useAuthStore } from '../store/authStore'
import { isTokenExpired } from '../utils/jwt'

export function ProtectedRoute() {
  const { accessToken, refreshToken, user } = useAuthStore()

  // Once the refresh token itself has expired there is no way to renew the session.
  if (!accessToken || isTokenExpired(refreshToken)) {
    return <Navigate to="/login" replace />
  }

  if (user && user.role !== 'admin' && user.role !== 'superadmin') {
    return <Result status="403" title="عدم دسترسی" subTitle="حساب شما به پنل مدیریت دسترسی ندارد." />
  }

  return <Outlet />
}
