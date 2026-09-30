import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Switch,
  Table,
  Tag,
  Upload,
  message,
} from 'antd'
import type { UploadProps } from 'antd'
import { DeleteOutlined, StarFilled, StarOutlined, UploadOutlined } from '@ant-design/icons'
import { listCategories } from '../../api/categories'
import { listBrands } from '../../api/brands'
import {
  addVariant,
  createProduct,
  deleteProductImage,
  deleteVariant,
  getProduct,
  setPrimaryImage,
  updateProduct,
  uploadProductImages,
} from '../../api/products'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { GENDER_FA } from '../../utils/enums'
import type { ProductInput, ProductUpdateInput, ProductVariant, ProductVariantInput } from '../../types'

const GENDERS = ['unisex', 'men', 'women', 'kids']

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const productId = id ? Number(id) : undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [variantColor, setVariantColor] = useState<string | undefined>()

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => listCategories(1, 200) })
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: () => listBrands(1, 200) })
  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        discount_price: product.discount_price ?? undefined,
        wholesale_price: product.wholesale_price ?? undefined,
        wholesale_min_qty: product.wholesale_min_qty,
        gender: product.gender,
        category_id: product.category_id,
        brand_id: product.brand_id,
        is_active: product.is_active,
        is_featured: product.is_featured,
      })
    }
  }, [product, form])

  const invalidateProduct = () => {
    queryClient.invalidateQueries({ queryKey: ['product', productId] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (created) => {
      message.success('محصول با موفقیت ایجاد شد')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate(`/products/${created.id}/edit`)
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: (values: ProductUpdateInput) => updateProduct(productId!, values),
    onSuccess: () => {
      message.success('محصول با موفقیت به‌روزرسانی شد')
      invalidateProduct()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const addVariantMutation = useMutation({
    mutationFn: (values: { size: string; color: string; stock_quantity: number; extra_price: number }) =>
      addVariant(productId!, values),
    onSuccess: () => {
      message.success('ورینت اضافه شد')
      invalidateProduct()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const deleteVariantMutation = useMutation({
    mutationFn: deleteVariant,
    onSuccess: () => {
      message.success('ورینت حذف شد')
      invalidateProduct()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const uploadImagesMutation = useMutation({
    mutationFn: ({ files, color }: { files: File[]; color?: string }) => uploadProductImages(productId!, files, color),
    onSuccess: (images) => {
      message.success(`${images.length} تصویر آپلود شد`)
      invalidateProduct()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const deleteImageMutation = useMutation({
    mutationFn: deleteProductImage,
    onSuccess: () => {
      message.success('تصویر حذف شد')
      invalidateProduct()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const setPrimaryMutation = useMutation({
    mutationFn: (imageId: number) => setPrimaryImage(productId!, imageId),
    onSuccess: () => invalidateProduct(),
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  function handleSubmit(values: Record<string, any>) {
    if (isEdit) {
      // The edit form never renders the sizes/colors/stock_quantity fields, so `values`
      // already only contains ProductUpdateInput's fields.
      updateMutation.mutate(values as ProductUpdateInput)
      return
    }

    const sizeList = ((values.sizes as string) || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const colorList = ((values.colors as string) || '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    const variants: ProductVariantInput[] = []
    for (const size of sizeList.length ? sizeList : ['One Size']) {
      for (const color of colorList.length ? colorList : ['Default']) {
        variants.push({ size, color, stock_quantity: values.stock_quantity ?? 0, extra_price: 0 })
      }
    }

    const input: ProductInput = {
      name: values.name,
      description: values.description || null,
      price: values.price,
      discount_price: values.discount_price ?? null,
      wholesale_price: values.wholesale_price ?? null,
      wholesale_min_qty: values.wholesale_min_qty ?? 1,
      sku: values.sku,
      gender: values.gender,
      category_id: values.category_id,
      brand_id: values.brand_id,
      is_active: values.is_active,
      is_featured: values.is_featured,
      variants,
    }
    createMutation.mutate(input)
  }

  const variantColumns = [
    { title: 'سایز', dataIndex: 'size' },
    { title: 'رنگ', dataIndex: 'color' },
    { title: 'موجودی', dataIndex: 'stock_quantity' },
    { title: 'قیمت اضافه', dataIndex: 'extra_price' },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: ProductVariant) => (
        <Popconfirm title="این ورینت حذف شود؟" onConfirm={() => deleteVariantMutation.mutate(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ]

  const colorOptions = Array.from(new Set((product?.variants ?? []).map((v) => v.color)))

  return (
    <div>
      <PageHeader title={isEdit ? 'ویرایش محصول' : 'محصول جدید'} />
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="اطلاعات پایه" loading={isEdit && loadingProduct} style={{ marginBottom: 16 }}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="name" label="نام محصول" rules={[{ required: true, message: 'نام را وارد کنید' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="توضیحات">
                <Input.TextArea rows={4} />
              </Form.Item>

              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="price" label="قیمت (تومان)" rules={[{ required: true, message: 'الزامی' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="discount_price" label="قیمت با تخفیف">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="sku" label="کد کالا (SKU)" rules={[{ required: true, message: 'الزامی' }]}>
                    <Input disabled={isEdit} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="wholesale_price" label="قیمت عمده (هر واحد)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="خالی = قیمت خرد برای همه" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="wholesale_min_qty" label="حداقل تعداد برای قیمت عمده" initialValue={1}>
                    <InputNumber style={{ width: '100%' }} min={1} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="gender" label="جنسیت" initialValue="unisex">
                    <Select options={GENDERS.map((g) => ({ value: g, label: GENDER_FA[g] }))} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="category_id" label="دسته‌بندی" rules={[{ required: true, message: 'الزامی' }]}>
                    <Select options={(categories?.items ?? []).map((c) => ({ value: c.id, label: c.name }))} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="brand_id" label="برند" rules={[{ required: true, message: 'الزامی' }]}>
                    <Select options={(brands?.items ?? []).map((b) => ({ value: b.id, label: b.name }))} />
                  </Form.Item>
                </Col>
              </Row>

              {!isEdit && (
                <Row gutter={12}>
                  <Col span={10}>
                    <Form.Item name="sizes" label="سایزها (با کاما جدا کنید)">
                      <Input placeholder="38, 39, 40, 41" />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item name="colors" label="رنگ‌ها (با کاما جدا کنید)">
                      <Input placeholder="مشکی, سفید" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="stock_quantity" label="موجودی هر ورینت" initialValue={10}>
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Row gutter={24}>
                <Col>
                  <Form.Item name="is_active" label="فعال" valuePropName="checked" initialValue={true}>
                    <Switch />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item name="is_featured" label="محصول ویژه" valuePropName="checked" initialValue={false}>
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                ذخیره
              </Button>
            </Form>
          </Card>

          {isEdit && (
            <Card title="ورینت‌ها (سایز / رنگ / موجودی)">
              <Table
                rowKey="id"
                dataSource={product?.variants ?? []}
                columns={variantColumns}
                pagination={false}
                size="small"
                style={{ marginBottom: 16 }}
              />
              <Form
                layout="inline"
                onFinish={(values) => {
                  addVariantMutation.mutate(values)
                }}
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
          )}
        </Col>

        <Col xs={24} lg={8}>
          {isEdit ? (
            <Card title="تصاویر (چند طرح/رنگ)">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginBottom: 16 }}>
                {(product?.images ?? []).map((img) => (
                  <div key={img.id} style={{ position: 'relative', border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                    <img src={img.image_url} style={{ width: '100%', height: 90, objectFit: 'cover' }} />
                    {img.color && (
                      <Tag style={{ position: 'absolute', bottom: 2, insetInlineStart: 2 }}>{img.color}</Tag>
                    )}
                    <div style={{ position: 'absolute', top: 2, insetInlineEnd: 2, display: 'flex', gap: 2 }}>
                      <Button
                        size="small"
                        type={img.is_primary ? 'primary' : 'default'}
                        icon={img.is_primary ? <StarFilled /> : <StarOutlined />}
                        onClick={() => setPrimaryMutation.mutate(img.id)}
                      />
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteImageMutation.mutate(img.id)} />
                    </div>
                  </div>
                ))}
              </div>
              <Select
                allowClear
                placeholder="مربوط به کدام رنگ است؟ (اختیاری)"
                style={{ width: '100%', marginBottom: 8 }}
                value={variantColor}
                onChange={setVariantColor}
                options={colorOptions.map((c) => ({ value: c, label: c }))}
              />
              <Upload
                multiple
                showUploadList={false}
                accept="image/*"
                customRequest={(({ file, onSuccess }) => {
                  uploadImagesMutation.mutate(
                    { files: [file as File], color: variantColor },
                    { onSuccess: () => onSuccess?.({}) },
                  )
                }) as UploadProps['customRequest']}
              >
                <Button icon={<UploadOutlined />} loading={uploadImagesMutation.isPending} block>
                  آپلود عکس‌ها (چندتایی)
                </Button>
              </Upload>
            </Card>
          ) : (
            <Card>
              <p style={{ color: '#888' }}>برای مدیریت تصاویر و ورینت‌ها، ابتدا محصول را ذخیره کنید.</p>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}
