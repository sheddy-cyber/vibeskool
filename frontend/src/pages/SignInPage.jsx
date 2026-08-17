import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import styles from './SignInPage.module.css'

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn, currentUser, authError, authLoading, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (currentUser) navigate('/app/dashboard', { replace: true })
  }, [currentUser])

  function handleSubmit(e) {
    e?.preventDefault()
    signIn(form)
  }

  function handleDemoLogin() {
    signIn({ email: 'architect@vibeskool.edu', password: 'demo-password-123' })
  }

  function set(field) {
    return e => {
      clearError()
      setForm(f => ({ ...f, [field]: e.target.value }))
    }
  }

  return (
    <div className={styles.page}>
      {/* Left Showcase Panel */}
      <div className={styles.leftShowcase}>
        <Link to="/" className={styles.brandLink}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#08090C' }}>
            VS
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#F8FAFC' }}>
            VibeSkool Academy
          </span>
        </Link>

        <div className={styles.terminalCard}>
          <div style={{ color: 'var(--text-tertiary)', marginBottom: 8, fontSize: 11 }}>
            $ node audit_guardrails.js --check
          </div>
          <div style={{ color: 'var(--green-text)' }}>
            ✓ Verified MEK Standards: Active<br />
            ✓ Threat Vector Linter: 0 vulnerabilities<br />
            ✓ Student Auth Gateway: Ready
          </div>
        </div>

        <div className={styles.quoteBlock}>
          <p className={styles.quoteText}>
            "Talk is cheap. Show me the code. Or better yet: direct the AI to show you audited, resilient code."
          </p>
          <span className={styles.quoteAuthor}>— Linus Torvalds × VibeSkool Philosophy</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className={styles.rightForm}>
        <div className={styles.formCard}>
          <div className={styles.formHead}>
            <h1 className={styles.formTitle}>Welcome back, Architect</h1>
            <p className={styles.formSub}>Sign in to continue your deliberate practice.</p>
          </div>

          {/* 1-Click Recruiter / Evaluator Login */}
          <button className={styles.demoBtn} onClick={handleDemoLogin} type="button">
            <span>⚡</span> 1-Click Recruiter & Demo Login
          </button>

          <div className={styles.divider}>Or Sign In With Email</div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Academic Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="you@vibeskool.edu"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.showPassBtn}
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {authError && (
              <div className={styles.errorBanner}>{authError}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-md"
              style={{ width: '100%', marginTop: 8 }}
              disabled={authLoading}
            >
              {authLoading ? 'Authenticating...' : 'Sign in to Classroom →'}
            </button>
          </form>

          <p className={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/signup" className={styles.footerLink}>
              Enroll Free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
