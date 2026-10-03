import { Button, Card, Form, Input, InputNumber, Popconfirm, Table } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useAddVariant, useDeleteVariant } from '../hooks/useProducts'
import type { Product, ProductVariant, ProductVariantInput } from '../types'
import { message } from '@/services/message'

/** Size / color / stock rows of an existing product. */
export function ProductVariantsCard({ product }: { product: Product }) {
  const [form] = Form.useForm<ProductVariantInput>()
  const addVariantMutation = useAddVariant(product.id)
  const deleteVariantMutation = useDeleteVariant()

  const columns = [
    { title: 'سایز', dataIndex: 'size' },
    { title: 'رنگ', dataIndex: 'color' },
    { title: 'موجودی', dataIndex: 'stock_quantity' },
    { title: 'قیمت اضافه', dataIndex: 'extra_price' },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: ProductVariant) => (
        <Popconfirm
          title="این ورینت حذف شود؟"
          onConfirm={() => deleteVariantMutation.mutate(record.id, { onSuccess: () => message.success('ورینت حذف شد') })}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ]

  return (
    <Card title="ورینت‌ها (سایز / رنگ / موجودی)">
      <Table
        rowKey="id"
        dataSource={product.variants}
        columns={columns}
        pagination={false}
        size="small"
        style={{ marginBottom: 16 }}
      />
      <Form
        form={form}
        layout="inline"
        onFinish={(values) =>
          addVariantMutation.mutate(values, {
            onSuccess: () => {
              message.success('ورینت اضافه شد')
              form.resetFields()
            },
          })
        }
      >
        <Form.Item name="size" rules={[{ required: true }]}>
          <Input placeholder="سایز" />
        </Form.Item>
        <Form.Item name="color" rules={[{ required: true }]}>
          <Input placeholder="رنگ" />
        </Form.Item>
        <Form.Item name="stock_quantity" initialValue={0}>
          <InputNumber placeholder="موجودی" />
        </Form.Item>
        <Form.Item name="extra_price" initialValue={0}>
          <InputNumber placeholder="قیمت اضافه" />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" loading={addVariantMutation.isPending}>
            افزودن
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
