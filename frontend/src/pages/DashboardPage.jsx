import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import styles from './DashboardPage.module.css'

const PHASES = ['Foundations', 'Making', 'Systems', 'Assurance']

export default function DashboardPage() {
  const { progress, passedModules } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const path = PATHS[0]
  const completed = progress[path.id] || 0
  const total = path.lessons_data.length
  const nextIndex = Math.min(completed, total - 1)
  const nextLesson = path.lessons_data[nextIndex] || path.lessons_data[0]
  const courseWeek = Math.min(completed + 1, 16)
  const progressPct = Math.round((completed / total) * 100)
  const isNew = completed === 0
  const isNearCompletion = progressPct >= 80
  const completedModules = path.modules?.filter(mod => passedModules[mod.id] || currentUser?.passedModules?.[mod.id]).length || 0
  const upcoming = path.lessons_data.slice(nextIndex, Math.min(nextIndex + 3, total))

  const statusCopy = isNew
    ? 'Your first study record begins here. Start with the environment before asking AI to write in it.'
    : isNearCompletion
      ? 'The course is nearly complete. Your remaining work is evidence: make each decision explainable.'
      : 'Continue from the last point at which your understanding was recorded.'

  return (
    <div className={styles.page}>
      <header className={styles.recordHead}>
        <div>
          <p className={styles.eyebrow}>Web 101 / Student study record</p>
          <h1>{currentUser?.name || 'Student'}, your course position.</h1>
        </div>
        <p className={styles.headNote}>{statusCopy}</p>
      </header>

      <section className={styles.position} aria-labelledby="position-title">
        <div className={styles.positionNumber}>
          <span id="position-title">Course week</span>
          <strong>{String(courseWeek).padStart(2, '0')}</strong>
          <em>/ 16</em>
        </div>
        <div className={styles.positionBody}>
          <div className={styles.progressLine} aria-label={`${progressPct}% of lessons complete`}><span style={{ width: `${progressPct}%` }} /></div>
          <div className={styles.positionMeta}><span>{completed} of {total} lessons recorded</span><span>{completedModules} module assessments passed</span></div>
          <ol className={styles.phaseIndex}>{PHASES.map((phase, index) => <li key={phase} className={progressPct >= (index + 1) * 25 ? styles.phaseDone : ''}><span>{String(index + 1).padStart(2, '0')}</span>{phase}</li>)}</ol>
        </div>
      </section>

      <section className={styles.studyGrid}>
        <article className={styles.current}>
          <header className={styles.currentTop}><p className={styles.eyebrow}>Next in sequence</p><span>{nextLesson.part || 'Core study'}</span></header>
          <div className={styles.currentBody}>
            <div><p className={styles.lessonNumber}>Lesson {String(nextIndex + 1).padStart(2, '0')}</p><h2>{nextLesson.title}</h2><p className={styles.lessonDescription}>{isNew ? 'Establish the basic vocabulary and tools before you begin producing work.' : 'Read, build, then leave a clear explanation of the decision you made.'}</p></div>
            <button className={styles.continue} onClick={() => navigate(`/app/lesson/${nextLesson.id}`)}>{isNew ? 'Begin this lesson' : 'Resume this lesson'} <span>→</span></button>
          </div>
          <footer className={styles.explanation}><span>[ required before completion ]</span><p>Can you explain what this lesson changes, why that change belongs here, and how you would test it?</p></footer>
        </article>

        <aside className={styles.studyNote}>
          <p className={styles.eyebrow}>This week&apos;s practice</p>
          <h2>{isNew ? 'Set up your working environment.' : 'Leave a trail of reasoning.'}</h2>
          <p>{isNew ? 'Use the first lesson to establish a local project, terminal vocabulary, and a repeatable way to inspect your work.' : 'Your lesson is only complete when your notes can account for the implementation—especially the parts AI helped create.'}</p>
          <Link to="/app/lab">Open the studio <span>↗</span></Link>
        </aside>
      </section>

      <section className={styles.sequence} aria-labelledby="sequence-title">
        <header><div><p className={styles.eyebrow}>The immediate sequence</p><h2 id="sequence-title">What follows this work.</h2></div><span>{total - completed} entries remain</span></header>
        <ol>
          {upcoming.map((lesson, index) => <li key={lesson.id} className={index === 0 ? styles.now : ''}><span>{String(nextIndex + index + 1).padStart(2, '0')}</span><div><Link to={`/app/lesson/${lesson.id}`}>{lesson.title}</Link><p>{index === 0 ? 'Current entry' : lesson.part || 'Following entry'}</p></div><em>{index === 0 ? 'Now' : `+${index}`}</em></li>)}
        </ol>
      </section>

      <footer className={styles.recordFoot}>
        <p>Progress is a record of explained work, not time spent online.</p>
        <Link to="/app/profile">Read your transcript <span>→</span></Link>
      </footer>
    </div>
  )
}
