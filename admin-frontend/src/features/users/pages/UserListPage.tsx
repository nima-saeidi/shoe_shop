import { useState } from 'react'
import { Button, Select, Table, Tag } from 'antd'
import { Link } from 'react-router-dom'
import { Money } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import type { UserRole } from '@/features/auth/types'
import { ROLE_FA } from '@/utils/enums'
import { useUpdateUser, useUsers } from '../hooks/useUsers'
import type { AdminUser, AdminUserUpdateInput } from '../types'
import { message } from '@/services/message'

const ROLES: UserRole[] = ['customer', 'wholesale', 'admin', 'superadmin']

export function UserListPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useUsers(page)
  const updateMutation = useUpdateUser()

  const update = (id: number, input: AdminUserUpdateInput) =>
    updateMutation.mutate({ id, input }, { onSuccess: () => message.success('کاربر به‌روزرسانی شد') })

  const columns = [
    {
      title: 'نام',
      dataIndex: 'full_name',
      render: (name: string, record: AdminUser) => (
        <>
          {name}
          {record.company_name && <div style={{ fontSize: 12, color: '#888' }}>{record.company_name}</div>}
        </>
      ),
    },
    { title: 'ایمیل', dataIndex: 'email', render: (v: string) => <span dir="ltr">{v}</span> },
    { title: 'موبایل', dataIndex: 'phone_number', render: (v: string | null) => <span dir="ltr">{v ?? '-'}</span> },
    {
      title: 'نقش',
      dataIndex: 'role',
      render: (role: UserRole, record: AdminUser) => (
        <Select
          size="small"
          value={role}
          style={{ width: 140 }}
          onChange={(value) => update(record.id, { role: value })}
          options={ROLES.map((r) => ({ value: r, label: ROLE_FA[r] }))}
        />
      ),
    },
    {
      title: 'کیف پول',
      dataIndex: 'wallet_balance',
      render: (v: number, record: AdminUser) => (
        <Link to={`/wallet/${record.id}`}>
          <Money value={v} />
        </Link>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'is_active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? 'فعال' : 'غیرفعال'}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: AdminUser) => (
        <Button size="small" onClick={() => update(record.id, { is_active: !record.is_active })}>
          {record.is_active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="کاربران" />
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
