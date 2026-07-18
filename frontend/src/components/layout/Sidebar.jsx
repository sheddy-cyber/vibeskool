import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import styles from './Sidebar.module.css'

const PATH_SVGS = {
  'full-stack-web': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  'mobile-app': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  'blockchain-web3': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  'game-dev': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z"/>
    </svg>
  ),
  'os-low-level': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  'ai-ml': (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a8 8 0 00-8 8c0 3.5 2 6.5 5 8l-1 4h8l-1-4c3-1.5 5-4.5 5-8a8 8 0 00-8-8z"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><path d="M9 14c.8.8 2 1.5 3 1.5s2.2-.7 3-1.5"/>
    </svg>
  ),
}

const NAV_ITEMS = [
  {
    to: '/app/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <rect x="1" y="1" width="5" height="5" rx="1.2"/>
        <rect x="8" y="1" width="5" height="5" rx="1.2"/>
        <rect x="1" y="8" width="5" height="5" rx="1.2"/>
        <rect x="8" y="8" width="5" height="5" rx="1.2"/>
      </svg>
    ),
  },
  {
    to: '/app/paths',
    label: 'Skill Paths',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M2 3.5h10M2 7h7M2 10.5h8.5"/>
      </svg>
    ),
  },
  {
    to: '/app/lab',
    label: 'Sandbox Lab',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <rect x="1" y="2" width="12" height="10" rx="1.5"/>
        <path d="M4 5.5l2.5 2.5-2.5 2.5M8 10.5h2.5"/>
      </svg>
    ),
  },
]

const PATH_COLORS = { violet: 'var(--accent)', teal: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)' }

