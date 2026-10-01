import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import faIR from 'antd/locale/fa_IR'
import dayjs from 'dayjs'
import 'dayjs/locale/fa'
import jalliPlugin from 'jalali-plugin-dayjs'
import App from './App'
import './styles/index.css'

dayjs.extend(jalliPlugin)

// The date pickers read month names from the dayjs locale (Gregorian: ژانویه، فوریه...).
// Since the whole panel runs on the Jalali calendar, swap in the Persian month names.
const JALALI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const faLocale = dayjs.Ls.fa as { months?: unknown; monthsShort?: unknown }
faLocale.months = JALALI_MONTHS
faLocale.monthsShort = JALALI_MONTHS
dayjs.calendar('jalali')
dayjs.locale('fa')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      theme={{
        token: {
          colorPrimary: '#0d9488',
          fontFamily: "'Vazirmatn', 'Segoe UI', Tahoma, sans-serif",
          borderRadius: 8,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>,
)
