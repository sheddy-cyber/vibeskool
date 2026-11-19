/* The playground shell: a bash-like command line over the virtual file
   system, with Git, npm, Node and a few network tools. Output looks like a
   real terminal; when something goes wrong it also says, in plain English,
   what the message means. That reading skill is the point. */

import * as vfs from './vfs'
import { HOME, FsError } from './vfs'
import { git, branchFor } from './git'
import { curl, ping, nslookup } from './net'
import { runNode } from './node'
import { explainLine, KNOWN_COMMANDS } from './explain'

const USER = 'you'
const HOST = 'vibeskool'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ── Parsing ──────────────────────────────────────────────── */

function tokenize(line, env) {
  const tokens = []
  let cur = ''
  let has = false
  let quote = null
  const push = () => { if (has) tokens.push({ t: 'w', v: cur }); cur = ''; has = false }
  const expand = (s, i) => {
    const m = /^\$([A-Za-z_][A-Za-z0-9_]*)|^\$\{([A-Za-z_][A-Za-z0-9_]*)\}/.exec(s.slice(i))
    if (!m) return null
    return { value: env[m[1] || m[2]] ?? '', len: m[0].length }
  }
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i]
    if (quote) {
      if (c === quote) { quote = null; continue }
      if (quote === '"' && c === '\\' && i + 1 < line.length) { cur += line[++i]; continue }
      if (quote === '"' && c === '$') { const e = expand(line, i); if (e) { cur += e.value; i += e.len - 1; continue } }
      cur += c
      continue
    }
    if (c === '"' || c === "'") { quote = c; has = true; continue }
    if (c === '\\' && i + 1 < line.length) { cur += line[++i]; has = true; continue }
    if (/\s/.test(c)) { push(); continue }
    if (c === '$') { const e = expand(line, i); if (e) { cur += e.value; has = true; i += e.len - 1; continue } }
    const two = line.slice(i, i + 2)
    if (two === '&&' || two === '||' || two === '>>') { push(); tokens.push({ t: 'op', v: two }); i += 1; continue }
    if (c === ';' || c === '|' || c === '>') { push(); tokens.push({ t: 'op', v: c }); continue }
    cur += c
    has = true
  }
  if (quote) return { error: `unexpected end of input: missing closing ${quote}` }
  push()
  return { tokens }
}

function parse(tokens) {
  const segs = []
  let cur = { argv: [] }
  for (let i = 0; i < tokens.length; i += 1) {
    const tk = tokens[i]
    if (tk.t === 'w') { cur.argv.push(tk.v); continue }
    if (tk.v === '>' || tk.v === '>>') {
      const target = tokens[i + 1]
      if (!target || target.t !== 'w') return { error: `syntax error near unexpected token '${tk.v}'` }
      cur.redirect = { target: target.v, append: tk.v === '>>' }
      i += 1
      continue
    }
    cur.op = tk.v
    segs.push(cur)
    cur = { argv: [] }
  }
  if (cur.argv.length || cur.redirect) segs.push(cur)
  return { segs }
}

/* ── Helpers ──────────────────────────────────────────────── */

function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
  }
  return d[a.length][b.length]
}

const WRONG_TOOL = {
  cls: 'On Mac and Linux the command to clear the screen is clear.',
  dir: 'dir is the Windows command. On Mac and Linux, use ls to list files.',
  type: 'On Mac and Linux, use cat to print a file.',
  python: "Python isn't installed in this playground. It runs JavaScript with node.",
  python3: "Python isn't installed in this playground. It runs JavaScript with node.",
  pip: "pip installs Python packages. This playground uses npm for JavaScript packages.",
  vim: 'There is no text editor inside this terminal. Open the file in the editor instead: code <file>.',
  nano: 'There is no text editor inside this terminal. Open the file in the editor instead: code <file>.',
  sudo: 'sudo runs a command as the administrator. Nothing here needs it, and this playground has no administrator.',
  yarn: 'This playground uses npm. Most yarn commands have an npm version, like npm install.',
  npx: "npx runs a package's command without installing it. That needs the internet, which this playground doesn't have.",
}

