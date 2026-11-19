import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { contentApi, exerciseApi, progressApi } from '@/lib/api'
import { buildPathModel, splitTitle } from '@/lib/learning'
import { inlineTokens, parseMission, promptParts, scratchLanguage, slug, splitParagraphs } from '@/lib/lessonText'
import Icon from '@/components/icons/Icons'
import CodeBlock, { CopyButton } from '@/components/lesson/CodeBlock'
import Scratchpad from '@/components/lesson/Scratchpad'
import Tutor from '@/components/lesson/Tutor'
import StudentIDE from '@/components/ide/StudentIDE'
import FriendlyTerminal from '@/components/terminal/FriendlyTerminal'
import { clamp, readNumber, useDrag, writeNumber } from '@/lib/useDrag'
import styles from './LessonPage.module.css'

const lessonHref = (pathId, lessonId) => `/app/paths/${pathId}/lessons/${lessonId}`

/* Practice panel width */
const DOCK_DEFAULT = 460
const DOCK_MIN = 360
const DOCK_KEY = 'vibeskool_dock_w'

/** Widest the panel may get while leaving a readable column of text */
function dockLimit() {
  if (typeof window === 'undefined') return 900
  const nav = document.querySelector('aside[aria-label="App navigation"]')
  const navW = window.innerWidth > 900 && nav ? nav.getBoundingClientRect().width : 0
  return Math.max(DOCK_MIN, window.innerWidth - navW - 380)
}

/* ── Small pieces ──────────────────────────────────────────── */

function Prose({ text }) {
  return splitParagraphs(text).map((p, i) => (
    <p key={i} className={styles.para}>
      {inlineTokens(p).map((t, j) => (t.type === 'code' ? <code key={j}>{t.text}</code> : <React.Fragment key={j}>{t.text}</React.Fragment>))}
    </p>
  ))
}

function splitMek(mek) {
  const s = String(mek || '').trim().replace(/\.$/, '')
  const m = /^(enough to)\s+(.*)$/i.exec(s)
  return m ? { lead: m[1], rest: m[2] } : { lead: null, rest: s }
}

function CommandLine({ cmd }) {
  return (
    <div className={styles.cmd}>
      <code><span className={styles.cmdPrompt} aria-hidden="true">$</span>{cmd}</code>
      <CopyButton text={cmd} className={styles.cmdCopy} />
    </div>
  )
}

function PartHead({ id, n, icon, title, sub }) {
  return (
    <div className={styles.partHead} id={id}>
      <span className={styles.partIcon} aria-hidden="true"><Icon name={icon} size={20} /></span>
      <div>
        <span className={styles.partKicker}>Part {n}</span>
        <h2 className={styles.partTitle}>{title}</h2>
        {sub && <p className={styles.partSub}>{sub}</p>}
      </div>
    </div>
  )
}

/* The three logo bars rising, shown when a lesson is complete */
function DoneMark() {
  return (
    <svg viewBox="0 0 32 32" width="44" height="44" className={styles.doneMark} aria-hidden="true">
      <g transform="rotate(-12 16 16)">
        <rect x="5.95" y="9.5" width="5.2" height="13" rx="2.6" fill="#F2553D" />
        <rect x="13.4" y="4" width="5.2" height="24" rx="2.6" fill="#1A73E8" />
        <rect x="20.85" y="7.5" width="5.2" height="17" rx="2.6" fill="#1FA463" />
      </g>
    </svg>
  )
}

