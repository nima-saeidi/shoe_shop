export interface SettingsStatus {
  sms_configured: boolean
  sms_provider: string | null
  payment_configured: boolean
  payment_provider: string | null
}
