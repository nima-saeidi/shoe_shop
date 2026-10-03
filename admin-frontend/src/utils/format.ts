import dayjs from './dayjs'

export function formatToman(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0'
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  return dayjs(value).calendar('jalali').locale('fa').format('YYYY/MM/DD HH:mm')
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  return dayjs(value).calendar('jalali').locale('fa').format('YYYY/MM/DD')
}
