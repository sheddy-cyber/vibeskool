import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '@/lib/api'
import AuthLayout, { Field, authStyles as styles } from '@/components/auth/AuthLayout'
import { PairingScene } from '@/components/art/Illustrations'

/* Ask for a password reset link. The answer is the same whether or not the
   address has an account, so this page can't be used to look people up. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setState('sending')
    try {
      await authApi.requestPasswordReset(email.trim())
      setState('sent')
    } catch (err) {
      setError(err.status === 429 ? 'Too many tries. Wait a little and try again.' : err.message || 'Something went wrong.')
      setState('idle')
    }
  }

  return (
    <AuthLayout
      tone="green"
      art={<PairingScene />}
      artTitle="It happens to everyone."
      artText="We'll email you a link to choose a new password. Your lessons and classes stay just as they are."
    >
      <h1 className={styles.title}>Reset your password</h1>
      <p className={styles.subtitle}>
        Remembered it? <Link to="/signin">Log in</Link>
      </p>

      <div className={styles.stack}>
        {error && <div className={styles.error} role="alert">{error}</div>}

        {state === 'sent' ? (
          <div className={styles.notice} role="status">
            <strong>Check your email</strong>
            <p>
              If {email.trim()} has a VibeSkool account, a link to reset the password is on its way. It works once,
              for the next hour. Nothing there? Check spam, or try again in a minute.
            </p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <Field id="email" label="Email">
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Field>
            <button className={styles.submit} type="submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Email me a reset link'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
