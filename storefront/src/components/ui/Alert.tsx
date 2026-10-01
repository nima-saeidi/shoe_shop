export function Alert({ children, kind = 'error' }: { children: React.ReactNode; kind?: 'error' | 'success' | 'info' }) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-blush-deep text-brand-dark border-brand/20',
  }[kind]
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  )
}
