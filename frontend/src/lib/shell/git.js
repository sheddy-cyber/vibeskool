/* A small but honest Git for the playground: init, status, add, commit,
   log, diff, restore, branch, switch/checkout. It tracks real snapshots of
   the virtual file system, so what the learner sees matches real Git. */

import { get, mkdir, writeFile, remove, snapshot, relative, resolve, segments, display } from './vfs'

const AUTHOR = 'You <you@vibeskool.dev>'

const hex = (n) => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')

/* ── Repo helpers ─────────────────────────────────────────── */

export function findRepo(ctx, from = ctx.cwd) {
  let p = from
  for (;;) {
    if (ctx.repos[p]) {
      if (get(ctx.fs, `${p === '/' ? '' : p}/.git`)) return p
      delete ctx.repos[p] // .git folder was removed by hand
    }
    if (p === '/') return null
    p = p.slice(0, p.lastIndexOf('/')) || '/'
  }
}

function ignoreRules(ctx, root) {
  const node = get(ctx.fs, `${root}/.gitignore`)
  if (!node || node.type !== 'file') return []
  return node.content.split('\n').map((l) => l.trim().replace(/^\//, '').replace(/\/$/, '')).filter((l) => l && !l.startsWith('#'))
}

function isIgnored(rules, rel) {
  const parts = rel.split('/')
  return rules.some((r) => {
    if (r.startsWith('*.')) return rel.endsWith(r.slice(1))
    return rel === r || rel.startsWith(r + '/') || parts.includes(r)
  })
}

export function workingFiles(ctx, root) {
  const rules = ignoreRules(ctx, root)
  const all = snapshot(ctx.fs, root, ['.git'])
  return Object.fromEntries(Object.entries(all).filter(([rel]) => !isIgnored(rules, rel)))
}

function headFiles(repo) {
  const id = repo.branches[repo.head]
  return id ? repo.commits[id].files : {}
}

/** Compare HEAD, index and working tree. */
export function repoStatus(ctx, root) {
  const repo = ctx.repos[root]
  const H = headFiles(repo)
  const I = repo.index
  const W = workingFiles(ctx, root)
  const staged = []
  const unstaged = []
  const untracked = []
  for (const p of new Set([...Object.keys(H), ...Object.keys(I)])) {
    if (!(p in H)) staged.push({ kind: 'new file', p })
    else if (!(p in I)) staged.push({ kind: 'deleted', p })
    else if (H[p] !== I[p]) staged.push({ kind: 'modified', p })
  }
  for (const p of Object.keys(I)) {
    if (!(p in W)) unstaged.push({ kind: 'deleted', p })
    else if (W[p] !== I[p]) unstaged.push({ kind: 'modified', p })
  }
  for (const p of Object.keys(W)) if (!(p in I)) untracked.push(p)
  const sort = (a, b) => (a.p || a).localeCompare(b.p || b)
  return { staged: staged.sort(sort), unstaged: unstaged.sort(sort), untracked: untracked.sort(), clean: !staged.length && !unstaged.length && !untracked.length }
}

/* ── Line diff (LCS) ──────────────────────────────────────── */

export function lineDiff(a = '', b = '') {
  const A = a === '' ? [] : a.replace(/\n$/, '').split('\n')
  const B = b === '' ? [] : b.replace(/\n$/, '').split('\n')
  if (A.length * B.length > 400000) return { ops: [{ t: '~', s: '(file too large to compare here)' }], add: B.length, del: A.length }
  const dp = Array.from({ length: A.length + 1 }, () => new Int32Array(B.length + 1))
  for (let i = A.length - 1; i >= 0; i -= 1) {
    for (let j = B.length - 1; j >= 0; j -= 1) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const ops = []
  let i = 0
  let j = 0
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) { ops.push({ t: ' ', s: A[i] }); i += 1; j += 1 }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ t: '-', s: A[i] }); i += 1 }
    else { ops.push({ t: '+', s: B[j] }); j += 1 }
  }
  while (i < A.length) ops.push({ t: '-', s: A[i++] })
  while (j < B.length) ops.push({ t: '+', s: B[j++] })
  return { ops, add: ops.filter((o) => o.t === '+').length, del: ops.filter((o) => o.t === '-').length }
}

