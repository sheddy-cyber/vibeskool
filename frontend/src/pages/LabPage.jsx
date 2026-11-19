import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Shell } from '@/lib/shell/shell'
import { HOME } from '@/lib/shell/vfs'
import { evaluate } from '@/lib/shell/missions'
import { clamp, readNumber, useDrag, writeNumber } from '@/lib/useDrag'
import Icon from '@/components/icons/Icons'
import Terminal from '@/components/shell/Terminal'
import Explorer from '@/components/playground/Explorer'
import EditorPane from '@/components/playground/EditorPane'
import Preview from '@/components/playground/Preview'
import Guide from '@/components/playground/Guide'
import styles from './LabPage.module.css'
import { confirmDialog } from '@/lib/dialog'

const KEY = 'vibeskool_playground'
const DEFAULT_PAGE = `${HOME}/site/index.html`

const readJSON = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback } catch { return fallback } }
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }

function useMedia(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches
  const [match, setMatch] = useState(get)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

const WELCOME = [
  { text: 'This terminal runs in your browser, so nothing here can affect your computer.' },
  { text: 'You are in your home folder. Your page is in site/ and hello.js is a small script.' },
  { text: 'Type help to see every command, or open the Guide for short tasks.' },
]

const VIEWS = [
  { id: 'files', label: 'Files', icon: 'folder' },
  { id: 'code', label: 'Code', icon: 'code' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal' },
  { id: 'preview', label: 'Preview', icon: 'eye' },
  { id: 'guide', label: 'Guide', icon: 'checklist' },
]

export default function LabPage() {
  const shell = useMemo(() => new Shell({ storageKey: KEY, seed: 'playground' }), [])
  const [version, setVersion] = useState(0)
  useEffect(() => shell.subscribe(setVersion), [shell])

  // Switch to one pane at a time when the playground itself is narrow
  // (its width depends on the app sidebar, not just the window)
  const pageRef = useRef(null)
  const [pageW, setPageW] = useState(1200)
  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setPageW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const smallScreen = useMedia('(max-width: 700px)')
  const narrow = smallScreen || pageW < 920
  const [view, setView] = useState('code')

  /* Open files */
  const [files, setFiles] = useState(() => readJSON(`${KEY}_tabs`, { tabs: [DEFAULT_PAGE], active: DEFAULT_PAGE }))
  useEffect(() => writeJSON(`${KEY}_tabs`, files), [files])

  // Close tabs whose files were removed (from the terminal, for example)
  useEffect(() => {
    setFiles((f) => {
      const tabs = f.tabs.filter((t) => shell.node(t)?.type === 'file')
      if (tabs.length === f.tabs.length) return f
      return { tabs, active: tabs.includes(f.active) ? f.active : tabs[tabs.length - 1] || null }
    })
  }, [version, shell])

  /* Panels */
  const [panels, setPanels] = useState(() => readJSON(`${KEY}_panels`, { side: true, terminal: true, preview: true, sideTab: 'files' }))
  useEffect(() => writeJSON(`${KEY}_panels`, panels), [panels])
  const [termH, setTermH] = useState(() => readNumber(`${KEY}_termh`, 280))
  const [sideW, setSideW] = useState(() => clamp(readNumber(`${KEY}_sidew`, 264), 200, 460))
  const [previewFrac, setPreviewFrac] = useState(() => { const v = readNumber(`${KEY}_pvw`, 0.42); return v > 0 && v < 1 ? v : 0.42 })
  const [dragging, startDrag] = useDrag()
  useEffect(() => { if (!dragging) { writeNumber(`${KEY}_termh`, termH); writeNumber(`${KEY}_pvw`, previewFrac); writeNumber(`${KEY}_sidew`, sideW) } }, [dragging, termH, previewFrac, sideW])
  const workRef = useRef(null)
  const centerRef = useRef(null)

  /* Preview target */
  const [htmlPath, setHtmlPath] = useState(() => readJSON(`${KEY}_page`, DEFAULT_PAGE))
  useEffect(() => writeJSON(`${KEY}_page`, htmlPath), [htmlPath])
  useEffect(() => {
    if (files.active && /\.html?$/i.test(files.active)) setHtmlPath(files.active)
  }, [files.active])

  /* Tasks */
  const [done, setDone] = useState(() => new Set(readJSON(`${KEY}_done`, [])))
  const [ran, setRan] = useState([])
  const [opened, setOpened] = useState(() => new Set())
  const [logCount, setLogCount] = useState(0)
  useEffect(() => {
    const next = evaluate({ shell, ran, opened, logs: logCount }, done)
    if (next.size !== done.size) { setDone(next); writeJSON(`${KEY}_done`, [...next]) }
  }, [version, ran, opened, logCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const termRef = useRef(null)

  const openFile = useCallback((abs) => {
    setFiles((f) => ({ tabs: f.tabs.includes(abs) ? f.tabs : [...f.tabs, abs], active: abs }))
    setOpened((o) => new Set(o).add(abs))
    if (narrow) setView('code')
  }, [narrow])

  const openPreview = useCallback((abs) => {
    setHtmlPath(abs)
    if (narrow) setView('preview')
    else setPanels((p) => ({ ...p, preview: true }))
  }, [narrow])

  const closeTab = (t) => setFiles((f) => {
    const tabs = f.tabs.filter((x) => x !== t)
    const i = f.tabs.indexOf(t)
    return { tabs, active: f.active === t ? tabs[Math.max(0, i - 1)] || null : f.active }
  })

  const onRemoved = (path, renamedTo) => setFiles((f) => {
    const map = (t) => (t === path || t.startsWith(path + '/') ? (renamedTo ? renamedTo + t.slice(path.length) : null) : t)
    const tabs = f.tabs.map(map).filter(Boolean)
    return { tabs, active: f.active ? map(f.active) || tabs[tabs.length - 1] || null : null }
  })

  const focusTerminal = useCallback(() => {
    if (narrow) setView('terminal')
    else setPanels((p) => ({ ...p, terminal: true }))
    requestAnimationFrame(() => termRef.current?.focus())
  }, [narrow])

  const typeInTerminal = (cmd) => {
    if (narrow) setView('terminal')
    else setPanels((p) => ({ ...p, terminal: true }))
    setTimeout(() => termRef.current?.type(cmd), 60)
  }

  const onRan = useCallback((text, code) => setRan((r) => [...r.slice(-200), { text, code }]), [])
  const onLog = useCallback(() => setLogCount((n) => n + 1), [])

  // Ctrl + ` shows the terminal and puts the cursor in it
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === '`') { e.preventDefault(); focusTerminal() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusTerminal])

  const reset = async () => {
    const ok = await confirmDialog({
      tone: 'danger',
      title: 'Reset the playground?',
      body: 'Your files, Git history and task progress here will be deleted, and the starter files come back. This can’t be undone.',
      confirmLabel: 'Reset',
    })
    if (!ok) return
    shell.reset()
    setFiles({ tabs: [DEFAULT_PAGE], active: DEFAULT_PAGE })
    setHtmlPath(DEFAULT_PAGE)
    setDone(new Set())
    writeJSON(`${KEY}_done`, [])
    setRan([])
    setOpened(new Set())
    setLogCount(0)
    termRef.current?.clear()
  }

  /* Resizing */
  const resizePreview = (e) => startDrag(e, (ev) => {
    const r = workRef.current.getBoundingClientRect()
    setPreviewFrac(clamp((r.right - ev.clientX) / r.width, 0.22, 0.68))
  })
  const resizeSide = (e) => startDrag(e, (ev) => {
    const r = workRef.current.getBoundingClientRect()
    setSideW(clamp(Math.round(ev.clientX - r.left), 200, 460))
  })
  const resizeTerminal = (e) => startDrag(e, (ev) => {
    const r = centerRef.current.getBoundingClientRect()
    setTermH(clamp(Math.round(r.bottom - ev.clientY), 120, Math.max(160, r.height - 120)))
  }, 'row-resize')
  const nudge = (setter, step, lo, hi) => (e) => {
    const k = e.key
    if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); setter((v) => clamp(v + step, lo, hi)) }
    if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); setter((v) => clamp(v - step, lo, hi)) }
  }

  const terminal = (
    <Terminal
      ref={termRef}
      shell={shell}
      welcome={WELCOME}
      onOpenFile={openFile}
      onOpenPreview={openPreview}
      onRan={onRan}
      actions={!narrow && (
        <button type="button" className={styles.termHide} onClick={() => setPanels((p) => ({ ...p, terminal: false }))} aria-label="Hide the terminal" title="Hide (Ctrl+`)">
          <Icon name="chevronDown" size={16} />
        </button>
      )}
    />
  )
  const editor = (
    <EditorPane
      shell={shell}
      version={version}
      tabs={files.tabs}
      active={files.active}
      onActivate={(t) => setFiles((f) => ({ ...f, active: t }))}
      onClose={closeTab}
      onOpenTerminal={focusTerminal}
    />
  )
  const preview = <Preview shell={shell} version={version} htmlPath={htmlPath} onPick={setHtmlPath} onLog={onLog} />
  const explorer = <Explorer shell={shell} version={version} activePath={files.active} onOpen={openFile} onRemoved={onRemoved} />
  const guide = <Guide done={done} onType={typeInTerminal} onResetProgress={() => { setDone(new Set()); writeJSON(`${KEY}_done`, []); setRan([]); setOpened(new Set()); setLogCount(0) }} />

  const doneCount = done.size

  return (
    <div className={styles.page} ref={pageRef} data-dragging={!!dragging}>
      {dragging && <div className={styles.shield} style={{ cursor: dragging }} aria-hidden="true" />}

      <header className={styles.top}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Playground</h1>
          <span className={styles.subtitle}>Saved in this browser as you work</span>
        </div>
        {!narrow && (
          <div className={styles.toggles} role="group" aria-label="Panels">
            <button type="button" aria-pressed={panels.side} onClick={() => setPanels((p) => ({ ...p, side: !p.side }))} title={panels.side ? 'Collapse files and guide' : 'Expand files and guide'}>
              <Icon name="sidebar" size={17} /><span>Files</span>
            </button>
            <button type="button" aria-pressed={panels.terminal} onClick={() => setPanels((p) => ({ ...p, terminal: !p.terminal }))} title="Terminal (Ctrl+`)">
              <Icon name="terminal" size={17} /><span>Terminal</span>
            </button>
            <button type="button" aria-pressed={panels.preview} onClick={() => setPanels((p) => ({ ...p, preview: !p.preview }))} title="Preview">
              <Icon name="eye" size={17} /><span>Preview</span>
            </button>
          </div>
        )}
        <button type="button" className={styles.resetBtn} onClick={reset} title="Start again with the original files">
          <Icon name="reset" size={15} /> <span>Reset</span>
        </button>
      </header>

      {narrow ? (
        <>
          <nav className={styles.viewTabs} aria-label="Playground views">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => setView(v.id)}>
                <Icon name={v.icon} size={17} />
                <span>{v.label}</span>
                {v.id === 'guide' && doneCount > 0 && <em>{doneCount}</em>}
              </button>
            ))}
          </nav>
          <div className={styles.single}>
            <div className={styles.pane} hidden={view !== 'files'}><div className={styles.sideBody}>{explorer}</div></div>
            <div className={styles.pane} hidden={view !== 'code'}>{editor}</div>
            <div className={styles.pane} hidden={view !== 'terminal'}>{terminal}</div>
            <div className={styles.pane} hidden={view !== 'preview'}>{view === 'preview' && preview}</div>
            <div className={styles.pane} hidden={view !== 'guide'}><div className={styles.sideBody}>{guide}</div></div>
          </div>
        </>
      ) : (
        <div className={styles.work} ref={workRef} style={{ '--pv': `${previewFrac * 100}%`, '--th': `${termH}px`, '--sw': `${sideW}px` }}>
          <aside className={styles.side} data-collapsed={!panels.side} aria-label="Files and guide">
            {panels.side ? (
              <>
                <div className={styles.sideTabs}>
                  <div className={styles.sideTabList} role="tablist">
                    <button type="button" role="tab" aria-selected={panels.sideTab !== 'guide'} onClick={() => setPanels((p) => ({ ...p, sideTab: 'files' }))}>Files</button>
                    <button type="button" role="tab" aria-selected={panels.sideTab === 'guide'} onClick={() => setPanels((p) => ({ ...p, sideTab: 'guide' }))}>
                      Guide {doneCount > 0 && <em>{doneCount}</em>}
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.sideCollapse}
                    onClick={() => setPanels((p) => ({ ...p, side: false }))}
                    aria-label="Collapse the files panel"
                    title="Collapse"
                  >
                    <Icon name="chevronLeft" size={16} />
                  </button>
                </div>
                <div className={styles.sideBody}>{panels.sideTab === 'guide' ? guide : explorer}</div>
              </>
            ) : (
              /* Collapsed: a slim rail that opens straight to Files or Guide */
              <div className={styles.rail}>
                <button
                  type="button"
                  className={styles.railBtn}
                  onClick={() => setPanels((p) => ({ ...p, side: true }))}
                  aria-label="Expand the files panel"
                  title="Expand"
                >
                  <Icon name="chevronRight" size={16} />
                </button>
                <span className={styles.railSep} aria-hidden="true" />
                <button
                  type="button"
                  className={styles.railBtn}
                  data-active={panels.sideTab !== 'guide'}
                  onClick={() => setPanels((p) => ({ ...p, side: true, sideTab: 'files' }))}
                  aria-label="Open Files"
                  title="Files"
                >
                  <Icon name="folder" size={18} />
                </button>
                <button
                  type="button"
                  className={styles.railBtn}
                  data-active={panels.sideTab === 'guide'}
                  onClick={() => setPanels((p) => ({ ...p, side: true, sideTab: 'guide' }))}
                  aria-label={`Open Guide${doneCount ? `, ${doneCount} tasks done` : ''}`}
                  title="Guide"
                >
                  <Icon name="checklist" size={18} />
                  {doneCount > 0 && <em>{doneCount}</em>}
                </button>
              </div>
            )}
          </aside>
          {panels.side && (
            <div
              className={styles.vSplit}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize the files panel"
              aria-valuemin={200}
              aria-valuemax={460}
              aria-valuenow={sideW}
              tabIndex={0}
              onPointerDown={resizeSide}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') { e.preventDefault(); setSideW((v) => clamp(v - 24, 200, 460)) }
                if (e.key === 'ArrowRight') { e.preventDefault(); setSideW((v) => clamp(v + 24, 200, 460)) }
              }}
              onDoubleClick={() => setSideW(264)}
              title="Drag to resize. Double-click to reset."
            />
          )}

          <section className={styles.center} ref={centerRef} aria-label="Editor and terminal">
            <div className={styles.editorWrap}>{editor}</div>
            {panels.terminal && (
              <>
                <div
                  className={styles.hSplit}
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label="Resize the terminal"
                  tabIndex={0}
                  onPointerDown={resizeTerminal}
                  onKeyDown={nudge(setTermH, 24, 120, 700)}
                  onDoubleClick={() => setTermH(280)}
                />
                <div className={styles.termWrap}>{terminal}</div>
              </>
            )}
          </section>

          {panels.preview && (
            <>
              <div
                className={styles.vSplit}
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize the preview"
                tabIndex={0}
                onPointerDown={resizePreview}
                onKeyDown={nudge(setPreviewFrac, 0.04, 0.22, 0.68)}
                onDoubleClick={() => setPreviewFrac(0.42)}
              />
              <aside className={styles.previewWrap} aria-label="Preview">{preview}</aside>
            </>
          )}
        </div>
      )}
    </div>
  )
}

