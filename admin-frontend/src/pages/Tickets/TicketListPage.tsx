import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Select, Table } from 'antd'
import { Link } from 'react-router-dom'
import { listTickets } from '../../api/tickets'
import { PageHeader } from '../../components/PageHeader'
import { StatusTag } from '../../components/StatusTag'
import { TICKET_STATUS_FA } from '../../utils/enums'
import { formatDateTime } from '../../utils/format'
import type { Ticket } from '../../types'

export function TicketListPage() {
  const [status, setStatus] = useState<string | undefined>()
  const { data, isLoading } = useQuery({ queryKey: ['tickets', status], queryFn: () => listTickets(status) })

  const columns = [
    { title: 'موضوع', dataIndex: 'subject' },
    { title: 'مشتری', dataIndex: 'customer_name' },
    { title: 'وضعیت', dataIndex: 'status', render: (v: string) => <StatusTag value={v} labels={TICKET_STATUS_FA} /> },
    { title: 'آخرین بروزرسانی', dataIndex: 'updated_at', render: (v: string) => formatDateTime(v) },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: Ticket) => (
        <Link to={`/tickets/${record.id}`}>
          <Button size="small">مشاهده</Button>
        </Link>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="تیکت‌های پشتیبانی" />
      <Select
        allowClear
        placeholder="همه وضعیت‌ها"
        style={{ width: 220, marginBottom: 16 }}
        value={status}
        onChange={setStatus}
        options={[
          { value: 'open', label: 'باز' },
          { value: 'answered', label: 'پاسخ داده شده' },
          { value: 'closed', label: 'بسته شده' },
        ]}
      />
      <Table rowKey="id" loading={isLoading} dataSource={data ?? []} columns={columns} pagination={false} />
    </div>
  )
}
