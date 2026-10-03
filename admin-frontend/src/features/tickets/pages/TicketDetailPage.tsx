import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Col, Form, Input, Row, message } from 'antd'
import { adminReplyTicket, closeTicket, getTicket } from '../../api/tickets'
import { getApiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { StatusTag } from '../../components/StatusTag'
import { TICKET_STATUS_FA } from '../../utils/enums'
import { formatDateTime } from '../../utils/format'

export function TicketDetailPage() {
  const { id } = useParams()
  const ticketId = Number(id)
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  const { data: ticket, isLoading } = useQuery({ queryKey: ['ticket', ticketId], queryFn: () => getTicket(ticketId) })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })

  const replyMutation = useMutation({
    mutationFn: (message_: string) => adminReplyTicket(ticketId, message_),
    onSuccess: () => {
      message.success('پاسخ ارسال شد')
      form.resetFields()
      invalidate()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  const closeMutation = useMutation({
    mutationFn: () => closeTicket(ticketId),
    onSuccess: () => {
      message.success('تیکت بسته شد')
      invalidate()
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  })

  if (!ticket) return <Card loading={isLoading} />

  return (
    <div>
      <PageHeader title={`تیکت: ${ticket.subject}`} />
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card
            extra={<StatusTag value={ticket.status} labels={TICKET_STATUS_FA} />}
            title={`مشتری: ${ticket.customer_name ?? '-'}`}
          >
            <div style={{ marginBottom: 24 }}>
              {ticket.messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: 12, textAlign: msg.is_admin ? 'left' : 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      maxWidth: '75%',
                      padding: '10px 14px',
                      borderRadius: 14,
                      background: msg.is_admin ? '#eef2f7' : '#0d9488',
                      color: msg.is_admin ? '#000' : '#fff',
                      textAlign: 'right',
                    }}
                  >
                    {msg.message}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                    {msg.is_admin ? 'پشتیبانی فروشگاه' : msg.sender_name ?? 'مشتری'} — {formatDateTime(msg.created_at)}
                  </div>
                </div>
              ))}
            </div>
            {ticket.status !== 'closed' && (
              <Form form={form} onFinish={(values) => replyMutation.mutate(values.message)}>
                <Form.Item name="message" rules={[{ required: true, message: 'پیام را وارد کنید' }]}>
                  <Input.TextArea rows={3} placeholder="پاسخ خود را بنویسید..." />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={replyMutation.isPending}>
                  ارسال پاسخ
                </Button>
              </Form>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="عملیات">
            {ticket.status !== 'closed' ? (
              <Button danger block onClick={() => closeMutation.mutate()} loading={closeMutation.isPending}>
                بستن تیکت
              </Button>
            ) : (
              <p style={{ color: '#888', margin: 0 }}>این تیکت بسته شده است.</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
