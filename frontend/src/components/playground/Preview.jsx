import React, { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/components/icons/Icons'
import { HOME, dirname, resolve, display, relative } from '@/lib/shell/vfs'
import styles from './Playground.module.css'

/* Live preview of an HTML file from the playground. Linked stylesheets and
   scripts are read from the virtual files and inlined, console output from
   the page is captured, and it refreshes as you type. */

function bridge(token) {
  return `<script>(function(){var T=${JSON.stringify(token)};function f(x){if(typeof x==='string')return x;try{return JSON.stringify(x)}catch(e){return String(x)}}function s(k,a){try{parent.postMessage({__vsp:T,kind:k,text:[].map.call(a,f).join(' ')},'*')}catch(e){}}['log','info','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){s(k,arguments);if(o)o.apply(console,arguments)}});window.addEventListener('error',function(e){s('error',[e.message+(e.lineno?' (line '+e.lineno+')':'')])});document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a&&!/^(#|javascript:)/.test(a.getAttribute('href'))){e.preventDefault();s('info',['Link to '+a.getAttribute('href')+' (links are not followed in the preview)'])}},true);})();<\/script>`
}

function buildDoc(shell, htmlPath, token) {
  const html = shell.read(htmlPath)
  if (html == null) return null
  const base = dirname(htmlPath)
  const local = (href) => href && !/^(https?:)?\/\//i.test(href) && !href.startsWith('data:')
  let doc = html.replace(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi, (tag) => {
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1]
    if (!local(href)) return tag
    const css = shell.read(resolve(base, href))
    return css == null ? `<!-- ${href} not found -->` : `<style data-file="${href}">\n${css}\n</style>`
  })
  doc = doc.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (tag, pre, src, post) => {
    if (!local(src)) return tag
    const js = shell.read(resolve(base, src))
    if (js == null) return `<script>console.error("Couldn't load ${src}: file not found")<\/script>`
    return `<script${pre}${post}>\n${js.replace(/<\/script/gi, '<\\/script')}\n<\/script>`
  })
  if (/<head[^>]*>/i.test(doc)) return doc.replace(/<head[^>]*>/i, (m) => `${m}${bridge(token)}`)
  return bridge(token) + doc
}

function htmlFiles(shell) {
  const out = []
  const walk = (node, path) => {
    for (const [name, child] of Object.entries(node.children)) {
      if (name === 'node_modules' || name === '.git') continue
      const abs = `${path}/${name}`
      if (child.type === 'dir') walk(child, abs)
      else if (/\.html?$/i.test(name)) out.push(abs)
    }
  }
  const root = shell.node(HOME)
  if (root) walk(root, HOME)
  return out.sort()
}

export default function Preview({ shell, version, htmlPath, onPick, onLog }) {
  const [auto, setAuto] = useState(true)
  const [run, setRun] = useState(null)
  const [logs, setLogs] = useState([])
  const [consoleOpen, setConsoleOpen] = useState(false)
  const frameRef = useRef(null)
  const lastDoc = useRef(null)
  const files = useMemo(() => htmlFiles(shell), [shell, version]) // eslint-disable-line react-hooks/exhaustive-deps

  const load = (force) => {
    const token = Math.random().toString(36).slice(2)
    const doc = buildDoc(shell, htmlPath, token)
    const same = doc?.split(token).join('') ?? null
    if (!force && same === lastDoc.current) return
    lastDoc.current = same
    setLogs([])
    setRun({ token, doc })
  }
  const reload = () => load(true)

  // First load and file changes
  useEffect(() => { reload() }, [htmlPath]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => load(false), 450)
    return () => clearTimeout(t)
  }, [version, auto]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!run) return
    const onMsg = (e) => {
      if (e.source !== frameRef.current?.contentWindow || e.data?.__vsp !== run.token) return
      setLogs((l) => [...l.slice(-199), { kind: e.data.kind, text: e.data.text, at: new Date() }])
      onLog?.()
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [run, onLog])

  const errors = logs.filter((l) => l.kind === 'error').length

  return (
    <div className={styles.preview}>
      <div className={styles.pvBar}>
        <button type="button" className={styles.pvBtn} onClick={reload} aria-label="Reload the preview" title="Reload">
          <Icon name="reset" size={15} />
        </button>
        <label className={styles.address}>
          <span className={styles.addrHost}>localhost:5173/</span>
          <select value={htmlPath} onChange={(e) => onPick(e.target.value)} aria-label="Page to preview">
            {files.length === 0 && <option value={htmlPath}>{relative(HOME, htmlPath)}</option>}
            {files.map((f) => <option key={f} value={f}>{relative(`${HOME}/site`, f).startsWith('/') ? display(f) : relative(`${HOME}/site`, f)}</option>)}
          </select>
          <Icon name="chevronDown" size={13} />
        </label>
        <button
          type="button"
          className={styles.pvToggle}
          aria-pressed={auto}
          onClick={() => setAuto((a) => !a)}
          title={auto ? 'Updates as you type' : 'Updates when you press reload'}
        >
          <span className={styles.liveDot} aria-hidden="true" /> {auto ? 'Live' : 'Paused'}
        </button>
      </div>

      <div className={styles.pvStage}>
        {run?.doc ? (
          <iframe
            key={run.token}
            ref={frameRef}
            title="Page preview"
            sandbox="allow-scripts allow-modals allow-forms"
            srcDoc={run.doc}
            className={styles.pvFrame}
          />
        ) : (
          <div className={styles.pvEmpty}>
            <Icon name="eye" size={22} />
            <p>No page to show. Create an .html file, or pick one above.</p>
          </div>
        )}
      </div>

      <div className={styles.console} data-open={consoleOpen}>
        <button type="button" className={styles.consoleHead} onClick={() => setConsoleOpen((o) => !o)} aria-expanded={consoleOpen}>
          <Icon name="terminal" size={14} />
          Console
          {logs.length > 0 && <span className={`${styles.badge} ${errors ? styles.badgeErr : ''}`}>{logs.length}</span>}
          <Icon name="chevronDown" size={14} className={styles.consoleChev} />
        </button>
        {consoleOpen && (
          <div className={styles.consoleBody} role="log">
            {logs.length === 0 ? (
              <p className={styles.consoleEmpty}>Messages from console.log() in your page appear here.</p>
            ) : logs.map((l, i) => (
              <div key={i} className={styles.logLine} data-kind={l.kind}>
                <span>{l.text}</span>
                <time>{l.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
