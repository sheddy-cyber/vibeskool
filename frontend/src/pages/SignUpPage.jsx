import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { FadeUp, ScaleIn } from '@/components/ui/Motion'
import AnimatedBg from '@/components/ui/AnimatedBg'
import styles from './SignInPage.module.css'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, currentUser, authError, authLoading, clearError } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (currentUser) navigate('/app/dashboard', { replace: true })
  }, [currentUser])

  function handleSubmit(e) {
    e.preventDefault()
    signUp(form)
  }

  function setField(field) {
    return e => {
      clearError()
      setForm(f => ({ ...f, [field]: e.target.value }))
    }
  }

  return (
    <div className={styles.page}>
      <AnimatedBg />

      <div className={styles.inner}>
        <FadeUp delay={0}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoMark}>VS</div>
            <span className={styles.logoName}>VibeSkool</span>
          </Link>
        </FadeUp>

        <ScaleIn delay={60}>
          <div className={styles.card}>
            <FadeUp delay={120}>
              <div className={styles.cardHead}>
                <h1 className={styles.title}>Create your account</h1>
                <p className={styles.sub}>Free. No credit card. Start learning in 60 seconds.</p>
              </div>
            </FadeUp>

            <form className={styles.form} onSubmit={handleSubmit}>
              <FadeUp delay={160}>
                <div className={styles.field}>
                  <label className={styles.label}>Your name</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Shedrach"
                    value={form.name}
                    onChange={setField('name')}
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </FadeUp>

              <FadeUp delay={210}>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={setField('email')}
                    autoComplete="email"
                  />
                </div>
              </FadeUp>

              <FadeUp delay={260}>
                <div className={styles.field}>
                  <label className={styles.label}>Password <span className={styles.labelHint}>(min. 6 characters)</span></label>
                  <div className={styles.inputWrap}>
                    <input
                      className={styles.input}
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={setField('password')}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.showPass}
                      onClick={() => setShowPass(v => !v)}
                    >
                      {showPass
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>
              </FadeUp>

              {authError && (
                <FadeUp delay={0}>
                  <div className={styles.error}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {authError}
                  </div>
                </FadeUp>
              )}

              <FadeUp delay={310}>
                <button className={styles.submit} type="submit" disabled={authLoading}>
                  {authLoading
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin 0.7s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    : 'Create account →'
                  }
                </button>
              </FadeUp>
            </form>

            <FadeUp delay={360}>
              <div className={styles.footer}>
                <span>Already have an account?</span>
                <Link to="/signin" className={styles.link}>Sign in</Link>
              </div>
            </FadeUp>
          </div>
        </ScaleIn>
      </div>
    </div>
  )
}
