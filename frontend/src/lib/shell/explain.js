/* Plain-English breakdown of a command, shown when "Explain" is on.
   Returns [{ token, meaning }] for the command word, its flags and arguments. */

const CMD = {
  pwd: 'print the folder you are in',
  ls: 'list what is in a folder',
  cd: 'change into another folder',
  mkdir: 'make a new folder',
  touch: 'create an empty file (or update its time)',
  cat: 'print what is in a file',
  echo: 'print some text',
  rm: 'remove a file',
  mv: 'move or rename',
  cp: 'copy',
  tree: 'draw the folders and files as a tree',
  clear: 'clear the screen',
  history: 'list the commands you have run',
  help: 'show what this terminal understands',
  node: 'run a JavaScript file with Node.js',
  npm: "Node's package manager",
  git: 'version control: save and compare snapshots of your work',
  curl: 'make a web request and print the reply',
  ping: 'check whether a server answers, and how fast',
  nslookup: 'ask DNS which IP address a name points to',
  code: 'open a file in the editor',
  open: 'open a page in the preview',
  whoami: 'print your user name',
  date: 'print the date and time',
}

const FLAGS = {
  ls: { '-a': 'include hidden files (names starting with a dot)', '-l': 'long format: one item per line with details', '-la': 'long format, including hidden files', '-al': 'long format, including hidden files' },
  mkdir: { '-p': 'also create any missing parent folders' },
  rm: { '-r': 'remove a folder and everything inside it', '-f': "don't ask, and don't complain if it's missing", '-rf': 'remove a folder and everything in it, without asking' },
  cp: { '-r': 'copy a folder and everything inside it' },
  curl: { '-I': 'show only the response headers', '-i': 'include the headers before the body', '-L': 'follow redirects' },
  ping: { '-c': 'how many times to ping' },
  npm: { '-y': 'accept all the default answers', '-D': 'save as a development-only dependency', '--save-dev': 'save as a development-only dependency', '-v': 'print the version' },
  node: { '-v': 'print the version' },
}

const GIT = {
  init: 'start tracking this folder with Git',
  status: 'show what has changed since the last commit',
  add: 'stage changes so the next commit includes them',
  commit: 'save the staged changes as a snapshot',
  log: 'show the list of commits',
  diff: 'show the exact lines that changed',
  restore: 'undo changes to a file',
  branch: 'list or create branches',
  switch: 'move to another branch',
  checkout: 'move to another branch (older command)',
  push: 'upload commits to a remote such as GitHub',
  pull: 'download new commits from a remote',
  clone: 'download a copy of a repository',
  remote: 'manage links to remote repositories',
}
const GIT_FLAGS = { '-m': 'the commit message comes next', '--oneline': 'one short line per commit', '--staged': 'compare staged changes with the last commit', '--cached': 'compare staged changes with the last commit', '-b': 'create the branch, then switch to it', '-c': 'create the branch, then switch to it', '-a': 'stage every tracked file that changed', '-am': 'stage tracked changes and use this message', '.': 'everything in this folder', '-A': 'every change in the whole project', '-s': 'short format' }

const NPM = {
  init: 'create a package.json for this project',
  install: 'add a package to the project',
  i: 'add a package to the project (short for install)',
  uninstall: 'remove a package from the project',
  run: 'run a script defined in package.json',
  start: 'run the "start" script',
  test: 'run the "test" script',
}

const OPS = {
  '>': 'write the output into a file, replacing what was there',
  '>>': 'add the output to the end of a file',
  '&&': 'run the next command only if this one worked',
  ';': 'then run the next command',
  '|': 'send the output into the next command',
}

function argMeaning(cmd, arg, i, args) {
  if (cmd === 'cd') return arg === '..' ? 'the folder one level up' : arg === '~' ? 'your home folder' : arg === '-' ? 'the folder you were in before' : 'the folder to go into'
  if (['mkdir', 'touch', 'cat', 'rm'].includes(cmd)) return /\./.test(arg) && cmd !== 'mkdir' ? 'the file' : cmd === 'mkdir' ? 'the new folder' : 'the file or folder'
  if (cmd === 'mv' || cmd === 'cp') return i === args.length - 1 ? 'where it goes' : 'what to move'
  if (cmd === 'node') return 'the file to run'
  if (cmd === 'echo') return 'the text to print'
  if (cmd === 'curl' || cmd === 'ping' || cmd === 'nslookup') return /^https?:/.test(arg) ? 'the web address' : 'the server name'
  if (cmd === 'ls') return 'the folder to list'
  if (cmd === 'code' || cmd === 'open') return 'the file to open'
  return null
}

/** segments: [{ argv: [...], op: '&&' | '>' ... }] from the parser */
export function explainLine(segments) {
  const parts = []
  segments.forEach((seg) => {
    const [cmd, ...args] = seg.argv
    if (!cmd) return
    if (CMD[cmd]) parts.push({ token: cmd, meaning: CMD[cmd] })
    if (cmd === 'git' && args[0]) {
      parts.push({ token: args[0], meaning: GIT[args[0]] || 'a git subcommand' })
      args.slice(1).forEach((a, k, rest) => {
        if (GIT_FLAGS[a]) parts.push({ token: a, meaning: GIT_FLAGS[a] })
        else if (rest[k - 1] === '-m' || rest[k - 1] === '-am') parts.push({ token: `"${a}"`, meaning: 'a short note saying what changed' })
        else if (args[0] === 'add' || args[0] === 'restore' || args[0] === 'diff') parts.push({ token: a, meaning: 'which file' })
        else if (['branch', 'switch', 'checkout'].includes(args[0])) parts.push({ token: a, meaning: 'the branch name' })
      })
    } else if (cmd === 'npm' && args[0]) {
      parts.push({ token: args[0], meaning: NPM[args[0]] || FLAGS.npm[args[0]] || 'an npm subcommand' })
      args.slice(1).forEach((a) => {
        if (FLAGS.npm[a]) parts.push({ token: a, meaning: FLAGS.npm[a] })
        else if (args[0] === 'run') parts.push({ token: a, meaning: 'the script name from package.json' })
        else parts.push({ token: a, meaning: 'the package name' })
      })
    } else {
      args.forEach((a, i) => {
        const f = FLAGS[cmd]?.[a]
        if (f) parts.push({ token: a, meaning: f })
        else if (!a.startsWith('-')) {
          const m = argMeaning(cmd, a, i, args)
          if (m) parts.push({ token: a, meaning: m })
        }
      })
    }
    if (seg.redirect) parts.push({ token: seg.redirect.append ? '>>' : '>', meaning: OPS[seg.redirect.append ? '>>' : '>'] }, { token: seg.redirect.target, meaning: 'the file that receives it' })
    if (seg.op && OPS[seg.op]) parts.push({ token: seg.op, meaning: OPS[seg.op] })
  })
  return parts.slice(0, 10)
}

export const KNOWN_COMMANDS = Object.keys(CMD)
