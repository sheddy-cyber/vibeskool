import React, { useState, useRef, useEffect } from 'react'
import { evalCommand, resetSandbox } from '@/lib/terminalEval'
import styles from './LandingTerminal.module.css'

const SUGGESTED_COMMANDS = [
  { label: 'audit security', cmd: 'audit --check-auth' },
  { label: 'explain MEK', cmd: 'mek --summary' },
  { label: 'git status', cmd: 'git status' },
  { label: 'inspect pool', cmd: 'db.inspectPool()' },
  { label: 'greetUser("Builder")', cmd: 'greetUser("Builder")' },
]

export default function LandingTerminal() {
  const [lines, setLines] = useState([
    { type: 'system', text: 'VibeSkool Sandbox v2.4 initialized.' },
    { type: 'system', text: 'Type a command or pick a shortcut below.' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [lines])

  const executeCmd = (cmdToRun) => {
    const trimmed = cmdToRun.trim()
    if (!trimmed) return

    if (trimmed.toLowerCase() === 'clear') {
      setLines([])
      setInput('')
      return
    }

    setHistory(prev => [...prev, trimmed])
    setHistoryIdx(-1)

    // Custom landing page special commands
    if (trimmed.toLowerCase() === 'audit --check-auth') {
      setLines(prev => [
        ...prev,
        { type: 'input', text: `$ ${trimmed}` },
        { type: 'output', text: 'Scanning route: POST /api/auth/login' },
        { type: 'success', text: '✓ Parameterized queries: SQL injection attacks safely blocked' },
        { type: 'success', text: '✓ Password security: Passwords scrambled with bcrypt before saving' },
        { type: 'success', text: '✓ Spam protection: Rate limiter stops hacker brute-force attempts' },
        { type: 'accent', text: 'Verdict: 100/100 — Clean, secure, and ready to ship.' }
      ])
      setInput('')
      return
    }

    if (trimmed.toLowerCase() === 'mek --summary' || trimmed.toLowerCase() === 'mek') {
      setLines(prev => [
        ...prev,
        { type: 'input', text: `$ ${trimmed}` },
        { type: 'output', text: '💡 What is Minimum Effective Knowledge (MEK)?' },
        { type: 'output', text: '• The 20% of practical software fundamentals you need to code with AI.' },
        { type: 'output', text: '1. Map the system: know what the frontend, backend, and database do.' },
        { type: 'output', text: '2. Prompt like a builder: give AI precise specs instead of vague wishes.' },
        { type: 'output', text: '3. Sanity check: catch when AI hallucinates bad code or security holes.' },
        { type: 'accent', text: 'Result: You direct the AI with confidence and never get stuck.' }
      ])
      setInput('')
      return
    }

    if (trimmed.toLowerCase() === 'db.inspectpool()') {
      setLines(prev => [
        ...prev,
        { type: 'input', text: `$ ${trimmed}` },
        { type: 'output', text: '📊 Postgres Connection Pool Status:' },
        { type: 'output', text: '• Total connections: 5 (configured max: 20)' },
        { type: 'output', text: '• Idle clients: 4 | Active leases: 1' },
        { type: 'success', text: '✓ Idle timeout running. No leaked connections.' }
      ])
      setInput('')
      return
    }

    // Default to the real sandboxed evaluator
    const result = evalCommand(trimmed)
    const newEntries = [{ type: 'input', text: `$ ${trimmed}` }]

    if (result.explanation && result.explanation.length > 0) {
      newEntries.push({
        type: 'explain',
        parts: result.explanation
      })
    }

    if (result.type === 'error') {
      newEntries.push({ type: 'error', text: result.text })
    } else {
      newEntries.push({ type: 'output', text: result.text })
    }

    setLines(prev => [...prev, ...newEntries])
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCmd(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1)
      setHistoryIdx(nextIdx)
      setInput(history[nextIdx] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx === -1) return
      const nextIdx = historyIdx + 1
      if (nextIdx >= history.length) {
        setHistoryIdx(-1)
        setInput('')
      } else {
        setHistoryIdx(nextIdx)
        setInput(history[nextIdx] || '')
      }
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* ── Terminal Header ── */}
      <div className={styles.header}>
        <div className={styles.controls}>
          <span className={styles.dot} style={{ background: '#d88180' }} />
          <span className={styles.dot} style={{ background: '#cad182' }} />
          <span className={styles.dot} style={{ background: '#feeac7' }} />
          <span className={styles.title}>guest@vibeskool-sandbox:~</span>
        </div>
        <div className={styles.envBadge}>
          sandbox • v20-lts
        </div>
      </div>

      {/* ── Terminal Output Body ── */}
      <div ref={bodyRef} className={styles.body} data-lenis-prevent onClick={() => inputRef.current?.focus()}>
        {lines.map((line, idx) => {
          if (line.type === 'prompt-out') {
            return (
              <div key={idx} className={styles.linePromptOut}>
                <div className={styles.cmdRow}>
                  <span className={styles.promptSign}>$</span>
                  <span className={styles.cmdText}>{line.cmd}</span>
                </div>
                <div className={styles.outText}>{line.text}</div>
              </div>
            )
          }
          if (line.type === 'explain') {
            return (
              <div key={idx} className={styles.explainBanner}>
                <span className={styles.explainTitle}>syntax breakdown:</span>
                <div className={styles.explainParts}>
                  {line.parts.map((p, pIdx) => (
                    <span key={pIdx} className={styles.explainPart}>
                      <code>{p.token}</code> &rarr; <span>{p.meaning}</span>
                    </span>
                  ))}
                </div>
              </div>
            )
          }
          return (
            <div key={idx} className={`${styles.line} ${styles[`line_${line.type}`]}`}>
              {line.text}
            </div>
          )
        })}

        {/* ── Input Row ── */}
        <div className={styles.inputRow}>
          <span className={styles.promptSign}>$</span>
          <input
            ref={inputRef}
            type="text"
            className={styles.terminalInput}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type a command, or click a shortcut below..."
            spellCheck="false"
            autoComplete="off"
          />
        </div>
      </div>

      {/* ── Command Shortcut Bar ── */}
      <div className={styles.footer}>
        <span className={styles.shortcutLabel}>Quick Exec:</span>
        <div className={styles.shortcuts}>
          {SUGGESTED_COMMANDS.map((item, i) => (
            <button
              key={i}
              className={styles.shortcutBtn}
              onClick={() => executeCmd(item.cmd)}
            >
              <code>{item.label}</code>
            </button>
          ))}
          <button
            className={styles.shortcutBtnClear}
            onClick={() => executeCmd('clear')}
          >
            clear
          </button>
        </div>
      </div>
    </div>
  )
}
