import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import styles from './ProfilePage.module.css'

const isPassed = (records, id) => Array.isArray(records) ? records.includes(id) : Boolean(records?.[id])

export default function ProfilePage() {
  const { user: storedUser, progress, passedModules } = useStore()
  const { currentUser } = useAuth()
  const [copied, setCopied] = useState(false)
  const course = PATHS[0]
  const completed = progress[course.id] || 0
  const total = course.lessons_data.length
  const readiness = currentUser?.mekScore ?? storedUser.mekScore ?? 0
  const student = {
    name: currentUser?.name || storedUser.name || 'Student',
    email: currentUser?.email || 'student@vibeskool.edu',
    avatar: currentUser?.avatar || storedUser.avatar || 'VS',
    id: currentUser?.id || 'VS-2026-001'
  }
  const recordDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())
  const copyRecord = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={styles.page}>
      <header className={styles.titleBlock}>
        <div><p className={styles.eyebrow}>VibeSkool / academic record</p><h1>Transcript of<br /><em>explained work.</em></h1></div>
        <aside><span>Record generated</span><b>{recordDate}</b><span>Course status</span><b>{completed >= total ? 'Completed' : 'In progress'}</b></aside>
      </header>

      <section className={styles.identity} aria-label="Student record holder">
        <div className={styles.initials}>{student.avatar}</div>
        <div className={styles.student}><p className={styles.eyebrow}>Issued to</p><h2>{student.name}</h2><p>{student.email} <span>·</span> Student no. {student.id}</p></div>
        <div className={styles.courseStamp}><span>Course</span><b>WEB 101</b><em>Full-stack web practice</em></div>
      </section>

      <section className={styles.standing} aria-labelledby="standing-title">
        <div className={styles.position}><p id="standing-title">Current standing</p><strong>{String(Math.min(completed + 1, total)).padStart(2, '0')}</strong><span>of {total} lessons</span></div>
        <div className={styles.standingBody}><div className={styles.progressTrack} aria-label={`${Math.round((completed / total) * 100)}% complete`}><span style={{ width: `${(completed / total) * 100}%` }} /></div><div className={styles.standingFacts}><p><b>{completed}</b> lessons recorded</p><p><b>{course.modules.filter(module => isPassed(passedModules, module.id) || isPassed(currentUser?.passedModules, module.id)).length}</b> assessments recorded</p><p><b>{readiness}%</b> current readiness index</p></div><p className={styles.standard}>A lesson is counted here only after the student marks it complete. Assessment entries reflect passed module checks—not hours logged or automatic badges.</p></div>
      </section>

      <section className={styles.courseRecord} aria-labelledby="record-title">
        <header><div><p className={styles.eyebrow}>Course record</p><h2 id="record-title">Full-stack web development.</h2></div><p>Modules are listed in teaching order. Evidence is deliberately sparse: progress is useful only when it describes work that has actually happened.</p></header>
        <div className={styles.moduleTable} role="table" aria-label="Module transcript">
          <div className={styles.tableHead} role="row"><span role="columnheader">Unit</span><span role="columnheader">Study</span><span role="columnheader">Record</span><span role="columnheader">Evidence</span></div>
          {course.modules.map((module, index) => {
            const lessons = course.lessons_data.filter(lesson => lesson.part?.toLowerCase().startsWith(`${module.id.toLowerCase()}:`))
            const start = course.lessons_data.findIndex(lesson => lesson.id === lessons[0]?.id)
            const completedInModule = Math.max(0, Math.min(lessons.length, completed - start))
            const passed = isPassed(passedModules, module.id) || isPassed(currentUser?.passedModules, module.id)
            const current = completed >= start && completed < start + lessons.length
            const state = passed ? 'Assessment passed' : completedInModule === lessons.length ? 'Assessment available' : current ? 'In study' : 'Not yet started'
            return <div className={`${styles.tableRow} ${current ? styles.currentRow : ''}`} role="row" key={module.id}><span role="cell" className={styles.unit}>{String(index + 1).padStart(2, '0')}</span><div role="cell"><b>{module.title}</b><p>{lessons.length} lessons</p></div><div role="cell" className={styles.moduleProgress}><span>{completedInModule} / {lessons.length}</span><i><em style={{ width: `${(completedInModule / lessons.length) * 100}%` }} /></i></div><div role="cell" className={passed ? styles.passed : current ? styles.current : styles.pending}>{state}</div></div>
          })}
        </div>
      </section>

      <section className={styles.evidence}>
        <div><p className={styles.eyebrow}>What this record means</p><h2>Ownership is<br />the qualification.</h2></div>
        <div className={styles.evidenceText}><p>VibeSkool does not treat a generated project, a completed video, or a daily streak as proof of skill. The relevant evidence is a student&apos;s ability to inspect a system, make a change, test it, and explain their reasoning.</p><p>Use this record as a study document. It is not a degree, employer certification, or automatic endorsement.</p><Link to="/app/lab">Return to the practice studio <span>↗</span></Link></div>
      </section>

      <footer className={styles.footer}><p>Questions about this record? Keep the course evidence with the work that produced it.</p><button onClick={copyRecord}>{copied ? 'Record URL copied' : 'Copy record URL'} <span>→</span></button></footer>
    </div>
  )
}
