import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Empty, Modal, Pill, Segmented, Skeleton } from '@/components/classroom/Parts'
import { classroomApi, contentApi } from '@/lib/api'
import { dueLabel, errorText, KIND, OPEN_STATUSES, STATUS } from '@/lib/classroom'
import { notify } from '@/lib/dialog'
import { useLive } from '@/lib/live'
import styles from './Classroom.module.css'

/* datetime-local wants "YYYY-MM-DDTHH:mm" in local time */
function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function nextWeekAt6pm() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setHours(18, 0, 0, 0)
  return d.toISOString()
}

export function AssignmentModal({ room, initial, onClose, onSaved }) {
  const editing = Boolean(initial?.id)
  const [kind, setKind] = useState(initial?.kind || 'code')
  const [title, setTitle] = useState(initial?.title || '')
  const [instructions, setInstructions] = useState(initial?.instructions || '')
  const [lessonId, setLessonId] = useState(initial?.lesson?.id || '')
  const [due, setDue] = useState(toLocalInput(editing ? initial?.due_at : nextWeekAt6pm()))
  const [starter, setStarter] = useState(initial?.starter_code || '')
  const [published, setPublished] = useState(initial?.published ?? true)
  const [lessons, setLessons] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { contentApi.getLessons().then((d) => setLessons(d.lessons || [])).catch(() => {}) }, [])

  const byPath = useMemo(() => {
    const m = new Map()
    for (const l of lessons) {
      if (!m.has(l.pathName)) m.set(l.pathName, [])
      m.get(l.pathName).push(l)
    }
    return [...m.entries()]
  }, [lessons])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const lesson = lessons.find((l) => l.id === lessonId)
    const data = {
      kind,
      title: title.trim() || (kind === 'lesson' && lesson ? `Finish: ${lesson.title}` : ''),
      instructions,
      lessonId: lessonId || null,
      due_at: due ? new Date(due).toISOString() : null,
      starter_code: kind === 'code' ? starter : '',
      published,
    }
    try {
      const res = editing
        ? await classroomApi.updateAssignment(room.id, initial.id, data)
        : await classroomApi.createAssignment(room.id, data)
      onSaved(res.assignment)
    } catch (err) {
      setError(errorText(err))
      setBusy(false)
    }
  }

  return (
    <Modal
      wide
      title={editing ? 'Edit assignment' : 'New assignment'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" form="assignment-form" className={styles.btnPrimary} disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : published ? 'Assign' : 'Save as draft'}
          </button>
        </>
      }
    >
      <form id="assignment-form" onSubmit={submit}>
        <div className={styles.field}>
          <span>Students should</span>
          <Segmented
            value={kind}
            onChange={setKind}
            label="Assignment type"
            options={Object.entries(KIND).map(([value, k]) => ({ value, label: k.label, icon: k.icon }))}
          />
        </div>
        {kind === 'lesson' && (
          <label className={styles.field}>
            <span>Lesson</span>
            <select className={styles.select} value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
              <option value="">Pick a lesson…</option>
              {byPath.map(([path, list]) => (
                <optgroup key={path} label={path}>
                  {list.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                </optgroup>
              ))}
            </select>
            <small>It's marked done when the student finishes the lesson.</small>
          </label>
        )}
        <label className={styles.field}>
          <span>Title</span>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === 'lesson' ? 'Leave empty to use the lesson name' : 'e.g. Build your first page'}
            maxLength={160}
          />
        </label>
        <label className={styles.field}>
          <span>Instructions</span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="What to build, what a good result looks like, and any hints."
          />
        </label>
        {kind === 'code' && (
          <label className={styles.field}>
            <span>Starter code <small className={styles.muted}>(optional)</small></span>
            <textarea className={`${styles.textarea} ${styles.mono}`} rows={5} value={starter} onChange={(e) => setStarter(e.target.value)} spellCheck="false" />
          </label>
        )}
        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Due</span>
            <input type="datetime-local" className={styles.input} value={due} onChange={(e) => setDue(e.target.value)} />
            <small>{due ? <button type="button" className={styles.textBtn} onClick={() => setDue('')}>No due date</button> : 'No due date'}</small>
          </label>
          <div className={styles.field}>
            <span>Visibility</span>
            <label className={styles.check} style={{ minHeight: 42 }}>
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Students can see it
            </label>
          </div>
        </div>
        {error && <p className={styles.formError} role="alert">{error}</p>}
      </form>
    </Modal>
  )
}

function Meter({ counts, total }) {
  const done = counts.approved + counts.done
  const handed = counts.submitted
  const fix = counts.changes_requested
  const pct = (n) => `${total ? (n / total) * 100 : 0}%`
  return (
    <span className={styles.meter} aria-hidden="true">
      <span data-k="done" style={{ width: pct(done) }} />
      <span data-k="in" style={{ width: pct(handed) }} />
      <span data-k="fix" style={{ width: pct(fix) }} />
    </span>
  )
}