function Mission({ mission, onOpenScratch }) {
  if (!mission) return null
  return (
    <div className={styles.tryCard}>
      {mission.kind === 'commands' && (
        <>
          {mission.intro && <p className={styles.tryIntro}>{mission.intro}</p>}
          <ol className={styles.steps}>
            {mission.steps.map((s, i) => (
              <li key={i} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <div className={styles.stepBody}>
                  <CommandLine cmd={s.cmd} />
                  {s.note && <p className={styles.stepNote}>{s.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {mission.kind === 'chain' && (
        <>
          {mission.intro && <p className={styles.tryIntro}>{mission.intro}.</p>}
          <ol className={styles.chain}>
            {mission.steps.map((s, i) => (
              <li key={i}>
                <span className={styles.stepNum}>{i + 1}</span>
                {s.isCmd ? <CommandLine cmd={s.text} /> : <span className={styles.chainText}>{s.text.charAt(0).toUpperCase() + s.text.slice(1)}</span>}
              </li>
            ))}
          </ol>
          {mission.outro && <p className={styles.tryOutro}>{mission.outro}</p>}
        </>
      )}

      {mission.kind === 'task' && (
        <div className={styles.task}>
          <p className={styles.taskMain}>{mission.task}</p>
          {mission.detail && <p className={styles.taskDetail}>{mission.detail}</p>}
        </div>
      )}

      <div className={styles.tryFoot}>
        <span>Rather practise in the browser?</span>
        <button type="button" className={styles.linkBtn} onClick={onOpenScratch}>
          <Icon name="code" size={16} /> Open the scratchpad
        </button>
      </div>
    </div>
  )
}

function PromptCard({ prompt, onAsk }) {
  const parts = promptParts(prompt)
  const hasSlots = parts.some((p) => p.type === 'slot')
  return (
    <div className={styles.promptCard}>
      <div className={styles.promptTop}>
        <span className={styles.promptLabel}><Icon name="prompt" size={16} /> Prompt</span>
        <CopyButton text={prompt} label="Copy prompt" />
      </div>
      <p className={styles.promptText}>
        {parts.map((p, i) => (p.type === 'slot'
          ? <mark key={i} className={styles.slot}>{p.text}</mark>
          : <React.Fragment key={i}>{p.text}</React.Fragment>))}
      </p>
      {hasSlots && <p className={styles.slotHint}>Swap anything in brackets for your own details before you send it.</p>}
      <div className={styles.promptFoot}>
        <button type="button" className={styles.btnPrimary} onClick={onAsk}>
          <Icon name="send" size={16} /> Ask the tutor
        </button>
        <span className={styles.promptNote}>or paste it into any AI tool you use</span>
      </div>
    </div>
  )
}

/* ── Loading / missing ─────────────────────────────────────── */

function Skeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading lesson">
      <div className={styles.topbar} />
      <div className={styles.skel}>
        <span style={{ width: 180 }} />
        <span style={{ width: '80%', height: 36 }} />
        <span style={{ width: '100%', height: 96, borderRadius: 14 }} />
        <span style={{ width: '92%' }} />
        <span style={{ width: '96%' }} />
        <span style={{ width: '70%' }} />
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

const DOCK_TABS = [
  { id: 'scratch', label: 'Scratchpad', icon: 'code' },
  { id: 'exercise', label: 'Exercises', icon: 'checklist' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal' },
  { id: 'tutor', label: 'Tutor', icon: 'chat' },
]

export default function LessonPage() {
  const { pathId: paramPathId, lessonId: paramLessonId, id } = useParams()
  const lessonId = paramLessonId || id
  const navigate = useNavigate()
  const { paths, fetchPaths, progress, passedModules, fetchProgress, streak } = useStore()

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exerciseCount, setExerciseCount] = useState(0)

  const [dockOpen, setDockOpen] = useState(false)
  const [dockW, setDockW] = useState(() => readNumber(DOCK_KEY, DOCK_DEFAULT))
  const [dockWide, setDockWide] = useState(false)
  const [dockMax, setDockMax] = useState(dockLimit)
  const [dragging, startDrag] = useDrag()
  const [tab, setTab] = useState('scratch')
  const [visited, setVisited] = useState(() => new Set())
  const [pending, setPending] = useState(null)

  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState(null)
  const [justDone, setJustDone] = useState(false)

  const [activeId, setActiveId] = useState(null)
  const [readPct, setReadPct] = useState(0)
  const articleRef = useRef(null)

  useEffect(() => { if (!paths?.length) fetchPaths() }, [paths?.length, fetchPaths])

  // Load the lesson (and whether it has graded exercises)
  useEffect(() => {
    if (!lessonId) return
    let alive = true
    setLoading(true)
    setJustDone(false)
    setCompleteError(null)
    setPending(null)
    contentApi.getLesson(lessonId)
      .then((d) => alive && setLesson(d.lesson))
      .catch(() => alive && setLesson(null))
      .finally(() => alive && setLoading(false))
    exerciseApi.list(lessonId)
      .then((d) => alive && setExerciseCount((d.exercises || []).length))
      .catch(() => alive && setExerciseCount(0))
    window.scrollTo(0, 0)
    return () => { alive = false }
  }, [lessonId])

  /* Where this lesson sits in its path */
  const path = useMemo(() => (
    paramPathId
      ? (paths || []).find((p) => p.id === paramPathId)
      : (paths || []).find((p) => p.lessons_data?.some((l) => l.id === lessonId))
  ), [paths, paramPathId, lessonId])

  const completedIds = useMemo(() => new Set(Object.values(progress || {}).flat()), [progress])
  const model = useMemo(
    () => buildPathModel(path, completedIds, new Set(passedModules || [])),
    [path, completedIds, passedModules],
  )
  const here = model?.lessons.find((l) => l.id === lessonId) || null
  const mod = here ? model.modules.find((m) => m.index === here.moduleIndex) : null
  const indexInModule = mod ? mod.lessons.findIndex((l) => l.id === lessonId) : -1
  const prev = here ? model.lessons[here.order - 1] : null
  const next = here ? model.lessons[here.order + 1] : null
  const isDone = completedIds.has(lessonId)
  const moduleDone = mod ? mod.lessons.every((l) => l.done || (l.id === lessonId && isDone)) : false
  const pathId = path?.id || paramPathId

  /* Content */
  const sections = useMemo(() => {
    if (!lesson) return []
    const raw = Array.isArray(lesson.sections)
      ? lesson.sections
      : lesson.content_json?.sections || (Array.isArray(lesson.content_json) ? lesson.content_json : [])
    return raw.map((s, i) => ({ ...s, anchor: slug(s.heading, i) }))
  }, [lesson])
  const mission = useMemo(() => parseMission(lesson?.terminalMission), [lesson])
  const prompt = typeof lesson?.aiPrompt === 'string' ? lesson.aiPrompt.trim() : ''
  const mek = splitMek(lesson?.mekLabel || here?.mekLabel)
  const { main, sub } = splitTitle(lesson?.title || '')

  const toc = useMemo(() => [
    ...sections.map((s, i) => ({ id: s.anchor, label: s.heading || `Part ${i + 1}`, n: i + 1 })),
    ...(mission ? [{ id: 'try-it', label: 'Try it yourself', part: true }] : []),
    ...(prompt ? [{ id: 'ask-ai', label: 'Ask AI', part: true }] : []),
    { id: 'finish', label: isDone ? 'Lesson complete' : 'Finish the lesson', part: true },
  ], [sections, mission, prompt, isDone])

  /* How far through the lesson the reader is, and which part is on screen */
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = articleRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const total = r.height - window.innerHeight * 0.5
        setReadPct(Math.max(0, Math.min(1, (-r.top + window.innerHeight * 0.2) / Math.max(1, total))))

        // The last heading that has passed the reading line is the current one;
        // at the very bottom of the page, the last part wins.
        const line = window.innerHeight * 0.32
        const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
        let current = null
        for (const t of toc) {
          const node = document.getElementById(t.id)
          if (node && node.getBoundingClientRect().top <= line) current = t.id
        }
        if (atEnd && toc.length) current = toc[toc.length - 1].id
        setActiveId(current)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [loading, toc])

  /* Dock */
  useEffect(() => {
    const onResize = () => setDockMax(dockLimit())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  useEffect(() => { setDockMax(dockLimit()) }, [dockOpen])
  useEffect(() => { if (!dragging) writeNumber(DOCK_KEY, dockW) }, [dragging, dockW])

  const dockWidth = dockWide ? dockMax : clamp(dockW, DOCK_MIN, dockMax)
  const resizeDock = (e) => {
    setDockWide(false)
    startDrag(e, (ev) => setDockW(clamp(Math.round(window.innerWidth - ev.clientX), DOCK_MIN, dockLimit())))
  }
  const nudgeDock = (e) => {
    const step = e.shiftKey ? 80 : 24
    const set = (w) => { setDockWide(false); setDockW(clamp(w, DOCK_MIN, dockMax)) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); set(dockWidth + step) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); set(dockWidth - step) }
    else if (e.key === 'Home') { e.preventDefault(); set(DOCK_MIN) }
    else if (e.key === 'End') { e.preventDefault(); setDockWide(true) }
  }

  const openDock = useCallback((t) => {
    setTab(t)
    setVisited((v) => new Set(v).add(t))
    setDockOpen(true)
  }, [])
  const toggleDock = (t) => {
    if (dockOpen && tab === t) setDockOpen(false)
    else openDock(t)
  }
  const askTutor = (text) => {
    setPending({ id: Date.now(), text })
    openDock('tutor')
  }

  useEffect(() => {
    if (!dockOpen) return
    const onKey = (e) => {
      if (e.key !== 'Escape' || e.target?.closest?.('.cm-editor')) return
      setDockOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dockOpen])

  const jump = (anchor) => {
    const el = document.getElementById(anchor)
    if (!el) return
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-top')) || 0
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset - 84, behavior: 'smooth' })
  }

  async function complete() {
    if (isDone || completing) return
    setCompleting(true)
    setCompleteError(null)
    try {
      await progressApi.completeLesson(lessonId, pathId)
      await fetchProgress()
      setJustDone(true)
    } catch (err) {
      setCompleteError(err?.message || "We couldn't save that. Try again.")
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return <Skeleton />

  if (!lesson) {
    return (
      <div className={styles.page}>
        <div className={styles.missing}>
          <h1>We couldn't find that lesson</h1>
          <p>It may have moved. Pick it again from the path.</p>
          <button type="button" className={styles.btnPrimary} onClick={() => navigate(pathId ? `/app/paths/${pathId}` : '/app/paths')}>
            <Icon name="arrowLeft" size={16} /> Back to the path
          </button>
        </div>
      </div>
    )
  }

  const tabs = DOCK_TABS.filter((t) => t.id !== 'exercise' || exerciseCount > 0)

  return (
    <div
      className={`${styles.page} ${dockOpen ? styles.withDock : ''}`}
      style={{ '--dock-w': `${dockWidth}px` }}
      data-dragging={!!dragging}
    >
      {dragging && <div className={styles.dragShield} style={{ cursor: dragging }} aria-hidden="true" />}
      {/* ── Top bar ───────────────────────────────────────── */}
      <div className={styles.topbar}>
        <div className={styles.topInner}>
          <Link to={pathId ? `/app/paths/${pathId}` : '/app/paths'} className={styles.backLink}>
            <Icon name="arrowLeft" size={16} />
            <span className={styles.backText}>
              {mod ? <><span className={styles.backMod}>Module {mod.index + 1}</span> {mod.title}</> : (path?.name || 'All paths')}
            </span>
          </Link>

          {mod && mod.lessons.length > 1 && (
            <nav className={styles.lessonDots} aria-label="Lessons in this module">
              {mod.lessons.map((l, i) => (
                <Link
                  key={l.id}
                  to={lessonHref(pathId, l.id)}
                  className={styles.dot}
                  data-state={l.id === lessonId ? 'here' : l.done ? 'done' : 'todo'}
                  title={`${i + 1}. ${l.title}`}
                  aria-label={`Lesson ${i + 1}: ${l.title}${l.done ? ' (done)' : ''}`}
                  aria-current={l.id === lessonId ? 'page' : undefined}
                />
              ))}
              <span className={styles.dotsLabel}>{indexInModule + 1} of {mod.lessons.length}</span>
            </nav>
          )}

          <div className={styles.topActions}>
            <div className={styles.pager}>
              <button type="button" className={styles.iconBtn} disabled={!prev} onClick={() => prev && navigate(lessonHref(pathId, prev.id))} aria-label="Previous lesson" title={prev ? `Previous: ${prev.title}` : undefined}>
                <Icon name="chevronLeft" size={18} />
              </button>
              <button type="button" className={styles.iconBtn} disabled={!next} onClick={() => next && navigate(lessonHref(pathId, next.id))} aria-label="Next lesson" title={next ? `Next: ${next.title}` : undefined}>
                <Icon name="chevronRight" size={18} />
              </button>
            </div>
            <span className={styles.topSep} aria-hidden="true" />
            <button type="button" className={styles.toolBtn} data-on={dockOpen && tab !== 'tutor'} onClick={() => toggleDock(tab !== 'tutor' ? tab : 'scratch')} aria-pressed={dockOpen && tab !== 'tutor'}>
              <Icon name="code" size={17} /><span>Practise</span>
            </button>
            <button type="button" className={styles.toolBtn} data-on={dockOpen && tab === 'tutor'} onClick={() => toggleDock('tutor')} aria-pressed={dockOpen && tab === 'tutor'}>
              <Icon name="chat" size={17} /><span>Ask the tutor</span>
            </button>
          </div>
        </div>
        <div className={styles.readBar} style={{ transform: `scaleX(${readPct})` }} aria-hidden="true" />
      </div>

      {/* ── Reading ───────────────────────────────────────── */}
      <div className={styles.body}>
        <article className={styles.article} ref={articleRef}>
          <header className={styles.head}>
            <div className={styles.kicker}>
              {mod && <span>Lesson {indexInModule + 1} of {mod.lessons.length}</span>}
              {lesson.duration && <span className={styles.kickTime}><Icon name="clock" size={15} /> {lesson.duration}</span>}
              {isDone && <span className={styles.kickDone}><Icon name="check" size={14} /> Completed</span>}
            </div>
            <h1 className={styles.title}>{main}</h1>
            {sub && <p className={styles.subtitle}>{sub}</p>}

            {mek.rest && (
              <div className={styles.goal}>
                <span className={styles.goalLabel}><Icon name="target" size={15} /> You'll learn</span>
                <p className={styles.goalText}>
                  {mek.lead && <span className={styles.enough}>{mek.lead}</span>} {mek.rest}.
                </p>
              </div>
            )}

            <nav className={styles.anatomy} aria-label="Lesson parts">
              <button type="button" onClick={() => jump(sections[0]?.anchor)}>
                <Icon name="book" size={17} /> The idea
                <span>{sections.length} {sections.length === 1 ? 'part' : 'parts'}</span>
              </button>
              {mission && (
                <button type="button" onClick={() => jump('try-it')}>
                  <Icon name="terminal" size={17} /> Try it yourself
                </button>
              )}
              {prompt && (
                <button type="button" onClick={() => jump('ask-ai')}>
                  <Icon name="prompt" size={17} /> Ask AI
                </button>
              )}
            </nav>
          </header>

          {/* Part 1: the idea */}
          <PartHead n={1} icon="book" title="The idea" sub="Read it in order. Each part builds on the one before." />
          {sections.length > 0 ? sections.map((s, i) => (
            <section key={s.anchor} id={s.anchor} className={styles.section}>
              {s.heading && (
                <h3 className={styles.h}>
                  <span className={styles.hNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.heading}</span>
                </h3>
              )}
              {s.body && <Prose text={s.body} />}
              {s.callout && (
                <aside className={styles.note}>
                  <span className={styles.noteIcon} aria-hidden="true"><Icon name="note" size={18} /></span>
                  <div>
                    <span className={styles.noteLabel}>Worth knowing</span>
                    <Prose text={s.callout} />
                  </div>
                </aside>
              )}
              {s.code && <CodeBlock code={s.code} />}
            </section>
          )) : (
            <p className={styles.para}>This lesson's reading is on its way. Use the scratchpad and the tutor in the meantime.</p>
          )}

          {/* Part 2: try it */}
          {mission && (
            <section className={styles.part}>
              <PartHead
                id="try-it"
                n={2}
                icon="terminal"
                title="Try it yourself"
                sub={mission.kind === 'task' ? 'A small task to do on your own machine.' : 'In your own terminal. Read each result before the next step.'}
              />
              <Mission mission={mission} onOpenScratch={() => openDock('scratch')} />
            </section>
          )}

          {/* Part 3: ask AI */}
          {prompt && (
            <section className={styles.part}>
              <PartHead id="ask-ai" n={mission ? 3 : 2} icon="prompt" title="Ask AI" sub="A ready-made prompt that gets you a useful answer." />
              <PromptCard prompt={prompt} onAsk={() => askTutor(prompt)} />
              <p className={styles.readTip}>
                When the answer comes back, check it against what you just learned before you use it.
                That habit is the point of this lesson.
              </p>
            </section>
          )}

          {/* Finish */}
          <section id="finish" className={styles.finish}>
            {!isDone ? (
              <div className={styles.finishCard}>
                <div>
                  <h2 className={styles.finishTitle}>That's the lesson.</h2>
                  <p className={styles.finishText}>
                    Mark it complete to save your progress
                    {streak?.current > 0 ? ` and keep your ${streak.current}-day streak going.` : '.'}
                  </p>
                  {completeError && <p className={styles.finishError} role="alert">{completeError}</p>}
                </div>
                <button type="button" className={`${styles.btnPrimary} ${styles.btnLg}`} onClick={complete} disabled={completing}>
                  <Icon name="check" size={17} /> {completing ? 'Saving…' : 'Mark lesson complete'}
                </button>
              </div>
            ) : (
              <div className={`${styles.finishCard} ${styles.finishDone}`} data-fresh={justDone}>
                <div className={styles.doneTop}>
                  <DoneMark />
                  <div>
                    <h2 className={styles.finishTitle}>Lesson complete</h2>
                    {mek.rest && (
                      <p className={styles.finishText}>
                        You now know {mek.lead ? 'enough to ' : ''}{mek.rest}.
                      </p>
                    )}
                  </div>
                </div>

                {moduleDone && mod && !mod.passed ? (
                  <div className={styles.upNext}>
                    <span className={styles.upLabel}>Module {mod.index + 1} is done</span>
                    <span className={styles.upTitle}>Take the skill check</span>
                    <span className={styles.upMeta}>A few questions to confirm {mod.title} stuck.</span>
                    <div className={styles.upActions}>
                      <Link to={`/app/paths/${pathId}/modules/${mod.id}/skill-check`} className={styles.btnPrimary}>
                        Start the skill check <Icon name="arrowRight" size={16} />
                      </Link>
                      {next && <Link to={lessonHref(pathId, next.id)} className={styles.btnGhost}>Skip to the next lesson</Link>}
                    </div>
                  </div>
                ) : next ? (
                  <Link to={lessonHref(pathId, next.id)} className={styles.upNext} data-link>
                    <span className={styles.upLabel}>Up next{next.duration ? ` · ${next.duration}` : ''}</span>
                    <span className={styles.upTitle}>{splitTitle(next.title).main}</span>
                    {next.mekLabel && <span className={styles.upMeta}>{next.mekLabel.charAt(0).toUpperCase() + next.mekLabel.slice(1)}</span>}
                    <span className={styles.upGo}>Start the next lesson <Icon name="arrowRight" size={16} /></span>
                  </Link>
                ) : (
                  <div className={styles.upNext}>
                    <span className={styles.upLabel}>Last lesson</span>
                    <span className={styles.upTitle}>You've reached the end of {path?.name || 'this path'}</span>
                    <div className={styles.upActions}>
                      <Link to={`/app/paths/${pathId}`} className={styles.btnPrimary}>Back to the path</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Previous / next */}
          {(prev || next) && (
            <nav className={styles.pagerCards} aria-label="More lessons">
              {prev ? (
                <Link to={lessonHref(pathId, prev.id)} className={styles.pageCard}>
                  <span className={styles.pageDir}><Icon name="arrowLeft" size={15} /> Previous</span>
                  <span className={styles.pageTitle}>{splitTitle(prev.title).main}</span>
                </Link>
              ) : <span />}
              {next && (
                <Link to={lessonHref(pathId, next.id)} className={`${styles.pageCard} ${styles.pageNext}`}>
                  <span className={styles.pageDir}>Next <Icon name="arrowRight" size={15} /></span>
                  <span className={styles.pageTitle}>{splitTitle(next.title).main}</span>
                </Link>
              )}
            </nav>
          )}
        </article>

        {/* ── On this page ─────────────────────────────────── */}
        <aside className={styles.rail} aria-label="On this page">
          <div className={styles.railInner}>
            <span className={styles.railLabel}><Icon name="list" size={15} /> On this page</span>
            <ol className={styles.toc}>
              {toc.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => jump(t.id)}
                    className={styles.tocItem}
                    data-active={activeId === t.id}
                    data-part={!!t.part}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ol>
            <div className={styles.railMeter}>
              <span style={{ transform: `scaleX(${readPct})` }} />
            </div>
            <span className={styles.railPct}>{Math.round(readPct * 100)}% read</span>
          </div>
        </aside>
      </div>

      {/* ── Practice dock ─────────────────────────────────── */}
      {dockOpen && <div className={styles.scrim} onClick={() => setDockOpen(false)} aria-hidden="true" />}
      <aside className={styles.dock} data-open={dockOpen} aria-label="Practice" aria-hidden={!dockOpen}>
        <div
          className={styles.dockGrip}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize practice panel"
          aria-valuemin={DOCK_MIN}
          aria-valuemax={dockMax}
          aria-valuenow={dockWidth}
          tabIndex={dockOpen ? 0 : -1}
          onPointerDown={resizeDock}
          onKeyDown={nudgeDock}
          onDoubleClick={() => { setDockWide(false); setDockW(DOCK_DEFAULT) }}
          title="Drag to resize. Double-click to reset."
        />
        <div className={styles.dockHead}>
          <div className={styles.dockTabs} role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={tab === t.id ? styles.dockTabOn : undefined}
                onClick={() => openDock(t.id)}
              >
                <Icon name={t.icon} size={16} /> <span>{t.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.dockActions}>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.widenBtn}`}
              onClick={() => setDockWide((w) => !w)}
              aria-pressed={dockWide}
              aria-label={dockWide ? 'Restore panel width' : 'Widen panel'}
              title={dockWide ? 'Restore width' : 'Widen'}
            >
              <Icon name={dockWide ? 'collapse' : 'expand'} size={17} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => setDockOpen(false)} aria-label="Close practice panel">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>
        <div className={styles.dockBody}>
          {(visited.has('scratch') || tab === 'scratch') && (
            <div className={styles.dockPane} hidden={tab !== 'scratch'}>
              <Scratchpad key={lessonId} lessonId={lessonId} defaultLang={scratchLanguage(lesson)} />
            </div>
          )}
          {exerciseCount > 0 && (visited.has('exercise') || tab === 'exercise') && (
            <div className={`${styles.dockPane} ${styles.dockScroll}`} hidden={tab !== 'exercise'}>
              <StudentIDE lessonId={lessonId} />
            </div>
          )}
          {(visited.has('terminal') || tab === 'terminal') && (
            <div className={`${styles.dockPane} ${styles.dockScroll}`} hidden={tab !== 'terminal'}>
              <p className={styles.dockNote}>
                A safe practice terminal. Nothing you type here touches your computer. Type <code>help</code> to see what it understands.
              </p>
              <FriendlyTerminal mode="free" workspaceFiles={{}} />
            </div>
          )}
          {(visited.has('tutor') || tab === 'tutor') && (
            <div className={styles.dockPane} hidden={tab !== 'tutor'}>
              <Tutor key={lessonId} lesson={lesson} sections={sections} pending={pending} onPendingUsed={() => setPending(null)} />
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
