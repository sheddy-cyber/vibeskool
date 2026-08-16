import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import styles from './SignInPage.module.css'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, currentUser, authError, authLoading, clearError, signIn } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (currentUser) navigate('/app/dashboard', { replace: true })
  }, [currentUser])

  function handleSubmit(e) {
    e?.preventDefault()
    signUp(form)
  }

  function handleDemoLogin() {
    signIn({ email: 'architect@vibeskool.edu', password: 'demo-password-123' })
  }

  function setField(field) {
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
            $ git commit -m "feat: student enrollment"
          </div>
          <div style={{ color: 'var(--green-text)' }}>
            ✓ Academic Syllabus: Unlocked<br />
            ✓ Interactive Lab VM: Provisioned<br />
            ✓ Verified MEK Diploma: Registered
          </div>
        </div>

        <div className={styles.quoteBlock}>
          <p className={styles.quoteText}>
            "The future of programming is not typing syntax. It is understanding architecture, testing boundaries, and leading intelligent models."
          </p>
          <span className={styles.quoteAuthor}>— Andrej Karpathy × VibeSkool Vision</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className={styles.rightForm}>
        <div className={styles.formCard}>
          <div className={styles.formHead}>
            <h1 className={styles.formTitle}>Enroll in the Academy</h1>
            <p className={styles.formSub}>Free enrollment. No credit card required. Start building in 60s.</p>
          </div>

          {/* 1-Click Recruiter Demo Login */}
          <button className={styles.demoBtn} onClick={handleDemoLogin} type="button">
            <span>⚡</span> 1-Click Recruiter & Demo Login
          </button>

          <div className={styles.divider}>Or Create New Academic Profile</div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Your Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Ada Lovelace"
                value={form.name}
                onChange={setField('name')}
                autoComplete="name"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Academic Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="you@vibeskool.edu"
                value={form.email}
                onChange={setField('email')}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password (min 6 characters)</label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={setField('password')}
                  autoComplete="new-password"
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
              {authLoading ? 'Provisioning Student Profile...' : 'Complete Free Enrollment →'}
            </button>
          </form>

          <p className={styles.footerText}>
            Already enrolled?{' '}
            <Link to="/signin" className={styles.footerLink}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
