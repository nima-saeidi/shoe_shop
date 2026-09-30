import { Tag } from 'antd'

interface StatusTagProps {
  value: string | null | undefined
  labels: Record<string, string>
  colors?: Record<string, string>
}

const DEFAULT_COLORS: Record<string, string> = {
  pending: 'gold',
  confirmed: 'blue',
  processing: 'blue',
  shipped: 'geekblue',
  delivered: 'green',
  cancelled: 'red',
  returned: 'volcano',
  paid: 'green',
  failed: 'red',
  refunded: 'orange',
  approved: 'green',
  rejected: 'red',
  completed: 'green',
  open: 'gold',
  answered: 'blue',
  closed: 'default',
  active: 'green',
  inactive: 'default',
  info: 'blue',
  warning: 'orange',
  error: 'red',
  wholesale: 'purple',
  retail: 'default',
}

export function StatusTag({ value, labels, colors = DEFAULT_COLORS }: StatusTagProps) {
  if (!value) return <span>-</span>
  return <Tag color={colors[value] ?? 'default'}>{labels[value] ?? value}</Tag>
}
