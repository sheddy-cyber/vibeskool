import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

const FEATURES = [
  {
    label: 'Minimum Effective Knowledge',
    body: 'We cut 80% of traditional curriculum. You learn exactly what you need to direct AI — and nothing more.',
  },
  {
    label: 'The Lab',
    body: 'A guided terminal that explains every command as you type it. Safe, sandboxed, and designed to remove fear.',
  },
  {
    label: 'Prompt templates',
    body: 'Every lesson ends with a prompt you can copy straight into Claude or ChatGPT to build something immediately.',
  },
  {
    label: 'Skill Check',
    body: 'Short, precise quizzes that tell you exactly what you are ready to build — not how many lessons you completed.',
  },
  {
    label: 'Vibe coding checklist',
    body: 'What to look for when AI gives you code. How to spot hallucinated imports, missing error handling, and stale syntax.',
  },
  {
    label: 'MEK Score',
    body: 'A single number that reflects your actual leverage with AI — not completion percentage or badges.',
  },
]

const PATHS = [
  { name: 'Vibe Coding for Web',   desc: 'HTML, CSS, JS — the useful parts', tag: 'Beginner' },
  { name: 'Vibe Coding Mastery',   desc: 'Prompting, reviewing, debugging AI output', tag: 'Essential' },
  { name: 'Git & GitHub',          desc: 'Version control so you never lose work', tag: 'Beginner' },
  { name: 'Python for AI Builders',desc: 'Read and direct AI-generated scripts', tag: 'Beginner' },
  { name: 'APIs, Explained',       desc: 'What they are and how to use them', tag: 'Beginner' },
  { name: 'SQL Without the Pain',  desc: 'Query databases well enough to tell AI what you need', tag: 'Beginner' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>VS</div>
            <span className={styles.brandName}>VibeSkool</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#paths" className={styles.navLink}>Paths</a>
          </div>
          <button className={styles.navCta} onClick={() => navigate('/app/dashboard')}>
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>AI-native learning platform</div>
          <h1 className={styles.heroHeadline}>
            Learn enough to build<br />
            <span className={styles.heroAccent}>anything with AI.</span>
          </h1>
          <p className={styles.heroBody}>
            It is true what they say — you cannot vibe code without knowing how to code.
            But that does not mean you have to become a full-stack developer.
            VibeSkool gives you the Minimum Effective Knowledge to direct AI,
            understand its output, and ship real things.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.ctaPrimary} onClick={() => navigate('/app/dashboard')}>
              Start learning
            </button>
            <button className={styles.ctaSecondary} onClick={() => navigate('/app/lab')}>
              Open the Lab
            </button>
          </div>
          <div className={styles.heroMeta}>
            <span>6 skill paths</span>
            <span className={styles.dot}>·</span>
            <span>47 focused lessons</span>
            <span className={styles.dot}>·</span>
            <span>No fluff</span>
          </div>
        </div>

        {/* Terminal preview */}
        <div className={styles.termPreview}>
          <div className={styles.termWindow}>
            <div className={styles.termBar}>
              <div className={styles.termDots}>
                <span style={{ background: '#ff5f57' }} />
                <span style={{ background: '#febc2e' }} />
                <span style={{ background: '#28c840' }} />
              </div>
              <span className={styles.termBarLabel}>lab — guided mode</span>
            </div>
            <div className={styles.termBody}>
              <div className={styles.termLine}>
                <span className={styles.termSuccess}>✓  sandbox ready</span>
              </div>
              <div className={styles.termMission}>
                Mission: call greetUser() with your name
              </div>
              <div className={styles.termLine}>
                <span className={styles.termPrompt}>›</span>
                <span className={styles.termCmd}>greetUser("Shedrach")</span>
              </div>
              <div className={styles.termExplain}>
                <span className={styles.termExplainLabel}>what that means</span>
                <div className={styles.termExplainRow}>
                  <code>greetUser</code>
                  <span>→</span>
                  <span>the function being called</span>
                  <span className={styles.termExplainSep}>·</span>
                  <code>"Shedrach"</code>
                  <span>→</span>
                  <span>the argument passed in</span>
                </div>
              </div>
              <div className={styles.termLine}>
                <span className={styles.termSuccess}>→  "Hello, Shedrach!"</span>
              </div>
              <div className={styles.termHint}>
                You just called a function with an argument. That is the most common pattern in any AI-generated codebase.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Everything you need.<br />Nothing you don't.</h2>
            <p className={styles.sectionSub}>
              Built around a single principle: get you from zero to building something real, as fast as possible.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <div className={styles.featureNum}>{String(i + 1).padStart(2, '0')}</div>
                <h3 className={styles.featureLabel}>{f.label}</h3>
                <p className={styles.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paths */}
      <section className={styles.pathsSection} id="paths">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Six paths.<br />Every one ruthlessly edited.</h2>
            <p className={styles.sectionSub}>
              No padding, no filler, no history lessons. Each path is the shortest route to competence.
            </p>
          </div>
          <div className={styles.pathsTable}>
            {PATHS.map((p, i) => (
              <div
                key={i}
                className={styles.pathRow}
                onClick={() => navigate('/app/paths')}
              >
                <div className={styles.pathNum}>{String(i + 1).padStart(2, '0')}</div>
                <div className={styles.pathInfo}>
                  <span className={styles.pathName}>{p.name}</span>
                  <span className={styles.pathDesc}>{p.desc}</span>
                </div>
                <span className={styles.pathTag}>{p.tag}</span>
                <span className={styles.pathArrow}>→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.finalCta}>
        <div className={styles.sectionInner} style={{ textAlign: 'center' }}>
          <h2 className={styles.finalTitle}>Ready to build with AI?</h2>
          <p className={styles.finalSub}>No account required. Start your first lesson in under a minute.</p>
          <button className={styles.ctaPrimary} onClick={() => navigate('/app/dashboard')}>
            Start for free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.brand}>
            <div className={styles.brandMark} style={{ width: 18, height: 18, fontSize: 9 }}>VS</div>
            <span className={styles.brandName} style={{ fontSize: 13 }}>VibeSkool</span>
          </div>
          <span className={styles.footerRight}>Built for the AI-native generation.</span>
        </div>
      </footer>

    </div>
  )
}
