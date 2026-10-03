import { Card, Col, Row, Statistic, Table, Tag } from 'antd'
import {
  BellOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { Money } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusTag } from '@/components/ui/StatusTag'
import type { Order } from '@/features/orders/types'
import { ORDER_STATUS_FA } from '@/utils/enums'
import { formatDate } from '@/utils/format'
import { useDashboardStats } from '../hooks/useDashboard'

export function DashboardPage() {
  const { data, isLoading } = useDashboardStats()

  const columns = [
    {
      title: 'شماره سفارش',
      dataIndex: 'order_number',
      render: (value: string, record: Order) => <Link to={`/orders/${record.id}`}>{value}</Link>,
    },
    { title: 'مبلغ', dataIndex: 'grand_total', render: (value: number) => <Money value={value} /> },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      render: (value: string) => <StatusTag value={value} labels={ORDER_STATUS_FA} />,
    },
    { title: 'تاریخ', dataIndex: 'created_at', render: (value: string) => formatDate(value) },
  ]

  return (
    <div>
      <PageHeader title="داشبورد" />
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic title="تعداد کل سفارش‌ها" value={data?.total_orders ?? 0} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic
              title="مجموع فروش (تومان)"
              value={data?.total_revenue ?? 0}
              prefix={<WalletOutlined />}
              formatter={(value) => new Intl.NumberFormat('en-US').format(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic title="تعداد محصولات" value={data?.total_products ?? 0} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic title="تعداد مشتریان" value={data?.total_users ?? 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Link to="/wholesale">
            <Card loading={isLoading}>
              <Statistic
                title="درخواست‌های عمده در انتظار بررسی"
                value={data?.pending_wholesale ?? 0}
                prefix={<BellOutlined />}
                styles={{ content: { color: '#d48806' } }}
              />
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12}>
          <Link to="/reports">
            <Card loading={isLoading}>
              <Statistic
                title="اقلام با موجودی کم"
                value={data?.low_stock_count ?? 0}
                prefix={<ExclamationCircleOutlined />}
                styles={{ content: { color: '#cf1322' } }}
              />
            </Card>
          </Link>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="سفارش‌های اخیر" loading={isLoading}>
            <Table
              rowKey="id"
              dataSource={data?.recent_orders ?? []}
              columns={columns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="وضعیت سفارش‌ها" loading={isLoading}>
            {Object.entries(data?.status_counts ?? {}).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <StatusTag value={status} labels={ORDER_STATUS_FA} />
                <Tag>{count}</Tag>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              <span>سفارش‌های در انتظار</span>
              <strong>{data?.pending_orders ?? 0}</strong>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
