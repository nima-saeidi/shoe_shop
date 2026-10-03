import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { getCurrentUser, login } from '../../api/auth'
import { getApiErrorMessage } from '../../api/client'
import { useAuthStore } from '../../store/authStore'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onFinish(values: LoginFormValues) {
    setError(null)
    setLoading(true)
    try {
      const tokens = await login(values.email, values.password)
      setTokens(tokens.access_token, tokens.refresh_token)
      const user = await getCurrentUser()
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        setError('این حساب دسترسی ادمین ندارد.')
        useAuthStore.getState().logout()
        return
      }
      setUser(user)
      navigate('/')
    } catch (err) {
      setError(getApiErrorMessage(err, 'ایمیل یا رمز عبور اشتباه است'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
      }}
    >
      <Card style={{ width: 380, maxWidth: "100%", borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32 }}>👞</div>
          <Typography.Title level={4} style={{ margin: '8px 0 0' }}>
            پنل مدیریت فروشگاه کفش
          </Typography.Title>
        </div>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" label="ایمیل" rules={[{ required: true, message: 'ایمیل را وارد کنید' }]}>
            <Input prefix={<UserOutlined />} dir="ltr" autoFocus />
          </Form.Item>
          <Form.Item name="password" label="رمز عبور" rules={[{ required: true, message: 'رمز عبور را وارد کنید' }]}>
            <Input.Password prefix={<LockOutlined />} dir="ltr" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              ورود
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
