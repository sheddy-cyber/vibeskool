import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import styles from './SignInPage.module.css'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, signIn, currentUser, authError, authLoading, clearError } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
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

      <section className={styles.ledger} aria-labelledby="enrol-title">
        <div className={styles.ledgerNumber} aria-hidden="true">00</div>
        <div>
          <p className={styles.eyebrow}>Student record / enrolment</p>
          <h1 id="enrol-title">Begin with an account of your own.</h1>
          <p className={styles.introduction}>
            Establish a private course record. From the first lesson, your work is measured by what you can inspect, explain, and improve.
          </p>
        </div>

        <ol className={styles.courseFacts}>
          <li><span>01</span><strong>Foundations</strong><em>Web, tools, and language</em></li>
          <li><span>02</span><strong>Practice</strong><em>React, servers, and SQL</em></li>
          <li><span>03</span><strong>Evidence</strong><em>Security, AI, and capstone</em></li>
        </ol>

        <p className={styles.marginNote}>
          <span>Principle</span>
          AI may assist the work. It does not replace your explanation of it.
        </p>
      </section>

      <section className={styles.entry} aria-label="Create an account">
        <div className={styles.entryHead}>
          <p className={styles.eyebrow}>Create student record</p>
          <h2>Enrolment</h2>
          <p>Free to begin. No credit card and no claims you cannot substantiate.</p>
        </div>

        <form className={styles.form} onSubmit={event => { event.preventDefault(); signUp(form) }}>
          <div className={styles.field}>
            <label htmlFor="signup-name">Name</label>
            <input id="signup-name" type="text" placeholder="Ada Lovelace" value={form.name} onChange={set('name')} autoComplete="name" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="signup-email">Email address</label>
            <input id="signup-email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" required />
          </div>
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="signup-password">Password</label>
              <button type="button" className={styles.textButton} onClick={() => setShowPass(value => !value)} aria-pressed={showPass}>
                {showPass ? 'Conceal' : 'Reveal'}
              </button>
            </div>
            <input id="signup-password" type={showPass ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password} onChange={set('password')} autoComplete="new-password" minLength="6" required />
          </div>
          {authError && <p className={styles.error} role="alert">{authError}</p>}
          <button className={styles.submit} type="submit" disabled={authLoading}>
            {authLoading ? 'Opening record…' : 'Open student record →'}
          </button>
        </form>

        <div className={styles.alternate}>
          <p>Already have a record?</p>
          <Link to="/signin">Sign in to continue <span aria-hidden="true">→</span></Link>
        </div>

        <button type="button" className={styles.demo} onClick={() => signIn({ email: 'architect@vibeskool.edu', password: 'demo-password-123' })}>
          View the demonstration record <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  )
}
