import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Select, Table, message } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { decideWholesaleRequest, listWholesaleRequests } from '../../api/wholesale'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { StatusTag } from '../../components/StatusTag'
import { WHOLESALE_STATUS_FA } from '../../utils/enums'
import type { WholesaleRequest } from '../../types'

export function WholesaleListPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('pending')

  const { data, isLoading } = useQuery({
    queryKey: ['wholesale-requests', status],
    queryFn: () => listWholesaleRequests(status),
  })

  const decideMutation = useMutation({
    mutationFn: ({ userId, approve }: { userId: number; approve: boolean }) => decideWholesaleRequest(userId, approve),
    onSuccess: () => {
      message.success('نتیجه ثبت شد')
      queryClient.invalidateQueries({ queryKey: ['wholesale-requests'] })
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const columns = [
    { title: 'نام', dataIndex: 'full_name' },
    { title: 'ایمیل', dataIndex: 'email', render: (v: string) => <span dir="ltr">{v}</span> },
    { title: 'موبایل', dataIndex: 'phone_number', render: (v: string | null) => <span dir="ltr">{v ?? '-'}</span> },
    { title: 'نام شرکت/فروشگاه', dataIndex: 'company_name' },
    {
      title: 'وضعیت',
      dataIndex: 'wholesale_status',
      render: (v: string) => <StatusTag value={v} labels={WHOLESALE_STATUS_FA} />,
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: WholesaleRequest) =>
        record.wholesale_status === 'pending' ? (
          <>
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => decideMutation.mutate({ userId: record.id, approve: true })}
              style={{ marginInlineEnd: 8 }}
            >
              تایید
            </Button>
            <Button size="small" danger icon={<CloseOutlined />} onClick={() => decideMutation.mutate({ userId: record.id, approve: false })}>
              رد
            </Button>
          </>
        ) : (
          <Link to={`/wallet/${record.id}`}>کیف پول</Link>
        ),
    },
  ]

  return (
    <div>
      <PageHeader title="درخواست‌های همکاری عمده" />
      <Select
        value={status}
        onChange={setStatus}
        style={{ width: 220, marginBottom: 16 }}
        options={[
          { value: 'pending', label: 'در انتظار بررسی' },
          { value: 'approved', label: 'تایید شده' },
          { value: 'rejected', label: 'رد شده' },
          { value: 'all', label: 'همه' },
        ]}
      />
      <Table rowKey="id" loading={isLoading} dataSource={data ?? []} columns={columns} pagination={false} />
    </div>
  )
}
