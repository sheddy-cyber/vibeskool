import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Avatar, Empty, Modal, Pill, Skeleton } from '@/components/classroom/Parts'
import { classroomApi } from '@/lib/api'
import { errorText, FLAGS, suggestNudge, timeAgo } from '@/lib/classroom'
import { notify } from '@/lib/dialog'
import { useLive } from '@/lib/live'
import styles from './Classroom.module.css'

export function NudgeModal({ room, student, suggestion = '', onClose, onSent }) {
  const [message, setMessage] = useState(suggestion)
  const [busy, setBusy] = useState(false)
  const first = student.display_name.split(' ')[0]

  const send = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await classroomApi.nudge(room.id, student.id, message)
      notify({ title: `Nudge sent to ${first}`, body: 'They will see it on the class page.', tone: 'success' })
      onSent?.()
      onClose()
    } catch (err) {
      notify({ title: "Couldn't send the nudge", body: errorText(err), tone: 'error' })
      setBusy(false)
    }
  }

  return (
    <Modal
      title={`Nudge ${first}`}
      description="A short private message. Only they will see it."
      onClose={onClose}
      footer={
        <>
          <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" form="nudge-form" className={styles.btnPrimary} disabled={busy || !message.trim()}>
            <Icon name="send" size={16} /> {busy ? 'Sending…' : 'Send'}
          </button>
        </>
      }
    >
      <form id="nudge-form" onSubmit={send}>
        <textarea className={styles.textarea} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} aria-label="Message" />
        <p className={styles.muted} style={{ marginTop: 8 }}>We drafted this from what {first} needs. Make it sound like you.</p>
      </form>
    </Modal>
  )
}

function lastSeen(row) {
  if (!row.last_active) return 'Not active yet'
  return `Active ${timeAgo(row.last_active)}`
}

function detail(row) {
  const bits = []
  if (row.overdue.length) bits.push(`Overdue: ${row.overdue.map((o) => o.title).join(', ')}`)
  if (row.changes_requested.length) bits.push(`Fixing: ${row.changes_requested.map((o) => o.title).join(', ')}`)
  if (row.open_questions) bits.push(`${row.open_questions} unanswered question${row.open_questions === 1 ? '' : 's'}`)
  return bits.join(' · ')
}

export default function Help({ room, onCounts }) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [nudging, setNudging] = useState(null)

  const load = () => classroomApi.getInsights(room.id)
    .then((data) => { setState({ loading: false, data, error: null }); onCounts?.(data.needsHelp) })
    .catch((err) => setState((s) => (s.data ? s : { loading: false, data: null, error: errorText(err) })))

  useEffect(() => { load() }, [room.id])
  useLive(['stream', 'work', 'people'], load)

  if (state.loading) return <div className={`${styles.card} ${styles.cardPad}`}><Skeleton lines={5} /></div>
  if (state.error) return <div className={styles.card}><Empty icon="close" title="Couldn't load this">{state.error}</Empty></div>

  const { students, waitingQuestions, needsHelp } = state.data
  if (students.length === 0) {
    return (
      <div className={styles.card}>
        <Empty icon="classroom" title="No students yet">Share the class code. Once students join, this shows who could use a hand.</Empty>
      </div>
    )
  }

  const activeWeek = students.filter((s) => s.lessons_this_week > 0).length
  const overdue = students.filter((s) => s.flags.includes('overdue')).length

  return (
    <div>
      <div className={`${styles.card} ${styles.summary}`}>
        <div><p className={styles.summaryNum}>{needsHelp}</p><p className={styles.summaryLabel}>could use a hand</p></div>
        <div><p className={styles.summaryNum}>{waitingQuestions.length}</p><p className={styles.summaryLabel}>questions waiting on you</p></div>
        <div><p className={styles.summaryNum}>{overdue}</p><p className={styles.summaryLabel}>with overdue work</p></div>
        <div><p className={styles.summaryNum}>{activeWeek}<span className={styles.muted}> / {students.length}</span></p><p className={styles.summaryLabel}>learned this week</p></div>
      </div>

      {waitingQuestions.length > 0 && (
        <section>
          <h2 className={styles.groupTitle}>Waiting on you</h2>
          <ul className={styles.waitList}>
            {waitingQuestions.map((q) => (
              <li key={q.id} className={`${styles.card} ${styles.wait}`}>
                <Avatar user={q.author} size={32} />
                <div className={styles.waitMain}>
                  <p className={styles.waitTitle}>{q.title || q.body.split('\n')[0]}</p>
                  {q.title && <p className={styles.waitBody}>{q.body}</p>}
                  <p className={styles.waitMeta}>
                    {q.author.display_name} · asked {timeAgo(q.created_at)}
                    {q.lesson && ` · ${q.lesson.title}`}
                    {q.is_private && ' · private'}
                  </p>
                </div>
                <Link to={`/app/classrooms/${room.id}?tab=stream&post=${q.id}`} className={`${styles.btnGhost} ${styles.sm}`}>Answer</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className={styles.groupTitle}>Every student, most in need first</h2>
        <ul className={`${styles.card} ${styles.people}`}>
          {students.map((row) => (
            <li key={row.student.id}>
              <div className={styles.helpRow}>
                <div className={styles.helpWho}>
                  <Avatar user={row.student} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <p className={styles.personName}>{row.student.display_name}</p>
                    <p className={styles.personSub}>
                      {lastSeen(row)} · {row.lessons_this_week} lesson{row.lessons_this_week === 1 ? '' : 's'} this week
                      {row.streak > 1 ? ` · ${row.streak}-day streak` : ''}
                    </p>
                  </div>
                </div>
                <div className={styles.helpFlags}>
                  {row.flags.length ? (
                    <>
                      <div className={styles.helpFlagsRow}>
                        {row.flags.map((f) => <Pill key={f} tone={FLAGS[f]?.tone}>{FLAGS[f]?.label}</Pill>)}
                      </div>
                      {detail(row) && <p className={styles.helpDetail} title={detail(row)}>{detail(row)}</p>}
                    </>
                  ) : (
                    <span className={styles.helpOk}>On track</span>
                  )}
                </div>
                <button type="button" className={`${styles.btnGhost} ${styles.sm}`} onClick={() => setNudging(row)}>
                  <Icon name="send" size={15} /> Nudge
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {nudging && (
        <NudgeModal room={room} student={nudging.student} suggestion={suggestNudge(nudging)} onClose={() => setNudging(null)} />
      )}
    </div>
  )
}
