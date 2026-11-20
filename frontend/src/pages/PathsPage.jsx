import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { buildPathModel, formatMinutes, splitTitle } from '@/lib/learning'
import Icon from '@/components/icons/Icons'
import PathMark from '@/components/icons/PathMarks'
import styles from './PathsPage.module.css'

const lessonHref = (pathId, lessonId) => `/app/paths/${pathId}/lessons/${lessonId}`
const checkHref = (pathId, moduleId) => `/app/paths/${pathId}/modules/${moduleId}/skill-check`
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/* Learner progress shared by both views */
function useModels() {
  const { paths, pathsLoading, fetchPaths, progress, passedModules, progressLoaded } = useStore()
  useEffect(() => { fetchPaths() }, [fetchPaths])

  const completedIds = useMemo(() => new Set(Object.values(progress || {}).flat()), [progress])
  const passed = useMemo(() => new Set(passedModules || []), [passedModules])
  const models = useMemo(
    () => (paths || []).map((p) => ({ raw: p, model: buildPathModel(p, completedIds, passed) })),
    [paths, completedIds, passed],
  )
  const loading = (pathsLoading && !paths?.length) || !progressLoaded
  return { models, loading, fetchPaths, hasPaths: !!paths?.length }
}

/* ── Shared pieces ─────────────────────────────────────────── */

function Ring({ value, max, size = 72, stroke = 6, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(1, value / max) : 0
  return (
    <div className={styles.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className={styles.ringTrack} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={styles.ringValue}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className={styles.ringLabel}><span className={styles.ringNum}>{children}</span></div>
    </div>
  )
}

/* One segment per module, sized by its lesson count and filled by progress */
function ModuleStrip({ model }) {
  return (
    <div className={styles.strip} aria-hidden="true">
      {model.modules.map((m) => (
        <span
          key={m.id}
          className={styles.stripSeg}
          style={{ flexGrow: Math.max(1, m.total), '--fill': m.total ? m.done / m.total : 0 }}
          data-state={m.state}
          title={`${m.title}: ${m.done} of ${m.total}`}
        />
      ))}
    </div>
  )
}

function Skeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading paths">
      <div className={styles.skHead}>
        <span className={styles.skLine} style={{ width: 120, height: 32 }} />
        <span className={styles.skLine} style={{ width: 420 }} />
      </div>
      <div className={styles.skCard} style={{ height: 260 }} />
      <div className={styles.soonGrid} style={{ marginTop: 32 }}>
        {[0, 1, 2].map((i) => <div key={i} className={styles.skCard} style={{ height: 150 }} />)}
      </div>
    </div>
  )
}

function LoadError({ onRetry }) {
  return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <h2>We couldn't load the paths</h2>
        <p>Check your connection, then try again.</p>
        <button type="button" className={styles.btnPrimary} onClick={onRetry}>Try again</button>
      </div>
    </div>
  )
}

/* ── All paths ─────────────────────────────────────────────── */

