import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Empty, Modal, Skeleton } from '@/components/classroom/Parts'
import { classroomApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { errorText } from '@/lib/classroom'
import { notify } from '@/lib/dialog'
import styles from './Classroom.module.css'

function JoinForm({ onJoined, autoFocus }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true)
    setError(null)
    try {
      const { classroom } = await classroomApi.join(code.trim().toUpperCase())
      setCode('')
      onJoined(classroom)
    } catch (err) {
      setError(err.status === 404 ? "No class uses that code. Check it with your tutor." : errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className={styles.joinWrap} onSubmit={submit}>
      <div className={styles.joinForm}>
        <input
          className={styles.input}
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(null) }}
          placeholder="Class code, e.g. VIBE-7KQ2MD"
          aria-label="Class code"
          autoComplete="off"
          spellCheck="false"
          autoFocus={autoFocus}
        />
        <button type="submit" className={styles.btnPrimary} disabled={busy || !code.trim()}>
          {busy ? 'Joining…' : 'Join'}
        </button>
      </div>
      {error && <p className={styles.formError} role="alert">{error}</p>}
    </form>
  )
}

function NewClassModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { classroom } = await classroomApi.create({ name, description })
      onCreated(classroom)
    } catch (err) {
      setError(errorText(err))
      setBusy(false)
    }
  }

  return (
    <Modal
      title="New class"
      description="You'll get a code to share with your students."
      onClose={onClose}
      footer={
        <>
          <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" form="new-class" className={styles.btnPrimary} disabled={busy || !name.trim()}>
            {busy ? 'Creating…' : 'Create class'}
          </button>
        </>
      }
    >
      <form id="new-class" onSubmit={submit}>
        <label className={styles.field}>
          <span>Name</span>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Web Foundations · Evening cohort" maxLength={120} />
        </label>
        <label className={styles.field}>
          <span>What it's about <small className={styles.muted}>(optional)</small></span>
          <textarea className={styles.textarea} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="When you meet, what students will build…" />
        </label>
        {error && <p className={styles.formError} role="alert">{error}</p>}
      </form>
    </Modal>
  )
}

function ClassCard({ room, tutor, stats }) {
  const initial = (room.name || 'C').trim().charAt(0).toUpperCase()
  return (
    <article className={`${styles.card} ${styles.classCard}`}>
      <div className={styles.classTop}>
        <span className={styles.monogram} aria-hidden="true">{initial}</span>
        <div style={{ minWidth: 0 }}>
          <h2 className={styles.className}><Link to={`/app/classrooms/${room.id}`}>{room.name}</Link></h2>
          <p className={styles.classBy}>
            {tutor
              ? `${room.member_count ?? 0} student${room.member_count === 1 ? '' : 's'}${room.archived ? ' · Archived' : ''}`
              : `with ${room.teacher_name}`}
          </p>
        </div>
      </div>
      {room.description && <p className={styles.classDesc}>{room.description}</p>}
      <div className={styles.classFoot}>
        {tutor && stats ? (
          <>
            {stats.toReview > 0 && <span className={styles.signal} data-tone="accent"><Icon name="checklist" size={15} />{stats.toReview} to review</span>}
            {stats.openQuestions > 0 && <span className={styles.signal}><Icon name="chat" size={15} />{stats.openQuestions} open question{stats.openQuestions === 1 ? '' : 's'}</span>}
            {!stats.toReview && !stats.openQuestions && <span className={styles.signal}><Icon name="check" size={15} />All caught up</span>}
          </>
        ) : tutor ? null : (
          <span className={styles.signal}><Icon name="classroom" size={15} />{room.member_count ?? 0} in this class</span>
        )}
        <Icon name="arrowRight" size={17} className={styles.classGo} />
      </div>
    </article>
  )
}

const HOW = [
  { icon: 'chat', title: 'Ask your tutor', text: 'Stuck on a lesson? Ask in the class, or privately, and paste the code that is confusing you.' },
  { icon: 'checklist', title: 'Hand in work', text: 'Your tutor sets small builds with due dates. Hand in your code or a link to what you made.' },
  { icon: 'note', title: 'Get feedback on your code', text: 'Your tutor can comment on single lines, so you know exactly what to change and why.' },
]

