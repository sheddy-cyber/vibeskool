import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATHS, useStore } from '@/lib/store'
import { Badge, ProgressBar, SectionTitle } from '@/components/ui'
import styles from './PathsPage.module.css'
import { FadeUp, RevealOnScroll, StaggerGroup } from '@/components/ui/Motion'


const PATH_SVGS = {
  'vibe-web': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  'vibe-coding': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  'git-github': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>,
  'python-basics': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  'apis': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 9l3 3-3 3"/><line x1="13" y1="15" x2="16" y2="15"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  'sql-basics': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
}

const COLOR_MAP = { violet: 'violet', teal: 'teal', amber: 'amber', red: 'red' }

export default function PathsPage() {
  const { progress } = useStore()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)

  return (
    <div className={styles.page}>
      <FadeUp delay={0}><div className={styles.header}>
        <h1 className={styles.title}>Skill Paths</h1>
        <p className={styles.sub}>
          Four ruthlessly edited tracks. Each one gives you exactly enough to build with AI — and nothing you don't need.
        </p>
      </div></FadeUp>

      <div className={styles.paths}>
        {PATHS.map((path, i) => {
          const done  = progress[path.id] || 0
          const total = path.lessons_data.length
          const pct   = Math.round((done / total) * 100)
          const color = COLOR_MAP[path.color] || 'violet'
          const isOpen = expanded === path.id

          return (
            <div
              key={path.id}
              className={styles.pathCard}
              data-color={color}
            >
              {/* Top accent line */}
              <div className={styles.accentLine} data-color={color} />

              <div className={styles.pathHeader} onClick={() => setExpanded(isOpen ? null : path.id)}>
                <div className={styles.pathLeft}>
                  <span className={styles.pathIcon}>{PATH_SVGS[path.id] || PATH_SVGS['vibe-coding']}</span>
                  <div>
                    <div className={styles.pathTitleRow}>
                      <h2 className={styles.pathName}>{path.name}</h2>
                      <Badge color={color}>{path.tag}</Badge>
                    </div>
                    <p className={styles.pathDesc}>{path.description}</p>
                  </div>
                </div>
                <div className={styles.pathRight}>
                  <div className={styles.pathStats}>
                    <span className={styles.pathStatNum} data-color={color}>{total}</span>
                    <span className={styles.pathStatLabel}>lessons</span>
                  </div>
                  <div className={styles.pathStats}>
                    <span className={styles.pathStatNum} data-color={color}>{pct}%</span>
                    <span className={styles.pathStatLabel}>complete</span>
                  </div>
                  <button
                    className={styles.startBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      const idx = Math.min(done, total - 1)
                      navigate(`/app/lesson/${path.lessons_data[idx].id}`)
                    }}
                  >
                    {done === 0 ? 'Start' : done >= total ? 'Review' : 'Continue'} →
                  </button>
                </div>
              </div>

              <ProgressBar value={done} max={total} color={color} height={3} />

              {/* Lessons list (expanded) */}
              {isOpen && (
                <div className={styles.lessonsList}>
                  {path.lessons_data.map((lesson, j) => {
                    const isDone = j < done
                    const isCurrent = j === done
                    return (
                      <div
                        key={lesson.id}
                        className={`${styles.lessonRow} ${isDone ? styles.lessonDone : ''} ${isCurrent ? styles.lessonCurrent : ''}`}
                        onClick={() => navigate(`/app/lesson/${lesson.id}`)}
                      >
                        <div className={styles.lessonNum} data-color={color}>
                          {isDone ? '✓' : j + 1}
                        </div>
                        <div className={styles.lessonInfo}>
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                          <span className={styles.lessonDuration}>{lesson.duration}</span>
                        </div>
                        {lesson.part && <span className={styles.partTag} data-part={lesson.part}>{lesson.part}</span>}
                        {isCurrent && <span className={styles.lessonCurrentBadge}>Up next</span>}
                      </div>
                    )
                  })}
                </div>
              )}

              <button
                className={styles.toggleBtn}
                onClick={() => setExpanded(isOpen ? null : path.id)}
              >
                {isOpen ? '↑ Hide lessons' : `↓ View all ${total} lessons`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
