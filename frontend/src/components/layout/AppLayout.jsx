import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useStore } from '@/lib/store'
import styles from './AppLayout.module.css'

// Minimal theme applicator — keeps layout thin
const THEME_VARS = {
  dark:     { '--bg-base':'#09090f','--bg-surface':'#111119','--bg-raised':'#1a1a26','--bg-overlay':'#22222f','--text-primary':'#eeeef8','--text-secondary':'#9898b0','--text-muted':'#5a5a70','--border-subtle':'rgba(255,255,255,0.07)','--border-default':'rgba(255,255,255,0.11)','--border-strong':'rgba(255,255,255,0.18)','--accent-violet':'#8b7cf8','--accent-violet-dim':'rgba(139,124,248,0.12)','--accent-violet-border':'rgba(139,124,248,0.25)','--accent-teal':'#4fd1a5','--accent-teal-dim':'rgba(79,209,165,0.10)','--accent-amber':'#f0a05a','--accent-amber-dim':'rgba(240,160,90,0.10)','--accent-red':'#f06a6a','--accent-red-dim':'rgba(240,106,106,0.10)' },
  midnight: { '--bg-base':'#050d1a','--bg-surface':'#091424','--bg-raised':'#0f1e32','--bg-overlay':'#162840','--text-primary':'#e8f0fe','--text-secondary':'#8ba4c8','--text-muted':'#4a6080','--border-subtle':'rgba(96,165,250,0.08)','--border-default':'rgba(96,165,250,0.14)','--border-strong':'rgba(96,165,250,0.25)','--accent-violet':'#60a5fa','--accent-violet-dim':'rgba(96,165,250,0.12)','--accent-violet-border':'rgba(96,165,250,0.28)','--accent-teal':'#34d399','--accent-teal-dim':'rgba(52,211,153,0.10)','--accent-amber':'#fbbf24','--accent-amber-dim':'rgba(251,191,36,0.10)','--accent-red':'#f87171','--accent-red-dim':'rgba(248,113,113,0.10)' },
  forest:   { '--bg-base':'#0a0f0a','--bg-surface':'#111811','--bg-raised':'#182018','--bg-overlay':'#1f2a1f','--text-primary':'#e8f5e8','--text-secondary':'#88aa88','--text-muted':'#4a664a','--border-subtle':'rgba(74,222,128,0.07)','--border-default':'rgba(74,222,128,0.12)','--border-strong':'rgba(74,222,128,0.22)','--accent-violet':'#4ade80','--accent-violet-dim':'rgba(74,222,128,0.12)','--accent-violet-border':'rgba(74,222,128,0.28)','--accent-teal':'#a3e635','--accent-teal-dim':'rgba(163,230,53,0.10)','--accent-amber':'#fde68a','--accent-amber-dim':'rgba(253,230,138,0.10)','--accent-red':'#fca5a5','--accent-red-dim':'rgba(252,165,165,0.10)' },
  ocean:    { '--bg-base':'#060f14','--bg-surface':'#0a1820','--bg-raised':'#10222e','--bg-overlay':'#162d3d','--text-primary':'#e0f7ff','--text-secondary':'#7ab8cc','--text-muted':'#3d6878','--border-subtle':'rgba(34,211,238,0.07)','--border-default':'rgba(34,211,238,0.13)','--border-strong':'rgba(34,211,238,0.24)','--accent-violet':'#22d3ee','--accent-violet-dim':'rgba(34,211,238,0.12)','--accent-violet-border':'rgba(34,211,238,0.28)','--accent-teal':'#818cf8','--accent-teal-dim':'rgba(129,140,248,0.10)','--accent-amber':'#fbbf24','--accent-amber-dim':'rgba(251,191,36,0.10)','--accent-red':'#fb7185','--accent-red-dim':'rgba(251,113,133,0.10)' },
  light:    { '--bg-base':'#f8f8fc','--bg-surface':'#ffffff','--bg-raised':'#f0f0f8','--bg-overlay':'#e8e8f4','--text-primary':'#0f0f1a','--text-secondary':'#4a4a68','--text-muted':'#9090aa','--border-subtle':'rgba(0,0,0,0.07)','--border-default':'rgba(0,0,0,0.12)','--border-strong':'rgba(0,0,0,0.22)','--accent-violet':'#6d52e8','--accent-violet-dim':'rgba(109,82,232,0.08)','--accent-violet-border':'rgba(109,82,232,0.22)','--accent-teal':'#0d9488','--accent-teal-dim':'rgba(13,148,136,0.08)','--accent-amber':'#b45309','--accent-amber-dim':'rgba(180,83,9,0.08)','--accent-red':'#dc2626','--accent-red-dim':'rgba(220,38,38,0.08)' },
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
