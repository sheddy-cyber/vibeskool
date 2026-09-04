import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import BrandLogo from '@/components/ui/BrandLogo'
import LandingTerminal from '@/components/landing/LandingTerminal'
import styles from './LandingPage.module.css'

// ── Clean SVG Icons (replacing emojis and ticks) ──
function BulletIcon() {
  return (
    <svg className={styles.bulletIcon} width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="3" r="2.5" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg className={styles.sparkIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
    </svg>
  )
}

function PulseIcon() {
  return (
    <svg className={styles.pulseIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg className={styles.shieldIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function AlertTriangleIcon() {
  return (
    <svg className={styles.alertIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

// ── Six Prestigious Career Paths ──
// ── Six Practical Tracks (Minimum Effective Knowledge) ──
const CAREER_PATHS = [
  {
    id: 'full-stack-web',
    number: '01',
    title: 'Full Stack Web Development',
    tag: 'Track 01 • Web Apps',
    bannerClass: styles.bannerBlue,
    description: 'Build real websites and web apps that connect to databases. The essential starting point for anyone building with AI.',
    practitioners: [
      { name: 'Tim Berners-Lee', role: 'Invented the World Wide Web, HTML & HTTP' },
      { name: 'Brendan Eich', role: 'Created JavaScript, the language of every webpage' }
    ],
    skills: [
      'How browsers and servers talk back and forth',
      'Building interactive screens with React components',
      'Storing user accounts in databases and connecting APIs'
    ],
    capstone: 'Build and launch a real web app with user accounts, a database, and working security.'
  },
  {
    id: 'mobile-app',
    number: '02',
    title: 'Mobile App Development',
    tag: 'Track 02 • Mobile',
    bannerClass: styles.bannerTeal,
    description: 'Build apps that live on iPhones and Androids. Learn how phones handle touch, notifications, and offline data.',
    practitioners: [
      { name: 'Andy Rubin', role: 'Co-founder of Android, making smartphones accessible' },
      { name: 'Chris Lattner', role: 'Created Swift, the modern language for Apple apps' }
    ],
    skills: [
      'Mobile screens, gestures, and responsive layouts',
      'Keeping apps fast when there is no internet signal',
      'Connecting to phone features like cameras and notifications'
    ],
    capstone: 'Ship a mobile app that works smoothly even when the user has zero internet.'
  },
  {
    id: 'blockchain-web3',
    number: '03',
    title: 'Blockchain & Web3 Development',
    tag: 'Track 03 • Web3',
    bannerClass: styles.bannerAmber,
    description: 'Demystify smart contracts and decentralized apps without the confusing crypto buzzwords.',
    practitioners: [
      { name: 'Satoshi Nakamoto', role: 'Created Bitcoin and decentralized electronic cash' },
      { name: 'Vitalik Buterin', role: 'Co-founder of Ethereum, pioneering smart contracts' }
    ],
    skills: [
      'How decentralized networks remember data without a middleman',
      'Writing automated smart contracts with Solidity',
      'Connecting crypto wallets safely to regular websites'
    ],
    capstone: 'Deploy a verified smart contract and hook it up to a live web interface.'
  },
  {
    id: 'game-dev',
    number: '04',
    title: 'Game Development',
    tag: 'Track 04 • Games',
    bannerClass: styles.bannerCoral,
    description: 'Turn creative game ideas into playable reality. Understand physics, game loops, and character controls.',
    practitioners: [
      { name: 'John Carmack', role: 'Programmed Doom & Quake, 3D graphics pioneer' },
      { name: 'Tim Sweeney', role: 'Created Unreal Engine, founder of Epic Games' }
    ],
    skills: [
      'The game loop: how games update 60 times per second',
      'Handling player controls, collisions, and gravity',
      'Creating animations, particle effects, and game scoring'
    ],
    capstone: 'Build a playable game with physics, character movement, and level progression.'
  },
  {
    id: 'os-low-level',
    number: '05',
    title: 'OS & Low-Level Programming',
    tag: 'Track 05 • How Computers Work',
    bannerClass: styles.bannerPurple,
    description: 'Peek under the hood of your computer. Understand memory, files, and operating systems from the metal up.',
    practitioners: [
      { name: 'Linus Torvalds', role: 'Created the Linux Operating System and Git' },
      { name: 'Dennis Ritchie', role: 'Created the C language and Unix operating system' }
    ],
    skills: [
      'How computer memory (RAM) actually stores data',
      'How multiple programs run at the same time without crashing',
      'Talking directly to the operating system using command lines'
    ],
    capstone: 'Build a simple web server from scratch to watch data travel through your machine.'
  },
  {
    id: 'ai-ml',
    number: '06',
    title: 'AI & Machine Learning Engineering',
    tag: 'Track 06 • AI Systems',
    bannerClass: styles.bannerGreen,
    description: 'Look inside the black box of AI. Learn how models learn, how to hook them to your data, and how to build smart tools.',
    practitioners: [
      { name: 'Andrej Karpathy', role: 'Founding member at OpenAI, former Tesla AI director' },
      { name: 'Yann LeCun', role: 'Deep learning pioneer, Chief AI Scientist at Meta' }
    ],
    skills: [
      'How neural networks actually learn from examples',
      'Connecting AI models to your own documents (RAG pipelines)',
      'Making AI return reliable, structured data instead of random text'
    ],
    capstone: 'Build a working custom AI assistant that answers questions from your own private documents.'
  }
]

const QUESTIONS = [
  {
    question: 'What is "Minimum Effective Knowledge" (MEK)?',
    answer: 'Think of it like learning how a car’s steering wheel, brakes, and engine work before driving on a busy highway. You don’t need to rebuild the engine from scratch—modern AI does the heavy typing for you. But if you don’t know what brakes are or what that blinking engine light means, you’ll crash. MEK is the 20% of core concepts that gives you 80% of the superpower when coding with AI.',
  },
  {
    question: 'Do I need to know how to code before starting?',
    answer: 'Not at all. VibeSkool was built specifically for complete beginners, creators, and tinkerers. If you know how to browse the web and type into a chat box, you have all the prerequisites you need. Everything is explained with plain human analogies, visual diagrams, and instant interactive sandboxes.',
  },
  {
    question: 'Is this a traditional coding bootcamp?',
    answer: 'Definitely not. Bootcamps make you spend 6 months memorizing syntax and solving puzzle algorithms for corporate interviews. In the age of AI, memorizing syntax is obsolete. VibeSkool focuses entirely on system architecture—how the frontend, backend, database, and APIs connect so you can direct AI tools with confidence.',
  },
  {
    question: 'Which AI tools will this help me use?',
    answer: 'All of them. Whether you use Cursor, Claude Code, GitHub Copilot, ChatGPT, v0, Replit, or Lovable, having the fundamentals makes every AI tool 10x more useful. When an AI throws an error, you won’t panic—you’ll know what failed and exactly what prompt to type next to fix it.',
  },
  {
    question: 'Is it really completely free?',
    answer: 'Yes, 100% free. The full curriculum, interactive sandbox terminal, code comparator, and career tracks are open access. No credit cards, no trial countdowns, no hidden paywalls.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [openQuestion, setOpenQuestion] = useState(null)
  
  // Interactive System Map states in Hero
  const [selectedNode, setSelectedNode] = useState('server')
  const [isTracing, setIsTracing] = useState(false)
  const [traceStep, setTraceStep] = useState(0)
  const [simulateFailure, setSimulateFailure] = useState(false)

  // Interactive Code Review Desk states
  const [reviewMode, setReviewMode] = useState('vulnerable') // 'vulnerable' | 'audited'
  const [exploitTested, setExploitTested] = useState(false)

  const accountDestination = currentUser ? '/app/dashboard' : '/signup'

  // Buttery-smooth, sleek cubic-bezier easing scroll (Lenis integrated)
  const smoothScrollTo = (e, targetId) => {
    if (e) e.preventDefault()
    const target = document.getElementById(targetId)
    if (!target) return

    if (window.__lenis) {
      window.__lenis.scrollTo(target, {
        offset: -76,
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      })
      window.history.pushState(null, '', `#${targetId}`)
      return
    }

    const headerOffset = 76
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    const duration = 650
    let startTime = null

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = easeInOutCubic(progress)
      window.scrollTo(0, startPosition + distance * ease)
      if (elapsed < duration) {
        window.requestAnimationFrame(step)
      } else {
        window.history.pushState(null, '', `#${targetId}`)
      }
    }
    window.requestAnimationFrame(step)
  }

  const handleRunTrace = () => {
    if (isTracing) return
    setIsTracing(true)
    setTraceStep(1)

    setTimeout(() => setTraceStep(2), 600)
    setTimeout(() => {
      if (simulateFailure) {
        setTraceStep(99)
        setIsTracing(false)
      } else {
        setTraceStep(3)
        setTimeout(() => setTraceStep(4), 600)
        setTimeout(() => {
          setTraceStep(5)
          setIsTracing(false)
        }, 1200)
      }
    }, 1200)
  }

  return (
    <div className={styles.page}>
      {/* ── Header (No "classroom" badge) ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <Link to="/" className={styles.brandLink}>
              <BrandLogo size={28} showText={true} />
            </Link>
          </div>

          <nav className={styles.navLinks}>
            <a href="#approach" className={styles.navLink} onClick={(e) => smoothScrollTo(e, 'approach')}>How it Works</a>
            <a href="#review-desk" className={styles.navLink} onClick={(e) => smoothScrollTo(e, 'review-desk')}>Example Audit</a>
            <a href="#career-paths" className={styles.navLink} onClick={(e) => smoothScrollTo(e, 'career-paths')}>Tracks</a>
            <a href="#lab" className={styles.navLink} onClick={(e) => smoothScrollTo(e, 'lab')}>The Lab</a>
            <a href="#questions" className={styles.navLink} onClick={(e) => smoothScrollTo(e, 'questions')}>FAQ</a>
          </nav>

          <div className={styles.headerActions}>
            {!currentUser && (
              <Link to="/signin" className={styles.signInBtn}>
                Sign in
              </Link>
            )}
            <Link to={accountDestination} className={styles.joinBtn}>
              {currentUser ? 'Continue learning' : 'Start learning'}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero Section ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              The missing manual for coding with AI
            </div>
            <h1 className={styles.heroTitle}>
              Code with AI.<br /><em>Actually understand it.</em>
            </h1>
            <p className={styles.heroSubtitle}>
              AI writes code in seconds, but if you don’t know the basics, you’re flying blind the moment something breaks. VibeSkool teaches you the <strong>Minimum Effective Knowledge (MEK)</strong>—just enough practical software fundamentals so you can prompt smart, fix bugs, and ship real apps.
            </p>
            <div className={styles.heroActions}>
              <a href="#career-paths" className={styles.primaryActionBtn} onClick={(e) => smoothScrollTo(e, 'career-paths')}>
                Start with the basics
              </a>
              <a href="#approach" className={styles.secondaryActionBtn} onClick={(e) => smoothScrollTo(e, 'approach')}>
                How it works
              </a>
            </div>
            <div className={styles.heroNote}>
              <SparkIcon />
              <span>Free forever. Instant interactive sandboxes. No CS degree fluff.</span>
            </div>
          </div>

          {/* ── Hero Visual: System Map ── */}
          <div className={styles.heroCard}>
            <div className={styles.heroCardBanner}>
              <div className={styles.bannerInfo}>
                <span className={styles.bannerTag}>The Big Picture / 01</span>
                <h3 className={styles.bannerTitle}>How every web app actually works</h3>
                <span className={styles.bannerSub}>What happens when someone clicks a button?</span>
              </div>
              <button 
                type="button" 
                className={`${styles.traceBtn} ${isTracing ? styles.traceBtnActive : ''}`}
                onClick={handleRunTrace}
                disabled={isTracing}
              >
                <PulseIcon />
                <span>{isTracing ? 'Tracing...' : 'Trace a Click'}</span>
              </button>
            </div>

            {/* Interactive System Nodes */}
            <div className={styles.systemMap}>
              {/* Browser Node */}
              <button
                type="button"
                className={`
                  ${styles.systemNode} 
                  ${selectedNode === 'browser' ? styles.systemNodeSelected : ''}
                  ${traceStep === 1 || traceStep === 5 ? styles.nodeActivePulse : ''}
                `}
                onClick={() => setSelectedNode('browser')}
              >
                <span className={styles.nodeBadge}>01</span>
                <span className={styles.nodeIcon}>◌</span>
                <strong>The Screen</strong>
                <small>What users see &amp; tap</small>
              </button>

              {/* Connector 1 */}
              <div className={`${styles.connector} ${traceStep >= 1 && traceStep < 99 ? styles.connectorFlow : ''}`}>
                <span className={styles.connectorLabel}>
                  {traceStep === 1 ? '14ms' : 'sending request'}
                </span>
                <i />
                {traceStep === 1 && <span className={styles.packetPulse} />}
              </div>

              {/* Server Node */}
              <button
                type="button"
                className={`
                  ${styles.systemNode} 
                  ${selectedNode === 'server' ? styles.systemNodeSelected : ''}
                  ${traceStep === 2 || traceStep === 4 ? styles.nodeActivePulse : ''}
                  ${traceStep === 99 ? styles.nodeErrorPulse : ''}
                `}
                onClick={() => setSelectedNode('server')}
              >
                <span className={styles.nodeBadge}>02</span>
                <span className={styles.nodeIcon}>⌘</span>
                <strong>The Brain</strong>
                <small>Rules &amp; decisions</small>
              </button>

              {/* Connector 2 */}
              <div className={`${styles.connector} ${traceStep >= 2 && traceStep <= 4 ? styles.connectorFlow : ''} ${simulateFailure ? styles.connectorBroken : ''}`}>
                <span className={styles.connectorLabel}>
                  {simulateFailure ? 'timeout' : traceStep === 2 ? '4ms' : 'asking database'}
                </span>
                <i />
                {traceStep === 2 && <span className={styles.packetPulse} />}
              </div>

              {/* Database Node */}
              <button
                type="button"
                className={`
                  ${styles.systemNode} 
                  ${selectedNode === 'database' ? styles.systemNodeSelected : ''}
                  ${traceStep === 3 ? styles.nodeActivePulse : ''}
                `}
                onClick={() => setSelectedNode('database')}
              >
                <span className={styles.nodeBadge}>03</span>
                <span className={styles.nodeIcon}>≋</span>
                <strong>The Memory</strong>
                <small>Where data lives forever</small>
              </button>
            </div>

            {/* Telemetry Drawer */}
            <div className={styles.telemetryDrawer}>
              <div className={styles.telemetryHeader}>
                <span>INSPECTING LAYER: <strong>{selectedNode.toUpperCase()}</strong></span>
                <label className={styles.failureToggle}>
                  <input 
                    type="checkbox" 
                    checked={simulateFailure}
                    onChange={e => setSimulateFailure(e.target.checked)}
                  />
                  <span>Simulate database crash</span>
                </label>
              </div>

              <div className={styles.telemetryContent}>
                {selectedNode === 'browser' && (
                  <p><code>fetch('/api/auth/login', &#123; method: 'POST' &#125;)</code> — When a user clicks "Log In", the screen packages their inputs into a message and sends it across the internet. If the server is down or slow, your screen needs to tell the user politely instead of freezing.</p>
                )}
                {selectedNode === 'server' && (
                  <p><code>authLimiter() &rarr; validateSchema() &rarr; pool.query()</code> — The control room. Where your app sanitizes input, checks if passwords match, blocks spam, and safely asks the database for user information.</p>
                )}
                {selectedNode === 'database' && (
                  <p><code>SELECT id, password_hash FROM users WHERE email = $1</code> — The permanent memory. It looks up user records in milliseconds. Without basic knowledge like "parameter binding", attackers can steal every user's data with one simple trick.</p>
                )}
              </div>
            </div>

            {/* Unconventional Footer Tag */}
            <div className={styles.heroCardFooter}>
              <span className={styles.specTag}>SYSTEM BASICS</span>
              <span>When AI gives you broken code, this map shows you which piece failed.</span>
            </div>
          </div>
        </section>

        {/* ── Manifesto Banner ── */}
        <section className={styles.manifesto}>
          <div className={styles.manifestoInner}>
            <p>Anyone can ask AI to generate 500 lines of code. <strong>Knowing what that code actually does is the real skill.</strong></p>
            <div className={styles.manifestoDivider} />
            <span>VibeSkool gives you the Minimum Effective Knowledge so you’re in the driver’s seat—not the AI.</span>
          </div>
        </section>

        {/* ── Section 01: The Minimum Effective Knowledge ── */}
        <section id="approach" className={styles.section}>
          <div className={styles.sectionLead}>
            <span className={styles.sectionNumber}>01</span>
            <div>
              <p className={styles.kicker}>The Minimum Effective Knowledge</p>
              <h2 className={styles.sectionTitle}>You don’t need a 4-year CS degree.<br />You just need these 3 skills.</h2>
            </div>
          </div>

          <div className={styles.practiceGrid}>
            <article className={styles.practiceCard}>
              <div className={styles.cardHeaderTop}>
                <span className={styles.cardIndexBadge}>01</span>
                <span className={styles.cardTag}>The Big Picture</span>
              </div>
              <h3 className={styles.cardTitle}>Know where things live.</h3>
              <p className={styles.cardText}>
                Every web and mobile app is basically three pieces: a screen, a server, and a database. Once you see how messages travel between them, mysterious error messages suddenly make sense.
              </p>
              <div className={styles.cardFeatureList}>
                <span><BulletIcon /> The Screen: What users see in their browser</span>
                <span><BulletIcon /> The Server: Where your app’s secret rules run</span>
                <span><BulletIcon /> The Database: Where user data is saved safely</span>
              </div>
            </article>

            <article className={`${styles.practiceCard} ${styles.practiceCardHighlight}`}>
              <div className={styles.cardHeaderTop}>
                <span className={styles.cardIndexBadge}>02</span>
                <span className={styles.cardTag}>Prompting Like a Pro</span>
              </div>
              <h3 className={styles.cardTitle}>Ask AI for what you actually want.</h3>
              <p className={styles.cardText}>
                If you prompt AI with vague guesses like “make me an Uber clone”, it produces broken spaghetti code. Learn to speak basic software terms so you can give AI clear, exact specs that work on the first try.
              </p>
              <div className={styles.cardFeatureList}>
                <span><BulletIcon /> Defining what tables your database needs</span>
                <span><BulletIcon /> Planning what happens when users make mistakes</span>
                <span><BulletIcon /> Giving AI strict guardrails instead of vague vibes</span>
              </div>
            </article>

            <article className={styles.practiceCard}>
              <div className={styles.cardHeaderTop}>
                <span className={styles.cardIndexBadge}>03</span>
                <span className={styles.cardTag}>Sanity Checking</span>
              </div>
              <h3 className={styles.cardTitle}>Catch AI when it cuts corners.</h3>
              <p className={styles.cardText}>
                AI will write code with complete confidence—even when that code leaks user passwords or has huge security holes. Learn to scan a few lines of code and spot lazy mistakes before they hurt your users.
              </p>
              <div className={styles.cardFeatureList}>
                <span><BulletIcon /> Spotting open doors hackers love (SQL injection)</span>
                <span><BulletIcon /> Keeping passwords and API keys private</span>
                <span><BulletIcon /> Knowing when to tell AI: “Nope, do this properly”</span>
              </div>
            </article>
          </div>
        </section>

        {/* ── Section: Review Desk ── */}
        <section id="review-desk" className={styles.reviewSection}>
          <div className={styles.reviewIntro}>
            <p className={styles.kicker}>A real-world example</p>
            <h2 className={styles.sectionTitle}>AI wrote the code in 2 seconds.<br />Would you dare put it live?</h2>
            <p className={styles.reviewSub}>
              Here’s what happens when someone asks AI to build a simple login form—and why having the basic knowledge saves your skin.
            </p>
          </div>

          <div className={styles.reviewBoard}>
            <div className={styles.reviewBoardHead}>
              <div className={styles.reviewBoardLeft}>
                <span className={styles.reviewBadge}>Audit Desk</span>
                <span>Feature / User Login Form</span>
              </div>

              {/* Mode Switcher */}
              <div className={styles.reviewSwitcher}>
                <button
                  type="button"
                  className={`${styles.switchBtn} ${reviewMode === 'vulnerable' ? styles.switchBtnVulnerable : ''}`}
                  onClick={() => {
                    setReviewMode('vulnerable')
                    setExploitTested(false)
                  }}
                >
                  <span className={styles.dotDanger} />
                  Lazy AI Prompt (Unsafe)
                </button>
                <button
                  type="button"
                  className={`${styles.switchBtn} ${reviewMode === 'audited' ? styles.switchBtnAudited : ''}`}
                  onClick={() => {
                    setReviewMode('audited')
                    setExploitTested(false)
                  }}
                >
                  <span className={styles.dotSuccess} />
                  Smart AI Prompt (Safe)
                </button>
              </div>
            </div>

            <div className={styles.reviewMain}>
              {/* Left Column */}
              <div className={styles.reviewPrompt}>
                <span className={styles.miniLabel}>What you asked AI</span>
                <p>{reviewMode === 'vulnerable' ? '“Build me a quick login form with email and password.”' : '“Build a login form using parameterized queries and bcrypt password hashing.”'}</p>
                <span className={styles.requestArrow}>↓</span>
                <span className={styles.miniLabel}>What AI generated</span>
                
                <button
                  type="button"
                  className={styles.exploitBtn}
                  onClick={() => setExploitTested(true)}
                >
                  <ShieldCheckIcon />
                  <span>Try Hacker Trick: <code>' OR 1=1 --</code></span>
                </button>
              </div>

              {/* Center Column: Code */}
              <div className={styles.reviewCode}>
                {reviewMode === 'vulnerable' ? (
                  <>
                    <div className={styles.codeRow}><span>01</span> <code>const email = req.body.email;</code></div>
                    <div className={`${styles.codeRow} ${styles.dangerLine}`}>
                      <span>02</span> <code>db.query(`SELECT * FROM users</code>
                    </div>
                    <div className={`${styles.codeRow} ${styles.dangerLine}`}>
                      <span>03</span> <code>WHERE email = '${'{email}'}'`)</code>
                      <span className={styles.tagDanger}>UNSAFE</span>
                    </div>
                    <div className={styles.codeRow}><span>04</span> <code>return res.json(user);</code></div>
                  </>
                ) : (
                  <>
                    <div className={styles.codeRow}><span>01</span> <code>const &#123; email, password &#125; = req.body;</code></div>
                    <div className={`${styles.codeRow} ${styles.secureLine}`}>
                      <span>02</span> <code>const &#123; rows &#125; = await pool.query(</code>
                    </div>
                    <div className={`${styles.codeRow} ${styles.secureLine}`}>
                      <span>03</span> <code>  "SELECT id, hash FROM users WHERE email = $1", [email]</code>
                      <span className={styles.tagSecure}>PARAMETERIZED</span>
                    </div>
                    <div className={`${styles.codeRow} ${styles.secureLine}`}>
                      <span>04</span> <code>);</code>
                    </div>
                    <div className={styles.codeRow}><span>05</span> <code>if (await bcrypt.compare(password, rows[0]?.hash)) ...</code></div>
                  </>
                )}

                {exploitTested && (
                  <div className={reviewMode === 'vulnerable' ? styles.gradeFailBox : styles.gradePassBox}>
                    {reviewMode === 'vulnerable' ? (
                      <div>
                        <div className={styles.exploitTitleRow}>
                          <AlertTriangleIcon />
                          <strong>DISASTER: Database completely unlocked!</strong>
                        </div>
                        <p>Because the code just pasted whatever the user typed into the SQL command, typing <code>' OR 1=1 --</code> tricked the database into matching every user. The attacker just logged in as Admin without needing any password.</p>
                      </div>
                    ) : (
                      <div>
                        <div className={styles.exploitTitleRow}>
                          <ShieldCheckIcon />
                          <strong>SAFE: Attack defused completely!</strong>
                        </div>
                        <p>Because you instructed AI to use "parameterized queries", the database treated <code>' OR 1=1 --</code> as harmless literal text for <code>$1</code>, not executable SQL. 0 rows matched. Attack blocked with 401 Unauthorized.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Question */}
              <aside className={styles.reviewNote}>
                <span className={styles.noteBadge}>What you learned</span>
                <p>“Can a user trick my database by typing weird symbols?”</p>
                <div className={styles.noteAnswer}>
                  <span>The Takeaway</span>
                  {reviewMode === 'vulnerable' 
                    ? 'Never let user inputs get glued directly into database commands. It takes 10 seconds to prompt AI to do it safely—once you know the term exists.'
                    : 'Parameterized queries treat user values as harmless data, never runnable code.'}
                </div>
              </aside>
            </div>

            <div className={styles.reviewFooter}>
              <span>You don’t have to write all the code yourself.</span>
              <strong>You just need to know enough to keep AI honest.</strong>
            </div>
          </div>
        </section>

        {/* ── Section 02: Practical Tracks (Six Cards Featuring Two Prominent Pioneers Each) ── */}
        <section id="career-paths" className={styles.curriculumSection}>
          <div className={styles.sectionLead}>
            <span className={styles.sectionNumber}>02</span>
            <div>
              <p className={styles.kicker}>Choose what you want to build</p>
              <h2 className={styles.sectionTitle}>Six practical tracks.<br />Zero unnecessary fluff.</h2>
              <p className={styles.curriculumDeck}>
                Pick the field you’re excited about. Each track teaches you the core mental models and foundational knowledge, featuring lessons from the legends who built the technologies we use every single day.
              </p>
            </div>
          </div>

          <div className={styles.careerGrid}>
            {CAREER_PATHS.map((path) => (
              <div key={path.id} className={styles.careerCard}>
                {/* Google Classroom Colorful Banner */}
                <div className={`${styles.careerBanner} ${path.bannerClass}`}>
                  <span className={styles.careerTag}>{path.tag}</span>
                  <h3 className={styles.careerTitle}>{path.title}</h3>
                  <div className={styles.careerAvatar}>
                    <span>{path.number}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className={styles.careerCardBody}>
                  <p className={styles.careerDesc}>{path.description}</p>
                  
                  {/* Two Prominent Pioneers */}
                  <div className={styles.practitionersSection}>
                    <span className={styles.practitionersLabel}>Notable Pioneers</span>
                    <div className={styles.practitionerList}>
                      {path.practitioners.map((person, idx) => (
                        <div key={idx} className={styles.practitionerRow}>
                          <span className={styles.practitionerDot} />
                          <div>
                            <strong>{person.name}</strong>
                            <small>{person.role}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Concepts with Real Bullet Icons */}
                  <div className={styles.skillsSection}>
                    <span className={styles.skillsLabel}>What You’ll Understand</span>
                    <div className={styles.skillsList}>
                      {path.skills.map((skill, idx) => (
                        <span key={idx} className={styles.skillItem}>
                          <BulletIcon />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Capstone Build */}
                  <div className={styles.capstoneBox}>
                    <strong>WHAT YOU’LL SHIP:</strong> {path.capstone}
                  </div>

                  <div className={styles.careerCardFooter}>
                    <span className={styles.pathMeta}>Self-Paced • 100% Free</span>
                    <button 
                      type="button" 
                      className={styles.explorePathBtn}
                      onClick={() => navigate(currentUser ? '/app/paths' : '/signup')}
                    >
                      Explore path
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section: The Lab ── */}
        <section id="lab" className={styles.labSection}>
          <div className={styles.labCopy}>
            <p className={styles.kicker}>Hands-on sandbox</p>
            <h2 className={styles.sectionTitle}>Don’t just watch videos.<br /><em>Try it right here.</em></h2>
            <p className={styles.labDesc}>
              Nothing beats typing a command and seeing how a system actually responds. Our interactive playground lets you run code, query databases, and test security limits right in your browser—no downloads, terminal setup, or installations required.
            </p>
            <div className={styles.labLegend}>
              <span><BulletIcon /> Runs instantly in your browser</span>
              <span><BulletIcon /> Plain-English explanations for every command</span>
              <span><BulletIcon /> Designed for complete beginners to experiment safely</span>
            </div>
          </div>

          <div className={styles.labTerminalWrap}>
            <div className={styles.terminalCaption}>
              <span>Live interactive terminal sandbox</span>
              <span>Click a shortcut below or type your own command</span>
            </div>
            <LandingTerminal />
          </div>
        </section>

        {/* ── Section: Useful Questions (FAQ) ── */}
        <section id="questions" className={styles.questionsSection}>
          <div className={styles.questionsIntro}>
            <p className={styles.kicker}>Frequently asked questions</p>
            <h2 className={styles.sectionTitle}>Plain-English answers.<br />No technical gatekeeping.</h2>
          </div>

          <div className={styles.faqList}>
            {QUESTIONS.map((item, index) => {
              const open = openQuestion === index
              return (
                <div key={index} className={styles.faqItem}>
                  <button 
                    type="button" 
                    className={styles.faqQuestionBtn}
                    onClick={() => setOpenQuestion(open ? null : index)}
                    aria-expanded={open}
                  >
                    <span className={styles.faqNumber}>{String(index + 1).padStart(2, '0')}</span>
                    <strong className={styles.faqTitle}>{item.question}</strong>
                    <span className={styles.faqIcon}>{open ? '−' : '+'}</span>
                  </button>
                  {open && (
                    <div className={styles.faqAnswer}>
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Final Call to Action ── */}
        <section className={styles.finalCta}>
          <div className={styles.finalCtaInner}>
            <div className={styles.finalEyebrow}>
              <span>Takes 2 minutes to get started</span>
            </div>
            <h2 className={styles.finalTitle}>Stop guessing.<br /><em>Start building with confidence.</em></h2>
            <p className={styles.finalSubtitle}>
              Learn the foundation today so tomorrow when you prompt an AI, you actually know what it’s building. Free, self-paced, and beginner-friendly.
            </p>
            <Link to={accountDestination} className={styles.finalActionBtn}>
              {currentUser ? 'Jump back into your lessons' : 'Start learning for free'}
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <BrandLogo size={26} showText={true} />
            <p className={styles.footerTagline}>
              The Minimum Effective Knowledge for coding with AI.
            </p>
          </div>

          <div className={styles.footerNav}>
            <a href="#approach" onClick={(e) => smoothScrollTo(e, 'approach')}>How it Works</a>
            <a href="#review-desk" onClick={(e) => smoothScrollTo(e, 'review-desk')}>Example Audit</a>
            <a href="#career-paths" onClick={(e) => smoothScrollTo(e, 'career-paths')}>Tracks</a>
            <a href="#lab" onClick={(e) => smoothScrollTo(e, 'lab')}>The Lab</a>
            <Link to="/signin">Sign in</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} VibeSkool</span>
          <span className={styles.craftStamp}>Designed for curious human builders • Free forever</span>
        </div>
      </footer>
    </div>
  )
}
