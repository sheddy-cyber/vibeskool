import React, { useState, useRef, useEffect, useCallback } from 'react'
import { evalCommand, resetSandbox } from '@/lib/terminalEval'
import styles from './FriendlyTerminal.module.css'

function useVerticalResize({ minHeight = 260, maxHeight = 800, defaultHeight = 440 }) {
  const [height, setHeight] = useState(defaultHeight)
  const dragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    startY.current = e.clientY
    startH.current = height
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'
  }, [height])

  useEffect(() => {
    function onMove(e) {
      if (!dragging.current) return
      const delta = e.clientY - startY.current
      setHeight(Math.min(maxHeight, Math.max(minHeight, startH.current + delta)))
    }
    function onUp() {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [minHeight, maxHeight])

  return { height, onMouseDown }
}

const COMMAND_CHIPS = [
  { label: 'greetUser()', cmd: 'greetUser("Architect")' },
  { label: 'node workspace.js', cmd: 'node workspace.js' },
  { label: 'git status', cmd: 'git status' },
  { label: 'npm test', cmd: 'npm test' },
  { label: 'audit', cmd: 'help' },
  { label: 'clear', cmd: 'clear' },
]

function ExplainBanner({ parts }) {
  if (!parts || parts.length === 0) return null
  return (
    <div className={styles.explainBanner}>
      <span className={styles.explainTitle}>Architectural Syntax Breakdown:</span>
      <div className={styles.explainParts}>
        {parts.map((p, i) => (
          <span key={i} className={styles.explainPart}>
            <code className={styles.epToken}>{p.token}</code>
            <span className={styles.epArrow}> → </span>
            <span className={styles.epMeaning}>{p.meaning}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function FriendlyTerminal({ mission, mode: initialMode = 'guided', workspaceFiles }) {
  const [mode, setMode] = useState(initialMode)
  const [lines, setLines] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const outputRef = useRef(null)
  const inputRef = useRef(null)
  const { height, onMouseDown: onResizeMouseDown } = useVerticalResize({ defaultHeight: 440 })

  useEffect(() => {
    resetSandbox()
    setLines([
      { type: 'success', text: '⚡ VibeSkool Virtual Terminal Initialized (Node.js v20.12.0).' },
      { type: 'output', text: mission ? `🎯 Mission: ${mission}` : 'Type "node workspace.js" or any JavaScript command to execute.' }
    ])
  }, [mission])

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' })
  }, [lines])

  const handleCommand = (cmdText) => {
    const trimmed = (cmdText || input).trim()
    if (!trimmed) return

    setLines(prev => [...prev, { type: 'command', text: `$ ${trimmed}` }])
    setHistory(prev => [...prev, trimmed])
    setHistoryIdx(-1)
    setInput('')

    if (trimmed === 'clear') {
      setLines([])
      return
    }

    // Evaluate command
    const res = evalCommand(trimmed, workspaceFiles)
    if (res.error) {
      setLines(prev => [...prev, { type: 'error', text: res.error }])
    } else if (res.output) {
      setLines(prev => [...prev, { type: 'output', text: res.output, parts: res.parts }])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCommand()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1)
        setHistoryIdx(nextIdx)
        setInput(history[nextIdx] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx !== -1) {
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
  }

  return (
    <div className={styles.resizeWrap} style={{ height }}>
      <div className={styles.resizeHandle} onMouseDown={onResizeMouseDown}>
        <span className={styles.resizeGrip} />
      </div>

      <div className={styles.terminal}>
        <div className={styles.titleBar}>
          <div className={styles.titleLeft}>
            <div className={styles.dots}>
              <span className={`${styles.dot} ${styles.dotRed}`} />
              <span className={`${styles.dot} ${styles.dotYellow}`} />
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </div>
            <span className={styles.title}>bash — node-vm@vibeskool</span>
          </div>

          <div className={styles.modeSwitch}>
            <button
              className={`${styles.modeBtn} ${mode === 'guided' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('guided')}
            >
              Guided
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'free' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('free')}
            >
              Free Shell
            </button>
          </div>
        </div>

        {/* Output */}
        <div className={styles.output} ref={outputRef}>
          {lines.map((l, i) => (
            <div key={i} className={`${styles.line} ${
              l.type === 'command' ? styles.lineCommand :
              l.type === 'success' ? styles.lineSuccess :
              l.type === 'error'   ? styles.lineError : ''
            }`}>
              {l.text}
              {l.parts && <ExplainBanner parts={l.parts} />}
            </div>
          ))}
        </div>

        {/* Command chips */}
        <div className={styles.chipsRow}>
          {COMMAND_CHIPS.map(c => (
            <button
              key={c.cmd}
              className={styles.chipBtn}
              onClick={() => handleCommand(c.cmd)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className={styles.inputRow}>
          <span className={styles.promptSymbol}>❯</span>
          <input
            ref={inputRef}
            className={styles.termInput}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a JavaScript or shell command..."
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  )
}
