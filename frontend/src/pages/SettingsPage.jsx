import React, { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import styles from './SettingsPage.module.css'
import { FadeUp, RevealOnScroll } from '@/components/ui/Motion'

const THEMES = [
  { id: 'dark',     name: 'Siltstone',   description: 'Default. Warm charcoal, terracotta.',   preview: ['#1c1a17', '#c97a3a', '#8a9e8a'] },
  { id: 'dim',      name: 'Worn Stone',  description: 'Lifted warmth. Easier on the eyes.',    preview: ['#231f1b', '#c97a3a', '#8a9e8a'] },
  { id: 'midnight', name: 'Sage Night',  description: 'Deep green-black. Focus mode.',          preview: ['#0e1410', '#c97a3a', '#8a9e8a'] },
  { id: 'forest',   name: 'Chalk',       description: 'Warm parchment. Daylight reading.',      preview: ['#f5f0e8', '#c97a3a', '#6a8a6a'] },
  { id: 'light',    name: 'Mocha Deep',  description: 'Near-black espresso. Rich contrast.',    preview: ['#100d0a', '#c97a3a', '#8a9e8a'] },
]

const THEME_VARS = {
  dark:     { '--bg-base':'#1c1a17','--bg-surface':'#231f1b','--bg-raised':'#2c2822','--bg-overlay':'#36312a','--bg-input':'#272320','--text-primary':'#f0ebe3','--text-secondary':'#a8998a','--text-tertiary':'#6a5e50','--border-faint':'rgba(240,235,227,0.055)','--border-subtle':'rgba(240,235,227,0.09)','--border-default':'rgba(240,235,227,0.15)','--border-strong':'rgba(240,235,227,0.26)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.12)','--accent-border':'rgba(201,122,58,0.32)','--accent-text':'#e0a060','--green':'#7aad84','--green-dim':'rgba(122,173,132,0.10)','--green-border':'rgba(122,173,132,0.28)','--amber':'#c9a25a','--amber-dim':'rgba(201,162,90,0.10)','--amber-border':'rgba(201,162,90,0.28)','--red':'#c47868','--red-dim':'rgba(196,120,104,0.10)','--red-border':'rgba(196,120,104,0.28)','--sage':'#8a9e8a','--stone':'#c4b8a8' },
  dim:      { '--bg-base':'#231f1b','--bg-surface':'#2c2822','--bg-raised':'#36312a','--bg-overlay':'#403b32','--bg-input':'#302c26','--text-primary':'#f0ebe3','--text-secondary':'#a8998a','--text-tertiary':'#6a5e50','--border-faint':'rgba(240,235,227,0.07)','--border-subtle':'rgba(240,235,227,0.11)','--border-default':'rgba(240,235,227,0.17)','--border-strong':'rgba(240,235,227,0.30)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.14)','--accent-border':'rgba(201,122,58,0.36)','--accent-text':'#e0a060','--green':'#7aad84','--green-dim':'rgba(122,173,132,0.10)','--green-border':'rgba(122,173,132,0.28)','--amber':'#c9a25a','--amber-dim':'rgba(201,162,90,0.10)','--amber-border':'rgba(201,162,90,0.28)','--red':'#c47868','--red-dim':'rgba(196,120,104,0.10)','--red-border':'rgba(196,120,104,0.28)','--sage':'#8a9e8a','--stone':'#c4b8a8' },
  midnight: { '--bg-base':'#0e1410','--bg-surface':'#141c16','--bg-raised':'#1b261d','--bg-overlay':'#223022','--bg-input':'#172019','--text-primary':'#e0f0e0','--text-secondary':'#80a888','--text-tertiary':'#486050','--border-faint':'rgba(138,173,132,0.07)','--border-subtle':'rgba(138,173,132,0.12)','--border-default':'rgba(138,173,132,0.20)','--border-strong':'rgba(138,173,132,0.34)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.12)','--accent-border':'rgba(201,122,58,0.32)','--accent-text':'#e0a060','--green':'#8a9e8a','--green-dim':'rgba(138,158,138,0.10)','--green-border':'rgba(138,158,138,0.28)','--amber':'#c9a25a','--amber-dim':'rgba(201,162,90,0.10)','--amber-border':'rgba(201,162,90,0.28)','--red':'#c47868','--red-dim':'rgba(196,120,104,0.10)','--red-border':'rgba(196,120,104,0.28)','--sage':'#8a9e8a','--stone':'#c4b8a8' },
  forest:   { '--bg-base':'#f5f0e8','--bg-surface':'#fdf9f4','--bg-raised':'#ede8de','--bg-overlay':'#e5dfd4','--bg-input':'#e8e2d8','--text-primary':'#2d2520','--text-secondary':'#6a5e50','--text-tertiary':'#a0907e','--border-faint':'rgba(45,37,32,0.06)','--border-subtle':'rgba(45,37,32,0.10)','--border-default':'rgba(45,37,32,0.16)','--border-strong':'rgba(45,37,32,0.28)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.10)','--accent-border':'rgba(201,122,58,0.30)','--accent-text':'#b86e30','--green':'#5a8a5a','--green-dim':'rgba(90,138,90,0.10)','--green-border':'rgba(90,138,90,0.28)','--amber':'#a07830','--amber-dim':'rgba(160,120,48,0.10)','--amber-border':'rgba(160,120,48,0.28)','--red':'#a05040','--red-dim':'rgba(160,80,64,0.10)','--red-border':'rgba(160,80,64,0.28)','--sage':'#6a8a6a','--stone':'#c4b8a8' },
  light:    { '--bg-base':'#100d0a','--bg-surface':'#18140f','--bg-raised':'#201a14','--bg-overlay':'#28221a','--bg-input':'#1c1710','--text-primary':'#f0e8d8','--text-secondary':'#907060','--text-tertiary':'#604838','--border-faint':'rgba(240,232,216,0.055)','--border-subtle':'rgba(240,232,216,0.09)','--border-default':'rgba(240,232,216,0.15)','--border-strong':'rgba(240,232,216,0.26)','--accent':'#c97a3a','--accent-hover':'#b86e30','--accent-dim':'rgba(201,122,58,0.14)','--accent-border':'rgba(201,122,58,0.36)','--accent-text':'#e0a060','--green':'#7aad84','--green-dim':'rgba(122,173,132,0.10)','--green-border':'rgba(122,173,132,0.28)','--amber':'#c9a25a','--amber-dim':'rgba(201,162,90,0.10)','--amber-border':'rgba(201,162,90,0.28)','--red':'#c47868','--red-dim':'rgba(196,120,104,0.10)','--red-border':'rgba(196,120,104,0.28)','--sage':'#8a9e8a','--stone':'#c4b8a8' },
}

function applyTheme(themeId) {
  const vars = THEME_VARS[themeId] || THEME_VARS.dark
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
}

const FONT_SIZES = [
  { id: 'sm', label: 'Small',  size: '13px' },
  { id: 'md', label: 'Medium', size: '14px' },
  { id: 'lg', label: 'Large',  size: '16px' },
]

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div className={styles.toggleRow}>
      <div>
        <span className={styles.toggleLabel}>{label}</span>
        {description && <p className={styles.toggleDesc}>{description}</p>}
      </div>
      <button
        className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
        onClick={() => onChange(!value)}
        aria-label={label}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { settings: storeSettings, updateSettings } = useStore()
  const { currentUser, updateUserSettings } = useAuth()
  // Use persisted user settings when available
  const settings = currentUser?.settings || storeSettings
  function updateAllSettings(patch) {
    updateSettings(patch)
    updateUserSettings(patch)
  }

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  function setTheme(id) {
    updateAllSettings({ theme: id })
  }

  function setFontSize(id) {
    const found = FONT_SIZES.find(f => f.id === id)
    if (found) document.documentElement.style.setProperty('--font-size-base', found.size)
    updateAllSettings({ fontSize: id })
  }

  return (
    <div className={styles.page}>
      <FadeUp delay={0}><div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.sub}>Customise your VibeSkool experience.</p>
      </div></FadeUp>

      <RevealOnScroll delay={40} y={14}><section className={styles.section}>
        <h2 className={styles.sectionTitle}>Appearance</h2>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Theme</span>
            <span className={styles.cardSub}>Choose how VibeSkool looks</span>
          </div>
          <div className={styles.themeGrid}>
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                className={`${styles.themeCard} ${settings.theme === theme.id ? styles.themeCardActive : ''}`}
                onClick={() => setTheme(theme.id)}
              >
                <div className={styles.themeSwatch}>
                  {theme.preview.map((color, i) => (
                    <span key={i} className={styles.themeSwatchDot} style={{ background: color }} />
                  ))}
                </div>
                <span className={styles.themeName}>{theme.name}</span>
                <span className={styles.themeDesc}>{theme.description}</span>
                {settings.theme === theme.id && <span className={styles.themeCheck}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Font size</span>
            <span className={styles.cardSub}>Affects lesson content and the Lab</span>
          </div>
          <div className={styles.fontSizeRow}>
            {FONT_SIZES.map((f) => (
              <button
                key={f.id}
                className={`${styles.fontSizeBtn} ${settings.fontSize === f.id ? styles.fontSizeBtnActive : ''}`}
                onClick={() => setFontSize(f.id)}
                style={{ fontSize: f.size }}
              >
                Aa — {f.label}
              </button>
            ))}
          </div>
        </div>
      </section></RevealOnScroll>

      <RevealOnScroll delay={0} y={14}><section className={styles.section}>
        <h2 className={styles.sectionTitle}>Learning preferences</h2>
        <div className={styles.card}>
          <ToggleRow
            label="Show MEK progress bar"
            description="Display your Minimum Effective Knowledge score on lesson pages"
            value={settings.showMekBar}
            onChange={(v) => updateAllSettings({ showMekBar: v })}
          />
          <div className={styles.divider} />
          <ToggleRow
            label="Compact sidebar"
            description="Show only icons in the sidebar — more space for content"
            value={settings.compactSidebar}
            onChange={(v) => updateAllSettings({ compactSidebar: v })}
          />
          <div className={styles.divider} />
          <ToggleRow
            label="Terminal typing sounds"
            description="Subtle click sound when typing in the Lab"
            value={settings.terminalSound}
            onChange={(v) => updateAllSettings({ terminalSound: v })}
          />
        </div>
      </section></RevealOnScroll>

      <RevealOnScroll delay={0} y={14}><section className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        <div className={styles.card}>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Platform</span>
            <span className={styles.aboutValue}>VibeSkool</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Version</span>
            <span className={styles.aboutValue}>0.1.0 — MVP</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Stack</span>
            <span className={styles.aboutValue}>React + Vite + Node.js + Socket.IO</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Philosophy</span>
            <span className={styles.aboutValue}>Minimum Effective Knowledge</span>
          </div>
        </div>
      </section></RevealOnScroll>
    </div>
  )
}
