import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Icon from '@/components/icons/Icons'
import styles from './Terminal.module.css'

/* A terminal over the playground Shell. Looks and behaves like a real one
   (prompt, history, Tab, Ctrl+C, Ctrl+L), and adds two learning aids:
   a plain-English note under errors, and an optional "Explain" breakdown
   of each command. */

let uid = 0
const nextId = () => (uid += 1)

const EXPLAIN_KEY = 'vibeskool_term_explain'
const readExplain = () => { try { return localStorage.getItem(EXPLAIN_KEY) !== '0' } catch { return true } }

const DEFAULT_SUGGESTIONS = ['ls', 'pwd', 'help', 'git status']

function Prompt({ info }) {
  return (
    <span className={styles.prompt} aria-hidden="true">
      <span className={styles.pPath}>{info.path}</span>
      {info.branch && (
        <span className={styles.pBranch} data-dirty={info.branch.dirty}>
          ({info.branch.name}{info.branch.dirty ? '*' : ''})
        </span>
      )}
      <span className={styles.pSign}>$</span>
    </span>
  )
}

function Line({ line }) {
  if (line.type === 'cmd') {
    return (
      <div className={styles.cmdLine}>
        <Prompt info={line.prompt} />
        <span className={styles.cmdText}>{line.text}</span>
        {line.cancelled && <span className={styles.muted}>^C</span>}
      </div>
    )
  }
  if (line.type === 'note') {
    return (
      <div className={styles.note}>
        <Icon name="idea" size={15} />
        <p><span className={styles.noteLabel}>What this means</span>{line.text}</p>
      </div>
    )
  }
  if (line.type === 'explain') {
    return (
      <div className={styles.explain}>
        {line.parts.map((p, i) => (
          <span key={i} className={styles.part}>
            <code>{p.token}</code>
            <span>{p.meaning}</span>
          </span>
        ))}
      </div>
    )
  }
  if (line.type === 'options') {
    return (
      <div className={styles.out}>
        {line.items.map((o, i) => <span key={i} className={o.endsWith('/') ? styles.k_dir : undefined}>{o}{i < line.items.length - 1 ? '   ' : ''}</span>)}
      </div>
    )
  }
  return (
    <div className={`${styles.out} ${line.kind ? styles[`k_${line.kind}`] || '' : ''}`}>
      {line.segs
        ? line.segs.map((s, i) => <span key={i} className={s.kind ? styles[`k_${s.kind}`] : undefined}>{s.text}</span>)
        : line.text || ' '}
    </div>
  )
}