/** Unified diff hunks with 3 lines of context */
function printDiff(out, path, before, after) {
  const { ops } = lineDiff(before ?? '', after ?? '')
  out.print(`diff --git a/${path} b/${path}`, 'meta')
  if (before == null) out.print('new file mode 100644', 'meta')
  if (after == null) out.print('deleted file mode 100644', 'meta')
  out.print(`--- ${before == null ? '/dev/null' : `a/${path}`}`, 'meta')
  out.print(`+++ ${after == null ? '/dev/null' : `b/${path}`}`, 'meta')
  const changed = ops.map((o, k) => (o.t !== ' ' ? k : -1)).filter((k) => k >= 0)
  if (!changed.length) return
  const groups = []
  let start = Math.max(0, changed[0] - 3)
  let end = Math.min(ops.length - 1, changed[0] + 3)
  for (const k of changed.slice(1)) {
    if (k - 3 <= end + 1) end = Math.min(ops.length - 1, k + 3)
    else { groups.push([start, end]); start = Math.max(0, k - 3); end = Math.min(ops.length - 1, k + 3) }
  }
  groups.push([start, end])
  for (const [s, e] of groups) {
    let oldStart = 1
    let newStart = 1
    for (let k = 0; k < s; k += 1) { if (ops[k].t !== '+') oldStart += 1; if (ops[k].t !== '-') newStart += 1 }
    const slice = ops.slice(s, e + 1)
    const oldLen = slice.filter((o) => o.t !== '+').length
    const newLen = slice.filter((o) => o.t !== '-').length
    out.print(`@@ -${oldLen ? oldStart : 0},${oldLen} +${newLen ? newStart : 0},${newLen} @@`, 'hunk')
    for (const o of slice) out.print(`${o.t}${o.s}`, o.t === '+' ? 'add' : o.t === '-' ? 'del' : 'out')
  }
}

/* ── Commands ─────────────────────────────────────────────── */

const NOT_A_REPO = (out) => {
  out.print('fatal: not a git repository (or any of the parent directories): .git', 'err')
  out.note("Git isn't tracking this folder yet. Move into your project folder, or run git init here to start tracking it.")
  return 128
}

function pathspecToRel(ctx, root, spec) {
  const abs = resolve(ctx.cwd, spec)
  return abs === root ? '' : relative(root, abs)
}

const matches = (rel, base) => base === '' || rel === base || rel.startsWith(base + '/')

function git_init(ctx, args, out) {
  const target = args[0] ? resolve(ctx.cwd, args[0]) : ctx.cwd
  if (!get(ctx.fs, target)) mkdir(ctx.fs, target, { parents: true })
  const existed = !!ctx.repos[target] && !!get(ctx.fs, `${target}/.git`)
  if (!get(ctx.fs, `${target}/.git`)) {
    mkdir(ctx.fs, `${target}/.git`, { parents: true })
    writeFile(ctx.fs, `${target}/.git/HEAD`, 'ref: refs/heads/main\n')
  }
  if (!existed) ctx.repos[target] = { head: 'main', branches: { main: null }, commits: {}, index: {} }
  out.print(`${existed ? 'Reinitialized existing' : 'Initialized empty'} Git repository in ${target}/.git/`)
  return 0
}

