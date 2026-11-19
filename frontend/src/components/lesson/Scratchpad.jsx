import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import Icon from '@/components/icons/Icons'
import { clamp, readNumber, useDrag, writeNumber } from '@/lib/useDrag'
import styles from './Scratchpad.module.css'

/* A free editor beside the lesson. HTML renders in a preview; JavaScript
   runs in a sandboxed frame and its console output is shown below.
   Work is kept per lesson in this browser. */

const STARTERS = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Scratchpad</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; }
  </style>
</head>
<body>
  <h1>Hello</h1>
  <p>Try something from the lesson, then press Run.</p>
</body>
</html>
`,
  js: `// Try something from the lesson, then press Run.
const name = "VibeSkool"
console.log(\`Hello from \${name}\`)
`,
}

const LANGS = [
  { id: 'html', label: 'HTML' },
  { id: 'js', label: 'JavaScript' },
]

const SPLIT_KEY = 'vibeskool_scratch_split'
const SPLIT_DEFAULT = 0.55

const storeKey = (lessonId, lang) => `vibeskool_scratch_${lessonId}_${lang}`
const read = (k) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k, v) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } }

/* Console bridge injected into the sandbox. It reports console calls and
   uncaught errors back to this page, tagged with a per-run token. */
function bridge(token) {
  return `<script>(function(){var T=${JSON.stringify(token)};function f(x){if(typeof x==='string')return x;try{return JSON.stringify(x)}catch(e){return String(x)}}function s(k,a){try{parent.postMessage({__vs:T,kind:k,text:[].map.call(a,f).join(' ')},'*')}catch(e){}}['log','info','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){s(k,arguments);if(o)o.apply(console,arguments)}});window.addEventListener('error',function(e){s('error',[e.message+(e.lineno?' (line '+e.lineno+')':'')])});window.addEventListener('unhandledrejection',function(e){s('error',[String(e.reason)])});})();<\/script>`
}

function buildDoc(lang, code, token) {
  if (lang === 'js') {
    const safe = code.replace(/<\/script/gi, '<\\/script')
    return `<!DOCTYPE html><html><head>${bridge(token)}</head><body><script>${safe}\n<\/script></body></html>`
  }
  if (/<head[^>]*>/i.test(code)) return code.replace(/<head[^>]*>/i, (m) => `${m}${bridge(token)}`)
  return `${bridge(token)}${code}`
}

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

