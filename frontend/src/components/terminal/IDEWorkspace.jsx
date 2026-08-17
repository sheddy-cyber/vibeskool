import React, { useState } from 'react'
import FriendlyTerminal from './FriendlyTerminal'
import styles from './IDEWorkspace.module.css'

const INITIAL_FILES = {
  'workspace.js': `// VibeSkool Sandbox Workspace
// Write some JS here. Then type "node workspace.js" in the terminal below to run it!

let student = "Developer";
let score = 95;

console.log("🚀 Initializing workspace runner...");
console.log("Hello, " + student + "!");

if (score >= 90) {
  console.log("Your MEK rating is ELITE. Ready to write prompts!");
} else {
  console.log("Keep reviewing lessons to unlock your full potential.");
}

// You can also use system functions:
console.log(shout("vibecoding is live"));
`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VibeSkool Sandbox</title>
  <style>
    body { background: #030712; color: #f3f4f6; font-family: sans-serif; text-align: center; padding-top: 50px; }
    h1 { color: #6366f1; }
  </style>
</head>
<body>
  <h1>Welcome to the sandbox!</h1>
  <p>Learn enough. Build anything.</p>
</body>
</html>
`,
  'package.json': `{
  "name": "vibeskool-sandbox-vm",
  "version": "1.0.0",
  "description": "Safe client-side JS sandboxed environment",
  "main": "workspace.js",
  "dependencies": {
    "axios": "^1.7.2",
    "lodash": "^4.17.21"
  }
}
`
}

export default function IDEWorkspace() {
  const [files, setFiles] = useState(INITIAL_FILES)
  const [activeFile, setActiveFile] = useState('workspace.js')

  const handleEditorChange = (e) => {
    setFiles(prev => ({
      ...prev,
      [activeFile]: e.target.value
    }))
  }

  // Count lines in active file for line numbers
  const linesCount = files[activeFile].split('\n').length

  return (
    <div className={styles.container}>
      {/* IDE Body: Sidebar + Editor */}
      <div className={styles.ideMain}>
        
        {/* Sidebar File Tree */}
        <div className={styles.fileTree}>
          <div className={styles.treeHeader}>WORKSPACE Explorer</div>
          <div className={styles.treeList}>
            {Object.keys(files).map(filename => (
              <button
                key={filename}
                className={`${styles.fileBtn} ${activeFile === filename ? styles.fileBtnActive : ''}`}
                onClick={() => setActiveFile(filename)}
              >
                <span className={styles.fileIcon}>
                  {filename.endsWith('.js') ? '🟨' : filename.endsWith('.html') ? '🟧' : '⚙️'}
                </span>
                <span className={styles.fileName}>{filename}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className={styles.editorArea}>
          <div className={styles.editorHeader}>
            <div className={styles.tabName}>
              <span className={styles.tabIcon}>📝</span>
              {activeFile}
            </div>
            <div className={styles.editorStatus}>Editing Mode</div>
          </div>
          
          <div className={styles.editorContainer}>
            {/* Mock Line Numbers */}
            <div className={styles.lineNumbers}>
              {Array.from({ length: Math.max(1, linesCount) }).map((_, idx) => (
                <div key={idx} className={styles.lineNumber}>{idx + 1}</div>
              ))}
            </div>
            {/* Code Textarea */}
            <textarea
              className={styles.editorTextarea}
              value={files[activeFile]}
              onChange={handleEditorChange}
              spellCheck="false"
              autoFocus
            />
          </div>
        </div>

      </div>

      {/* Terminal panel at bottom */}
      <div className={styles.terminalPanel}>
        <FriendlyTerminal 
          mode="free" 
          workspaceFiles={files} 
        />
      </div>
    </div>
  )
}
