import React, { useState } from 'react'
import FriendlyTerminal from './FriendlyTerminal'
import styles from './IDEWorkspace.module.css'

const INITIAL_FILES = {
  'workspace.js': `// 01. Receive a value from outside your program.
const email = "student@example.edu";

// 02. Check the assumption before using the value.
if (!email.includes("@")) {
  throw new Error("An email address must include @");
}

// 03. Log evidence that makes the result inspectable.
console.log("Input accepted for:", email);
console.log("The value was checked before it was used.");`,
  'auth.example.js': `// An example boundary: input is never joined into SQL text.
async function findUserByEmail(db, email) {
  const statement = "SELECT id, email FROM users WHERE email = $1";
  const values = [email];

  // $1 keeps the query structure separate from user-controlled data.
  return db.query(statement, values);
}`,
  'notes.md': `# Lab notes

What did I observe before editing?

What did I change?

What evidence tells me that the result is correct?`,
  'package.json': `{
  "name": "vibeskool-lab-01",
  "private": true,
  "description": "A controlled practice workspace"
}`
}

const FILE_CONTEXT = {
  'workspace.js': { title: 'Input boundary', prompt: 'Why is the check made before the value is used? What failure does it prevent?' },
  'auth.example.js': { title: 'Query boundary', prompt: 'Explain why the SQL statement and its values are kept separate.' },
  'notes.md': { title: 'Study record', prompt: 'Write an observation, one precise change, and the evidence you would use to defend it.' },
  'package.json': { title: 'Project record', prompt: 'Which fact about this project does this file communicate to another developer or tool?' }
}

const TEMPLATES = {
  baseline: INITIAL_FILES['workspace.js'],
  validate: `const username = "Ada";

if (username.trim().length < 3) {
  throw new Error("Username must have at least three characters");
}

console.log("Validation passed for:", username);`,
  observe: `const response = { ok: true, status: 200 };

console.log("Response status:", response.status);
console.log("Can I explain what ok means here?");`
}

export default function IDEWorkspace() {
  const [files, setFiles] = useState(INITIAL_FILES)
  const [activeFile, setActiveFile] = useState('workspace.js')
  const [notes, setNotes] = useState({})
  const context = FILE_CONTEXT[activeFile]
  const linesCount = files[activeFile].split('\n').length

  const changeFile = event => setFiles(previous => ({ ...previous, [activeFile]: event.target.value }))
  const loadTemplate = event => {
    if (!TEMPLATES[event.target.value]) return
    setFiles(previous => ({ ...previous, [activeFile]: TEMPLATES[event.target.value] }))
    event.target.value = ''
  }

  return (
    <div className={styles.container}>
      <div className={styles.ideMain}>
        <nav className={styles.fileTree} aria-label="Workspace files">
          <header><span>Workspace files</span><b>4 files</b></header>
          <div className={styles.treeList}>{Object.keys(files).map(filename => <button key={filename} className={activeFile === filename ? styles.fileBtnActive : ''} onClick={() => setActiveFile(filename)}><span>{filename === 'notes.md' ? 'NOTE' : filename.endsWith('.json') ? 'JSON' : 'JS'}</span>{filename}</button>)}</div>
          <p className={styles.fileNote}>Change one file at a time. The terminal runs <code>workspace.js</code>.</p>
        </nav>

        <section className={styles.editorArea} aria-label={`${activeFile} editor`}>
          <header className={styles.editorHeader}><div><span>Open file</span><b>{activeFile}</b></div><div className={styles.editorActions}><select onChange={loadTemplate} defaultValue="" aria-label="Load a practice example"><option value="" disabled>Load example</option><option value="baseline">Input boundary</option><option value="validate">Validation check</option><option value="observe">Observation log</option></select><span>{linesCount} lines</span></div></header>
          <div className={styles.editorContainer}><div className={styles.lineNumbers} aria-hidden="true">{Array.from({ length: Math.max(1, linesCount) }).map((_, index) => <div key={index}>{index + 1}</div>)}</div><textarea className={styles.editorTextarea} value={files[activeFile]} onChange={changeFile} spellCheck="false" aria-label={`Edit ${activeFile}`} /></div>
        </section>

        <aside className={styles.ledger}>
          <header><span>Annotation ledger</span><b>{notes[activeFile]?.trim() ? 'note recorded' : 'note required'}</b></header>
          <p className={styles.ledgerRef}>Reading alongside: <strong>{context.title}</strong></p>
          <p className={styles.ledgerPrompt}>{context.prompt}</p>
          <label htmlFor="lab-note">Your explanation</label>
          <textarea id="lab-note" value={notes[activeFile] || ''} onChange={event => setNotes(previous => ({ ...previous, [activeFile]: event.target.value }))} placeholder="Write a short, specific explanation…" />
          <p className={styles.ledgerFoot}>Notes remain in this browser session. They are a rehearsal for the explanation you give in a lesson review.</p>
        </aside>
      </div>
      <div className={styles.terminalPanel}><FriendlyTerminal mode="free" workspaceFiles={files} /></div>
    </div>
  )
}