function git_status(ctx, root, args, out) {
  const repo = ctx.repos[root]
  const s = repoStatus(ctx, root)
  const short = args.includes('-s') || args.includes('--short')
  if (short) {
    const lines = new Map()
    s.staged.forEach((x) => lines.set(x.p, (x.kind === 'new file' ? 'A' : x.kind === 'deleted' ? 'D' : 'M') + ' '))
    s.unstaged.forEach((x) => lines.set(x.p, (lines.get(x.p)?.[0] || ' ') + (x.kind === 'deleted' ? 'D' : 'M')))
    for (const [p, code] of [...lines].sort()) out.print(`${code} ${p}`, code[0] !== ' ' ? 'ok' : 'err')
    s.untracked.forEach((p) => out.print(`?? ${p}`, 'err'))
    return 0
  }
  out.print(`On branch ${repo.head}`)
  if (!repo.branches[repo.head]) out.print('\nNo commits yet')
  if (s.staged.length) {
    out.print('\nChanges to be committed:')
    out.print('  (use "git restore --staged <file>..." to unstage)', 'muted')
    s.staged.forEach((x) => out.print(`\t${(x.kind + ':').padEnd(12)}${x.p}`, 'ok'))
  }
  if (s.unstaged.length) {
    out.print('\nChanges not staged for commit:')
    out.print('  (use "git add <file>..." to update what will be committed)', 'muted')
    out.print('  (use "git restore <file>..." to discard changes in working directory)', 'muted')
    s.unstaged.forEach((x) => out.print(`\t${(x.kind + ':').padEnd(12)}${x.p}`, 'err'))
  }
  if (s.untracked.length) {
    out.print('\nUntracked files:')
    out.print('  (use "git add <file>..." to include in what will be committed)', 'muted')
    s.untracked.forEach((p) => out.print(`\t${p}`, 'err'))
  }
  if (s.clean) out.print(repo.branches[repo.head] ? '\nnothing to commit, working tree clean' : '\nnothing to commit (create/copy files and use "git add" to track)')
  else if (!s.staged.length && !s.unstaged.length) out.print('\nnothing added to commit but untracked files present (use "git add" to track)')
  else if (!s.staged.length) out.print('\nno changes added to commit (use "git add" and/or "git commit -a")')
  return 0
}

function git_add(ctx, root, args, out) {
  const repo = ctx.repos[root]
  const specs = args.filter((a) => !a.startsWith('-'))
  const all = args.includes('-A') || args.includes('--all')
  if (!specs.length && !all) {
    out.print('Nothing specified, nothing added.', 'err')
    out.print("hint: Maybe you wanted to say 'git add .'?", 'muted')
    return 0
  }
  const W = workingFiles(ctx, root)
  const bases = all ? [''] : specs.map((s) => pathspecToRel(ctx, root, s))
  for (let k = 0; k < bases.length; k += 1) {
    const base = bases[k]
    const hits = [...Object.keys(W), ...Object.keys(repo.index)].filter((p) => matches(p, base))
    if (!hits.length) {
      out.print(`fatal: pathspec '${specs[k] ?? base}' did not match any files`, 'err')
      out.note('Git looked for that name in this folder and found nothing. Check the spelling with ls.')
      return 128
    }
    for (const p of new Set(hits)) {
      if (p in W) repo.index[p] = W[p]
      else delete repo.index[p]
    }
  }
  return 0
}

