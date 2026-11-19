import React, { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/components/icons/Icons'
import { HOME, dirname, basename, display } from '@/lib/shell/vfs'
import { confirmDialog } from '@/lib/dialog'
import styles from './Playground.module.css'

const EXP_KEY = 'vibeskool_playground_expanded'
const readSet = () => { try { return new Set(JSON.parse(localStorage.getItem(EXP_KEY)) || [HOME, `${HOME}/site`]) } catch { return new Set([HOME, `${HOME}/site`]) } }

export function fileKind(name) {
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : ''
  if (ext === 'html' || ext === 'htm') return 'html'
  if (ext === 'css') return 'css'
  if (['js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx'].includes(ext)) return 'js'
  if (ext === 'json') return 'json'
  if (ext === 'md') return 'md'
  return 'txt'
}

function NameInput({ initial = '', placeholder, onSubmit, onCancel, depth }) {
  const [value, setValue] = useState(initial)
  const [error, setError] = useState(null)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    const dot = initial.lastIndexOf('.')
    el.setSelectionRange(0, dot > 0 ? dot : initial.length)
  }, [initial])
  const submit = () => {
    const v = value.trim()
    if (!v) { onCancel(); return }
    const err = onSubmit(v)
    if (err) setError(err)
  }
  return (
    <div className={styles.nameRow} style={{ '--depth': depth }}>
      <input
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChange={(e) => { setValue(e.target.value); setError(null) }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); submit() }
          if (e.key === 'Escape') { e.preventDefault(); onCancel() }
        }}
        onBlur={() => (value.trim() ? submit() : onCancel())}
        spellCheck={false}
        aria-label={placeholder}
        aria-invalid={!!error}
      />
      {error && <span className={styles.nameError} role="alert">{error}</span>}
    </div>
  )
}