function OpenPathCard({ raw, model }) {
  const started = model.doneCount > 0
  const pct = model.total ? Math.round((model.doneCount / model.total) * 100) : 0
  const next = model.next

  return (
    <article className={styles.openCard} aria-labelledby={`p-${model.id}`}>
      <div className={styles.openMain}>
      <div className={styles.openTop}>
        <PathMark id={raw.id} size={52} className={styles.openMark} />
        <span className={styles.status} data-tone={model.finished ? 'done' : started ? 'active' : 'open'}>
          {model.finished ? 'Completed' : started ? 'In progress' : 'Open now'}
        </span>
      </div>

      <h2 id={`p-${model.id}`} className={styles.openName}>
        <Link to={`/app/paths/${model.id}`}>{model.name}</Link>
      </h2>
      {model.description && <p className={styles.openDesc}>{model.description}</p>}

      <p className={styles.facts}>
        <span>{plural(model.modules.length, 'module')}</span>
        <span>{plural(model.total, 'lesson')}</span>
        <span>About {formatMinutes(model.totalMinutes)}</span>
      </p>

      <div className={styles.openProgress}>
        <ModuleStrip model={model} />
        <p className={styles.progressText}>
          {started ? (
            <><strong>{model.doneCount} of {model.total}</strong> lessons done · {pct}%</>
          ) : (
            'Nothing done yet. The first lesson takes about ten minutes.'
          )}
        </p>
      </div>

      <div className={styles.openFoot}>
        {next ? (
          <Link to={lessonHref(model.id, next.id)} className={styles.btnPrimary}>
            <Icon name="play" size={16} /> {started ? 'Continue' : 'Start the path'}
          </Link>
        ) : (
          <Link to={`/app/paths/${model.id}`} className={styles.btnPrimary}>Review the path</Link>
        )}
        <Link to={`/app/paths/${model.id}`} className={styles.btnGhost}>See all modules</Link>
        {next && started && (
          <span className={styles.nextHint}>
            Next: <span>{splitTitle(next.title).main}</span>
          </span>
        )}
      </div>
      </div>

      <ol className={styles.outline} aria-label="Modules">
        {model.modules.map((m) => (
          <li key={m.id} data-state={m.state}>
            <Link to={`/app/paths/${model.id}`} className={styles.outlineRow}>
              <span className={styles.outlineNum}>
                {m.state === 'done' ? <Icon name="check" size={12} /> : m.index + 1}
              </span>
              <span className={styles.outlineName}>{m.title}</span>
              <span className={styles.outlineCount}>{m.done}/{m.total}</span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  )
}

function SoonCard({ raw }) {
  return (
    <Link to={`/app/paths/${raw.id}`} className={styles.soonCard}>
      <PathMark id={raw.id} size={40} className={styles.soonMark} />
      <span className={styles.soonName}>{raw.name || raw.title}</span>
      {raw.description && <span className={styles.soonDesc}>{raw.description}</span>}
      <span className={styles.soonFoot}>
        In development
        <Icon name="arrowRight" size={14} />
      </span>
    </Link>
  )
}

function PathsIndex() {
  const { models, loading, fetchPaths, hasPaths } = useModels()
  if (loading) return <Skeleton />
  if (!hasPaths) return <LoadError onRetry={fetchPaths} />

  const open = models.filter(({ model }) => model.total > 0)
  const soon = models.filter(({ model }) => model.total === 0)

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Paths</h1>
        <p className={styles.lead}>
          Each path starts from zero and ends with something you've shipped. Lessons take about ten
          minutes, and each one teaches only what the next step needs.
        </p>
      </header>

      <div className={styles.openList}>
        {open.map(({ raw, model }) => <OpenPathCard key={raw.id} raw={raw} model={model} />)}
      </div>

      {soon.length > 0 && (
        <section className={styles.soon} aria-labelledby="soon-title">
          <div className={styles.sectionHead}>
            <h2 id="soon-title" className={styles.sectionTitle}>In development</h2>
            <p className={styles.sectionSub}>We're writing these now. Open one to see what it will cover.</p>
          </div>
          <div className={styles.soonGrid}>
            {soon.map(({ raw }) => <SoonCard key={raw.id} raw={raw} />)}
          </div>
        </section>
      )}
    </div>
  )
}

/* ── One path ──────────────────────────────────────────────── */

function LessonRow({ pathId, lesson, index, isNext }) {
  const { main, sub } = splitTitle(lesson.title)
  const state = lesson.done ? 'done' : isNext ? 'next' : 'todo'
  return (
    <li>
      <Link to={lessonHref(pathId, lesson.id)} className={styles.lesson} data-state={state}>
        <span className={styles.marker} aria-hidden="true">
          {lesson.done ? <Icon name="check" size={13} /> : String(index + 1).padStart(2, '0')}
        </span>
        <span className={styles.lessonText}>
          <span className={styles.lessonTitle}>
            {main}
            {sub && <span className={styles.lessonSub}> — {sub}</span>}
          </span>
          {lesson.mekLabel && <span className={styles.lessonMek}>{lesson.mekLabel}</span>}
        </span>
        <span className={styles.lessonMeta}>
          {isNext && <span className={styles.nextTag}>Up next</span>}
          {lesson.done && <span className={styles.srOnly}>Done.</span>}
          {lesson.duration && <span className={styles.lessonTime}>{lesson.duration}</span>}
        </span>
      </Link>
    </li>
  )
}

function ModuleBlock({ pathId, module: m, nextId, open, onToggle }) {
  const bodyId = `mod-${m.id}`
  const ready = m.total > 0 && m.done === m.total
  return (
    <section className={styles.module} data-state={m.state} data-open={open}>
      <button
        type="button"
        className={styles.moduleHead}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <span className={styles.node} style={{ '--frac': m.total ? m.done / m.total : 0 }} aria-hidden="true">
          {m.state === 'done' ? <Icon name="check" size={14} /> : m.index + 1}
        </span>
        <span className={styles.moduleText}>
          <span className={styles.moduleKicker}>
            Module {m.index + 1}
            {m.state === 'current' && <span className={styles.hereTag}>You're here</span>}
            {m.passed && <span className={styles.passTag}>Skill check passed</span>}
          </span>
          <span className={styles.moduleTitle}>{m.title}</span>
          {m.goal && <span className={styles.moduleGoal}>{m.goal}</span>}
        </span>
        <span className={styles.moduleMeta}>
          <span className={styles.moduleCount}>{m.done}/{m.total}</span>
          <span className={styles.moduleTime}>{formatMinutes(m.minutes)}</span>
        </span>
        <Icon name="chevronDown" size={18} className={styles.chev} />
      </button>

      <div className={styles.moduleBody} id={bodyId} role="region" aria-label={m.title}>
        <div className={styles.moduleInner}>
          {m.lessons.length > 0 ? (
            <ol className={styles.lessons}>
              {m.lessons.map((l, i) => (
                <LessonRow key={l.id} pathId={pathId} lesson={l} index={i} isNext={l.id === nextId} />
              ))}
            </ol>
          ) : (
            <p className={styles.muted}>Lessons for this module are on the way.</p>
          )}

          <div className={styles.moduleFoot}>
            {m.deliverables && (
              <p className={styles.ship}>
                <span>What you'll make</span>
                {m.deliverables}
              </p>
            )}
            {m.hasCheck && (
              <Link to={checkHref(pathId, m.id)} className={styles.checkLink} data-passed={m.passed}>
                {m.passed ? (
                  <><Icon name="check" size={15} /> Skill check passed · retake</>
                ) : (
                  <>{ready ? 'Take the skill check' : 'Skill check'} <Icon name="arrowRight" size={15} /></>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Summary({ model }) {
  const next = model.next
  const passed = model.modules.filter((m) => m.passed).length
  const checks = model.modules.filter((m) => m.hasCheck).length
  return (
    <aside className={styles.summary} aria-label="Your progress">
      <div className={styles.sumTop}>
        <Ring value={model.doneCount} max={model.total}>
          <strong>{model.total ? Math.round((model.doneCount / model.total) * 100) : 0}</strong>
          <span>%</span>
        </Ring>
        <div>
          <p className={styles.sumLine}>{model.doneCount} of {model.total} lessons</p>
          <p className={styles.sumSub}>
            {model.finished ? 'All done' : `${formatMinutes(model.remainingMinutes)} to go`}
          </p>
        </div>
      </div>

      {next ? (
        <div className={styles.sumNext}>
          <span className={styles.sumLabel}>{model.doneCount ? 'Up next' : 'Start here'}</span>
          <span className={styles.sumNextTitle}>{splitTitle(next.title).main}</span>
          <span className={styles.sumNextMeta}>
            Module {(model.nextModule?.index ?? 0) + 1}
            {next.duration ? ` · ${next.duration}` : ''}
          </span>
          <Link to={lessonHref(model.id, next.id)} className={`${styles.btnPrimary} ${styles.btnBlock}`}>
            <Icon name="play" size={16} /> {model.doneCount ? 'Continue' : 'Start the first lesson'}
          </Link>
        </div>
      ) : (
        <div className={styles.sumNext}>
          <span className={styles.sumLabel}>Path complete</span>
          <span className={styles.sumNextTitle}>Every lesson is done.</span>
          <Link to="/app/showcase" className={`${styles.btnGhost} ${styles.btnBlock}`}>Share what you built</Link>
        </div>
      )}

      <dl className={styles.sumFacts}>
        {checks > 0 && <div><dt>Skill checks passed</dt><dd>{passed} of {checks}</dd></div>}
        <div><dt>Total length</dt><dd>{formatMinutes(model.totalMinutes)}</dd></div>
      </dl>
    </aside>
  )
}

function PathDetail({ pathId }) {
  const { models, loading, fetchPaths, hasPaths } = useModels()
  const entry = models.find(({ raw }) => raw.id === pathId)
  const model = entry?.model
  const current = model?.modules.find((m) => m.state === 'current')
  const [openIds, setOpenIds] = useState(null)

  // Open the module the learner is in (or the first) once data arrives
  useEffect(() => {
    if (!model || openIds) return
    const first = current || model.modules[0]
    setOpenIds(new Set(first ? [first.id] : []))
  }, [model, current, openIds])

  if (loading) return <Skeleton />
  if (!hasPaths) return <LoadError onRetry={fetchPaths} />

  if (!entry) {
    return (
      <div className={styles.page}>
        <Link to="/app/paths" className={styles.back}><Icon name="arrowRight" size={15} /> All paths</Link>
        <div className={styles.empty}>
          <h2>That path doesn't exist</h2>
          <p>It may have been renamed. Pick one from the list instead.</p>
          <Link to="/app/paths" className={styles.btnPrimary}>See all paths</Link>
        </div>
      </div>
    )
  }

  const { raw } = entry
  const isOpen = model.total > 0
  const ids = openIds || new Set()
  const allOpen = model.modules.length > 0 && model.modules.every((m) => ids.has(m.id))
  const toggle = (id) => setOpenIds((prev) => {
    const n = new Set(prev || [])
    if (n.has(id)) n.delete(id)
    else n.add(id)
    return n
  })
  const toggleAll = () => setOpenIds(allOpen ? new Set() : new Set(model.modules.map((m) => m.id)))

  return (
    <div className={styles.page}>
      <Link to="/app/paths" className={styles.back}><Icon name="arrowRight" size={15} /> All paths</Link>

      <header className={styles.detailHead}>
        <PathMark id={raw.id} size={64} className={styles.detailMark} />
        <div className={styles.detailText}>
          <span className={styles.status} data-tone={!isOpen ? 'soon' : model.finished ? 'done' : model.doneCount ? 'active' : 'open'}>
            {!isOpen ? 'In development' : model.finished ? 'Completed' : model.doneCount ? 'In progress' : 'Open now'}
          </span>
          <h1 className={styles.title}>{model.name}</h1>
          {model.description && <p className={styles.lead}>{model.description}</p>}
          {isOpen && (
            <p className={styles.facts}>
              <span>{plural(model.modules.length, 'module')}</span>
              <span>{plural(model.total, 'lesson')}</span>
              <span>About {formatMinutes(model.totalMinutes)}</span>
            </p>
          )}
        </div>
      </header>

      {!isOpen ? (
        <div className={styles.empty}>
          <h2>This path is being written</h2>
          <p>
            Lessons open here as soon as they're ready. In the meantime, Full Stack Web Development
            covers the skills every other path builds on.
          </p>
          <Link to="/app/paths/full-stack-web" className={styles.btnPrimary}>Open Full Stack Web Development</Link>
        </div>
      ) : (
        <div className={styles.detailGrid}>
          <div className={styles.modulesCol}>
            <div className={styles.listHead}>
              <h2 className={styles.sectionTitle}>Modules</h2>
              <button type="button" className={styles.textBtn} onClick={toggleAll}>
                {allOpen ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
            <div className={styles.modules}>
              {model.modules.map((m) => (
                <ModuleBlock
                  key={m.id}
                  pathId={model.id}
                  module={m}
                  nextId={model.next?.id}
                  open={ids.has(m.id)}
                  onToggle={() => toggle(m.id)}
                />
              ))}
            </div>
          </div>
          <Summary model={model} />
        </div>
      )}
    </div>
  )
}

export default function PathsPage() {
  const { pathId } = useParams()
  return pathId ? <PathDetail key={pathId} pathId={pathId} /> : <PathsIndex />
}
