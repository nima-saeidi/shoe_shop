import { useEffect, type ReactNode } from 'react'
import { App, ConfigProvider, type ThemeConfig } from 'antd'
import faIR from 'antd/locale/fa_IR'
import { bindMessage } from '@/services/message'

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#0d9488',
    fontFamily: "'Vazirmatn', 'Segoe UI', Tahoma, sans-serif",
    borderRadius: 8,
  },
}

/** Hands antd's context-aware message API to services/message. */
function MessageBridge() {
  const { message } = App.useApp()
  useEffect(() => bindMessage(message), [message])
  return null
}

/** Ant Design setup: RTL, Persian locale, the panel's design tokens and themed toasts. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider direction="rtl" locale={faIR} theme={theme}>
      <App>
        <MessageBridge />
        {children}
      </App>
    </ConfigProvider>
  )
}
