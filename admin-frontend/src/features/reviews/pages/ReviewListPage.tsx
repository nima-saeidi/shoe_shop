import { useState } from 'react'
import { Button, Popconfirm, Rate, Table, Tag } from 'antd'
import { CheckOutlined, DeleteOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/ui/PageHeader'
import { useDeleteReview, useModerateReview, useReviews } from '../hooks/useReviews'
import type { Review } from '../types'
import { message } from '@/services/message'

export function ReviewListPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useReviews(page)
  const moderateMutation = useModerateReview()
  const deleteMutation = useDeleteReview()

  const columns = [
    { title: 'محصول', dataIndex: 'product_name' },
    { title: 'کاربر', dataIndex: 'customer_name' },
    { title: 'امتیاز', dataIndex: 'rating', render: (v: number) => <Rate disabled value={v} /> },
    { title: 'متن نظر', dataIndex: 'comment', render: (v: string | null) => v ?? '-' },
    {
      title: 'وضعیت',
      dataIndex: 'is_approved',
      render: (approved: boolean) => <Tag color={approved ? 'green' : 'gold'}>{approved ? 'تایید شده' : 'در انتظار تایید'}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: Review) => (
        <>
          {!record.is_approved ? (
            <Button type="text" icon={<CheckOutlined />} onClick={() => moderateMutation.mutate({ id: record.id, approved: true })} />
          ) : (
            <Button type="text" icon={<EyeInvisibleOutlined />} onClick={() => moderateMutation.mutate({ id: record.id, approved: false })} />
          )}
          <Popconfirm
            title="این نظر حذف شود؟"
            onConfirm={() => deleteMutation.mutate(record.id, { onSuccess: () => message.success('نظر حذف شد') })}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="نظرات محصولات" />
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
