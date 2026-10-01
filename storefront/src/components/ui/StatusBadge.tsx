import { STATUS_TONE } from '@/lib/labels'

export function StatusBadge({ value, labels }: { value: string; labels: Record<string, string> }) {
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_TONE[value] ?? 'bg-slate-100 text-slate-700'}`}>
      {labels[value] ?? value}
    </span>
  )
}
