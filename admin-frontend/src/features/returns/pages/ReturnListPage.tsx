import { useState } from 'react'
import { Button, Select, Table } from 'antd'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusTag } from '@/components/ui/StatusTag'
import { RETURN_REASON_FA, RETURN_STATUS_FA } from '@/utils/enums'
import { useModerateReturn, useReturns } from '../hooks/useReturns'
import type { ReturnRequestItem, ReturnStatus } from '../types'
import { message } from '@/services/message'

export function ReturnListPage() {
  const [status, setStatus] = useState<string | undefined>()

  const { data, isLoading } = useReturns(status)
  const moderateMutation = useModerateReturn()

  const moderate = (id: number, newStatus: ReturnStatus) =>
    moderateMutation.mutate({ id, status: newStatus }, { onSuccess: () => message.success('وضعیت درخواست مرجوعی به‌روزرسانی شد') })

  const columns = [
    {
      title: 'سفارش',
      dataIndex: 'order_number',
      render: (v: string | null, record: ReturnRequestItem) => <Link to={`/orders/${record.order_id}`}>{v ?? record.order_id}</Link>,
    },
    {
      title: 'محصول',
      key: 'product',
      render: (_: unknown, record: ReturnRequestItem) => `${record.product_name ?? '-'} (${record.size}/${record.color})`,
    },
    { title: 'مشتری', dataIndex: 'customer_name' },
    { title: 'دلیل', dataIndex: 'reason', render: (v: string) => RETURN_REASON_FA[v] ?? v },
    { title: 'وضعیت', dataIndex: 'status', render: (v: string) => <StatusTag value={v} labels={RETURN_STATUS_FA} /> },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: ReturnRequestItem) => {
        if (record.status === 'pending') {
          return (
            <>
              <Button size="small" type="primary" onClick={() => moderate(record.id, 'approved')} style={{ marginInlineEnd: 8 }}>
                تایید
              </Button>
              <Button size="small" danger onClick={() => moderate(record.id, 'rejected')}>
                رد
              </Button>
            </>
          )
        }
        if (record.status === 'approved') {
          return (
            <Button size="small" type="primary" onClick={() => moderate(record.id, 'completed')}>
              تکمیل و بازگشت وجه
            </Button>
          )
        }
        return null
      },
    },
  ]

  return (
    <div>
      <PageHeader title="درخواست‌های مرجوعی" />
      <Select
        allowClear
        placeholder="همه وضعیت‌ها"
        style={{ width: 220, marginBottom: 16 }}
        value={status}
        onChange={setStatus}
        options={[
          { value: 'pending', label: 'در انتظار بررسی' },
          { value: 'approved', label: 'تایید شده' },
          { value: 'rejected', label: 'رد شده' },
          { value: 'completed', label: 'تکمیل شده' },
        ]}
      />
      <Table rowKey="id" loading={isLoading} dataSource={data ?? []} columns={columns} pagination={false} />
    </div>
  )
}
