import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDialogs } from '@/lib/dialog'
import Icon from '@/components/icons/Icons'
import styles from './DialogHost.module.css'

/* Renders the confirmation dialog and the notification stack for the
   whole site. Mounted once in App. */

function ConfirmDialog({ dialog, onClose }) {
  const confirmRef = useRef(null)
  const cancelRef = useRef(null)
  const cardRef = useRef(null)
  const returnTo = useRef(null)

  useEffect(() => {
    returnTo.current = document.activeElement
    // Danger actions start on Cancel, so Enter never deletes by accident
    const first = dialog.tone === 'danger' ? cancelRef.current : confirmRef.current
    first?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
      if (returnTo.current && typeof returnTo.current.focus === 'function') returnTo.current.focus({ preventScroll: true })
    }
  }, [dialog])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(false); return }
    if (e.key === 'Tab') {
      // Keep focus inside the dialog
      const items = [...cardRef.current.querySelectorAll('button')]
      const i = items.indexOf(document.activeElement)
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus() }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus() }
    }
  }

  const danger = dialog.tone === 'danger'
  return (
    <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(false) }}>
      <div
        ref={cardRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        aria-describedby={dialog.body ? 'dlg-body' : undefined}
        onKeyDown={onKeyDown}
        data-tone={dialog.tone}
      >
        <span className={styles.badge} aria-hidden="true">
          <Icon name={danger ? 'trash' : dialog.icon || 'idea'} size={20} />
        </span>
        <h2 id="dlg-title" className={styles.title}>{dialog.title}</h2>
        {dialog.body && <p id="dlg-body" className={styles.body}>{dialog.body}</p>}
        <div className={styles.actions}>
          <button ref={cancelRef} type="button" className={styles.cancel} onClick={() => onClose(false)}>
            {dialog.cancelLabel}
          </button>
          <button ref={confirmRef} type="button" className={danger ? styles.danger : styles.primary} onClick={() => onClose(true)}>
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => clearTimeout(t)
  }, [toast, onDismiss])
  const icon = toast.tone === 'success' ? 'check' : toast.tone === 'error' ? 'close' : 'idea'
  return (
    <div className={styles.toast} data-tone={toast.tone} role={toast.tone === 'error' ? 'alert' : 'status'}>
      <span className={styles.toastIcon} aria-hidden="true"><Icon name={icon} size={14} /></span>
      <div className={styles.toastText}>
        <strong>{toast.title}</strong>
        {toast.body && <span>{toast.body}</span>}
      </div>
      <button type="button" className={styles.toastClose} onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
        <Icon name="close" size={14} />
      </button>
    </div>
  )
}

export default function DialogHost() {
  const confirm = useDialogs((s) => s.confirm)
  const closeConfirm = useDialogs((s) => s.closeConfirm)
  const toasts = useDialogs((s) => s.toasts)
  const dismiss = useDialogs((s) => s.dismiss)

  return createPortal(
    <>
      {confirm && <ConfirmDialog dialog={confirm} onClose={closeConfirm} />}
      <div className={styles.toasts} aria-live="polite">
        {toasts.map((t) => <Toast key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </>,
    document.body,
  )
}
