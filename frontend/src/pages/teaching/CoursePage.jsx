import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Avatar, Empty, Modal, Pill, Skeleton } from '@/components/classroom/Parts'
import { studioApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { errorText, timeAgo } from '@/lib/classroom'
import { confirmDialog, notify } from '@/lib/dialog'
import ui from '../classroom/Classroom.module.css'
import styles from './Teaching.module.css'
import { ColorPicker } from './CoursesPage'
import { COURSE_ROLE, CourseSwatch, plural } from './shared'

const newModuleId = () => `mod-${Math.random().toString(36).slice(2, 10)}`

/* ── Outline ──────────────────────────────────────────────── */
function Outline({ course, onSaved }) {
  const [modules, setModules] = useState(() => {
    const mods = course.modules.map((m) => ({ ...m, lessons: [...m.lessons] }))
    // Lessons outside any module (older content) go into the last module
    if (course.unsorted.length && mods.length) mods[mods.length - 1].lessons.push(...course.unsorted)
    return mods
  })
  const [saveState, setSaveState] = useState('saved')
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)
  const [adding, setAdding] = useState({})
  const timer = useRef(null)
  const latest = useRef(modules)
  latest.current = modules

  const save = useCallback(() => {
    clearTimeout(timer.current)
    setSaveState('saving')
    timer.current = setTimeout(async () => {
      try {
        const payload = latest.current.map((m) => ({ id: m.id, title: m.title.trim() || 'Untitled module', goal: m.goal, deliverables: m.deliverables, lessons: m.lessons.map((l) => l.id) }))
        const res = await studioApi.saveOutline(course.id, payload)
        setSaveState('saved')
        onSaved(res.course)
      } catch (err) {
        setSaveState('error')
        notify({ title: "Couldn't save the outline", body: errorText(err), tone: 'error' })
      }
    }, 450)
  }, [course.id, onSaved])

  useEffect(() => () => clearTimeout(timer.current), [])

  const update = (fn, persist = true) => {
    setModules((ms) => fn(ms.map((m) => ({ ...m, lessons: [...m.lessons] }))))
    if (persist) save()
  }

  const moveLesson = (lessonId, toModule, toIndex) => update((ms) => {
    let lesson
    ms.forEach((m) => {
      const i = m.lessons.findIndex((l) => l.id === lessonId)
      if (i >= 0) {
        lesson = m.lessons[i]
        m.lessons.splice(i, 1)
        if (m === ms[toModule] && i < toIndex) toIndex -= 1
      }
    })
    if (lesson) ms[toModule].lessons.splice(Math.max(0, toIndex), 0, lesson)
    return ms
  })

  const step = (mi, li, dir) => {
    const m = modules[mi]
    if (dir < 0 && li > 0) return moveLesson(m.lessons[li].id, mi, li - 1)
    if (dir > 0 && li < m.lessons.length - 1) return moveLesson(m.lessons[li].id, mi, li + 2)
    if (dir < 0 && li === 0 && mi > 0) return moveLesson(m.lessons[li].id, mi - 1, modules[mi - 1].lessons.length)
    if (dir > 0 && li === m.lessons.length - 1 && mi < modules.length - 1) return moveLesson(m.lessons[li].id, mi + 1, 0)
    return null
  }

  const moveModule = (mi, dir) => update((ms) => {
    const j = mi + dir
    if (j < 0 || j >= ms.length) return ms
    ;[ms[mi], ms[j]] = [ms[j], ms[mi]]
    return ms
  })

  const removeModule = async (mi) => {
    if (modules.length === 1) return
    const ok = await confirmDialog({ title: `Remove “${modules[mi].title}”?`, body: 'The module is empty, so no lessons are affected.', confirmLabel: 'Remove module' })
    if (ok) update((ms) => ms.filter((_, i) => i !== mi))
  }

  const addModule = () => update((ms) => [...ms, { id: newModuleId(), title: `Module ${ms.length + 1}`, goal: '', deliverables: '', lessons: [] }])

  const addLesson = async (mi) => {
    const title = (adding[mi] || '').trim()
    if (title.length < 2) return
    try {
      // Save any pending outline change first so the new lesson lands in the right module
      clearTimeout(timer.current)
      const payload = latest.current.map((m) => ({ id: m.id, title: m.title.trim() || 'Untitled module', goal: m.goal, deliverables: m.deliverables, lessons: m.lessons.map((l) => l.id) }))
      await studioApi.saveOutline(course.id, payload)
      const { lesson } = await studioApi.addLesson(course.id, { title, moduleId: modules[mi].id })
      setAdding((a) => ({ ...a, [mi]: '' }))
      update((ms) => {
        ms[mi].lessons.push({ id: lesson.id, title: lesson.title, duration: lesson.duration, published: false, sections: 1, exercises: 0, updated_at: lesson.updated_at })
        return ms
      }, false)
      const res = await studioApi.course(course.id)
      onSaved(res.course)
    } catch (err) {
      notify({ title: "Couldn't add the lesson", body: errorText(err), tone: 'error' })
    }
  }

  return (
    <section aria-labelledby="outline">
      <div className={styles.blockHead}>
        <h2 id="outline">Outline</h2>
        <span className={styles.saving} aria-live="polite">
          {saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Not saved' : 'Saved'}
        </span>
      </div>

      {modules.map((m, mi) => (
        <div key={m.id} className={`${ui.card} ${styles.module}`}>
          <div className={styles.moduleHead}>
            <span className={styles.moduleNum}>{String(mi + 1).padStart(2, '0')}</span>
            <input
              className={styles.moduleTitle}
              value={m.title}
              onChange={(e) => { const v = e.target.value; update((ms) => { ms[mi].title = v; return ms }, false) }}
              onBlur={save}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
              aria-label={`Module ${mi + 1} title`}
              maxLength={80}
            />
            <span className={styles.moveBtns}>
              <button type="button" className={styles.tinyBtn} onClick={() => moveModule(mi, -1)} disabled={mi === 0} aria-label="Move module up"><Icon name="chevronDown" size={15} style={{ transform: 'rotate(180deg)' }} /></button>
              <button type="button" className={styles.tinyBtn} onClick={() => moveModule(mi, 1)} disabled={mi === modules.length - 1} aria-label="Move module down"><Icon name="chevronDown" size={15} /></button>
              {m.lessons.length === 0 && modules.length > 1 && (
                <button type="button" className={styles.tinyBtn} onClick={() => removeModule(mi)} aria-label="Remove module"><Icon name="trash" size={15} /></button>
              )}
            </span>
          </div>

          <ul
            className={styles.lessons}
            data-over={over === `m-${mi}` || undefined}
            onDragOver={(e) => { if (drag) { e.preventDefault(); if (!m.lessons.length) setOver(`m-${mi}`) } }}
            onDragLeave={() => setOver((o) => (o === `m-${mi}` ? null : o))}
            onDrop={(e) => { e.preventDefault(); if (drag) moveLesson(drag, mi, m.lessons.length); setDrag(null); setOver(null) }}
          >
            {m.lessons.length === 0 && <li className={styles.emptyModule}>No lessons yet. Add one below, or drag one here.</li>}
            {m.lessons.map((l, li) => (
              <li
                key={l.id}
                onDragOver={(e) => { if (drag && drag !== l.id) { e.preventDefault(); e.stopPropagation(); setOver(l.id) } }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (drag && drag !== l.id) moveLesson(drag, mi, li); setDrag(null); setOver(null) }}
              >
                <div className={styles.lesson} data-dragging={drag === l.id || undefined} data-over={over === l.id || undefined}>
                  <span
                    className={styles.grip}
                    draggable
                    onDragStart={(e) => { setDrag(l.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', l.id) }}
                    onDragEnd={() => { setDrag(null); setOver(null) }}
                    title="Drag to move"
                    aria-hidden="true"
                  >
                    <Icon name="list" size={15} />
                  </span>
                  <Link to={`/app/teaching/courses/${course.id}/lessons/${l.id}`} className={styles.lessonLink}>
                    <span className={styles.rowTitle}>{l.title}</span>
                    <span className={styles.rowSub}>
                      {l.duration || 'No length set'} · {plural(l.sections, 'section')}
                      {l.exercises ? ` · ${plural(l.exercises, 'exercise')}` : ''}
                      {l.updated_by ? ` · edited by ${l.updated_by} ${timeAgo(l.updated_at)}` : ''}
                    </span>
                  </Link>
                  <Pill tone={l.published ? 'done' : 'muted'}>{l.published ? 'Published' : 'Draft'}</Pill>
                  <span className={styles.moveBtns}>
                    <button type="button" className={styles.tinyBtn} onClick={() => step(mi, li, -1)} disabled={mi === 0 && li === 0} aria-label={`Move ${l.title} up`}><Icon name="chevronDown" size={15} style={{ transform: 'rotate(180deg)' }} /></button>
                    <button type="button" className={styles.tinyBtn} onClick={() => step(mi, li, 1)} disabled={mi === modules.length - 1 && li === m.lessons.length - 1} aria-label={`Move ${l.title} down`}><Icon name="chevronDown" size={15} /></button>
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <form className={styles.addRow} onSubmit={(e) => { e.preventDefault(); addLesson(mi) }}>
            <input
              className={ui.input}
              value={adding[mi] || ''}
              onChange={(e) => setAdding((a) => ({ ...a, [mi]: e.target.value }))}
              placeholder="New lesson title"
              aria-label={`New lesson in ${m.title}`}
              maxLength={200}
            />
            <button type="submit" className={`${ui.btnGhost} ${ui.sm}`} disabled={(adding[mi] || '').trim().length < 2}><Icon name="plus" size={15} /> Add lesson</button>
          </form>
        </div>
      ))}

      <button type="button" className={ui.btnGhost} onClick={addModule} style={{ marginTop: 14 }}>
        <Icon name="plus" size={16} /> Add a module
      </button>
    </section>
  )
}

/* ── Team ─────────────────────────────────────────────────── */
function Team({ course, me, onChange }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const manage = course.permissions.manage

  const invite = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { invite: inv } = await studioApi.invite(course.id, email)
      onChange({ ...course, invites: [inv, ...course.invites] })
      setEmail('')
      notify({ title: 'Invitation sent', body: `If ${inv.email} has a tutor account, they'll see it on their Courses page.`, tone: 'success' })
    } catch (err) {
      notify({ title: "Couldn't invite them", body: err.data?.fields?.email?.[0] || errorText(err), tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const cancel = async (inv) => {
    await studioApi.cancelInvite(inv.id)
    onChange({ ...course, invites: course.invites.filter((i) => i.id !== inv.id) })
  }

  const remove = async (m) => {
    const leaving = m.id === me.id
    const ok = await confirmDialog({
      tone: 'danger',
      title: leaving ? 'Leave this course?' : `Remove ${m.display_name}?`,
      body: leaving ? "You won't be able to see or edit it unless someone invites you again." : "They won't be able to see or edit the course any more. Their lessons stay.",
      confirmLabel: leaving ? 'Leave course' : 'Remove',
    })
    if (!ok) return
    try {
      await studioApi.removeMember(course.id, m.id)
      if (leaving) { notify({ title: `You left “${course.title}”`, tone: 'success' }); navigate('/app/teaching/courses'); return }
      onChange({ ...course, team: course.team.filter((x) => x.id !== m.id) })
    } catch (err) {
      notify({ title: "Couldn't do that", body: errorText(err), tone: 'error' })
    }
  }

  const handOver = async (m) => {
    const ok = await confirmDialog({ title: `Make ${m.display_name} the owner?`, body: "They'll manage the team and can delete the course. You stay on as an editor.", confirmLabel: 'Hand over' })
    if (!ok) return
    try {
      const res = await studioApi.makeOwner(course.id, m.id)
      onChange(res.course)
      notify({ title: `${m.display_name} now owns the course`, tone: 'success' })
    } catch (err) {
      notify({ title: "Couldn't hand it over", body: errorText(err), tone: 'error' })
    }
  }

  return (
    <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="team">
      <h2 id="team" className={ui.sectionTitle}>Team</h2>
      <p className={styles.hint} style={{ marginTop: 2, marginBottom: 8 }}>Everyone here can edit lessons and exercises. The owner also manages the team.</p>
      {course.team.map((m) => (
        <div key={m.id} className={styles.member}>
          <Avatar user={m} size={32} />
          <span className={styles.memberMain}>
            <span className={styles.memberName}>{m.display_name}{m.id === me.id ? ' (you)' : ''}</span>
            <span className={styles.memberRole}>{COURSE_ROLE[m.course_role]}</span>
          </span>
          {manage && m.course_role !== 'owner' && (
            <>
              <button type="button" className={styles.tinyBtn} onClick={() => handOver(m)} title="Make owner" aria-label={`Make ${m.display_name} the owner`}><Icon name="key" size={15} /></button>
              <button type="button" className={styles.tinyBtn} onClick={() => remove(m)} title="Remove" aria-label={`Remove ${m.display_name}`}><Icon name="close" size={15} /></button>
            </>
          )}
          {!manage && m.id === me.id && course.role !== 'admin' && (
            <button type="button" className={ui.textBtn} data-tone="danger" onClick={() => remove(m)}>Leave</button>
          )}
        </div>
      ))}

      {course.invites.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {course.invites.map((inv) => (
            <div key={inv.id} className={styles.member}>
              <span className={styles.rowIcon} style={{ width: 32, height: 32 }}><Icon name="send" size={15} /></span>
              <span className={styles.memberMain}>
                <span className={styles.memberName} style={{ overflowWrap: 'anywhere' }}>{inv.email}</span>
                <span className={styles.memberRole}>Invited {timeAgo(inv.created_at)}</span>
              </span>
              {manage && <button type="button" className={ui.textBtn} onClick={() => cancel(inv)}>Cancel</button>}
            </div>
          ))}
        </div>
      )}

      {manage && (
        <>
          <form className={styles.inviteForm} onSubmit={invite}>
            <input className={ui.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tutor's email" aria-label="Email of the tutor to invite" />
            <button type="submit" className={`${ui.btnPrimary} ${ui.sm}`} disabled={busy || !email.includes('@')}>Invite</button>
          </form>
          <p className={styles.hint}>They'll see the invitation on their Courses page. Only tutor accounts can join.</p>
        </>
      )}
    </section>
  )
}

/* ── Sharing ──────────────────────────────────────────────── */
function Sharing({ course, onChange }) {
  const [busy, setBusy] = useState(false)
  if (course.official) {
    return (
      <section className={`${ui.card} ${ui.cardPad}`}>
        <h2 className={ui.sectionTitle}>Who can see it</h2>
        <p className={styles.hint}>This is a VibeSkool course: everyone sees it once it's published.</p>
      </section>
    )
  }
  const toggle = async (room) => {
    const ids = course.my_classes.filter((c) => (c.id === room.id ? !c.linked : c.linked)).map((c) => c.id)
    setBusy(true)
    try {
      const res = await studioApi.setClasses(course.id, ids)
      onChange(res.course)
    } catch (err) {
      notify({ title: "Couldn't change that", body: errorText(err), tone: 'error' })
    } finally {
      setBusy(false)
    }
  }
  const others = course.linked_classes.filter((c) => !c.mine)
  return (
    <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="sharing">
      <h2 id="sharing" className={ui.sectionTitle}>Who can see it</h2>
      <p className={styles.hint} style={{ marginTop: 2, marginBottom: 6 }}>
        {course.status === 'published'
          ? `Published. ${course.students ? `${plural(course.students, 'student')} in the classes below can open it.` : 'Share it with a class so students can open it.'}`
          : 'A draft: only your team sees it. Students in the classes below will see it once you publish.'}
      </p>
      {course.my_classes.length ? course.my_classes.map((c) => (
        <label key={c.id} className={styles.checkRow}>
          <input type="checkbox" checked={c.linked} disabled={busy} onChange={() => toggle(c)} aria-label={`Share with ${c.name}`} />
          <span>{c.name}</span>
          <span>{plural(c.students, 'student')}</span>
        </label>
      )) : <p className={styles.hint}>You don't teach a class yet. <Link to="/app/classrooms" className={ui.textBtn} data-tone="accent">Create one</Link></p>}
      {others.length > 0 && (
        <p className={styles.hint}>Also shared by teammates with: {others.map((c) => `${c.name} (${c.teacher_name})`).join(', ')}.</p>
      )}
    </section>
  )
}

/* ── Settings ─────────────────────────────────────────────── */
function Settings({ course, onClose, onSaved }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description)
  const [color, setColor] = useState(course.color || 'violet')
  const [busy, setBusy] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await studioApi.updateCourse(course.id, { title, description, color })
      onSaved(res.course)
      onClose()
    } catch (err) {
      notify({ title: "Couldn't save", body: err.data?.fields?.title?.[0] || errorText(err), tone: 'error' })
      setBusy(false)
    }
  }

  const remove = async () => {
    const ok = await confirmDialog({
      tone: 'danger', title: `Delete “${course.title}”?`,
      body: `Its ${plural(course.lessons, 'lesson')} and their exercises are deleted for the whole team, and students lose access. This can’t be undone.`,
      confirmLabel: 'Delete course',
    })
    if (!ok) return
    try {
      await studioApi.deleteCourse(course.id)
      notify({ title: 'Course deleted', tone: 'success' })
      navigate('/app/teaching/courses')
    } catch (err) {
      notify({ title: "Couldn't delete it", body: errorText(err), tone: 'error' })
    }
  }

  return (
    <Modal
      title="Course settings"
      onClose={onClose}
      footer={
        <>
          {course.permissions.manage && !course.official && (
            <button type="button" className={ui.btnDanger} onClick={remove} style={{ marginRight: 'auto' }}><Icon name="trash" size={16} /> Delete</button>
          )}
          <button type="button" className={ui.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" form="course-settings" className={ui.btnPrimary} disabled={busy || title.trim().length < 3}>{busy ? 'Saving…' : 'Save'}</button>
        </>
      }
    >
      <form id="course-settings" onSubmit={save}>
        <label className={ui.field}>
          <span>Name</span>
          <input className={ui.input} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
        </label>
        <label className={ui.field}>
          <span>What students will learn</span>
          <textarea className={ui.textarea} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} />
        </label>
        <div className={ui.field}>
          <span>Colour</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      </form>
    </Modal>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function CoursePage() {
  const { courseId } = useParams()
  const { currentUser } = useAuth()
  const [course, setCourse] = useState(null)
  const [error, setError] = useState(null)
  const [settings, setSettings] = useState(false)
  const [outlineKey, setOutlineKey] = useState(0)

  useEffect(() => {
    setCourse(null)
    studioApi.course(courseId).then((d) => setCourse(d.course)).catch((err) => setError(err.status === 404 ? "This course doesn't exist, or you're not on its team." : errorText(err)))
  }, [courseId])

  const publish = async (status) => {
    try {
      const res = await studioApi.updateCourse(course.id, { status })
      setCourse(res.course)
      notify({
        title: status === 'published' ? 'Course published' : 'Back to draft',
        body: status === 'published'
          ? (res.course.classes ? 'Students in the shared classes can open it now.' : 'Share it with a class so students can open it.')
          : 'Students no longer see it.',
        tone: 'success',
      })
    } catch (err) {
      notify({ title: "Couldn't change that", body: err.data?.fields?.status?.[0] || errorText(err), tone: 'error' })
    }
  }

  if (error) {
    return (
      <div className={ui.page}>
        <Link to="/app/teaching/courses" className={ui.crumb}><Icon name="arrowLeft" size={15} /> Courses</Link>
        <div className={ui.card}><Empty icon="lock" title="Couldn't open this course">{error}</Empty></div>
      </div>
    )
  }
  if (!course) {
    return <div className={ui.page}><div style={{ maxWidth: 480, marginBottom: 24 }}><Skeleton lines={3} /></div><div className={`${ui.card} ${ui.cardPad}`}><Skeleton lines={6} /></div></div>
  }

  const published = course.status === 'published'
  const me = { id: currentUser.id }

  return (
    <div className={ui.page}>
      <Link to="/app/teaching/courses" className={ui.crumb}><Icon name="arrowLeft" size={15} /> Courses</Link>
      <header className={styles.editorHead}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <CourseSwatch course={course} size={52} />
          <div style={{ minWidth: 0 }}>
            <h1 className={ui.title}>{course.title}</h1>
            <div className={ui.facts}>
              <Pill tone={published ? 'done' : 'muted'}>{published ? 'Published' : 'Draft'}</Pill>
              <span>{plural(course.lessons, 'lesson')} ({course.published_lessons} published)</span>
              <span>You're {course.role === 'admin' ? 'an admin' : `the ${COURSE_ROLE[course.role].toLowerCase()}`}</span>
            </div>
            {course.description && <p className={ui.lead} style={{ fontSize: 15 }}>{course.description}</p>}
          </div>
        </div>
        <div className={styles.headActions}>
          <Link to={`/app/paths/${course.id}`} className={ui.btnGhost} title="See it the way students will"><Icon name="eye" size={16} /> Preview</Link>
          <button type="button" className={ui.btnGhost} onClick={() => setSettings(true)}><Icon name="settings" size={16} /> Settings</button>
          {published
            ? <button type="button" className={ui.btnGhost} onClick={() => publish('draft')}>Unpublish</button>
            : (
              <button
                type="button"
                className={ui.btnPrimary}
                onClick={() => publish('published')}
                disabled={!course.published_lessons}
                title={course.published_lessons ? undefined : 'Publish at least one lesson first'}
              >
                Publish course
              </button>
            )}
        </div>
      </header>

      {!published && !course.published_lessons && course.lessons > 0 && (
        <div className={styles.readOnly}><Icon name="idea" size={17} /> Open a lesson and switch on “Published” when it's ready. Then you can publish the course.</div>
      )}

      <div className={styles.layout}>
        <Outline key={outlineKey} course={course} onSaved={(c) => setCourse((prev) => ({ ...prev, ...c }))} />
        <aside className={styles.side}>
          <Sharing course={course} onChange={setCourse} />
          {!course.official && <Team course={course} me={me} onChange={setCourse} />}
        </aside>
      </div>

      {settings && (
        <Settings
          course={course}
          onClose={() => setSettings(false)}
          onSaved={(c) => { setCourse(c); setOutlineKey((k) => k + 1) }}
        />
      )}
    </div>
  )
}
