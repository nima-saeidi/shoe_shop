import { Button, Card } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/ui/PageHeader'
import { useSystemLog } from '../hooks/useLogs'

export function SystemLogPage() {
  const { data, isFetching, refetch } = useSystemLog(300)

  return (
    <div>
      <PageHeader
        title="لاگ خام سرور (فنی)"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
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
          {data?.length ? data.join('') : '(هنوز رویدادی ثبت نشده است)'}
        </pre>
      </Card>
    </div>
  )
}
