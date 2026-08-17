import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { FadeUp, ScaleIn, RevealOnScroll } from '@/components/ui/Motion'

import styles from './LandingPage.module.css'

const CAREER_PATHS = [
  {
    id: 'full-stack-web',
    num: 'PATH 01',
    title: 'Full Stack Web Development',
    desc: 'Build complete responsive web apps from frontend UI to database backend. The most versatile track in tech.',
    tag: 'Available',
    status: 'Ready to build',
    icon: '🌐',
    color: 'var(--accent)',
    duration: '12 Weeks',
    tools: ['Git', 'React', 'Node.js', 'PostgreSQL', 'Express'],
    notable: 'Mark Zuckerberg, Jack Dorsey',
    syllabus: [
      '[M0] Internet Protocols & Client-Server Flow',
      '[M1] Developer Environments & Git Version Control',
      '[M2] Semantic HTML Markup & CSS Layout Systems',
      '[M3] React UI Components & Application State',
      '[M4] RESTful API Routing & PostgreSQL Databases',
      '[M5] Auditing Vulnerabilities (XSS, SQL Injection)'
    ]
  },
  {
    id: 'mobile-app',
    num: 'PATH 02',
    title: 'Mobile App Development',
    desc: 'Build native iOS and Android apps with modern cross-platform frameworks and deployment architectures.',
    tag: 'Coming Soon',
    status: 'In design',
    icon: '📱',
    color: '#10b981',
    duration: '10 Weeks',
    tools: ['React Native', 'Expo', 'Xcode', 'Android Studio'],
    notable: 'Kevin Systrom, Jan Koum',
    syllabus: [
      '[M0] Mobile Hardware APIs & OS Architectures',
      '[M1] React Native Flexbox Responsive Layouts',
      '[M2] SQLite Local Storage & Offline Cache Synchronization',
      '[M3] Biometric Keychain Authentication Protocols',
      '[M4] App Store Sandbox Deployment Pipelines'
    ]
  },
  {
    id: 'blockchain-web3',
    num: 'PATH 03',
    title: 'Blockchain & Web3',
    desc: 'Write smart contracts, build decentralized apps (dApps), and understand consensus layers and cryptography.',
    tag: 'Coming Soon',
    status: 'In design',
    icon: '⛓️',
    color: '#f59e0b',
    duration: '8 Weeks',
    tools: ['Solidity', 'Hardhat', 'Ethers.js', 'IPFS'],
    notable: 'Vitalik Buterin, Satoshi Nakamoto',
    syllabus: [
      '[M0] Cryptographic Hash Functions & Ledgers',
      '[M1] Solidity Smart Contracts & Security Rules',
      '[M2] ERC-20 & ERC-721 Token Interfaces',
      '[M3] Integrating Web3 Wallets to Frontend UI',
      '[M4] Gas Optimization & Common Attack Vectors'
    ]
  },
  {
    id: 'game-dev',
    num: 'PATH 04',
    title: 'Game Development',
    desc: 'Create highly interactive games. Learn physics engines, rendering loops, and game architecture patterns.',
    tag: 'Coming Soon',
    status: 'In design',
    icon: '🎮',
    color: '#ef4444',
    duration: '14 Weeks',
    tools: ['C#', 'Unity Engine', 'Blender', 'WebGL'],
    notable: 'John Carmack, Hideo Kojima',
    syllabus: [
      '[M0] Game Loop Architectures & Frame Timing',
      '[M1] Vector Math Mechanics & Translations',
      '[M2] Physics Engine Collisions & Rigidbodies',
      '[M3] Modular State Machines & AI Grid Routing',
      '[M4] WebGL Packaging & Browser Optimization'
    ]
  },
  {
    id: 'os-low-level',
    num: 'PATH 05',
    title: 'Systems & OS Programming',
    desc: 'Under the hood memory management, compiled systems, kernel loops, and custom OS architectures.',
    tag: 'Coming Soon',
    status: 'In design',
    icon: '⚙️',
    color: '#6b7280',
    duration: '16 Weeks',
    tools: ['Rust', 'GCC', 'QEMU', 'Linker Scripts'],
    notable: 'Linus Torvalds, Dennis Ritchie',
    syllabus: [
      '[M0] CPU Registers & Hardware Interrupts',
      '[M1] Safe Memory Allocations & Safe Lifetimes',
      '[M2] OS Kernel Runtimes, Drivers & Booting',
      '[M3] Virtual Memory Page Allocation Setup',
      '[M4] Multithreading Contexts & Mutex Locks'
    ]
  },
  {
    id: 'ai-ml',
    num: 'PATH 06',
    title: 'AI & ML Engineering',
    desc: 'Build intelligent applications. Understand LLM pipelines, prompt systems, neural networks, and model training.',
    tag: 'Coming Soon',
    status: 'In design',
    icon: '🧠',
    color: '#8b5cf6',
    duration: '10 Weeks',
    tools: ['Python', 'PyTorch', 'Transformers', 'LangChain'],
    notable: 'Ilya Sutskever, Yann LeCun',
    syllabus: [
      '[M0] Matrix Mathematics & Backpropagation',
      '[M1] Neural Network Node Layer Architectures',
      '[M2] LLM API Pipelines & Vector Embeddings',
      '[M3] RAG Database Indices & Search Vectoring',
      '[M4] Agentic Workflows & Multi-Agent Loops'
    ]
  }
]

