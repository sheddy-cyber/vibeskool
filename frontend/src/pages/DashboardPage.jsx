import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { StatCard, SectionTitle, ProgressBar, Badge, MEKBar } from '@/components/ui'
import { FadeUp, RevealOnScroll } from '@/components/ui/Motion'
import styles from './DashboardPage.module.css'

const PATH_COLORS = { violet: 'violet', teal: 'teal', amber: 'amber', red: 'red' }

const PATH_SVG = {
  'vibe-web': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  'vibe-coding': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  'git-github': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>,
  'python-basics': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  'apis': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 9l3 3-3 3"/><line x1="13" y1="15" x2="16" y2="15"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  'sql-basics': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
}

const QuickIcons = {
  lab:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  quiz:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  paths:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
}

export default function DashboardPage() {
  const { user: storeUser, progress } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  // Use live auth data when available, fall back to store defaults
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

      {/* MEK bar */}
      <FadeUp delay={80} duration={400}>
        <MEKBar score={user.mekScore} label="enough to build a full landing page with AI" />
      </FadeUp>

      {/* Stats */}
      <div className={styles.stats + ' stagger animate-fade-in'} style={{animationDelay:'80ms'}}>
        <StatCard label="Lessons Done"    value={user.lessonsCompleted} sub="+2 this week"             color="violet" />
        <StatCard label="MEK Score"       value={`${user.mekScore}%`}   sub="Web track"                color="teal"   />
        <StatCard label="Builds Unlocked" value={user.buildsUnlocked}   sub="Things you can now build" color="amber"  />
      </div>

      {/* Continue card */}
      {inProgress && (
        <RevealOnScroll y={16} delay={0}>
          <div className={styles.continueCard}>
            <div className={styles.continueLeft}>
              <span className={styles.continueLabel}>Continue where you left off</span>
              <div className={styles.continueIcon}>
                {PATH_SVG[inProgress.id] || PATH_SVG['vibe-coding']}
              </div>
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
        </RevealOnScroll>
      )}

      {/* Paths grid */}
      <div>
        <RevealOnScroll y={12}>
          <SectionTitle>Skill Paths</SectionTitle>
        </RevealOnScroll>
        <div className={styles.pathsGrid}>
          {PATHS.map((path) => {
            const done  = progress[path.id] || 0
            const total = path.lessons_data.length
            const pct   = Math.round((done / total) * 100)
            const color = PATH_COLORS[path.color] || 'violet'
            const nextLesson = path.lessons_data[Math.min(done, total - 1)]
            return (
              <div
                key={path.id}
                className={styles.pathCard}
                onClick={() => navigate(`/app/lesson/${nextLesson.id}`)}
              >
                <div className={styles.pathAccent} data-color={color} />
                <div className={styles.pathTop}>
                  <span className={styles.pathIconWrap} data-color={color}>
                    {PATH_SVG[path.id] || PATH_SVG['vibe-coding']}
                  </span>
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
      <RevealOnScroll y={16}>
        <div className={styles.quickActions}>
          <SectionTitle>Quick Actions</SectionTitle>
          <div className={styles.quickGrid}>
            {[
              { icon: QuickIcons.lab,      label: 'Open the Lab',       sub: 'Free sandbox mode',          to: '/app/lab' },
              { icon: QuickIcons.quiz,     label: 'Skill Check',         sub: '10-minute competence quiz',  to: '/app/skillcheck' },
              { icon: QuickIcons.paths,    label: 'Browse All Paths',    sub: 'See every skill track',      to: '/app/paths' },
              { icon: QuickIcons.settings, label: 'Settings',            sub: 'Themes, font size & more',   to: '/app/settings' },
            ].map(({ icon, label, sub, to }) => (
              <button key={to} className={styles.quickCard} onClick={() => navigate(to)}>
                <span className={styles.quickIcon}>{icon}</span>
                <span className={styles.quickLabel}>{label}</span>
                <span className={styles.quickSub}>{sub}</span>
              </button>
            ))}
          </div>
        </div>
      </RevealOnScroll>
    </div>
  )
}
