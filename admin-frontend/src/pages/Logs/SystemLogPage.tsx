import { useQuery } from '@tanstack/react-query'
import { Button, Card } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { getSystemLog } from '../../api/logs'
import { PageHeader } from '../../components/PageHeader'

export function SystemLogPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['system-log'], queryFn: () => getSystemLog(300) })

  return (
    <div>
      <PageHeader
        title="لاگ خام سرور (فنی)"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            بروزرسانی
          </Button>
        }
      />
      <p style={{ color: '#888' }}>
        این بخش آخرین ۳۰۰ خط فایل لاگ فنی سرور (logs/app.log) را نشان می‌دهد — شامل خطاها و ترِیس‌بک‌های برنامه.
      </p>
      <Card styles={{ body: { padding: 0 } }}>
        <pre
          dir="ltr"
          style={{
            background: '#1f1f1f',
            color: '#e6e6e6',
            padding: 16,
            margin: 0,
            maxHeight: '70vh',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontSize: 12,
            borderRadius: 8,
          }}
        >
          {(data ?? []).length ? data!.join('') : '(هنوز رویدادی ثبت نشده است)'}
        </pre>
      </Card>
    </div>
  )
}