function git_commit(ctx, root, args, out) {
  const repo = ctx.repos[root]
  if (args.includes('-a') || args.includes('-am')) {
    const W = workingFiles(ctx, root)
    for (const p of Object.keys(repo.index)) {
      if (p in W) repo.index[p] = W[p]
      else delete repo.index[p]
    }
  }
  const mi = args.findIndex((a) => a === '-m' || a === '-am' || a === '--message')
  const message = mi >= 0 ? args[mi + 1] : null
  if (mi >= 0 && !message) {
    out.print("error: switch `m' requires a value", 'err')
    return 129
  }
  const s = repoStatus(ctx, root)
  if (!s.staged.length) {
    out.print(`On branch ${repo.head}`)
    if (s.unstaged.length || s.untracked.length) {
      out.print('nothing added to commit but untracked files present (use "git add" to track)')
      out.note('A commit only saves what you staged. Run git add with a file name (or git add . for everything), then commit again.')
    } else {
      out.print('nothing to commit, working tree clean')
    }
    return 1
  }
  if (!message) {
    out.print('Aborting commit due to empty commit message.', 'err')
    out.note('Real Git would open a text editor for the message. Here, add it inline: git commit -m "Describe what changed"')
    return 1
  }
  const parent = repo.branches[repo.head]
  const H = headFiles(repo)
  let add = 0
  let del = 0
  for (const x of s.staged) {
    const d = lineDiff(H[x.p] ?? '', repo.index[x.p] ?? '')
    add += d.add
    del += d.del
  }
  const id = hex(40)
  repo.commits[id] = { id, parent, message, date: new Date().toISOString(), files: { ...repo.index } }
  repo.branches[repo.head] = id
  out.print(`[${repo.head}${parent ? '' : ' (root-commit)'} ${id.slice(0, 7)}] ${message}`)
  const n = s.staged.length
  out.print(` ${n} file${n === 1 ? '' : 's'} changed${add ? `, ${add} insertion${add === 1 ? '' : 's'}(+)` : ''}${del ? `, ${del} deletion${del === 1 ? '' : 's'}(-)` : ''}`)
  s.staged.filter((x) => x.kind === 'new file').forEach((x) => out.print(` create mode 100644 ${x.p}`))
  s.staged.filter((x) => x.kind === 'deleted').forEach((x) => out.print(` delete mode 100644 ${x.p}`))
  return 0
}

function history(repo) {
  const outList = []
  let id = repo.branches[repo.head]
  while (id) { outList.push(repo.commits[id]); id = repo.commits[id].parent }
  return outList
}

function git_log(ctx, root, args, out) {
  const repo = ctx.repos[root]
  const list = history(repo)
  if (!list.length) {
    out.print(`fatal: your current branch '${repo.head}' does not have any commits yet`, 'err')
    out.note('There is no history to show until you make your first commit.')
    return 128
  }
  const oneline = args.includes('--oneline')
  const nIdx = args.findIndex((a) => /^-\d+$/.test(a) || a === '-n')
  const limit = nIdx >= 0 ? Number(args[nIdx] === '-n' ? args[nIdx + 1] : args[nIdx].slice(1)) || list.length : list.length
  list.slice(0, limit).forEach((c, k) => {
    const deco = k === 0 ? ` (HEAD -> ${repo.head})` : ''
    if (oneline) {
      out.print(`${c.id.slice(0, 7)}${deco} ${c.message}`, k === 0 ? 'ok' : 'out')
      return
    }
    out.print(`commit ${c.id}${deco}`, 'warn')
    out.print(`Author: ${AUTHOR}`)
    out.print(`Date:   ${new Date(c.date).toString().replace(/ \(.*\)$/, '')}`)
    out.print('')
    out.print(`    ${c.message}`)
    if (k < Math.min(limit, list.length) - 1) out.print('')
  })
  return 0
}

function git_diff(ctx, root, args, out) {
  const repo = ctx.repos[root]
  const staged = args.includes('--staged') || args.includes('--cached')
  const specs = args.filter((a) => !a.startsWith('-')).map((s) => pathspecToRel(ctx, root, s))
  const keep = (p) => !specs.length || specs.some((b) => matches(p, b))
  const before = staged ? headFiles(repo) : repo.index
  const after = staged ? repo.index : workingFiles(ctx, root)
  const paths = [...new Set([...Object.keys(before), ...(staged ? Object.keys(after) : Object.keys(after).filter((p) => p in repo.index))])].filter(keep).sort()
  let shown = 0
  for (const p of paths) {
    if (before[p] === after[p]) continue
    printDiff(out, p, before[p], staged ? after[p] : (p in after ? after[p] : null))
    shown += 1
  }
  if (!shown && !staged) {
    const s = repoStatus(ctx, root)
    if (s.staged.length) out.note('No unstaged changes. Your changes are already staged; see them with git diff --staged.')
    else if (s.untracked.length) out.note("git diff doesn't show untracked files. Stage them with git add first.")
  }
  return 0
}

