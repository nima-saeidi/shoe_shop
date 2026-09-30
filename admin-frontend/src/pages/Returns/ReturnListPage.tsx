import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Select, Table, message } from 'antd'
import { Link } from 'react-router-dom'
import { listReturns, moderateReturn } from '../../api/returns'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { StatusTag } from '../../components/StatusTag'
import { RETURN_REASON_FA, RETURN_STATUS_FA } from '../../utils/enums'
import type { ReturnRequestItem, ReturnStatus } from '../../types'

export function ReturnListPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<string | undefined>()

  const { data, isLoading } = useQuery({ queryKey: ['returns', status], queryFn: () => listReturns(status) })

  const moderateMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: ReturnStatus }) => moderateReturn(id, newStatus),
    onSuccess: () => {
      message.success('وضعیت درخواست مرجوعی به‌روزرسانی شد')
      queryClient.invalidateQueries({ queryKey: ['returns'] })
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

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
              <Button size="small" type="primary" onClick={() => moderateMutation.mutate({ id: record.id, newStatus: 'approved' })} style={{ marginInlineEnd: 8 }}>
                تایید
              </Button>
              <Button size="small" danger onClick={() => moderateMutation.mutate({ id: record.id, newStatus: 'rejected' })}>
                رد
              </Button>
            </>
          )
        }
        if (record.status === 'approved') {
          return (
            <Button size="small" type="primary" onClick={() => moderateMutation.mutate({ id: record.id, newStatus: 'completed' })}>
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
