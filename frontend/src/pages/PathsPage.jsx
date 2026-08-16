import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PATHS, useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import styles from './PathsPage.module.css'

const FUTURE_NOTES = {
  'mobile-app': ['Mobile engineering', 'Native constraints, device capability, and offline systems.'],
  'blockchain-web3': ['Distributed systems', 'Cryptography, verification, and the cost of shared state.'],
  'game-dev': ['Real-time graphics', 'Simulation, rendering, and performance under a frame budget.'],
  'os-low-level': ['Systems practice', 'Memory, concurrency, operating-system boundaries, and control.'],
  'ai-ml': ['Machine learning systems', 'Models, evaluation, retrieval, and accountable AI workflows.']
}

const passed = (records, id) => Array.isArray(records) ? records.includes(id) : Boolean(records?.[id])

export default function PathsPage() {
  const { progress, passedModules } = useStore()
  const { currentUser } = useAuth()
  const [openModule, setOpenModule] = useState(null)
  const course = PATHS[0]
  const completed = progress[course.id] || 0
  const total = course.lessons_data.length
  const activeLesson = course.lessons_data[Math.min(completed, total - 1)]
  const percent = Math.round((completed / total) * 100)

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div><p className={styles.eyebrow}>VibeSkool / course catalogue</p><h1>Study a system<br /><em>in sequence.</em></h1></div>
        <aside><span>[ catalogue note ]</span><p>Each course is designed around a single practice: make work you can inspect, test, and explain. Availability follows that standard—not a release calendar.</p></aside>
      </header>

      <section className={styles.currentCourse} aria-labelledby="course-title">
        <header><div><p className={styles.eyebrow}>Open for study / course 01</p><h2 id="course-title">Full-stack web development.</h2></div><div className={styles.courseMeta}><span>16-week course</span><span>{total} lessons</span><span>Remote studio</span></div></header>
        <div className={styles.courseSummary}><div><p>Build the mental model before the interface: requests, tools, structure, state, server boundaries, data, security, and an accountable capstone.</p><Link to={`/app/lesson/${activeLesson.id}`}>Continue from lesson {String(Math.min(completed + 1, total)).padStart(2, '0')} <span>→</span></Link></div><div className={styles.progress}><div><b>{String(Math.min(completed + 1, total)).padStart(2, '0')}</b><span>current lesson</span></div><div className={styles.progressLine} aria-label={`${percent}% of the course completed`}><span style={{ width: `${percent}%` }} /></div><p>{completed} of {total} study entries recorded</p></div></div>
      </section>

      <section className={styles.syllabus} aria-labelledby="syllabus-title">
        <header><div><p className={styles.eyebrow}>Course 01 / syllabus</p><h2 id="syllabus-title">The working sequence.</h2></div><p>Open a unit to see its lessons. The first unfinished unit is marked as the current area of study.</p></header>
        <div className={styles.moduleList}>{course.modules.map((module, index) => {
          const lessons = course.lessons_data.filter(lesson => lesson.part?.toLowerCase().startsWith(`${module.id.toLowerCase()}:`))
          const firstIndex = course.lessons_data.findIndex(lesson => lesson.id === lessons[0]?.id)
          const done = Math.max(0, Math.min(lessons.length, completed - firstIndex))
          const assessmentPassed = passed(passedModules, module.id) || passed(currentUser?.passedModules, module.id)
          const current = completed >= firstIndex && completed < firstIndex + lessons.length
          const isOpen = openModule === module.id
          return <section key={module.id} className={`${styles.module} ${current ? styles.moduleCurrent : ''}`}><button onClick={() => setOpenModule(isOpen ? null : module.id)} aria-expanded={isOpen}><span className={styles.moduleNumber}>{String(index + 1).padStart(2, '0')}</span><div><b>{module.title}</b><p>{done} of {lessons.length} lessons recorded</p></div><span className={assessmentPassed ? styles.assessed : current ? styles.inProgress : styles.unstarted}>{assessmentPassed ? 'Assessment passed' : current ? 'In study' : done === lessons.length ? 'Assessment ready' : 'Upcoming'}</span><i>{isOpen ? '−' : '+'}</i></button>{isOpen && <div className={styles.lessonList}>{lessons.map((lesson, lessonOffset) => { const lessonIndex = firstIndex + lessonOffset; const lessonDone = completed > lessonIndex; return <Link key={lesson.id} to={`/app/lesson/${lesson.id}`}><span>{lessonDone ? '✓' : String(lessonIndex + 1).padStart(2, '0')}</span><div><b>{lesson.title}</b><p>{lesson.duration || 'Study entry'}</p></div></Link> })}<Link className={styles.assessmentLink} to={`/app/skillcheck/${module.id}`}>{assessmentPassed ? 'Review assessment record' : 'Open module assessment'} <span>→</span></Link></div>}</section>
        })}</div>
      </section>

      <section className={styles.research} aria-labelledby="research-title">
        <header><div><p className={styles.eyebrow}>Research register</p><h2 id="research-title">Future fields of study.</h2></div><p>These courses are in curriculum development. They are included to show the school&apos;s direction, not to solicit enrolment before the teaching material is ready.</p></header>
        <ol>{PATHS.slice(1).map((path, index) => { const [name, description] = FUTURE_NOTES[path.id] || [path.name, path.description]; return <li key={path.id}><span>{String(index + 2).padStart(2, '0')}</span><div><h3>{name}</h3><p>{description}</p></div><em>In development</em></li> })}</ol>
      </section>

      <footer className={styles.footer}><p>Curriculum is revised through teaching evidence, not feature requests.</p><Link to="/app/dashboard">Return to your study record <span>→</span></Link></footer>
    </div>
  )
}