const KNOWN_VERSIONS = { express: '^4.19.2', react: '^18.3.1', 'react-dom': '^18.3.1', axios: '^1.7.2', lodash: '^4.17.21', dotenv: '^16.4.5', cors: '^2.8.5', nodemon: '^3.1.0', vite: '^5.4.0', pg: '^8.12.0', bcrypt: '^5.1.1', jsonwebtoken: '^9.0.2', zod: '^3.23.8', typescript: '^5.5.4', prettier: '^3.3.3', eslint: '^9.9.0', zustand: '^4.5.5', 'react-router-dom': '^6.26.2' }

/* ── Seeds ────────────────────────────────────────────────── */

const SITE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My first page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="card">
    <h1>Hello, I'm learning to build</h1>
    <p>This page lives in the playground. Change anything and watch the preview.</p>
    <button id="cheer">Say hello</button>
  </main>
  <script src="script.js"></script>
</body>
</html>
`
const SITE_CSS = `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #f4f5f8;
  color: #14171f;
}

.card {
  max-width: 420px;
  padding: 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px -18px rgba(16, 24, 40, 0.4);
}

h1 {
  margin-top: 0;
  color: #1a73e8;
}

button {
  padding: 10px 18px;
  border: 0;
  border-radius: 999px;
  background: #1a73e8;
  color: white;
  font: inherit;
  cursor: pointer;
}
`
const SITE_JS = `const button = document.querySelector("#cheer");

button.addEventListener("click", () => {
  console.log("Someone clicked the button");
});
`
const SITE_README = `# My first site

A small page to practise on.

- index.html  the structure of the page
- style.css   how it looks
- script.js   what it does when you click
`
const HELLO_JS = `// Run me with: node hello.js
const name = "VibeSkool";
const lessons = ["HTML", "CSS", "JavaScript"];

