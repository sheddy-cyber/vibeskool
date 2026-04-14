import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useStore } from '@/lib/store'
import { PageTransition } from '@/components/ui/Motion'
import styles from './AppLayout.module.css'

const THEME_VARS = {
  dark:     { '--bg-base':'#1c1a17','--bg-surface':'#231f1b','--bg-raised':'#2c2822','--bg-overlay':'#36312a','--bg-input':'#272320','--text-primary':'#f0ebe3','--text-secondary':'#a8998a','--text-tertiary':'#6a5e50','--border-faint':'rgba(240,235,227,0.055)','--border-subtle':'rgba(240,235,227,0.09)','--border-default':'rgba(240,235,227,0.15)','--border-strong':'rgba(240,235,227,0.26)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.12)','--accent-border':'rgba(201,122,58,0.32)','--accent-text':'#e0a060','--green':'#7aad84','--green-dim':'rgba(122,173,132,0.10)','--green-border':'rgba(122,173,132,0.28)','--amber':'#c9a25a','--amber-dim':'rgba(201,162,90,0.10)','--amber-border':'rgba(201,162,90,0.28)','--red':'#c47868','--red-dim':'rgba(196,120,104,0.10)','--red-border':'rgba(196,120,104,0.28)','--sage':'#8a9e8a','--stone':'#c4b8a8' },
  dim:      { '--bg-base':'#231f1b','--bg-surface':'#2c2822','--bg-raised':'#36312a','--bg-overlay':'#403b32','--bg-input':'#302c26','--text-primary':'#f0ebe3','--text-secondary':'#a8998a','--text-tertiary':'#6a5e50','--border-faint':'rgba(240,235,227,0.07)','--border-subtle':'rgba(240,235,227,0.11)','--border-default':'rgba(240,235,227,0.17)','--border-strong':'rgba(240,235,227,0.30)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.14)','--accent-border':'rgba(201,122,58,0.36)','--accent-text':'#e0a060','--green':'#7aad84','--green-dim':'rgba(122,173,132,0.10)','--green-border':'rgba(122,173,132,0.28)','--amber':'#c9a25a','--amber-dim':'rgba(201,162,90,0.10)','--amber-border':'rgba(201,162,90,0.28)','--red':'#c47868','--red-dim':'rgba(196,120,104,0.10)','--red-border':'rgba(196,120,104,0.28)','--sage':'#8a9e8a','--stone':'#c4b8a8' },
  midnight: { '--bg-base':'#0e1410','--bg-surface':'#141c16','--bg-raised':'#1b261d','--bg-overlay':'#223022','--bg-input':'#172019','--text-primary':'#e0f0e0','--text-secondary':'#80a888','--text-tertiary':'#486050','--border-faint':'rgba(138,173,132,0.07)','--border-subtle':'rgba(138,173,132,0.12)','--border-default':'rgba(138,173,132,0.20)','--border-strong':'rgba(138,173,132,0.34)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.12)','--accent-border':'rgba(201,122,58,0.32)','--accent-text':'#e0a060','--green':'#8a9e8a','--green-dim':'rgba(138,158,138,0.10)','--green-border':'rgba(138,158,138,0.28)','--amber':'#c9a25a','--amber-dim':'rgba(201,162,90,0.10)','--amber-border':'rgba(201,162,90,0.28)','--red':'#c47868','--red-dim':'rgba(196,120,104,0.10)','--red-border':'rgba(196,120,104,0.28)','--sage':'#8a9e8a','--stone':'#c4b8a8' },
  forest:   { '--bg-base':'#f5f0e8','--bg-surface':'#fdf9f4','--bg-raised':'#ede8de','--bg-overlay':'#e5dfd4','--bg-input':'#e8e2d8','--text-primary':'#2d2520','--text-secondary':'#6a5e50','--text-tertiary':'#a0907e','--border-faint':'rgba(45,37,32,0.06)','--border-subtle':'rgba(45,37,32,0.10)','--border-default':'rgba(45,37,32,0.16)','--border-strong':'rgba(45,37,32,0.28)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.10)','--accent-border':'rgba(201,122,58,0.30)','--accent-text':'#b86e30','--green':'#5a8a5a','--green-dim':'rgba(90,138,90,0.10)','--green-border':'rgba(90,138,90,0.28)','--amber':'#a07830','--amber-dim':'rgba(160,120,48,0.10)','--amber-border':'rgba(160,120,48,0.28)','--red':'#a05040','--red-dim':'rgba(160,80,64,0.10)','--red-border':'rgba(160,80,64,0.28)','--sage':'#6a8a6a','--stone':'#c4b8a8' },
  light:    { '--bg-base':'#100d0a','--bg-surface':'#18140f','--bg-raised':'#201a14','--bg-overlay':'#28221a','--bg-input':'#1c1710','--text-primary':'#f0e8d8','--text-secondary':'#907060','--text-tertiary':'#604838','--border-faint':'rgba(240,232,216,0.055)','--border-subtle':'rgba(240,232,216,0.09)','--border-default':'rgba(240,232,216,0.15)','--border-strong':'rgba(240,232,216,0.26)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.14)','--accent-border':'rgba(201,122,58,0.36)','--accent-text':'#e0a060','--green':'#7aad84','--green-dim':'rgba(122,173,132,0.10)','--green-border':'rgba(122,173,132,0.28)','--amber':'#c9a25a','--amber-dim':'rgba(201,162,90,0.10)','--amber-border':'rgba(201,162,90,0.28)','--red':'#c47868','--red-dim':'rgba(196,120,104,0.10)','--red-border':'rgba(196,120,104,0.28)','--sage':'#8a9e8a','--stone':'#c4b8a8' },
}

export default function AppLayout() {
  const { settings } = useStore()
  const location = useLocation()

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
        {/* Re-key on pathname so every route change triggers PageTransition */}
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}
