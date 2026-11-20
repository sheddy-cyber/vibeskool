import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useStore } from '@/lib/store'
import { classroomApi } from '@/lib/api'
import {
  activity,
  buildPathModel,
  greeting,
  minutes,
  pickActivePath,
  relativeTime,
  shortModuleName,
  splitTitle,
  summarySentence,
} from '@/lib/learning'
import Icon from '@/components/icons/Icons'
import PathMark from '@/components/icons/PathMarks'
import styles from './DashboardPage.module.css'

/* ── helpers ───────────────────────────────────────────────── */

function formatMinutes(total) {
  if (!total) return '0 min'
  const h = Math.floor(total / 60)
  const m = total % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}

/* "enough to read network errors" -> { lead: "enough to", rest: "read network errors" } */
function splitMek(mek) {
  const s = String(mek || '').trim().replace(/\.$/, '')
  const m = /^(enough to)\s+(.*)$/i.exec(s)
  return m ? { lead: m[1], rest: m[2] } : { lead: null, rest: s }
}

function HeroMark() {
  return (
    <svg viewBox="0 0 32 32" className={styles.heroMark} aria-hidden="true">
      <g transform="rotate(-12 16 16)" fill="#FFFFFF">
        <rect x="5.95" y="9.5" width="5.2" height="13" rx="2.6" opacity="0.07" />
        <rect x="13.4" y="4" width="5.2" height="24" rx="2.6" opacity="0.11" />
        <rect x="20.85" y="7.5" width="5.2" height="17" rx="2.6" opacity="0.07" />
      </g>
    </svg>
  )
}

const lessonHref = (pathId, lessonId) => `/app/paths/${pathId}/lessons/${lessonId}`

/* ── pieces ────────────────────────────────────────────────── */

function Ring({ value, max, size = 64, stroke = 6, children }) {
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
          className={`${styles.ringValue} ${pct >= 1 ? styles.ringDone : ''}`}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className={styles.ringLabel}>{children}</div>
    </div>
  )
}

