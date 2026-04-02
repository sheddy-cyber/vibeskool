import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useStore } from '@/lib/store'
import styles from './AppLayout.module.css'

// Minimal theme applicator — keeps layout thin
const THEME_VARS = {
  dark:     { '--bg-base':'#0c0c0e','--bg-surface':'#111114','--bg-raised':'#18181c','--bg-overlay':'#1f1f24','--text-primary':'#f2f2f5','--text-secondary':'#8e8e9e','--text-tertiary':'#5a5a6a','--border-faint':'rgba(255,255,255,0.055)','--border-subtle':'rgba(255,255,255,0.085)','--border-default':'rgba(255,255,255,0.12)','--border-strong':'rgba(255,255,255,0.20)','--accent':'#6366f1','--accent-hover':'#5254cc','--accent-dim':'rgba(99,102,241,0.10)','--accent-border':'rgba(99,102,241,0.28)','--accent-text':'#a5b4fc','--green':'#34d399','--green-dim':'rgba(52,211,153,0.08)','--green-border':'rgba(52,211,153,0.22)','--amber':'#f59e0b','--amber-dim':'rgba(245,158,11,0.08)','--amber-border':'rgba(245,158,11,0.22)','--red':'#f87171','--red-dim':'rgba(248,113,113,0.08)','--red-border':'rgba(248,113,113,0.22)' },
  midnight: { '--bg-base':'#050d1a','--bg-surface':'#091424','--bg-raised':'#0f1e32','--bg-overlay':'#162840','--text-primary':'#e8f0fe','--text-secondary':'#8ba4c8','--text-tertiary':'#4a6080','--border-faint':'rgba(96,165,250,0.06)','--border-subtle':'rgba(96,165,250,0.10)','--border-default':'rgba(96,165,250,0.16)','--border-strong':'rgba(96,165,250,0.28)','--accent':'#3b82f6','--accent-hover':'#2563eb','--accent-dim':'rgba(59,130,246,0.10)','--accent-border':'rgba(59,130,246,0.28)','--accent-text':'#93c5fd','--green':'#34d399','--green-dim':'rgba(52,211,153,0.08)','--green-border':'rgba(52,211,153,0.22)','--amber':'#fbbf24','--amber-dim':'rgba(251,191,36,0.08)','--amber-border':'rgba(251,191,36,0.22)','--red':'#f87171','--red-dim':'rgba(248,113,113,0.08)','--red-border':'rgba(248,113,113,0.22)' },
  forest:   { '--bg-base':'#0a0f0a','--bg-surface':'#0f150f','--bg-raised':'#162016','--bg-overlay':'#1c281c','--text-primary':'#e8f5e8','--text-secondary':'#7faa7f','--text-tertiary':'#4a664a','--border-faint':'rgba(74,222,128,0.06)','--border-subtle':'rgba(74,222,128,0.10)','--border-default':'rgba(74,222,128,0.16)','--border-strong':'rgba(74,222,128,0.28)','--accent':'#22c55e','--accent-hover':'#16a34a','--accent-dim':'rgba(34,197,94,0.10)','--accent-border':'rgba(34,197,94,0.28)','--accent-text':'#86efac','--green':'#a3e635','--green-dim':'rgba(163,230,53,0.08)','--green-border':'rgba(163,230,53,0.22)','--amber':'#fde68a','--amber-dim':'rgba(253,230,138,0.08)','--amber-border':'rgba(253,230,138,0.22)','--red':'#fca5a5','--red-dim':'rgba(252,165,165,0.08)','--red-border':'rgba(252,165,165,0.22)' },
  ocean:    { '--bg-base':'#060f14','--bg-surface':'#0a1820','--bg-raised':'#10222e','--bg-overlay':'#162d3d','--text-primary':'#e0f7ff','--text-secondary':'#6aabcc','--text-tertiary':'#3d6878','--border-faint':'rgba(34,211,238,0.06)','--border-subtle':'rgba(34,211,238,0.10)','--border-default':'rgba(34,211,238,0.16)','--border-strong':'rgba(34,211,238,0.28)','--accent':'#06b6d4','--accent-hover':'#0891b2','--accent-dim':'rgba(6,182,212,0.10)','--accent-border':'rgba(6,182,212,0.28)','--accent-text':'#67e8f9','--green':'#818cf8','--green-dim':'rgba(129,140,248,0.08)','--green-border':'rgba(129,140,248,0.22)','--amber':'#fbbf24','--amber-dim':'rgba(251,191,36,0.08)','--amber-border':'rgba(251,191,36,0.22)','--red':'#fb7185','--red-dim':'rgba(251,113,133,0.08)','--red-border':'rgba(251,113,133,0.22)' },
  light:    { '--bg-base':'#fafafa','--bg-surface':'#ffffff','--bg-raised':'#f4f4f6','--bg-overlay':'#ebebef','--text-primary':'#111113','--text-secondary':'#52525c','--text-tertiary':'#9898a8','--border-faint':'rgba(0,0,0,0.05)','--border-subtle':'rgba(0,0,0,0.08)','--border-default':'rgba(0,0,0,0.12)','--border-strong':'rgba(0,0,0,0.22)','--accent':'#6366f1','--accent-hover':'#5254cc','--accent-dim':'rgba(99,102,241,0.07)','--accent-border':'rgba(99,102,241,0.22)','--accent-text':'#6366f1','--green':'#059669','--green-dim':'rgba(5,150,105,0.07)','--green-border':'rgba(5,150,105,0.22)','--amber':'#d97706','--amber-dim':'rgba(217,119,6,0.07)','--amber-border':'rgba(217,119,6,0.22)','--red':'#dc2626','--red-dim':'rgba(220,38,38,0.07)','--red-border':'rgba(220,38,38,0.22)' },
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
