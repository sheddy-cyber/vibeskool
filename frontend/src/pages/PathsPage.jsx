import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATHS, useStore } from '@/lib/store'
import { Badge, ProgressBar, SectionTitle } from '@/components/ui'
import styles from './PathsPage.module.css'

const COLOR_MAP = { violet: 'violet', teal: 'teal', amber: 'amber', red: 'red' }

export default function PathsPage() {
  const { progress } = useStore()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)

  return (
    <div className={styles.page}>
      <div className={styles.header + ' animate-fade-in'}>
        <h1 className={styles.title}>Skill Paths</h1>
        <p className={styles.sub}>
          Four ruthlessly edited tracks. Each one gives you exactly enough to build with AI — and nothing you don't need.
        </p>
      </div>

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
              className={styles.pathCard + ' animate-fade-in'}
              style={{ animationDelay: `${i * 60}ms` }}
              data-color={color}
            >
              {/* Top accent line */}
              <div className={styles.accentLine} data-color={color} />

              <div className={styles.pathHeader} onClick={() => setExpanded(isOpen ? null : path.id)}>
                <div className={styles.pathLeft}>
                  <span className={styles.pathIcon}>{path.icon}</span>
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
