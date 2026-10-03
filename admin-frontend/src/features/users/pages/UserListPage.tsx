import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Select, Table, Tag, message } from 'antd'
import { Link } from 'react-router-dom'
import { listUsers, updateUser } from '../../api/users'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { Money } from '../../components/Money'
import { ROLE_FA } from '../../utils/enums'
import type { AdminUser, UserRole } from '../../types'

const ROLES: UserRole[] = ['customer', 'wholesale', 'admin', 'superadmin']

export function UserListPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({ queryKey: ['users', page], queryFn: () => listUsers(page, 20) })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: { role?: UserRole; is_active?: boolean } }) => updateUser(id, input),
    onSuccess: () => {
      message.success('کاربر به‌روزرسانی شد')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

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
          onChange={(value) => updateMutation.mutate({ id: record.id, input: { role: value } })}
          options={ROLES.map((r) => ({ value: r, label: ROLE_FA[r] }))}
        />
      ),
    },
    { title: 'کیف پول', dataIndex: 'wallet_balance', render: (v: number, record: AdminUser) => <Link to={`/wallet/${record.id}`}><Money value={v} /></Link> },
    {
      title: 'وضعیت',
      dataIndex: 'is_active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? 'فعال' : 'غیرفعال'}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: AdminUser) => (
        <Button size="small" onClick={() => updateMutation.mutate({ id: record.id, input: { is_active: !record.is_active } })}>
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
