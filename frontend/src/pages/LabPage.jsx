import React, { useState } from 'react'
import IDEWorkspace from '@/components/terminal/IDEWorkspace'
import styles from './LabPage.module.css'
import { FadeUp, SlideIn, RevealOnScroll } from '@/components/ui/Motion'

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
  const [copiedCmd, setCopiedCmd] = useState(null)

  const handleCopy = (cmd) => {
    navigator.clipboard?.writeText(cmd)
    setCopiedCmd(cmd)
    setTimeout(() => setCopiedCmd(null), 1500)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <FadeUp delay={0}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>The Lab</h1>
            <p className={styles.sub}>
              A safe sandbox environment. Nothing you type here can break anything.
              Experiment freely in our virtual editor and terminal VM.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Main layout */}
      <div className={styles.layout}>
        
        {/* IDE Workspace Terminal */}
        <SlideIn delay={80} x={-16} className={styles.terminalWrap}>
          <IDEWorkspace />
        </SlideIn>

        {/* Quick reference sidebar */}
        <RevealOnScroll delay={120} y={12}>
          <div className={styles.refPanel}>
            <h2 className={styles.refTitle}>Quick Reference</h2>
            <p className={styles.refSub}>Click any command to copy it to clipboard.</p>
            
            <div className={styles.refList}>
              {QUICK_REFS.map((r) => (
                <div 
                  key={r.cmd} 
                  className={styles.refRow} 
                  onClick={() => handleCopy(r.cmd)}
                  title="Click to copy"
                >
                  <div className={styles.cmdRow}>
                    <code className={styles.refCmd}>{r.cmd}</code>
                    {copiedCmd === r.cmd && <span className={styles.copyCheck}>✓</span>}
                  </div>
                  <span className={styles.refDesc}>{r.desc}</span>
                </div>
              ))}
            </div>

            <div className={styles.tipBox}>
              <span className={styles.tipLabel}>Pro tip</span>
              <p className={styles.tipText}>
                Use ↑ and ↓ arrow keys in the terminal input to cycle through your command history.
              </p>
            </div>

            <div className={styles.safeBox}>
              <span className={styles.safeIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              <p className={styles.safeText}>
                Destructive actions like <code>rm -rf</code> are blocked. You are in a sandboxed client container.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  )
}
