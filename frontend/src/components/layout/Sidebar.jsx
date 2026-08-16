import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const { progress, passedModules } = useStore()
  const { currentUser } = useAuth()
  const location = useLocation()
  const [openModules, setOpenModules] = useState({ m0: true })
  const path = PATHS[0]
  const completed = progress[path.id] || 0
  const total = path.lessons_data?.length || 1
  const currentLesson = location.pathname.split('/').pop()
  const isLesson = location.pathname.startsWith('/app/lesson/')

  return (
    <aside className={styles.sidebar} id="course-index" aria-label="Course index">
      <header className={styles.folioHead}><Link to="/app/dashboard" className={styles.wordmark}><span>VS</span>VibeSkool</Link><p>School of web practice</p><div><b>WEB 101</b><span>16-week course</span></div></header>
      <nav className={styles.syllabus} aria-label="Full Stack Web syllabus">
        <div className={styles.syllabusTitle}><span>Course index</span><b>{completed} / {total}</b></div>
        {path.modules?.map((mod, index) => {
          const lessons = path.lessons_data.filter(lesson => lesson.part?.toLowerCase().startsWith(`${mod.id.toLowerCase()}:`))
          const passed = passedModules[mod.id] || currentUser?.passedModules?.[mod.id]
          const expanded = openModules[mod.id] || (isLesson && lessons.some(lesson => lesson.id === currentLesson))
          return <section key={mod.id} className={styles.module}><button onClick={() => setOpenModules(previous => ({ ...previous, [mod.id]: !previous[mod.id] }))} aria-expanded={expanded}><span>{String(index + 1).padStart(2, '0')}</span><b>{mod.title}</b><i>{passed ? 'done' : expanded ? '−' : '+'}</i></button>{expanded && <div className={styles.lessons}>{lessons.map(lesson => { const lessonIndex = path.lessons_data.findIndex(item => item.id === lesson.id); const done = completed > lessonIndex; const active = isLesson && currentLesson === lesson.id; return <Link key={lesson.id} className={`${done ? styles.done : ''} ${active ? styles.active : ''}`} to={`/app/lesson/${lesson.id}`}><span>{done ? '✓' : String(lessonIndex + 1).padStart(2, '0')}</span>{lesson.title}</Link> })}<Link className={styles.assessment} to={`/app/skillcheck/${mod.id}`}>{passed ? 'Assessment recorded' : 'Module assessment'} <span>→</span></Link></div>}</section>
        })}
      </nav>
      <nav className={styles.utility} aria-label="Course utilities"><Link to="/app/lab">Studio</Link><Link to="/app/profile">Transcript</Link><Link to="/app/settings">Reading settings</Link></nav>
    </aside>
  )
}
