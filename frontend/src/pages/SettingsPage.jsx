import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { useAuth } from '@/lib/auth'
import { useStore } from '@/lib/store'
import { applyFont, getStoredFont, getStoredTheme } from '@/lib/theme'
import ui from './classroom/Classroom.module.css'
import styles from './SettingsPage.module.css'

const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'Match my device' },
]

const FONTS = [
  { id: 'exo', label: 'Exo 2', note: 'The VibeSkool look. Rounded and friendly.', family: "'Exo 2 Variable', 'Exo 2', sans-serif" },
  { id: 'geist', label: 'Geist', note: 'Neutral and crisp, close to a code editor.', family: "'Geist Variable', 'Geist', sans-serif" },
]

function ThemePreview({ id }) {
  return (
    <span className={styles.themePreview} data-theme-preview={id} aria-hidden="true">
      <span className={styles.tpSide} />
      <span className={styles.tpMain}>
        <span className={styles.tpLine} style={{ width: '62%' }} />
        <span className={styles.tpLine} style={{ width: '84%' }} />
        <span className={styles.tpCard} />
      </span>
    </span>
  )
}

function Row({ title, description, children, stack = false }) {
  return (
    <div className={styles.row} data-stack={stack || undefined}>
      <div className={styles.rowText}>
        <h3 className={styles.rowTitle}>{title}</h3>
        {description && <p className={styles.rowDesc}>{description}</p>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  )
}

function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={styles.switch} onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { settings: local, updateSettings } = useStore()
  const { currentUser, updateUserSettings, signOut } = useAuth()
  const settings = { ...local, ...(currentUser?.settings || {}) }
  const [font, setFont] = useState(getStoredFont())

  const save = (patch) => {
    updateSettings(patch)
    updateUserSettings(patch)
  }

  const theme = settings.theme || getStoredTheme()
  const goal = Math.min(6, Math.max(1, Number(settings.dailyGoal) || 2))
  const showStats = settings.showStats !== false
  const student = currentUser?.role === 'student'

  const chooseFont = (id) => {
    setFont(applyFont(id))
    save({ font: id })
  }

  return (
    <div className={ui.page} style={{ maxWidth: 860 }}>
      <header className={ui.head}>
        <div className={ui.headText}>
          <h1 className={ui.title}>Settings</h1>
          <p className={ui.lead}>How VibeSkool looks and behaves for you. Changes save straight away and follow you to other devices.</p>
        </div>
      </header>

      <section className={`${ui.card} ${styles.section}`} aria-labelledby="appearance">
        <h2 id="appearance" className={styles.sectionTitle}>Appearance</h2>

        <Row title="Theme" description="Dark is the default. “Match my device” follows your system setting." stack>
          <div className={styles.options} role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} className={styles.option} onClick={() => save({ theme: t.id })}>
                <ThemePreview id={t.id} />
                <span className={styles.optionLabel}>
                  {theme === t.id && <Icon name="check" size={15} />}
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </Row>

        <Row title="Font" description="Used for everything except code, which always uses Geist Mono." stack>
          <div className={styles.options} data-cols="2" role="radiogroup" aria-label="Font">
            {FONTS.map((f) => (
              <button key={f.id} type="button" role="radio" aria-checked={font === f.id} className={styles.option} onClick={() => chooseFont(f.id)}>
                <span className={styles.fontSample} style={{ fontFamily: f.family }}>
                  <span className={styles.fontAa}>Aa</span>
                  <span className={styles.fontLine}>Build it, ship it, share it.</span>
                </span>
                <span className={styles.optionLabel}>
                  {font === f.id && <Icon name="check" size={15} />}
                  {f.label}
                  {f.id === 'exo' && <span className={styles.default}>Default</span>}
                </span>
                <span className={styles.optionNote}>{f.note}</span>
              </button>
            ))}
          </div>
        </Row>
      </section>

      {student && (
        <section className={`${ui.card} ${styles.section}`} aria-labelledby="learning">
          <h2 id="learning" className={styles.sectionTitle}>Learning</h2>
          <Row title="Daily goal" description="How many lessons you aim to finish each day. Your home page tracks it.">
            <div className={styles.stepper}>
              <button type="button" onClick={() => save({ dailyGoal: goal - 1 })} disabled={goal <= 1} aria-label="Fewer lessons">−</button>
              <output aria-live="polite">{goal} lesson{goal === 1 ? '' : 's'}</output>
              <button type="button" onClick={() => save({ dailyGoal: goal + 1 })} disabled={goal >= 6} aria-label="More lessons">+</button>
            </div>
          </Row>
        </section>
      )}

      <section className={`${ui.card} ${styles.section}`} aria-labelledby="privacy">
        <h2 id="privacy" className={styles.sectionTitle}>Privacy</h2>
        {student && (
          <Row title="Show my learning stats on my profile" description="Lessons finished, skill checks, streak and XP. Turn off to keep them to yourself; you'll still see them.">
            <Switch checked={showStats} onChange={(v) => save({ showStats: v })} label="Show my learning stats on my profile" />
          </Row>
        )}
        <Row title="Your profile" description="Your name, photo, headline and projects are visible to people signed in to VibeSkool. Your email never is.">
          <Link to="/app/profile" className={`${ui.btnGhost} ${ui.sm}`}>View profile</Link>
        </Row>
      </section>

      <section className={`${ui.card} ${styles.section}`} aria-labelledby="account">
        <h2 id="account" className={styles.sectionTitle}>Account</h2>
        <Row title="Email" description={currentUser?.email} />
        <Row title="Signed in with" description={currentUser?.authProvider === 'google' ? 'Google' : 'Email and password'} />
        <Row title="Sign out" description="Signs you out on this device.">
          <button type="button" className={`${ui.btnGhost} ${ui.sm}`} onClick={() => { signOut(); navigate('/signin') }}>
            <Icon name="logout" size={15} /> Sign out
          </button>
        </Row>
      </section>
    </div>
  )
}
