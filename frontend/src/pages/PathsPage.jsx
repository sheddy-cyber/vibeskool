import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATHS, useStore } from '@/lib/store'
import { Badge, ProgressBar, SectionTitle } from '@/components/ui'
import styles from './PathsPage.module.css'
import { FadeUp, StaggerGroup } from '@/components/ui/Motion'

const PATH_SVGS = {
  'full-stack-web': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  'mobile-app': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  'blockchain-web3': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  'game-dev': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z"/></svg>,
  'os-low-level': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  'ai-ml': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 00-8 8c0 3.5 2 6.5 5 8l-1 4h8l-1-4c3-1.5 5-4.5 5-8a8 8 0 00-8-8z"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><path d="M9 14c.8.8 2 1.5 3 1.5s2.2-.7 3-1.5"/></svg>,
}

const COLOR_MAP = { violet: 'violet', teal: 'teal', amber: 'amber', red: 'red', stone: 'stone', green: 'green' }

function getModuleLessons(path, moduleId) {
  const prefix = moduleId.replace('m', 'M') + ':'
  return path.lessons_data.filter(l => l.part?.startsWith(prefix))
}

function moduleProgress(path, moduleId, progress) {
  const lessons = getModuleLessons(path, moduleId)
  if (!lessons.length) return 0
  const globalIdx = path.lessons_data.findIndex(l => l.id === lessons[0].id)
  const done = Math.max(0, Math.min((progress[path.id] || 0) - globalIdx, lessons.length))
  return done
}

function ProgressRing({ radius, stroke, progress, color }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorVar = `var(--${color})`;

  return (
    <div className={styles.progressRingContainer}>
      <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="var(--bg-overlay)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={colorVar}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className={styles.progressRingText}>{Math.round(progress)}%</div>
    </div>
  );
}

export default function PathsPage() {
  const { progress, passedModules } = useStore()
  const navigate = useNavigate()
  const [expandedPath, setExpandedPath] = useState(null)
  const [expandedModule, setExpandedModule] = useState(null)

  return (
    <div className={styles.page}>
      <FadeUp delay={0}><div className={styles.header}>
        <h1 className={styles.title}>Skill Paths</h1>
        <p className={styles.sub}>
          Choose your discipline. Each path is a carefully curated journey from beginner to professional.
        </p>
      </div></FadeUp>

      <div className={styles.paths}>
        {PATHS.map((path) => {
          const done  = progress[path.id] || 0
          const total = path.lessons_data.length
          const pct   = total > 0 ? Math.round((done / total) * 100) : 0
          const color = COLOR_MAP[path.color] || 'violet'
          const isOpen = expandedPath === path.id
          const hasModules = path.modules && path.modules.length > 0

          return (
            <div 
              key={path.id} 
              className={`${styles.pathCard} ${isOpen ? styles.expanded : ''}`}
            >
              <div className={styles.accentGlow} data-color={color} />

              <div className={styles.pathHeader} onClick={() => setExpandedPath(isOpen ? null : path.id)}>
                <div className={styles.pathLeft}>
                  <div className={styles.pathIcon} data-color={color}>
                    {PATH_SVGS[path.id] || PATH_SVGS['full-stack-web']}
                  </div>
                  <div>
                    <div className={styles.pathTitleRow}>
                      <h2 className={styles.pathName}>{path.name}</h2>
                      <Badge color={color}>{path.tag}</Badge>
                    </div>
                    <p className={styles.pathDesc}>{path.description}</p>
                    
                    {total > 0 && !isOpen && (
                      <button
                        className={styles.startBtn}
                        data-color={color}
                        style={{ marginTop: '16px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          const idx = Math.min(done, total - 1)
                          navigate(`/app/lesson/${path.lessons_data[idx].id}`)
                        }}
                      >
                        {done === 0 ? 'Start Journey' : done >= total ? 'Review Course' : 'Continue Path'} →
                      </button>
                    )}
                  </div>
                </div>
                
                {total > 0 && (
                  <ProgressRing radius={30} stroke={4} progress={pct} color={color} />
                )}
              </div>

              {isOpen && hasModules && (
                <div className={styles.timelineContainer}>
                  <div className={styles.timelineLine} />
                  
                  {path.modules.map((mod, mi) => {
                    const mLessons = getModuleLessons(path, mod.id)
                    const mDone = moduleProgress(path, mod.id, progress)
                    const mTotal = mLessons.length
                    const isModOpen = expandedModule === mod.id

                    const modIndex = path.modules.findIndex(m => m.id === mod.id)
                    const isUnlocked = modIndex === 0 || (passedModules || []).includes(path.modules[modIndex - 1].id)
                    const isPassed = (passedModules || []).includes(mod.id)
                    
                    const statusClass = !isUnlocked ? styles.locked : (isPassed ? styles.passed : styles.current)

                    return (
                      <div key={mod.id} className={`${styles.timelineNode} ${statusClass}`}>
                        
                        <div className={styles.nodeIconWrap}>
                          {isPassed ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : !isUnlocked ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          )}
                        </div>

                        <div className={styles.nodeContent}>
                          <div 
                            className={styles.nodeHeader}
                            onClick={() => {
                              if (!isUnlocked) return
                              setExpandedModule(isModOpen ? null : mod.id)
                            }}
                          >
                            <div>
                              <div className={styles.nodeMetaBadge} style={{ marginBottom: '8px', display: 'inline-block' }}>
                                {mod.id.replace('m', 'MODULE ')}
                              </div>
                              <h3 className={styles.nodeTitle}>{mod.title}</h3>
                              <p className={styles.nodeGoal}>{mod.goal}</p>
                            </div>

                            {mTotal > 0 && (
                              <button
                                className={`${styles.moduleActionBtn} ${mDone === mTotal && !isPassed ? styles.primaryAction : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!isUnlocked) return
                                  if (mDone === mTotal && !isPassed) {
                                    navigate(`/app/skillcheck/${mod.id}`)
                                  } else {
                                    navigate(`/app/lesson/${mLessons[0].id}`)
                                  }
                                }}
                                disabled={!isUnlocked}
                              >
                                {!isUnlocked 
                                  ? 'Locked' 
                                  : mDone === mTotal 
                                    ? isPassed 
                                      ? 'Review ✓' 
                                      : 'Take Test →' 
                                    : mDone === 0 
                                      ? 'Start →' 
                                      : 'Continue →'
                                }
                              </button>
                            )}
                          </div>

                          {isModOpen && isUnlocked && (
                            <div className={styles.lessonsList}>
                              {mLessons.map((lesson, j) => {
                                const lessonGlobalIdx = path.lessons_data.findIndex(l => l.id === lesson.id)
                                const isDone = lessonGlobalIdx < done
                                const isCurrent = lessonGlobalIdx === done
                                return (
                                  <div
                                    key={lesson.id}
                                    className={`${styles.lessonRow} ${isDone ? styles.lessonDone : ''} ${isCurrent ? styles.lessonCurrent : ''}`}
                                    onClick={() => navigate(`/app/lesson/${lesson.id}`)}
                                  >
                                    <div className={styles.lessonNum}>
                                      {isDone ? '✓' : j + 1}
                                    </div>
                                    <div className={styles.lessonInfo}>
                                      <span className={styles.lessonTitle}>{lesson.title}</span>
                                      <span className={styles.lessonDuration}>{lesson.duration}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