export default function Scratchpad({ lessonId, defaultLang = 'html' }) {
  const [lang, setLang] = useState(defaultLang)
  const [code, setCode] = useState(() => read(storeKey(lessonId, defaultLang)) ?? STARTERS[defaultLang])
  const [run, setRun] = useState(null) // { token, doc }
  const [logs, setLogs] = useState([])
  const [view, setView] = useState(defaultLang === 'html' ? 'preview' : 'console')
  const frameRef = useRef(null)
  const stageRef = useRef(null)
  const dark = useIsDark()

  // Editor / output split, as the editor's share of the height
  const [split, setSplit] = useState(() => {
    const v = readNumber(SPLIT_KEY, SPLIT_DEFAULT)
    return v > 0 && v < 1 ? v : SPLIT_DEFAULT
  })
  const [outMax, setOutMax] = useState(false)
  const [dragging, startDrag] = useDrag()
  useEffect(() => { if (!dragging) writeNumber(SPLIT_KEY, split) }, [dragging, split])

  const resizeSplit = (e) => {
    setOutMax(false)
    startDrag(e, (ev) => {
      const r = stageRef.current?.getBoundingClientRect()
      if (!r) return
      setSplit(clamp((ev.clientY - r.top) / r.height, 0.15, 0.85))
    }, 'row-resize')
  }
  const nudgeSplit = (e) => {
    const step = e.shiftKey ? 0.15 : 0.05
    if (e.key === 'ArrowUp') { e.preventDefault(); setOutMax(false); setSplit((v) => clamp(v - step, 0.15, 0.85)) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setOutMax(false); setSplit((v) => clamp(v + step, 0.15, 0.85)) }
    else if (e.key === 'Enter') { e.preventDefault(); setOutMax((m) => !m) }
  }
  const rows = outMax
    ? '0px 0px minmax(0, 1fr)'
    : `minmax(72px, ${split}fr) 10px minmax(96px, ${1 - split}fr)`

  // Switch language: load that language's saved work
  const switchLang = (next) => {
    if (next === lang) return
    setLang(next)
    setCode(read(storeKey(lessonId, next)) ?? STARTERS[next])
    setRun(null)
    setLogs([])
    setView(next === 'html' ? 'preview' : 'console')
  }

  // Save as you type
  useEffect(() => {
    const t = setTimeout(() => write(storeKey(lessonId, lang), code), 300)
    return () => clearTimeout(t)
  }, [code, lang, lessonId])

  const execute = useCallback(() => {
    const token = Math.random().toString(36).slice(2)
    setLogs([])
    setRun({ token, doc: buildDoc(lang, code, token) })
    if (lang === 'js') setView('console')
  }, [lang, code])

  // Collect console output from the current run only
  useEffect(() => {
    if (!run) return
    const onMsg = (e) => {
      if (e.source !== frameRef.current?.contentWindow) return
      if (!e.data || e.data.__vs !== run.token) return
      setLogs((l) => [...l.slice(-199), { kind: e.data.kind, text: e.data.text }])
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [run])

  const reset = () => {
    setCode(STARTERS[lang])
    setRun(null)
    setLogs([])
  }

  const extensions = useMemo(() => [
    lang === 'html' ? html() : javascript({ jsx: true }),
    EditorView.lineWrapping,
  ], [lang])

  const runKeys = useMemo(() => EditorView.domEventHandlers({
    keydown: (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); execute(); return true }
      return false
    },
  }), [execute])

  const errors = logs.filter((l) => l.kind === 'error').length

  return (
    <div className={styles.pad}>
      <div className={styles.toolbar}>
        <div className={styles.langs} role="tablist" aria-label="Language">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={lang === l.id}
              className={lang === l.id ? styles.langOn : undefined}
              onClick={() => switchLang(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className={styles.tools}>
          <button type="button" className={styles.iconBtn} onClick={reset} title="Start over" aria-label="Start over">
            <Icon name="reset" size={16} />
          </button>
          <button type="button" className={styles.run} onClick={execute} title="Run (Ctrl + Enter)">
            <Icon name="play" size={15} /> Run
          </button>
        </div>
      </div>

      <div className={styles.stage} ref={stageRef} style={{ gridTemplateRows: rows }} data-max={outMax}>
      {dragging && <div className={styles.shield} style={{ cursor: dragging }} aria-hidden="true" />}
      <div className={styles.editor} aria-hidden={outMax || undefined}>
        <CodeMirror
          value={code}
          height="100%"
          theme={dark ? 'dark' : 'light'}
          extensions={[...extensions, runKeys]}
          onChange={setCode}
          basicSetup={{ foldGutter: false, highlightActiveLineGutter: false }}
          aria-label="Code editor"
        />
      </div>

      <div
        className={styles.splitter}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize the output panel"
        aria-valuemin={15}
        aria-valuemax={85}
        aria-valuenow={Math.round(split * 100)}
        tabIndex={outMax ? -1 : 0}
        onPointerDown={resizeSplit}
        onKeyDown={nudgeSplit}
        onDoubleClick={() => setSplit(SPLIT_DEFAULT)}
        title="Drag to resize. Double-click to reset."
      >
        <span aria-hidden="true" />
      </div>

      <div className={styles.output}>
        <div className={styles.outBar}>
        <div className={styles.outTabs} role="tablist" aria-label="Output">
          {lang === 'html' && (
            <button type="button" role="tab" aria-selected={view === 'preview'} className={view === 'preview' ? styles.outOn : undefined} onClick={() => setView('preview')}>
              <Icon name="eye" size={15} /> Preview
            </button>
          )}
          <button type="button" role="tab" aria-selected={view === 'console'} className={view === 'console' ? styles.outOn : undefined} onClick={() => setView('console')}>
            <Icon name="terminal" size={15} /> Console
            {logs.length > 0 && <span className={`${styles.count} ${errors ? styles.countErr : ''}`}>{logs.length}</span>}
          </button>
        </div>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setOutMax((m) => !m)}
          aria-pressed={outMax}
          aria-label={outMax ? 'Show the editor again' : 'Expand the output'}
          title={outMax ? 'Show the editor' : 'Expand'}
        >
          <Icon name={outMax ? 'collapse' : 'expand'} size={16} />
        </button>
        </div>

        <div className={styles.outBody}>
          {run ? (
            <iframe
              key={run.token}
              ref={frameRef}
              title="Scratchpad output"
              sandbox="allow-scripts allow-modals"
              srcDoc={run.doc}
              className={`${styles.frame} ${view === 'preview' && lang === 'html' ? '' : styles.frameHidden}`}
            />
          ) : null}

          {(view === 'console' || lang === 'js') && (
            <div className={styles.console} role="log">
              {!run && <p className={styles.placeholder}>Press Run to see what your code prints.</p>}
              {run && logs.length === 0 && <p className={styles.placeholder}>Nothing printed yet. Use console.log() to see values here.</p>}
              {logs.map((l, i) => (
                <div key={i} className={styles.logLine} data-kind={l.kind}>{l.text}</div>
              ))}
            </div>
          )}

          {view === 'preview' && lang === 'html' && !run && (
            <p className={styles.placeholder}>Press Run to see your page.</p>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