function git_restore(ctx, root, args, out) {
  const repo = ctx.repos[root]
  const stagedOnly = args.includes('--staged') || args.includes('-S')
  const specs = args.filter((a) => !a.startsWith('-'))
  if (!specs.length) {
    out.print('fatal: you must specify path(s) to restore', 'err')
    return 128
  }
  const H = headFiles(repo)
  for (const spec of specs) {
    const base = pathspecToRel(ctx, root, spec)
    if (stagedOnly) {
      const paths = [...new Set([...Object.keys(repo.index), ...Object.keys(H)])].filter((p) => matches(p, base))
      if (!paths.length) { out.print(`error: pathspec '${spec}' did not match any file(s) known to git`, 'err'); return 1 }
      for (const p of paths) { if (p in H) repo.index[p] = H[p]; else delete repo.index[p] }
    } else {
      const paths = Object.keys(repo.index).filter((p) => matches(p, base))
      if (!paths.length) { out.print(`error: pathspec '${spec}' did not match any file(s) known to git`, 'err'); return 1 }
      for (const p of paths) {
        const abs = `${root}/${p}`
        if (!get(ctx.fs, abs.slice(0, abs.lastIndexOf('/')))) mkdir(ctx.fs, abs.slice(0, abs.lastIndexOf('/')), { parents: true })
        writeFile(ctx.fs, abs, repo.index[p])
      }
    }
  }
  return 0
}

function setWorkingTree(ctx, root, files) {
  const W = workingFiles(ctx, root)
  for (const p of Object.keys(W)) if (!(p in files)) remove(ctx.fs, `${root}/${p}`)
  for (const [p, content] of Object.entries(files)) {
    const abs = `${root}/${p}`
    const parent = abs.slice(0, abs.lastIndexOf('/'))
    if (!get(ctx.fs, parent)) mkdir(ctx.fs, parent, { parents: true })
    writeFile(ctx.fs, abs, content)
  }
}

function git_branch(ctx, root, args, out) {
  const repo = ctx.repos[root]
  const name = args.find((a) => !a.startsWith('-'))
  if (args.includes('-d') || args.includes('-D')) {
    if (!name || !(name in repo.branches)) { out.print(`error: branch '${name}' not found.`, 'err'); return 1 }
    if (name === repo.head) { out.print(`error: Cannot delete branch '${name}' checked out at '${display(root)}'`, 'err'); return 1 }
    delete repo.branches[name]
    out.print(`Deleted branch ${name}.`)
    return 0
  }
  if (!name) {
    Object.keys(repo.branches).sort().forEach((b) => out.print(`${b === repo.head ? '* ' : '  '}${b}`, b === repo.head ? 'ok' : 'out'))
    return 0
  }
  if (!repo.branches[repo.head]) {
    out.print(`fatal: not a valid object name: '${repo.head}'`, 'err')
    out.note('A branch has to start from a commit. Make your first commit, then create the branch.')
    return 128
  }
  if (name in repo.branches) { out.print(`fatal: a branch named '${name}' already exists`, 'err'); return 128 }
  repo.branches[name] = repo.branches[repo.head]
  return 0
}

function git_switch(ctx, root, args, out, create) {
  const repo = ctx.repos[root]
  const name = args.find((a) => !a.startsWith('-'))
  if (!name) { out.print('fatal: missing branch name', 'err'); return 128 }
  if (create) {
    if (name in repo.branches) { out.print(`fatal: a branch named '${name}' already exists`, 'err'); return 128 }
    repo.branches[name] = repo.branches[repo.head]
    repo.head = name
    out.print(`Switched to a new branch '${name}'`)
    return 0
  }
  if (!(name in repo.branches)) {
    out.print(`error: pathspec '${name}' did not match any file(s) known to git`, 'err')
    out.note(`There's no branch called ${name}. See your branches with git branch, or create one with git switch -c ${name}.`)
    return 1
  }
  if (name === repo.head) { out.print(`Already on '${name}'`); return 0 }
  const s = repoStatus(ctx, root)
  if (s.staged.length || s.unstaged.length) {
    out.print('error: Your local changes to the following files would be overwritten by checkout:', 'err')
    ;[...s.staged, ...s.unstaged].forEach((x) => out.print(`\t${x.p}`, 'err'))
    out.print('Please commit your changes or stash them before you switch branches.', 'err')
    out.note('Switching would replace files you have changed. Commit them first, then switch.')
    return 1
  }
  repo.head = name
  const files = headFiles(repo)
  setWorkingTree(ctx, root, files)
  repo.index = { ...files }
  out.print(`Switched to branch '${name}'`)
  return 0
}

