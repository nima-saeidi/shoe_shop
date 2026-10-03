import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Select, Table, Tag } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { listOrders } from '../../api/orders'
import { PageHeader } from '../../components/PageHeader'
import { StatusTag } from '../../components/StatusTag'
import { Money } from '../../components/Money'
import { ORDER_STATUS_FA, ORDER_TYPE_FA, PAYMENT_STATUS_FA } from '../../utils/enums'
import { formatDateTime } from '../../utils/format'
import type { Order } from '../../types'

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']

export function OrderListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()
  const [orderType, setOrderType] = useState<string | undefined>()

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, status, orderType],
    queryFn: () => listOrders({ page, page_size: 20, status, order_type: orderType }),
  })

  const columns = [
    {
      title: 'شماره سفارش',
      dataIndex: 'order_number',
      render: (value: string, record: Order) => (
        <>
          <Link to={`/orders/${record.id}`}>{value}</Link>
          {record.is_manual && <Tag style={{ marginInlineStart: 6 }}>ثبت دستی</Tag>}
        </>
      ),
    },
    { title: 'مشتری', dataIndex: 'shipping_full_name' },
    {
      title: 'نوع',
      dataIndex: 'order_type',
      render: (value: string) => <StatusTag value={value} labels={ORDER_TYPE_FA} />,
    },
    { title: 'مبلغ', dataIndex: 'grand_total', render: (value: number) => <Money value={value} /> },
    {
      title: 'پرداخت',
      dataIndex: 'payment_status',
      render: (value: string) => <StatusTag value={value} labels={PAYMENT_STATUS_FA} />,
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      render: (value: string) => <StatusTag value={value} labels={ORDER_STATUS_FA} />,
    },
    { title: 'تاریخ', dataIndex: 'created_at', render: (value: string) => formatDateTime(value) },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: Order) => (
        <Button size="small" onClick={() => navigate(`/orders/${record.id}`)}>
          مشاهده
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="سفارش‌ها"
        extra={
          <Button type="primary" onClick={() => navigate('/orders/manual/new')}>
            ثبت سفارش تلفنی
          </Button>
        }
      />
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="همه وضعیت‌ها"
          style={{ width: 200 }}
          value={status}
          onChange={(v) => {
            setPage(1)
            setStatus(v)
          }}
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: ORDER_STATUS_FA[s] }))}
        />
        <Select
          allowClear
          placeholder="خرد و عمده"
          style={{ width: 160 }}
          value={orderType}
          onChange={(v) => {
            setPage(1)
            setOrderType(v)
          }}
          options={[
            { value: 'retail', label: 'فقط خرد' },
            { value: 'wholesale', label: 'فقط عمده' },
          ]}
        />
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.items ?? []}
        columns={columns}
        pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: false }}
      />
    </div>
  )
}
