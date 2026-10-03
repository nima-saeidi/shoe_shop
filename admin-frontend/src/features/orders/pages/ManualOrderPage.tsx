import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, message } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { searchWalletUsers } from '../../api/wallet'
import { listProducts } from '../../api/products'
import { createManualOrder } from '../../api/orders'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'

export function ManualOrderPage() {
  const navigate = useNavigate()
  const [customerQuery, setCustomerQuery] = useState('')
  const [form] = Form.useForm()

  const { data: customers, isFetching: searchingCustomers } = useQuery({
    queryKey: ['wallet-users-search', customerQuery],
    queryFn: () => searchWalletUsers(customerQuery),
    enabled: customerQuery.length > 1,
  })

  const { data: productsPage } = useQuery({
    queryKey: ['products-for-manual-order'],
    queryFn: () => listProducts({ page: 1, page_size: 200, is_active: true }),
  })

  const variantOptions = (productsPage?.items ?? []).flatMap((product) =>
    product.variants.map((variant) => ({
      value: variant.id,
      label: `${product.name} — سایز ${variant.size} / ${variant.color} (موجودی: ${variant.stock_quantity})`,
    })),
  )

  const createMutation = useMutation({
    mutationFn: createManualOrder,
    onSuccess: (order) => {
      message.success(`پیش‌فاکتور سفارش ${order.order_number} ثبت شد`)
      navigate(`/orders/${order.id}`)
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  function handleSubmit(values: any) {
    const items = (values.items ?? []).map((item: { variant_id: number; quantity: number }) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
    }))
    createMutation.mutate({
      user_id: values.user_id,
      items,
      shipping_full_name: values.shipping_full_name,
      shipping_phone: values.shipping_phone,
      shipping_address: values.shipping_address,
      shipping_city: values.shipping_city,
      shipping_postal_code: values.shipping_postal_code,
      payment_method: values.payment_method,
      notes: values.notes,
    })
  }

  return (
    <div>
      <PageHeader title="ثبت سفارش تلفنی/عمده" />
      <p style={{ color: '#888', marginBottom: 16 }}>
        این فرم برای مواردی است که مشتری (معمولاً عمده‌فروش) تلفنی سفارش می‌دهد. پس از ثبت، یک پیش‌فاکتور برای
        مشتری ایجاد می‌شود که می‌تواند از طریق کیف پول یا واریز بانکی تسویه کند.
      </p>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ payment_method: 'bank_transfer', items: [{}] }}>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="انتخاب مشتری" style={{ marginBottom: 16 }}>
              <Form.Item name="user_id" rules={[{ required: true, message: 'مشتری را انتخاب کنید' }]}>
                <Select
                  showSearch
                  filterOption={false}
                  placeholder="جستجو با نام، ایمیل یا موبایل..."
                  loading={searchingCustomers}
                  onSearch={setCustomerQuery}
                  options={(customers ?? []).map((c) => ({
                    value: c.id,
                    label: `${c.full_name} — ${c.email}`,
                  }))}
                />
              </Form.Item>
            </Card>

            <Card title="آدرس ارسال">
              <Form.Item name="shipping_full_name" label="نام تحویل‌گیرنده" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="shipping_phone" label="شماره تماس" rules={[{ required: true }]}>
                <Input dir="ltr" />
              </Form.Item>
              <Form.Item name="shipping_address" label="آدرس" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="shipping_city" label="شهر" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="shipping_postal_code" label="کد پستی" rules={[{ required: true }]}>
                    <Input dir="ltr" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="payment_method" label="روش پرداخت">
                <Select
                  options={[
                    { value: 'bank_transfer', label: 'واریز بانکی / فیش' },
                    { value: 'wallet', label: 'کیف پول' },
                    { value: 'cod', label: 'پرداخت در محل' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="notes" label="توضیحات">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="اقلام سفارش">
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...rest }) => (
                      <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                        <Form.Item
                          {...rest}
                          name={[name, 'variant_id']}
                          rules={[{ required: true, message: 'محصول را انتخاب کنید' }]}
                          style={{ width: 360, marginBottom: 0 }}
                        >
                          <Select showSearch optionFilterProp="label" placeholder="محصول / سایز / رنگ" options={variantOptions} />
                        </Form.Item>
                        <Form.Item
                          {...rest}
                          name={[name, 'quantity']}
                          initialValue={1}
                          rules={[{ required: true }]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber min={1} placeholder="تعداد" />
                        </Form.Item>
                        {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                      افزودن ردیف
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
            <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 16 }} loading={createMutation.isPending}>
              ثبت سفارش و صدور پیش‌فاکتور
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