export function git(ctx, args, out) {
  const [sub, ...rest] = args
  if (!sub || sub === 'help' || sub === '--help') {
    out.print('usage: git <command> [<args>]')
    out.print('')
    out.print('Commands this playground understands:', 'muted')
    ;[['init', 'Start tracking a folder'], ['status', 'See what has changed'], ['add', 'Stage changes for the next commit'], ['commit -m', 'Save a snapshot with a message'], ['log', 'Show the history'], ['diff', "Show what changed but isn't staged"], ['restore', 'Undo changes to a file'], ['branch', 'List or create branches'], ['switch', 'Move to another branch']]
      .forEach(([c, d]) => out.print(`   ${c.padEnd(11)}${d}`))
    return 0
  }
  if (sub === '--version' || sub === 'version') { out.print('git version 2.45.2'); return 0 }
  if (sub === 'init') return git_init(ctx, rest, out)
  if (sub === 'clone') {
    out.print(`Cloning into '${(rest[0] || 'repo').split('/').pop().replace(/\.git$/, '')}'...`)
    out.print('fatal: unable to access the remote: this playground has no internet connection', 'err')
    out.note('Cloning downloads a project from a site like GitHub. The playground is offline, so practise with git init instead.')
    return 128
  }
  if (sub === 'config') { out.print(''); return 0 }

  const root = findRepo(ctx)
  if (!root) return NOT_A_REPO(out)

  switch (sub) {
    case 'status': return git_status(ctx, root, rest, out)
    case 'add': return git_add(ctx, root, rest, out)
    case 'commit': return git_commit(ctx, root, rest, out)
    case 'log': return git_log(ctx, root, rest, out)
    case 'diff': return git_diff(ctx, root, rest, out)
    case 'restore': return git_restore(ctx, root, rest, out)
    case 'branch': return git_branch(ctx, root, rest, out)
    case 'switch': return git_switch(ctx, root, rest.filter((a) => a !== '-c'), out, rest.includes('-c') || rest.includes('--create'))
    case 'checkout': return git_switch(ctx, root, rest.filter((a) => a !== '-b'), out, rest.includes('-b'))
    case 'remote':
      if (!rest.length || rest[0] === '-v') return 0
      out.print('error: remotes are not available in this playground', 'err')
      out.note('A remote is a copy of your repository on a server such as GitHub. On your own machine you would run git remote add origin <url>.')
      return 1
    case 'push':
      out.print('fatal: No configured push destination.', 'err')
      out.print('Either specify the URL from the command-line or configure a remote repository using', 'muted')
      out.print('    git remote add <name> <url>', 'muted')
      out.note('Push uploads your commits to a remote like GitHub. This playground has no remote, so your commits stay here.')
      return 128
    case 'pull':
      out.print('There is no tracking information for the current branch.', 'err')
      out.note('Pull downloads new commits from a remote. There is no remote here, so there is nothing to pull.')
      return 1
    default:
      out.print(`git: '${sub}' is not a git command. See 'git --help'.`, 'err')
      return 1
  }
}

export function branchFor(ctx, cwd) {
  const root = findRepo(ctx, cwd)
  if (!root) return null
  const repo = ctx.repos[root]
  const s = repoStatus(ctx, root)
  return { name: repo.head, dirty: !s.clean, root }
}

export const repoPathSegments = segments
