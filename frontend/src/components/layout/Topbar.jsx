import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import styles from './Topbar.module.css'

export default function Topbar() {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()

  const mekScore = currentUser?.mekScore ?? 0

  function handleSignOut() {
    signOut()
    navigate('/', { replace: true })
  }

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
            <div className={styles.mekFill} style={{ width: `${mekScore}%` }} />
          </div>
          <span className={styles.mekValue}>{mekScore}%</span>
        </div>

        {/* Avatar dropdown */}
        <div className={styles.avatarWrap}>
          <Link to="/app/profile" className={styles.avatar} title={currentUser?.name}>
            {currentUser?.avatar || '?'}
          </Link>
          <div className={styles.dropdown}>
            <div className={styles.dropdownInner}>
            <div className={styles.dropHead}>
              <span className={styles.dropName}>{currentUser?.name}</span>
              <span className={styles.dropEmail}>{currentUser?.email}</span>
              {currentUser?.role === 'admin' && (
                <span className={styles.adminBadge}>Admin</span>
              )}
            </div>
            <div className={styles.dropDivider} />
            <Link to="/app/profile"  className={styles.dropItem}>Profile</Link>
            <Link to="/app/settings" className={styles.dropItem}>Settings</Link>
            {currentUser?.role === 'admin' && (
              <Link to="/app/admin/cms" className={styles.dropItem}>
                Content Management
              </Link>
            )}
            <div className={styles.dropDivider} />
            <button className={styles.dropSignOut} onClick={handleSignOut}>
              Sign out
            </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
