import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  {
    to: '/app/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5"/>
      </svg>
    ),
  },
  {
    to: '/app/paths',
    label: 'Skill Paths',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4h12M2 8h8M2 12h10"/>
      </svg>
    ),
  },
  {
    to: '/app/lab',
    label: 'The Lab',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="2" width="14" height="12" rx="2"/>
        <path d="M4 6l3 3-3 3M9 12h3"/>
      </svg>
    ),
  },
  {
    to: '/app/skillcheck',
    label: 'Skill Check',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 4L6 11l-3-3"/>
        <circle cx="8" cy="8" r="7"/>
      </svg>
    ),
  },
]

const PATH_COLORS = {
  violet: 'var(--accent-violet)',
  teal:   'var(--accent-teal)',
  amber:  'var(--accent-amber)',
  red:    'var(--accent-red)',
}

export default function Sidebar() {
  const { progress } = useStore()
  const navigate = useNavigate()

  return (
    <aside className={styles.sidebar}>
      {/* Main nav */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Navigate</span>
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

      {/* My paths */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>My Paths</span>
        {PATHS.filter((p) => (progress[p.id] || 0) > 0).map((path) => {
          const done  = progress[path.id] || 0
          const total = path.lessons_data.length
          const pct   = Math.round((done / total) * 100)
          const color = PATH_COLORS[path.color] || 'var(--accent-violet)'
          return (
            <button
              key={path.id}
              className={styles.pathItem}
              onClick={() => navigate(`/app/lesson/${path.lessons_data[Math.min(done, total - 1)].id}`)}
            >
              <div className={styles.pathRow}>
                <span className={styles.pathIcon}>{path.icon}</span>
                <span className={styles.pathName}>{path.name}</span>
                <span className={styles.pathPct} style={{ color }}>
                  {pct}%
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </button>
          )
        })}
        {PATHS.filter((p) => (progress[p.id] || 0) > 0).length === 0 && (
          <p className={styles.emptyHint}>Start a path to see it here</p>
        )}
      </div>

      {/* Bottom: profile + settings */}
      <div className={styles.bottom}>
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            [styles.navItem, isActive ? styles.active : ''].join(' ')
          }
        >
          <span className={styles.navIcon}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="5" r="3"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5"/>
            </svg>
          </span>
          Profile
        </NavLink>
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            [styles.navItem, isActive ? styles.active : ''].join(' ')
          }
        >
          <span className={styles.navIcon}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="2.5"/>
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
            </svg>
          </span>
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
