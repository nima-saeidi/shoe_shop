import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-10 text-center">
      <p className="text-5xl font-extrabold text-brand">۴۰۴</p>
      <h1 className="mt-4 text-xl font-bold">صفحه موردنظر پیدا نشد</h1>
      <p className="mt-2 text-sm text-muted">ممکن است آدرس اشتباه باشد یا محصول حذف شده باشد.</p>
      <Link href="/" className="btn btn-primary mt-6">بازگشت به خانه</Link>
    </div>
  )
}
