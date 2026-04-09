import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import styles from './Topbar.module.css'

export default function Topbar() {
  const { user } = useStore()
  return (
    <header className={styles.topbar}>
      <Link to="/app/dashboard" className={styles.logo}>
        <div className={styles.logoMark}>VS</div>
        <span className={styles.logoText}>VibeSkool</span>
      </Link>
      <div className={styles.right}>
        <div className={styles.mekPill}>
          <span className={styles.mekLabel}>MEK</span>
          <div className={styles.mekTrack}>
            <div className={styles.mekFill} style={{ width: `${user.mekScore}%` }} />
          </div>
          <span className={styles.mekValue}>{user.mekScore}%</span>
        </div>
        <Link to="/app/profile" className={styles.avatar} title="Profile">
          {user.avatar}
        </Link>
      </div>
    </header>
  )
}
