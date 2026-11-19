import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { BrandLogo } from '@/components/ui'
import styles from './Auth.module.css'

/* Split-screen shell shared by sign in and sign up. */
export default function AuthLayout({ art, artTitle, artText, tone = 'blue', footer, children }) {
  return (
    <MotionConfig reducedMotion="user">
    <div className={styles.page}>
      <div className={styles.formSide}>
        <Link to="/" className={styles.logo} aria-label="VibeSkool home">
          <BrandLogo size={28} />
        </Link>

        <main className={styles.formWrap}>{children}</main>

        {footer && <div className={styles.legal}>{footer}</div>}
      </div>

      <aside className={`${styles.artSide} ${tone === 'green' ? styles.artGreen : ''}`} aria-hidden="true">
        <div className={styles.artInner}>
          {art}
          <h2 className={styles.artTitle}>{artTitle}</h2>
          <p className={styles.artText}>{artText}</p>
        </div>
      </aside>
    </div>
    </MotionConfig>
  )
}

export function Field({ id, label, hint, children }) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {hint}
      </div>
      {children}
    </div>
  )
}

export function PasswordInput({ id, value, onChange, autoComplete, minLength }) {
  const [show, setShow] = useState(false)
  return (
    <div className={styles.passwordWrap}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className={styles.input}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        minLength={minLength}
        required
      />
      <button
        type="button"
        className={styles.reveal}
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export { styles as authStyles }
