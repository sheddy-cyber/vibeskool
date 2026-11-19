import React, { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import Icon from '@/components/icons/Icons'
import styles from './ThemeToggle.module.css'

/* Light / dark switch for the public pages (landing, auth, legal).
   Inside the app the same choice lives in the sidebar's user menu. */

const resolved = () =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark'

export default function ThemeToggle({ className = '' }) {
  const updateSettings = useStore((s) => s.updateSettings)
  const [mode, setMode] = useState(resolved)

  // Follow changes made elsewhere (system theme, another control)
  useEffect(() => {
    const obs = new MutationObserver(() => setMode(resolved()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const next = mode === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className={`${styles.toggle} ${className}`}
      onClick={() => updateSettings({ theme: next })}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span className={styles.icon} data-show={mode === 'dark'}><Icon name="moon" size={18} /></span>
      <span className={styles.icon} data-show={mode === 'light'}><Icon name="sun" size={18} /></span>
    </button>
  )
}
