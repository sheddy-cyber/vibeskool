import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Minimum Effective Knowledge',
    body: 'We cut 80% of traditional curriculum. You learn only what unlocks your ability to build with AI — nothing more.',
  },
  {
    icon: '🧪',
    title: 'The Lab — Friendly Terminal',
    body: 'A terminal that explains itself as you type. No black void. No cryptic errors. Just guided, safe experimentation.',
  },
  {
    icon: '🤖',
    title: 'AI Prompt Templates',
    body: 'Every lesson ends with a ready-made prompt. Close the lesson, open Claude or ChatGPT, and build something immediately.',
  },
  {
    icon: '🎯',
    title: 'Skill Check in 10 Minutes',
    body: "Short, sharp quizzes that prove you're ready. Not certificates — competence badges. 'You can now build X with AI.'",
  },
  {
    icon: '🗺️',
    title: 'Goal-First Learning',
    body: 'Tell us what you want to build. We tell you exactly which skills you need and in what order. No guessing.',
  },
  {
    icon: '📈',
    title: 'MEK Score',
    body: "Track your leverage, not just your completion. Your score reflects what you can actually build — not how many videos you watched.",
  },
]

const PATHS = [
  { icon: '🌐', name: 'Vibe Coding for Web',     tag: 'Beginner',      color: '#8b7cf8' },
  { icon: '🤖', name: 'Vibe Coding Mastery',      tag: '🔥 Essential',  color: '#4fd1a5' },
  { icon: '🗂️', name: 'Git & GitHub Basics',      tag: 'Beginner',      color: '#f0a05a' },
  { icon: '🐍', name: 'Python for AI Builders',   tag: 'Beginner',      color: '#a78bfa' },
  { icon: '🔌', name: 'APIs, Explained Simply',   tag: 'Beginner',      color: '#f0a05a' },
  { icon: '🗄️', name: 'SQL Without the Pain',     tag: 'Beginner',      color: '#f06a6a' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef  = useRef(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const onMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect()
      const x = ((e.clientX - left) / width  - 0.5) * 20
      const y = ((e.clientY - top)  / height - 0.5) * 20
      el.style.setProperty('--gx', `${50 + x}%`)
      el.style.setProperty('--gy', `${50 + y}%`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <span className={styles.logo}>Vibe<span>Skool</span></span>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#paths">Paths</a>
        </div>
        <button className={styles.ctaNav} onClick={() => navigate('/app/dashboard')}>
          Start Learning →
        </button>
      </nav>

      {/* Hero */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          AI-Native Learning Platform
        </div>
        <h1 className={styles.heroTitle}>
          Learn enough.<br />
          <span className={styles.heroAccent}>Build anything.</span>
        </h1>
        <p className={styles.heroSub}>
          It is true what they say — you can't vibe code without knowing how to code.
          But that doesn't mean you have to become a full-stack developer.
          VibeSkool gives you the Minimum Effective Knowledge to direct AI,
          debug its output, and ship real things — fast.
        </p>
        <div className={styles.heroCtas}>
          <button className={styles.ctaPrimary} onClick={() => navigate('/app/dashboard')}>
            Start for free
          </button>
          <button className={styles.ctaSecondary} onClick={() => navigate('/app/lab')}>
            Try the Lab →
          </button>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>6</span>
            <span className={styles.heroStatLabel}>Skill Paths</span>
          </div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>47</span>
            <span className={styles.heroStatLabel}>Focused Lessons</span>
          </div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>0</span>
            <span className={styles.heroStatLabel}>Fluff lessons</span>
          </div>
        </div>
      </section>

      {/* Terminal preview */}
      <section className={styles.termPreview}>
        <div className={styles.termWindow}>
          <div className={styles.termBar}>
            <div className={styles.termDots}>
              <span style={{background:'#ff5f57'}} />
              <span style={{background:'#febc2e'}} />
              <span style={{background:'#28c840'}} />
            </div>
            <span className={styles.termBarTitle}>lab — guided mode</span>
          </div>
          <div className={styles.termBody}>
            <div className={styles.termLine}>
              <span className={styles.termSuccess}>✓ Lab ready. Let's learn functions.</span>
            </div>
            <div className={styles.termLine}>
              <span className={styles.termMission}>Mission: Call greetUser() with your name</span>
            </div>
            <div className={styles.termLine}>
              <span className={styles.termPrompt}>›</span>
              <span className={styles.termCmd}>greetUser("Shedrach")</span>
            </div>
            <div className={styles.termExplain}>
              <span className={styles.termExplainLabel}>what that means:</span>
              <span><code>greetUser</code> → the function being called &nbsp;|&nbsp; <code>"Shedrach"</code> → the argument passed in</span>
            </div>
            <div className={styles.termLine}>
              <span className={styles.termSuccess}>→ "Hello, Shedrach!"</span>
            </div>
            <div className={styles.termHint}>
              💡 You just called a function with an argument. That's the most common pattern in any AI-generated codebase.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Everything you need.<br />Nothing you don't.</h2>
          <p className={styles.sectionSub}>Built around one principle: get you from zero to building something real, as fast as possible.</p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 60}ms` }}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Paths */}
      <section className={styles.pathsSection} id="paths">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Four paths. Zero fluff.</h2>
          <p className={styles.sectionSub}>Each path is ruthlessly edited down to only what makes you dangerous with AI.</p>
        </div>
        <div className={styles.pathsGrid}>
          {PATHS.map((p, i) => (
            <div
              key={i}
              className={styles.pathCard}
              style={{ '--path-color': p.color }}
              onClick={() => navigate('/app/paths')}
            >
              <span className={styles.pathIcon}>{p.icon}</span>
              <span className={styles.pathName}>{p.name}</span>
              <span className={styles.pathTag}>{p.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalTitle}>Ready to actually build things?</h2>
        <p className={styles.finalSub}>No sign-up required. Start your first lesson in 30 seconds.</p>
        <button className={styles.ctaPrimary} onClick={() => navigate('/app/dashboard')}>
          Start for free →
        </button>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.logo}>Vibe<span>Skool</span></span>
        <span className={styles.footerRight}>Built for the AI-native generation.</span>
      </footer>
    </div>
  )
}
