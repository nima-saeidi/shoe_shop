import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Empty, List, Popover, Typography } from 'antd'
import {
  BellOutlined,
  MessageOutlined,
  ReconciliationOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { LogEntry } from '@/features/logs/types'
import { formatDateTime } from '@/utils/format'
import { useLastSeenNotification, useNotifications } from '../hooks/useNotifications'

function targetPath(n: LogEntry): string {
  switch (n.action) {
    case 'ticket_created':
    case 'ticket_customer_reply':
      return n.target_id ? `/tickets/${n.target_id}` : '/tickets'
    case 'order_created':
      return n.target_id ? `/orders/${n.target_id}` : '/orders'
    case 'return_requested':
      return '/returns'
    case 'wholesale_requested':
      return '/wholesale'
    default:
      return '/'
  }
}

function iconFor(action: string) {
  if (action.startsWith('ticket')) return <MessageOutlined />
  if (action === 'order_created') return <ShoppingCartOutlined />
  if (action === 'return_requested') return <ReconciliationOutlined />
  return <TeamOutlined />
}

export function NotificationBell() {
  const navigate = useNavigate()
  const { data: items = [] } = useNotifications()
  const { lastSeen, markSeen } = useLastSeenNotification()
  const [open, setOpen] = useState(false)

  const unread = items.filter((n) => n.id > lastSeen).length

  const markAllRead = () => markSeen(items.reduce((m, n) => Math.max(m, n.id), lastSeen))

  const content = (
    <div style={{ width: 340, maxWidth: '85vw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Typography.Text strong>اعلان‌ها</Typography.Text>
        <Button type="link" size="small" disabled={unread === 0} onClick={markAllRead}>
          علامت‌گذاری همه به‌عنوان خوانده‌شده
        </Button>
      </div>
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="اعلانی وجود ندارد" />
      ) : (
        <List
          size="small"
          style={{ maxHeight: 400, overflowY: 'auto' }}
          dataSource={items}
          renderItem={(n) => {
            const isNew = n.id > lastSeen
            return (
              <List.Item
                style={{ cursor: 'pointer', background: isNew ? '#e6f4ff' : undefined, paddingInline: 8 }}
                onClick={() => {
                  setOpen(false)
                  navigate(targetPath(n))
                }}
              >
                <List.Item.Meta
                  avatar={iconFor(n.action)}
                  title={<span style={{ fontWeight: isNew ? 600 : 400, fontSize: 13 }}>{n.message}</span>}
                  description={<span style={{ fontSize: 12 }}>{formatDateTime(n.created_at)}</span>}
                />
              </List.Item>
            )
          }}
        />
      )}
    </div>
  )

  return (
    <Popover content={content} trigger="click" placement="bottomLeft" open={open} onOpenChange={setOpen}>
      <Badge count={unread} size="small" overflowCount={99}>
        <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} aria-label="اعلان‌ها" />
      </Badge>
    </Popover>
  )
}
