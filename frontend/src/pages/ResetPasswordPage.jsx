import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi, setToken } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import AuthLayout, { Field, PasswordInput, authStyles as styles } from '@/components/auth/AuthLayout'
import { PairingScene } from '@/components/art/Illustrations'

/* The page the reset email links to: choose a new password, then you're in.
   Every other device is signed out. */
export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const refreshUser = useAuth((s) => s.refreshUser)
  const uid = params.get('uid') || ''
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError("The two passwords don't match."); return }
    setBusy(true)
    try {
      const data = await authApi.resetPassword({ uid, token, password })
      setToken(data.token)
      await refreshUser()
      navigate(data.user.role === 'teacher' ? '/app/teaching' : '/app/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setBusy(false)
    }
  }

  const broken = !uid || !token

  return (
    <AuthLayout
      tone="green"
      art={<PairingScene />}
      artTitle="A fresh start for your password."
      artText="Pick something you haven't used elsewhere. You'll be signed in straight away."
    >
      <h1 className={styles.title}>Choose a new password</h1>
      <p className={styles.subtitle}>
        Changed your mind? <Link to="/signin">Log in</Link>
      </p>

      <div className={styles.stack}>
        {error && (
          <div className={styles.error} role="alert">
            {error}{' '}
            {/expired|already used/i.test(error) && <Link to="/forgot-password" className={styles.switchLink}>Get a new link</Link>}
          </div>
        )}

        {broken ? (
          <div className={styles.notice} role="status">
            <strong>This link is incomplete</strong>
            <p>Open the link straight from the email, or <Link to="/forgot-password" className={styles.switchLink}>ask for a new one</Link>.</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <Field id="password" label="New password" hint={<span className={styles.labelHint}>At least 8 characters</span>}>
              <PasswordInput id="password" value={password} onChange={(e) => { setError(''); setPassword(e.target.value) }} autoComplete="new-password" minLength={8} />
            </Field>
            <Field id="confirm" label="Type it again">
              <PasswordInput id="confirm" value={confirm} onChange={(e) => { setError(''); setConfirm(e.target.value) }} autoComplete="new-password" minLength={8} />
            </Field>
            <button className={styles.submit} type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save and log in'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
