import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/components/icons/Icons'
import { detectLanguage, highlightLines, LANG_LABEL } from '@/lib/highlight'
import styles from './CodeBlock.module.css'

/** Copies text and reports "copied" for a moment afterwards. */
export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* ignore */ }
      ta.remove()
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), timeout)
  }, [timeout])
  return [copied, copy]
}

export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, copy] = useCopy()
  return (
    <button
      type="button"
      className={`${styles.copy} ${className}`}
      onClick={() => copy(text)}
      aria-label={copied ? 'Copied' : `${label} to clipboard`}
      data-copied={copied}
    >
      <Icon name={copied ? 'check' : 'copy'} size={15} />
      <span>{copied ? 'Copied' : label}</span>
    </button>
  )
}

export default function CodeBlock({ code, language }) {
  const lang = language || detectLanguage(code)
  const lines = useMemo(() => highlightLines(code, lang), [code, lang])
  const many = lines.length > 1

  return (
    <figure className={styles.block} data-lang={lang}>
      <figcaption className={styles.bar}>
        <span className={styles.lang}>
          <Icon name={lang === 'shell' ? 'terminal' : 'code'} size={15} />
          {LANG_LABEL[lang] || 'Code'}
        </span>
        <CopyButton text={code} />
      </figcaption>
      <pre className={styles.pre} tabIndex={0}>
        <code>
          {lines.map((toks, i) => (
            <span key={i} className={styles.line}>
              {many && <span className={styles.num} aria-hidden="true">{i + 1}</span>}
              <span className={styles.src}>
                {toks.length === 0 ? '​' : toks.map((t, j) => (
                  t.cls ? <span key={j} className={t.cls}>{t.text}</span> : <React.Fragment key={j}>{t.text}</React.Fragment>
                ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}
