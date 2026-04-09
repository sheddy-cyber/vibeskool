import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

const PATHS = [
  { num: '01', name: 'Vibe Coding for Web',    desc: 'HTML, CSS, JS — the useful 20%',       tag: 'Start here' },
  { num: '02', name: 'Vibe Coding Mastery',    desc: 'Before, during, and after every build', tag: 'Essential'  },
  { num: '03', name: 'Git & GitHub',           desc: 'Version control in four commands',       tag: 'Beginner'   },
  { num: '04', name: 'Python for AI Builders', desc: 'Read and direct AI-generated scripts',  tag: 'Beginner'   },
  { num: '05', name: 'APIs, Explained',        desc: 'What they are and how AI uses them',    tag: 'Beginner'   },
  { num: '06', name: 'SQL Without the Pain',   desc: 'Query databases like a senior dev',     tag: 'Beginner'   },
]

const PROOFS = [
  { metric: '6',   label: 'Skill paths'         },
  { metric: '47',  label: 'Focused lessons'      },
  { metric: '0',   label: 'Fluff lessons'        },
  { metric: '80%', label: 'Curriculum cut'       },
]

// Animated counter
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const num = parseInt(target) || 0
    if (num === 0) { setVal(0); return }
    let start = 0
    const step = Math.ceil(num / 40)
    const id = setInterval(() => {
      start += step
      if (start >= num) { setVal(num); clearInterval(id) }
      else setVal(start)
    }, 28)
    return () => clearInterval(id)
  }, [target])
  return <>{val}{suffix}</>
}

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef  = useRef(null)

  // Parallax grain on mouse move
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const fn = e => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 18
      const y = (e.clientY / window.innerHeight - 0.5) * 18
      el.style.setProperty('--rx', `${x}px`)
      el.style.setProperty('--ry', `${y}px`)
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  return (
    <div className={styles.page}>

      {/* ──────────── NAV ──────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand} onClick={() => {}}>
            <div className={styles.brandMark}>VS</div>
            <span className={styles.brandName}>VibeSkool</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#paths" className={styles.navLink}>Paths</a>
            <a href="#proof" className={styles.navLink}>About</a>
          </div>
          <button className={styles.navCta} onClick={() => navigate('/app/dashboard')}>
            Start for free →
          </button>
        </div>
      </nav>

      {/* ──────────── HERO ──────────── */}
      <section className={styles.hero} ref={heroRef}>
        {/* Decorative grain overlay */}
        <div className={styles.heroGrain} />

        {/* Large decorative number */}
        <div className={styles.heroDecor} aria-hidden>MEK</div>

        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            <span className={styles.eyebrowPip} />
            AI-native learning platform
          </div>

          <h1 className={styles.heroTitle}>
            Know enough
            <span className={styles.heroBreak} />
            to build
            <span className={styles.heroBreak} />
            <em className={styles.heroAccent}>anything.</em>
          </h1>

          <p className={styles.heroBody}>
            You cannot vibe code without knowing how to code.
            But you do not need to become a full-stack developer either.
            VibeSkool gives you the{' '}
            <strong>Minimum Effective Knowledge</strong>{' '}
            to direct AI, understand its output, and ship real things — fast.
          </p>

          <div className={styles.heroCtas}>
            <button className={styles.ctaPrimary} onClick={() => navigate('/app/dashboard')}>
              Start learning — it is free
            </button>
            <button className={styles.ctaGhost} onClick={() => navigate('/app/lab')}>
              Try the Lab first
            </button>
          </div>
        </div>

        {/* Hero terminal preview */}
        <div className={styles.heroTerminal}>
          <div className={styles.termBar}>
            <div className={styles.termDots}>
              <span className={styles.dot} style={{background:'#ff5f57'}}/>
              <span className={styles.dot} style={{background:'#febc2e'}}/>
              <span className={styles.dot} style={{background:'#28c840'}}/>
            </div>
            <span className={styles.termTitle}>lab — guided mode</span>
          </div>
          <div className={styles.termBody}>
            <div className={styles.termMission}>
              Mission: call greetUser() with your name
            </div>
            <div className={styles.termLine}>
              <span className={styles.termPrompt}>›</span>
              <span className={styles.termCmd}>greetUser(<span className={styles.termStr}>"Shedrach"</span>)</span>
            </div>
            <div className={styles.termExplain}>
              <span className={styles.termExplainLabel}>what that means</span>
              <div className={styles.termExplainRow}>
                <code>greetUser</code><span>→ the function</span>
                <span className={styles.termSep}>·</span>
                <code>"Shedrach"</code><span>→ the argument</span>
              </div>
            </div>
            <div className={styles.termResult}>→ "Hello, Shedrach!"</div>
            <div className={styles.termHint}>
              You just called a function with an argument.
              That is the most common pattern in any AI-generated codebase.
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── PROOF STRIP ──────────── */}
      <div className={styles.proofStrip} id="proof">
        {PROOFS.map((p, i) => (
          <div key={i} className={styles.proofItem}>
            <span className={styles.proofNum}>
              {/\d/.test(p.metric)
                ? <Counter target={p.metric.replace(/\D/g,'')} suffix={p.metric.replace(/\d/g,'')} />
                : p.metric
              }
            </span>
            <span className={styles.proofLabel}>{p.label}</span>
          </div>
        ))}
      </div>

      {/* ──────────── WHAT IS MEK ──────────── */}
      <section className={styles.mekSection}>
        <div className={styles.mekInner}>
          <div className={styles.mekLeft}>
            <h2 className={styles.sectionTitle}>
              What is<br />Minimum Effective<br />Knowledge?
            </h2>
          </div>
          <div className={styles.mekRight}>
            <p className={styles.mekBody}>
              MEK is the smallest amount of knowledge that produces the largest
              amount of leverage. In medicine, the minimum effective dose is
              the smallest dose that achieves the desired result. We apply
              that to tech education.
            </p>
            <p className={styles.mekBody}>
              Most courses teach you everything. We teach you the 20% that
              unlocks 80% of your ability to build with AI. No history lessons.
              No theory for its own sake. Every concept earns its place by
              making you more capable with AI — immediately.
            </p>
            <div className={styles.mekAccent}>
              <span className={styles.mekAccentLine} />
              <span className={styles.mekAccentText}>
                "Know enough to be dangerous. Not enough to be overwhelmed."
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── PATHS TABLE ──────────── */}
      <section className={styles.pathsSection} id="paths">
        <div className={styles.pathsInner}>
          <div className={styles.pathsHead}>
            <h2 className={styles.sectionTitle}>Six paths.<br />Every one ruthlessly edited.</h2>
            <button className={styles.ctaPrimary} onClick={() => navigate('/app/paths')}>
              View all paths →
            </button>
          </div>
          <div className={styles.pathsTable}>
            {PATHS.map((p, i) => (
              <div key={i} className={styles.pathRow} onClick={() => navigate('/app/dashboard')}>
                <span className={styles.pathRowNum}>{p.num}</span>
                <div className={styles.pathRowInfo}>
                  <span className={styles.pathRowName}>{p.name}</span>
                  <span className={styles.pathRowDesc}>{p.desc}</span>
                </div>
                <span className={styles.pathRowTag}>{p.tag}</span>
                <span className={styles.pathRowArrow}>→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── FEATURES BENTO ──────────── */}
      <section className={styles.bento}>
        <div className={styles.bentoInner}>
          <div className={styles.bentoCard + ' ' + styles.bentoLarge}>
            <div className={styles.bentoTag}>Signature feature</div>
            <h3 className={styles.bentoTitle}>The Conversation Room</h3>
            <p className={styles.bentoBody}>
              Every lesson has a built-in AI tutor. Ask questions before moving on.
              Clarify what confused you. Challenge what does not make sense.
              No rushing. No confusion left behind. Like a real classroom — except
              the teacher never gets tired.
            </p>
            <div className={styles.chatPreview}>
              <div className={styles.chatBubbleAI}>
                A function is a reusable block of code. Think coffee machine —
                press a button, get a result.
              </div>
              <div className={styles.chatBubbleUser}>
                But what if the function does not return anything?
              </div>
              <div className={styles.chatBubbleAI}>
                Great question. If a function has no return statement, it
                returns undefined. AI-generated code sometimes forgets this.
                That is exactly when errors appear.
              </div>
            </div>
          </div>

          <div className={styles.bentoCard}>
            <div className={styles.bentoTag}>Built in</div>
            <h3 className={styles.bentoTitle}>The Lab</h3>
            <p className={styles.bentoBody}>
              A terminal that explains itself. Safe, sandboxed, guided.
              No cryptic errors. No black void.
            </p>
          </div>

          <div className={styles.bentoCard}>
            <div className={styles.bentoTag}>End of every lesson</div>
            <h3 className={styles.bentoTitle}>AI Prompt Templates</h3>
            <p className={styles.bentoBody}>
              Ready-made prompts you copy straight into Claude or ChatGPT
              to build something with what you just learned.
            </p>
          </div>

          <div className={styles.bentoCard + ' ' + styles.bentoAccented}>
            <div className={styles.bentoTag}>Your progress</div>
            <h3 className={styles.bentoTitle}>MEK Score</h3>
            <p className={styles.bentoBody}>
              Not completion rate. Not badges. One number that reflects
              your actual leverage with AI.
            </p>
            <div className={styles.mekScoreViz}>
              <div className={styles.mekScoreTrack}>
                <div className={styles.mekScoreFill} style={{width:'68%'}} />
              </div>
              <span className={styles.mekScoreNum}>68%</span>
              <span className={styles.mekScoreLabel}>enough to build a landing page with AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── CTA BAND ──────────── */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandInner}>
          <h2 className={styles.ctaBandTitle}>Ready to build with AI?</h2>
          <p className={styles.ctaBandSub}>
            No account required. Start your first lesson in under a minute.
          </p>
          <button className={styles.ctaPrimary} onClick={() => navigate('/app/dashboard')}
            style={{fontSize:'16px', padding:'14px 36px'}}>
            Start for free
          </button>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.brandMark} style={{width:20,height:20,fontSize:10}}>VS</div>
            <span className={styles.brandName} style={{fontSize:13}}>VibeSkool</span>
          </div>
          <span className={styles.footerTag}>Built for the AI-native generation.</span>
        </div>
      </footer>
    </div>
  )
}
