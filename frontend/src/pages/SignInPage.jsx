import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button, BrandLogo } from '@/components/ui'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import styles from './SignInPage.module.css'

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn, currentUser, authError, authLoading, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'teacher') {
        navigate('/app/teacher/dashboard', { replace: true })
      } else {
        navigate('/app/dashboard', { replace: true })
      }
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
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>
          <BrandLogo size={32} showText={true} />
        </Link>
        <h1 className={styles.title}>Welcome back</h1>
        
        {authError && <div className={styles.error}>{authError}</div>}

        <GoogleAuthButton isSignUp={false} />

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="you@example.com" 
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••" 
              value={form.password}
              onChange={set('password')}
              required
            />
          </div>
          <Button 
            className={styles.submitBtn} 
            type="submit" 
            variant="primary" 
            disabled={authLoading}
          >
            {authLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className={styles.footer}>
          Don't have an account? <Link to="/signup" className={styles.link}>Sign up</Link>
        </div>
      </div>
    </div>
  )
}
