import React, { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import styles from './SettingsPage.module.css'
import { FadeUp, RevealOnScroll } from '@/components/ui/Motion'

const FONT_SIZES = [
  { id: 'sm', label: 'Small',  size: '13.5px' },
  { id: 'md', label: 'Medium', size: '14.5px' },
  { id: 'lg', label: 'Large',  size: '16.5px' },
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

        <div className={styles.settingRow}>
          <span className={styles.settingRowLabel}>Font size</span>
          <span className={styles.settingRowSub}>Affects lesson content and the Lab</span>
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

        <ToggleRow
          label="Dark mode"
          description="Use the dark architectural theme"
          value={settings.theme === 'dark'}
          onChange={(v) => updateAllSettings({ theme: v ? 'dark' : 'light' })}
        />
      </section></RevealOnScroll>

      <RevealOnScroll delay={0} y={14}><section className={styles.section}>
        <h2 className={styles.sectionTitle}>Learning preferences</h2>
        <ToggleRow
          label="Show MEK progress bar"
          description="Display your Minimum Effective Knowledge score on lesson pages"
          value={settings.showMekBar}
          onChange={(v) => updateAllSettings({ showMekBar: v })}
        />
        <ToggleRow
          label="Compact sidebar"
          description="Show only icons in the sidebar — more space for content"
          value={settings.compactSidebar}
          onChange={(v) => updateAllSettings({ compactSidebar: v })}
        />
        <ToggleRow
          label="Terminal typing sounds"
          description="Subtle click sound when typing in the Lab"
          value={settings.terminalSound}
          onChange={(v) => updateAllSettings({ terminalSound: v })}
        />
      </section></RevealOnScroll>

      <RevealOnScroll delay={0} y={14}><section className={styles.section}>
        <h2 className={styles.sectionTitle}>Developer API Keys</h2>
        <div className={styles.inputRow}>
          <div className={styles.inputMeta}>
            <span className={styles.inputLabel}>Anthropic API Key</span>
            <p className={styles.inputDesc}>
              Powers the AI Tutor with Claude. Stored securely in your browser's local state.
            </p>
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="password"
              className={styles.apiKeyInput}
              value={settings.anthropicKey || ''}
              onChange={(e) => updateAllSettings({ anthropicKey: e.target.value })}
              placeholder="sk-ant-api03-..."
            />
          </div>
        </div>
      </section></RevealOnScroll>

      <RevealOnScroll delay={0} y={14}><section className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>Platform</span>
          <span className={styles.aboutValue}>VibeSkool</span>
        </div>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>Version</span>
          <span className={styles.aboutValue}>0.1.0 — MVP</span>
        </div>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>Stack</span>
          <span className={styles.aboutValue}>React + Vite + Node.js + Socket.IO</span>
        </div>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>Philosophy</span>
          <span className={styles.aboutValue}>Minimum Effective Knowledge</span>
        </div>
      </section></RevealOnScroll>
    </div>
  )
}
