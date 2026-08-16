import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import styles from './LandingPage.module.css'

const WEEKS = [
  ['01–02', 'Orientation', 'The internet, requests, and the command line'],
  ['03–04', 'Structure', 'Semantic HTML and durable CSS systems'],
  ['05–06', 'Logic', 'JavaScript, state, and the browser runtime'],
  ['07–08', 'Interface', 'React components and interaction design'],
  ['09–10', 'Systems', 'Node, APIs, PostgreSQL, and data modelling'],
  ['11–12', 'Assurance', 'Security, accessibility, testing, and review'],
  ['13–14', 'Direction', 'AI-assisted development with accountable prompts'],
  ['15–16', 'Thesis', 'A deployed capstone you can defend line by line'],
]

const AUDIT = [
  ['01', 'Name the boundary', 'What crosses from browser to server?'],
  ['02', 'State the constraint', 'What must always remain true?'],
  ['03', 'Inspect the implementation', 'Can you account for every line?'],
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [pledged, setPledged] = useState(false)
  const week = WEEKS[selectedWeek]

  return (
    <main className={styles.page}>
      <a href="#main" className="skip-link">Skip to course overview</a>

      <header className={styles.masthead}>
        <Link className={styles.wordmark} to="/" aria-label="VibeSkool home">
          <span className={styles.mark}>VS</span>
          <span>VibeSkool <i>School of Web Practice</i></span>
        </Link>
        <nav className={styles.nav} aria-label="Course navigation">
          <a href="#curriculum">Syllabus</a>
          <a href="#method">Method</a>
          <a href="#standard">The standard</a>
        </nav>
        <div className={styles.account}>
          {currentUser ? <button onClick={() => navigate('/app/dashboard')}>Enter studio ↗</button> : <><Link to="/signin">Sign in</Link><Link className={styles.applyLink} to="/signup">Apply for the cohort</Link></>}
        </div>
      </header>

      <section className={styles.hero} id="main">
        <div className={styles.heroMeta}>
          <span>WEB 101 / 2026–27</span>
          <span>16 weeks · remote studio</span>
        </div>
        <div className={styles.heroTitleWrap}>
          <p className={styles.kicker}>A course in software judgement</p>
          <h1>Build with AI.<br /><em>Understand</em> what you ship.</h1>
        </div>
        <aside className={styles.heroNote}>
          <span className={styles.noteNumber}>[ a ]</span>
          <p>VibeSkool begins with the manual work. AI arrives after you can see the system it is changing.</p>
        </aside>
        <div className={styles.heroFoot}>
          <p>Full-stack web development for people who want fluency, not a magic trick.</p>
          <a href="#curriculum" className={styles.textAction}>Read the syllabus <span>↓</span></a>
        </div>
      </section>

      <section className={styles.manifesto} id="method">
        <p className={styles.sectionLabel}>01 / THE PREMISE</p>
        <div className={styles.manifestoStatement}>
          <p>Software has become easier to generate and <strong>more important to evaluate.</strong> Our students learn the foundations first, then use AI as a fast, capable collaborator—never as an excuse to outsource judgement.</p>
        </div>
        <div className={styles.manifestoMargin}>
          <span>Working definition</span>
          <p><b>Vibecoding</b> is directing AI with enough technical understanding to question, test, and improve its output.</p>
        </div>
      </section>

      <section className={styles.curriculum} id="curriculum">
        <header className={styles.sectionHead}>
          <div><p className={styles.sectionLabel}>02 / THE SYLLABUS</p><h2>Sixteen weeks,<br />in public view.</h2></div>
          <p>Every unit pairs a concept with an artifact and a defence. Move through the course as you would a good technical document: in sequence, with notes.</p>
        </header>
        <div className={styles.syllabusGrid}>
          <div className={styles.weekList} role="tablist" aria-label="Course weeks">
            {WEEKS.map(([number, title, summary], i) => <button key={number} role="tab" aria-selected={i === selectedWeek} className={i === selectedWeek ? styles.activeWeek : ''} onClick={() => setSelectedWeek(i)}><span>{number}</span><b>{title}</b><small>{summary}</small></button>)}
          </div>
          <article className={styles.weekDetail} aria-live="polite">
            <p>WEEKS {week[0]} <span>•</span> {week[1].toUpperCase()}</p>
            <h3>{week[2]}</h3>
            <div className={styles.detailRule} />
            <dl><div><dt>Studio outcome</dt><dd>{selectedWeek < 2 ? 'Explain the system before you change it.' : selectedWeek < 6 ? 'Build an interface that exposes its own logic.' : 'Make and defend a production decision.'}</dd></div><div><dt>Assessment</dt><dd>Annotated build review</dd></div><div><dt>AI posture</dt><dd>{selectedWeek < 6 ? 'Observe · prohibit generation' : 'Direct · audit · revise'}</dd></div></dl>
            <Link to="/signup" className={styles.detailAction}>See all lessons <span>→</span></Link>
          </article>
        </div>
      </section>

      <section className={styles.labNote}>
        <div className={styles.labIntro}><p className={styles.sectionLabel}>03 / A DIFFERENT KIND OF LAB</p><h2>The prompt is<br /><em>not</em> the assignment.</h2></div>
        <div className={styles.codeSheet}>
          <div className={styles.codeTop}><span>lesson-11 / api-boundaries.js</span><span>annotated</span></div>
          <pre><code><i>01</i><span>const user = await db.query(</span>{'\n'}<i>02</i><span>  'SELECT id FROM users WHERE email = $1',</span>{'\n'}<i>03</i><span>  [email]</span>{'\n'}<i>04</i><span>)</span></code></pre>
          <p className={styles.codeAnnotation}><b>Why $1?</b> Student annotation required: user input is treated as data, never executable SQL.</p>
        </div>
        <div className={styles.labAside}><span>[ b ]</span><p>We do not mark code “done” because it runs. We ask students to annotate it, test its failure modes, and explain its trade-offs aloud.</p></div>
      </section>

      <section className={styles.standard} id="standard">
        <p className={styles.sectionLabel}>04 / THE VIBESKOOL STANDARD</p>
        <div className={styles.standardHead}><h2>Never ship code<br />you cannot explain.</h2><p>Not a slogan. A repeatable pre-ship ritual built into every lesson, review, and capstone milestone.</p></div>
        <ol className={styles.auditList}>{AUDIT.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
        <div className={styles.pledge}><div><span className={styles.noteNumber}>[ commitment ]</span><h3>Make the standard yours.</h3><p>Begin with the diagnostic. No credit card and no pretend expertise required.</p></div><button onClick={() => setPledged(true)} className={pledged ? styles.pledged : ''}>{pledged ? 'Standard acknowledged ✓' : 'I will explain my work →'}</button></div>
      </section>

      <footer className={styles.footer}>
        <p>VIBESKOOL / SCHOOL OF WEB PRACTICE</p><p>Remote · Cohort-based · <Link to="/signup">Apply for 2026–27 ↗</Link></p><p>© 2026</p>
      </footer>
    </main>
  )
}
