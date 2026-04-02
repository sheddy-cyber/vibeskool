import React from 'react'
import { useStore, PATHS } from '@/lib/store'
import { ProgressBar, MEKBar } from '@/components/ui'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, progress } = useStore()

  const totalLessons = PATHS.reduce((sum, p) => sum + p.lessons_data.length, 0)
  const doneLessons  = Object.values(progress).reduce((a, b) => a + b, 0)
  const overallPct   = Math.round((doneLessons / totalLessons) * 100)

  const BUILDS = [
    { icon: '🌐', title: 'Landing Page with AI', unlocked: user.mekScore >= 30 },
    { icon: '🤖', title: 'Chatbot Interface',     unlocked: user.mekScore >= 50 },
    { icon: '📦', title: 'REST API (AI-assisted)', unlocked: user.mekScore >= 65 },
    { icon: '🗄️', title: 'Database-backed App',   unlocked: user.mekScore >= 80 },
    { icon: '🚀', title: 'Full-Stack Deploy',      unlocked: user.mekScore >= 95 },
  ]

  return (
    <div className={styles.page}>
      {/* Profile card */}
      <div className={styles.profileCard + ' animate-fade-in'}>
        <div className={styles.avatarLg}>{user.avatar}</div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>{user.name}</h1>
          <p className={styles.profileSub}>AI-native learner · VibeSkool</p>
          <div className={styles.profileStats}>
            <div className={styles.pStat}>
              <span className={styles.pStatNum}>{user.lessonsCompleted}</span>
              <span className={styles.pStatLabel}>Lessons done</span>
            </div>
            <div className={styles.pStatDiv} />
            <div className={styles.pStat}>
              <span className={styles.pStatNum}>{user.mekScore}%</span>
              <span className={styles.pStatLabel}>MEK Score</span>
            </div>
            <div className={styles.pStatDiv} />
            <div className={styles.pStat}>
              <span className={styles.pStatNum}>{user.buildsUnlocked}</span>
              <span className={styles.pStatLabel}>Builds unlocked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall MEK */}
      <div className={'animate-fade-in'} style={{ animationDelay: '60ms' }}>
        <MEKBar score={user.mekScore} label="enough to build a full landing page with AI" />
      </div>

      {/* Overall progress */}
      <div className={styles.section + ' animate-fade-in'} style={{ animationDelay: '90ms' }}>
        <h2 className={styles.sectionTitle}>Overall Progress</h2>
        <div className={styles.overallProgress}>
          <div className={styles.overallTop}>
            <span className={styles.overallLabel}>Across all paths</span>
            <span className={styles.overallPct}>{overallPct}%</span>
          </div>
          <ProgressBar value={doneLessons} max={totalLessons} color="violet" height={6} />
          <span className={styles.overallSub}>{doneLessons} of {totalLessons} lessons complete</span>
        </div>
      </div>

      {/* Per-path progress */}
      <div className={styles.section + ' animate-fade-in'} style={{ animationDelay: '120ms' }}>
        <h2 className={styles.sectionTitle}>Path Breakdown</h2>
        <div className={styles.pathsBreakdown}>
          {PATHS.map(path => {
            const done  = progress[path.id] || 0
            const total = path.lessons_data.length
            const pct   = Math.round((done / total) * 100)
            return (
              <div key={path.id} className={styles.pathRow}>
                <span className={styles.pathRowIcon}>{path.icon}</span>
                <div className={styles.pathRowInfo}>
                  <div className={styles.pathRowTop}>
                    <span className={styles.pathRowName}>{path.name}</span>
                    <span className={styles.pathRowPct}>{pct}%</span>
                  </div>
                  <ProgressBar value={done} max={total} color={path.color} height={4} />
                  <span className={styles.pathRowSub}>{done} / {total} lessons</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Builds unlocked */}
      <div className={styles.section + ' animate-fade-in'} style={{ animationDelay: '160ms' }}>
        <h2 className={styles.sectionTitle}>Builds Unlocked</h2>
        <p className={styles.buildsSub}>These are things you can now build with AI based on your MEK score.</p>
        <div className={styles.buildsList}>
          {BUILDS.map((b, i) => (
            <div key={i} className={`${styles.buildRow} ${b.unlocked ? styles.buildUnlocked : styles.buildLocked}`}>
              <span className={styles.buildIcon}>{b.icon}</span>
              <span className={styles.buildTitle}>{b.title}</span>
              <span className={styles.buildStatus}>{b.unlocked ? '✓ Unlocked' : '🔒 Keep learning'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
