'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { authApi, cartApi } from '@/lib/api/account'
import { getApiError } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

// Only same-site relative paths are allowed as a post-login target (prevents open redirects).
export function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/account'
}

export function LoginForm() {
  const router = useRouter()
  const next = safeNext(useSearchParams().get('next'))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    try {
      const tokens = await authApi.login(String(form.get('email')).trim(), String(form.get('password')))
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token)
      useAuthStore.getState().setUser(await authApi.me())
      cartApi.get().then((c) => useCartStore.getState().setCart(c)).catch(() => undefined)
      router.replace(next)
    } catch (err) {
      useAuthStore.getState().logout()
      setError(getApiError(err, 'ایمیل یا رمز عبور اشتباه است.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-4 p-7">
      <h1 className="text-2xl font-bold">ورود به حساب کاربری</h1>
      {error && <Alert>{error}</Alert>}
      <Field label="ایمیل" name="email" type="email" autoComplete="email" required dir="ltr" />
      <Field label="رمز عبور" name="password" type="password" autoComplete="current-password" required dir="ltr" />
      <button type="submit" disabled={busy} className="btn btn-primary w-full py-3">
        {busy ? 'در حال ورود...' : 'ورود'}
      </button>
      <p className="text-center text-sm text-muted">
        حساب ندارید؟{' '}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-brand-dark">
          ثبت‌نام کنید
        </Link>
      </p>
    </form>
  )
}