export default function ClassroomsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const tutor = currentUser?.role === 'teacher' || currentUser?.role === 'admin'
  const [state, setState] = useState({ loading: true, classes: [], error: null })
  const [stats, setStats] = useState({})
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let live = true
    classroomApi.list()
      .then((d) => { if (live) setState({ loading: false, classes: d.classrooms || [], error: null }) })
      .catch((err) => { if (live) setState({ loading: false, classes: [], error: errorText(err) }) })
    return () => { live = false }
  }, [])

  // Tutors see what's waiting in each class
  useEffect(() => {
    if (!tutor || state.classes.length === 0) return
    let live = true
    Promise.all(state.classes.map((c) => classroomApi.getStats(c.id).then((s) => [c.id, s]).catch(() => [c.id, null])))
      .then((rows) => { if (live) setStats(Object.fromEntries(rows)) })
    return () => { live = false }
  }, [tutor, state.classes])

  const joined = (room) => {
    notify({ title: `You joined ${room.name}`, tone: 'success' })
    navigate(`/app/classrooms/${room.id}`)
  }

  const active = state.classes.filter((c) => !c.archived)
  const archived = state.classes.filter((c) => c.archived)

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h1 className={styles.title}>Classes</h1>
          <p className={styles.lead}>
            {tutor
              ? 'See who needs a hand, review work and keep everyone moving.'
              : 'Learn alongside a tutor: ask questions, hand in work and get feedback on your code.'}
          </p>
        </div>
        {tutor ? (
          <button type="button" className={styles.btnPrimary} onClick={() => setCreating(true)}>
            <Icon name="plus" size={17} /> New class
          </button>
        ) : state.classes.length > 0 && (
          <JoinForm onJoined={joined} />
        )}
      </header>

      {state.loading ? (
        <div className={styles.classGrid}>
          {[0, 1].map((i) => <div key={i} className={`${styles.card} ${styles.classCard}`}><Skeleton lines={3} /></div>)}
        </div>
      ) : state.error ? (
        <div className={styles.card}>
          <Empty icon="close" title="Couldn't load your classes">{state.error}</Empty>
        </div>
      ) : state.classes.length === 0 ? (
        tutor ? (
          <div className={styles.card}>
            <Empty
              icon="classroom"
              title="No classes yet"
              action={<button type="button" className={styles.btnPrimary} onClick={() => setCreating(true)}><Icon name="plus" size={17} /> Create your first class</button>}
            >
              Create a class, share its code with your students, and they'll appear here.
            </Empty>
          </div>
        ) : (
          <>
            <section className={`${styles.card} ${styles.cardPad}`}>
              <h2 className={styles.sectionTitle}>Join your class</h2>
              <p className={styles.sectionSub} style={{ marginBottom: 14 }}>Your tutor will give you a code that starts with VIBE-.</p>
              <JoinForm onJoined={joined} autoFocus />
            </section>
            <div className={styles.howList}>
              {HOW.map((h) => (
                <div key={h.title} className={`${styles.card} ${styles.how}`}>
                  <Icon name={h.icon} size={22} className={styles.howIcon} />
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <>
          <div className={styles.classGrid}>
            {active.map((c) => <ClassCard key={c.id} room={c} tutor={tutor} stats={stats[c.id]} />)}
          </div>
          {archived.length > 0 && (
            <>
              <h2 className={styles.groupTitle} style={{ marginTop: 32 }}>Archived</h2>
              <div className={styles.classGrid}>
                {archived.map((c) => <ClassCard key={c.id} room={c} tutor={tutor} />)}
              </div>
            </>
          )}
        </>
      )}

      {creating && (
        <NewClassModal
          onClose={() => setCreating(false)}
          onCreated={(room) => {
            setCreating(false)
            notify({ title: 'Class created', body: 'Share the code on the class page with your students.', tone: 'success' })
            navigate(`/app/classrooms/${room.id}`)
          }}
        />
      )}
    </div>
  )
}
