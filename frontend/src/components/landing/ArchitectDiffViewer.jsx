import React, { useState } from 'react'
import styles from './ArchitectDiffViewer.module.css'

const DIFF_SCENARIOS = [
  {
    id: 'auth',
    badge: '01 // AUTH & SECURITY',
    title: 'Authentication Endpoint',
    description: 'The same login route, two ways. One stores passwords in plain text. The other doesn\x27t.',
    promptBlind: 'write a login endpoint in express',
    promptDirected: 'implement /api/auth/login using bcrypt, pg parameterized query, and rate-limiting middleware',
    blind: {
      filename: 'routes/auth.js',
      code: [
        { num: 1, text: 'app.post("/api/login", async (req, res) => {', type: 'normal' },
        { num: 2, text: '  const { username, password } = req.body;', type: 'normal' },
        { num: 3, text: "  const query = `SELECT * FROM users WHERE u = '${username}' AND p = '${password}'`;", type: 'danger', issue: 'CRITICAL: SQL Injection via unsanitized template literal. Any attacker can bypass auth with \x27 OR 1=1 --' },
        { num: 4, text: '  const user = await db.query(query);', type: 'normal' },
        { num: 5, text: '  if (!user) return res.status(401).send("Invalid");', type: 'danger', issue: 'HIGH: Plaintext password comparison. Passwords must never be stored or queried in cleartext.' },
        { num: 6, text: '  return res.json({ success: true, token: user.id });', type: 'danger', issue: 'MEDIUM: Predictable token. Sending user.id as session token allows account takeover.' },
        { num: 7, text: '});', type: 'normal' },
      ],
      audit: {
        status: 'FAILED',
        score: '0 / 100',
        summary: 'Catastrophic vulnerabilities found: SQL Injection (CWE-89), Plaintext Credentials (CWE-256), Broken Session (CWE-384).'
      }
    },
    directed: {
      filename: 'controllers/auth.controller.js',
      code: [
        { num: 1, text: 'router.post("/login", authLimiter, validate(loginSchema), async (req, res) => {', type: 'secure', note: 'Brute-force protection & strict schema validation' },
        { num: 2, text: '  const { email, password } = req.body;', type: 'normal' },
        { num: 3, text: '  const { rows } = await pool.query("SELECT id, hash FROM users WHERE email = $1", [email]);', type: 'secure', note: 'Parameterized query mitigates 100% of SQL injection' },
        { num: 4, text: '  const user = rows[0];', type: 'normal' },
        { num: 5, text: '  if (!user || !(await bcrypt.compare(password, user.hash))) {', type: 'secure', note: 'Constant-time salted bcrypt hash comparison' },
        { num: 6, text: '    return res.status(401).json({ error: "Invalid credentials" });', type: 'normal' },
        { num: 7, text: '  }', type: 'normal' },
        { num: 8, text: '  const sessionToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: "8h" });', type: 'secure', note: 'Cryptographically signed JWT with short expiration' },
        { num: 9, text: '  return res.json({ token: sessionToken });', type: 'normal' },
        { num: 10, text: '});', type: 'normal' },
      ],
      audit: {
        status: 'PASSED',
        score: '100 / 100',
        summary: 'No issues found. Passwords hashed, queries parameterised, rate limiting active.'
      }
    }
  },
  {
    id: 'db',
    badge: '02 // INFRASTRUCTURE & SCALING',
    title: 'Database Connection Pool',
    description: 'One crashes when 15 people use it at the same time. The other doesn\x27t.',
    promptBlind: 'connect postgres database to express server',
    promptDirected: 'configure pg.Pool with max connection boundaries, idle timeouts, and crash resilience',
    blind: {
      filename: 'config/db.js',
      code: [
        { num: 1, text: 'const { Client } = require("pg");', type: 'normal' },
        { num: 2, text: 'const client = new Client(process.env.DB_URL);', type: 'normal' },
        { num: 3, text: 'client.connect();', type: 'danger', issue: 'CRITICAL: Single bare client. Once connection drops or concurrency spikes, entire API hangs indefinitely.' },
        { num: 4, text: '', type: 'normal' },
        { num: 5, text: 'module.exports = {', type: 'normal' },
        { num: 6, text: '  query: (text, params) => client.query(text, params)', type: 'danger', issue: 'HIGH: Concurrent queries share same socket, triggering race conditions and packet interleaving.' },
        { num: 7, text: '};', type: 'normal' },
      ],
      audit: {
        status: 'FAILED',
        score: '18 / 100',
        summary: 'Will crash under concurrent load. No connection reuse, no error recovery.'
      }
    },
    directed: {
      filename: 'config/database.js',
      code: [
        { num: 1, text: 'const { Pool } = require("pg");', type: 'normal' },
        { num: 2, text: 'const pool = new Pool({', type: 'normal' },
        { num: 3, text: '  connectionString: env.DATABASE_URL,', type: 'normal' },
        { num: 4, text: '  max: 20, // Prevents Postgres socket exhaustion', type: 'secure', note: 'Caps total connections so the database doesn\x27t run out of sockets' },
        { num: 5, text: '  idleTimeoutMillis: 30000,', type: 'secure', note: 'Closes connections that have been idle for 30 seconds' },
        { num: 6, text: '  connectionTimeoutMillis: 3000,', type: 'secure', note: 'Returns an error quickly instead of hanging forever' },
        { num: 7, text: '});', type: 'normal' },
        { num: 8, text: 'pool.on("error", (err) => logger.error("Unexpected DB idle error", err));', type: 'secure', note: 'Catches background errors so the process doesn\x27t crash silently' },
        { num: 9, text: 'module.exports = pool;', type: 'normal' },
      ],
      audit: {
        status: 'PASSED',
        score: '100 / 100',
        summary: 'Connection pooling configured. Handles concurrent load and recovers from errors.'
      }
    }
  },
  {
    id: 'react',
    badge: '03 // STATE & MEMORY LIFECYCLE',
    title: 'Data Fetching & Re-render Loop',
    description: 'A missing dependency array turns a simple data fetch into an infinite loop that freezes the browser.',
    promptBlind: 'fetch user profile and show items in react',
    promptDirected: 'fetch user profile using useEffect with abort controller and clean error boundaries',
    blind: {
      filename: 'components/UserProfile.jsx',
      code: [
        { num: 1, text: 'export default function UserProfile({ userId }) {', type: 'normal' },
        { num: 2, text: '  const [data, setData] = useState(null);', type: 'normal' },
        { num: 3, text: '  useEffect(() => {', type: 'normal' },
        { num: 4, text: '    fetch(`/api/user/${userId}`).then(res => res.json()).then(d => setData(d));', type: 'danger', issue: 'HIGH: Missing dependency array! This executes on every single frame, locking CPU in infinite render loop.' },
        { num: 5, text: '  });', type: 'danger', issue: 'MEDIUM: No cleanup function or AbortController. Unmounting mid-request causes memory leak.' },
        { num: 6, text: '  return <div>{data?.name}</div>;', type: 'normal' },
        { num: 7, text: '}', type: 'normal' },
      ],
      audit: {
        status: 'FAILED',
        score: '22 / 100',
        summary: 'Infinite render loop detected. Memory leak on fast navigation. Browser freezes.'
      }
    },
    directed: {
      filename: 'components/UserProfile.jsx',
      code: [
        { num: 1, text: 'export default function UserProfile({ userId }) {', type: 'normal' },
        { num: 2, text: '  const [state, setState] = useState({ data: null, loading: true, error: null });', type: 'normal' },
        { num: 3, text: '  useEffect(() => {', type: 'normal' },
        { num: 4, text: '    const controller = new AbortController();', type: 'secure', note: 'Lets us cancel the request if the component disappears before it finishes' },
        { num: 5, text: '    api.fetchUser(userId, { signal: controller.signal })', type: 'normal' },
        { num: 6, text: '      .then(data => setState({ data, loading: false, error: null }))', type: 'normal' },
        { num: 7, text: '      .catch(err => !controller.signal.aborted && setState({ data: null, loading: false, error: err }));', type: 'secure', note: 'Only updates state if the component is still mounted' },
        { num: 8, text: '    return () => controller.abort();', type: 'secure', note: 'Cleanup function — runs when the component unmounts' },
        { num: 9, text: '  }, [userId]); // Exact dependency prevents infinite re-render loop', type: 'secure', note: 'Only re-runs when userId actually changes' },
        { num: 10, text: '  return <ProfileCard {...state} />;', type: 'normal' },
        { num: 11, text: '}', type: 'normal' },
      ],
      audit: {
        status: 'PASSED',
        score: '100 / 100',
        summary: 'Zero re-render loops. Race conditions mitigated with AbortController.'
      }
    }
  }
]