function UpNext({ model }) {
  if (!model) return null

  if (model.finished) {
    return (
      <section className={`${styles.card} ${styles.upNext}`}>
        <HeroMark />
        <div className={styles.upMeta}>
          <span className={styles.modChip}><Icon name="flag" size={15} active /> Path complete</span>
        </div>
        <h2 className={styles.upTitle}>You've finished {model.name}.</h2>
        <p className={styles.upSub}>
          Every lesson is done. Revisit any module, or put it all together in your capstone project.
        </p>
        <div className={styles.upActions}>
          <Link to={`/app/paths/${model.id}`} className={styles.btnPrimary}>Review the path</Link>
          <Link to="/app/showcase" className={styles.btnGhost}>Share a project</Link>
        </div>
      </section>
    )
  }

  const { next, nextModule, nextIndexInModule } = model
  const { main, sub } = splitTitle(next.title)
  const isFresh = model.doneCount === 0

  return (
    <section className={`${styles.card} ${styles.upNext}`} aria-labelledby="up-next-title">
      <HeroMark />
      <div className={styles.upMeta}>
        <span className={styles.modChip}>
          Module {nextModule ? nextModule.index + 1 : ''} · {nextModule?.short}
        </span>
        <span className={styles.upFacts}>
          {nextModule && <>Lesson {nextIndexInModule + 1} of {nextModule.total}</>}
          {minutes(next.duration) && (
            <span className={styles.upTime}><Icon name="clock" size={14} /> {next.duration}</span>
          )}
        </span>
      </div>

      <h2 id="up-next-title" className={styles.upTitle}>{main}</h2>
      {sub && <p className={styles.upSub}>{sub}</p>}

      {next.mekLabel && (
        <div className={styles.goal}>
          <span className={styles.goalLabel}>
            <Icon name="idea" size={15} /> You'll learn
          </span>
          <p className={styles.goalText}>
            {splitMek(next.mekLabel).lead && (
              <span className={styles.enough}>{splitMek(next.mekLabel).lead}</span>
            )}{' '}
            {splitMek(next.mekLabel).rest}.
          </p>
        </div>
      )}

      <div className={styles.anatomy} aria-label="Inside this lesson">
        <span><Icon name="idea" size={16} /> The idea</span>
        <span><Icon name="terminal" size={16} /> Try it yourself</span>
        <span><Icon name="prompt" size={16} /> Ask AI</span>
      </div>

      <div className={styles.upFoot}>
        <div className={styles.upActions}>
          <Link to={lessonHref(model.id, next.id)} className={styles.btnPrimary}>
            <Icon name="play" size={16} /> {isFresh ? 'Start the first lesson' : 'Start lesson'}
          </Link>
          <Link to={`/app/paths/${model.id}`} className={styles.btnGhost}>See the whole module</Link>
        </div>

        {nextModule && nextModule.total > 1 && (
          <div className={styles.segments} aria-label={`${nextModule.done} of ${nextModule.total} lessons done in this module`}>
            {nextModule.lessons.map((l) => (
              <span
                key={l.id}
                title={l.title}
                className={`${styles.seg} ${l.done ? styles.segDone : ''} ${l.id === next.id ? styles.segNow : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function RouteMap({ model }) {
  if (!model || model.modules.length === 0) return null
  const pct = model.total ? Math.round((model.doneCount / model.total) * 100) : 0
  const current = model.modules.find((m) => m.state === 'current')

  return (
    <section className={styles.card} aria-labelledby="route-title">
      <div className={styles.cardHead}>
        <div>
          <h3 id="route-title" className={styles.cardTitle}>
            Your route
          </h3>
          <p className={styles.cardSub}>
            {model.name} · {model.doneCount} of {model.total} lessons · {pct}%
          </p>
        </div>
        <Link to={`/app/paths/${model.id}`} className={styles.textLink}>
          Open path <Icon name="arrowRight" size={15} />
        </Link>
      </div>

      <div className={styles.routeScroll} data-lenis-prevent>
        <ol className={styles.route} style={{ '--count': model.modules.length }}>
          {model.modules.map((m, i) => {
            const frac = m.total ? m.done / m.total : 0
            return (
              <li key={m.id} className={styles.stop} data-state={m.state}>
                {i > 0 && <span className={styles.rail} data-filled={model.modules[i - 1].state === 'done'} />}
                <Link
                  to={`/app/paths/${model.id}`}
                  className={styles.node}
                  style={{ '--frac': frac }}
                  title={m.goal ? `${m.title}. ${m.goal}` : m.title}
                >
                  {m.state === 'done' ? (
                    <Icon name="check" size={14} />
                  ) : (
                    <span className={styles.nodeNum}>{m.index + 1}</span>
                  )}
                </Link>
                <span className={styles.stopName}>{m.short}</span>
                <span className={styles.stopCount}>
                  {m.passed ? 'Checked' : `${m.done}/${m.total}`}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      {current?.goal && (
        <p className={styles.routeGoal}>
          <span>Module {current.index + 1} goal</span>
          {current.goal}
        </p>
      )}
    </section>
  )
}

function AfterThis({ model }) {
  if (!model || model.upcoming.length === 0) return null
  return (
    <section className={styles.card} aria-labelledby="after-title">
      <div className={styles.cardHead}>
        <h3 id="after-title" className={styles.cardTitle}>
          After this
        </h3>
        {model.remainingMinutes > 0 && (
          <span className={styles.cardSub}>{formatMinutes(model.remainingMinutes)} left in the path</span>
        )}
      </div>
      <ol className={styles.queue}>
        {model.upcoming.map((l) => {
          return (
            <li key={l.id}>
              <Link to={lessonHref(model.id, l.id)} className={styles.queueRow}>
                <span className={styles.queueText}>
                  <span className={styles.queueTitle}>{l.title}</span>
                  {l.mekLabel && <span className={styles.queueMek}>{l.mekLabel}</span>}
                </span>
                <span className={styles.queueMeta}>
                  <span>{shortModuleName(l.part)}</span>
                  {l.duration && <span>{l.duration}</span>}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function ThisWeek({ act, goal, streak }) {
  const peak = Math.max(goal, ...act.week.map((d) => d.count), 1)
  const left = Math.max(0, goal - act.today)
  return (
    <section className={styles.card} aria-labelledby="week-title">
      <div className={styles.cardHead}>
        <h3 id="week-title" className={styles.cardTitle}>
          This week
        </h3>
        <Link to="/app/settings" className={styles.textLinkMuted}>Daily goal: {goal}</Link>
      </div>

      <div className={styles.today}>
        <Ring value={act.today} max={goal}>
          <span className={styles.ringNum}>
            <strong>{act.today}</strong>
            <span>/{goal}</span>
          </span>
        </Ring>
        <div>
          <p className={styles.todayLine}>
            {act.today >= goal
              ? 'Goal reached for today.'
              : act.today === 0
                ? `${goal} ${goal === 1 ? 'lesson' : 'lessons'} to go today`
                : `${left} more to hit today's goal`}
          </p>
          <p className={styles.todaySub}>{act.weekTotal} {act.weekTotal === 1 ? 'lesson' : 'lessons'} so far this week</p>
        </div>
      </div>

      <div className={styles.week} role="list" aria-label="Lessons per day this week">
        {act.week.map((d) => (
          <div
            key={d.key}
            role="listitem"
            className={`${styles.day} ${d.isToday ? styles.dayToday : ''} ${d.isFuture ? styles.dayFuture : ''}`}
            title={`${d.long}: ${d.count} ${d.count === 1 ? 'lesson' : 'lessons'}`}
          >
            <span className={styles.dayBarWrap}>
              <span
                className={styles.dayBar}
                style={{ height: d.count ? `${Math.max(18, (d.count / peak) * 100)}%` : 0 }}
              />
            </span>
            <span className={styles.dayLabel}>{d.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.streakRow}>
        <span className={styles.streakText}>
          {streak.current > 0 ? (
            <><strong>{streak.current}-day streak</strong>. Keep it going tomorrow.</>
          ) : (
            'Finish a lesson today to start a streak.'
          )}
        </span>
        <span className={styles.streakBest}>Best {streak.longest}</span>
      </div>
    </section>
  )
}

function ClassroomCard({ isStudent }) {
  const [state, setState] = useState({ loading: true, classes: [] })
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [message, setMessage] = useState(null)

  const load = () =>
    classroomApi.list()
      .then((d) => setState({ loading: false, classes: d.classrooms || [] }))
      .catch(() => setState({ loading: false, classes: [] }))

  useEffect(() => { load() }, [])

  const join = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setJoining(true)
    setMessage(null)
    try {
      await classroomApi.join(code.trim().toUpperCase())
      setCode('')
      await load()
    } catch (err) {
      setMessage(err?.data?.error || err?.message || "That code didn't work. Check it with your tutor.")
    } finally {
      setJoining(false)
    }
  }

  if (state.loading) return <section className={`${styles.card} ${styles.skeletonCard}`} aria-hidden="true" />

  const [first, ...rest] = state.classes
  return (
    <section className={styles.card} aria-labelledby="class-title">
      <div className={styles.cardHead}>
        <h3 id="class-title" className={styles.cardTitle}>
          Your class
        </h3>
        {first && <Link to="/app/classrooms" className={styles.textLinkMuted}>All classes</Link>}
      </div>

      {first ? (
        <Link to={`/app/classrooms/${first.id}`} className={styles.classRow}>
          <span className={styles.classMono} aria-hidden="true">{(first.name || 'C').trim().charAt(0).toUpperCase()}</span>
          <span className={styles.classText}>
            <span className={styles.className}>{first.name}</span>
            <span className={styles.classTutor}>
              {first.teacher_name ? `with ${first.teacher_name}` : 'Tutor-led class'}
              {rest.length > 0 && ` · +${rest.length} more`}
            </span>
          </span>
          <Icon name="chevronRight" size={16} className={styles.classGo} />
        </Link>
      ) : isStudent ? (
        <form className={styles.join} onSubmit={join}>
          <p className={styles.joinText}>Learning with a tutor? Enter the code they gave you.</p>
          <div className={styles.joinRow}>
            <span className={styles.joinField}>
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value); setMessage(null) }}
                placeholder="e.g. VIBE-7KQ2MD"
                aria-label="Class join code"
                autoComplete="off"
                spellCheck="false"
              />
            </span>
            <button type="submit" className={styles.joinBtn} disabled={joining || !code.trim()}>
              {joining ? 'Joining…' : 'Join'}
            </button>
          </div>
          {message && <p className={styles.joinError} role="alert">{message}</p>}
        </form>
      ) : (
        <p className={styles.cardSub}>You're not in a class yet.</p>
      )}
    </section>
  )
}

function Recent({ act, lessonIndex }) {
  const items = act.recent
    .map((c) => ({ ...c, lesson: lessonIndex.get(c.lessonId) }))
    .filter((c) => c.lesson)
  if (items.length === 0) return null
  const now = new Date()
  return (
    <section className={styles.card} aria-labelledby="recent-title">
      <div className={styles.cardHead}>
        <h3 id="recent-title" className={styles.cardTitle}>
          Recently finished
        </h3>
      </div>
      <ul className={styles.recent}>
        {items.map((c) => (
          <li key={`${c.lessonId}-${c.completedAt}`}>
            <Link to={lessonHref(c.pathId, c.lessonId)} className={styles.recentRow}>
              <span className={styles.recentTitle}>{c.lesson.title}</span>
              <span className={styles.recentWhen}>{relativeTime(c.completedAt, now)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function OtherPaths({ paths, activeId }) {
  const others = paths.filter((p) => p.id !== activeId)
  if (others.length === 0) return null
  return (
    <section className={styles.others} aria-labelledby="others-title">
      <div className={styles.othersHead}>
        <h3 id="others-title" className={styles.cardTitle}>More paths</h3>
        <Link to="/app/paths" className={styles.textLinkMuted}>Browse all</Link>
      </div>
      <div className={styles.othersRow}>
        {others.map((p) => {
          const count = (p.lessons_data || []).length
          return (
            <Link key={p.id} to={`/app/paths/${p.id}`} className={styles.otherCard}>
              <PathMark id={p.id} size={40} className={styles.otherMark} />
              <span className={styles.otherName}>{p.name || p.title}</span>
              <span className={styles.otherMeta}>
                {count ? `${count} lessons` : 'In development'}
                <Icon name="arrowRight" size={14} />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function Skeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading your dashboard">
      <div className={styles.skHead}>
        <span className={styles.skLine} style={{ width: 140 }} />
        <span className={styles.skLine} style={{ width: 320, height: 34 }} />
        <span className={styles.skLine} style={{ width: 420 }} />
      </div>
      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={`${styles.card} ${styles.skeletonCard}`} style={{ height: 300 }} />
          <div className={`${styles.card} ${styles.skeletonCard}`} style={{ height: 200 }} />
        </div>
        <div className={styles.sideCol}>
          <div className={`${styles.card} ${styles.skeletonCard}`} style={{ height: 280 }} />
          <div className={`${styles.card} ${styles.skeletonCard}`} style={{ height: 140 }} />
        </div>
      </div>
    </div>
  )
}

/* ── page ──────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const {
    paths, pathsLoading, fetchPaths,
    progress, completions, passedModules, streak, progressLoaded,
    settings,
  } = useStore()

  useEffect(() => { fetchPaths() }, [fetchPaths])

  const completedIds = useMemo(() => new Set(Object.values(progress || {}).flat()), [progress])
  const activePath = useMemo(() => pickActivePath(paths || [], completions || []), [paths, completions])
  const model = useMemo(
    () => buildPathModel(activePath, completedIds, new Set(passedModules || [])),
    [activePath, completedIds, passedModules],
  )
  const act = useMemo(() => activity(completions || []), [completions])
  const lessonIndex = useMemo(() => {
    const m = new Map()
    ;(paths || []).forEach((p) => (p.lessons_data || []).forEach((l) => m.set(l.id, l)))
    return m
  }, [paths])

  if ((pathsLoading && !paths?.length) || !progressLoaded) return <Skeleton />

  if (!paths?.length) {
    return (
      <div className={styles.page}>
        <div className={`${styles.card} ${styles.errorCard}`}>
          <h2 className={styles.cardTitle}>We couldn't load your lessons</h2>
          <p className={styles.cardSub}>Check your connection, then try again.</p>
          <button type="button" className={styles.btnPrimary} onClick={fetchPaths}>Try again</button>
        </div>
      </div>
    )
  }

  const now = new Date()
  const firstName = (currentUser?.name || '').trim().split(/\s+/)[0]
  const goal = Math.max(1, Number(settings?.dailyGoal) || 2)

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.date}>
            {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className={styles.hello}>
            {greeting(now)}{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className={styles.summary}>{summarySentence(model, act, streak.current)}</p>
        </div>

        <dl className={styles.stats}>
          <div>
            <dt>Streak</dt>
            <dd>{streak.current}<small>{streak.current === 1 ? 'day' : 'days'}</small></dd>
          </div>
          <div>
            <dt>Lessons done</dt>
            <dd>{completedIds.size}</dd>
          </div>
          {model && !model.finished && (
            <div>
              <dt>Left in path</dt>
              <dd className={styles.ddSmall}>{formatMinutes(model.remainingMinutes)}</dd>
            </div>
          )}
        </dl>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <UpNext model={model} />
          <RouteMap model={model} />
          <AfterThis model={model} />
        </div>

        <aside className={styles.sideCol}>
          <ThisWeek act={act} goal={goal} streak={streak} />
          <ClassroomCard isStudent={currentUser?.role === 'student'} />
          <Recent act={act} lessonIndex={lessonIndex} />
        </aside>
      </div>

      <OtherPaths paths={paths} activeId={model?.id} />
    </div>
  )
}
