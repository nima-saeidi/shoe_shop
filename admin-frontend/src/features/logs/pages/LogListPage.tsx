import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, DatePicker, Input, Select, Table } from 'antd'
import { Link } from 'react-router-dom'
import { listLogCategories, listLogs } from '../../api/logs'
import { PageHeader } from '../../components/PageHeader'
import { StatusTag } from '../../components/StatusTag'
import { LOG_CATEGORY_FA, LOG_LEVEL_FA } from '../../utils/enums'
import { formatDateTime } from '../../utils/format'

export function LogListPage() {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<string | undefined>()
  const [level, setLevel] = useState<string | undefined>()
  const [q, setQ] = useState<string | undefined>()
  const [dateRange, setDateRange] = useState<[string, string] | undefined>()

  const { data: categories } = useQuery({ queryKey: ['log-categories'], queryFn: listLogCategories })
  const { data, isLoading } = useQuery({
    queryKey: ['logs', page, category, level, q, dateRange],
    queryFn: () =>
      listLogs({
        page,
        page_size: 50,
        category,
        level,
        q,
        date_from: dateRange?.[0],
        date_to: dateRange?.[1],
      }),
  })

  const columns = [
    { title: 'زمان', dataIndex: 'created_at', render: (v: string) => formatDateTime(v) },
    { title: 'سطح', dataIndex: 'level', render: (v: string) => <StatusTag value={v} labels={LOG_LEVEL_FA} /> },
    { title: 'دسته', dataIndex: 'category', render: (v: string) => LOG_CATEGORY_FA[v] ?? v },
    { title: 'پیام', dataIndex: 'message' },
    { title: 'انجام‌دهنده', dataIndex: 'actor_name', render: (v: string | null) => v ?? 'سیستم' },
    { title: 'IP', dataIndex: 'ip_address', render: (v: string | null) => <span dir="ltr">{v ?? '-'}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="لاگ فعالیت‌ها"
        extra={
          <Link to="/logs/system">
            <Button>لاگ خام سرور</Button>
          </Link>
        }
      />
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Select
          allowClear
          placeholder="همه دسته‌ها"
          style={{ width: 180 }}
          value={category}
          onChange={setCategory}
          options={(categories ?? []).map((c) => ({ value: c, label: LOG_CATEGORY_FA[c] ?? c }))}
        />
        <Select
          allowClear
          placeholder="همه سطوح"
          style={{ width: 150 }}
          value={level}
          onChange={setLevel}
          options={[
            { value: 'info', label: 'اطلاعات' },
            { value: 'warning', label: 'هشدار' },
            { value: 'error', label: 'خطا' },
          ]}
        />
        <Input.Search placeholder="جستجو در پیام..." style={{ width: 240 }} onSearch={setQ} allowClear />
        <DatePicker.RangePicker
          showTime
          onChange={(values) => {
            if (!values || !values[0] || !values[1]) {
              setDateRange(undefined)
              return
            }
            setDateRange([values[0].toISOString(), values[1].toISOString()])
          }}
        />
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.items ?? []}
        columns={columns}
        size="small"
        pagination={{ current: page, pageSize: 50, total: data?.total ?? 0, onChange: setPage, showSizeChanger: false }}
      />
    </div>
  )
}
