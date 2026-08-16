import React, { useState } from 'react'
import styles from './UI.module.css'
import clsx from 'clsx'
import { useStore } from '@/lib/store'

// ─── Button ────────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  className,
  type = 'button',
  icon,
  loading = false,
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        styles.btn,
        styles[`btn-${variant}`],
        styles[`btn-${size}`],
        className
      )}
      {...rest}
    >
      {loading ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      ) : icon ? (
        <span className={styles.btnIcon}>{icon}</span>
      ) : null}
      {children}
    </button>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'accent', dot = true, className }) {
  return (
    <span className={clsx(styles.badge, styles[`badge-${color}`], className)}>
      {dot && <span className={styles.badgeDot} />}
      {children}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, accent, onClick, ...rest }) {
  return (
    <div
      className={clsx(
        styles.card,
        accent && styles[`card-accent-${accent}`],
        onClick && styles.cardClickable,
        className
      )}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'accent', height = 4 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const colors = {
    accent: 'var(--accent)',
    violet: 'var(--neural-purple)',
    neural: 'var(--neural-purple)',
    teal:   'var(--green)',
    green:  'var(--green)',
    amber:  'var(--amber)',
    red:    'var(--red)',
    blue:   'var(--figma-blue)',
    figma:  'var(--figma-blue)',
  }
  return (
    <div className={styles.progressTrack} style={{ height }}>
      <div
        className={styles.progressFill}
        style={{ width: `${pct}%`, background: colors[color] || colors.accent }}
      />
    </div>
  )
}

// ─── StatCard (Cloudflare Telemetry) ──────────────────────────────────────────
export function StatCard({ label, value, sub, color = 'accent', icon, diff }) {
  const colors = {
    accent: 'var(--accent-text)',
    violet: 'var(--neural-purple-text)',
    neural: 'var(--neural-purple-text)',
    teal:   'var(--green-text)',
    green:  'var(--green-text)',
    amber:  'var(--amber-text)',
    red:    'var(--red-text)',
    blue:   'var(--figma-blue-text)',
    figma:  'var(--figma-blue-text)',
  }
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        {icon && <span style={{ color: colors[color] }}>{icon}</span>}
      </div>
      <span className={styles.statValue} style={{ color: colors[color] }}>{value}</span>
      {sub && (
        <span className={styles.statSub}>
          {diff && <span style={{ color: diff.startsWith('+') ? 'var(--green-text)' : 'var(--text-tertiary)' }}>{diff}</span>}
          {sub}
        </span>
      )}
    </div>
  )
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, badge }) {
  return (
    <h2 className={styles.sectionTitle}>
      {children}
      {badge && <span style={{ marginLeft: 8 }}>{badge}</span>}
    </h2>
  )
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────
export function CodeBlock({ code, filename = 'snippet.js', onRun }) {
  const [copied, setCopied] = useState(false)
  const lines = code.split('\n')

  function handleCopy() {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className={styles.codeBlockWrap}>
      <div className={styles.codeHeader}>
        <span>{filename}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {onRun && (
            <button className={styles.copyCodeBtn} onClick={() => onRun(code)}>
              ▶ Run in VM
            </button>
          )}
          <button className={styles.copyCodeBtn} onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className={styles.codeBlock}>
        {lines.map((line, i) => (
          <div key={i} className={styles.codeLine}>
            <span className={styles.lineNo}>{i + 1}</span>
            <span>{line}</span>
          </div>
        ))}
      </pre>
    </div>
  )
}

// ─── Callout ──────────────────────────────────────────────────────────────────
export function Callout({ children, color = 'accent', icon }) {
  const defaultIcons = {
    accent: '💡',
    violet: '🧠',
    green:  '✓',
    amber:  '⚠️',
    red:    '🛡️',
    blue:   '📐',
  }
  return (
    <div className={clsx(styles.callout, styles[`callout-${color}`])}>
      <span className={styles.calloutIcon}>{icon || defaultIcons[color] || 'ℹ️'}</span>
      <div className={styles.calloutContent}>{children}</div>
    </div>
  )
}

// ─── AiPromptBox ──────────────────────────────────────────────────────────────
export function AiPromptBox({ prompt, title = 'Claude / AI Architect Prompt' }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.aiBox}>
      <div className={styles.aiBoxHeader}>
        <div className={styles.aiBoxBadge}>
          <span>🤖</span>
          <span>{title}</span>
        </div>
        <button className={styles.copyPromptBtn} onClick={copy}>
          {copied ? '✓ Prompt Copied' : 'Copy Prompt →'}
        </button>
      </div>
      <pre className={styles.aiBoxText}>{prompt}</pre>
    </div>
  )
}

// ─── MEKBar ───────────────────────────────────────────────────────────────────
export function MEKBar({ score = 0, label = 'Minimum Effective Knowledge' }) {
  const getTier = (s) => {
    if (s < 25) return 'Prompt Apprentice'
    if (s < 50) return 'System Directing'
    if (s < 75) return 'Architect Auditor'
    return 'Principal Vibe Engineer'
  }

  return (
    <div className={styles.mekBar}>
      <div className={styles.mekHeader}>
        <div className={styles.mekTitleGroup}>
          <span className={styles.mekLabel}>MEK Readiness</span>
          <span className={styles.mekTierBadge}>{getTier(score)}</span>
        </div>
        <span className={styles.mekValue}>{score}%</span>
      </div>
      <div className={styles.mekTrack}>
        <div className={styles.mekFill} style={{ width: `${score}%` }} />
      </div>
      <div className={styles.mekFooter}>
        <span>{label}</span>
      </div>
    </div>
  )
}

// ─── Kbd ──────────────────────────────────────────────────────────────────────
export function Kbd({ children }) {
  return <kbd className="kbd">{children}</kbd>
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }) {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {body && <p className={styles.emptyBody}>{body}</p>}
      {action}
    </div>
  )
}

// ─── GoalWidget ───────────────────────────────────────────────────────────────
export function GoalWidget() {
  const { settings, updateSettings, user } = useStore()
  const goal = settings.dailyGoal || 2
  const completedToday = Math.min(goal, (user.lessonsCompleted || 0) % (goal + 1))
  const streak = 5 // simulated continuous streak

  return (
    <div className={styles.goalWidget}>
      <div className={styles.goalHeader}>
        <div className={styles.goalTitleRow}>
          <span className={styles.goalIcon}>⚡</span>
          <div>
            <h4 className={styles.goalTitle}>{streak} Day Engineering Streak</h4>
            <p className={styles.goalSub}>Keep up daily deliberate practice</p>
          </div>
        </div>
        <div className={styles.goalTargetSelector}>
          {[1, 2, 3, 5].map(t => (
            <button
              key={t}
              className={clsx(styles.targetBtn, goal === t && styles.targetBtnActive)}
              onClick={() => updateSettings({ dailyGoal: t })}
              title={`Set daily target to ${t} lessons`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.goalBody}>
        <div className={styles.goalProgressInfo}>
          <span>Daily Target: {completedToday} of {goal} Lessons</span>
          <span className="tabular">{Math.round((completedToday / goal) * 100)}%</span>
        </div>
        <div className={styles.goalTrack}>
          <div className={styles.goalFill} style={{ width: `${(completedToday / goal) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
