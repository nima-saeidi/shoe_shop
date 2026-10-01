import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Dropdown, Layout, Menu, Space, Typography } from 'antd'
import {
  AppstoreOutlined,
  BarChartOutlined,
  DashboardOutlined,
  FileTextOutlined,
  GiftOutlined,
  LogoutOutlined,
  MessageOutlined,
  ReconciliationOutlined,
  SettingOutlined,
  ShoppingOutlined,
  StarOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Sider, Header, Content } = Layout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'داشبورد' },
  { key: '/products', icon: <ShoppingOutlined />, label: 'محصولات' },
  { key: '/categories', icon: <AppstoreOutlined />, label: 'دسته‌بندی‌ها' },
  { key: '/brands', icon: <TagsOutlined />, label: 'برندها' },
  { key: '/orders', icon: <ReconciliationOutlined />, label: 'سفارش‌ها' },
  { key: '/orders/manual/new', icon: <ReconciliationOutlined />, label: 'ثبت سفارش تلفنی/عمده' },
  { type: 'divider' as const },
  { key: '/wholesale', icon: <TeamOutlined />, label: 'درخواست‌های همکاری عمده' },
  { key: '/wallet', icon: <WalletOutlined />, label: 'کیف پول مشتریان' },
  { key: '/users', icon: <UserOutlined />, label: 'کاربران' },
  { type: 'divider' as const },
  { key: '/returns', icon: <ReconciliationOutlined />, label: 'درخواست‌های مرجوعی' },
  { key: '/tickets', icon: <MessageOutlined />, label: 'تیکت‌های پشتیبانی' },
  { key: '/reviews', icon: <StarOutlined />, label: 'نظرات محصولات' },
  { type: 'divider' as const },
  { key: '/coupons', icon: <GiftOutlined />, label: 'کدهای تخفیف' },
  { key: '/reports', icon: <BarChartOutlined />, label: 'گزارش‌ها و آمار فروش' },
  { type: 'divider' as const },
  { key: '/logs', icon: <FileTextOutlined />, label: 'لاگ‌های سیستم' },
  { key: '/settings', icon: <SettingOutlined />, label: 'پیامک و درگاه پرداخت' },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [broken, setBroken] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const selectedKey = useMemo(() => {
    const keys: string[] = []
    for (const item of menuItems) {
      if ('key' in item && item.key && item.key !== '/' && location.pathname.startsWith(item.key)) {
        keys.push(item.key)
      }
    }
    if (keys.length > 0) return keys[0]
    return location.pathname === '/' ? '/' : location.pathname
  }, [location.pathname])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* On phones/tablets the sidebar collapses to zero width and opens as an overlay. */}
      <Sider
        collapsible
        breakpoint="lg"
        collapsedWidth={broken ? 0 : 80}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onBreakpoint={(isBroken) => {
          setBroken(isBroken)
          setCollapsed(isBroken)
        }}
        width={260}
        theme="dark"
        style={broken ? { position: 'fixed', insetBlock: 0, insetInlineStart: 0, zIndex: 100, overflowY: 'auto' } : undefined}
      >
        <div
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: collapsed ? 16 : 18,
            padding: '18px 16px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {collapsed ? '👞' : '👞 فروشگاه کفش'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key)
            if (broken) setCollapsed(true)
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: broken ? '0 16px 0 56px' : '0 20px', gap: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Text strong ellipsis>پنل مدیریت فروشگاه کفش</Typography.Text>
          <Dropdown
            menu={{
              items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'خروج از حساب' }],
              onClick: ({ key }) => {
                if (key === 'logout') {
                  logout()
                  navigate('/login')
                }
              },
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              {!broken && <span>{user?.full_name}</span>}
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: broken ? 12 : 20, minWidth: 0 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
