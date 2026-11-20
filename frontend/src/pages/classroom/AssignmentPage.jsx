import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import Icon from '@/components/icons/Icons'
import CodeReview from '@/components/classroom/CodeReview'
import { Avatar, Empty, Pill, Skeleton } from '@/components/classroom/Parts'
import { classroomApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { dueLabel, errorText, KIND, OPEN_STATUSES, STATUS, timeAgo } from '@/lib/classroom'
import { confirmDialog, notify } from '@/lib/dialog'
import { detectLanguage } from '@/lib/highlight'
import { LiveProvider, useLive } from '@/lib/live'
import { AssignmentModal } from './Classwork'
import styles from './Classroom.module.css'

function useIsDark() {
  const get = () => document.documentElement.getAttribute('data-theme') === 'dark'
  const [dark, setDark] = useState(get)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(get()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

const LANGS = { html: () => [html()], css: () => [css()], js: () => [javascript({ jsx: true })], json: () => [javascript()], python: () => [python()] }

function CodeEditor({ value, onChange }) {
  const dark = useIsDark()
  const lang = detectLanguage(value || '<')
  const extensions = useMemo(() => [...(LANGS[lang]?.() || LANGS.html()), EditorView.lineWrapping], [lang])
  return (
    <div className={styles.editorShell}>
      <div className={styles.editorBar}><span>Your code</span></div>
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={dark ? 'dark' : 'light'}
        extensions={extensions}
        minHeight="260px"
        maxHeight="560px"
        basicSetup={{ foldGutter: false, highlightActiveLineGutter: true }}
      />
    </div>
  )
}

/* General (not line-specific) feedback on a submission */
function Feedback({ comments, onSend, placeholder }) {
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const general = comments.filter((c) => !c.line)
  const send = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    const ok = await onSend({ body: body.trim() })
    setBusy(false)
    if (ok) setBody('')
  }
  return (
    <section className={`${styles.card} ${styles.cardPad}`}>
      <h2 className={styles.panelTitle}>Feedback</h2>
      {general.length > 0 ? (
        <div className={styles.general}>
          {general.map((c) => (
            <div key={c.id} className={styles.generalItem}>
              <Avatar user={c.author} size={30} />
              <div className={styles.replyBox}>
                <p className={styles.replyMeta}>
                  <strong>{c.author.display_name}</strong>
                  {c.author.role === 'teacher' && <span className={styles.tag} data-tone="accent">Tutor</span>}
                  <span>{timeAgo(c.created_at)}</span>
                </p>
                <p className={styles.replyText}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.muted}>No general comments yet.</p>
      )}
      <form className={styles.replyForm} data-active={body ? true : undefined} onSubmit={send}>
        <div className={styles.replyFormMain}>
          <textarea className={styles.textarea} value={body} onChange={(e) => setBody(e.target.value)} placeholder={placeholder} aria-label="Write a comment" />
          {body && (
            <div className={styles.replyFormRow}>
              <button type="submit" className={`${styles.btnPrimary} ${styles.sm}`} disabled={busy}>{busy ? 'Sending…' : 'Send'}</button>
            </div>
          )}
        </div>
      </form>
    </section>
  )
}

const STUDENT_MESSAGE = {
  not_started: null,
  missing: { title: 'This is past its due date', text: "Hand in what you have. Your tutor would rather see unfinished work than nothing." },
  submitted: { title: 'Handed in', text: "Your tutor will review it and leave feedback here. You can still change it until then." },
  changes_requested: { title: 'Your tutor asked for changes', text: 'Read the highlighted lines and the feedback below, fix them, then hand in again.' },
  approved: { title: 'Approved', text: 'Nice work. Your tutor signed this one off.' },
  done: { title: 'Done', text: 'You finished the lesson for this assignment.' },
}

/* ── Student view ─────────────────────────────────────────── */
function StudentView({ room, assignment, reload }) {
  const sub = assignment.submission
  const status = assignment.status
  const [editing, setEditing] = useState(!sub)
  const [code, setCode] = useState(sub?.code || assignment.starter_code || '')
  const [link, setLink] = useState(sub?.link || '')
  const [note, setNote] = useState(sub?.note || '')
  const [busy, setBusy] = useState(false)
  const msg = STUDENT_MESSAGE[status]

  const handIn = async () => {
    setBusy(true)
    try {
      await classroomApi.handIn(room.id, assignment.id, assignment.kind === 'code' ? { code, note } : { link, note })
      notify({ title: sub ? 'Handed in again' : 'Handed in', body: 'Your tutor can see it now.', tone: 'success' })
      setEditing(false)
      await reload()
    } catch (err) {
      notify({ title: "Couldn't hand it in", body: errorText(err), tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const comment = async (data) => {
    try {
      await classroomApi.comment(room.id, sub.id, data)
      await reload()
      return true
    } catch (err) {
      notify({ title: "Couldn't send that", body: errorText(err), tone: 'error' })
      return false
    }
  }

  const tone = STATUS[status]?.tone
  return (
    <div className={styles.stack}>
      {msg && (
        <div className={styles.statusBox} data-tone={tone}>
          <Icon name={status === 'approved' || status === 'done' ? 'check' : status === 'changes_requested' ? 'note' : 'clock'} size={20} className={styles.statusIcon} />
          <div>
            <p className={styles.statusTitle}>{msg.title}</p>
            <p className={styles.statusText}>{msg.text}{sub?.score != null ? ` Score: ${sub.score}/100.` : ''}</p>
          </div>
        </div>
      )}

      {assignment.instructions && (
        <section className={`${styles.card} ${styles.cardPad}`}>
          <h2 className={styles.panelTitle}>Instructions</h2>
          <p className={styles.instructions}>{assignment.instructions}</p>
        </section>
      )}

      {assignment.kind === 'lesson' && assignment.lesson && (
        <section className={`${styles.card} ${styles.cardPad}`}>
          <h2 className={styles.panelTitle}>The lesson</h2>
          <p className={styles.muted} style={{ marginBottom: 14 }}>{assignment.lesson.title}</p>
          <Link to={`/app/paths/${assignment.lesson.pathId}/lessons/${assignment.lesson.id}`} className={styles.btnPrimary}>
            {status === 'done' ? 'Open the lesson again' : 'Start the lesson'} <Icon name="arrowRight" size={16} />
          </Link>
        </section>
      )}

      {assignment.kind !== 'lesson' && (editing ? (
        <section>
          {sub?.comments?.some((c) => c.line) && (
            <div className={`${styles.card} ${styles.cardPad}`} style={{ marginBottom: 14 }}>
              <h2 className={styles.panelTitle}>What your tutor pointed out</h2>
              <ul className={styles.miniList}>
                {sub.comments.filter((c) => c.line).sort((a, b) => a.line - b.line).map((c) => (
                  <li key={c.id} className={styles.generalItem} style={{ padding: '6px 0', opacity: c.outdated ? 0.72 : 1 }}>
                    <span className={styles.tag} style={{ flexShrink: 0, fontFamily: 'var(--font-mono)' }}>Line {c.line}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.55 }}>
                      {c.body}
                      {c.outdated && <> <Pill tone="done">You changed this line</Pill></>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {assignment.kind === 'code' ? (
            <CodeEditor value={code} onChange={setCode} />
          ) : (
            <label className={styles.field}>
              <span>Link to your work</span>
              <input className={styles.input} type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://your-site.netlify.app" />
            </label>
          )}
          <label className={styles.field} style={{ marginTop: 14 }}>
            <span>Note to your tutor <small className={styles.muted}>(optional)</small></span>
            <textarea className={styles.textarea} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything you're unsure about, or want them to look at first" />
          </label>
          <div className={styles.handIn}>
            {sub && <button type="button" className={styles.btnGhost} onClick={() => setEditing(false)}>Cancel</button>}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handIn}
              disabled={busy || (assignment.kind === 'code' ? !code.trim() : !link.trim())}
            >
              {busy ? 'Handing in…' : sub ? 'Hand in again' : 'Hand in'}
            </button>
          </div>
        </section>
      ) : sub && (
        <section className={styles.stack}>
          <div className={styles.workHead} style={{ marginBottom: 0 }}>
            <p className={styles.muted}>Handed in {timeAgo(sub.submitted_at)}{sub.late ? ' · late' : ''}</p>
            {status !== 'approved' && (
              <button type="button" className={`${styles.btnGhost} ${styles.sm}`} onClick={() => setEditing(true)}>
                <Icon name="pen" size={15} /> {status === 'changes_requested' ? 'Make the changes' : 'Edit'}
              </button>
            )}
          </div>
          {assignment.kind === 'code'
            ? <CodeReview code={sub.code} comments={sub.comments} onComment={comment} />
            : <a href={sub.link} target="_blank" rel="noreferrer" className={styles.linkOut}><Icon name="arrowUpRight" size={16} />{sub.link}</a>}
          {sub.note && <p className={styles.note}><strong>Your note:</strong> {sub.note}</p>}
          <Feedback comments={sub.comments} onSend={comment} placeholder="Reply to your tutor…" />
        </section>
      ))}
    </div>
  )
}

/* ── Tutor view ───────────────────────────────────────────── */
function Review({ room, sid, onReviewed }) {
  const [sub, setSub] = useState(null)
  const [error, setError] = useState(null)
  const [score, setScore] = useState('')
  const [busy, setBusy] = useState(null)

  const load = useCallback(() => classroomApi.submission(room.id, sid)
    .then((d) => { setSub(d.submission); setScore(d.submission.score ?? '') })
    .catch((err) => setError(errorText(err))), [room.id, sid])

  useEffect(() => { setSub(null); setError(null); load() }, [load])
  useLive(['work'], (e) => { if (e.topic === 'poll' || e.topic === '*' || e.data?.submissionId === sid) load() })

  const comment = async (data) => {
    try {
      await classroomApi.comment(room.id, sid, data)
      await load()
      return true
    } catch (err) {
      notify({ title: "Couldn't add the comment", body: errorText(err), tone: 'error' })
      return false
    }
  }

  const verdict = async (status) => {
    setBusy(status)
    try {
      const { submission } = await classroomApi.review(room.id, sid, { status, score: score === '' ? null : Number(score) })
      setSub(submission)
      notify({ title: status === 'approved' ? 'Approved' : 'Changes requested', body: `${submission.student.display_name} can see your feedback now.`, tone: 'success' })
      onReviewed()
    } catch (err) {
      notify({ title: "Couldn't save the review", body: errorText(err), tone: 'error' })
    } finally {
      setBusy(null)
    }
  }

  if (error) return <div className={styles.card}><Empty icon="close" title="Couldn't load this work">{error}</Empty></div>
  if (!sub) return <div className={`${styles.card} ${styles.cardPad}`}><Skeleton lines={6} /></div>

  return (
    <div className={styles.stack}>
      <div className={styles.workHead} style={{ marginBottom: 0 }}>
        <div className={styles.helpWho}>
          <Avatar user={sub.student} size={36} />
          <div>
            <p className={styles.personName}>{sub.student.display_name}</p>
            <p className={styles.personSub}>Handed in {timeAgo(sub.submitted_at)}{sub.late ? ' · late' : ''}</p>
          </div>
        </div>
        <Pill tone={STATUS[sub.status]?.tone}>{STATUS[sub.status]?.label}</Pill>
      </div>
      {sub.note && <p className={styles.note}><strong>Note from {sub.student.display_name.split(' ')[0]}:</strong> {sub.note}</p>}
      {sub.code
        ? <CodeReview code={sub.code} comments={sub.comments} onComment={comment} title="Hover a line and press + to comment on it" />
        : sub.link && <a href={sub.link} target="_blank" rel="noreferrer" className={styles.linkOut}><Icon name="arrowUpRight" size={16} />{sub.link}</a>}
      <Feedback comments={sub.comments} onSend={comment} placeholder="Overall feedback for the student…" />
      <div className={styles.verdict}>
        <label className={styles.check}>
          Score
          <input className={styles.input} type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} placeholder="–" aria-label="Score out of 100" />
          <span className={styles.muted}>/ 100, optional</span>
        </label>
        <span className={styles.verdictSpacer} />
        <button type="button" className={styles.btnGhost} onClick={() => verdict('changes_requested')} disabled={Boolean(busy)}>
          {busy === 'changes_requested' ? 'Saving…' : 'Request changes'}
        </button>
        <button type="button" className={styles.btnPrimary} onClick={() => verdict('approved')} disabled={Boolean(busy)}>
          <Icon name="check" size={16} /> {busy === 'approved' ? 'Saving…' : 'Approve'}
        </button>
      </div>
    </div>
  )
}

function TutorView({ room, assignment, reload }) {
  const [params, setParams] = useSearchParams()
  const roster = assignment.roster || []
  const withWork = roster.filter((r) => r.submissionId)
  const picked = params.get('student')
  const current = roster.find((r) => r.student.id === picked && r.submissionId)
    || withWork.find((r) => r.status === 'submitted') || withWork[0]

  const pick = (id) => {
    const next = new URLSearchParams(params)
    next.set('student', id)
    setParams(next, { replace: true })
  }

  const order = { submitted: 0, changes_requested: 1, missing: 2, not_started: 3, approved: 4, done: 5 }
  const sorted = [...roster].sort((a, b) => order[a.status] - order[b.status])

  return (
    <div className={styles.stack}>
      {assignment.instructions && (
        <details className={`${styles.card} ${styles.cardPad}`}>
          <summary className={styles.panelTitle} style={{ marginBottom: 0, cursor: 'pointer' }}>Instructions</summary>
          <p className={styles.instructions} style={{ marginTop: 12 }}>{assignment.instructions}</p>
        </details>
      )}
      <div className={styles.reviewLayout}>
        <ul className={`${styles.card} ${styles.roster}`} aria-label="Students">
          {sorted.map((r) => (
            <li key={r.student.id}>
              <button
                type="button"
                className={styles.rosterRow}
                aria-current={current?.student.id === r.student.id}
                disabled={!r.submissionId}
                onClick={() => pick(r.student.id)}
              >
                <Avatar user={r.student} size={30} />
                <span className={styles.rosterMain}>
                  <span className={styles.rosterName}>{r.student.display_name}</span>
                  <Pill tone={STATUS[r.status]?.tone}>{STATUS[r.status]?.label}{r.late ? ' · late' : ''}</Pill>
                </span>
              </button>
            </li>
          ))}
          {roster.length === 0 && <li className={styles.muted} style={{ padding: 10 }}>No students in this class yet.</li>}
        </ul>
        <div>
          {assignment.kind === 'lesson' ? (
            <div className={styles.card}>
              <Empty icon="book" title="Done by finishing the lesson">
                {roster.filter((r) => r.status === 'done').length} of {roster.length} students have finished “{assignment.lesson?.title}”.
              </Empty>
            </div>
          ) : current ? (
            <Review key={current.submissionId} room={room} sid={current.submissionId} onReviewed={reload} />
          ) : (
            <div className={styles.card}>
              <Empty icon="clock" title="Nothing handed in yet">Work shows up here as students hand it in.</Empty>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function AssignmentPage() {
  const { classroomId, assignmentId } = useParams()
  return (
    <LiveProvider classroomId={classroomId}>
      <AssignmentView key={assignmentId} classroomId={classroomId} assignmentId={assignmentId} />
    </LiveProvider>
  )
}

function AssignmentView({ classroomId, assignmentId }) {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [room, setRoom] = useState(null)
  const [assignment, setAssignment] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)

  const reload = useCallback(() => classroomApi.assignment(classroomId, assignmentId)
    .then((d) => setAssignment(d.assignment))
    .catch((err) => setError(errorText(err))), [classroomId, assignmentId])

  useEffect(() => {
    classroomApi.get(classroomId).then(setRoom).catch((err) => setError(errorText(err)))
    reload()
  }, [classroomId, reload])

  // Handed in, reviewed, commented on, edited, or a lesson finished: refresh
  useLive(['work', 'people'], (e) => {
    const mine = e.data?.assignmentId === Number(assignmentId)
    if (e.action === 'assignment.deleted' && mine) {
      notify({ title: 'This assignment was deleted', tone: 'error' })
      navigate(`/app/classrooms/${classroomId}?tab=work`)
      return
    }
    if (mine || !e.data?.assignmentId) reload()
  })

  const tutor = Boolean(room?.is_tutor)
  const back = `/app/classrooms/${classroomId}?tab=work`

  const remove = async () => {
    const ok = await confirmDialog({ tone: 'danger', title: 'Delete this assignment?', body: "Students' handed-in work and your feedback on it will be deleted too. This can’t be undone.", confirmLabel: 'Delete assignment' })
    if (!ok) return
    try {
      await classroomApi.deleteAssignment(classroomId, assignmentId)
      notify({ title: 'Assignment deleted', tone: 'success' })
      navigate(back)
    } catch (err) {
      notify({ title: "Couldn't delete it", body: errorText(err), tone: 'error' })
    }
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Link to="/app/classrooms" className={styles.crumb}><Icon name="arrowLeft" size={15} /> Classes</Link>
        <div className={styles.card}><Empty icon="close" title="Couldn't open this assignment">{error}</Empty></div>
      </div>
    )
  }
  if (!room || !assignment) {
    return <div className={styles.page}><div className={`${styles.card} ${styles.cardPad}`}><Skeleton lines={5} /></div></div>
  }

  const finished = !tutor && !OPEN_STATUSES.includes(assignment.status)
  const due = dueLabel(assignment.due_at, finished)
  const done = assignment.roster?.filter((r) => !['not_started', 'missing'].includes(r.status)).length

  return (
    <div className={styles.page}>
      <header className={`${styles.head} ${styles.assignHead}`}>
        <div className={styles.headText}>
          <Link to={back} className={styles.crumb}><Icon name="arrowLeft" size={15} /> {room.name}</Link>
          <h1 className={styles.title}>{assignment.title}</h1>
          <div className={styles.facts}>
            <span>{KIND[assignment.kind]?.label}</span>
            <span className={styles.workSub} data-tone={due.tone} style={{ marginTop: 0, fontSize: 'inherit' }}>{due.text}</span>
            {tutor ? <span>{done} of {assignment.roster?.length || 0} handed in</span> : <Pill tone={STATUS[assignment.status]?.tone}>{STATUS[assignment.status]?.label}</Pill>}
            {tutor && !assignment.published && <span>Draft: students can't see it</span>}
          </div>
        </div>
        {tutor && (
          <div className={styles.personActions}>
            <button type="button" className={styles.btnGhost} onClick={() => setEditing(true)}><Icon name="pen" size={16} /> Edit</button>
            <button type="button" className={styles.btnDanger} onClick={remove}><Icon name="trash" size={16} /> Delete</button>
          </div>
        )}
      </header>

      {tutor
        ? <TutorView room={room} assignment={assignment} reload={reload} />
        : <StudentView key={assignment.submission?.submitted_at || 'new'} room={room} assignment={assignment} reload={reload} me={currentUser} />}

      {editing && (
        <AssignmentModal
          room={room}
          initial={assignment}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); notify({ title: 'Assignment updated', tone: 'success' }); reload() }}
        />
      )}
    </div>
  )
}
