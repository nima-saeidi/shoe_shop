import { useState } from 'react'
import { Button, Image, Input, Popconfirm, Table, Tag } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { Money } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import { useDeleteProduct, useProducts } from '../hooks/useProducts'
import type { Product } from '../types'
import { message } from '@/services/message'

export function ProductListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const { data, isLoading } = useProducts({ page, page_size: 20, q: q || undefined })
  const deleteMutation = useDeleteProduct()

  const columns = [
    {
      title: 'تصویر',
      dataIndex: 'images',
      render: (images: Product['images']) => {
        const primary = images.find((i) => i.is_primary) ?? images[0]
        return primary ? <Image src={primary.image_url} width={46} height={46} style={{ objectFit: 'cover', borderRadius: 6 }} /> : '-'
      },
    },
    {
      title: 'نام',
      dataIndex: 'name',
      render: (name: string, record: Product) => <Link to={`/products/${record.id}/edit`}>{name}</Link>,
    },
    { title: 'کد کالا', dataIndex: 'sku' },
    {
      title: 'قیمت',
      dataIndex: 'price',
      render: (price: number, record: Product) =>
        record.discount_price ? (
          <>
            <span style={{ textDecoration: 'line-through', color: '#999', marginInlineEnd: 6 }}>
              <Money value={price} suffix="" />
            </span>
            <Money value={record.discount_price} />
          </>
        ) : (
          <Money value={price} />
        ),
    },
    {
      title: 'موجودی',
      dataIndex: 'variants',
      render: (variants: Product['variants']) => variants.reduce((sum, v) => sum + v.stock_quantity, 0),
    },
    {
      title: 'وضعیت',
      dataIndex: 'is_active',
      render: (active: boolean, record: Product) => (
        <>
          <Tag color={active ? 'green' : 'default'}>{active ? 'فعال' : 'غیرفعال'}</Tag>
          {record.is_featured && <Tag color="gold">ویژه</Tag>}
        </>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <>
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/products/${record.id}/edit`)} />
          <Popconfirm
            title="این محصول حذف شود؟"
            onConfirm={() => deleteMutation.mutate(record.id, { onSuccess: () => message.success('محصول حذف شد') })}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="محصولات"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/new')}>
            محصول جدید
          </Button>
        }
      />
      <Input.Search
        placeholder="جستجوی محصول..."
        allowClear
        style={{ maxWidth: 320, marginBottom: 16 }}
        onSearch={(value) => {
          setPage(1)
          setQ(value)
        }}
      />
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.items ?? []}
        columns={columns}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.total ?? 0,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />
    </div>
  )
}
