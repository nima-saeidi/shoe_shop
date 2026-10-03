import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Avatar, Button, Form, Input, Modal, Popconfirm, Switch, Table, Upload, message } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { createBrand, deleteBrand, listBrands, updateBrand, uploadBrandLogo } from '../../api/brands'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import type { Brand, BrandInput } from '../../types'

export function BrandListPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [form] = Form.useForm<BrandInput>()
  const [logoFiles, setLogoFiles] = useState<UploadFile[]>([])

  const { data, isLoading } = useQuery({ queryKey: ['brands'], queryFn: () => listBrands(1, 200) })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['brands'] })

  const createMutation = useMutation({
    mutationFn: async ({ input, file }: { input: BrandInput; file?: File }) => {
      const brand = await createBrand(input)
      if (file) await uploadBrandLogo(brand.id, file)
      return brand
    },
    onSuccess: () => {
      message.success('برند با موفقیت ایجاد شد')
      invalidate()
      closeModal()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, input, file }: { id: number; input: Partial<BrandInput>; file?: File }) => {
      const brand = await updateBrand(id, input)
      if (file) await uploadBrandLogo(id, file)
      return brand
    },
    onSuccess: () => {
      message.success('برند به‌روزرسانی شد')
      invalidate()
      closeModal()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      message.success('برند حذف شد')
      invalidate()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const logoMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadBrandLogo(id, file),
    onSuccess: () => {
      message.success('لوگو آپلود شد')
      invalidate()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  function openCreate() {
    setEditing(null)
    form.resetFields()
    setLogoFiles([])
    form.setFieldsValue({ is_active: true })
    setModalOpen(true)
  }

  function openEdit(brand: Brand) {
    setEditing(brand)
    setLogoFiles([])
    form.setFieldsValue({ name: brand.name, is_active: brand.is_active })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleSubmit(values: BrandInput) {
    const file = logoFiles[0]?.originFileObj
    const input = { name: values.name, is_active: values.is_active }
    if (editing) {
      updateMutation.mutate({ id: editing.id, input, file })
    } else {
      createMutation.mutate({ input, file })
    }
  }

  const columns = [
    {
      title: 'لوگو',
      dataIndex: 'logo_url',
      render: (url: string | null) => <Avatar shape="square" src={url ?? undefined} />,
    },
    { title: 'نام', dataIndex: 'name' },
    { title: 'اسلاگ', dataIndex: 'slug' },
    {
      title: 'وضعیت',
      dataIndex: 'is_active',
      render: (active: boolean) => (active ? <span style={{ color: 'green' }}>فعال</span> : <span style={{ color: '#999' }}>غیرفعال</span>),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: Brand) => (
        <>
          <Upload
            showUploadList={false}
            accept="image/*"
            customRequest={(({ file }) => logoMutation.mutate({ id: record.id, file: file as File })) as UploadProps['customRequest']}
          >
            <Button type="text" icon={<UploadOutlined />} title="آپلود لوگو" />
          </Upload>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="این برند حذف شود؟" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="برندها"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            برند جدید
          </Button>
        }
      />
      <Table rowKey="id" loading={isLoading} dataSource={data?.items ?? []} columns={columns} pagination={false} />

      <Modal
        title={editing ? 'ویرایش برند' : 'برند جدید'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="ذخیره"
        cancelText="انصراف"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="نام برند" rules={[{ required: true, message: 'نام را وارد کنید' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="لوگو (فایل تصویر)">
            <Upload
              accept="image/*"
              maxCount={1}
              listType="picture"
              fileList={logoFiles}
              beforeUpload={() => false}
              onChange={({ fileList }) => setLogoFiles(fileList.slice(-1))}
            >
              <Button icon={<UploadOutlined />}>انتخاب فایل لوگو</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="is_active" label="فعال" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
