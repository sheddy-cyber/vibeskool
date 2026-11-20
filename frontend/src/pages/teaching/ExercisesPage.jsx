import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Empty, Modal, Segmented, Skeleton } from '@/components/classroom/Parts'
import MiniEditor from '@/components/classroom/MiniEditor'
import { exerciseApi, studioApi } from '@/lib/api'
import { errorText } from '@/lib/classroom'
import { confirmDialog, notify } from '@/lib/dialog'
import { runJsTests } from '@/lib/runTests'
import ui from '../classroom/Classroom.module.css'
import styles from './Teaching.module.css'
import { plural } from './shared'

const LANGS = [
  { value: 'javascript', label: 'JavaScript', icon: 'code' },
  { value: 'python', label: 'Python', icon: 'terminal' },
  { value: 'html', label: 'HTML', icon: 'web' },
]
const TEST_HINT = {
  javascript: 'Each test runs your expression after the student\'s code with console.log, then compares what it prints. Example: add(2, 3) → 5',
  python: 'Each test runs your expression after the student\'s code with print(), then compares what it prints. Example: add(2, 3) → 5',
}

/* ── Editor dialog ────────────────────────────────────────── */
function ExerciseEditor({ id, lessons, defaultLesson, onClose, onSaved }) {
  const [loaded, setLoaded] = useState(!id)
  const [lessonId, setLessonId] = useState(defaultLesson || lessons[0]?.id || '')
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [starter, setStarter] = useState('')
  const [solution, setSolution] = useState('')
  const [cases, setCases] = useState([{ input: '', expected_output: '' }])
  const [points, setPoints] = useState(10)
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!id) return
    exerciseApi.get(id).then(({ exercise: e }) => {
      setLessonId(e.lesson_id || '')
      setTitle(e.title)
      setInstructions(e.instructions || '')
      setLanguage(e.language || 'javascript')
      setStarter(e.starter_code || '')
      setSolution(e.solution_code || '')
      setCases(e.test_cases?.length ? e.test_cases : [{ input: '', expected_output: '' }])
      setPoints(e.points || 10)
      setLoaded(true)
    }).catch((err) => { notify({ title: "Couldn't open the exercise", body: errorText(err), tone: 'error' }); onClose() })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const byCourse = useMemo(() => {
    const m = new Map()
    lessons.forEach((l) => { if (!m.has(l.courseTitle)) m.set(l.courseTitle, []); m.get(l.courseTitle).push(l) })
    return [...m.entries()]
  }, [lessons])

  const usableCases = cases.filter((c) => c.input.trim() || String(c.expected_output).trim())
  const testable = language !== 'html'

  const check = async () => {
    setChecking(true)
    setResults(null)
    try {
      // JavaScript runs right here in a sandboxed worker; Python needs the server's code runner
      const res = language === 'javascript'
        ? await runJsTests(solution, usableCases)
        : await exerciseApi.check({ language, code: solution, test_cases: usableCases })
      setResults(res)
    } catch (err) {
      notify({ title: "Couldn't run the tests", body: errorText(err), tone: 'error' })
    } finally {
      setChecking(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    const data = {
      lesson_id: lessonId, title: title.trim(), instructions, language, starter_code: starter,
      solution_code: solution, test_cases: testable ? usableCases : [], points: Number(points) || 10, type: 'coding',
    }
    try {
      if (id) await exerciseApi.update(id, data)
      else await exerciseApi.create(data)
      notify({ title: id ? 'Exercise saved' : 'Exercise added', tone: 'success' })
      onSaved()
    } catch (err) {
      const f = err.data?.fields || {}
      setErrors(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)])))
      notify({ title: "Couldn't save the exercise", body: errorText(err), tone: 'error' })
      setBusy(false)
    }
  }

  const remove = async () => {
    const ok = await confirmDialog({ tone: 'danger', title: `Delete “${title}”?`, body: "Students' attempts at it are deleted too. This can’t be undone.", confirmLabel: 'Delete exercise' })
    if (!ok) return
    try {
      await exerciseApi.delete(id)
      notify({ title: 'Exercise deleted', tone: 'success' })
      onSaved()
    } catch (err) {
      notify({ title: "Couldn't delete it", body: errorText(err), tone: 'error' })
    }
  }

  return (
    <Modal
      wide
      title={id ? 'Edit exercise' : 'New exercise'}
      description="Students solve it in the lesson's code panel and get instant feedback from the tests."
      onClose={onClose}
      footer={
        <>
          {id && <button type="button" className={ui.btnDanger} onClick={remove} style={{ marginRight: 'auto' }}><Icon name="trash" size={16} /> Delete</button>}
          <button type="button" className={ui.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" form="exercise-form" className={ui.btnPrimary} disabled={busy || !loaded || !title.trim() || !lessonId}>{busy ? 'Saving…' : id ? 'Save' : 'Add exercise'}</button>
        </>
      }
    >
      {!loaded ? <Skeleton lines={6} /> : (
        <form id="exercise-form" onSubmit={save}>
          <label className={ui.field}>
            <span>Lesson</span>
            <select className={ui.select} value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
              {byCourse.map(([course, ls]) => (
                <optgroup key={course} label={course}>
                  {ls.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                </optgroup>
              ))}
            </select>
            {errors.lesson_id && <small className={ui.formError}>{errors.lesson_id}</small>}
          </label>
          <label className={ui.field}>
            <span>Title</span>
            <input className={ui.input} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="e.g. Write a function that adds two numbers" />
          </label>
          <label className={ui.field}>
            <span>Instructions</span>
            <textarea className={ui.textarea} rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="What to build, and any hints. Students see this above the editor." />
          </label>
          <div className={ui.field}>
            <span>Language</span>
            <Segmented value={language} onChange={(v) => { setLanguage(v); setResults(null) }} options={LANGS} label="Language" />
          </div>
          <div className={ui.field}>
            <span className={styles.codeLabel}>Starter code <small className={ui.muted}>what students begin with</small></span>
            <MiniEditor value={starter} onChange={setStarter} language={language} label="Starter code" />
          </div>
          <div className={ui.field}>
            <span className={styles.codeLabel}>Your solution <small className={ui.muted}>only your course team sees this</small></span>
            <MiniEditor value={solution} onChange={(v) => { setSolution(v); setResults(null) }} language={language} label="Solution" />
          </div>

          {testable ? (
            <div className={ui.field}>
              <span>Tests</span>
              <small>{TEST_HINT[language]}</small>
              <div className={styles.caseHead}><span>Expression</span><span>Expected output</span><span /><span /></div>
              <div className={styles.cases}>
                {cases.map((c, i) => {
                  const r = results?.results?.[usableCases.indexOf(c)]
                  return (
                    <React.Fragment key={i}>
                      <div className={styles.case}>
                        <input className={ui.input} value={c.input} onChange={(e) => { const v = e.target.value; setCases((cs) => cs.map((x, j) => (j === i ? { ...x, input: v } : x))); setResults(null) }} placeholder="add(2, 3)" aria-label={`Test ${i + 1} expression`} spellCheck="false" />
                        <input className={ui.input} value={c.expected_output} onChange={(e) => { const v = e.target.value; setCases((cs) => cs.map((x, j) => (j === i ? { ...x, expected_output: v } : x))); setResults(null) }} placeholder="5" aria-label={`Test ${i + 1} expected output`} spellCheck="false" />
                        {r ? <span className={styles.caseResult} data-ok={r.passed} title={r.passed ? 'Passes' : `Got: ${r.actual || '(nothing)'}`}><Icon name={r.passed ? 'check' : 'close'} size={13} /></span> : <span />}
                        <button type="button" className={styles.tinyBtn} onClick={() => setCases((cs) => cs.filter((_, j) => j !== i))} disabled={cases.length === 1} aria-label={`Remove test ${i + 1}`}><Icon name="close" size={14} /></button>
                      </div>
                      {r && !r.passed && <span className={styles.caseOut}>Got {r.actual ? `“${r.actual}”` : 'nothing'}{r.stderr ? ` · ${r.stderr.split('\n')[0]}` : ''}</span>}
                    </React.Fragment>
                  )
                })}
              </div>
              <div className={styles.runLine}>
                <button type="button" className={ui.textBtn} data-tone="accent" onClick={() => setCases((cs) => [...cs, { input: '', expected_output: '' }])}><Icon name="plus" size={14} /> Add a test</button>
                <button type="button" className={`${ui.btnGhost} ${ui.sm}`} onClick={check} disabled={checking || !solution.trim() || !usableCases.length} style={{ marginLeft: 'auto' }}>
                  <Icon name="play" size={14} /> {checking ? 'Running…' : 'Check my solution'}
                </button>
                {results && <span>{results.passed ? 'Your solution passes every test.' : `${results.score}% of tests pass.`}</span>}
              </div>
            </div>
          ) : (
            <p className={ui.muted} style={{ marginBottom: 16 }}>HTML exercises are checked by eye in the live preview, so they don't need tests.</p>
          )}

          <label className={ui.field} style={{ maxWidth: 160 }}>
            <span>Points</span>
            <input className={ui.input} type="number" min="1" max="100" value={points} onChange={(e) => setPoints(e.target.value)} />
          </label>
        </form>
      )}
    </Modal>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ExercisesPage() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | exercise id
  const courseId = params.get('courseId') || ''
  const lessonId = params.get('lessonId') || ''

  const load = () => studioApi.exercises().then(setData).catch((err) => setError(errorText(err)))
  useEffect(() => { load() }, [])

  const lessons = data?.lessons || []
  const courses = useMemo(() => {
    const seen = new Map()
    lessons.forEach((l) => { if (!seen.has(l.courseId)) seen.set(l.courseId, l.courseTitle) })
    return [...seen.entries()]
  }, [lessons])

  const shown = (data?.exercises || []).filter((e) => (!courseId || e.course.id === courseId) && (!lessonId || e.lesson.id === lessonId))
  const focusLesson = lessons.find((l) => l.id === lessonId)

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    if (key === 'courseId') next.delete('lessonId')
    setParams(next, { replace: true })
  }

  return (
    <div className={ui.page}>
      {focusLesson && (
        <Link to={`/app/teaching/courses/${focusLesson.courseId}/lessons/${focusLesson.id}`} className={ui.crumb}>
          <Icon name="arrowLeft" size={15} /> {focusLesson.title}
        </Link>
      )}
      <header className={ui.head}>
        <div className={ui.headText}>
          <h1 className={ui.title}>Exercises</h1>
          <p className={ui.lead}>Practice tasks on the lessons in your courses. Students solve them in the lesson's code panel; tests give them instant feedback.</p>
        </div>
        <button
          type="button"
          className={ui.btnPrimary}
          onClick={() => setEditing('new')}
          disabled={!lessons.length}
          title={lessons.length ? undefined : 'Create a course with a lesson first'}
        >
          <Icon name="plus" size={17} /> New exercise
        </button>
      </header>

      {error ? (
        <div className={ui.card}><Empty icon="close" title="Couldn't load your exercises">{error}</Empty></div>
      ) : !data ? (
        <div className={`${ui.card} ${ui.cardPad}`}><Skeleton lines={5} /></div>
      ) : !lessons.length ? (
        <div className={ui.card}>
          <Empty icon="checklist" title="Exercises live on your lessons" action={<Link to="/app/teaching/courses?new=1" className={ui.btnPrimary}>Start a course</Link>}>
            Create a course and write a lesson, then add exercises to it here.
          </Empty>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <select className={`${ui.select} ${styles.filter}`} value={courseId} onChange={(e) => setFilter('courseId', e.target.value)} aria-label="Course">
              <option value="">All courses</option>
              {courses.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
            </select>
            {lessonId && (
              <button type="button" className={ui.chip} aria-pressed="true" onClick={() => setFilter('lessonId', '')}>
                {focusLesson?.title || 'This lesson'} <Icon name="close" size={13} />
              </button>
            )}
            <span className={ui.muted} style={{ marginLeft: 'auto' }}>{plural(shown.length, 'exercise')}</span>
          </div>

          {shown.length ? (
            <ul className={`${ui.card} ${styles.list}`}>
              {shown.map((e) => {
                const pct = e.students_tried ? Math.round((e.students_passed / e.students_tried) * 100) : 0
                return (
                  <li key={e.id}>
                    <div className={styles.exRow} role="button" tabIndex={0} onClick={() => setEditing(e.id)} onKeyDown={(ev) => { if (ev.key === 'Enter') setEditing(e.id) }}>
                      <span className={styles.rowIcon}><Icon name={LANGS.find((l) => l.value === e.language)?.icon || 'code'} size={18} /></span>
                      <span style={{ minWidth: 0 }}>
                        <span className={styles.rowTitle}>{e.title}</span>
                        <span className={styles.rowSub}>{e.course.title} · {e.lesson.title}{e.language !== 'html' ? ` · ${plural(e.tests, 'test')}` : ''}</span>
                      </span>
                      <span className={styles.exStat}>
                        {e.students_tried ? (
                          <>
                            <span className={styles.passBar} aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
                            {e.students_passed}/{e.students_tried} passed
                          </>
                        ) : 'Not tried yet'}
                      </span>
                      <Icon name="chevronRight" size={16} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className={ui.card}>
              <Empty icon="checklist" title={lessonId ? 'No exercises on this lesson yet' : 'No exercises yet'} action={<button type="button" className={ui.btnPrimary} onClick={() => setEditing('new')}><Icon name="plus" size={16} /> Add one</button>}>
                A short task right after the reading helps the idea stick.
              </Empty>
            </div>
          )}
        </>
      )}

      {editing && (
        <ExerciseEditor
          id={editing === 'new' ? null : editing}
          lessons={lessons}
          defaultLesson={lessonId || (courseId ? lessons.find((l) => l.courseId === courseId)?.id : undefined)}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}
