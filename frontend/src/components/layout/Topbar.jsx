import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import styles from './Topbar.module.css'

export default function Topbar() {
  const { user } = useStore()

  return (
    <header className={styles.topbar}>
      <Link to="/app/dashboard" className={styles.logo}>
        Vibe<span>Skool</span>
      </Link>
      <span className={styles.tagline}>Learn enough. Build anything.</span>

      <div className={styles.right}>
        <span className={styles.badge}>MEK Platform</span>
        <div className={styles.mekPill}>
          <span className={styles.mekLabel}>MEK Score</span>
          <span className={styles.mekValue}>{user.mekScore}%</span>
        </div>
        <Link to="/app/profile" className={styles.avatar} title="Profile">
          {user.avatar}
        </Link>
      </div>
    </header>
  )
}
