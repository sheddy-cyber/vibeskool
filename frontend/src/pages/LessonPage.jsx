import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, LESSONS_CONTENT, PATHS } from '@/lib/store'
import { Button, MEKBar, CodeBlock, Callout, AiPromptBox } from '@/components/ui'
import FriendlyTerminal from '@/components/terminal/FriendlyTerminal'
import styles from './LessonPage.module.css'

export default function LessonPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { completeLesson, progress, user } = useStore()
  const [completed, setCompleted] = useState(false)

  const lesson = LESSONS_CONTENT[id]

  // Fallback for lessons without full content yet
  if (!lesson) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <span style={{ fontSize: 40 }}>🚧</span>
          <h2>Lesson content coming soon</h2>
          <p>This lesson is being written. Check back shortly.</p>
          <Button onClick={() => navigate('/app/paths')}>← Back to Paths</Button>
        </div>
      </div>
    )
  }

  const path       = PATHS.find(p => p.id === lesson.pathId)
  const pathDone   = progress[lesson.pathId] || 0
  const pathTotal  = path?.lessons_data.length || 1
  const mekPct     = Math.min(100, Math.round((pathDone / pathTotal) * 100) + (completed ? 8 : 0))

  function handleComplete() {
    if (!completed) {
      completeLesson(lesson.pathId)
      setCompleted(true)
    }
  }

  // Next lesson
  const lessonIdx = path?.lessons_data.findIndex(l => l.id === id) ?? -1
  const nextLesson = path?.lessons_data[lessonIdx + 1]

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header + ' animate-fade-in'}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/paths')}>
          ← Back
        </Button>
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbPath}>{path?.name}</span>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbLesson}>{lesson.title}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.duration}>⏱ {lesson.duration}</span>
          {!completed ? (
            <Button variant="teal" size="sm" onClick={handleComplete}>
              Mark complete ✓
            </Button>
          ) : (
            <span className={styles.completedBadge}>✓ Completed</span>
          )}
        </div>
      </div>

      {/* MEK bar */}
      <MEKBar score={mekPct} label={lesson.mekLabel} />

      {/* Main content */}
      <div className={styles.body}>
        {/* Left: lesson content */}
        <div className={styles.content + ' animate-slide-in'}>
          <h1 className={styles.lessonTitle}>{lesson.title}</h1>

          {lesson.sections.map((sec, i) => (
            <div key={i} className={styles.section}>
              <h2 className={styles.sectionHeading}>{sec.heading}</h2>
              {sec.body && <p className={styles.sectionBody}>{sec.body}</p>}
              {sec.callout && <Callout color="violet">{sec.callout}</Callout>}
              {sec.code && <CodeBlock code={sec.code} />}
            </div>
          ))}

          <AiPromptBox prompt={lesson.aiPrompt} />

          {/* Next lesson or completion */}
          <div className={styles.lessonFooter}>
            {completed && nextLesson ? (
              <div className={styles.nextCard}>
                <div>
                  <span className={styles.nextLabel}>Up next</span>
                  <p className={styles.nextTitle}>{nextLesson.title}</p>
                </div>
                <Button onClick={() => navigate(`/app/lesson/${nextLesson.id}`)}>
                  Next lesson →
                </Button>
              </div>
            ) : completed && !nextLesson ? (
              <div className={styles.pathComplete}>
                🎉 You've finished this path! Time for a Skill Check.
                <Button onClick={() => navigate('/app/skillcheck')} variant="teal">
                  Take Skill Check →
                </Button>
              </div>
            ) : (
              <Button variant="teal" onClick={handleComplete}>
                Mark as complete and continue →
              </Button>
            )}
          </div>
        </div>

        {/* Right: terminal */}
        <div className={styles.terminalCol + ' animate-fade-in'} style={{ animationDelay: '80ms' }}>
          <div className={styles.terminalLabel}>
            <span>🧪 Lab</span>
            <span className={styles.terminalSub}>Practice what you just learned</span>
          </div>
          <div className={styles.terminalWrap}>
            <FriendlyTerminal mission={lesson.terminalMission} mode="guided" />
          </div>
        </div>
      </div>
    </div>
  )
}
