import React, { useEffect, useMemo, useState } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import Icon from '@/components/icons/Icons'
import { basename, display } from '@/lib/shell/vfs'
import { fileKind } from './Explorer'
import styles from './Playground.module.css'

function useIsDark() {
  const get = () => document.documentElement.getAttribute('data-theme') === 'dark'
  const [dark, setDark] = useState(get)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(get()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

const LANG = {
  html: () => [html()],
  css: () => [css()],
  js: () => [javascript({ jsx: true })],
  json: () => [javascript()],
}

export default function EditorPane({ shell, version, tabs, active, onActivate, onClose, onOpenTerminal }) {
  const dark = useIsDark()
  const content = active ? shell.read(active) : null
  const kind = active ? fileKind(basename(active)) : 'txt'
  const extensions = useMemo(() => [...(LANG[kind]?.() || []), EditorView.lineWrapping], [kind])
  // re-read when the file system changes (terminal edits, renames)
  void version

  return (
    <div className={styles.editor}>
      <div className={styles.tabs} role="tablist" aria-label="Open files">
        {tabs.map((t) => {
          const name = basename(t)
          return (
            <div key={t} className={styles.tab} data-active={t === active} role="presentation">
              <button type="button" role="tab" aria-selected={t === active} onClick={() => onActivate(t)} title={display(t)}>
                <Icon name="file" size={14} className={styles.fileIcon} data-kind={fileKind(name)} />
                {name}
              </button>
              <button type="button" className={styles.tabClose} onClick={() => onClose(t)} aria-label={`Close ${name}`}>
                <Icon name="close" size={12} />
              </button>
            </div>
          )
        })}
      </div>

      {active && content != null ? (
        <>
          <div className={styles.crumbs}>
            {display(active).split('/').map((seg, i, arr) => (
              <React.Fragment key={i}>
                <span data-last={i === arr.length - 1}>{seg}</span>
                {i < arr.length - 1 && <Icon name="chevronRight" size={11} />}
              </React.Fragment>
            ))}
            <span className={styles.saved}><Icon name="check" size={12} /> Saved</span>
          </div>
          <div className={styles.cm}>
            <CodeMirror
              key={active}
              value={content}
              height="100%"
              theme={dark ? 'dark' : 'light'}
              extensions={extensions}
              onChange={(v) => shell.write(active, v)}
              basicSetup={{ foldGutter: false, highlightActiveLineGutter: false }}
              aria-label={`Editing ${basename(active)}`}
            />
          </div>
        </>
      ) : (
        <div className={styles.editorEmpty}>
          <Icon name="code" size={26} />
          <h3>Nothing open</h3>
          <p>Pick a file in Files, or open one from the terminal with <code>code index.html</code>.</p>
          <button type="button" className={styles.linkBtn} onClick={onOpenTerminal}>Go to the terminal <Icon name="arrowRight" size={14} /></button>
        </div>
      )}
    </div>
  )
}
