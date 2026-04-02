import React from 'react'
import FriendlyTerminal from '@/components/terminal/FriendlyTerminal'
import styles from './LabPage.module.css'

const QUICK_REFS = [
  { cmd: 'greetUser("name")',    desc: 'Call a function with an argument' },
  { cmd: 'let x = "value"',     desc: 'Create a variable' },
  { cmd: 'console.log("text")', desc: 'Print something to the terminal' },
  { cmd: 'add(3, 4)',           desc: 'Call a function with two arguments' },
  { cmd: 'shout("hello")',      desc: 'Transform a string' },
  { cmd: 'reverseString("abc")',desc: 'Reverse a string' },
  { cmd: 'isEven(7)',           desc: 'Check a condition' },
  { cmd: 'git status',          desc: 'See how git commands look' },
  { cmd: 'npm install axios',   desc: 'See how npm commands look' },
  { cmd: 'help',                desc: 'See all available commands' },
  { cmd: 'clear',               desc: 'Clear the terminal' },
]

export default function LabPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header + ' animate-fade-in'}>
        <div>
          <h1 className={styles.title}>The Lab 🧪</h1>
          <p className={styles.sub}>
            A safe sandbox. Nothing you type here can break anything.
            Experiment freely — that's literally the point.
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div className={styles.layout}>
        {/* Terminal */}
        <div className={styles.terminalWrap + ' animate-slide-in'}>
          <FriendlyTerminal mode="free" />
        </div>

        {/* Quick reference */}
        <div className={styles.refPanel + ' animate-fade-in'} style={{ animationDelay: '80ms' }}>
          <h2 className={styles.refTitle}>Quick Reference</h2>
          <p className={styles.refSub}>Click any command to copy it to the terminal.</p>
          <div className={styles.refList}>
            {QUICK_REFS.map((r) => (
              <div key={r.cmd} className={styles.refRow}>
                <code className={styles.refCmd}>{r.cmd}</code>
                <span className={styles.refDesc}>{r.desc}</span>
              </div>
            ))}
          </div>

          <div className={styles.tipBox}>
            <span className={styles.tipLabel}>Pro tip</span>
            <p className={styles.tipText}>
              Use ↑ and ↓ arrow keys to cycle through your command history — just like a real terminal.
            </p>
          </div>

          <div className={styles.safeBox}>
            <span className={styles.safeIcon}>🛡️</span>
            <p className={styles.safeText}>
              Destructive commands like <code>rm -rf</code> are automatically blocked.
              You're in a sandboxed environment — you can't break anything.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
