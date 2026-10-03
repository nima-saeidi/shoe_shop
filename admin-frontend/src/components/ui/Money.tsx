import { formatToman } from '../utils/format'

export function Money({ value, suffix = ' تومان' }: { value: number | null | undefined; suffix?: string }) {
  return (
    <span style={{ direction: 'ltr', display: 'inline-block' }}>
      {formatToman(value)}
      {suffix}
    </span>
  )
}
