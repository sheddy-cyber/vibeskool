import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '@/components/icons/Icons'
import { initials } from '@/lib/classroom'
import styles from './Parts.module.css'

/* Building blocks shared by the classroom pages. */

export function Avatar({ user, size = 32, tutor = false }) {
  const src = user?.avatar_url
  const isImg = typeof src === 'string' && /^https?:\/\//.test(src)
  return (
    <span
      className={styles.avatar}
      data-tutor={tutor || user?.role === 'teacher' || undefined}
      style={{ '--size': `${size}px` }}
      aria-hidden="true"
    >
      {isImg ? <img src={src} alt="" referrerPolicy="no-referrer" /> : (src && src.length <= 3 ? src : initials(user?.display_name))}
    </span>
  )
}

/** A dot plus a label: status of a submission, a flag, a question. */
export function Pill({ tone = 'muted', children, title }) {
  return <span className={styles.pill} data-tone={tone} title={title}>{children}</span>
}

export function Empty({ icon = 'idea', title, children, action }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon} aria-hidden="true"><Icon name={icon} size={22} /></span>
      <p className={styles.emptyTitle}>{title}</p>
      {children && <p className={styles.emptyText}>{children}</p>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  )
}

/** A centred dialog for short forms (nudge, new assignment). */
export function Modal({ title, description, onClose, children, footer, wide = false }) {
  const cardRef = useRef(null)
  const returnTo = useRef(null)

  useEffect(() => {
    returnTo.current = document.activeElement
    const first = cardRef.current?.querySelector('input, textarea, select, button:not([data-close])')
    first?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      returnTo.current?.focus?.({ preventScroll: true })
    }
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    if (e.key === 'Tab') {
      const items = [...cardRef.current.querySelectorAll('button, input, textarea, select, a[href]')].filter((el) => !el.disabled)
      const i = items.indexOf(document.activeElement)
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1]?.focus() }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0]?.focus() }
    }
  }

  return createPortal(
    <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div
        ref={cardRef}
        className={styles.modal}
        data-wide={wide || undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={onKeyDown}
      >
        <header className={styles.modalHead}>
          <div>
            <h2 id="modal-title" className={styles.modalTitle}>{title}</h2>
            {description && <p className={styles.modalDesc}>{description}</p>}
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close" data-close>
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        {footer && <footer className={styles.modalFoot}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

const PHONE = '(max-width: 560px)'

/* A "more actions" menu. A small popover under its button on wide screens;
   on phones a sheet that slides up from the bottom, with big rows and a
   Cancel, because a popover pinned to a button near the screen edge gets
   cut off and is hard to hit with a thumb.
   items: [{ label, icon, onClick, tone: 'danger' }] */
export function ActionMenu({ items, label = 'More actions', icon = 'list', buttonClassName, className, title }) {
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState(false)
  const wrapRef = useRef(null)
  const sheetRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => {
      if (wrapRef.current?.contains(e.target) || sheetRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    let prev
    if (sheet) {
      prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      sheetRef.current?.querySelector('button')?.focus({ preventScroll: true })
    }
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
      if (sheet) document.body.style.overflow = prev
    }
  }, [open, sheet])

  if (!items.length) return null
  const pick = (it) => { setOpen(false); it.onClick() }
  const toggle = () => {
    setSheet(window.matchMedia(PHONE).matches)
    setOpen((v) => !v)
  }
  const rows = items.map((it) => (
    <button key={it.label} type="button" role="menuitem" data-tone={it.tone} onClick={() => pick(it)}>
      <Icon name={it.icon} size={17} /> {it.label}
    </button>
  ))

  return (
    <div className={className ? `${styles.menuWrap} ${className}` : styles.menuWrap} ref={wrapRef}>
      <button type="button" className={buttonClassName || styles.iconBtn} onClick={toggle} aria-label={label} title={title} aria-haspopup="menu" aria-expanded={open}>
        <Icon name={icon} size={17} />
      </button>
      {open && !sheet && <div className={styles.menu} role="menu">{rows}</div>}
      {open && sheet && createPortal(
        <div className={styles.sheetScrim} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className={styles.sheet} role="menu" aria-label={label} ref={sheetRef}>
            {rows}
            <button type="button" className={styles.sheetCancel} onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

/** Segmented control for 2–4 choices. */
export function Segmented({ value, onChange, options, label, block = false }) {
  return (
    <div className={styles.segmented} role="radiogroup" aria-label={label} data-block={block || undefined}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={styles.segment}
          data-on={value === o.value || undefined}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={16} active={value === o.value} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Skeleton({ lines = 3 }) {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => <span key={i} style={{ width: `${92 - i * 14}%` }} />)}
    </div>
  )
}