console.log(\`Hello from \${name}\`);

for (const lesson of lessons) {
  console.log("Next up:", lesson);
}
`

export const SITE_HTML_H1 = "Hello, I'm learning to build"
export { SITE_CSS }

export const SEEDS = {
  playground: () => vfs.dir({
    home: vfs.dir({
      you: vfs.dir({
        site: vfs.dir({
          'index.html': vfs.file(SITE_HTML),
          'style.css': vfs.file(SITE_CSS),
          'script.js': vfs.file(SITE_JS),
          'README.md': vfs.file(SITE_README),
        }),
        'hello.js': vfs.file(HELLO_JS),
      }),
    }),
  }),
  lesson: () => vfs.dir({
    home: vfs.dir({
      you: vfs.dir({
        'notes.txt': vfs.file('This is a practice terminal.\nNothing you do here touches your own computer.\n'),
        'hello.js': vfs.file('console.log("Hello from Node");\n'),
      }),
    }),
  }),
}

/* ── Shell ────────────────────────────────────────────────── */

export class Shell {
  constructor({ storageKey, seed = 'playground', startIn = HOME } = {}) {
    this.storageKey = storageKey
    this.seedName = seed
    this.startIn = startIn
    this.listeners = new Set()
    this.version = 0
    this.lastCommands = []
    this.ctx = this.load() || this.fresh()
  }

  fresh() {
    return { fs: SEEDS[this.seedName](), cwd: this.startIn, prevCwd: this.startIn, repos: {}, history: [] }
  }

  load() {
    if (!this.storageKey) return null
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return null
      const data = JSON.parse(raw)
      if (!data?.fs || data.fs.type !== 'dir') return null
      if (!vfs.get(data.fs, data.cwd)) data.cwd = HOME
      return { prevCwd: data.cwd, repos: {}, history: [], ...data }
    } catch {
      return null
    }
  }

  save() {
    if (!this.storageKey) return
    clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => {
      try {
        const { fs, cwd, repos } = this.ctx
        localStorage.setItem(this.storageKey, JSON.stringify({ fs, cwd, repos, history: this.ctx.history.slice(-200) }))
      } catch { /* storage full or blocked: keep working in memory */ }
    }, 250)
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  emit() {
    this.version += 1
    this.save()
    this.listeners.forEach((fn) => fn(this.version))
  }

  reset() {
    this.ctx = this.fresh()
    this.lastCommands = []
    this.emit()
  }

  get env() {
    return { HOME, USER, PWD: this.ctx.cwd, SHELL: '/bin/bash', PATH: '/usr/local/bin:/usr/bin:/bin' }
  }

  promptInfo() {
    return { user: USER, host: HOST, path: vfs.display(this.ctx.cwd), branch: branchFor(this.ctx, this.ctx.cwd) }
  }

  /* File access for the editor and explorer */
  read(abs) { try { return vfs.readFile(this.ctx.fs, abs) } catch { return null } }
  node(abs) { return vfs.get(this.ctx.fs, abs) }
  write(abs, content) { vfs.writeFile(this.ctx.fs, abs, content); this.emit() }
  mkdir(abs) { vfs.mkdir(this.ctx.fs, abs, { parents: true }); this.emit() }
  remove(abs) { vfs.remove(this.ctx.fs, abs, { recursive: true }); this.emit() }
  rename(from, to) { vfs.move(this.ctx.fs, from, to); this.emit() }

  /** Explain a line without running it */
  explain(line) {
    const tk = tokenize(line, this.env)
    if (tk.error) return []
    const p = parse(tk.tokens)
    return p.error ? [] : explainLine(p.segs)
  }

  /* ── Running ────────────────────────────────────────────── */

  async run(line, io) {
    const text = line.trim()
    if (!text) return 0
    this.ctx.history.push(text)
    this.lastCommands.push(text)
    const tk = tokenize(text, this.env)
    if (tk.error) { io.print(`bash: ${tk.error}`, 'err'); io.note('Every opening quote needs a matching closing quote.'); return 2 }
    const p = parse(tk.tokens)
    if (p.error) { io.print(`bash: ${p.error}`, 'err'); return 2 }
    const code = await this.runSegments(p.segs, io, 0)
    this.emit()
    return code
  }

  async runSegments(segs, io, depth) {
    if (segs.some((s) => s.op === '|')) {
      io.print('bash: pipes (|) are not supported in this playground', 'err')
      io.note("A pipe sends one command's output into another. Run the commands one at a time instead.")
      return 1
    }
    let code = 0
    let skip = false
    for (let k = 0; k < segs.length; k += 1) {
      const seg = segs[k]
      const prevOp = segs[k - 1]?.op
      if (prevOp === '&&') skip = skip || code !== 0
      else if (prevOp === '||') skip = code === 0
      else skip = false
      if (skip) continue
      if (io.signal?.aborted) return 130
      code = await this.runOne(seg, io, depth)
    }
    return code
  }

  async runOne(seg, io, depth) {
    const [cmd, ...args] = seg.argv
    if (!cmd) {
      if (seg.redirect) { try { vfs.writeFile(this.ctx.fs, vfs.resolve(this.ctx.cwd, seg.redirect.target), '', { append: seg.redirect.append }) } catch { /* ignore */ } }
      return 0
    }
    let out = io
    let captured = ''
    if (seg.redirect) {
      out = {
        ...io,
        print: (t, kind) => {
          if (kind === 'err' || kind === 'warn') io.print(t, kind)
          else captured += (Array.isArray(t) ? t.map((x) => x.text).join('') : t) + '\n'
        },
      }
    }
    let code
    try {
      code = await this.exec(cmd, args, out, depth)
    } catch (e) {
      code = this.fsFail(cmd, e, args, io)
    }
    if (seg.redirect) {
      const target = vfs.resolve(this.ctx.cwd, seg.redirect.target)
      try {
        vfs.writeFile(this.ctx.fs, target, captured, { append: seg.redirect.append })
      } catch (e) {
        return this.fsFail('bash', e, [seg.redirect.target], io)
      }
    }
    return code
  }

  fsFail(cmd, e, args, out) {
    if (!(e instanceof FsError)) {
      out.print(`${cmd}: ${e?.message || e}`, 'err')
      return 1
    }
    const name = args.filter((a) => !a.startsWith('-')).find((a) => vfs.resolve(this.ctx.cwd, a) === e.path || e.path.endsWith('/' + a.replace(/\/$/, ''))) || vfs.display(e.path)
    const msgs = {
      ENOENT: ['No such file or directory', `There's nothing called ${name} here. Run ls to see what is in this folder, and check the spelling.`],
      EEXIST: ['File exists', `Something called ${name} already exists here. Pick another name, or remove the old one first.`],
      ENOTDIR: ['Not a directory', `${name} is a file, not a folder.`],
      EISDIR: ['Is a directory', `${name} is a folder.${cmd === 'rm' ? ' To remove a folder and everything in it, add -r: rm -r ' + name : ''}`],
      EINVAL: ['Invalid argument', "A folder can't be moved or copied into itself."],
      EPERM: ['Operation not permitted', ''],
    }
    const [msg, note] = msgs[e.code] || [e.code, '']
    const lead = {
      cd: `bash: cd: ${name}`,
      ls: `ls: cannot access '${name}'`,
      mkdir: `mkdir: cannot create directory '${name}'`,
      touch: `touch: cannot touch '${name}'`,
      mv: `mv: cannot move '${name}'`,
      cp: `cp: cannot copy '${name}'`,
      bash: `bash: ${name}`,
    }[cmd] || `${cmd}: ${name}`
    out.print(`${lead}: ${msg}`, 'err')
    if (note) out.note(note)
    return 1
  }

  async exec(cmd, args, out, depth) {
    const c = this.ctx
    const R = (p) => vfs.resolve(c.cwd, p)
    const flags = (a) => a.filter((x) => x.startsWith('-') && x.length > 1).join('').replace(/-/g, '')
    const operands = (a) => a.filter((x) => !(x.startsWith('-') && x.length > 1))

    switch (cmd) {
      case 'help': {
        out.print('Commands this terminal understands:')
        const groups = [
          ['Files and folders', [['pwd', 'where am I?'], ['ls [-la]', "what's here?"], ['cd <folder>', 'go into a folder'], ['mkdir <name>', 'make a folder'], ['touch <file>', 'make an empty file'], ['cat <file>', 'print a file'], ['echo <text> > <file>', 'write text into a file'], ['mv / cp / rm', 'move, copy, remove'], ['tree', 'show everything as a tree']]],
          ['Code', [['node <file>', 'run a JavaScript file'], ['npm init -y', 'start a package.json'], ['npm install <pkg>', 'add a package'], ['npm run <script>', 'run a script'], ['code <file>', 'open a file in the editor']]],
          ['Git', [['git init', 'start tracking'], ['git status', 'what changed?'], ['git add .', 'stage changes'], ['git commit -m "msg"', 'save a snapshot'], ['git log --oneline', 'history']]],
          ['Network', [['curl -I <url>', 'request headers'], ['ping <host>', 'is it there?'], ['nslookup <host>', "what's its IP?"]]],
          ['Terminal', [['clear', 'clear the screen'], ['history', 'commands you ran'], ['↑ / ↓', 'previous commands'], ['Tab', 'complete names'], ['Ctrl+C', 'stop a command']]],
        ]
        for (const [title, rows] of groups) {
          out.print('')
          out.print(title, 'warn')
          rows.forEach(([a, b]) => out.print([{ text: '  ' + a.padEnd(24), kind: 'ok' }, { text: b, kind: 'muted' }]))
        }
        return 0
      }
      case 'clear': out.clear(); return 0
      case 'pwd': out.print(c.cwd); return 0
      case 'whoami': out.print(USER); return 0
      case 'date': out.print(new Date().toString().replace(/ \(.*\)$/, '')); return 0
      case 'echo': out.print(args.filter((a) => a !== '-n').join(' ')); return 0
      case 'history': c.history.slice(-50).forEach((h, i, arr) => out.print(`${String(c.history.length - arr.length + i + 1).padStart(5)}  ${h}`)); return 0
      case 'cd': {
        const target = args[0] === '-' ? c.prevCwd : R(args[0] || '~')
        const node = vfs.get(c.fs, target)
        if (!node) throw new FsError('ENOENT', target)
        if (node.type !== 'dir') throw new FsError('ENOTDIR', target)
        c.prevCwd = c.cwd
        c.cwd = target
        if (args[0] === '-') out.print(vfs.display(target))
        return 0
      }
      case 'ls': {
        const f = flags(args)
        const all = f.includes('a')
        const long = f.includes('l')
        const targets = operands(args)
        const list = targets.length ? targets : ['.']
        let code = 0
        list.forEach((t, ti) => {
          const abs = R(t)
          let items
          try { items = vfs.list(c.fs, abs) } catch (e) { code = this.fsFail('ls', e, [t], out); return }
          if (list.length > 1) out.print(`${ti ? '\n' : ''}${t}:`)
          let shown = items.filter((x) => all || !x.name.startsWith('.'))
          if (all && vfs.get(c.fs, abs)?.type === 'dir') shown = [{ name: '.', type: 'dir' }, { name: '..', type: 'dir' }, ...shown]
          if (long) {
            out.print(`total ${shown.length * 4}`)
            const day = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).replace(',', '')
            shown.forEach((x) => out.print([
              { text: `${x.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'}  1 ${USER}  staff  ${String(x.type === 'dir' ? 4096 : vfs.size(x.node)).padStart(5)} ${day} 10:24 ` },
              { text: x.name, kind: x.type === 'dir' ? 'dir' : x.name.endsWith('.js') ? 'warn' : undefined },
            ]))
          } else if (shown.length) {
            const segsOut = []
            shown.forEach((x, k) => {
              segsOut.push({ text: x.name + (x.type === 'dir' ? '/' : ''), kind: x.type === 'dir' ? 'dir' : undefined })
              if (k < shown.length - 1) segsOut.push({ text: '   ' })
            })
            out.print(segsOut)
          }
        })
        return code
      }
      case 'tree': {
        const start = R(operands(args)[0] || '.')
        const node = vfs.get(c.fs, start)
        if (!node) throw new FsError('ENOENT', start)
        out.print([{ text: operands(args)[0] || '.', kind: 'dir' }])
        let dirs = 0
        let files = 0
        const walk = (abs, prefix) => {
          const items = vfs.list(c.fs, abs).filter((x) => !x.name.startsWith('.') && x.name !== 'node_modules')
          items.forEach((x, k) => {
            const last = k === items.length - 1
            out.print([{ text: `${prefix}${last ? '└── ' : '├── '}` , kind: 'muted' }, { text: x.name, kind: x.type === 'dir' ? 'dir' : undefined }])
            if (x.type === 'dir') { dirs += 1; walk(`${abs}/${x.name}`, prefix + (last ? '    ' : '│   ')) } else files += 1
          })
        }
        if (node.type === 'dir') walk(start, '')
        out.print('')
        out.print(`${dirs} director${dirs === 1 ? 'y' : 'ies'}, ${files} file${files === 1 ? '' : 's'}`)
        return 0
      }
      case 'mkdir': {
        const names = operands(args)
        if (!names.length) { out.print('mkdir: missing operand', 'err'); out.note('Say what to call the folder, for example: mkdir notes'); return 1 }
        for (const n of names) vfs.mkdir(c.fs, R(n), { parents: flags(args).includes('p') })
        return 0
      }
      case 'touch': {
        const names = operands(args)
        if (!names.length) { out.print('touch: missing file operand', 'err'); out.note('Say what to call the file, for example: touch index.html'); return 1 }
        for (const n of names) vfs.touch(c.fs, R(n))
        return 0
      }
      case 'cat': {
        const names = operands(args)
        if (!names.length) { out.print('cat: missing file operand', 'err'); return 1 }
        let code = 0
        for (const n of names) {
          try {
            const text = vfs.readFile(c.fs, R(n))
            if (text) out.print(text.replace(/\n$/, ''))
          } catch (e) { code = this.fsFail('cat', e, [n], out) }
        }
        return code
      }
      case 'rm': {
        const f = flags(args)
        const names = operands(args)
        if (!names.length) { out.print('rm: missing operand', 'err'); return 1 }
        for (const n of names) {
          const abs = R(n)
          if (abs === '/' || abs === HOME || abs === '/home') {
            out.print(`rm: refusing to remove '${n}'`, 'err')
            out.note('That would delete everything in the playground. To start fresh, use Reset instead.')
            return 1
          }
          try { vfs.remove(c.fs, abs, { recursive: f.includes('r') || f.includes('R') }) } catch (e) {
            if (e.code === 'ENOENT' && f.includes('f')) continue
            if (e.code === 'EISDIR') { out.print(`rm: cannot remove '${n}': Is a directory`, 'err'); out.note(`${n} is a folder. To remove it and everything inside, use rm -r ${n}`); return 1 }
            throw e
          }
        }
        return 0
      }
      case 'mv':
      case 'cp': {
        const ops = operands(args)
        if (ops.length < 2) { out.print(`${cmd}: missing destination file operand after '${ops[0] || ''}'`, 'err'); out.note(`Give both names: ${cmd} <from> <to>`); return 1 }
        const dest = R(ops[ops.length - 1])
        for (const src of ops.slice(0, -1)) {
          if (cmd === 'mv') vfs.move(c.fs, R(src), dest)
          else {
            try { vfs.copy(c.fs, R(src), dest, { recursive: /r/i.test(flags(args)) }) } catch (e) {
              if (e.code === 'EISDIR') { out.print(`cp: -r not specified; omitting directory '${src}'`, 'err'); out.note(`To copy a folder, add -r: cp -r ${src} ${ops[ops.length - 1]}`); return 1 }
              throw e
            }
          }
        }
        return 0
      }
      case 'code':
      case 'open': {
        const target = operands(args)[0]
        if (!target) { out.print(`${cmd}: missing file name`, 'err'); return 1 }
        const abs = R(target)
        const node = vfs.get(c.fs, abs)
        if (!node && cmd === 'code') { vfs.touch(c.fs, abs) }
        else if (!node) throw new FsError('ENOENT', abs)
        const fn = cmd === 'code' ? out.openFile : out.openPreview
        if (fn) fn(abs)
        else out.note(cmd === 'code' ? 'There is no editor next to this terminal. Open the Playground to edit files.' : 'There is no preview next to this terminal. Open the Playground to see pages.')
        return 0
      }
      case 'node': {
        if (args[0] === '-v' || args[0] === '--version') { out.print('v20.11.1'); return 0 }
        if (args[0] === '-e' || args[0] === '--eval') return runNode({ code: args[1] || '', filename: '[eval]', out, signal: out.signal })
        const target = args[0]
        if (!target) {
          out.print('Welcome to Node.js v20.11.1.', 'muted')
          out.note("Node's interactive mode isn't available here. Run a file instead: node hello.js")
          return 0
        }
        const abs = R(target)
        let code
        try { code = vfs.readFile(c.fs, abs) } catch (e) {
          if (e.code === 'ENOENT') {
            out.print(`node:internal/modules/cjs/loader`, 'err')
            out.print(`Error: Cannot find module '${abs}'`, 'err')
            out.note(`There's no file called ${target} in this folder. Run ls to check the name, or cd into the folder it's in.`)
            return 1
          }
          throw e
        }
        return runNode({ code, filename: abs, argv: args.slice(1), out, signal: out.signal })
      }
      case 'npm': return this.npm(args, out, depth)
      case 'git': return git(c, args, out)
      case 'curl': return curl(args, out, { sleep })
      case 'ping': return ping(args, out, { sleep, signal: out.signal || { aborted: false } })
      case 'nslookup': return nslookup(args, out, { sleep })
      default: {
        out.print(`bash: ${cmd}: command not found`, 'err')
        if (WRONG_TOOL[cmd]) { out.note(WRONG_TOOL[cmd]); return 127 }
        const all = [...KNOWN_COMMANDS, 'git', 'npm', 'node']
        const best = all.map((k) => [k, editDistance(cmd, k)]).sort((a, b) => a[1] - b[1])[0]
        if (best && best[1] <= 2) out.note(`Did you mean ${best[0]}? Type help to see every command this terminal knows.`)
        else out.note("The terminal doesn't know that command. Type help to see the ones it does.")
        return 127
      }
    }
  }

  /* ── npm ────────────────────────────────────────────────── */

  readPackage(dirAbs, out) {
    const abs = `${dirAbs}/package.json`
    const node = vfs.get(this.ctx.fs, abs)
    if (!node) {
      out.print(`npm ERR! code ENOENT`, 'err')
      out.print(`npm ERR! enoent Could not read package.json: Error: ENOENT: no such file or directory, open '${abs}'`, 'err')
      out.note('npm looks for package.json in the folder you are in. cd into your project folder, or create one with npm init -y.')
      return null
    }
    try { return JSON.parse(node.content) } catch {
      out.print('npm ERR! code EJSONPARSE', 'err')
      out.print(`npm ERR! JSON.parse Failed to parse ${abs}`, 'err')
      out.note('package.json has a mistake in it, often a missing or extra comma. Open it with code package.json to fix it.')
      return null
    }
  }

  async npm(args, out, depth) {
    const c = this.ctx
    const [sub, ...rest] = args
    const pkgPath = `${c.cwd}/package.json`
    if (!sub) { out.print('Usage: npm <command>'); out.print('npm install, npm init, npm run <script>', 'muted'); return 1 }
    if (sub === '-v' || sub === '--version') { out.print('10.2.4'); return 0 }
    if (sub === 'init') {
      const name = vfs.basename(c.cwd).toLowerCase().replace(/[^a-z0-9-_.]/g, '-')
      const pkg = { name, version: '1.0.0', description: '', main: 'index.js', scripts: { test: 'echo "Error: no test specified" && exit 1' }, keywords: [], author: '', license: 'ISC' }
      const text = JSON.stringify(pkg, null, 2) + '\n'
      vfs.writeFile(c.fs, pkgPath, text)
      out.print(`Wrote to ${pkgPath}:`)
      out.print('')
      out.print(text.trimEnd())
      if (!rest.includes('-y') && !rest.includes('--yes')) out.note('npm init normally asks questions first. Here it uses the defaults, like npm init -y.')
      return 0
    }
    if (['install', 'i', 'add', 'uninstall', 'remove', 'rm'].includes(sub)) {
      const pkg = this.readPackage(c.cwd, out)
      if (!pkg) return 1
      const names = rest.filter((a) => !a.startsWith('-'))
      const dev = rest.includes('-D') || rest.includes('--save-dev')
      const removing = ['uninstall', 'remove', 'rm'].includes(sub)
      await sleep(names.length ? 700 : 300)
      if (out.signal?.aborted) return 130
      if (removing) {
        for (const n of names) {
          delete pkg.dependencies?.[n]
          delete pkg.devDependencies?.[n]
          try { vfs.remove(c.fs, `${c.cwd}/node_modules/${n}`, { recursive: true }) } catch { /* not installed */ }
        }
        vfs.writeFile(c.fs, pkgPath, JSON.stringify(pkg, null, 2) + '\n')
        out.print(`\nremoved ${names.length} package${names.length === 1 ? '' : 's'}, and audited 1 package in 1s`)
        return 0
      }
      if (!names.length) {
        const all = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
        Object.keys(all).forEach((n) => vfs.mkdir(c.fs, `${c.cwd}/node_modules/${n}`, { parents: true }))
        out.print(Object.keys(all).length ? `\nadded ${Object.keys(all).length * 6 + 3} packages, and audited ${Object.keys(all).length * 6 + 4} packages in 2s` : '\nup to date, audited 1 package in 312ms')
        out.print('\nfound 0 vulnerabilities', 'ok')
        return 0
      }
      const key = dev ? 'devDependencies' : 'dependencies'
      pkg[key] = { ...(pkg[key] || {}) }
      for (const raw of names) {
        const [n, v] = raw.startsWith('@') ? [raw.split('@').slice(0, 2).join('@'), raw.split('@')[2]] : raw.split('@')
        pkg[key][n] = v ? `^${v}` : KNOWN_VERSIONS[n] || '^1.0.0'
        vfs.mkdir(c.fs, `${c.cwd}/node_modules/${n}`, { parents: true })
        vfs.writeFile(c.fs, `${c.cwd}/node_modules/${n}/package.json`, JSON.stringify({ name: n, version: pkg[key][n].slice(1) }, null, 2) + '\n')
      }
      pkg[key] = Object.fromEntries(Object.entries(pkg[key]).sort(([a], [b]) => a.localeCompare(b)))
      vfs.writeFile(c.fs, pkgPath, JSON.stringify(pkg, null, 2) + '\n')
      const count = names.length * 7 + Math.floor(Math.random() * 30)
      out.print(`\nadded ${count} packages, and audited ${count + 1} packages in 2s`)
      out.print(`\n${Math.max(1, Math.floor(count / 6))} packages are looking for funding`, 'muted')
      out.print('  run `npm fund` for details', 'muted')
      out.print('\nfound 0 vulnerabilities', 'ok')
      return 0
    }
    if (sub === 'run' || sub === 'start' || sub === 'test' || sub === 'run-script') {
      const pkg = this.readPackage(c.cwd, out)
      if (!pkg) return 1
      const name = sub === 'start' || sub === 'test' ? sub : rest[0]
      if (!name) {
        out.print(`Scripts available in ${pkg.name}@${pkg.version} via \`npm run-script\`:`)
        Object.entries(pkg.scripts || {}).forEach(([k, v]) => { out.print(`  ${k}`, 'ok'); out.print(`    ${v}`, 'muted') })
        return 0
      }
      const script = pkg.scripts?.[name]
      if (!script) {
        if (name === 'start' && vfs.get(c.fs, `${c.cwd}/server.js`)) return this.runSegments([{ argv: ['node', 'server.js'] }], out, depth + 1)
        out.print(`npm ERR! Missing script: "${name}"`, 'err')
        out.print('npm ERR!', 'err')
        out.print('npm ERR! To see a list of scripts, run:', 'err')
        out.print('npm ERR!   npm run', 'err')
        out.note(`package.json has no script called ${name}. Add it under "scripts", or run npm run to see the ones you have.`)
        return 1
      }
      out.print(`\n> ${pkg.name}@${pkg.version} ${name}`, 'muted')
      out.print(`> ${script}\n`, 'muted')
      if (/^(vite|next|react-scripts|webpack)/.test(script)) {
        await sleep(600)
        out.print('  VITE v5.4.0  ready in 412 ms', 'ok')
        out.print('')
        out.print('  ➜  Local:   http://localhost:5173/')
        out.note("In the playground, open the Preview to see your page. A dev server like this keeps running until you press Ctrl+C.")
        return 0
      }
      if (/^nodemon\b/.test(script)) return this.runSegments([{ argv: ['node', ...script.split(/\s+/).slice(1)] }], out, depth + 1)
      if (depth > 3) { out.print('npm ERR! script calls itself too many times', 'err'); return 1 }
      const tk = tokenize(script, this.env)
      const p = !tk.error && parse(tk.tokens)
      if (!p || p.error) { out.print(`sh: syntax error in script "${name}"`, 'err'); return 2 }
      const code = await this.runSegments(p.segs, out, depth + 1)
      if (code) out.print(`npm ERR! Lifecycle script \`${name}\` failed with error: code ${code}`, 'err')
      return code
    }
    if (sub === 'ls' || sub === 'list') {
      const pkg = this.readPackage(c.cwd, out)
      if (!pkg) return 1
      out.print(`${pkg.name}@${pkg.version} ${c.cwd}`)
      const deps = Object.entries({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) })
      deps.forEach(([n, v], k) => out.print(`${k === deps.length - 1 ? '└──' : '├──'} ${n}@${v.replace(/^\^/, '')}`))
      if (!deps.length) out.print('└── (empty)', 'muted')
      return 0
    }
    out.print(`Unknown command: "${sub}"`, 'err')
    out.note('This playground understands npm init, install, uninstall, run, start and ls.')
    return 1
  }

  /* ── Tab completion ─────────────────────────────────────── */

  complete(input) {
    const m = /(\S*)$/.exec(input)
    const word = m[1]
    const before = input.slice(0, input.length - word.length)
    const first = !before.trim()
    if (first) {
      const cmds = [...new Set([...KNOWN_COMMANDS, 'git', 'npm', 'node'])].filter((k) => k.startsWith(word)).sort()
      if (cmds.length === 1) return { value: `${before}${cmds[0]} `, options: [] }
      return { value: input, options: cmds }
    }
    const tokens = before.trim().split(/\s+/)
    if (tokens[0] === 'git' && tokens.length === 1) {
      const subs = ['add', 'branch', 'commit', 'diff', 'init', 'log', 'restore', 'status', 'switch'].filter((s) => s.startsWith(word))
      if (subs.length === 1) return { value: `${before}${subs[0]} `, options: [] }
      return { value: input, options: subs }
    }
    const slash = word.lastIndexOf('/')
    const dirPart = slash >= 0 ? word.slice(0, slash + 1) : ''
    const prefix = word.slice(slash + 1)
    let items
    try { items = vfs.list(this.ctx.fs, vfs.resolve(this.ctx.cwd, dirPart || '.')) } catch { return { value: input, options: [] } }
    const hits = items.filter((x) => x.name.startsWith(prefix) && (prefix.startsWith('.') || !x.name.startsWith('.')))
    if (tokens[0] === 'cd') {
      const dirs = hits.filter((x) => x.type === 'dir')
      if (dirs.length === 1) return { value: `${before}${dirPart}${dirs[0].name}/`, options: [] }
      return this.commonPrefix(before, dirPart, prefix, dirs, input)
    }
    if (hits.length === 1) {
      const h = hits[0]
      return { value: `${before}${dirPart}${h.name}${h.type === 'dir' ? '/' : ' '}`, options: [] }
    }
    return this.commonPrefix(before, dirPart, prefix, hits, input)
  }

  commonPrefix(before, dirPart, prefix, hits, input) {
    if (!hits.length) return { value: input, options: [] }
    let common = hits[0].name
    for (const h of hits) while (!h.name.startsWith(common)) common = common.slice(0, -1)
    if (common.length > prefix.length) return { value: `${before}${dirPart}${common}`, options: [] }
    return { value: input, options: hits.map((h) => h.name + (h.type === 'dir' ? '/' : '')) }
  }
}

export { HOME }
