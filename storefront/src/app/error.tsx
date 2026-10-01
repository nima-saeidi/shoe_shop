'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card mx-auto max-w-lg p-10 text-center">
      <h1 className="text-xl font-bold">مشکلی پیش آمد</h1>
      <p className="mt-2 text-sm text-muted">لطفاً دوباره تلاش کنید.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">تلاش دوباره</button>
    </div>
  )
}