function Row({ a, room, tutor, members }) {
  const status = a.status
  const finished = tutor ? false : !OPEN_STATUSES.includes(status)
  const due = dueLabel(a.due_at, finished)
  const href = `/app/classrooms/${room.id}/assignments/${a.id}`
  const sub = a.kind === 'lesson' && a.lesson ? a.lesson.title : KIND[a.kind]?.label
  return (
    <li>
      <Link to={href} className={styles.workRow}>
        <span className={styles.workIcon}><Icon name={KIND[a.kind]?.icon || 'checklist'} size={19} /></span>
        <span style={{ minWidth: 0 }}>
          <span className={styles.workTitle}>{a.title}</span>
          <span className={styles.workSub} data-tone={due.tone} style={{ display: 'block' }}>
            {due.text}{sub ? ` · ${sub}` : ''}
          </span>
        </span>
        {tutor ? (
          <>
            <span className={styles.workMeter}>
              {!a.published && <span className={styles.draft}>Draft</span>}
              <Meter counts={a.counts} total={members} />
              {a.counts.submitted + a.counts.approved + a.counts.changes_requested + a.counts.done}/{members}
            </span>
            {a.counts.submitted > 0 ? <Pill tone="active">{a.counts.submitted} to review</Pill> : <span />}
          </>
        ) : (
          <>
            <Pill tone={STATUS[status]?.tone}>{STATUS[status]?.label}</Pill>
            <Icon name="chevronRight" size={16} style={{ color: 'var(--text-tertiary)' }} />
          </>
        )}
      </Link>
    </li>
  )
}

export default function Classwork({ room, tutor }) {
  const [state, setState] = useState({ loading: true, items: [], error: null })
  const [creating, setCreating] = useState(false)

  const load = () => classroomApi.assignments(room.id)
    .then((d) => setState({ loading: false, items: d.assignments, error: null }))
    .catch((err) => setState({ loading: false, items: [], error: errorText(err) }))

  useEffect(() => { load() }, [room.id])
  useLive(['work', 'people'], load)

  const groups = useMemo(() => {
    const byDue = (a, b) => (a.due_at ? new Date(a.due_at) : Infinity) - (b.due_at ? new Date(b.due_at) : Infinity)
    const items = [...state.items].sort(byDue)
    if (tutor) {
      const now = new Date()
      return [
        { title: 'Coming up', items: items.filter((a) => !a.due_at || new Date(a.due_at) >= now) },
        { title: 'Past due date', items: items.filter((a) => a.due_at && new Date(a.due_at) < now).reverse() },
      ]
    }
    return [
      { title: 'To do', items: items.filter((a) => OPEN_STATUSES.includes(a.status)) },
      { title: 'Handed in', items: items.filter((a) => a.status === 'submitted') },
      { title: 'Done', items: items.filter((a) => a.status === 'approved' || a.status === 'done').reverse() },
    ]
  }, [state.items, tutor])

  const members = room.members?.length || 0

  return (
    <div>
      <div className={styles.workHead}>
        <div>
          <h2 className={styles.sectionTitle}>Classwork</h2>
          <p className={styles.sectionSub}>
            {tutor ? 'Set work, see who has handed it in, and review it.' : 'What your tutor has set, and where you are with each.'}
          </p>
        </div>
        {tutor && (
          <button type="button" className={styles.btnPrimary} onClick={() => setCreating(true)}>
            <Icon name="plus" size={17} /> New assignment
          </button>
        )}
      </div>

      {state.loading ? (
        <div className={`${styles.card} ${styles.cardPad}`}><Skeleton lines={4} /></div>
      ) : state.error ? (
        <div className={styles.card}><Empty icon="close" title="Couldn't load classwork">{state.error}</Empty></div>
      ) : state.items.length === 0 ? (
        <div className={styles.card}>
          <Empty
            icon="checklist"
            title="No classwork yet"
            action={tutor && <button type="button" className={styles.btnPrimary} onClick={() => setCreating(true)}><Icon name="plus" size={17} /> Set the first assignment</button>}
          >
            {tutor ? 'Ask students to finish a lesson, build something and hand in the code, or share a link to a site they deployed.' : "When your tutor sets work, it shows up here."}
          </Empty>
        </div>
      ) : (
        groups.filter((g) => g.items.length).map((g) => (
          <section key={g.title} className={styles.group}>
            <h3 className={styles.groupTitle}>{g.title}</h3>
            <ul className={`${styles.card} ${styles.workList}`}>
              {g.items.map((a) => <Row key={a.id} a={a} room={room} tutor={tutor} members={members} />)}
            </ul>
          </section>
        ))
      )}

      {creating && (
        <AssignmentModal
          room={room}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            notify({ title: 'Assignment set', tone: 'success' })
            load()
          }}
        />
      )}
    </div>
  )
}
