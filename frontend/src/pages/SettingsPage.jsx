import React, { useEffect } from 'react'
import { useStore } from '@/lib/store'
import styles from './SettingsPage.module.css'

// ─── Theme definitions ────────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'dark',
    name: 'Lights Off',
    description: 'Pure black. Maximum contrast.',
    preview: ['#000000', '#1d9bf0', '#00ba7c'],
  },
  {
    id: 'dim',
    name: 'Dim',
    description: 'Twitter dim. Easier on the eyes.',
    preview: ['#15202b', '#1d9bf0', '#00ba7c'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep navy. Late night sessions.',
    preview: ['#000209', '#1d9bf0', '#00ba7c'],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Dark green. Calm and focused.',
    preview: ['#040d07', '#00ba7c', '#1d9bf0'],
  },
  {
    id: 'light',
    name: 'Light',
    description: 'For daylight. High contrast.',
    preview: ['#ffffff', '#1d9bf0', '#00ba7c'],
  },
]

// ─── CSS variable sets per theme ──────────────────────────────────────────────
const THEME_VARS = {
  dark:     { '--bg-base':'#000000','--bg-surface':'#0d1117','--bg-raised':'#141c25','--bg-overlay':'#1c2732','--text-primary':'#e7e9ea','--text-secondary':'#8b98a5','--text-tertiary':'#536471','--border-faint':'rgba(255,255,255,0.06)','--border-subtle':'rgba(255,255,255,0.10)','--border-default':'rgba(255,255,255,0.15)','--border-strong':'rgba(255,255,255,0.24)','--accent':'#1d9bf0','--accent-hover':'#1a8cd8','--accent-dim':'rgba(29,155,240,0.10)','--accent-border':'rgba(29,155,240,0.30)','--accent-text':'#1d9bf0','--green':'#00ba7c','--green-dim':'rgba(0,186,124,0.08)','--green-border':'rgba(0,186,124,0.25)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.25)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.25)' },
  dim:      { '--bg-base':'#15202b','--bg-surface':'#1e2732','--bg-raised':'#253341','--bg-overlay':'#2c3e50','--text-primary':'#f7f9f9','--text-secondary':'#8b98a5','--text-tertiary':'#536471','--border-faint':'rgba(255,255,255,0.06)','--border-subtle':'rgba(255,255,255,0.10)','--border-default':'rgba(255,255,255,0.16)','--border-strong':'rgba(255,255,255,0.26)','--accent':'#1d9bf0','--accent-hover':'#1a8cd8','--accent-dim':'rgba(29,155,240,0.12)','--accent-border':'rgba(29,155,240,0.35)','--accent-text':'#1d9bf0','--green':'#00ba7c','--green-dim':'rgba(0,186,124,0.08)','--green-border':'rgba(0,186,124,0.25)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.25)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.25)' },
  midnight: { '--bg-base':'#000209','--bg-surface':'#050d1a','--bg-raised':'#0a1628','--bg-overlay':'#101e34','--text-primary':'#dce8f5','--text-secondary':'#7a9ab5','--text-tertiary':'#3d5a73','--border-faint':'rgba(29,155,240,0.07)','--border-subtle':'rgba(29,155,240,0.12)','--border-default':'rgba(29,155,240,0.20)','--border-strong':'rgba(29,155,240,0.32)','--accent':'#1d9bf0','--accent-hover':'#1a8cd8','--accent-dim':'rgba(29,155,240,0.12)','--accent-border':'rgba(29,155,240,0.35)','--accent-text':'#1d9bf0','--green':'#00ba7c','--green-dim':'rgba(0,186,124,0.08)','--green-border':'rgba(0,186,124,0.25)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.25)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.25)' },
  forest:   { '--bg-base':'#040d07','--bg-surface':'#0a1610','--bg-raised':'#111f17','--bg-overlay':'#182a1f','--text-primary':'#dcf0e4','--text-secondary':'#6a9e7c','--text-tertiary':'#3a6348','--border-faint':'rgba(0,186,124,0.07)','--border-subtle':'rgba(0,186,124,0.12)','--border-default':'rgba(0,186,124,0.20)','--border-strong':'rgba(0,186,124,0.32)','--accent':'#00ba7c','--accent-hover':'#009d68','--accent-dim':'rgba(0,186,124,0.10)','--accent-border':'rgba(0,186,124,0.32)','--accent-text':'#00ba7c','--green':'#1d9bf0','--green-dim':'rgba(29,155,240,0.08)','--green-border':'rgba(29,155,240,0.25)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.25)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.25)' },
  light:    { '--bg-base':'#ffffff','--bg-surface':'#f7f9f9','--bg-raised':'#eff3f4','--bg-overlay':'#e7eaeb','--text-primary':'#0f1419','--text-secondary':'#536471','--text-tertiary':'#8b98a5','--border-faint':'rgba(0,0,0,0.05)','--border-subtle':'rgba(0,0,0,0.08)','--border-default':'rgba(0,0,0,0.13)','--border-strong':'rgba(0,0,0,0.22)','--accent':'#1d9bf0','--accent-hover':'#1a8cd8','--accent-dim':'rgba(29,155,240,0.08)','--accent-border':'rgba(29,155,240,0.25)','--accent-text':'#1d9bf0','--green':'#00ba7c','--green-dim':'rgba(0,186,124,0.08)','--green-border':'rgba(0,186,124,0.22)','--amber':'#ffad1f','--amber-dim':'rgba(255,173,31,0.08)','--amber-border':'rgba(255,173,31,0.22)','--red':'#f4212e','--red-dim':'rgba(244,33,46,0.08)','--red-border':'rgba(244,33,46,0.22)' },
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
  const { settings, updateSettings } = useStore()

  // Apply theme on change
  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  function setTheme(id) {
    updateSettings({ theme: id })
  }

  function setFontSize(id) {
    const found = FONT_SIZES.find(f => f.id === id)
    if (found) document.documentElement.style.setProperty('--font-size-base', found.size)
    updateSettings({ fontSize: id })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header + ' animate-fade-in'}>
        <h1 className={styles.title}>Settings ⚙️</h1>
        <p className={styles.sub}>Customise your VibeSkool experience.</p>
      </div>

      {/* Appearance */}
      <section className={styles.section + ' animate-fade-in'} style={{ animationDelay: '40ms' }}>
        <h2 className={styles.sectionTitle}>Appearance</h2>

        {/* Theme picker */}
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
                {/* Color preview swatch */}
                <div className={styles.themeSwatch}>
                  {theme.preview.map((color, i) => (
                    <span
                      key={i}
                      className={styles.themeSwatchDot}
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <span className={styles.themeName}>{theme.name}</span>
                <span className={styles.themeDesc}>{theme.description}</span>
                {settings.theme === theme.id && (
                  <span className={styles.themeCheck}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
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
      </section>

      {/* Learning preferences */}
      <section className={styles.section + ' animate-fade-in'} style={{ animationDelay: '80ms' }}>
        <h2 className={styles.sectionTitle}>Learning preferences</h2>
        <div className={styles.card}>
          <ToggleRow
            label="Show MEK progress bar"
            description="Display your Minimum Effective Knowledge score on lesson pages"
            value={settings.showMekBar}
            onChange={(v) => updateSettings({ showMekBar: v })}
          />
          <div className={styles.divider} />
          <ToggleRow
            label="Compact sidebar"
            description="Show only icons in the sidebar — more space for content"
            value={settings.compactSidebar}
            onChange={(v) => updateSettings({ compactSidebar: v })}
          />
          <div className={styles.divider} />
          <ToggleRow
            label="Terminal typing sounds"
            description="Subtle click sound when typing in the Lab"
            value={settings.terminalSound}
            onChange={(v) => updateSettings({ terminalSound: v })}
          />
        </div>
      </section>

      {/* About */}
      <section className={styles.section + ' animate-fade-in'} style={{ animationDelay: '120ms' }}>
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
      </section>
    </div>
  )
}
