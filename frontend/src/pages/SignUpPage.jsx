import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import AuthLayout, { Field, PasswordInput, authStyles as styles } from '@/components/auth/AuthLayout'
import { LearnerScene, PairingScene } from '@/components/art/Illustrations'

const ROLE_COPY = {
  student: {
    hint: 'Short lessons, nothing to install, free to start.',
    artTitle: 'Learn just enough code to build with AI.',
    artText: 'Short lessons that show you what to ask for, how to read what comes back, and how to fix it.',
  },
  teacher: {
    hint: 'Run classes, follow progress and pair with students live.',
    artTitle: 'Teach without the setup.',
    artText: 'Share one join code. Your students code in the browser and you see where each of them is.',
  },
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'teacher' ? 'teacher' : 'student'

  const { signUp, currentUser, authError, authLoading, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', displayName: '', role: initialRole })

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'teacher' ? '/app/teacher/dashboard' : '/app/dashboard', { replace: true })
    }
  }, [currentUser, navigate])

  function handleSubmit(e) {
    e.preventDefault()
    signUp({ ...form, name: form.displayName })
  }

  function set(field) {
    return e => {
      clearError()
      setForm(f => ({ ...f, [field]: e.target.value }))
    }
  }

  const copy = ROLE_COPY[form.role]
  const isTutor = form.role === 'teacher'

  return (
    <AuthLayout
      tone={isTutor ? 'green' : 'blue'}
      art={isTutor ? <PairingScene /> : <LearnerScene />}
      artTitle={copy.artTitle}
      artText={copy.artText}
      footer={
        <>
          By creating an account you agree to our <Link to="/terms">Terms</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </>
      }
    >
      <h1 className={styles.title}>Create your account</h1>
      <p className={styles.subtitle}>
        Already have one? <Link to="/signin">Log in</Link>
      </p>

      <div className={styles.stack}>
        {authError && <div className={styles.error} role="alert">{authError}</div>}

        <div className={styles.roleSwitch} role="radiogroup" aria-label="I'm joining as">
          {[
            ['student', 'I want to learn'],
            ['teacher', 'I want to teach'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={form.role === value}
              className={form.role === value ? styles.roleActive : undefined}
              onClick={() => setForm(f => ({ ...f, role: value }))}
            >
              {label}
            </button>
          ))}
        </div>
        <p className={styles.roleHint}>{copy.hint}</p>

        <GoogleAuthButton isSignUp={true} role={form.role} />

        <form className={styles.form} onSubmit={handleSubmit}>
          <Field id="name" label="Name">
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="What should we call you?"
              autoComplete="name"
              value={form.displayName}
              onChange={set('displayName')}
              required
            />
          </Field>
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
          <Field id="password" label="Password" hint={<span className={styles.labelHint}>At least 6 characters</span>}>
            <PasswordInput
              id="password"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              minLength={6}
            />
          </Field>
          <button className={styles.submit} type="submit" disabled={authLoading}>
            {authLoading ? 'Creating your account…' : isTutor ? 'Create tutor account' : 'Create account'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
