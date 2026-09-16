import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button, BrandLogo } from '@/components/ui'
import { GraduationCap, BookOpenCheck } from 'lucide-react'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import styles from './SignUpPage.module.css'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'teacher' ? 'teacher' : 'student'

  const { signUp, currentUser, authError, authLoading, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', displayName: '', role: initialRole })

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
    signUp({
      ...form,
      name: form.displayName,
    })
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
        <h1 className={styles.title}>Create your account</h1>
        
        {authError && <div className={styles.error}>{authError}</div>}

        <div className={styles.field} style={{ marginBottom: '16px' }}>
          <label className={styles.label}>I am joining as a</label>
          <div className={styles.roleSelector}>
            <button
              type="button"
              className={`${styles.roleBtn} ${form.role === 'student' ? styles.roleBtnActive : ''}`}
              onClick={() => setForm(f => ({ ...f, role: 'student' }))}
            >
              <GraduationCap size={18} />
              <span>Learner</span>
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${form.role === 'teacher' ? styles.roleBtnActive : ''}`}
              onClick={() => setForm(f => ({ ...f, role: 'teacher' }))}
            >
              <BookOpenCheck size={18} />
              <span>Tutor</span>
            </button>
          </div>
        </div>

        <GoogleAuthButton isSignUp={true} role={form.role} />

        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Shedrach" 
              value={form.displayName}
              onChange={set('displayName')}
              required
            />
          </div>
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
            {authLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
