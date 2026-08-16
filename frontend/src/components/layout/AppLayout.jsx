import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CommandPalette from '@/components/ui/CommandPalette'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { PageTransition } from '@/components/ui/Motion'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const { settings, sidebarOpen } = useStore()
  const { currentUser } = useAuth()
  const location = useLocation()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    if (currentUser) {
      useStore.setState({
        progress: currentUser.progress || {},
        passedModules: currentUser.passedModules || []
      })
    }
  }, [currentUser])

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close sidebar on mount if mobile viewport
  useEffect(() => {
    if (window.innerWidth <= 768) {
      useStore.setState({ sidebarOpen: false })
    }
  }, [])

  // Close sidebar on navigation on mobile viewports
  useEffect(() => {
    if (window.innerWidth <= 768 && sidebarOpen) {
      useStore.setState({ sidebarOpen: false })
    }
  }, [location.pathname])

  return (
    <div className={clsx(
      styles.shell,
      !sidebarOpen && styles.sidebarMobileClosed,
      settings.compactSidebar && styles.sidebarCompact,
      settings.compactSidebar && 'sidebarCompact',
      sidebarOpen && styles.sidebarMobileOpen
    )}>
      <Topbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
      <Sidebar />
      <div 
        className={styles.backdrop} 
        onClick={() => useStore.setState({ sidebarOpen: false })} 
      />
      <main className={styles.main}>
        {/* Re-key on pathname so every route change triggers PageTransition */}
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  )
}
