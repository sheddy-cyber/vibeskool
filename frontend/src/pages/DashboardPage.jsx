import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import { StatCard, SectionTitle, ProgressBar, Badge, MEKBar } from '@/components/ui'
import styles from './DashboardPage.module.css'

const PATH_COLORS = { violet: 'violet', teal: 'teal', amber: 'amber', red: 'red' }

export default function DashboardPage() {
  const { user, progress } = useStore()
  const navigate = useNavigate()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Next lesson suggestion
  const inProgress = PATHS.find(p => {
    const done  = progress[p.id] || 0
    const total = p.lessons_data.length
    return done > 0 && done < total
  })

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header + ' animate-fade-in'}>
        <h1 className={styles.greeting}>
          {greeting}, <span className={styles.name}>{user.name}</span> 👋
        </h1>
        <p className={styles.sub}>
          {inProgress
            ? `You're ${inProgress.lessons_data.length - (progress[inProgress.id] || 0)} lessons away from completing "${inProgress.name}"`
            : 'Pick a skill path below to start building with AI.'}
        </p>
      </div>

      {/* MEK bar */}
      <div className={'animate-fade-in stagger'} style={{ animationDelay: '60ms' }}>
        <MEKBar score={user.mekScore} label="enough to build a full landing page with AI" />
      </div>

      {/* Stats */}
      <div className={styles.stats + ' stagger'}>
        <StatCard
          label="Lessons Done"
          value={user.lessonsCompleted}
          sub="+2 this week"
          color="violet"
        />
        <StatCard
          label="MEK Score"
          value={`${user.mekScore}%`}
          sub="Web track"
          color="teal"
        />
        <StatCard
          label="Builds Unlocked"
          value={user.buildsUnlocked}
          sub="Things you can now build"
          color="amber"
        />
      </div>

      {/* Continue card */}
      {inProgress && (
        <div className={styles.continueCard + ' animate-fade-in'} style={{ animationDelay: '120ms' }}>
          <div className={styles.continueLeft}>
            <span className={styles.continueLabel}>Continue where you left off</span>
            <span className={styles.continueIcon}>{inProgress.icon}</span>
            <h3 className={styles.continueName}>{inProgress.name}</h3>
            <p className={styles.continueLesson}>
              Next: {inProgress.lessons_data[progress[inProgress.id] || 0]?.title}
            </p>
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
      )}

      {/* Paths grid */}
      <div>
        <SectionTitle>Skill Paths</SectionTitle>
        <div className={styles.pathsGrid + ' stagger'}>
          {PATHS.map((path) => {
            const done  = progress[path.id] || 0
            const total = path.lessons_data.length
            const pct   = Math.round((done / total) * 100)
            const color = PATH_COLORS[path.color] || 'violet'
            const nextLesson = path.lessons_data[Math.min(done, total - 1)]

            return (
              <div
                key={path.id}
                className={styles.pathCard + ' animate-fade-in'}
                onClick={() => navigate(`/app/lesson/${nextLesson.id}`)}
              >
                <div className={styles.pathAccent} data-color={color} />
                <div className={styles.pathTop}>
                  <span className={styles.pathIcon}>{path.icon}</span>
                  <Badge color={color}>{path.tag}</Badge>
                </div>
                <h3 className={styles.pathName}>{path.name}</h3>
                <p className={styles.pathDesc}>{path.description}</p>
                <ProgressBar value={done} max={total} color={color} />
                <div className={styles.pathMeta}>
                  <span className={styles.pathCount}>{done} / {total} lessons</span>
                  <span className={styles.pathPct} data-color={color}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <SectionTitle>Quick Actions</SectionTitle>
        <div className={styles.quickGrid}>
          <button className={styles.quickCard} onClick={() => navigate('/app/lab')}>
            <span className={styles.quickIcon}>🧪</span>
            <span className={styles.quickLabel}>Open the Lab</span>
            <span className={styles.quickSub}>Free sandbox mode</span>
          </button>
          <button className={styles.quickCard} onClick={() => navigate('/app/skillcheck')}>
            <span className={styles.quickIcon}>🎯</span>
            <span className={styles.quickLabel}>Take a Skill Check</span>
            <span className={styles.quickSub}>10 minutes to prove competence</span>
          </button>
          <button className={styles.quickCard} onClick={() => navigate('/app/paths')}>
            <span className={styles.quickIcon}>🗺️</span>
            <span className={styles.quickLabel}>Browse All Paths</span>
            <span className={styles.quickSub}>See every skill track</span>
          </button>
          <button className={styles.quickCard} onClick={() => navigate('/app/settings')}>
            <span className={styles.quickIcon}>⚙️</span>
            <span className={styles.quickLabel}>Settings</span>
            <span className={styles.quickSub}>Themes, font size & more</span>
          </button>
        </div>
      </div>
    </div>
  )
}
