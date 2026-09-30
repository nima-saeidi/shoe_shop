import type { ReactNode } from 'react'
import { Flex, Typography } from 'antd'

export function PageHeader({ title, extra }: { title: string; extra?: ReactNode }) {
  return (
    <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      {extra}
    </Flex>
  )
}
