import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import styles from './SignInPage.module.css'

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn, currentUser, authError, authLoading, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (currentUser) navigate('/app/dashboard', { replace: true })
  }, [currentUser, navigate])

  function set(field) {
    return event => {
      clearError()
      setForm(current => ({ ...current, [field]: event.target.value }))
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.masthead}>
        <Link to="/" className={styles.wordmark} aria-label="VibeSkool home">
          <span className={styles.mark}>VS</span>
          <span>VibeSkool <i>Coursework</i></span>
        </Link>
        <p className={styles.mastheadNote}>A 16-week practice in web development</p>
      </header>

      <section className={styles.ledger} aria-labelledby="access-title">
        <div className={styles.ledgerNumber} aria-hidden="true">01</div>
        <div>
          <p className={styles.eyebrow}>Student record / access</p>
          <h1 id="access-title">Return to the work.</h1>
          <p className={styles.introduction}>
            Your course record holds the explanations, experiments, and verified exercises that make up your study.
          </p>
        </div>

        <dl className={styles.courseFacts}>
          <div><dt>Programme</dt><dd>Full-stack web development</dd></div>
          <div><dt>Term</dt><dd>Sixteen weeks</dd></div>
          <div><dt>Method</dt><dd>Explain before you ship</dd></div>
        </dl>

        <p className={styles.marginNote}>
          <span>Note</span>
          This is a workspace, not a feed. Pick up exactly where your reasoning stopped.
        </p>
      </section>

      <section className={styles.entry} aria-label="Sign in">
        <div className={styles.entryHead}>
          <p className={styles.eyebrow}>Identity check</p>
          <h2>Sign in</h2>
          <p>Use the email connected to your course record.</p>
        </div>

        <form className={styles.form} onSubmit={event => { event.preventDefault(); signIn(form) }}>
          <div className={styles.field}>
            <label htmlFor="signin-email">Email address</label>
            <input id="signin-email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" required />
          </div>
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="signin-password">Password</label>
              <button type="button" className={styles.textButton} onClick={() => setShowPass(value => !value)} aria-pressed={showPass}>
                {showPass ? 'Conceal' : 'Reveal'}
              </button>
            </div>
            <input id="signin-password" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={set('password')} autoComplete="current-password" required />
          </div>
          {authError && <p className={styles.error} role="alert">{authError}</p>}
          <button className={styles.submit} type="submit" disabled={authLoading}>
            {authLoading ? 'Checking record…' : 'Enter coursework →'}
          </button>
        </form>

        <div className={styles.alternate}>
          <p>Not yet enrolled?</p>
          <Link to="/signup">Create a student record <span aria-hidden="true">→</span></Link>
        </div>

        <button type="button" className={styles.demo} onClick={() => signIn({ email: 'architect@vibeskool.edu', password: 'demo-password-123' })}>
          View the demonstration record <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  )
}