export default function ArchitectDiffViewer() {
  const [activeScenarioId, setActiveScenarioId] = useState('auth')
  const [viewMode, setViewMode] = useState('directed') // 'blind' | 'directed' | 'split'
  const [inspectedLine, setInspectedLine] = useState(null)

  const scenario = DIFF_SCENARIOS.find(s => s.id === activeScenarioId) || DIFF_SCENARIOS[0]
  const currentView = viewMode === 'blind' ? scenario.blind : scenario.directed
  const isBlind = viewMode === 'blind'

  return (
    <div className={styles.container}>
      {/* ── Header Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.scenarioTabs}>
          {DIFF_SCENARIOS.map(s => (
            <button
              key={s.id}
              className={`${styles.scenarioTab} ${s.id === activeScenarioId ? styles.scenarioTabActive : ''}`}
              onClick={() => {
                setActiveScenarioId(s.id)
                setInspectedLine(null)
              }}
            >
              <span className={styles.tabBadge}>{s.badge.split(' // ')[0]}</span>
              <span className={styles.tabLabel}>{s.title}</span>
            </button>
          ))}
        </div>

        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${viewMode === 'blind' ? styles.modeBtnBlindActive : ''}`}
            onClick={() => {
              setViewMode('blind')
              setInspectedLine(null)
            }}
          >
            <span className={styles.modeDotDanger} />
            Without the knowledge
          </button>
          <button
            className={`${styles.modeBtn} ${viewMode === 'directed' ? styles.modeBtnDirectedActive : ''}`}
            onClick={() => {
              setViewMode('directed')
              setInspectedLine(null)
            }}
          >
            <span className={styles.modeDotSuccess} />
            With the knowledge
          </button>
        </div>
      </div>

      {/* ── Prompt Context Box ── */}
      <div className={styles.promptContext}>
        <div className={styles.promptLabel}>
          <span>{isBlind ? 'THE VAGUE PROMPT:' : 'THE SPECIFIC PROMPT:'}</span>
        </div>
        <div className={styles.promptText}>
          <code>&gt; {isBlind ? scenario.promptBlind : scenario.promptDirected}</code>
        </div>
      </div>

      {/* ── Code Window ── */}
      <div className={`${styles.codeWindow} ${isBlind ? styles.windowBlind : styles.windowDirected}`}>
        <div className={styles.windowBar}>
          <div className={styles.barLeft}>
            <span className={styles.macDot} style={{ background: '#d88180' }} />
            <span className={styles.macDot} style={{ background: '#cad182' }} />
            <span className={styles.macDot} style={{ background: '#feeac7' }} />
            <span className={styles.filename}>{currentView.filename}</span>
          </div>

          <div className={styles.barRight}>
            <span className={isBlind ? styles.auditPillFail : styles.auditPillPass}>
              {currentView.audit.status} • SCORE: {currentView.audit.score}
            </span>
          </div>
        </div>

        {/* ── Code Lines ── */}
        <div className={styles.codeBody}>
          {currentView.code.map((line, idx) => {
            const hasIssue = Boolean(line.issue)
            const hasNote = Boolean(line.note)
            const isSelected = inspectedLine === idx

            return (
              <div
                key={idx}
                className={`
                  ${styles.codeRow} 
                  ${line.type === 'danger' ? styles.rowDanger : ''} 
                  ${line.type === 'secure' ? styles.rowSecure : ''}
                  ${isSelected ? styles.rowSelected : ''}
                `}
                onClick={() => setInspectedLine(isSelected ? null : idx)}
              >
                <span className={styles.rowGutter}>
                  {line.type === 'danger' && <span className={styles.gutterIconDanger}>!</span>}
                  {line.type === 'secure' && <span className={styles.gutterIconSecure}>✓</span>}
                  <span className={styles.lineNum}>{line.num || ' '}</span>
                </span>

                <span className={styles.lineContent}>
                  <code>{line.text}</code>
                </span>

                {hasIssue && (
                  <span className={styles.inlineIssueTag}>
                    [!] Vulnerability
                  </span>
                )}
                {hasNote && (
                  <span className={styles.inlineNoteTag}>
                    [✓] Audited
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Live Inspector Callout ── */}
        <div className={styles.inspectorTray}>
          {inspectedLine !== null && currentView.code[inspectedLine]?.issue ? (
            <div className={styles.inspectorAlertDanger}>
              <strong style={{ color: 'var(--powder-blush)' }}>What's wrong here: </strong>
              <span>{currentView.code[inspectedLine].issue}</span>
            </div>
          ) : inspectedLine !== null && currentView.code[inspectedLine]?.note ? (
            <div className={styles.inspectorAlertSecure}>
              <strong style={{ color: 'var(--golden-sand)' }}>Why this works: </strong>
              <span>{currentView.code[inspectedLine].note}</span>
            </div>
          ) : (
            <div className={styles.inspectorSummary}>
              <span className={styles.summaryTitle}>
                {isBlind ? '⚠ AUDIT: PROBLEMS FOUND' : '✓ AUDIT: CLEAN'}
              </span>
              <p>{currentView.audit.summary}</p>
              <span className={styles.inspectorHint}>
                Click any highlighted line to see the details.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
