import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { usePalette, isMac } from '@/lib/palette'
import { BrandLogo, BrandMark } from '@/components/ui'
import Icon from '@/components/icons/Icons'
import styles from './Sidebar.module.css'

const LEARN = [
  { to: '/app/dashboard', label: 'Home', icon: 'home' },
  { to: '/app/paths', label: 'Paths', icon: 'route' },
  { to: '/app/lab', label: 'Playground', icon: 'terminal' },
]

const COMMUNITY = [
  { to: '/app/classrooms', label: 'Classrooms', icon: 'classroom' },
  { to: '/app/showcase', label: 'Showcase', icon: 'showcase' },
]

const TEACHING = [
  { to: '/app/teacher/dashboard', label: 'Overview', icon: 'chart' },
  { to: '/app/teacher/classrooms', label: 'Classes', icon: 'board' },
  { to: '/app/teacher/cms', label: 'Content', icon: 'pen' },
  { to: '/app/teacher/exercises', label: 'Exercises', icon: 'checklist' },
]

const THEMES = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
]

function NavItem({ to, label, icon, onNavigate, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
      data-tip={label}
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} size={19} active={isActive} />
          <span className={styles.label}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

function UserMenu({ onNavigate }) {
  const { currentUser, signOut, updateUserSettings } = useAuth()
  const { settings, updateSettings } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const theme = settings?.theme || 'dark'

  useEffect(() => {
    if (!open) return
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const setTheme = (value) => {
    updateSettings({ theme: value })
    updateUserSettings?.({ theme: value })
  }

  const name = currentUser?.name || 'Your account'
  const role = currentUser?.role === 'teacher' ? 'Tutor' : currentUser?.role === 'admin' ? 'Admin' : 'Learner'

  return (
    <div className={styles.userWrap} ref={ref}>
      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.menuHead}>
            <span className={styles.menuName}>{name}</span>
            {currentUser?.email && <span className={styles.menuEmail}>{currentUser.email}</span>}
          </div>
          <Link to="/app/profile" className={styles.menuItem} role="menuitem" onClick={() => { setOpen(false); onNavigate?.() }}>
            <Icon name="profile" size={17} /> Profile
          </Link>
          <Link to="/app/settings" className={styles.menuItem} role="menuitem" onClick={() => { setOpen(false); onNavigate?.() }}>
            <Icon name="settings" size={17} /> Settings
          </Link>
          <div className={styles.menuSep} />
          <div className={styles.themeRow} role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={theme === t.value}
                className={theme === t.value ? styles.themeOn : undefined}
                onClick={() => setTheme(t.value)}
                title={t.label}
              >
                <Icon name={t.icon} size={16} active={theme === t.value} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.menuSep} />
          <button type="button" className={styles.menuItem} role="menuitem" onClick={() => { setOpen(false); signOut() }}>
            <Icon name="logout" size={17} /> Sign out
          </button>
        </div>
      )}

      <button
        type="button"
        className={`${styles.user} ${open ? styles.userOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${name}, account menu`}
        data-tip={open ? undefined : name}
      >
        <span className={styles.avatar}>
          {currentUser?.avatar && currentUser.avatar.startsWith('http')
            ? <img src={currentUser.avatar} alt="" />
            : initials(currentUser?.name)}
        </span>
        <span className={styles.userText}>
          <span className={styles.userName}>{name}</span>
          <span className={styles.userRole}>{role}</span>
        </span>
        <Icon name="chevronDown" size={16} className={styles.userChevron} />
      </button>
    </div>
  )
}

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, sidebarCollapsed: collapsed, toggleSidebarCollapsed } = useStore()
  const { currentUser } = useAuth()
  const showPalette = usePalette((s) => s.show)
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin'

  const closeOnMobile = () => {
    if (sidebarOpen) toggleSidebar()
  }

  return (
    <aside
      className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''} ${collapsed ? styles.collapsed : ''}`}
      aria-label="App navigation"
    >
      <div className={styles.head}>
        <Link to="/app/dashboard" className={styles.brand} onClick={closeOnMobile} aria-label="VibeSkool home">
          <BrandLogo size={24} />
        </Link>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={toggleSidebarCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? undefined : `Collapse sidebar (${isMac() ? '⌘' : 'Ctrl'} B)`}
          data-tip={`Expand sidebar (${isMac() ? '⌘' : 'Ctrl'} B)`}
        >
          <span className={styles.railMark}><BrandMark size={22} /></span>
          <Icon name="sidebar" size={19} className={styles.railIcon} />
        </button>
        <button type="button" className={styles.closeBtn} onClick={toggleSidebar} aria-label="Close menu">
          <Icon name="close" size={18} />
        </button>
      </div>

      <button
        type="button"
        className={styles.search}
        onClick={() => { closeOnMobile(); showPalette() }}
        aria-label="Search"
        data-tip={`Search (${isMac() ? '⌘K' : 'Ctrl K'})`}
      >
        <Icon name="search" size={17} />
        <span>Search</span>
        <kbd>{isMac() ? '⌘K' : 'Ctrl K'}</kbd>
      </button>

      <nav className={styles.nav}>
        <div className={styles.group}>
          {LEARN.map((i) => <NavItem key={i.to} {...i} onNavigate={closeOnMobile} />)}
        </div>

        <div className={styles.group}>
          <span className={styles.groupLabel}>Community</span>
          {COMMUNITY.map((i) => <NavItem key={i.to} {...i} onNavigate={closeOnMobile} />)}
        </div>

        {isTeacher && (
          <div className={styles.group}>
            <span className={styles.groupLabel}>Teaching</span>
            {TEACHING.map((i) => <NavItem key={i.to} {...i} onNavigate={closeOnMobile} />)}
          </div>
        )}
      </nav>

      <div className={styles.foot}>
        <UserMenu onNavigate={closeOnMobile} />
      </div>
    </aside>
  )
}
