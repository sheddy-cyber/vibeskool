import React from 'react'
import styles from './UI.module.css'
import clsx from 'clsx'

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
  // Very simple syntax highlighting
  const highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(\/\/.*)/g, '<span class="cm">$1</span>')
    .replace(/\b(function|return|const|let|var|if|else|for|while|async|await|import|export|default|class|new|this)\b/g, '<span class="kw">$1</span>')
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="str">$1</span>')
    .replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="fn">$1</span>')

  return (
    <pre className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: highlighted }} />
  )
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
