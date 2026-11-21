import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { confirmDialog, notify } from '@/lib/dialog'
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
  { id: 'serif', label: 'Source Serif', note: 'A serif made for long reads, like a good book.', family: "'Source Serif 4 Variable', 'Source Serif 4', Georgia, serif" },
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

/* Students ask to teach here; an admin approves them. */
function TeachingSection({ user, onUser }) {
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const status = user?.tutorStatus || ''

  const ask = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { user: next } = await authApi.requestTutorAccess(note.trim())
      onUser(next)
      setOpen(false)
      notify({ title: 'Request sent', body: 'We’ll email you once an admin has looked at it.', tone: 'success' })
    } catch (err) {
      notify({ title: "Couldn't send your request", body: err?.message, tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    const ok = await confirmDialog({ title: 'Take back your request?', body: 'You can ask again any time.', confirmLabel: 'Take it back' })
    if (!ok) return
    try {
      const { user: next } = await authApi.cancelTutorRequest()
      onUser(next)
    } catch (err) {
      notify({ title: "Couldn't do that", body: err?.message, tone: 'error' })
    }
  }

  if (status === 'pending') {
    return (
      <Row
        title="Waiting for approval"
        description={`You asked to teach${user.tutorRequestedAt ? ` on ${new Date(user.tutorRequestedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}` : ''}. We approve every tutor by hand and will email you. Keep learning in the meantime.`}
      >
        <button type="button" className={`${ui.btnGhost} ${ui.sm}`} onClick={cancel}>Take back</button>
      </Row>
    )
  }

  return (
    <Row
      title="Teach on VibeSkool"
      description={status === 'declined'
        ? 'Your last request wasn’t approved. You can ask again, and tell us a bit more about what you’d teach.'
        : 'Run classes, write courses and help students with their code. An admin approves every tutor.'}
      stack={open}
    >
      {open ? (
        <form onSubmit={ask} className={styles.teachForm}>
          <label className={ui.field}>
            <span>What would you like to teach?</span>
            <textarea className={ui.textarea} rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. I run a coding club and want to teach JavaScript basics" autoFocus />
            <small>Optional, but it helps us say yes.</small>
          </label>
          <div className={styles.teachActions}>
            <button type="button" className={`${ui.btnGhost} ${ui.sm}`} onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
            <button type="submit" className={`${ui.btnPrimary} ${ui.sm}`} disabled={busy}>{busy ? 'Sending…' : 'Send request'}</button>
          </div>
        </form>
      ) : (
        <button type="button" className={`${ui.btnGhost} ${ui.sm}`} onClick={() => setOpen(true)}>Ask to teach</button>
      )}
    </Row>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const applyUser = useAuth((s) => s.applyUser)

  // ?section=teaching (after asking to teach at sign-up) jumps to that card,
  // once the page has settled (the layout scrolls to the top on arrival)
  const role = useAuth((s) => s.currentUser?.role)
  useEffect(() => {
    const id = params.get('section')
    if (!id) return undefined
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250)
    return () => clearTimeout(t)
  }, [params, role])
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
          <div className={styles.options} role="radiogroup" aria-label="Font">
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

      {student && (
        <section className={`${ui.card} ${styles.section}`} aria-labelledby="teaching">
          <h2 id="teaching" className={styles.sectionTitle}>Teaching</h2>
          <TeachingSection user={currentUser} onUser={applyUser} />
        </section>
      )}

      <section className={`${ui.card} ${styles.section}`} aria-labelledby="account">
        <h2 id="account" className={styles.sectionTitle}>Account</h2>
        <Row title="Email" description={currentUser?.email} />
        <Row title="Signed in with" description={currentUser?.authProvider === 'google' ? 'Google' : 'Email and password'} />
        {currentUser?.authProvider !== 'google' && (
          <Row title="Password" description="We’ll email you a link to choose a new one. Other devices are signed out when you change it.">
            <Link to="/forgot-password" className={`${ui.btnGhost} ${ui.sm}`}>Change password</Link>
          </Row>
        )}
        <Row title="Sign out" description="Signs you out on this device.">
          <button type="button" className={`${ui.btnGhost} ${ui.sm}`} onClick={() => { signOut(); navigate('/signin') }}>
            <Icon name="logout" size={15} /> Sign out
          </button>
        </Row>
      </section>
    </div>
  )
}
