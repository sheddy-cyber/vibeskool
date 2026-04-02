import React, { useEffect } from 'react'
import { useStore } from '@/lib/store'
import styles from './SettingsPage.module.css'

// ─── Theme definitions ────────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Default. Easy on the eyes.',
    preview: ['#0c0c0e', '#6366f1', '#34d399'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep blue-black. Late night sessions.',
    preview: ['#050d1a', '#3b82f6', '#34d399'],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Dark green. Calm and focused.',
    preview: ['#0a0f0a', '#22c55e', '#a3e635'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep teal and cyan. Clean.',
    preview: ['#060f14', '#06b6d4', '#818cf8'],
  },
  {
    id: 'light',
    name: 'Light',
    description: 'High contrast. For daylight.',
    preview: ['#fafafa', '#6366f1', '#059669'],
  },
]

// ─── CSS variable sets per theme ──────────────────────────────────────────────
const THEME_VARS = {
  dark:     { '--bg-base':'#0c0c0e','--bg-surface':'#111114','--bg-raised':'#18181c','--bg-overlay':'#1f1f24','--text-primary':'#f2f2f5','--text-secondary':'#8e8e9e','--text-tertiary':'#5a5a6a','--border-faint':'rgba(255,255,255,0.055)','--border-subtle':'rgba(255,255,255,0.085)','--border-default':'rgba(255,255,255,0.12)','--border-strong':'rgba(255,255,255,0.20)','--accent':'#6366f1','--accent-hover':'#5254cc','--accent-dim':'rgba(99,102,241,0.10)','--accent-border':'rgba(99,102,241,0.28)','--accent-text':'#a5b4fc','--green':'#34d399','--green-dim':'rgba(52,211,153,0.08)','--green-border':'rgba(52,211,153,0.22)','--amber':'#f59e0b','--amber-dim':'rgba(245,158,11,0.08)','--amber-border':'rgba(245,158,11,0.22)','--red':'#f87171','--red-dim':'rgba(248,113,113,0.08)','--red-border':'rgba(248,113,113,0.22)' },
  midnight: { '--bg-base':'#050d1a','--bg-surface':'#091424','--bg-raised':'#0f1e32','--bg-overlay':'#162840','--text-primary':'#e8f0fe','--text-secondary':'#8ba4c8','--text-tertiary':'#4a6080','--border-faint':'rgba(96,165,250,0.06)','--border-subtle':'rgba(96,165,250,0.10)','--border-default':'rgba(96,165,250,0.16)','--border-strong':'rgba(96,165,250,0.28)','--accent':'#3b82f6','--accent-hover':'#2563eb','--accent-dim':'rgba(59,130,246,0.10)','--accent-border':'rgba(59,130,246,0.28)','--accent-text':'#93c5fd','--green':'#34d399','--green-dim':'rgba(52,211,153,0.08)','--green-border':'rgba(52,211,153,0.22)','--amber':'#fbbf24','--amber-dim':'rgba(251,191,36,0.08)','--amber-border':'rgba(251,191,36,0.22)','--red':'#f87171','--red-dim':'rgba(248,113,113,0.08)','--red-border':'rgba(248,113,113,0.22)' },
  forest:   { '--bg-base':'#0a0f0a','--bg-surface':'#0f150f','--bg-raised':'#162016','--bg-overlay':'#1c281c','--text-primary':'#e8f5e8','--text-secondary':'#7faa7f','--text-tertiary':'#4a664a','--border-faint':'rgba(74,222,128,0.06)','--border-subtle':'rgba(74,222,128,0.10)','--border-default':'rgba(74,222,128,0.16)','--border-strong':'rgba(74,222,128,0.28)','--accent':'#22c55e','--accent-hover':'#16a34a','--accent-dim':'rgba(34,197,94,0.10)','--accent-border':'rgba(34,197,94,0.28)','--accent-text':'#86efac','--green':'#a3e635','--green-dim':'rgba(163,230,53,0.08)','--green-border':'rgba(163,230,53,0.22)','--amber':'#fde68a','--amber-dim':'rgba(253,230,138,0.08)','--amber-border':'rgba(253,230,138,0.22)','--red':'#fca5a5','--red-dim':'rgba(252,165,165,0.08)','--red-border':'rgba(252,165,165,0.22)' },
  ocean:    { '--bg-base':'#060f14','--bg-surface':'#0a1820','--bg-raised':'#10222e','--bg-overlay':'#162d3d','--text-primary':'#e0f7ff','--text-secondary':'#6aabcc','--text-tertiary':'#3d6878','--border-faint':'rgba(34,211,238,0.06)','--border-subtle':'rgba(34,211,238,0.10)','--border-default':'rgba(34,211,238,0.16)','--border-strong':'rgba(34,211,238,0.28)','--accent':'#06b6d4','--accent-hover':'#0891b2','--accent-dim':'rgba(6,182,212,0.10)','--accent-border':'rgba(6,182,212,0.28)','--accent-text':'#67e8f9','--green':'#818cf8','--green-dim':'rgba(129,140,248,0.08)','--green-border':'rgba(129,140,248,0.22)','--amber':'#fbbf24','--amber-dim':'rgba(251,191,36,0.08)','--amber-border':'rgba(251,191,36,0.22)','--red':'#fb7185','--red-dim':'rgba(251,113,133,0.08)','--red-border':'rgba(251,113,133,0.22)' },
  light:    { '--bg-base':'#fafafa','--bg-surface':'#ffffff','--bg-raised':'#f4f4f6','--bg-overlay':'#ebebef','--text-primary':'#111113','--text-secondary':'#52525c','--text-tertiary':'#9898a8','--border-faint':'rgba(0,0,0,0.05)','--border-subtle':'rgba(0,0,0,0.08)','--border-default':'rgba(0,0,0,0.12)','--border-strong':'rgba(0,0,0,0.22)','--accent':'#6366f1','--accent-hover':'#5254cc','--accent-dim':'rgba(99,102,241,0.07)','--accent-border':'rgba(99,102,241,0.22)','--accent-text':'#6366f1','--green':'#059669','--green-dim':'rgba(5,150,105,0.07)','--green-border':'rgba(5,150,105,0.22)','--amber':'#d97706','--amber-dim':'rgba(217,119,6,0.07)','--amber-border':'rgba(217,119,6,0.22)','--red':'#dc2626','--red-dim':'rgba(220,38,38,0.07)','--red-border':'rgba(220,38,38,0.22)' },
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