const PLAYGROUND_PRESETS = {
  auth: {
    title: 'Auth Route',
    0: {
      code: `// MEK: 0% - Vulnerable blind query
app.post("/login", (req, res) => {
  const { user, pass } = req.body;
  const q = "SELECT * FROM u WHERE n='" + user + "' AND p='" + pass + "'";
  db.query(q, (err, row) => res.json(row));
});`,
      status: '🔴 CRITICAL: SQL Injection vulnerability + Unvalidated input.'
    },
    50: {
      code: `// MEK: 50% - Parametrized queries
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const q = "SELECT * FROM users WHERE n = ? AND p = ?";
  db.query(q, [username, password], (err, row) => res.json(row));
});`,
      status: '⚠️ WARNING: Missing rate limiter. Vulnerable to credential stuffing.'
    },
    100: {
      code: `// MEK: 100% - Fully Secure Audit
app.post("/login", rateLimiter, validateAuthSchema, async (req, res) => {
  const { username, password } = req.body;
  const user = await db.getUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  res.json({ token });
});`,
      status: '🟢 SECURE: Hashed password verification, rate limiter, clean inputs.'
    }
  },
  database: {
    title: 'DB Pool',
    0: {
      code: `// MEK: 0% - Bare client connect
const { Client } = require("pg");
const client = new Client(process.env.DATABASE_URL);
client.connect(); // Closes on error!`,
      status: '🔴 CRITICAL: Missing pool or retry logic. App crashes on pool depletion.'
    },
    50: {
      code: `// MEK: 50% - Standard Pool Instance
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});`,
      status: '⚠️ WARNING: Missing idleTimeoutMillis. Leaked connections can occur.'
    },
    100: {
      code: `// MEK: 100% - Resilient Pool Architecture
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
pool.on("error", (err) => console.error("DB Pool crash:", err));`,
      status: '🟢 SECURE: Connection limits mitigated, automatic pools, robust logs.'
    }
  },
  landing: {
    title: 'UI Shell',
    0: {
      code: `// MEK: 0% - Loose inline components
export default function Hero() {
  return (
    <div style={{ display: "flex", padding: 100 }}>
      <h1>VibeSkool</h1>
    </div>
  );
}`,
      status: '🔴 CRITICAL: Zero viewport limits, layout overlaps, generic styles.'
    },
    50: {
      code: `// MEK: 50% - Generic Flex layout
export default function Hero() {
  return (
    <div className="flex p-8 bg-zinc-900 text-white">
      <h1 className="text-4xl font-bold">VibeSkool</h1>
    </div>
  );
}`,
      status: '⚠️ WARNING: Functional grid, but lacks semantic layout boundaries.'
    },
    100: {
      code: `// MEK: 100% - Brutalist CSS modules
import styles from "./Hero.module.css";
export default function Hero() {
  return (
    <header className={styles.heroSection}>
      <div className={styles.heroInner}>
        <h1 className={styles.heroTitle}>VibeSkool</h1>
      </div>
    </header>
  );
}`,
      status: '🟢 SECURE: Clean CSS modular architecture, layout grids verified.'
    }
  }
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [cursorBlink, setCursorBlink] = useState(true)
  
  // Interactive Simulator State
  const [simTab, setSimTab] = useState('editor') // 'editor' | 'terminal' | 'playground'
  const [isSimRunning, setIsSimRunning] = useState(false)
  const [simLogs, setSimLogs] = useState([])

  // Live cursor blinking effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCursorBlink(b => !b)
    }, 530)
    return () => clearInterval(timer)
  }, [])

  // AI Vibe Sandbox State
  const [mekLevel, setMekLevel] = useState(50)
  const [playgroundTab, setPlaygroundTab] = useState('auth')

  const runSimulation = () => {
    if (isSimRunning) return
    setIsSimRunning(true)
    setSimTab('terminal')
    setSimLogs(['$ node workspace.js'])

    const addLog = (text, delay) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setSimLogs(prev => [...prev, text])
          resolve()
        }, delay)
      })
    }

    addLog('⌛ Connecting to sandbox VM...', 600)
      .then(() => addLog('💡 Executing directAI("vibe coding")...', 800))
      .then(() => addLog('✨ Output: "Ship high quality, audited, clean apps"', 900))
      .then(() => addLog('🛡️ Security audit: 0 vulnerabilities found.', 800))
      .then(() => addLog('✓ Completed in 4.2ms.', 400))
      .then(() => {
        setIsSimRunning(false)
      })
  }

  const resetSimulation = () => {
    setSimLogs([])
    setSimTab('editor')
    setIsSimRunning(false)
  }

  // Force dark theme for the landing page body
  useEffect(() => {
    document.body.setAttribute('data-theme', 'dark');
    return () => document.body.removeAttribute('data-theme');
  }, []);

  return (
    <div className={styles.page}>
      
      {/* ── Background Mesh ── */}
      <div className={styles.meshBackground}>
        <div className={`${styles.glowOrb} ${styles.orb1}`} />
        <div className={`${styles.glowOrb} ${styles.orb2}`} />
      </div>

      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.brand}>
            <div className={styles.brandMark}>VS</div>
            <span className={styles.brandName}>VibeSkool</span>
          </Link>
          <div className={styles.navRight}>
            {currentUser ? (
              <button className={styles.ctaPrimary} onClick={() => navigate('/app/dashboard')}>
                Enter Classroom →
              </button>
            ) : (
              <>
                <Link to="/signin" className={styles.navLink}>Sign in</Link>
                <Link to="/signup" className={styles.ctaPrimary}>Get started free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className={styles.heroSection}>
        <div className={styles.heroInner}>
          <FadeUp delay={100} duration={800}>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              AI-Native Developer Academy
            </div>
          </FadeUp>

          <FadeUp delay={200} duration={800}>
            <h1 className={styles.heroTitle}>
              Know enough to build <span className={styles.accentText}>anything.</span>
              <span className={styles.cursor} style={{ opacity: cursorBlink ? 1 : 0 }}>|</span>
            </h1>
          </FadeUp>

          <FadeUp delay={300} duration={800}>
            <p className={styles.heroSub}>
              You cannot vibe code without knowing how to code. But you do not need to know all the code in the world either. VibeSkool gives you the <strong>Minimum Effective Knowledge</strong> to direct AI, understand its output, and ship real things.
            </p>
          </FadeUp>

          <FadeUp delay={400} duration={800}>
            <div className={styles.heroCtas}>
              <button className={styles.btnPrimary} onClick={() => navigate('/app/dashboard')}>
                Start Learning — It's Free
              </button>
              <button className={styles.btnSecondary} onClick={() => navigate('/app/lab')}>
                Open Sandbox Lab
              </button>
            </div>
          </FadeUp>

          <ScaleIn delay={500} duration={1000}>
            <div className={styles.windowWrapper}>
              <div className={styles.editorPanel}>
                <div className={styles.editorHeader}>
                  <div className={styles.macControls}>
                    <div className={`${styles.macBtn} ${styles.macClose}`} />
                    <div className={`${styles.macBtn} ${styles.macMin}`} />
                    <div className={`${styles.macBtn} ${styles.macMax}`} />
                  </div>
                  <div className={styles.editorTabs}>
                    <button 
                      className={`${styles.tabBtn} ${simTab === 'editor' ? styles.tabBtnActive : ''}`}
                      onClick={() => !isSimRunning && setSimTab('editor')}
                    >
                      workspace.js
                    </button>
                    <button 
                      className={`${styles.tabBtn} ${simTab === 'terminal' ? styles.tabBtnActive : ''}`}
                      onClick={() => setSimTab('terminal')}
                    >
                      Terminal
                    </button>
                    <button 
                      className={`${styles.tabBtn} ${simTab === 'playground' ? styles.tabBtnActive : ''}`}
                      onClick={() => setSimTab('playground')}
                    >
                      Vibe Sandbox
                    </button>
                  </div>
                  <div style={{ width: 44 }}>
                    {/* Placeholder to balance mac controls */}
                  </div>
                </div>
                
                {simTab === 'editor' && (
                  <div className={styles.editorContent}>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>1</span>
                      <span className={styles.cCode}><span className={styles.cComment}>// Learn MEK: The VibeSkool workflow</span></span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>2</span>
                      <span className={styles.cCode}><span className={styles.cKeyword}>function</span> <span className={styles.cFunc}>directAI</span>(<span className={styles.cParam}>assistant</span>) &#123;</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>3</span>
                      <span className={styles.cCode}>  <span className={styles.cKeyword}>const</span> <span className={styles.cParam}>knowsMEK</span> = <span className={styles.cParam}>assistant</span>.<span className={styles.cFunc}>hasMEK</span>();</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>4</span>
                      <span className={styles.cCode}></span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>5</span>
                      <span className={styles.cCode}>  <span className={styles.cKeyword}>if</span> (<span className={styles.cParam}>knowsMEK</span>) &#123;</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>6</span>
                      <span className={styles.cCode}>    <span className={styles.cKeyword}>return</span> <span className={styles.cString}>"Ship production-grade, audited code fast."</span>;</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>7</span>
                      <span className={styles.cCode}>  &#125;</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>8</span>
                      <span className={styles.cCode}></span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>9</span>
                      <span className={styles.cCode}>  <span className={styles.cKeyword}>return</span> <span className={styles.cString}>"Infinite copy-paste loop & mystery bugs."</span>;</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.cNum}>10</span>
                      <span className={styles.cCode}>&#125;</span>
                    </div>
                  </div>
                )}

                {simTab === 'terminal' && (
                  <div className={styles.terminalContent}>
                    {simLogs.length === 0 ? (
                      <div style={{ color: 'var(--text-tertiary)' }}>Terminal is idle. Run code to execute workspace.js.</div>
                    ) : (
                      simLogs.map((log, index) => (
                        <div key={index}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {simTab === 'playground' && (() => {
                  const activeLevel = mekLevel < 33 ? 0 : mekLevel < 75 ? 50 : 100;
                  const preset = PLAYGROUND_PRESETS[playgroundTab][activeLevel];
                  return (
                    <div className={styles.playgroundContent}>
                      <div className={styles.presetTabs}>
                        {Object.keys(PLAYGROUND_PRESETS).map(tabKey => (
                          <button
                            key={tabKey}
                            className={`${styles.presetTabBtn} ${playgroundTab === tabKey ? styles.presetTabBtnActive : ''}`}
                            onClick={() => setPlaygroundTab(tabKey)}
                          >
                            {PLAYGROUND_PRESETS[tabKey].title}
                          </button>
                        ))}
                      </div>

                      <div className={styles.playgroundCodeBox}>
                        <pre><code>{preset.code}</code></pre>
                      </div>

                      <div className={styles.playgroundStatus} data-level={activeLevel}>
                        <span>{preset.status}</span>
                      </div>

                      <div className={styles.sliderRow}>
                        <span>YOUR ASSISTANT MEK LEVEL ({mekLevel}%)</span>
                        <input 
                          type="range" min="0" max="100" value={mekLevel} 
                          onChange={(e) => setMekLevel(Number(e.target.value))} 
                        />
                      </div>
                    </div>
                  );
                })()}
                
                {simTab !== 'playground' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--glass-border)' }}>
                    {simTab === 'terminal' && simLogs.length > 0 && !isSimRunning ? (
                      <button className={styles.simRunBtn} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', marginRight: 12 }} onClick={resetSimulation}>
                        Reset
                      </button>
                    ) : null}
                    <button 
                      className={styles.simRunBtn} 
                      onClick={runSimulation}
                      disabled={isSimRunning}
                      style={{ opacity: isSimRunning ? 0.5 : 1 }}
                    >
                      {isSimRunning ? 'Running...' : 'Run Code'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </ScaleIn>
        </div>
      </header>

      {/* ── Bento Grid Section ── */}
      <RevealOnScroll threshold={0.1}>
        <section className={styles.bentoSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>The Paradigm</span>
            <h2 className={styles.sectionTitle}>The rules of coding have changed.</h2>
            <p className={styles.heroSub}>
              We teach you the 20% that unlocks 80% of your ability to build with AI. No history lessons.
            </p>
          </div>

          <div className={styles.bentoGrid}>
            <div className={`${styles.bentoCard} ${styles.bentoSpan8}`}>
              <div className={styles.cardIcon}>🏗️</div>
              <h3 className={styles.cardTitle}>System Architecture</h3>
              <p className={styles.cardDesc}>
                You must know how client requests, servers, databases, and endpoints interact. AI can write functions, but it cannot design robust system structures without a skilled architect directing it.
              </p>
            </div>

            <div className={`${styles.bentoCard} ${styles.bentoSpan4}`}>
              <div className={styles.cardIcon}>🔍</div>
              <h3 className={styles.cardTitle}>Critical Auditing</h3>
              <p className={styles.cardDesc}>
                You don't need to write syntax by hand, but you MUST be able to read and audit the AI's output to spot logical flaws.
              </p>
            </div>

            <div className={`${styles.bentoCard} ${styles.bentoSpan4}`}>
              <div className={styles.cardIcon}>💻</div>
              <h3 className={styles.cardTitle}>Dev Environments</h3>
              <p className={styles.cardDesc}>
                Command the shell, configure local build systems, and debug version control effortlessly.
              </p>
            </div>

            <div className={`${styles.bentoCard} ${styles.bentoSpan8}`}>
              <div className={styles.cardIcon}>🚀</div>
              <h3 className={styles.cardTitle}>Ship Production-Grade</h3>
              <p className={styles.cardDesc}>
                Spend your energy auditing security, UX, and databases instead of wasting hours searching for missing braces or typos. Direct AI like a senior engineering manager guiding a junior intern.
              </p>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* ── Career Paths Bento ── */}
      <RevealOnScroll threshold={0.1}>
        <section className={styles.bentoSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>The Tracks</span>
            <h2 className={styles.sectionTitle}>Master Your Domain</h2>
          </div>

          <div className={styles.bentoGrid}>
            {CAREER_PATHS.map((path) => (
              <div key={path.id} className={`${styles.bentoCard} ${styles.bentoSpan6}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div className={styles.cardIcon} style={{ margin: 0 }}>{path.icon}</div>
                  <div className={styles.badge} style={{ color: path.color, borderColor: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                    {path.tag}
                  </div>
                </div>
                <h3 className={styles.cardTitle}>{path.title}</h3>
                <p className={styles.cardDesc} style={{ marginBottom: '16px' }}>{path.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {path.tools.map(tool => (
                    <span key={tool} style={{ fontSize: '12px', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', color: 'var(--text-secondary)' }}>
                      {tool}
                    </span>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', fontSize: '13px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🌟</span>
                  <span><strong style={{ color: 'var(--text-secondary)' }}>Pioneers:</strong> {path.notable}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <div className={styles.brand}>
              <div className={styles.brandMark}>VS</div>
              <span className={styles.brandName}>VibeSkool</span>
            </div>
            <p>Designed for the next generation of builders.</p>
          </div>
          <div className={styles.footerRight}>
            <span>© 2026 VibeSkool. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
