import React, { useState } from 'react'
import IDEWorkspace from '@/components/terminal/IDEWorkspace'
import styles from './LabPage.module.css'

const PROTOCOL = [
  ['01', 'Observe', 'Run the existing file before changing it. Record what the system actually does.'],
  ['02', 'Change one thing', 'Make the smallest meaningful edit. A small change is easier to explain and test.'],
  ['03', 'Verify the boundary', 'Run it again and describe the evidence that the result is safe or correct.'],
]

const COMMANDS = [
  ['node workspace.js', 'Run the file currently designed for execution.'],
  ['git status', 'Inspect what has changed before calling work complete.'],
  ['npm test', 'Ask the simulated test runner for a verification record.'],
  ['help', 'See the controlled commands available in this practice space.'],
]

export default function LabPage() {
  const [copied, setCopied] = useState('')
  const copy = command => {
    navigator.clipboard?.writeText(command)
    setCopied(command)
    window.setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div><p className={styles.eyebrow}>Practice studio / controlled environment</p><h1>Make the change.<br /><em>Keep the reasoning.</em></h1></div>
        <aside><span>[ studio note ]</span><p>This workspace simulates a local project. It never reaches your device, files, accounts, or network.</p></aside>
      </header>

      <section className={styles.protocol} aria-labelledby="protocol-title">
        <div><p className={styles.eyebrow}>Today&apos;s protocol</p><h2 id="protocol-title">Run, inspect,<br />then explain.</h2></div>
        <ol>{PROTOCOL.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
      </section>

      <section className={styles.workspace} aria-label="Interactive coding workspace">
        <div className={styles.workspaceHead}><span>LAB / 01</span><p>Input boundaries and execution evidence</p><span>Saved locally for this session</span></div>
        <IDEWorkspace />
      </section>

      <section className={styles.support}>
        <div className={styles.commandSheet}><p className={styles.eyebrow}>Controlled commands</p><h2>Use a command<br />on purpose.</h2><p className={styles.supportCopy}>Commands copy to your clipboard; paste one into the terminal when you can predict what it will tell you.</p><div className={styles.commandList}>{COMMANDS.map(([command, description]) => <button key={command} onClick={() => copy(command)}><code>{command}</code><span>{copied === command ? 'Copied' : description}</span></button>)}</div></div>
        <aside className={styles.safety}><span>[ safety condition ]</span><h2>Safe to try.<br />Not pretend-safe.</h2><p>Destructive shell patterns, filesystem access, network access, and dynamic code execution are blocked. The terminal remains useful because its feedback explains the command rather than merely approving it.</p><p className={styles.warning}><b>Before you leave:</b> save a short note in the ledger beside the editor. “It worked” is not an explanation.</p></aside>
      </section>
    </div>
  )
}
