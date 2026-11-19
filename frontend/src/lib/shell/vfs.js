/* In-memory file system for the playground shell.
   Nodes: { type: 'dir', children: { name: node } } | { type: 'file', content }
   Paths are absolute strings like "/home/you/site/index.html". */

export const HOME = '/home/you'

export class FsError extends Error {
  constructor(code, path) {
    super(code)
    this.code = code
    this.path = path
  }
}

export const dir = (children = {}) => ({ type: 'dir', children })
export const file = (content = '') => ({ type: 'file', content })

/** Resolve a user-typed path against the current directory. */
export function resolve(cwd, input = '') {
  let p = String(input || '').trim()
  if (p === '' || p === '~') return HOME
  if (p.startsWith('~/')) p = HOME + p.slice(1)
  else if (!p.startsWith('/')) p = `${cwd}/${p}`
  const out = []
  for (const seg of p.split('/')) {
    if (!seg || seg === '.') continue
    if (seg === '..') out.pop()
    else out.push(seg)
  }
  return '/' + out.join('/')
}

export function segments(abs) {
  return abs.split('/').filter(Boolean)
}

export function basename(abs) {
  const s = segments(abs)
  return s[s.length - 1] || '/'
}

export function dirname(abs) {
  const s = segments(abs)
  s.pop()
  return '/' + s.join('/')
}

export function display(abs) {
  if (abs === HOME) return '~'
  if (abs.startsWith(HOME + '/')) return '~' + abs.slice(HOME.length)
  return abs
}

/** Path relative to a base directory ("site/index.html") */
export function relative(base, abs) {
  if (abs === base) return '.'
  return abs.startsWith(base + '/') ? abs.slice(base.length + 1) : abs
}

export function get(root, abs) {
  let node = root
  for (const seg of segments(abs)) {
    if (!node || node.type !== 'dir') return null
    node = node.children[seg]
  }
  return node || null
}

function parentDir(root, abs) {
  const parent = get(root, dirname(abs))
  if (!parent) throw new FsError('ENOENT', dirname(abs))
  if (parent.type !== 'dir') throw new FsError('ENOTDIR', dirname(abs))
  return parent
}

export function mkdir(root, abs, { parents = false } = {}) {
  if (parents) {
    let node = root
    for (const seg of segments(abs)) {
      if (!node.children[seg]) node.children[seg] = dir()
      node = node.children[seg]
      if (node.type !== 'dir') throw new FsError('ENOTDIR', abs)
    }
    return
  }
  const parent = parentDir(root, abs)
  const name = basename(abs)
  if (parent.children[name]) throw new FsError('EEXIST', abs)
  parent.children[name] = dir()
}

export function writeFile(root, abs, content, { append = false } = {}) {
  const parent = parentDir(root, abs)
  const name = basename(abs)
  const existing = parent.children[name]
  if (existing && existing.type === 'dir') throw new FsError('EISDIR', abs)
  if (existing && append) existing.content += content
  else if (existing) existing.content = content
  else parent.children[name] = file(content)
}

export function touch(root, abs) {
  const node = get(root, abs)
  if (node) return
  writeFile(root, abs, '')
}

export function readFile(root, abs) {
  const node = get(root, abs)
  if (!node) throw new FsError('ENOENT', abs)
  if (node.type === 'dir') throw new FsError('EISDIR', abs)
  return node.content
}

export function remove(root, abs, { recursive = false } = {}) {
  if (abs === '/') throw new FsError('EPERM', abs)
  const parent = parentDir(root, abs)
  const name = basename(abs)
  const node = parent.children[name]
  if (!node) throw new FsError('ENOENT', abs)
  if (node.type === 'dir' && !recursive) throw new FsError('EISDIR', abs)
  delete parent.children[name]
}

const clone = (node) => JSON.parse(JSON.stringify(node))

export function copy(root, src, dst, { recursive = false } = {}) {
  const node = get(root, src)
  if (!node) throw new FsError('ENOENT', src)
  if (node.type === 'dir' && !recursive) throw new FsError('EISDIR', src)
  let target = dst
  const existing = get(root, dst)
  if (existing && existing.type === 'dir') target = `${dst}/${basename(src)}`
  if (target === src || target.startsWith(src + '/')) throw new FsError('EINVAL', dst)
  const parent = parentDir(root, target)
  parent.children[basename(target)] = clone(node)
}

export function move(root, src, dst) {
  const node = get(root, src)
  if (!node) throw new FsError('ENOENT', src)
  let target = dst
  const existing = get(root, dst)
  if (existing && existing.type === 'dir') target = `${dst}/${basename(src)}`
  if (target === src) return target
  if (target.startsWith(src + '/')) throw new FsError('EINVAL', dst)
  const parent = parentDir(root, target)
  parent.children[basename(target)] = node
  delete parentDir(root, src).children[basename(src)]
  return target
}

/** Sorted directory listing: folders first, then files, alphabetical. */
export function list(root, abs) {
  const node = get(root, abs)
  if (!node) throw new FsError('ENOENT', abs)
  if (node.type !== 'dir') return [{ name: basename(abs), type: 'file', node }]
  return Object.entries(node.children)
    .map(([name, n]) => ({ name, type: n.type, node: n }))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1))
}

/** Every file under a directory as { rel: content } (skipping names in `skip`). */
export function snapshot(root, base, skip = []) {
  const out = {}
  const walk = (node, rel) => {
    if (node.type === 'file') { out[rel] = node.content; return }
    for (const [name, child] of Object.entries(node.children)) {
      if (skip.includes(name)) continue
      walk(child, rel ? `${rel}/${name}` : name)
    }
  }
  const start = get(root, base)
  if (start) walk(start, '')
  return out
}

export function size(node) {
  if (!node) return 0
  if (node.type === 'file') return new Blob([node.content]).size
  return 4096
}