export default function Explorer({ shell, version, activePath, onOpen, onRemoved }) {
  const [expanded, setExpanded] = useState(readSet)
  const [editing, setEditing] = useState(null) // { mode: 'file'|'folder'|'rename', dir, path }
  // The folder that "New file" and "New folder" create in. It only changes
  // when the learner picks something in the tree, never on its own.
  const [selDir, setSelDir] = useState(HOME)

  useEffect(() => {
    try { localStorage.setItem(EXP_KEY, JSON.stringify([...expanded])) } catch { /* ignore */ }
  }, [expanded])

  // Reveal the active file's folders
  useEffect(() => {
    if (!activePath) return
    setExpanded((s) => {
      const n = new Set(s)
      let p = dirname(activePath)
      while (p.startsWith(HOME)) { n.add(p); if (p === HOME) break; p = dirname(p) }
      return n
    })
  }, [activePath])

  const root = useMemo(() => shell.node(HOME), [shell, version]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (p) => setExpanded((s) => { const n = new Set(s); if (n.has(p)) n.delete(p); else n.add(p); return n })

  const validName = (dir, name, except) => {
    if (/[/\\]/.test(name)) return 'Names can’t contain slashes.'
    if (name === '.' || name === '..') return 'Pick another name.'
    const existing = shell.node(`${dir}/${name}`)
    if (existing && `${dir}/${name}` !== except) return `${name} already exists here.`
    return null
  }

  const create = (mode, dir) => {
    setExpanded((s) => new Set(s).add(dir))
    setEditing({ mode, dir })
  }

  const remove = async (path, isDir) => {
    const name = basename(path)
    const ok = await confirmDialog({
      tone: 'danger',
      title: isDir ? `Delete the ${name} folder?` : `Delete ${name}?`,
      body: isDir ? 'Everything inside it will be deleted too. This can’t be undone.' : 'This can’t be undone.',
      confirmLabel: 'Delete',
    })
    if (!ok) return
    shell.remove(path)
    if (selDir === path || selDir.startsWith(path + '/')) setSelDir(dirname(path))
    onRemoved?.(path)
  }

  const renderDir = (node, path, depth) => {
    const entries = Object.entries(node.children)
      .filter(([name]) => name !== '.git')
      .sort(([a, x], [b, y]) => (x.type === y.type ? a.localeCompare(b) : x.type === 'dir' ? -1 : 1))
    return (
      <>
        {editing && editing.dir === path && editing.mode !== 'rename' && (
          <NameInput
            depth={depth}
            placeholder={editing.mode === 'file' ? 'File name, e.g. about.html' : 'Folder name'}
            onCancel={() => setEditing(null)}
            onSubmit={(name) => {
              const err = validName(path, name)
              if (err) return err
              const abs = `${path}/${name}`
              if (editing.mode === 'file') { shell.write(abs, ''); onOpen(abs) } else { shell.mkdir(abs); setExpanded((s) => new Set(s).add(abs)) }
              setEditing(null)
              return null
            }}
          />
        )}
        {entries.map(([name, child]) => {
          const abs = `${path}/${name}`
          const isDir = child.type === 'dir'
          const open = expanded.has(abs)
          if (editing?.mode === 'rename' && editing.path === abs) {
            return (
              <NameInput
                key={abs}
                depth={depth}
                initial={name}
                placeholder="New name"
                onCancel={() => setEditing(null)}
                onSubmit={(next) => {
                  if (next === name) { setEditing(null); return null }
                  const err = validName(path, next, abs)
                  if (err) return err
                  shell.rename(abs, `${path}/${next}`)
                  onRemoved?.(abs, `${path}/${next}`)
                  setEditing(null)
                  return null
                }}
              />
            )
          }
          const kind = isDir ? null : fileKind(name)
          return (
            <React.Fragment key={abs}>
              <div
                className={styles.row}
                style={{ '--depth': depth }}
                data-active={abs === activePath}
                data-selected={isDir && abs === selDir}
                data-dim={name === 'node_modules' || name.startsWith('.')}
              >
                <button
                  type="button"
                  className={styles.rowMain}
                  onClick={() => {
                    if (isDir) { toggle(abs); setSelDir(abs) } else { onOpen(abs); setSelDir(path) }
                  }}
                  onDoubleClick={() => setEditing({ mode: 'rename', path: abs })}
                  aria-expanded={isDir ? open : undefined}
                  title={isDir ? name : `${name} (double-click to rename)`}
                >
                  {isDir
                    ? <Icon name="chevronRight" size={13} className={styles.chev} data-open={open} />
                    : <span className={styles.chevGap} />}
                  {isDir
                    ? <Icon name={open ? 'folderOpen' : 'folder'} size={16} className={styles.folderIcon} />
                    : <Icon name="file" size={16} className={styles.fileIcon} data-kind={kind} />}
                  <span className={styles.rowName}>{name}</span>
                </button>
                <span className={styles.rowActions}>
                  {isDir && (
                    <>
                      <button type="button" onClick={() => { setSelDir(abs); create('file', abs) }} aria-label={`New file in ${name}`} title="New file here"><Icon name="filePlus" size={14} /></button>
                      <button type="button" onClick={() => { setSelDir(abs); create('folder', abs) }} aria-label={`New folder in ${name}`} title="New folder here"><Icon name="folderPlus" size={14} /></button>
                    </>
                  )}
                  <button type="button" onClick={() => setEditing({ mode: 'rename', path: abs })} aria-label={`Rename ${name}`} title="Rename"><Icon name="pen" size={14} /></button>
                  <button type="button" onClick={() => remove(abs, isDir)} aria-label={`Delete ${name}`} title="Delete"><Icon name="trash" size={14} /></button>
                </span>
              </div>
              {isDir && open && renderDir(child, abs, depth + 1)}
            </React.Fragment>
          )
        })}
      </>
    )
  }

  const targetDir = shell.node(selDir)?.type === 'dir' ? selDir : HOME
  const where = targetDir === HOME ? 'your home folder' : display(targetDir)

  return (
    <div className={styles.explorer}>
      <div className={styles.sideHead}>
        <button
          type="button"
          className={styles.sideLabel}
          data-selected={targetDir === HOME}
          onClick={() => setSelDir(HOME)}
          title="Create new files and folders in your home folder"
        >
          ~ <span>(home)</span>
        </button>
        <div className={styles.sideTools}>
          <button type="button" onClick={() => create('file', targetDir)} aria-label={`New file in ${where}`} title={`New file in ${where}`}><Icon name="filePlus" size={16} /></button>
          <button type="button" onClick={() => create('folder', targetDir)} aria-label={`New folder in ${where}`} title={`New folder in ${where}`}><Icon name="folderPlus" size={16} /></button>
          <button type="button" onClick={() => setExpanded(new Set([HOME]))} aria-label="Collapse all folders" title="Collapse all"><Icon name="collapse" size={15} /></button>
        </div>
      </div>
      <div
        className={styles.tree}
        role="tree"
        aria-label="Files"
        onClick={(e) => { if (e.target === e.currentTarget) setSelDir(HOME) }}
      >
        {root ? renderDir(root, HOME, 0) : null}
      </div>
      <p className={styles.whereNote}>
        New items go in <code>{targetDir === HOME ? '~' : display(targetDir)}</code>
        {targetDir !== HOME && <button type="button" onClick={() => setSelDir(HOME)}>Use ~ instead</button>}
      </p>
    </div>
  )
}
