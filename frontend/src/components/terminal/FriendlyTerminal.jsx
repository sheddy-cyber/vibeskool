import React, { useState, useRef, useEffect, useCallback } from 'react'
import { evalCommand, resetSandbox } from '@/lib/terminalEval'
import styles from './FriendlyTerminal.module.css'

// ── Drag-to-resize hook ────────────────────────────────────────
function useVerticalResize({ minHeight = 280, maxHeight = 900, defaultHeight = 480 }) {
  const [height, setHeight] = useState(defaultHeight)
  const dragging = useRef(false)
  const startY   = useRef(0)
  const startH   = useRef(0)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    startY.current   = e.clientY
    startH.current   = height
    document.body.style.cursor     = 'ns-resize'
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
      dragging.current               = false
      document.body.style.cursor     = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [minHeight, maxHeight])

  return { height, onMouseDown }
}

const COMMAND_CHIPS = [
  { label: 'greetUser()', cmd: 'greetUser("Shedrach")' },
  { label: 'console.log()', cmd: 'console.log("hello world")' },
  { label: 'let x =', cmd: 'let x = "something"' },
  { label: 'add()', cmd: 'add(3, 4)' },
  { label: 'shout()', cmd: 'shout("vibe coding")' },
  { label: 'git status', cmd: 'git status' },
  { label: 'npm install', cmd: 'npm install axios' },
]

const GUIDED_MISSIONS = [
  { prompt: 'Call greetUser() with your name', hint: 'greetUser("YourName")' },
  { prompt: 'Create a variable called language', hint: 'let language = "JavaScript"' },
  { prompt: 'Print something using console.log()', hint: 'console.log("I am learning!")' },
  { prompt: 'Try the add() function with two numbers', hint: 'add(5, 7)' },
]

function ExplainBanner({ parts }) {
  if (!parts || parts.length === 0) return null
  return (
    <div className={styles.explainBanner}>
      <span className={styles.explainTitle}>what that means:</span>
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

export default function FriendlyTerminal({ mission, mode: initialMode = 'guided' }) {
  const [mode, setMode]         = useState(initialMode)
  const [lines, setLines]       = useState([])
  const [input, setInput]       = useState('')
  const [history, setHistory]   = useState([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [missionIdx, setMissionIdx] = useState(0)
  const outputRef = useRef(null)
  const inputRef  = useRef(null)
  const { height, onMouseDown: onResizeMouseDown } = useVerticalResize({ defaultHeight: 480 })

  // Initialize
  useEffect(() => {
    resetSandbox()
    const welcomeLines = mode === 'guided'
      ? [
          { type: 'success', text: '✓ Lab ready — guided mode active.' },
          { type: 'output',  text: 'Complete the mission below step by step.' },
          { type: 'mission', text: `Mission ${missionIdx + 1}: ${mission || GUIDED_MISSIONS[0].prompt}` },
          { type: 'output',  text: 'Try typing a command, or pick one from the builder above.' },
        ]
      : [
          { type: 'success', text: '✓ Free sandbox loaded.' },
          { type: 'output',  text: "You're safe here — nothing you do can break anything." },
          { type: 'output',  text: 'Type help to see available commands.' },
        ]
    setLines(welcomeLines)
  }, [mode])

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  const addLines = useCallback((newLines) => {
    setLines(prev => [...prev, ...newLines])
  }, [])

  function run(cmd) {
    const trimmed = cmd.trim()
    if (!trimmed) return

    // Add to history
    setHistory(prev => [trimmed, ...prev.slice(0, 49)])
    setHistoryIdx(-1)

    // Echo the command
    const toAdd = [{ type: 'cmd', text: trimmed }]

    const result = evalCommand(trimmed)

    if (result === null) return

    // Handle clear
    if (result.output === '__CLEAR__') {
      setLines([{ type: 'success', text: '✓ Terminal cleared.' }])
      return
    }

    // Explain banner
    if (result.explain) {
      toAdd.push({ type: 'explain', parts: result.explain })
    }

    // Output
    if (result.output !== undefined) {
      const outputLines = String(result.output).split('\n')
      outputLines.forEach(line => {
        toAdd.push({ type: result.ok ? 'success' : 'error', text: line })
      })
    }

    // Hint
    if (result.hint) {
      toAdd.push({ type: 'hint', text: result.hint })
    }

    // Guided: advance mission
    if (mode === 'guided' && result.ok) {
      const next = missionIdx + 1
      if (next < GUIDED_MISSIONS.length) {
        toAdd.push({ type: 'mission', text: `Mission ${next + 1}: ${GUIDED_MISSIONS[next].prompt}` })
        setMissionIdx(next)
      } else {
        toAdd.push({ type: 'success', text: '★ All missions complete! Try free mode to explore further.' })
      }
    }

    addLines(toAdd)
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(historyIdx + 1, history.length - 1)
      setHistoryIdx(idx)
      setInput(history[idx] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(historyIdx - 1, -1)
      setHistoryIdx(idx)
      setInput(idx === -1 ? '' : history[idx])
    }
  }

  function useChip(cmd) {
    setInput(cmd)
    inputRef.current?.focus()
  }

  function switchMode(m) {
    setMode(m)
    setInput('')
    setMissionIdx(0)
  }

  return (
    <div className={styles.resizeWrap} style={{ height }}>
    <div className={styles.terminal}>
      {/* Title bar */}
      <div className={styles.titleBar}>
        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.red}`} />
          <span className={`${styles.dot} ${styles.yellow}`} />
          <span className={`${styles.dot} ${styles.green}`} />
        </div>
        <span className={styles.title}>lab — {mode} mode</span>
        <div className={styles.modeSwitch}>
          <button
            className={`${styles.modeBtn} ${mode === 'guided' ? styles.modeBtnActive : ''}`}
            onClick={() => switchMode('guided')}
          >
            Guided
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'free' ? styles.modeBtnActive : ''}`}
            onClick={() => switchMode('free')}
          >
            Free
          </button>
        </div>
      </div>

      {/* Output */}
      <div className={styles.output} ref={outputRef}>
        {lines.map((line, i) => {
          if (line.type === 'explain') {
            return <ExplainBanner key={i} parts={line.parts} />
          }
          return (
            <div key={i} className={`${styles.line} ${styles[`line-${line.type}`]}`}>
              {line.type === 'cmd' && <span className={styles.prompt}>›</span>}
              <span>{line.text}</span>
            </div>
          )
        })}
      </div>

      {/* Command builder (guided mode) */}
      {mode === 'guided' && (
        <div className={styles.builder}>
          <span className={styles.builderLabel}>Command Builder</span>
          <div className={styles.chips}>
            {COMMAND_CHIPS.map((chip) => (
              <button
                key={chip.label}
                className={`${styles.chip} ${input === chip.cmd ? styles.chipActive : ''}`}
                onClick={() => useChip(chip.cmd)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className={styles.inputRow}>
        <span className={styles.inputPrompt}>›</span>
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={mode === 'guided' ? 'type a command, or pick one above...' : 'type anything... (type help to start)'}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
        <button className={styles.runBtn} onClick={() => { run(input); setInput('') }}>
          Run
        </button>
      </div>
    </div>

    {/* Resize handle */}
    <div
      className={styles.resizeHandle}
      onMouseDown={onResizeMouseDown}
      title="Drag to resize terminal"
    >
      <span className={styles.resizeGrip} />
    </div>
    </div>
  )
}
