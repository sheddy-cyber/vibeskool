import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Avatar, Empty, Pill, Skeleton } from '@/components/classroom/Parts'
import { teachingApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { errorText, FLAGS, timeAgo } from '@/lib/classroom'
import { greeting } from '@/lib/learning'
import ui from '../classroom/Classroom.module.css'
import styles from './Teaching.module.css'
import { CourseSwatch, Faces, plural } from './shared'

function itemLink(item) {
  if (item.kind === 'question') return `/app/classrooms/${item.classroom.id}?tab=stream&post=${item.id}`
  if (item.kind === 'review') return `/app/classrooms/${item.classroom.id}/assignments/${item.assignmentId}?student=${item.person.id}`
  return `/app/classrooms/${item.classroom.id}?tab=help`
}

function AttentionItem({ item }) {
  const icon = { question: 'chat', review: 'checklist', student: 'people' }[item.kind]
  let title
  let sub
  if (item.kind === 'question') {
    title = item.title
    sub = `${item.person.display_name} asked ${timeAgo(item.at)}${item.private ? ' · private' : ''}`
  } else if (item.kind === 'review') {
    title = `${item.person.display_name} handed in “${item.title}”`
    sub = `${timeAgo(item.at)}${item.late ? ' · late' : ''}`
  } else {
    title = item.person.display_name
    sub = item.overdue.length ? `Overdue: ${item.overdue.join(', ')}` : item.at ? `Last active ${timeAgo(item.at)}` : 'Not active yet'
  }
  return (
    <li>
      <Link to={itemLink(item)} className={styles.row}>
        {item.kind === 'student'
          ? <Avatar user={item.person} size={36} />
          : <span className={styles.rowIcon} data-kind={item.kind}><Icon name={icon} size={18} /></span>}
        <span className={styles.rowMain}>
          <span className={styles.rowTitle}>{title}</span>
          <span className={styles.rowSub}>{sub} · {item.classroom.name}</span>
        </span>
        <span className={styles.rowMeta}>
          {item.kind === 'student'
            ? item.flags.filter((f) => f === 'overdue' || f === 'inactive').map((f) => <Pill key={f} tone={FLAGS[f].tone}>{FLAGS[f].label}</Pill>)
            : <Icon name="chevronRight" size={16} />}
        </span>
      </Link>
    </li>
  )
}

function headline(t) {
  const bits = []
  if (t.waiting) bits.push(plural(t.waiting, 'question waiting on you', 'questions waiting on you'))
  if (t.toReview) bits.push(plural(t.toReview, 'piece of work to review', 'pieces of work to review'))
  if (!bits.length) return t.classes ? "You're all caught up. Nothing is waiting on you right now." : 'Create a class to start teaching, or build a course of your own.'
  return `${bits.join(' and ')}.`
}

export default function OverviewPage() {
  const { currentUser } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    teachingApi.overview().then(setData).catch((err) => setError(errorText(err)))
  }, [])

  const first = currentUser?.name?.split(' ')[0] || ''

  if (error) {
    return <div className={ui.page}><div className={ui.card}><Empty icon="close" title="Couldn't load your overview">{error}</Empty></div></div>
  }
  if (!data) {
    return (
      <div className={ui.page}>
        <div style={{ maxWidth: 480, marginBottom: 28 }}><Skeleton lines={2} /></div>
        <div className={`${ui.card} ${ui.cardPad}`}><Skeleton lines={5} /></div>
      </div>
    )
  }

  const t = data.totals
  const more = data.attentionTotal - data.attention.length

  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <div className={ui.headText}>
          <h1 className={ui.title}>{greeting()}, {first}.</h1>
          <p className={ui.lead}>{headline(t)}</p>
        </div>
        <div className={styles.headActions}>
          <Link to="/app/teaching/courses?new=1" className={ui.btnGhost}><Icon name="plus" size={16} /> New course</Link>
          <Link to="/app/classrooms" className={ui.btnPrimary}>Your classes</Link>
        </div>
      </header>

      {data.invites > 0 && (
        <div className={styles.banner}>
          <Icon name="people" size={20} />
          <p><strong>You've been invited to {plural(data.invites, 'course team')}.</strong> Accept to start building it together.</p>
          <Link to="/app/teaching/courses" className={`${ui.btnPrimary} ${ui.sm}`}>See invitations</Link>
        </div>
      )}

      <div className={`${ui.card} ${styles.stats}`}>
        <Link to="/app/classrooms" className={styles.stat}>
          <p className={styles.statNum}>{t.students}</p>
          <p className={styles.statLabel}>Students across {plural(t.classes, 'class', 'classes')}</p>
        </Link>
        <div className={styles.stat}>
          <p className={styles.statNum} data-tone={t.waiting ? 'warn' : undefined}>{t.waiting}</p>
          <p className={styles.statLabel}>Questions waiting on you</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statNum}>{t.toReview}</p>
          <p className={styles.statLabel}>Pieces of work to review</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statNum}>{t.needsHelp}</p>
          <p className={styles.statLabel}>Students who could use a hand</p>
        </div>
      </div>

      <div className={styles.cols}>
        <section aria-labelledby="needs-you">
          <div className={styles.blockHead}>
            <h2 id="needs-you">Needs you</h2>
            {more > 0 && <span className={ui.muted}>+{more} more in your classes</span>}
          </div>
          {data.attention.length ? (
            <ul className={`${ui.card} ${styles.list}`}>
              {data.attention.map((item) => <AttentionItem key={`${item.kind}-${item.id}-${item.classroom.id}`} item={item} />)}
            </ul>
          ) : (
            <div className={ui.card}>
              <Empty icon="check" title="All caught up">
                {t.classes ? 'No questions waiting, nothing to review, and nobody falling behind.' : 'Once you have a class, questions and work to review show up here.'}
              </Empty>
            </div>
          )}
        </section>

        <div className={styles.colStack}>
          <section aria-labelledby="your-classes">
            <div className={styles.blockHead}>
              <h2 id="your-classes">Your classes</h2>
              <Link to="/app/classrooms" className={ui.textBtn}>All classes</Link>
            </div>
            {data.classes.length ? (
              <ul className={`${ui.card} ${styles.list}`}>
                {data.classes.map((c) => (
                  <li key={c.id}>
                    <Link to={`/app/classrooms/${c.id}`} className={styles.row}>
                      <span className={styles.rowMain}>
                        <span className={styles.rowTitle}>{c.name}</span>
                        <span className={styles.rowSub}>{plural(c.students, 'student')} · {c.activeThisWeek} learned this week</span>
                      </span>
                      <span className={styles.rowMeta}>
                        {c.toReview > 0 && <span className={styles.count} title="To review">{c.toReview}</span>}
                        {c.waiting > 0 && <Pill tone="warn">{c.waiting} waiting</Pill>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={ui.card}>
                <Empty icon="classroom" title="No classes yet" action={<Link to="/app/classrooms" className={`${ui.btnPrimary} ${ui.sm}`}>Create a class</Link>} />
              </div>
            )}
          </section>

          <section aria-labelledby="your-courses">
            <div className={styles.blockHead}>
              <h2 id="your-courses">Your courses</h2>
              <Link to="/app/teaching/courses" className={ui.textBtn}>All courses</Link>
            </div>
            {data.courses.length ? (
              <ul className={`${ui.card} ${styles.list}`}>
                {data.courses.map((c) => (
                  <li key={c.id}>
                    <Link to={`/app/teaching/courses/${c.id}`} className={styles.row}>
                      <CourseSwatch course={c} size={36} />
                      <span className={styles.rowMain}>
                        <span className={styles.rowTitle}>{c.title}</span>
                        <span className={styles.rowSub}>
                          {c.status === 'published' ? 'Published' : 'Draft'} · {plural(c.lessons, 'lesson')}
                          {c.students ? ` · ${plural(c.students, 'student')}` : ''}
                        </span>
                      </span>
                      <Faces people={c.team} size={24} max={3} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={ui.card}>
                <Empty icon="book" title="No courses yet" action={<Link to="/app/teaching/courses?new=1" className={`${ui.btnPrimary} ${ui.sm}`}>Start a course</Link>}>
                  Write your own lessons for your classes, alone or with other tutors.
                </Empty>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
