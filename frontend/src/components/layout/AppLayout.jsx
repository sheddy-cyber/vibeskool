import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { getStoredTheme, applyTheme, applyFont, getStoredFont } from '@/lib/theme'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import CommandPalette from './CommandPalette'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const { sidebarOpen, toggleSidebar, sidebarCollapsed, toggleSidebarCollapsed, fetchProgress } = useStore()
  const { currentUser } = useAuth()
  const location = useLocation()

  // Apply the stored theme (light / dark / system) when entering the app
  useEffect(() => {
    applyTheme(getStoredTheme())
  }, [])

  // Your font follows your account: on a new device, use the one you picked
  const accountFont = currentUser?.settings?.font
  useEffect(() => {
    if (accountFont && accountFont !== getStoredFont()) applyFont(accountFont)
  }, [accountFont])

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    if (useStore.getState().sidebarOpen) toggleSidebar()
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Ctrl/⌘ + B collapses or expands the sidebar (not while typing)
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== 'b') return
      const t = e.target
      if (t?.closest?.('input, textarea, select, [contenteditable="true"], .monaco-editor, .cm-editor')) return
      if (window.matchMedia('(max-width: 900px)').matches) return
      e.preventDefault()
      toggleSidebarCollapsed()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleSidebarCollapsed])

  // Load real progress once we know who is signed in
  useEffect(() => {
    if (currentUser?.id) fetchProgress()
  }, [currentUser?.id, fetchProgress])

  return (
    <div className={`${styles.layout} ${sidebarCollapsed ? styles.collapsed : ''}`}>
      <Topbar />
      <Sidebar />
      {sidebarOpen && <div className={styles.backdrop} onClick={toggleSidebar} aria-hidden="true" />}
      <main className={styles.main}>
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  )
}
