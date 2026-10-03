import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { getApiErrorMessage } from '@/services/apiClient'
import { NotAdminError, useLogin } from '../hooks/useLogin'
import type { LoginInput } from '../types'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()

  const error = login.error
    ? login.error instanceof NotAdminError
      ? login.error.message
      : getApiErrorMessage(login.error, 'ایمیل یا رمز عبور اشتباه است')
    : null

  function onFinish(values: LoginInput) {
    login.mutate(values, { onSuccess: () => navigate('/') })
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
      <Card style={{ width: 380, maxWidth: '100%', borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32 }}>👞</div>
          <Typography.Title level={4} style={{ margin: '8px 0 0' }}>
            پنل مدیریت فروشگاه کفش
          </Typography.Title>
        </div>
        {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" label="ایمیل" rules={[{ required: true, message: 'ایمیل را وارد کنید' }]}>
            <Input prefix={<UserOutlined />} dir="ltr" autoFocus />
          </Form.Item>
          <Form.Item name="password" label="رمز عبور" rules={[{ required: true, message: 'رمز عبور را وارد کنید' }]}>
            <Input.Password prefix={<LockOutlined />} dir="ltr" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={login.isPending}>
              ورود
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
