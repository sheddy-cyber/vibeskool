import React from 'react'
import styles from './UI.module.css'
import clsx from 'clsx'
export { default as BrandLogo, BrandMark } from './BrandLogo'
export { default as ThemeToggle } from './ThemeToggle'

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
