import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Col, Descriptions, Form, Input, Row, Select, Table, Tag } from 'antd'
import { Money } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusTag } from '@/components/ui/StatusTag'
import { ORDER_STATUS_FA, ORDER_TYPE_FA, PAYMENT_STATUS_FA } from '@/utils/enums'
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, SHIPPING_PROVIDERS } from '../constants'
import { useOrder, useUpdateOrderStatus } from '../hooks/useOrders'
import type { OrderStatusUpdateInput } from '../types'
import { message } from '@/services/message'

export function OrderDetailPage() {
  const { id } = useParams()
  const orderId = Number(id)
  const [form] = Form.useForm<OrderStatusUpdateInput>()

  const { data: order, isLoading } = useOrder(orderId)
  const updateMutation = useUpdateOrderStatus(orderId)

  useEffect(() => {
    if (order) {
      form.setFieldsValue({
        status: order.status,
        payment_status: order.payment_status,
        shipping_provider: order.shipping_provider ?? undefined,
        tracking_code: order.tracking_code ?? '',
      })
    }
  }, [order, form])

  if (!order) {
    return <Card loading={isLoading} />
  }

  const itemColumns = [
    { title: 'محصول', dataIndex: 'product_name' },
    { title: 'سایز', dataIndex: 'size' },
    { title: 'رنگ', dataIndex: 'color' },
    { title: 'تعداد', dataIndex: 'quantity' },
    { title: 'قیمت واحد', dataIndex: 'unit_price', render: (v: number) => <Money value={v} /> },
    { title: 'جمع', dataIndex: 'line_total', render: (v: number) => <Money value={v} /> },
  ]

  return (
    <div>
      <PageHeader title={`سفارش ${order.order_number}`} />
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card
            title="اقلام سفارش"
            style={{ marginBottom: 16 }}
            extra={
              <>
                <StatusTag value={order.order_type} labels={ORDER_TYPE_FA} />{' '}
                {order.is_manual && <Tag>ثبت دستی</Tag>}
              </>
            }
          >
            <Table
              rowKey="id"
              dataSource={order.items}
              columns={itemColumns}
              pagination={false}
              size="small"
              footer={() => (
                <div style={{ textAlign: 'left' }}>
                  <div>جمع جزء: <Money value={order.subtotal} /></div>
                  <div>تخفیف: -<Money value={order.discount_total} /></div>
                  <div>هزینه ارسال: <Money value={order.shipping_cost} /></div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>مبلغ نهایی: <Money value={order.grand_total} /></div>
                </div>
              )}
            />
          </Card>

          <Card title="اطلاعات ارسال">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="گیرنده">
                {order.shipping_full_name} — <span dir="ltr">{order.shipping_phone}</span>
              </Descriptions.Item>
              <Descriptions.Item label="آدرس">
                {order.shipping_address}، {order.shipping_city}، کد پستی: <span dir="ltr">{order.shipping_postal_code}</span>
              </Descriptions.Item>
              {order.tracking_code && (
                <Descriptions.Item label="رهگیری">
                  {order.shipping_provider} — <span dir="ltr">{order.tracking_code}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="به‌روزرسانی سفارش">
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => updateMutation.mutate(values, { onSuccess: () => message.success('سفارش با موفقیت به‌روزرسانی شد') })}
            >
              <Form.Item name="status" label="وضعیت سفارش">
                <Select options={ORDER_STATUS_OPTIONS.map((s) => ({ value: s, label: ORDER_STATUS_FA[s] }))} />
              </Form.Item>
              <Form.Item name="payment_status" label="وضعیت پرداخت">
                <Select options={PAYMENT_STATUS_OPTIONS.map((s) => ({ value: s, label: PAYMENT_STATUS_FA[s] }))} />
              </Form.Item>
              <Form.Item name="shipping_provider" label="شرکت/روش ارسال">
                <Select allowClear options={SHIPPING_PROVIDERS.map((p) => ({ value: p, label: p }))} />
              </Form.Item>
              <Form.Item name="tracking_code" label="کد رهگیری مرسوله">
                <Input dir="ltr" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={updateMutation.isPending}>
                به‌روزرسانی
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
