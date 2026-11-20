import React, { useEffect, useMemo, useState } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import styles from './MiniEditor.module.css'

/* A small CodeMirror editor for code inside forms: exercises, and tutors
   editing the code in a student's question. */

// Accepts editor names (javascript) and highlighter names (js, json)
const EXT = {
  javascript: () => [javascript({ jsx: true })],
  js: () => [javascript({ jsx: true })],
  json: () => [javascript()],
  python: () => [python()],
  html: () => [html()],
  css: () => [css()],
}

export function useIsDark() {
  const get = () => document.documentElement.getAttribute('data-theme') === 'dark'
  const [dark, setDark] = useState(get)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(get()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

export default function MiniEditor({ value, onChange, language, label, height = '160px', maxHeight = '360px', autoFocus }) {
  const dark = useIsDark()
  const extensions = useMemo(() => [...(EXT[language]?.() || []), EditorView.lineWrapping], [language])
  return (
    <div className={styles.shell} aria-label={label}>
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={dark ? 'dark' : 'light'}
        extensions={extensions}
        minHeight={height}
        maxHeight={maxHeight}
        autoFocus={autoFocus}
        basicSetup={{ foldGutter: false }}
      />
    </div>
  )
}
