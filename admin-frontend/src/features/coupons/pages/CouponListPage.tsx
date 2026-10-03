import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Switch, Table, Tag, message } from 'antd'
import { DeleteOutlined, PlusOutlined, PoweroffOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { createCoupon, deleteCoupon, listCoupons, updateCoupon } from '../../api/coupons'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { Money } from '../../components/Money'
import { DISCOUNT_TYPE_FA } from '../../utils/enums'
import type { Coupon, CouponInput } from '../../types'

export function CouponListPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: () => listCoupons(1, 100) })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['coupons'] })

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      message.success('کد تخفیف با موفقیت ایجاد شد')
      invalidate()
      setModalOpen(false)
      form.resetFields()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const toggleMutation = useMutation({
    mutationFn: (coupon: Coupon) => updateCoupon(coupon.id, { is_active: !coupon.is_active }),
    onSuccess: () => {
      message.success('وضعیت کد تخفیف به‌روزرسانی شد')
      invalidate()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      message.success('کد تخفیف حذف شد')
      invalidate()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  function handleSubmit(values: any) {
    const input: CouponInput = {
      code: values.code,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      min_order_amount: values.min_order_amount ?? 0,
      max_uses: values.max_uses || undefined,
      is_active: values.is_active ?? true,
      valid_from: values.valid_from ? dayjs(values.valid_from).toISOString() : undefined,
      valid_until: values.valid_until ? dayjs(values.valid_until).toISOString() : undefined,
    }
    createMutation.mutate(input)
  }

  const columns = [
    { title: 'کد', dataIndex: 'code', render: (v: string) => <span dir="ltr">{v}</span> },
    { title: 'نوع', dataIndex: 'discount_type', render: (v: string) => DISCOUNT_TYPE_FA[v] },
    {
      title: 'مقدار',
      dataIndex: 'discount_value',
      render: (v: number, record: Coupon) => (record.discount_type === 'percent' ? `${v}٪` : <Money value={v} />),
    },
    {
      title: 'میزان استفاده',
      key: 'usage',
      render: (_: unknown, record: Coupon) => `${record.used_count}${record.max_uses ? ` / ${record.max_uses}` : ''}`,
    },
    {
      title: 'وضعیت',
      dataIndex: 'is_active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? 'فعال' : 'غیرفعال'}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: Coupon) => (
        <>
          <Button type="text" icon={<PoweroffOutlined />} onClick={() => toggleMutation.mutate(record)} />
          <Popconfirm title="این کد تخفیف حذف شود؟" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="کدهای تخفیف"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            کد تخفیف جدید
          </Button>
        }
      />
      <Table rowKey="id" loading={isLoading} dataSource={data?.items ?? []} columns={columns} pagination={false} />

      <Modal
        title="کد تخفیف جدید"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText="ذخیره"
        cancelText="انصراف"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ discount_type: 'percent', is_active: true, min_order_amount: 0 }}>
          <Form.Item name="code" label="کد تخفیف" rules={[{ required: true }]}>
            <Input style={{ textTransform: 'uppercase' }} dir="ltr" />
          </Form.Item>
          <Form.Item name="discount_type" label="نوع تخفیف">
            <Select
              options={[
                { value: 'percent', label: 'درصدی' },
                { value: 'fixed', label: 'مبلغ ثابت' },
              ]}
            />
          </Form.Item>
          <Form.Item name="discount_value" label="مقدار تخفیف" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="min_order_amount" label="حداقل مبلغ سفارش">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="max_uses" label="حداکثر تعداد استفاده">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="valid_from" label="تاریخ شروع اعتبار">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="valid_until" label="تاریخ پایان اعتبار">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="فعال" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