export default function Sidebar() {
  const { progress, passedModules, settings } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = currentUser?.role === 'admin'

  const [collapsedModules, setCollapsedModules] = useState({})

  // Route matches
  const isLessonPage = location.pathname.startsWith('/app/lesson/')
  const isSkillCheckPage = location.pathname.startsWith('/app/skillcheck/')

  let activeLessonId = null
  let activeModuleId = null

  if (isLessonPage) {
    activeLessonId = location.pathname.split('/').pop()
  } else if (isSkillCheckPage) {
    activeModuleId = location.pathname.split('/').pop()
  }

  // Find active path (defaults to first path if none matches)
  const activePath = PATHS.find(p => {
    if (activeLessonId) return p.lessons_data.some(l => l.id === activeLessonId)
    if (activeModuleId) return p.modules.some(m => m.id === activeModuleId)
    return false
  })

  // Expand module if navigating to a lesson in it
  useEffect(() => {
    if (activePath && activeLessonId) {
      const lesson = activePath.lessons_data.find(l => l.id === activeLessonId)
      if (lesson && lesson.part) {
        const modId = lesson.part.split(':')[0].toLowerCase()
        if (collapsedModules[modId]) {
          setCollapsedModules(prev => ({ ...prev, [modId]: false }))
        }
      }
    }
  }, [activeLessonId, activePath])

  const toggleModule = (modId) => {
    setCollapsedModules(prev => ({ ...prev, [modId]: !prev[modId] }))
  }

  // Dynamic lesson sidebar renderer
  if (activePath && (isLessonPage || isSkillCheckPage)) {
    const done = progress[activePath.id] || 0

    return (
      <aside className={styles.sidebar}>
        <div className={styles.section} style={{ paddingBottom: '12px' }}>
          <button className={styles.backBtn} onClick={() => navigate('/app/paths')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span className={styles.navLabel}>Back to Paths</span>
          </button>
          <div className={styles.pathHeader}>
            <h4 className={styles.pathTitle}>{activePath.name}</h4>
          </div>
        </div>

        <div className={styles.section} style={{ overflowY: 'auto', flex: 1, padding: '0 12px' }}>
          {activePath.modules.map((mod, modIdx) => {
            const mLessons = activePath.lessons_data.filter(l => l.part && l.part.startsWith(mod.id.replace('m', 'M') + ':'))
            const isUnlocked = modIdx === 0 || (passedModules || []).includes(activePath.modules[modIdx - 1].id)
            const isPassed = (passedModules || []).includes(mod.id)
            const isCollapsed = collapsedModules[mod.id]

            // Calculate module completion details
            const mCompletedCount = mLessons.filter(l => {
              const globalIdx = activePath.lessons_data.findIndex(pl => pl.id === l.id)
              return globalIdx < done
            }).length
            const isModuleLessonsDone = mLessons.length > 0 && mCompletedCount === mLessons.length

            return (
              <div key={mod.id} className={styles.chapterGroup}>
                <div 
                  className={`${styles.chapterHeader} ${isUnlocked ? styles.chapterHeaderClickable : ''}`}
                  onClick={() => isUnlocked && toggleModule(mod.id)}
                >
                  <span className={styles.chapterTitle}>
                    {modIdx}. {mod.title}
                  </span>
                  <div className={styles.chapterHeaderRight}>
                    {!isUnlocked ? (
                      <span style={{ opacity: 0.8 }}>🔒</span>
                    ) : (
                      <svg 
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  <div className={styles.lessonList}>
                    {isUnlocked && mLessons.map((lesson) => {
                      const lGlobalIdx = activePath.lessons_data.findIndex(pl => pl.id === lesson.id)
                      const isCompleted = lGlobalIdx < done
                      const isActive = lesson.id === activeLessonId

                      return (
                        <NavLink
                          key={lesson.id}
                          to={`/app/lesson/${lesson.id}`}
                          className={`${styles.lessonItem} ${isActive ? styles.active : ''}`}
                        >
                          {isCompleted ? (
                            <span className={styles.checkMark}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="8"/>
                              </svg>
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', opacity: 0.5, width: '10px', textAlign: 'center' }}>•</span>
                          )}
                          <span className="truncate" style={{ flex: 1 }}>{lesson.title}</span>
                        </NavLink>
                      )
                    })}

                    {/* Skill Check Indicator */}
                    {isUnlocked && isModuleLessonsDone && (
                      <NavLink
                        to={`/app/skillcheck/${mod.id}`}
                        className={`${styles.testItem} ${
                          activeModuleId === mod.id
                            ? styles.active
                            : isPassed
                              ? styles.passed
                              : styles.ready
                        }`}
                      >
                        <span>{isPassed ? '✓' : '⚡'}</span>
                        <span>Skill Check {mod.id.replace('m', '')}</span>
                      </NavLink>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className={styles.bottom}>
          <NavLink to="/app/profile" className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}>
            <span className={styles.navIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <circle cx="7" cy="4.5" r="2.5"/>
                <path d="M1.5 12.5c0-3 2.462-4.5 5.5-4.5s5.5 1.5 5.5 4.5"/>
              </svg>
            </span>
            <span className={styles.navLabel}>Profile</span>
          </NavLink>
        </div>
      </aside>
    )
  }

  // Fallback / Standard Navigation Sidebar
  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Navigation</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.active : ''].join(' ')
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>In Progress</span>
        {PATHS.filter((p) => (progress[p.id] || 0) > 0).map((path) => {
          const done  = progress[path.id] || 0
          const total = path.lessons_data.length
          const pct   = Math.round((done / total) * 100)
          const color = PATH_COLORS[path.color] || 'var(--accent)'
          return (
            <button
              key={path.id}
              className={styles.pathItem}
              onClick={() => navigate(`/app/lesson/${path.lessons_data[Math.min(done, total - 1)].id}`)}
            >
              <div className={styles.pathRow}>
                <span className={styles.pathIcon}>{PATH_SVGS[path.id] || PATH_SVGS['vibe-coding']}</span>
                <span className={styles.pathName}>{path.name}</span>
                <span className={styles.pathPct}>{pct}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
              </div>
            </button>
          )
        })}
        {PATHS.filter((p) => (progress[p.id] || 0) > 0).length === 0 && (
          <p className={styles.emptyHint}>No paths started yet</p>
        )}
      </div>

      <div className={styles.bottom}>
        <NavLink to="/app/profile" className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}>
          <span className={styles.navIcon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="7" cy="4.5" r="2.5"/>
              <path d="M1.5 12.5c0-3 2.462-4.5 5.5-4.5s5.5 1.5 5.5 4.5"/>
            </svg>
          </span>
          <span className={styles.navLabel}>Profile</span>
        </NavLink>
        <NavLink to="/app/settings" className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}>
          <span className={styles.navIcon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="7" cy="7" r="2"/>
              <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.636 2.636l1.414 1.414M9.95 9.95l1.414 1.414M2.636 11.364l1.414-1.414M9.95 4.05l1.414-1.414"/>
            </svg>
          </span>
          <span className={styles.navLabel}>Settings</span>
        </NavLink>
        {isAdmin && (
          <NavLink to="/app/admin/cms" className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}>
            <span className={styles.navIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 2h10a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z"/>
                <path d="M4 6h6M4 9h4"/>
              </svg>
            </span>
            <span className={styles.navLabel}>Content</span>
          </NavLink>
        )}
      </div>
    </aside>
  )
}
