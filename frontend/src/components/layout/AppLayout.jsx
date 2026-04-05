import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useStore } from '@/lib/store'
import styles from './AppLayout.module.css'

// Minimal theme applicator — keeps layout thin
const THEME_VARS = {
  dark:     { '--bg-base':'#000000','--bg-surface':'#0d1117','--bg-raised':'#141c25','--bg-overlay':'#1c2732','--text-primary':'#e7e9ea','--text-secondary':'#8b98a5','--text-tertiary':'#536471','--border-faint':'rgba(255,255,255,0.06)','--border-subtle':'rgba(255,255,255,0.10)','--border-default':'rgba(255,255,255,0.15)','--border-strong':'rgba(255,255,255,0.24)','--accent':'#1d9bf0','--accent-hover':'#1a8cd8','--accent-dim':'rgba(29,155,240,0.10)','--accent-border':'rgba(29,155,240,0.30)','--accent-text':'#1d9bf0','--green':'#00ba7c','--green-dim':'rgba(0,186,124,0.08)','--green-border':'rgba(0,186,124,0.25)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.25)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.25)' },
  midnight: { '--bg-base':'#000209','--bg-surface':'#050d1a','--bg-raised':'#0a1628','--bg-overlay':'#101e34','--text-primary':'#dce8f5','--text-secondary':'#7a9ab5','--text-tertiary':'#3d5a73','--border-faint':'rgba(29,155,240,0.07)','--border-subtle':'rgba(29,155,240,0.12)','--border-default':'rgba(29,155,240,0.20)','--border-strong':'rgba(29,155,240,0.32)','--accent':'#1d9bf0','--accent-hover':'#1a8cd8','--accent-dim':'rgba(29,155,240,0.12)','--accent-border':'rgba(29,155,240,0.35)','--accent-text':'#1d9bf0','--green':'#00ba7c','--green-dim':'rgba(0,186,124,0.08)','--green-border':'rgba(0,186,124,0.25)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.25)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.25)' },
  dim:      { '--bg-base':'#15202b','--bg-surface':'#1e2732','--bg-raised':'#253341','--bg-overlay':'#2c3e50','--text-primary':'#f7f9f9','--text-secondary':'#8b98a5','--text-tertiary':'#536471','--border-faint':'rgba(255,255,255,0.06)','--border-subtle':'rgba(255,255,255,0.10)','--border-default':'rgba(255,255,255,0.16)','--border-strong':'rgba(255,255,255,0.26)','--accent':'#1d9bf0','--accent-hover':'#1a8cd8','--accent-dim':'rgba(29,155,240,0.12)','--accent-border':'rgba(29,155,240,0.35)','--accent-text':'#1d9bf0','--green':'#00ba7c','--green-dim':'rgba(0,186,124,0.08)','--green-border':'rgba(0,186,124,0.25)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.25)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.25)' },
  forest:   { '--bg-base':'#040d07','--bg-surface':'#0a1610','--bg-raised':'#111f17','--bg-overlay':'#182a1f','--text-primary':'#dcf0e4','--text-secondary':'#6a9e7c','--text-tertiary':'#3a6348','--border-faint':'rgba(0,186,124,0.07)','--border-subtle':'rgba(0,186,124,0.12)','--border-default':'rgba(0,186,124,0.20)','--border-strong':'rgba(0,186,124,0.32)','--accent':'#00ba7c','--accent-hover':'#009d68','--accent-dim':'rgba(0,186,124,0.10)','--accent-border':'rgba(0,186,124,0.32)','--accent-text':'#00ba7c','--green':'#1d9bf0','--green-dim':'rgba(29,155,240,0.08)','--green-border':'rgba(29,155,240,0.25)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.25)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.25)' },
  light:    { '--bg-base':'#ffffff','--bg-surface':'#f7f9f9','--bg-raised':'#eff3f4','--bg-overlay':'#e7eaeb','--text-primary':'#0f1419','--text-secondary':'#536471','--text-tertiary':'#8b98a5','--border-faint':'rgba(0,0,0,0.05)','--border-subtle':'rgba(0,0,0,0.08)','--border-default':'rgba(0,0,0,0.13)','--border-strong':'rgba(0,0,0,0.22)','--accent':'#1d9bf0','--accent-hover':'#1a8cd8','--accent-dim':'rgba(29,155,240,0.08)','--accent-border':'rgba(29,155,240,0.25)','--accent-text':'#1d9bf0','--green':'#00ba7c','--green-dim':'rgba(0,186,124,0.08)','--green-border':'rgba(0,186,124,0.22)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.22)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.22)' },
}

export default function AppLayout() {
  const { settings } = useStore()

  useEffect(() => {
    const vars = THEME_VARS[settings.theme] || THEME_VARS.dark
    const root = document.documentElement
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  }, [settings.theme])

  return (
    <div className={styles.shell}>
      <Topbar />
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
