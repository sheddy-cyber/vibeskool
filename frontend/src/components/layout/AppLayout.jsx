import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const { sidebarOpen, toggleSidebar } = useStore()
  const { currentUser } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (window.innerWidth <= 768 && sidebarOpen) {
      toggleSidebar()
    }
  }, [location, sidebarOpen, toggleSidebar])

  useEffect(() => {
    if (currentUser) {
      useStore.setState({
        progress: currentUser.progress || {},
        passedModules: currentUser.passedModules || []
      })
    }
  }, [currentUser])

  return (
    <div className={styles.layout}>
      <Topbar />
      <Sidebar />
      {sidebarOpen && (
        <div 
          className={styles.backdrop} 
          onClick={toggleSidebar} 
        />
      )}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
