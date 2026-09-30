import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Popconfirm, Rate, Table, Tag, message } from 'antd'
import { CheckOutlined, DeleteOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { deleteReview, listReviews, moderateReview } from '../../api/reviews'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import type { Review } from '../../types'

export function ReviewListPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({ queryKey: ['reviews', page], queryFn: () => listReviews(page, 20) })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['reviews'] })

  const moderateMutation = useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) => moderateReview(id, approved),
    onSuccess: invalidate,
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      message.success('نظر حذف شد')
      invalidate()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const columns = [
    { title: 'محصول', dataIndex: 'product_name' },
    { title: 'کاربر', dataIndex: 'customer_name' },
    { title: 'امتیاز', dataIndex: 'rating', render: (v: number) => <Rate disabled defaultValue={v} /> },
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
          <Popconfirm title="این نظر حذف شود؟" onConfirm={() => deleteMutation.mutate(record.id)}>
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
