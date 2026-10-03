import { Spin } from 'antd'

export function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  )
}
