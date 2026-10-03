'use client'

import { useState, type FormEvent } from 'react'
import { useAuthStore } from '@/app/store/authStore'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { formatDate, getApiError } from '@/utils/format'
import { ProfileCompletion } from '../components/ProfileCompletion'
import { useChangePassword, useUpdateProfile } from '../hooks/useProfile'
import { isMobile } from '../hooks/useProfileCompletion'

type Msg = { kind: 'error' | 'success'; text: string } | null

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const [profileMsg, setProfileMsg] = useState<Msg>(null)
  const [passMsg, setPassMsg] = useState<Msg>(null)
  const busy = updateProfile.isPending || changePassword.isPending

  function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const phone = String(f.get('phone_number')).trim()
    if (phone && !isMobile(phone)) return setProfileMsg({ kind: 'error', text: 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.' })
    setProfileMsg(null)
    updateProfile.mutate(
      { full_name: String(f.get('full_name')).trim(), phone_number: phone || undefined },
      {
        onSuccess: () => setProfileMsg({ kind: 'success', text: 'اطلاعات ذخیره شد.' }),
        onError: (err) => setProfileMsg({ kind: 'error', text: getApiError(err) }),
      },
    )
  }

  function submitPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const next = String(f.get('new_password'))
    if (next !== String(f.get('confirm'))) return setPassMsg({ kind: 'error', text: 'تکرار رمز جدید مطابقت ندارد.' })
    setPassMsg(null)
    changePassword.mutate(
      { current_password: String(f.get('current_password')), new_password: next },
      {
        onSuccess: () => {
          form.reset()
          setPassMsg({ kind: 'success', text: 'رمز عبور تغییر کرد.' })
        },
        onError: (err) => setPassMsg({ kind: 'error', text: getApiError(err) }),
      },
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold">پروفایل من</h1>

      {user && (
        <section className="card flex items-center gap-4 p-5">
          <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-blush-deep text-xl font-bold text-brand-dark">
            {user.full_name.trim().charAt(0)}
          </span>
          <div>
            <p className="font-bold">{user.full_name}</p>
            <p className="text-sm text-muted" dir="ltr">{user.email}</p>
            <p className="text-xs text-muted">عضو از {formatDate(user.created_at)}</p>
          </div>
        </section>
      )}

      <ProfileCompletion />

      {user && (
        <form key={user.id + user.full_name} onSubmit={saveProfile} className="card space-y-4 p-5">
          <h2 className="font-bold">مشخصات</h2>
          {profileMsg && <Alert kind={profileMsg.kind}>{profileMsg.text}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام و نام خانوادگی" name="full_name" defaultValue={user.full_name} required minLength={2} />
            <Field label="شماره موبایل" name="phone_number" defaultValue={user.phone_number ?? ''} dir="ltr" type="tel" placeholder="09123456789" inputMode="numeric" maxLength={11} />
            <Field label="ایمیل" value={user.email} readOnly dir="ltr" disabled onChange={() => undefined} />
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary">ذخیره</button>
        </form>
      )}

      <form onSubmit={submitPassword} className="card space-y-4 p-5">
        <h2 className="font-bold">تغییر رمز عبور</h2>
        {passMsg && <Alert kind={passMsg.kind}>{passMsg.text}</Alert>}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="رمز فعلی" name="current_password" type="password" autoComplete="current-password" required dir="ltr" />
          <Field label="رمز جدید" name="new_password" type="password" autoComplete="new-password" required minLength={8} dir="ltr" />
          <Field label="تکرار رمز جدید" name="confirm" type="password" autoComplete="new-password" required dir="ltr" />
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary">تغییر رمز</button>
      </form>
    </>
  )
}