const Terminal = forwardRef(function Terminal({
  shell,
  title = 'Terminal',
  welcome,
  suggestions = DEFAULT_SUGGESTIONS,
  onOpenFile,
  onOpenPreview,
  onRan,
  actions,
  autoFocus = false,
  className = '',
}, ref) {
  const [lines, setLines] = useState(() => (welcome || []).map((w) => ({ id: nextId(), type: w.type || 'out', kind: w.kind || 'muted', text: w.text })))
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [explain, setExplain] = useState(readExplain)
  const [prompt, setPrompt] = useState(() => shell.promptInfo())
  const [ranAny, setRanAny] = useState(false)
  const histIdx = useRef(-1)
  const draft = useRef('')
  const abortRef = useRef(null)
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const stick = useRef(true)
  const queue = useRef([])

  // Keep the prompt (path, branch, dirty state) in step with the shell
  useEffect(() => shell.subscribe(() => setPrompt(shell.promptInfo())), [shell])
  useEffect(() => { setPrompt(shell.promptInfo()) }, [shell])

  useEffect(() => {
    try { localStorage.setItem(EXPLAIN_KEY, explain ? '1' : '0') } catch { /* ignore */ }
  }, [explain])

  // Stay pinned to the bottom unless the reader scrolled up
  useEffect(() => {
    const el = scrollRef.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [lines, running])
  const onScroll = () => {
    const el = scrollRef.current
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }

  const add = useCallback((items) => setLines((ls) => [...ls, ...items].slice(-1500)), [])

  const run = useCallback(async (raw) => {
    const text = raw.trim()
    const promptNow = shell.promptInfo()
    add([{ id: nextId(), type: 'cmd', prompt: promptNow, text: raw }])
    histIdx.current = -1
    draft.current = ''
    if (!text) return
    setRanAny(true)
    if (explain) {
      const parts = shell.explain(text)
      if (parts.length) add([{ id: nextId(), type: 'explain', parts }])
    }
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    let cleared = false
    const io = {
      signal: controller.signal,
      print: (t, kind) => {
        if (Array.isArray(t)) { add([{ id: nextId(), type: 'out', segs: t }]); return }
        add(String(t).split('\n').map((s) => ({ id: nextId(), type: 'out', kind, text: s })))
      },
      note: (t) => add([{ id: nextId(), type: 'note', text: t }]),
      clear: () => { cleared = true; setLines([]) },
      openFile: onOpenFile,
      openPreview: onOpenPreview,
    }
    let code = 0
    try {
      code = await shell.run(text, io)
    } catch (err) {
      io.print(`bash: ${err?.message || err}`, 'err')
      code = 1
    }
    if (controller.signal.aborted && !cleared) code = 130
    abortRef.current = null
    setRunning(false)
    setPrompt(shell.promptInfo())
    onRan?.(text, code)
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
  }, [shell, explain, add, onOpenFile, onOpenPreview, onRan])

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    type: (text) => { setInput(text); requestAnimationFrame(() => { inputRef.current?.focus(); const el = inputRef.current; if (el) el.setSelectionRange(text.length, text.length) }) },
    run: (text) => { if (!abortRef.current) run(text) },
    clear: () => setLines([]),
  }), [run])

  useEffect(() => { if (autoFocus) inputRef.current?.focus({ preventScroll: true }) }, [autoFocus])

  const onKeyDown = (e) => {
    const hist = shell.ctx.history
    if (e.key === 'Enter') {
      e.preventDefault()
      const v = input
      setInput('')
      // Typed ahead while something runs: run it next, like a real terminal
      if (abortRef.current) queue.current.push(v)
      else run(v)
      return
    }
    if (e.key === 'ArrowUp') {
      if (!hist.length) return
      e.preventDefault()
      if (histIdx.current === -1) draft.current = input
      histIdx.current = Math.min(hist.length - 1, histIdx.current + 1)
      setInput(hist[hist.length - 1 - histIdx.current])
      return
    }
    if (e.key === 'ArrowDown') {
      if (histIdx.current === -1) return
      e.preventDefault()
      histIdx.current -= 1
      setInput(histIdx.current === -1 ? draft.current : hist[hist.length - 1 - histIdx.current])
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const { value, options } = shell.complete(input)
      if (value !== input) setInput(value)
      else if (options.length > 1) {
        add([{ id: nextId(), type: 'cmd', prompt: shell.promptInfo(), text: input }, { id: nextId(), type: 'options', items: options }])
      }
      return
    }
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      const sel = window.getSelection()?.toString()
      if (sel) return // let copy work
      if (abortRef.current) return // a running command: the window handler stops it
      e.preventDefault()
      add([{ id: nextId(), type: 'cmd', prompt: shell.promptInfo(), text: input, cancelled: true }])
      setInput('')
      histIdx.current = -1
      return
    }
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault()
      setLines([])
    }
  }

  // Run anything typed ahead once the current command finishes
  useEffect(() => {
    if (running || !queue.current.length) return
    run(queue.current.shift())
  }, [running, run])

  // Ctrl+C while a command runs
  useEffect(() => {
    if (!running) return
    const onKey = (e) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && !window.getSelection()?.toString()) {
        e.preventDefault()
        abortRef.current?.abort()
        queue.current = []
        add([{ id: nextId(), type: 'out', kind: 'muted', text: '^C' }])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, add])

  const focusInput = (e) => {
    if (window.getSelection()?.toString()) return
    if (e.target.closest('button, a')) return
    inputRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className={`${styles.term} ${className}`}>
      <div className={styles.bar}>
        <span className={styles.barTitle}>
          <Icon name="terminal" size={16} />
          {title}
          <span className={styles.barPath}>{prompt.path}</span>
        </span>
        <div className={styles.barActions}>
          <button
            type="button"
            className={styles.toggle}
            aria-pressed={explain}
            onClick={() => setExplain((v) => !v)}
            title="Explain each command in plain English"
          >
            <span className={styles.switch} aria-hidden="true"><span /></span>
            Explain
          </button>
          <button type="button" className={styles.iconBtn} onClick={() => setLines([])} aria-label="Clear the terminal" title="Clear (Ctrl+L)">
            <Icon name="reset" size={15} />
          </button>
          {actions}
        </div>
      </div>

      <div className={styles.screen} ref={scrollRef} onScroll={onScroll} onMouseUp={focusInput} role="log" aria-live="polite">
        {lines.map((l) => <Line key={l.id} line={l} />)}

        {running && (
          <div className={styles.running}>
            <span className={styles.spinner} aria-hidden="true" />
            <span>Running. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop.</span>
          </div>
        )}
        {(
          <label className={styles.inputLine} data-waiting={running}>
            <Prompt info={prompt} />
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              aria-label={`Command input. Current folder ${prompt.path}`}
            />
          </label>
        )}

        {!ranAny && !running && suggestions?.length > 0 && (
          <div className={styles.suggest}>
            <span>Try</span>
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => run(s)}><code>{s}</code></button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default Terminal
