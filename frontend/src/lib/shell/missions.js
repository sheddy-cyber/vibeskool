/* Guided tasks for the playground. Each one checks the real state of the
   workspace (files, Git history, what was run), so it ticks itself off when
   the learner has actually done it, whichever way they did it. */

import { HOME, get, readFile } from './vfs'
import { findRepo, repoStatus } from './git'
import { SITE_HTML_H1, SITE_CSS } from './shell'

const ran = (st, re) => st.ran.some((r) => r.code === 0 && re.test(r.text))
const exists = (st, rel, type) => {
  const n = get(st.shell.ctx.fs, `${HOME}/${rel}`)
  return !!n && (!type || n.type === type)
}
const read = (st, rel) => { try { return readFile(st.shell.ctx.fs, `${HOME}/${rel}`) } catch { return null } }
const siteRepo = (st) => {
  const root = `${HOME}/site`
  return findRepo(st.shell.ctx, root) === root ? st.shell.ctx.repos[root] : null
}
const commitCount = (repo) => {
  if (!repo) return 0
  let n = 0
  let id = repo.branches[repo.head]
  while (id) { n += 1; id = repo.commits[id].parent }
  return n
}

export const TRACKS = [
  {
    id: 'move',
    title: 'Find your way around',
    blurb: 'The six commands you will use every day.',
    missions: [
      { id: 'pwd', title: 'See which folder you are in', detail: 'pwd prints the full path of the folder the terminal is in.', cmd: 'pwd', check: (st) => ran(st, /^pwd\b/) },
      { id: 'ls', title: "List what's in it", detail: 'Folders end with a slash. Add -la to see hidden files and sizes.', cmd: 'ls', check: (st) => ran(st, /^ls\b/) },
      { id: 'mkdir', title: 'Make a folder called notes', detail: 'mkdir makes a directory, which is just another word for folder.', cmd: 'mkdir notes', check: (st) => exists(st, 'notes', 'dir') },
      { id: 'cd', title: 'Go into the notes folder', detail: 'cd changes the folder you are in. cd .. goes back up one level.', cmd: 'cd notes', check: (st) => st.shell.ctx.cwd === `${HOME}/notes` || ran(st, /^cd\s+(~\/)?notes\/?$/) },
      { id: 'touch', title: 'Create a file called todo.txt', detail: 'touch makes an empty file. You will see it appear in Files.', cmd: 'touch todo.txt', check: (st) => exists(st, 'notes/todo.txt', 'file') },
      { id: 'write', title: 'Write a line into it, then read it back', detail: 'The > sends what echo prints into the file. cat prints a file.', cmd: 'echo "buy milk" > todo.txt', check: (st) => !!read(st, 'notes/todo.txt')?.trim() && ran(st, /^cat\b.*todo\.txt/) },
    ],
  },
  {
    id: 'git',
    title: 'Save your work with Git',
    blurb: 'Snapshots you can always go back to.',
    missions: [
      { id: 'site', title: 'Go to the site folder', detail: 'Your page lives in ~/site. The ~ means your home folder.', cmd: 'cd ~/site', check: (st) => st.shell.ctx.cwd.startsWith(`${HOME}/site`) || ran(st, /^cd\s+(~\/)?site/) },
      { id: 'init', title: 'Start tracking it with Git', detail: 'git init creates a hidden .git folder where the history is kept.', cmd: 'git init', check: (st) => !!siteRepo(st) },
      { id: 'status', title: 'Ask Git what it sees', detail: 'Red files are new or changed. Nothing is saved yet.', cmd: 'git status', check: (st) => !!siteRepo(st) && ran(st, /^git\s+status/) },
      { id: 'add', title: 'Stage every file', detail: 'git add . picks everything in this folder for the next snapshot.', cmd: 'git add .', check: (st) => { const r = siteRepo(st); return !!r && (Object.keys(r.index).length > 0 || commitCount(r) > 0) } },
      { id: 'commit', title: 'Save your first snapshot', detail: 'A commit needs a message that says what changed.', cmd: 'git commit -m "First version of my page"', check: (st) => commitCount(siteRepo(st)) >= 1 },
      { id: 'diff', title: 'Change style.css, then see the difference', detail: 'Edit a colour in style.css, then run git diff. Green lines are added, red are removed.', cmd: 'git diff', check: (st) => commitCount(siteRepo(st)) >= 1 && ran(st, /^git\s+diff/) && (() => { const r = siteRepo(st); return r && (repoStatus(st.shell.ctx, `${HOME}/site`).unstaged.length > 0 || commitCount(r) >= 2) })() },
      { id: 'commit2', title: 'Commit that change too', detail: 'Stage it and commit in one line: the && runs the second command if the first worked.', cmd: 'git add . && git commit -m "Change the colours"', check: (st) => commitCount(siteRepo(st)) >= 2 },
    ],
  },
  {
    id: 'page',
    title: 'Make the page yours',
    blurb: 'HTML for structure, CSS for looks, JavaScript for behaviour.',
    missions: [
      { id: 'open', title: 'Open index.html', detail: 'Pick it in Files, or run code site/index.html from your home folder.', cmd: 'code ~/site/index.html', check: (st) => st.opened.has(`${HOME}/site/index.html`) },
      { id: 'h1', title: 'Change the heading', detail: 'Edit the text between <h1> and </h1>. The preview updates as you type.', check: (st) => { const h = read(st, 'site/index.html'); const m = h && /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(h); return !!m && m[1].trim() !== SITE_HTML_H1 } },
      { id: 'css', title: 'Change how it looks', detail: 'In style.css, try a new background or heading colour.', check: (st) => { const c = read(st, 'site/style.css'); return c != null && c !== SITE_CSS } },
      { id: 'click', title: 'Click the button and read the console', detail: 'script.js logs a message when the button is clicked. Open Console under the preview.', check: (st) => st.logs > 0 },
      { id: 'node', title: 'Run a script with Node', detail: 'Node runs JavaScript outside the browser. hello.js is in your home folder.', cmd: 'node ~/hello.js', check: (st) => ran(st, /^node\s+\S*hello\.js/) },
    ],
  },
]

export function evaluate(state, done) {
  const next = new Set(done)
  for (const t of TRACKS) for (const m of t.missions) if (!next.has(m.id)) { try { if (m.check(state)) next.add(m.id) } catch { /* ignore */ } }
  return next
}
