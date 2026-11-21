import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import AuthLayout, { Field, PasswordInput, authStyles as styles } from '@/components/auth/AuthLayout'
import { PairingScene } from '@/components/art/Illustrations'

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn, currentUser, authError, authLoading, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'teacher' ? '/app/teaching' : '/app/dashboard', { replace: true })
    }
  }, [currentUser, navigate])

  function handleSubmit(e) {
    e.preventDefault()
    signIn(form)
  }

  function set(field) {
    return e => {
      clearError()
      setForm(f => ({ ...f, [field]: e.target.value }))
    }
  }

  return (
    <AuthLayout
      tone="green"
      art={<PairingScene />}
      artTitle="Pick up where you left off."
      artText="Your lessons, your classes and your tutor are right where you left them."
    >
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>
        New to VibeSkool? <Link to="/signup">Create an account</Link>
      </p>

      <div className={styles.stack}>
        {authError && <div className={styles.error} role="alert">{authError}</div>}

        <GoogleAuthButton isSignUp={false} />

        <form className={styles.form} onSubmit={handleSubmit}>
          <Field id="email" label="Email">
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              required
            />
          </Field>
          <Field id="password" label="Password" hint={<Link to="/forgot-password" className={styles.smallLink}>Forgot password?</Link>}>
            <PasswordInput
              id="password"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />
          </Field>
          <button className={styles.submit} type="submit" disabled={authLoading}>
            {authLoading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
