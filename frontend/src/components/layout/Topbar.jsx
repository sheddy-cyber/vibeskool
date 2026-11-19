import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { usePalette } from '@/lib/palette'
import { BrandLogo } from '@/components/ui'
import Icon from '@/components/icons/Icons'
import styles from './Topbar.module.css'

/* Small-screen bar only. On wide screens the sidebar carries the logo,
   search and account menu, so this is hidden. */
export default function Topbar() {
  const { sidebarOpen, toggleSidebar } = useStore()
  const showPalette = usePalette((s) => s.show)

  return (
    <header className={styles.bar}>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={toggleSidebar}
        aria-label="Open menu"
        aria-expanded={sidebarOpen}
      >
        <Icon name="menu" size={20} />
      </button>
      <Link to="/app/dashboard" className={styles.brand} aria-label="VibeSkool home">
        <BrandLogo size={22} />
      </Link>
      <button type="button" className={styles.iconBtn} onClick={showPalette} aria-label="Search">
        <Icon name="search" size={20} />
      </button>
    </header>
  )
}
