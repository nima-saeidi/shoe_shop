'use client'

import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { authApi } from '@/lib/api/account'
import { getApiError } from '@/lib/format'
import { useAuthStore } from '@/store/auth'

type Msg = { kind: 'error' | 'success'; text: string } | null

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [profileMsg, setProfileMsg] = useState<Msg>(null)
  const [passMsg, setPassMsg] = useState<Msg>(null)
  const [busy, setBusy] = useState(false)

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    setProfileMsg(null)
    try {
      const updated = await authApi.updateMe({
        full_name: String(f.get('full_name')).trim(),
        phone_number: String(f.get('phone_number')).trim() || undefined,
      })
      useAuthStore.getState().setUser(updated)
      setProfileMsg({ kind: 'success', text: 'اطلاعات ذخیره شد.' })
    } catch (err) {
      setProfileMsg({ kind: 'error', text: getApiError(err) })
    } finally {
      setBusy(false)
    }
  }

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const next = String(f.get('new_password'))
    if (next !== String(f.get('confirm'))) return setPassMsg({ kind: 'error', text: 'تکرار رمز جدید مطابقت ندارد.' })
    setBusy(true)
    setPassMsg(null)
    try {
      await authApi.changePassword(String(f.get('current_password')), next)
      form.reset()
      setPassMsg({ kind: 'success', text: 'رمز عبور تغییر کرد.' })
    } catch (err) {
      setPassMsg({ kind: 'error', text: getApiError(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">اطلاعات حساب</h1>

      {user && (
        <form key={user.id + user.full_name} onSubmit={saveProfile} className="card space-y-4 p-5">
          <h2 className="font-bold">مشخصات</h2>
          {profileMsg && <Alert kind={profileMsg.kind}>{profileMsg.text}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام و نام خانوادگی" name="full_name" defaultValue={user.full_name} required minLength={2} />
            <Field label="شماره موبایل" name="phone_number" defaultValue={user.phone_number ?? ''} dir="ltr" type="tel" />
            <Field label="ایمیل" value={user.email} readOnly dir="ltr" disabled onChange={() => undefined} />
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary">ذخیره</button>
        </form>
      )}

      <form onSubmit={changePassword} className="card space-y-4 p-5">
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
