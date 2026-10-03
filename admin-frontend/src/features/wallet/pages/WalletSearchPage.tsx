import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input, Table } from 'antd'
import { Link } from 'react-router-dom'
import { searchWalletUsers } from '../../api/wallet'
import { PageHeader } from '../../components/PageHeader'
import { Money } from '../../components/Money'
import type { WalletUserSummary } from '../../types'

export function WalletSearchPage() {
  const [q, setQ] = useState('')

  const { data, isFetching } = useQuery({
    queryKey: ['wallet-search', q],
    queryFn: () => searchWalletUsers(q),
    enabled: q.length > 1,
  })

  const columns = [
    { title: 'نام', dataIndex: 'full_name' },
    { title: 'ایمیل', dataIndex: 'email', render: (v: string) => <span dir="ltr">{v}</span> },
    { title: 'موبایل', dataIndex: 'phone_number', render: (v: string | null) => <span dir="ltr">{v ?? '-'}</span> },
    { title: 'موجودی کیف پول', dataIndex: 'wallet_balance', render: (v: number) => <Money value={v} /> },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: WalletUserSummary) => <Link to={`/wallet/${record.id}`}>مشاهده و شارژ</Link>,
    },
  ]

  return (
    <div>
      <PageHeader title="کیف پول مشتریان" />
      <Input.Search
        placeholder="جستجو بر اساس نام، ایمیل یا شماره موبایل..."
        style={{ maxWidth: 400, marginBottom: 16 }}
        onSearch={setQ}
        allowClear
      />
      {q.length > 1 ? (
        <Table rowKey="id" loading={isFetching} dataSource={data ?? []} columns={columns} pagination={false} />
      ) : (
        <p style={{ color: '#888' }}>برای مشاهده کیف پول، مشتری را جستجو کنید.</p>
      )}
    </div>
  )
}
