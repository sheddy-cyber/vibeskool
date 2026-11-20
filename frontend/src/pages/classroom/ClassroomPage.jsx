import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { useCopy } from '@/components/lesson/CodeBlock'
import { Avatar, Empty, Modal, Skeleton } from '@/components/classroom/Parts'
import { classroomApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { dueLabel, errorText, OPEN_STATUSES, timeAgo } from '@/lib/classroom'
import { confirmDialog, notify } from '@/lib/dialog'
import { LiveProvider, useLive, useLiveStatus } from '@/lib/live'
import Stream from './Stream'
import Classwork from './Classwork'
import Help, { NudgeModal } from './Help'
import styles from './Classroom.module.css'

/* ── Aside: tutor ─────────────────────────────────────────── */
function InviteCard({ room, onChange }) {
  const [copied, copy] = useCopy()
  const renew = async () => {
    const ok = await confirmDialog({ title: 'Make a new code?', body: 'The current code stops working. Students already in the class stay in it.', confirmLabel: 'New code' })
    if (!ok) return
    try {
      const { invite_code } = await classroomApi.newInviteCode(room.id)
      onChange({ ...room, invite_code })
    } catch (err) {
      notify({ title: "Couldn't make a new code", body: errorText(err), tone: 'error' })
    }
  }
  const toggle = async () => {
    try {
      const next = await classroomApi.update(room.id, { joining_open: !room.joining_open })
      onChange({ ...room, joining_open: next.joining_open })
    } catch (err) {
      notify({ title: "Couldn't change that", body: errorText(err), tone: 'error' })
    }
  }
  return (
    <section className={`${styles.card} ${styles.cardPad}`}>
      <h2 className={styles.sectionTitle}>Class code</h2>
      <p className={styles.sectionSub}>{room.joining_open ? 'Students join with this code.' : 'Joining is closed.'}</p>
      <div className={styles.code} style={room.joining_open ? undefined : { opacity: 0.55 }}>
        <strong>{room.invite_code}</strong>
        <button type="button" className={styles.iconBtn} onClick={() => copy(room.invite_code)} aria-label="Copy class code">
          <Icon name={copied ? 'check' : 'copy'} size={16} />
        </button>
      </div>
      <div className={styles.codeActions}>
        <button type="button" className={styles.textBtn} onClick={renew}><Icon name="reset" size={14} /> New code</button>
        <button type="button" className={styles.textBtn} onClick={toggle}>
          <Icon name={room.joining_open ? 'lock' : 'key'} size={14} /> {room.joining_open ? 'Close joining' : 'Open joining'}
        </button>
      </div>
    </section>
  )
}

function Glance({ stats: s, onTab }) {
  if (!s) return null
  const rows = [
    { icon: 'checklist', label: 'Work to review', value: s.toReview, go: () => onTab('work') },
    { icon: 'chat', label: 'Open questions', value: s.openQuestions, go: () => onTab('stream', { show: 'open' }) },
    { icon: 'flame', label: 'Learned this week', value: `${s.activeThisWeek} / ${s.members}`, go: () => onTab('help') },
  ]
  return (
    <section className={`${styles.card} ${styles.cardPad}`}>
      <h2 className={styles.sectionTitle} style={{ marginBottom: 8 }}>At a glance</h2>
      <ul className={styles.miniList}>
        {rows.map((r) => (
          <li key={r.label}>
            <button type="button" className={styles.miniRow} onClick={r.go}>
              <Icon name={r.icon} size={17} style={{ color: 'var(--text-tertiary)' }} />
              <span className={styles.miniMain}><span className={styles.miniTitle} style={{ fontWeight: 500 }}>{r.label}</span></span>
              <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{r.value}</strong>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── Aside: student ───────────────────────────────────────── */
function UpNext({ room, items }) {
  if (!items) return null
  return (
    <section className={`${styles.card} ${styles.cardPad}`}>
      <h2 className={styles.sectionTitle} style={{ marginBottom: 8 }}>Up next</h2>
      {items.length === 0 ? (
        <p className={styles.muted}>Nothing to do right now. You're all caught up.</p>
      ) : (
        <ul className={styles.miniList}>
          {items.slice(0, 4).map((a) => {
            const due = dueLabel(a.due_at)
            return (
              <li key={a.id}>
                <Link to={`/app/classrooms/${room.id}/assignments/${a.id}`} className={styles.miniRow}>
                  <span className={styles.miniMain}>
                    <span className={styles.miniTitle}>{a.title}</span>
                    <span className={styles.miniSub} data-tone={a.status === 'changes_requested' ? 'soon' : due.tone}>
                      {a.status === 'changes_requested' ? 'Changes requested' : due.text}
                    </span>
                  </span>
                  <Icon name="chevronRight" size={15} style={{ color: 'var(--text-tertiary)' }} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Nudges({ items }) {
  if (!items?.length) return null
  return (
    <section id="tutor-messages" aria-label="Messages from your tutor">
      {items.map((n) => (
        <div key={n.id} className={styles.nudge} data-read={n.fresh ? undefined : true}>
          <p className={styles.nudgeHead}>
            <Avatar user={n.sender} size={22} tutor />
            <strong>{n.sender.display_name}</strong> · {timeAgo(n.created_at)}
          </p>
          <p>{n.message}</p>
        </div>
      ))}
    </section>
  )
}

/* On narrow screens the side panel moves below the stream; this strip keeps
   the essentials above it. Hidden on wide screens (see .strip in the CSS). */
function Strip({ room, tutor, stats, openWork, nudges, onTab }) {
  const [copied, copy] = useCopy()
  const fresh = (nudges || []).filter((n) => n.fresh).length
  const next = openWork?.[0]
  const chips = []
  if (tutor) {
    if (stats?.toReview) {
      chips.push(
        <button key="r" type="button" className={styles.stripChip} data-tone="accent" onClick={() => onTab('work')}>
          <Icon name="checklist" size={15} />{stats.toReview} to review
        </button>,
      )
    }
    if (stats?.openQuestions) {
      chips.push(
        <button key="q" type="button" className={styles.stripChip} onClick={() => onTab('stream', { show: 'open' })}>
          <Icon name="chat" size={15} />{stats.openQuestions} open question{stats.openQuestions === 1 ? '' : 's'}
        </button>,
      )
    }
    chips.push(
      <button key="c" type="button" className={styles.stripChip} onClick={() => copy(room.invite_code)} aria-label="Copy class code">
        <Icon name={copied ? 'check' : 'copy'} size={15} />{copied ? 'Copied' : room.invite_code}
      </button>,
    )
  } else {
    if (fresh) {
      chips.push(
        <button
          key="n"
          type="button"
          className={styles.stripChip}
          data-tone="accent"
          onClick={() => document.getElementById('tutor-messages')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        >
          <Icon name="send" size={15} />{fresh} new message{fresh === 1 ? '' : 's'} from {room.teacher_name.split(' ')[0]}
        </button>,
      )
    }
    if (next) {
      const due = dueLabel(next.due_at)
      const warn = next.status === 'changes_requested' || due.tone === 'late'
      chips.push(
        <Link key="w" to={`/app/classrooms/${room.id}/assignments/${next.id}`} className={styles.stripChip} data-tone={warn ? 'warn' : undefined}>
          <Icon name="checklist" size={15} />
          <span className={styles.stripText}>{next.title}</span>
          <span className={styles.stripDim}>{next.status === 'changes_requested' ? 'Changes requested' : due.text}</span>
        </Link>,
      )
    }
  }
  if (!chips.length) return null
  return <div className={styles.strip}>{chips}</div>
}

const byDue = (a, b) => (a.due_at ? new Date(a.due_at) : Infinity) - (b.due_at ? new Date(b.due_at) : Infinity)

/* What the side panel and the strip show, kept fresh by live events */
function useSideData(classroomId, tutor) {
  const [stats, setStats] = useState(null)
  const [openWork, setOpenWork] = useState(null)
  const [nudges, setNudges] = useState(null)
  const freshIds = useRef(new Set()) // unread when they arrived; stay highlighted for this visit

  const loadStats = useCallback(() => {
    if (tutor) classroomApi.getStats(classroomId).then(setStats).catch(() => {})
  }, [classroomId, tutor])
  const loadWork = useCallback(() => {
    if (tutor) return
    classroomApi.assignments(classroomId)
      .then((d) => setOpenWork(d.assignments.filter((a) => OPEN_STATUSES.includes(a.status)).sort(byDue)))
      .catch(() => setOpenWork([]))
  }, [classroomId, tutor])
  const loadNudges = useCallback(() => {
    if (tutor) return
    classroomApi.nudges(classroomId).then((d) => {
      const recent = d.nudges.filter((n) => !n.read_at || Date.now() - new Date(n.created_at) < 7 * 864e5).slice(0, 3)
      for (const n of recent) if (!n.read_at) freshIds.current.add(n.id)
      setNudges(recent.map((n) => ({ ...n, fresh: freshIds.current.has(n.id) })))
      // Seeing them counts as reading them; they stay highlighted until the next visit
      recent.filter((n) => !n.read_at).forEach((n) => classroomApi.readNudge(classroomId, n.id).catch(() => {}))
    }).catch(() => {})
  }, [classroomId, tutor])

  useEffect(() => { loadStats(); loadWork(); loadNudges() }, [loadStats, loadWork, loadNudges])
  useLive(['stream', 'work', 'people'], loadStats)
  useLive(['work'], loadWork)
  useLive(['nudges'], loadNudges)
  return { stats, openWork, nudges }
}

function LiveBadge() {
  const status = useLiveStatus()
  if (status === 'off') return null
  const live = status === 'live'
  return (
    <span
      className={styles.liveBadge}
      data-live={live || undefined}
      title={live ? 'Changes appear as they happen' : 'Trying to reconnect. Until then the page refreshes every 30 seconds.'}
    >
      {live ? 'Live' : 'Reconnecting…'}
    </span>
  )
}

function TutorCard({ room }) {
  return (
    <section className={`${styles.card} ${styles.cardPad}`}>
      <h2 className={styles.sectionTitle} style={{ marginBottom: 12 }}>Your tutor</h2>
      <div className={styles.helpWho}>
        <Avatar user={{ display_name: room.teacher_name, avatar_url: room.teacher_avatar }} size={40} tutor />
        <div>
          <p className={styles.personName}>{room.teacher_name}</p>
          <p className={styles.blurb}>Ask them anything in the stream. Tick “Only my tutor can see this” to keep a question private.</p>
        </div>
      </div>
    </section>
  )
}

/* ── People ───────────────────────────────────────────────── */
function People({ room, tutor, me, onRemoved }) {
  const navigate = useNavigate()
  const [nudging, setNudging] = useState(null)
  const students = [...(room.members || [])].sort((a, b) => b.xp - a.xp)

  const remove = async (m) => {
    const ok = await confirmDialog({ tone: 'danger', title: `Remove ${m.display_name}?`, body: 'They leave the class and lose access to its stream and classwork. They can rejoin with the code.', confirmLabel: 'Remove' })
    if (!ok) return
    try {
      await classroomApi.removeMember(room.id, m.id)
      onRemoved(m.id)
    } catch (err) {
      notify({ title: "Couldn't remove them", body: errorText(err), tone: 'error' })
    }
  }

  const leave = async () => {
    const ok = await confirmDialog({ tone: 'danger', title: `Leave ${room.name}?`, body: "You'll need the class code to join again. Your lesson progress is kept.", confirmLabel: 'Leave class' })
    if (!ok) return
    try {
      await classroomApi.leave(room.id)
      notify({ title: `You left ${room.name}`, tone: 'success' })
      navigate('/app/classrooms')
    } catch (err) {
      notify({ title: "Couldn't leave the class", body: errorText(err), tone: 'error' })
    }
  }

  return (
    <div>
      <h2 className={styles.groupTitle}>Tutor</h2>
      <ul className={`${styles.card} ${styles.people}`} style={{ marginBottom: 28 }}>
        <li>
          <div className={styles.person}>
            <Avatar user={{ display_name: room.teacher_name, avatar_url: room.teacher_avatar }} size={36} tutor />
            <div className={styles.personMain}>
              <p className={styles.personName}>{room.teacher_name}{room.teacher_id === me.id && <span className={styles.you}>You</span>}</p>
            </div>
          </div>
        </li>
      </ul>

      <h2 className={styles.groupTitle}>{students.length} student{students.length === 1 ? '' : 's'}</h2>
      {students.length === 0 ? (
        <div className={styles.card}>
          <Empty icon="classroom" title="No students yet">
            {tutor ? <>Share the code <strong>{room.invite_code}</strong> and students appear here as they join.</> : 'You are the first one here.'}
          </Empty>
        </div>
      ) : (
        <ul className={`${styles.card} ${styles.people}`}>
          {students.map((m) => (
            <li key={m.id}>
              <div className={styles.person}>
                <Avatar user={m} size={36} />
                <div className={styles.personMain}>
                  <p className={styles.personName}>{m.display_name}{m.id === me.id && <span className={styles.you}>You</span>}</p>
                  <p className={styles.personSub}>
                    {tutor
                      ? `${m.email} · ${m.last_seen_at ? `last opened the class ${timeAgo(m.last_seen_at)}` : `joined ${timeAgo(m.joined_at)}`}`
                      : `Joined ${timeAgo(m.joined_at)}`}
                  </p>
                </div>
                <span className={styles.personStat}>{m.xp} XP</span>
                {tutor && (
                  <span className={styles.personActions}>
                    <button type="button" className={styles.iconBtn} onClick={() => setNudging(m)} aria-label={`Nudge ${m.display_name}`} title="Nudge">
                      <Icon name="send" size={16} />
                    </button>
                    <button type="button" className={styles.iconBtn} onClick={() => remove(m)} aria-label={`Remove ${m.display_name}`} title="Remove from class">
                      <Icon name="trash" size={16} />
                    </button>
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!tutor && (
        <button type="button" className={styles.btnDanger} onClick={leave} style={{ marginTop: 24 }}>Leave this class</button>
      )}

      {nudging && (
        <NudgeModal room={room} student={nudging} suggestion={`Hi ${nudging.display_name.split(' ')[0]}, `} onClose={() => setNudging(null)} />
      )}
    </div>
  )
}

/* ── Settings ─────────────────────────────────────────────── */
function SettingsModal({ room, onClose, onSaved }) {
  const navigate = useNavigate()
  const [name, setName] = useState(room.name)
  const [description, setDescription] = useState(room.description || '')
  const [archived, setArchived] = useState(room.archived)
  const [busy, setBusy] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const next = await classroomApi.update(room.id, { name, description, archived })
      onSaved(next)
    } catch (err) {
      notify({ title: "Couldn't save", body: errorText(err), tone: 'error' })
      setBusy(false)
    }
  }

  const remove = async () => {
    const ok = await confirmDialog({ tone: 'danger', title: `Delete ${room.name}?`, body: 'The stream, classwork, handed-in work and feedback are deleted for everyone. Students keep their lesson progress. This can’t be undone.', confirmLabel: 'Delete class' })
    if (!ok) return
    try {
      await classroomApi.delete(room.id)
      notify({ title: 'Class deleted', tone: 'success' })
      navigate('/app/classrooms')
    } catch (err) {
      notify({ title: "Couldn't delete the class", body: errorText(err), tone: 'error' })
    }
  }

  return (
    <Modal
      title="Class settings"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={styles.btnDanger} onClick={remove} style={{ marginRight: 'auto' }}><Icon name="trash" size={16} /> Delete class</button>
          <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" form="class-settings" className={styles.btnPrimary} disabled={busy || !name.trim()}>{busy ? 'Saving…' : 'Save'}</button>
        </>
      }
    >
      <form id="class-settings" onSubmit={save}>
        <label className={styles.field}>
          <span>Name</span>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </label>
        <label className={styles.field}>
          <span>What it's about</span>
          <textarea className={styles.textarea} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} />
          Archive this class (it moves to the bottom of your list; nothing is deleted)
        </label>
      </form>
    </Modal>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
const TABS = [
  { id: 'stream', label: 'Stream' },
  { id: 'work', label: 'Classwork' },
  { id: 'people', label: 'People' },
  { id: 'help', label: 'Needs help', tutorOnly: true },
]

export default function ClassroomPage() {
  const { classroomId } = useParams()
  return (
    <LiveProvider classroomId={classroomId}>
      <ClassroomView key={classroomId} classroomId={classroomId} />
    </LiveProvider>
  )
}

function ClassroomView({ classroomId }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { currentUser } = useAuth()
  const [room, setRoom] = useState(null)
  const [error, setError] = useState(null)
  const [settings, setSettings] = useState(false)
  const [helpCount, setHelpCount] = useState(null)

  const loadRoom = useCallback(() => classroomApi.get(classroomId)
    .then(setRoom)
    .catch((err) => setError(err.status === 403 ? "You're not in this class." : errorText(err))), [classroomId])
  useEffect(() => { loadRoom() }, [loadRoom])

  const tutor = Boolean(room?.is_tutor)
  const loadHelp = useCallback(() => {
    if (tutor) classroomApi.getInsights(classroomId).then((d) => setHelpCount(d.needsHelp)).catch(() => {})
  }, [tutor, classroomId])
  useEffect(() => { loadHelp() }, [loadHelp])
  useLive(['stream', 'work', 'people'], loadHelp)

  // The class itself changed, or someone joined or left
  useLive(['class', 'people'], (e) => {
    const mine = e.data?.studentId === currentUser?.id
    if (e.action === 'class.deleted') {
      notify({ title: 'This class was deleted', tone: 'error' })
      navigate('/app/classrooms')
    } else if (e.action === 'member.removed' && mine) {
      notify({ title: 'You were removed from this class', tone: 'error' })
      navigate('/app/classrooms')
    } else {
      loadRoom()
    }
  }, { fallbackMs: 0 })

  // Tell a student straight away when their tutor reaches out
  useLive(['nudges', 'work'], (e) => {
    if (tutor || !room || e.data?.studentId !== currentUser?.id) return
    if (e.action === 'nudge.created') {
      notify({ title: `New message from ${room.teacher_name}` })
    }
    if (e.action === 'submission.reviewed') {
      notify({ title: `${room.teacher_name} reviewed your work`, body: 'Open Classwork to see the feedback.', tone: 'success' })
    }
  }, { fallbackMs: 0, debounceMs: 0 })

  const side = useSideData(classroomId, tutor)

  const tabs = TABS.filter((t) => !t.tutorOnly || tutor)
  const tab = tabs.find((t) => t.id === params.get('tab'))?.id || 'stream'
  const goTab = useCallback((id, extra = {}) => {
    const next = new URLSearchParams()
    if (id !== 'stream') next.set('tab', id)
    Object.entries(extra).forEach(([k, v]) => next.set(k, v))
    setParams(next)
  }, [setParams])

  if (error) {
    return (
      <div className={styles.page}>
        <Link to="/app/classrooms" className={styles.crumb}><Icon name="arrowLeft" size={15} /> Classes</Link>
        <div className={styles.card}><Empty icon="lock" title="Couldn't open this class">{error}</Empty></div>
      </div>
    )
  }
  if (!room) {
    return (
      <div className={styles.page}>
        <div style={{ maxWidth: 520, marginBottom: 28 }}><Skeleton lines={3} /></div>
        <div className={`${styles.card} ${styles.cardPad}`}><Skeleton lines={5} /></div>
      </div>
    )
  }

  const me = currentUser
  const studentCount = room.members?.length || 0
  const aside = tutor
    ? <><InviteCard room={room} onChange={setRoom} /><Glance stats={side.stats} onTab={goTab} /></>
    : <><Nudges items={side.nudges} /><UpNext room={room} items={side.openWork} /><TutorCard room={room} /></>
  const strip = <Strip room={room} tutor={tutor} onTab={goTab} {...side} />

  return (
    <div className={styles.page}>
      <header className={styles.head} style={{ marginBottom: 20 }}>
        <div className={styles.headText}>
          <Link to="/app/classrooms" className={styles.crumb}><Icon name="arrowLeft" size={15} /> Classes</Link>
          <h1 className={styles.title}>{room.name}</h1>
          {room.description && <p className={styles.lead}>{room.description}</p>}
          <div className={styles.facts}>
            <span>{tutor ? 'You teach this class' : `Tutor: ${room.teacher_name}`}</span>
            <span>{studentCount} student{studentCount === 1 ? '' : 's'}</span>
            {room.archived && <span>Archived</span>}
          </div>
        </div>
        {tutor && (
          <button type="button" className={styles.btnGhost} onClick={() => setSettings(true)}>
            <Icon name="settings" size={16} /> Settings
          </button>
        )}
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Class sections">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={styles.tab} onClick={() => goTab(t.id)}>
            {t.label}
            {t.id === 'help' && helpCount > 0 && <span className={styles.badge}>{helpCount}</span>}
          </button>
        ))}
        <LiveBadge />
      </div>

      <div role="tabpanel">
        {tab === 'stream' && <Stream room={room} tutor={tutor} me={me} aside={aside} strip={strip} />}
        {tab === 'work' && <Classwork room={room} tutor={tutor} />}
        {tab === 'people' && (
          <People room={room} tutor={tutor} me={me} onRemoved={(id) => setRoom((r) => ({ ...r, members: r.members.filter((m) => m.id !== id) }))} />
        )}
        {tab === 'help' && tutor && <Help room={room} onCounts={setHelpCount} />}
      </div>

      {settings && (
        <SettingsModal
          room={room}
          onClose={() => setSettings(false)}
          onSaved={(next) => { setRoom((r) => ({ ...r, ...next })); setSettings(false); notify({ title: 'Saved', tone: 'success' }) }}
        />
      )}
    </div>
  )
}
