import React from 'react'
import styles from './UI.module.css'
import clsx from 'clsx'
export { default as BrandLogo } from './BrandLogo'

// ─── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, className, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(styles.btn, styles[`btn-${variant}`], styles[`btn-${size}`], className)}
      {...rest}
    >
      {children}
    </button>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'violet' }) {
  return <span className={clsx(styles.badge, styles[`badge-${color}`])}>{children}</span>
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, accent, onClick, ...rest }) {
  return (
    <div
      className={clsx(styles.card, accent && styles[`card-accent-${accent}`], onClick && styles.cardClickable, className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'violet', height = 4 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const colors = {
    violet: 'var(--accent)',
    teal:   'var(--green)',
    amber:  'var(--amber)',
    red:    'var(--red)',
  }
  return (
    <div className={styles.progressTrack} style={{ height }}>
      <div
        className={styles.progressFill}
        style={{ width: `${pct}%`, background: colors[color] || colors.violet }}
      />
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = 'violet' }) {
  const colors = {
    violet: 'var(--accent)',
    teal:   'var(--green)',
    amber:  'var(--amber)',
    red:    'var(--red)',
  }
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue} style={{ color: colors[color] }}>{value}</span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  )
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return <h2 className={styles.sectionTitle}>{children}</h2>
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────
export function CodeBlock({ code }) {
  const lines = code.split('\n')
  const kw = new Set(['function','return','const','let','var','if','else','for','while','async','await','import','export','default','class','new','this','from','of','in','typeof','instanceof'])

  function highlightLine(line) {
    if (/^\s*\/\//.test(line)) {
      return <span className="hl-cm">{line}</span>
    }
    const parts = line.split(/(\/\/.*)/)
    if (parts.length === 1) return <>{tokenize(line, kw)}</>
    return <>{tokenize(parts[0], kw)}<span className="hl-cm">{parts[1]}</span></>
  }

  return (
    <pre className={styles.codeBlock}>
      {lines.map((line, i) => <div key={i}>{highlightLine(line)}</div>)}
    </pre>
  )
}

function tokenize(text, kw) {
  const tokens = text.split(/(\b(?:[A-Z][a-zA-Z0-9_]*)(?=\s*\()|\b(const|let|var|function|return|if|else|for|while|async|await|import|export|default|class|new|this|from|of|in|typeof|instanceof)\b|("[^"]*"|'[^']*'|`[^`]*`))/)
  return tokens.filter(Boolean).map((t, i) => {
    if (kw.has(t)) return <span key={i} className="hl-kw">{t}</span>
    if (/^[A-Z][a-zA-Z0-9_]*$/.test(t)) return <span key={i} className="hl-fn">{t}</span>
    if (/^["'`]/.test(t)) return <span key={i} className="hl-str">{t}</span>
    return t
  })
}

// ─── Callout ──────────────────────────────────────────────────────────────────
export function Callout({ children, color = 'violet' }) {
  return <div className={clsx(styles.callout, styles[`callout-${color}`])}>{children}</div>
}

// ─── AiPromptBox ──────────────────────────────────────────────────────────────
export function AiPromptBox({ prompt }) {
  const [copied, setCopied] = React.useState(false)

  function copy() {
    navigator.clipboard?.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.aiBox}>
      <div className={styles.aiBoxHeader}>
        <span className={styles.aiBoxLabel}>Take this prompt to Claude →</span>
        <button className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <p className={styles.aiBoxText}>{prompt}</p>
    </div>
  )
}

// ─── MEKBar ───────────────────────────────────────────────────────────────────
export function MEKBar({ score, label }) {
  return (
    <div className={styles.mekBar}>
      <span className={styles.mekLabel}>MEK Progress</span>
      <div className={styles.mekTrack}>
        <div className={styles.mekFill} style={{ width: `${score}%` }} />
      </div>
      <span className={styles.mekValue}>{score}% — {label}</span>
    </div>
  )
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
import { useStore } from '@/lib/store'

export function GoalWidget() {
  const { settings, updateSettings, user } = useStore()
  const goal = settings.dailyGoal || 2
  // Simulate completed today based on completed count.
  const completedToday = Math.min(goal, user.lessonsCompleted % (goal + 1))
  const streak = 3 // simulated streak

  return (
    <div className={styles.goalWidget}>
      <div className={styles.goalHeader}>
        <div className={styles.goalTitleRow}>
          <span className={styles.goalIcon}>🔥</span>
          <div>
            <h4 className={styles.goalTitle}>{streak} Day Streak!</h4>
            <p className={styles.goalSub}>Keep the momentum going</p>
          </div>
        </div>
        <div className={styles.goalTargetSelector}>
          {[1, 2, 3].map(t => (
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
          <span className={styles.goalProgressLabel}>Daily Target: {completedToday} / {goal} Lessons</span>
          <span className={styles.goalProgressPct}>{Math.round((completedToday / goal) * 100)}%</span>
        </div>
        <div className={styles.goalTrack}>
          <div className={styles.goalFill} style={{ width: `${(completedToday / goal) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
