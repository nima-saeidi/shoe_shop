import { useState } from 'react'
import { Button, Form, Input, Modal, Popconfirm, Select, Switch, Table } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../hooks/useCategories'
import type { Category, CategoryInput } from '../types'
import { message } from '@/services/message'

export function CategoryListPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form] = Form.useForm<CategoryInput>()

  const { data, isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  function openCreate() {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true })
    setModalOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    form.setFieldsValue({
      name: category.name,
      description: category.description ?? '',
      parent_id: category.parent_id ?? undefined,
      is_active: category.is_active,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleSubmit(values: CategoryInput) {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, input: values },
        {
          onSuccess: () => {
            message.success('دسته‌بندی به‌روزرسانی شد')
            closeModal()
          },
        },
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          message.success('دسته‌بندی با موفقیت ایجاد شد')
          closeModal()
        },
      })
    }
  }

  const categories = data?.items ?? []

  const columns = [
    { title: 'نام', dataIndex: 'name' },
    { title: 'اسلاگ', dataIndex: 'slug' },
    {
      title: 'والد',
      dataIndex: 'parent_id',
      render: (parentId: number | null) => categories.find((c) => c.id === parentId)?.name ?? '-',
    },
    {
      title: 'وضعیت',
      dataIndex: 'is_active',
      render: (active: boolean) => (active ? <span style={{ color: 'green' }}>فعال</span> : <span style={{ color: '#999' }}>غیرفعال</span>),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: Category) => (
        <>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="این دسته‌بندی حذف شود؟"
            onConfirm={() => deleteMutation.mutate(record.id, { onSuccess: () => message.success('دسته‌بندی حذف شد') })}
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
        title="دسته‌بندی‌ها"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            دسته‌بندی جدید
          </Button>
        }
      />
      <Table rowKey="id" loading={isLoading} dataSource={categories} columns={columns} pagination={false} />

      <Modal
        title={editing ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="ذخیره"
        cancelText="انصراف"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="نام" rules={[{ required: true, message: 'نام را وارد کنید' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="توضیحات">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="parent_id" label="دسته‌بندی والد">
            <Select
              allowClear
              options={categories.filter((c) => c.id !== editing?.id).map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="is_active" label="فعال" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
