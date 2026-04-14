import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import styles from './Sidebar.module.css'


const PATH_SVGS = {
  'vibe-web': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  'vibe-coding': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  'git-github': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
      <path d="M13 6h3a2 2 0 012 2v7"/><line x1="6" y1="9" x2="6" y2="21"/>
    </svg>
  ),
  'python-basics': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  ),
  'apis': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 9l3 3-3 3"/><line x1="13" y1="15" x2="16" y2="15"/>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  ),
  'sql-basics': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
}

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
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const isAdmin = currentUser?.role === 'admin'

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
                <span className={styles.pathIcon}>{PATH_SVGS[path.id] || PATH_SVGS['vibe-coding']}</span><span className={styles.pathName}>{path.name}</span>
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
        {isAdmin && (
          <NavLink to="/app/admin/cms" className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}>
            <span className={styles.navIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 2h10a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z"/>
                <path d="M4 6h6M4 9h4"/>
              </svg>
            </span>
            Content
          </NavLink>
        )}
      </div>
    </aside>
  )
}
