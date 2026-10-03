import { useState } from 'react'
import { Button, Card, Select, Tag, Upload } from 'antd'
import { DeleteOutlined, StarFilled, StarOutlined, UploadOutlined } from '@ant-design/icons'
import { useDeleteProductImage, useSetPrimaryImage, useUploadProductImages } from '../hooks/useProducts'
import type { Product } from '../types'
import { message } from '@/services/message'

/** Image gallery of an existing product: upload (optionally per color), set primary, delete. */
export function ProductImagesCard({ product }: { product: Product }) {
  const [variantColor, setVariantColor] = useState<string | undefined>()

  const uploadImagesMutation = useUploadProductImages(product.id)
  const deleteImageMutation = useDeleteProductImage()
  const setPrimaryMutation = useSetPrimaryImage(product.id)

  const colorOptions = Array.from(new Set(product.variants.map((v) => v.color)))

  return (
    <Card title="تصاویر (چند طرح/رنگ)">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginBottom: 16 }}>
        {product.images.map((img) => (
          <div key={img.id} style={{ position: 'relative', border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
            <img src={img.image_url} style={{ width: '100%', height: 90, objectFit: 'cover' }} />
            {img.color && <Tag style={{ position: 'absolute', bottom: 2, insetInlineStart: 2 }}>{img.color}</Tag>}
            <div style={{ position: 'absolute', top: 2, insetInlineEnd: 2, display: 'flex', gap: 2 }}>
              <Button
                size="small"
                type={img.is_primary ? 'primary' : 'default'}
                icon={img.is_primary ? <StarFilled /> : <StarOutlined />}
                onClick={() => setPrimaryMutation.mutate(img.id)}
              />
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteImageMutation.mutate(img.id, { onSuccess: () => message.success('تصویر حذف شد') })}
              />
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
        beforeUpload={(file, fileList) => {
          // antd calls this once per file; upload the whole selection in one request.
          if (file === fileList[0]) {
            uploadImagesMutation.mutate(
              { files: fileList as unknown as File[], color: variantColor },
              { onSuccess: (images) => message.success(`${images.length} تصویر آپلود شد`) },
            )
          }
          return false
        }}
      >
        <Button icon={<UploadOutlined />} loading={uploadImagesMutation.isPending} block>
          آپلود عکس‌ها (چندتایی)
        </Button>
      </Upload>
    </Card>
  )
}
