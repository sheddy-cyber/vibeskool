import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useStore } from '@/lib/store'
import styles from './Topbar.module.css'

export default function Topbar({ onOpenCommandPalette }) {
  const { currentUser, signOut } = useAuth()
  const sidebarOpen = useStore(state => state.sidebarOpen)
  const navigate = useNavigate()

  function toggleSyllabus() {
    useStore.setState(state => ({ sidebarOpen: !state.sidebarOpen }))
  }

  function handleSignOut() {
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <header className={styles.topbar}>
      <button className={styles.syllabusButton} onClick={toggleSyllabus} aria-label="Open course syllabus" aria-controls="course-index" aria-expanded={sidebarOpen}>Syllabus <span>{sidebarOpen ? '−' : '+'}</span></button>
      <div className={styles.location}><span>Full stack web development</span><b>Student workspace</b></div>
      <div className={styles.actions}>
        <button className={styles.search} onClick={onOpenCommandPalette}>Find in course <kbd>Ctrl K</kbd></button>
        <Link className={styles.transcript} to="/app/profile">Transcript</Link>
        <details className={styles.account}>
          <summary aria-label="Open student account menu">{currentUser?.avatar || 'VS'}</summary>
          <div className={styles.menu}><p><b>{currentUser?.name || 'Student'}</b><span>{currentUser?.email || 'student@vibeskool.edu'}</span></p><Link to="/app/settings">Reading settings</Link><button onClick={handleSignOut}>Sign out</button></div>
        </details>
      </div>
    </header>
  )
}
