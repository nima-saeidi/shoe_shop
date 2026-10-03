import { useState } from 'react'
import { Button, Select, Table } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusTag } from '@/components/ui/StatusTag'
import { WHOLESALE_STATUS_FA } from '@/utils/enums'
import { useDecideWholesale, useWholesaleRequests } from '../hooks/useWholesale'
import type { WholesaleRequest } from '../types'
import { message } from '@/services/message'

export function WholesaleListPage() {
  const [status, setStatus] = useState('pending')

  const { data, isLoading } = useWholesaleRequests(status)
  const decideMutation = useDecideWholesale()

  const decide = (userId: number, approve: boolean) =>
    decideMutation.mutate({ userId, approve }, { onSuccess: () => message.success('نتیجه ثبت شد') })

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
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => decide(record.id, true)} style={{ marginInlineEnd: 8 }}>
              تایید
            </Button>
            <Button size="small" danger icon={<CloseOutlined />} onClick={() => decide(record.id, false)}>
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
