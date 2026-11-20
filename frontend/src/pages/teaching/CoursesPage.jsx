import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Avatar, Empty, Modal, Pill, Skeleton } from '@/components/classroom/Parts'
import { studioApi } from '@/lib/api'
import { errorText, timeAgo } from '@/lib/classroom'
import { notify } from '@/lib/dialog'
import ui from '../classroom/Classroom.module.css'
import styles from './Teaching.module.css'
import { COURSE_COLORS, COURSE_ROLE, CourseSwatch, Faces, plural } from './shared'

export function ColorPicker({ value, onChange }) {
  return (
    <div className={styles.swatches} role="radiogroup" aria-label="Colour">
      {Object.entries(COURSE_COLORS).map(([name, hex]) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={value === name}
          aria-label={name}
          className={styles.swatchBtn}
          style={{ '--sw': hex }}
          onClick={() => onChange(name)}
        />
      ))}
    </div>
  )
}

function NewCourse({ onClose }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('violet')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const create = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { course } = await studioApi.createCourse({ title, description, color })
      navigate(`/app/teaching/courses/${course.id}`)
    } catch (err) {
      setError(err.data?.fields?.title?.[0] || errorText(err))
      setBusy(false)
    }
  }

  return (
    <Modal
      title="New course"
      description="Only you see it until you publish it and share it with a class. You can invite other tutors to build it with you."
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ui.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" form="new-course" className={ui.btnPrimary} disabled={busy || title.trim().length < 3}>{busy ? 'Creating…' : 'Create course'}</button>
        </>
      }
    >
      <form id="new-course" onSubmit={create}>
        <label className={ui.field}>
          <span>Name</span>
          <input className={ui.input} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} placeholder="e.g. APIs in an afternoon" autoFocus />
        </label>
        <label className={ui.field}>
          <span>What students will learn <small className={ui.muted}>(optional)</small></span>
          <textarea className={ui.textarea} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} placeholder="One or two sentences shown on the course card." />
        </label>
        <div className={ui.field}>
          <span>Colour</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        {error && <p className={ui.formError} role="alert">{error}</p>}
      </form>
    </Modal>
  )
}

function CourseCard({ course }) {
  return (
    <article className={`${ui.card} ${styles.courseCard}`}>
      <div className={styles.courseTop}>
        <CourseSwatch course={course} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className={styles.courseTitle}><Link to={`/app/teaching/courses/${course.id}`}>{course.title}</Link></h3>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <Pill tone={course.status === 'published' ? 'done' : 'muted'}>{course.status === 'published' ? 'Published' : 'Draft'}</Pill>
            <span className={ui.muted} style={{ fontSize: 12.5 }}>{COURSE_ROLE[course.role]}</span>
          </div>
        </div>
      </div>
      {course.description && <p className={styles.courseDesc}>{course.description}</p>}
      <div className={styles.courseFoot}>
        <span className={styles.courseFacts}>
          <span>{plural(course.lessons, 'lesson')}</span>
          {!course.official && <span>{course.classes ? `${plural(course.students, 'student')}` : 'Not shared yet'}</span>}
          <span>Edited {timeAgo(course.updated_at)}</span>
        </span>
        {course.team.length > 0 && <Faces people={course.team} size={24} max={3} />}
      </div>
    </article>
  )
}

export default function CoursesPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const creating = params.get('new') === '1'

  const load = () => studioApi.courses().then(setData).catch((err) => setError(errorText(err)))
  useEffect(() => { load() }, [])

  const setCreating = (on) => setParams(on ? { new: '1' } : {}, { replace: true })

  const accept = async (inv) => {
    try {
      const { course } = await studioApi.acceptInvite(inv.id)
      notify({ title: `You joined “${course.title}”`, tone: 'success' })
      navigate(`/app/teaching/courses/${course.id}`)
    } catch (err) {
      notify({ title: "Couldn't accept the invitation", body: errorText(err), tone: 'error' })
    }
  }

  const decline = async (inv) => {
    try {
      await studioApi.cancelInvite(inv.id)
      setData((d) => ({ ...d, invites: d.invites.filter((i) => i.id !== inv.id) }))
    } catch (err) {
      notify({ title: "Couldn't decline", body: errorText(err), tone: 'error' })
    }
  }

  const mine = data?.courses.filter((c) => !c.official) || []
  const official = data?.courses.filter((c) => c.official) || []

  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <div className={ui.headText}>
          <h1 className={ui.title}>Courses</h1>
          <p className={ui.lead}>Write your own lessons for your classes, alone or with other tutors. Only your team sees a course until you publish it and share it with a class.</p>
        </div>
        <button type="button" className={ui.btnPrimary} onClick={() => setCreating(true)}><Icon name="plus" size={17} /> New course</button>
      </header>

      {error ? (
        <div className={ui.card}><Empty icon="close" title="Couldn't load your courses">{error}</Empty></div>
      ) : !data ? (
        <div className={styles.courseGrid}>{[0, 1, 2].map((i) => <div key={i} className={`${ui.card} ${styles.courseCard}`}><Skeleton lines={4} /></div>)}</div>
      ) : (
        <>
          {data.invites.length > 0 && (
            <section style={{ marginBottom: 28 }} aria-labelledby="invites">
              <h2 id="invites" className={ui.groupTitle}>Invitations</h2>
              <ul className={`${ui.card} ${styles.list}`}>
                {data.invites.map((inv) => (
                  <li key={inv.id}>
                    <div className={styles.row}>
                      {inv.invited_by ? <Avatar user={inv.invited_by} size={36} /> : <span className={styles.rowIcon}><Icon name="people" size={18} /></span>}
                      <span className={styles.rowMain}>
                        <span className={styles.rowTitle}>{inv.course.title}</span>
                        <span className={styles.rowSub}>{inv.invited_by ? `${inv.invited_by.display_name} invited you` : 'You were invited'} {timeAgo(inv.created_at)} to edit this course with them</span>
                      </span>
                      <span className={styles.rowMeta}>
                        <button type="button" className={`${ui.btnGhost} ${ui.sm}`} onClick={() => decline(inv)}>Decline</button>
                        <button type="button" className={`${ui.btnPrimary} ${ui.sm}`} onClick={() => accept(inv)}>Accept</button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {mine.length ? (
            <section aria-labelledby="mine">
              <h2 id="mine" className={ui.groupTitle}>Your courses</h2>
              <div className={styles.courseGrid}>{mine.map((c) => <CourseCard key={c.id} course={c} />)}</div>
            </section>
          ) : (
            <div className={ui.card}>
              <Empty
                icon="book"
                title="You haven't made a course yet"
                action={<button type="button" className={ui.btnPrimary} onClick={() => setCreating(true)}><Icon name="plus" size={16} /> Start a course</button>}
              >
                Plan it as modules, write each lesson, add exercises, then share it with your classes when it's ready.
              </Empty>
            </div>
          )}

          {official.length > 0 && (
            <section aria-labelledby="official" style={{ marginTop: 32 }}>
              <h2 id="official" className={ui.groupTitle}>VibeSkool courses <span className={ui.muted}>· you can edit these as an admin</span></h2>
              <div className={styles.courseGrid}>{official.map((c) => <CourseCard key={c.id} course={c} />)}</div>
            </section>
          )}
        </>
      )}

      {creating && <NewCourse onClose={() => setCreating(false)} />}
    </div>
  )
}
