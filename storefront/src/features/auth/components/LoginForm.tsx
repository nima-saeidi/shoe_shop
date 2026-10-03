'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { getApiError } from '@/utils/format'
import { useLogin } from '../hooks/useAuth'

// Only same-site relative paths are allowed as a post-login target (prevents open redirects).
export function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/account'
}

export function LoginForm() {
  const router = useRouter()
  const next = safeNext(useSearchParams().get('next'))
  const login = useLogin()

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    login.mutate(
      { email: String(form.get('email')).trim(), password: String(form.get('password')) },
      { onSuccess: () => router.replace(next) },
    )
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-4 p-7">
      <h1 className="text-2xl font-bold">ورود به حساب کاربری</h1>
      {login.error && <Alert>{getApiError(login.error, 'ایمیل یا رمز عبور اشتباه است.')}</Alert>}
      <Field label="ایمیل" name="email" type="email" autoComplete="email" required dir="ltr" />
      <Field label="رمز عبور" name="password" type="password" autoComplete="current-password" required dir="ltr" />
      <button type="submit" disabled={login.isPending} className="btn btn-primary w-full py-3">
        {login.isPending ? 'در حال ورود...' : 'ورود'}
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
