import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  {
    to: '/app/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <rect x="1" y="1" width="5" height="5" rx="1.2"/>
        <rect x="8" y="1" width="5" height="5" rx="1.2"/>
        <rect x="1" y="8" width="5" height="5" rx="1.2"/>
        <rect x="8" y="8" width="5" height="5" rx="1.2"/>
      </svg>
    ),
  },
  {
    to: '/app/paths',
    label: 'Skill Paths',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M2 3.5h10M2 7h7M2 10.5h8.5"/>
      </svg>
    ),
  },
  {
    to: '/app/lab',
    label: 'Lab',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <rect x="1" y="2" width="12" height="10" rx="1.5"/>
        <path d="M4 5.5l2.5 2.5-2.5 2.5M8 10.5h2.5"/>
      </svg>
    ),
  },
  {
    to: '/app/skillcheck',
    label: 'Skill Check',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="7" cy="7" r="5.5"/>
        <path d="M4.5 7l2 2 3-3.5"/>
      </svg>
    ),
  },
]

const PATH_COLORS = { violet: 'var(--accent)', teal: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)' }

export default function Sidebar() {
  const { progress } = useStore()
  const navigate = useNavigate()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Navigation</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.active : ''].join(' ')
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>In Progress</span>
        {PATHS.filter((p) => (progress[p.id] || 0) > 0).map((path) => {
          const done  = progress[path.id] || 0
          const total = path.lessons_data.length
          const pct   = Math.round((done / total) * 100)
          const color = PATH_COLORS[path.color] || 'var(--accent)'
          return (
            <button
              key={path.id}
              className={styles.pathItem}
              onClick={() => navigate(`/app/lesson/${path.lessons_data[Math.min(done, total - 1)].id}`)}
            >
              <div className={styles.pathRow}>
                <span className={styles.pathName}>{path.name}</span>
                <span className={styles.pathPct}>{pct}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
              </div>
            </button>
          )
        })}
        {PATHS.filter((p) => (progress[p.id] || 0) > 0).length === 0 && (
          <p className={styles.emptyHint}>No paths started yet</p>
        )}
      </div>

      <div className={styles.bottom}>
        <NavLink to="/app/profile" className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}>
          <span className={styles.navIcon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="7" cy="4.5" r="2.5"/>
              <path d="M1.5 12.5c0-3 2.462-4.5 5.5-4.5s5.5 1.5 5.5 4.5"/>
            </svg>
          </span>
          Profile
        </NavLink>
        <NavLink to="/app/settings" className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}>
          <span className={styles.navIcon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="7" cy="7" r="2"/>
              <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.636 2.636l1.414 1.414M9.95 9.95l1.414 1.414M2.636 11.364l1.414-1.414M9.95 4.05l1.414-1.414"/>
            </svg>
          </span>
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
