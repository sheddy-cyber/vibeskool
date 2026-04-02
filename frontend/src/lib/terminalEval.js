// ─── Safe Terminal Evaluator ───────────────────────────────────────────────────
// Runs user commands in a sandboxed context with friendly output and explanations.
// Nothing here touches the real filesystem or network.

const BLOCKED_PATTERNS = [
  /rm\s+-rf/i,
  /del\s+\/[sf]/i,
  /format\s+[a-z]:/i,
  /shutdown/i,
  /reboot/i,
  /sudo/i,
  /__proto__/,
  /constructor\[/,
  /process\.exit/,
  /require\s*\(/,
  /import\s*\(/,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /document\.cookie/,
  /localStorage/,
  /eval\s*\(/,
  /Function\s*\(/,
]

// Friendly explanations for known JS constructs
function explainCommand(cmd) {
  const trimmed = cmd.trim()

  if (/^(let|const|var)\s+\w+\s*=/.test(trimmed)) {
    const match = trimmed.match(/^(let|const|var)\s+(\w+)\s*=\s*(.+)/)
    if (match) {
      const [, keyword, name, value] = match
      return [
        { token: keyword, meaning: keyword === 'const' ? 'cannot be reassigned' : 'can be reassigned later' },
        { token: name,    meaning: 'the variable name' },
        { token: '=',     meaning: 'assign this value to the name' },
        { token: value.trim(), meaning: 'the value being stored' },
      ]
    }
  }

  if (/^\w+\s*\(/.test(trimmed)) {
    const match = trimmed.match(/^(\w+)\s*\((.*)?\)/)
    if (match) {
      const [, name, args] = match
      const parts = [{ token: name, meaning: 'the function being called' }]
      if (args && args.trim()) {
        parts.push({ token: args.trim(), meaning: 'the argument(s) passed in' })
      }
      return parts
    }
  }

  if (/^console\.log/.test(trimmed)) {
    return [
      { token: 'console', meaning: 'the browser\'s output panel' },
      { token: '.log()',  meaning: 'print a value so you can see it' },
    ]
  }

  if (/^git\s+/.test(trimmed)) {
    const gitParts = {
      'push':   'send your local commits to the remote repo',
      'pull':   'download changes from the remote repo',
      'commit': 'save a snapshot of your current changes',
      'clone':  'copy a remote repo to your machine',
      'status': 'see what files have changed',
      'add':    'stage files for the next commit',
      'log':    'see the history of commits',
    }
    const words = trimmed.split(/\s+/)
    return words.slice(1).map(w => ({
      token: w,
      meaning: gitParts[w] || `git flag or argument`,
    }))
  }

  if (/^npm\s+/.test(trimmed)) {
    const npmParts = {
      'install': 'download and add a package to your project',
      'run':     'execute a script defined in package.json',
      'start':   'start your project\'s dev server',
      'build':   'compile your project for production',
      'init':    'create a new package.json file',
    }
    const words = trimmed.split(/\s+/)
    return words.slice(1).map(w => ({
      token: w,
      meaning: npmParts[w] || `package name or flag`,
    }))
  }

  return null
}

// Sandbox state — persists within a session
const sandboxState = {
  variables: {},
  functions: {
    greetUser: (name) => name ? `Hello, ${name}!` : 'Hello! (pass a name in quotes)',
    add: (a, b) => (Number(a) || 0) + (Number(b) || 0),
    shout: (text) => text ? String(text).toUpperCase() + '!!!' : 'PASS SOME TEXT!!!',
    reverseString: (s) => s ? String(s).split('').reverse().join('') : 'pass a string',
    isEven: (n) => Number(n) % 2 === 0 ? `${n} is even` : `${n} is odd`,
  },
}

// Hints shown after specific actions
const HINTS = {
  variable: "Variables store data so your functions have something to work with.",
  function_call: "You just called a function with an argument — that's the most common pattern in AI-generated code.",
  console_log: "console.log() is how developers peek inside running code. AI uses it everywhere for debugging.",
  git: "Git tracks changes to your code over time. AI can generate git commands for you — now you understand what they mean.",
  npm: "npm is the package manager for JavaScript. When AI says 'install this', it usually means running npm install.",
  error: "Errors aren't failures — they're information. Every error tells you exactly what went wrong.",
}

export function evalCommand(cmd) {
  const trimmed = cmd.trim()

  if (!trimmed) return null

  // Safety check
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        ok: false,
        output: `🛡️ That command is blocked for safety.`,
        hint: `In a real terminal, that could cause damage. Here you're safe — but good to know what it does!`,
        explain: null,
      }
    }
  }

  const explain = explainCommand(trimmed)

  // help
  if (/^help$/i.test(trimmed)) {
    return {
      ok: true,
      output: [
        'Available commands:',
        '  greetUser("name")       — call a function with an argument',
        '  let x = "value"        — create a variable',
        '  console.log("text")    — print something',
        '  add(3, 4)              — arithmetic function',
        '  shout("hello")         — uppercase + excitement',
        '  reverseString("abc")   — reverse a string',
        '  isEven(7)              — check if a number is even',
        '  git status             — see how git commands look',
        '  npm install axios      — see how npm commands look',
        '  clear                  — clear the terminal',
      ].join('\n'),
      explain: null,
      hint: null,
    }
  }

  // clear
  if (/^clear$/i.test(trimmed)) {
    return { ok: true, output: '__CLEAR__', explain: null, hint: null }
  }

  // Variable declaration
  const varMatch = trimmed.match(/^(let|const|var)\s+(\w+)\s*=\s*["'](.+?)["']$/) ||
                   trimmed.match(/^(let|const|var)\s+(\w+)\s*=\s*(-?\d+\.?\d*)$/)
  if (varMatch) {
    const [, , name, value] = varMatch
    const parsed = isNaN(value) ? value : Number(value)
    sandboxState.variables[name] = parsed
    return {
      ok: true,
      output: `✓ '${name}' = ${JSON.stringify(parsed)}`,
      explain,
      hint: HINTS.variable,
    }
  }

  // console.log
  const logMatch = trimmed.match(/^console\.log\(["'](.+?)["']\)$/) ||
                   trimmed.match(/^console\.log\((\w+)\)$/)
  if (logMatch) {
    const arg = logMatch[1]
    const value = sandboxState.variables[arg] !== undefined
      ? sandboxState.variables[arg]
      : arg
    return {
      ok: true,
      output: String(value),
      explain,
      hint: HINTS.console_log,
    }
  }

  // Known function calls
  const fnMatch = trimmed.match(/^(\w+)\((.*)?\)$/)
  if (fnMatch) {
    const [, fnName, rawArgs] = fnMatch
    if (sandboxState.functions[fnName]) {
      try {
        const args = rawArgs
          ? rawArgs.split(',').map(a => {
              const t = a.trim().replace(/^["']|["']$/g, '')
              return isNaN(t) ? t : Number(t)
            })
          : []
        const result = sandboxState.functions[fnName](...args)
        return {
          ok: true,
          output: `→ ${JSON.stringify(result)}`,
          explain,
          hint: HINTS.function_call,
        }
      } catch (e) {
        return { ok: false, output: `Error: ${e.message}`, explain, hint: HINTS.error }
      }
    }
  }

  // Git commands (simulated)
  if (/^git\s+/.test(trimmed)) {
    const verb = trimmed.split(/\s+/)[1]
    const responses = {
      status: 'On branch main\nnothing to commit, working tree clean',
      log:    'commit a3f92b1\nAuthor: Shedrach\nDate: just now\n\n  "initial commit"',
      push:   '✓ Pushed to origin/main successfully',
      pull:   '✓ Already up to date.',
      init:   '✓ Initialized empty Git repository in ./my-project/.git/',
    }
    return {
      ok: true,
      output: responses[verb] || `✓ git ${verb} — executed (simulated)`,
      explain,
      hint: HINTS.git,
    }
  }

  // npm commands (simulated)
  if (/^npm\s+/.test(trimmed)) {
    const verb = trimmed.split(/\s+/)[1]
    const pkg  = trimmed.split(/\s+/)[2] || ''
    const responses = {
      install: `added ${pkg || '1 package'} to node_modules\nfound 0 vulnerabilities`,
      start:   'Server running at http://localhost:3000',
      run:     `> running script...`,
      init:    'Wrote to package.json',
    }
    return {
      ok: true,
      output: responses[verb] || `npm: running ${verb}...`,
      explain,
      hint: HINTS.npm,
    }
  }

  // Variable reference
  if (/^\w+$/.test(trimmed) && sandboxState.variables[trimmed] !== undefined) {
    return {
      ok: true,
      output: `→ ${JSON.stringify(sandboxState.variables[trimmed])}`,
      explain: null,
      hint: 'Typing a variable name shows its current value.',
    }
  }

  // Unknown
  return {
    ok: false,
    output: `Hmm, didn't recognize "${trimmed}".\nType help to see what's available.`,
    explain: null,
    hint: HINTS.error,
  }
}

export function resetSandbox() {
  sandboxState.variables = {}
}
