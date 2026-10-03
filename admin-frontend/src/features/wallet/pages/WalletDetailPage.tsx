import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Col, Form, Input, InputNumber, Row, Table, message } from 'antd'
import { getWalletDetail, topupWallet } from '../../api/wallet'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { Money } from '../../components/Money'
import { WALLET_TX_TYPE_FA } from '../../utils/enums'
import { formatDateTime } from '../../utils/format'
import type { WalletTransaction } from '../../types'

export function WalletDetailPage() {
  const { userId } = useParams()
  const id = Number(userId)
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({ queryKey: ['wallet-detail', id], queryFn: () => getWalletDetail(id) })

  const topupMutation = useMutation({
    mutationFn: (values: { amount: number; description?: string }) => topupWallet(id, values.amount, values.description),
    onSuccess: () => {
      message.success('کیف پول با موفقیت شارژ شد')
      queryClient.invalidateQueries({ queryKey: ['wallet-detail', id] })
      form.resetFields()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const columns = [
    { title: 'نوع', dataIndex: 'tx_type', render: (v: string) => WALLET_TX_TYPE_FA[v] ?? v },
    {
      title: 'مبلغ',
      dataIndex: 'amount',
      render: (v: number) => (
        <span style={{ color: v > 0 ? 'green' : 'red' }}>
          {v > 0 ? '+' : ''}
          <Money value={v} />
        </span>
      ),
    },
    { title: 'موجودی پس از تراکنش', dataIndex: 'balance_after', render: (v: number) => <Money value={v} /> },
    { title: 'توضیحات', dataIndex: 'description', render: (v: string | null) => v ?? '-' },
    { title: 'تاریخ', dataIndex: 'created_at', render: (v: string) => formatDateTime(v) },
  ]

  return (
    <div>
      <PageHeader title={`کیف پول — ${data?.full_name ?? ''}`} />
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="تراکنش‌ها" loading={isLoading}>
            <Table
              rowKey="id"
              dataSource={data?.transactions ?? ([] as WalletTransaction[])}
              columns={columns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card style={{ marginBottom: 16, textAlign: 'center' }} loading={isLoading}>
            <div style={{ color: '#888', marginBottom: 4 }}>موجودی فعلی</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0d9488' }}>
              <Money value={data?.balance ?? 0} />
            </div>
          </Card>
          <Card title="شارژ کیف پول">
            <Form form={form} layout="vertical" onFinish={(values) => topupMutation.mutate(values)}>
              <Form.Item name="amount" label="مبلغ (تومان)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
              <Form.Item name="description" label="توضیحات">
                <Input placeholder="مثلاً: واریز نقدی به حساب فروشگاه" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={topupMutation.isPending}>
                ثبت شارژ
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
