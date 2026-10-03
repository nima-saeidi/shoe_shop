import { useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Switch, Table, Tag } from 'antd'
import { DeleteOutlined, PlusOutlined, PoweroffOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { Money } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import { DISCOUNT_TYPE_FA } from '@/utils/enums'
import { useCoupons, useCreateCoupon, useDeleteCoupon, useToggleCoupon } from '../hooks/useCoupons'
import type { Coupon, CouponInput, DiscountType } from '../types'
import { message } from '@/services/message'

interface CouponFormValues {
  code: string
  discount_type: DiscountType
  discount_value: number
  min_order_amount?: number
  max_uses?: number | null
  is_active?: boolean
  valid_from?: Dayjs | null
  valid_until?: Dayjs | null
}

export function CouponListPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<CouponFormValues>()

  const { data, isLoading } = useCoupons()
  const createMutation = useCreateCoupon()
  const toggleMutation = useToggleCoupon()
  const deleteMutation = useDeleteCoupon()

  function handleSubmit(values: CouponFormValues) {
    const input: CouponInput = {
      code: values.code,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      min_order_amount: values.min_order_amount ?? 0,
      max_uses: values.max_uses || undefined,
      is_active: values.is_active ?? true,
      valid_from: values.valid_from ? values.valid_from.toISOString() : undefined,
      valid_until: values.valid_until ? values.valid_until.toISOString() : undefined,
    }
    createMutation.mutate(input, {
      onSuccess: () => {
        message.success('کد تخفیف با موفقیت ایجاد شد')
        setModalOpen(false)
        form.resetFields()
      },
    })
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
          <Button
            type="text"
            icon={<PoweroffOutlined />}
            onClick={() => toggleMutation.mutate(record, { onSuccess: () => message.success('وضعیت کد تخفیف به‌روزرسانی شد') })}
          />
          <Popconfirm
            title="این کد تخفیف حذف شود؟"
            onConfirm={() => deleteMutation.mutate(record.id, { onSuccess: () => message.success('کد تخفیف حذف شد') })}
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
