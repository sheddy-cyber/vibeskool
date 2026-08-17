import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { StatCard, SectionTitle, ProgressBar, Badge, MEKBar, GoalWidget } from '@/components/ui'
import { FadeUp, RevealOnScroll } from '@/components/ui/Motion'
import styles from './DashboardPage.module.css'

const PATH_COLORS = { violet: 'violet', teal: 'teal', amber: 'amber', red: 'red' }

const PATH_SVG = {
  'vibe-web': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  'vibe-coding': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  'git-github': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>,
  'python-basics': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  'apis': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 9l3 3-3 3"/><line x1="13" y1="15" x2="16" y2="15"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  'sql-basics': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
}

export default function DashboardPage() {
  const { user: storeUser, progress } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const user = currentUser ? {
    name: currentUser.name,
    avatar: currentUser.avatar,
    mekScore: currentUser.mekScore ?? 0,
    lessonsCompleted: currentUser.lessonsCompleted ?? 0,
    buildsUnlocked: currentUser.buildsUnlocked ?? 0,
  } : storeUser

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const inProgress = PATHS.find(p => {
    const done  = progress[p.id] || 0
    const total = p.lessons_data.length
    return done > 0 && done < total
  })

  // Group paths into Web development vs others for a clean interface
  const mainPath = PATHS[0] // Full Stack Web

  return (
    <div className={styles.page}>
      {/* Header */}
      <FadeUp delay={0} duration={420}>
        <div className={styles.header}>
          <h1 className={styles.greeting}>
            {greeting}, <span className={styles.name}>{user.name}</span>
          </h1>
          <p className={styles.sub}>
            {inProgress
              ? `${inProgress.lessons_data.length - (progress[inProgress.id] || 0)} lessons left in "${inProgress.name}"`
              : 'Pick a skill path below to start building with AI.'}
          </p>
        </div>
      </FadeUp>

      {/* 2-Column Desktop Grid Layout */}
      <div className={styles.dashboardGrid}>
        
        {/* Main Content Pane */}
        <div className={styles.mainContent}>
          {/* MEK bar */}
          <FadeUp delay={60} duration={400}>
            <div className={styles.mekSection}>
              <MEKBar score={user.mekScore} label="enough to build a full landing page with AI" />
            </div>
          </FadeUp>

          {/* Stats Grid */}
          <div>
            <div className={styles.stats}>
              <StatCard label="Lessons Done"    value={user.lessonsCompleted} sub="+2 completed this week" color="violet" />
              <StatCard label="MEK Score"       value={`${user.mekScore}%`}   sub="Full stack web track"   color="teal"   />
              <StatCard label="Builds Unlocked" value={user.buildsUnlocked}   sub="Mockups & static apps"  color="amber"  />
            </div>
          </div>

          {/* Continue Card */}
          {inProgress && (
            <RevealOnScroll y={16} delay={0}>
              <div className={styles.continueCard}>
                <div className={styles.continueLeft}>
                  <span className={styles.continueLabel}>Continue where you left off</span>
                  <div className={styles.continueIconRow}>
                    <div className={styles.continueIcon}>
                      {PATH_SVG[inProgress.id] || PATH_SVG['vibe-coding']}
                    </div>
                    <div>
                      <h3 className={styles.continueName}>{inProgress.name}</h3>
                      <p className={styles.continueLesson}>
                        Next: {inProgress.lessons_data[progress[inProgress.id] || 0]?.title}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  className={styles.continueBtn}
                  onClick={() => {
                    const idx = progress[inProgress.id] || 0
                    navigate(`/app/lesson/${inProgress.lessons_data[idx].id}`)
                  }}
                >
                  Continue →
                </button>
              </div>
            </RevealOnScroll>
          )}

          {/* Paths grid */}
          <div className={styles.pathsSection}>
            <RevealOnScroll y={12}>
              <div className={styles.sectionHeader}>
                <SectionTitle>Curriculum Tracks</SectionTitle>
              </div>
            </RevealOnScroll>
            
            <div className={styles.pathsGrid}>
              {PATHS.map((path) => {
                const done  = progress[path.id] || 0
                const total = path.lessons_data.length
                const pct   = total > 0 ? Math.round((done / total) * 100) : 0
                const color = PATH_COLORS[path.color] || 'violet'
                const nextLesson = path.lessons_data[Math.min(done, total - 1)]
                
                return (
                  <div
                    key={path.id}
                    className={styles.pathCard}
                    onClick={() => nextLesson && navigate(`/app/lesson/${nextLesson.id}`)}
                  >
                    <div className={styles.pathTop}>
                      <span className={styles.pathIconWrap} data-color={color}>
                        {PATH_SVG[path.id] || PATH_SVG['vibe-coding']}
                      </span>
                      <Badge color={color}>{total > 0 ? path.tag : 'Coming soon'}</Badge>
                    </div>
                    <h3 className={styles.pathName}>{path.name}</h3>
                    <p className={styles.pathDesc}>{path.description}</p>
                    
                    {total > 0 ? (
                      <>
                        <ProgressBar value={done} max={total} color={color} />
                        <div className={styles.pathMeta}>
                          <span className={styles.pathCount}>{done} / {total} lessons</span>
                          <span className={styles.pathPct} data-color={color}>{pct}%</span>
                        </div>
                      </>
                    ) : (
                      <div className={styles.pathLocked}>
                        <span>🔒 Development track locked</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Widget Column */}
        <div className={styles.sidebarContent}>
          <FadeUp delay={100}>
            <div className={styles.widgetContainer}>
              <GoalWidget />
            </div>
          </FadeUp>

          <FadeUp delay={160}>
            <div className={styles.trophyCard}>
              <h4 className={styles.trophyTitle}>Unlocked Achievements</h4>
              <p className={styles.trophyDesc}>Milestones reached through MEK</p>
              
              <div className={styles.trophyList}>
                <div className={styles.trophyRow} data-achieved={user.lessonsCompleted >= 1}>
                  <span className={styles.trophyIcon}>🌱</span>
                  <div>
                    <span className={styles.trophyName}>Hello World</span>
                    <span className={styles.trophySub}>Completed your first lesson</span>
                  </div>
                </div>
                <div className={styles.trophyRow} data-achieved={user.lessonsCompleted >= 5}>
                  <span className={styles.trophyIcon}>🛠️</span>
                  <div>
                    <span className={styles.trophyName}>Tooling Up</span>
                    <span className={styles.trophySub}>Setup Terminal & Git workflow</span>
                  </div>
                </div>
                <div className={styles.trophyRow} data-achieved={user.lessonsCompleted >= 10}>
                  <span className={styles.trophyIcon}>⚛️</span>
                  <div>
                    <span className={styles.trophyName}>Reactive Creator</span>
                    <span className={styles.trophySub}>Unlocked React modules</span>
                  </div>
                </div>
                <div className={styles.trophyRow} data-achieved={user.buildsUnlocked >= 4}>
                  <span className={styles.trophyIcon}>🚢</span>
                  <div>
                    <span className={styles.trophyName}>AI Director</span>
                    <span className={styles.trophySub}>Unlocked 4 capstone templates</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>

      </div>
    </div>
  )
}
