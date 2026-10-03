import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Switch, Upload } from 'antd'
import type { UploadFile } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/ui/PageHeader'
import { useBrands } from '@/features/brands/hooks/useBrands'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { GENDER_FA } from '@/utils/enums'
import { ProductImagesCard } from '../components/ProductImagesCard'
import { ProductVariantsCard } from '../components/ProductVariantsCard'
import { useCreateProduct, useProduct, useUpdateProduct } from '../hooks/useProducts'
import type { ProductInput, ProductUpdateInput, ProductVariantInput } from '../types'
import { message } from '@/services/message'

const GENDERS = ['unisex', 'men', 'women', 'kids']

/** Form fields: the product fields plus the create-only variant generator inputs. */
interface ProductFormValues extends Omit<ProductInput, 'variants'> {
  sizes?: string
  colors?: string
  stock_quantity?: number
}

const splitList = (value?: string) =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

/** Every size × color combination becomes one variant with the same starting stock. */
function buildVariants(values: ProductFormValues): ProductVariantInput[] {
  const sizes = splitList(values.sizes)
  const colors = splitList(values.colors)
  const variants: ProductVariantInput[] = []
  for (const size of sizes.length ? sizes : ['One Size']) {
    for (const color of colors.length ? colors : ['Default']) {
      variants.push({ size, color, stock_quantity: values.stock_quantity ?? 0, extra_price: 0 })
    }
  }
  return variants
}

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const productId = id ? Number(id) : undefined
  const navigate = useNavigate()
  const [form] = Form.useForm<ProductFormValues>()
  const [newImages, setNewImages] = useState<UploadFile[]>([])

  const { data: categories } = useCategories()
  const { data: brands } = useBrands()
  const { data: product, isLoading: loadingProduct } = useProduct(productId)
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct(productId ?? 0)

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        sku: product.sku,
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

  function handleSubmit(values: ProductFormValues) {
    if (isEdit) {
      // SKU and variants are immutable here (variants are edited in their own card).
      const update: ProductUpdateInput = {
        name: values.name,
        description: values.description,
        price: values.price,
        discount_price: values.discount_price,
        wholesale_price: values.wholesale_price,
        wholesale_min_qty: values.wholesale_min_qty,
        gender: values.gender,
        category_id: values.category_id,
        brand_id: values.brand_id,
        is_active: values.is_active,
        is_featured: values.is_featured,
      }
      updateMutation.mutate(update, {
        onSuccess: () => message.success('محصول با موفقیت به‌روزرسانی شد'),
      })
      return
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
      variants: buildVariants(values),
    }
    const files = newImages.map((f) => f.originFileObj).filter((f): f is NonNullable<typeof f> => Boolean(f)) as File[]
    createMutation.mutate(
      { input, files },
      {
        onSuccess: ({ product: created, imageError }) => {
          if (imageError) message.warning('محصول ایجاد شد اما آپلود تصاویر ناموفق بود: ' + imageError)
          else message.success('محصول با موفقیت ایجاد شد')
          navigate(`/products/${created.id}/edit`)
        },
      },
    )
  }

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
                <Col xs={24} sm={8}>
                  <Form.Item name="price" label="قیمت (تومان)" rules={[{ required: true, message: 'الزامی' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="discount_price" label="قیمت با تخفیف">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="sku" label="کد کالا (SKU)" rules={[{ required: true, message: 'الزامی' }]}>
                    <Input disabled={isEdit} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="wholesale_price" label="قیمت عمده (هر واحد)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="خالی = قیمت خرد برای همه" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="wholesale_min_qty" label="حداقل تعداد برای قیمت عمده" initialValue={1}>
                    <InputNumber style={{ width: '100%' }} min={1} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={8}>
                  <Form.Item name="gender" label="جنسیت" initialValue="unisex">
                    <Select options={GENDERS.map((g) => ({ value: g, label: GENDER_FA[g] }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="category_id" label="دسته‌بندی" rules={[{ required: true, message: 'الزامی' }]}>
                    <Select options={(categories?.items ?? []).map((c) => ({ value: c.id, label: c.name }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="brand_id" label="برند" rules={[{ required: true, message: 'الزامی' }]}>
                    <Select options={(brands?.items ?? []).map((b) => ({ value: b.id, label: b.name }))} />
                  </Form.Item>
                </Col>
              </Row>

              {!isEdit && (
                <Row gutter={12}>
                  <Col xs={24} sm={10}>
                    <Form.Item name="sizes" label="سایزها (با کاما جدا کنید)">
                      <Input placeholder="38, 39, 40, 41" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={10}>
                    <Form.Item name="colors" label="رنگ‌ها (با کاما جدا کنید)">
                      <Input placeholder="مشکی, سفید" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={4}>
                    <Form.Item name="stock_quantity" label="موجودی هر ورینت" initialValue={10}>
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {!isEdit && (
                <Form.Item label="تصاویر محصول (چند فایل)">
                  <Upload
                    multiple
                    accept="image/*"
                    listType="picture-card"
                    fileList={newImages}
                    beforeUpload={() => false}
                    onChange={({ fileList }) => setNewImages(fileList)}
                  >
                    <UploadOutlined /> انتخاب
                  </Upload>
                </Form.Item>
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

          {isEdit && product && <ProductVariantsCard product={product} />}
        </Col>

        <Col xs={24} lg={8}>
          {isEdit ? (
            product && <ProductImagesCard product={product} />
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
