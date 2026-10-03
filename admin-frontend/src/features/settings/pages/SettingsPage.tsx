import { Alert, Card, Col, Descriptions, Row, Tag } from 'antd'
import { PageHeader } from '@/components/ui/PageHeader'
import { useSettingsStatus } from '../hooks/useSettings'

export function SettingsPage() {
  const { data, isLoading } = useSettingsStatus()

  return (
    <div>
      <PageHeader title="تنظیمات پیامک و درگاه پرداخت" />
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card
            loading={isLoading}
            title="پنل ارسال پیامک (SMS)"
            extra={<Tag color={data?.sms_configured ? 'green' : 'gold'}>{data?.sms_configured ? 'فعال' : 'به‌زودی'}</Tag>}
            style={{ marginBottom: 16 }}
          >
            <p style={{ color: '#888' }}>
              اتصال به سامانه پیامکی هنوز پیکربندی نشده است. پس از دریافت اطلاعات حساب از سرویس‌دهنده، مقادیر مربوطه
              را در فایل <code>.env</code> بک‌اند تکمیل کنید تا اعلان‌های خودکار به‌صورت پیامکی ارسال شوند.
            </p>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="SMS_PROVIDER">
                <span dir="ltr">{data?.sms_provider ?? '—'}</span>
              </Descriptions.Item>
            </Descriptions>
            <Alert
              style={{ marginTop: 12 }}
              type="info"
              showIcon
              title="تا زمان اتصال درگاه، پیام‌ها فقط در لاگ سرور ثبت می‌شوند."
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            loading={isLoading}
            title="درگاه پرداخت آنلاین"
            extra={<Tag color={data?.payment_configured ? 'green' : 'gold'}>{data?.payment_configured ? 'فعال' : 'به‌زودی'}</Tag>}
          >
            <p style={{ color: '#888' }}>
              اتصال به درگاه پرداخت هنوز پیکربندی نشده است. تا آن زمان، سفارش‌های خرد به‌صورت «پرداخت در محل» و
              سفارش‌های عمده از طریق کیف پول یا فیش واریزی تسویه می‌شوند.
            </p>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="PAYMENT_PROVIDER">
                <span dir="ltr">{data?.payment_provider ?? '—'}</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
