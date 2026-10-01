'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { authApi } from '@/lib/api/account'
import { getApiError } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { safeNext } from './LoginForm'

export function RegisterForm() {
  const router = useRouter()
  const next = safeNext(useSearchParams().get('next'))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const password = String(f.get('password'))
    if (password.length < 8) return setError('رمز عبور باید حداقل ۸ کاراکتر باشد.')
    if (password !== String(f.get('confirm'))) return setError('تکرار رمز عبور مطابقت ندارد.')

    setBusy(true)
    setError(null)
    try {
      const email = String(f.get('email')).trim()
      await authApi.register({
        full_name: String(f.get('full_name')).trim(),
        email,
        phone_number: String(f.get('phone_number')).trim() || undefined,
        password,
      })
      const tokens = await authApi.login(email, password)
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token)
      useAuthStore.getState().setUser(await authApi.me())
      router.replace(next)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-4 p-7">
      <h1 className="text-2xl font-bold">ثبت‌نام</h1>
      {error && <Alert>{error}</Alert>}
      <Field label="نام و نام خانوادگی" name="full_name" autoComplete="name" required minLength={2} />
      <Field label="ایمیل" name="email" type="email" autoComplete="email" required dir="ltr" />
      <Field label="شماره موبایل (اختیاری)" name="phone_number" type="tel" autoComplete="tel" dir="ltr" />
      <Field label="رمز عبور" name="password" type="password" autoComplete="new-password" required minLength={8} dir="ltr" />
      <Field label="تکرار رمز عبور" name="confirm" type="password" autoComplete="new-password" required dir="ltr" />
      <button type="submit" disabled={busy} className="btn btn-primary w-full py-3">
        {busy ? 'در حال ثبت‌نام...' : 'ایجاد حساب'}
      </button>
      <p className="text-center text-sm text-muted">
        قبلاً ثبت‌نام کرده‌اید؟{' '}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-brand-dark">
          وارد شوید
        </Link>
      </p>
    </form>
  )
}
