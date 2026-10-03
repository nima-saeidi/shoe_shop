import { Card, Col, Row, Statistic, Table } from 'antd'
import { Link } from 'react-router-dom'
import { Money } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import { useReports } from '../hooks/useReports'
import type { LowStockVariant } from '../types'

const formatNumber = (v: number | string | undefined) => new Intl.NumberFormat('en-US').format(Number(v))

export function ReportsPage() {
  const { data, isLoading } = useReports(14)

  return (
    <div>
      <PageHeader title="گزارش‌ها و آمار فروش" />
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card loading={isLoading}>
            <Statistic title="فروش خرد (تومان)" value={data?.revenue_split.retail ?? 0} formatter={formatNumber} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card loading={isLoading}>
            <Statistic title="فروش عمده (تومان)" value={data?.revenue_split.wholesale ?? 0} formatter={formatNumber} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="فروش روزانه (پرداخت‌شده)" style={{ marginBottom: 16 }} loading={isLoading}>
            <Table
              rowKey="day"
              size="small"
              pagination={false}
              dataSource={data?.sales ?? []}
              columns={[
                { title: 'تاریخ', dataIndex: 'day' },
                { title: 'تعداد سفارش', dataIndex: 'orders' },
                { title: 'مبلغ فروش', dataIndex: 'revenue', render: (v: number) => <Money value={v} /> },
              ]}
            />
          </Card>

          <Card title="هشدار کمبود موجودی" loading={isLoading}>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={data?.low_stock ?? []}
              columns={[
                {
                  title: 'محصول',
                  dataIndex: 'product_name',
                  render: (v: string, record: LowStockVariant) => <Link to={`/products/${record.product_id}/edit`}>{v}</Link>,
                },
                { title: 'سایز', dataIndex: 'size' },
                { title: 'رنگ', dataIndex: 'color' },
                {
                  title: 'موجودی',
                  dataIndex: 'stock_quantity',
                  render: (v: number) => <span style={{ color: v === 0 ? 'red' : '#d48806', fontWeight: 600 }}>{v}</span>,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="پرفروش‌ترین محصولات" style={{ marginBottom: 16 }} loading={isLoading}>
            <Table
              rowKey="name"
              size="small"
              pagination={false}
              dataSource={data?.top_products ?? []}
              columns={[
                { title: 'محصول', dataIndex: 'name' },
                { title: 'تعداد فروش', dataIndex: 'qty' },
              ]}
            />
          </Card>

          <Card title="پرفروش‌ترین سایزها" loading={isLoading}>
            <Table
              rowKey="size"
              size="small"
              pagination={false}
              dataSource={data?.top_sizes ?? []}
              columns={[
                { title: 'سایز', dataIndex: 'size' },
                { title: 'تعداد فروش', dataIndex: 'qty' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
