import React from 'react'
import styles from './UI.module.css'
import clsx from 'clsx'
export { default as BrandLogo } from './BrandLogo'

// ─── Button (Sculpted Liquid-Light) ───────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', icon, onClick, disabled, className, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(styles.btn, styles['btn-' + variant], styles['btn-' + size], className)}
      {...rest}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span className={styles.btnLabel}>{children}</span>
    </button>
  )
}

// ─── Badge (Jewel Pill) ───────────────────────────────────────────────────────
export function Badge({ children, color = 'violet' }) {
  return <span className={clsx(styles.badge, styles['badge-' + color])}>{children}</span>
}

// ─── Card (Sculpted Porcelain Plate) ──────────────────────────────────────────
export function Card({ children, className, accent, onClick, ...rest }) {
  return (
    <div
      className={clsx(styles.card, accent && styles['card-accent-' + accent], onClick && styles.cardClickable, className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
}

// ─── ProgressBar (Prism Stream Meter) ─────────────────────────────────────────
export function ProgressBar({ value, progress, max = 100, color = 'violet', height = 8, label }) {
  const effectiveVal = value !== undefined ? value : (progress !== undefined ? progress : 0)
  const pct = Math.min(100, Math.max(0, (effectiveVal / max) * 100))
  const colors = {
    violet: 'linear-gradient(90deg, #38BDF8 0%, #3B82F6 50%, #6366F1 100%)',
    teal:   'linear-gradient(90deg, #34D399 0%, #10B981 100%)',
    amber:  'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)',
    red:    'linear-gradient(90deg, #F87171 0%, #EF4444 100%)',
  }
  return (
    <div className={styles.vernierMeter}>
      {label && (
        <div className={styles.vernierHeader}>
          <span className={styles.vernierLabel}>{label}</span>
          <span className={styles.vernierValue}>{Math.round(pct)}%</span>
        </div>
      )}
      <div className={styles.vernierTrack} style={{ height }}>
        <div
          className={styles.vernierFill}
          style={{ width: `${pct}%`, background: colors[color] || colors.violet }}
        />
      </div>
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
  if (!code) return null;
  const lines = code.split('\n')
  const kw = new Set(['function','return','const','let','var','if','else','for','while','async','await','import','export','default','class','new','this','from','of','in','typeof','instanceof'])

  function highlightLine(line) {
    if (/^\s*\/\//.test(line)) {
      return <span className="hl-cm">{line}</span>
    }
    const parts = line.split(/(\s+|[(),.{}[\];:+\-*\/=%<>!&|?]+)/)
    return parts.map((part, i) => {
      if (kw.has(part)) return <span key={i} className="hl-kw">{part}</span>
      if (/^".*"$|^'.*'$|^\`.*\`$/.test(part)) return <span key={i} className="hl-str">{part}</span>
      if (/^\d+$/.test(part)) return <span key={i} className="hl-num">{part}</span>
      return part
    })
  }

  return (
    <pre className={styles.codeBlock}>
      <code>
        {lines.map((line, i) => (
          <div key={i} className={styles.codeLine}>
            <span className={styles.lineNum}>{i + 1}</span>
            <span className={styles.lineContent}>{highlightLine(line)}</span>
          </div>
        ))}
      </code>
    </pre>
  )
}

// ─── Callout ──────────────────────────────────────────────────────────────────
export function Callout({ children, color = 'violet' }) {
  return (
    <div className={clsx(styles.callout, styles['callout-' + color])}>
      {children}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ title, message, action }) {
  return (
    <div className={styles.emptyState}>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}
