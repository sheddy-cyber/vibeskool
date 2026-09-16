import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getStoredTheme, applyTheme } from "@/lib/theme";
import { Button, BrandLogo } from "@/components/ui";
import { 
  ArrowRight, 
  BookOpen, 
  Code2, 
  Laptop, 
  CheckCircle2, 
  Terminal, 
  Play, 
  Check, 
  Copy, 
  Users, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  ChevronRight
} from "lucide-react";
import styles from "./LandingPage.module.css";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  // Lenis smooth gliding scroll scoped exclusively to the landing page
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      anchors: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  // The landing page remains exclusively in light mode regardless of user app theme preference
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", "#FFFFFF");
    }

    return () => {
      // Restore user's app theme preference when navigating away
      applyTheme(getStoredTheme());
    };
  }, []);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText("CS-104-ALGO");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* ── Top Navigation Bar ────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <Link to="/" className={styles.brandLink}>
              <BrandLogo size={28} showText={true} />
            </Link>
          </div>
          

          <div className={styles.headerRight}>
            {!currentUser ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
                <Button variant="primary" onClick={() => navigate("/signup")}>Get started</Button>
              </>
            ) : (
              <Button variant="primary" onClick={() => navigate("/app/dashboard")}>Dashboard</Button>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ── Hero Section (Pure Crystalline White & Blue Accents) ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.specBadge}>
              <span>Modern Collaborative Engineering Classroom</span>
            </div>

            <h1 className={styles.heroTitle}>
              The collaborative coding platform for learners and mentors.
            </h1>

            <p className={styles.heroSubtitle}>
              Execute code instantly in your browser, progress through hands-on curriculum,
              and collaborate live with mentors—with zero environment configuration or setup drag.
            </p>

            <div className={styles.heroActions}>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate(currentUser ? "/app/dashboard" : "/signup?role=student")}
                icon={<ArrowRight size={16} />}
              >
                Start learning free
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => navigate("/app/paths")}
                icon={<BookOpen size={16} />}
              >
                Explore curriculum
              </Button>
            </div>

            {/* Spec Bar */}
            <div className={styles.specBar}>
              <div className={styles.specItem}>
                <Cpu size={14} className={styles.specIcon} />
                <span>In-Browser Python &amp; JS VM</span>
              </div>
              <div className={styles.specDivider} />
              <div className={styles.specItem}>
                <ShieldCheck size={14} className={styles.specIcon} />
                <span>Zero Local Dependencies</span>
              </div>
              <div className={styles.specDivider} />
              <div className={styles.specItem}>
                <Laptop size={14} className={styles.specIcon} />
                <span>Real-Time Code Pairing</span>
              </div>
              <div className={styles.specDivider} />
              <div className={styles.specItem}>
                <CheckCircle2 size={14} className={styles.specIcon} />
                <span>100% Free Core Curriculum</span>
              </div>
            </div>
          </div>

          {/* ── Product UI Showcase: In-Browser IDE & Test Runner ── */}
          <div className={styles.productShowcaseWrapper}>
            <div className={styles.ideWindow}>
              {/* Window Header */}
              <div className={styles.ideHeader}>
                <div className={styles.windowControls}>
                  <span className={`${styles.dot} ${styles.dotRed}`} />
                  <span className={`${styles.dot} ${styles.dotYellow}`} />
                  <span className={`${styles.dot} ${styles.dotGreen}`} />
                </div>

                <div className={styles.ideTabs}>
                  <div className={`${styles.ideTab} ${styles.ideTabActive}`}>
                    <Code2 size={13} className={styles.tabIcon} />
                    <span>stream_parser.py</span>
                  </div>
                  <div className={styles.ideTab}>
                    <Terminal size={13} className={styles.tabIcon} />
                    <span>test_stream.py</span>
                  </div>
                  <div className={styles.ideTab}>
                    <span>README.md</span>
                  </div>
                </div>

                <div className={styles.ideHeaderActions}>
                  <span className={styles.keyShortcut}>Ctrl + Enter</span>
                  <button type="button" className={styles.runActionBtn}>
                    <Play size={12} fill="currentColor" />
                    <span>Run Tests</span>
                  </button>
                </div>
              </div>

              {/* Window Body: Dual Split (Code Editor + Test Runner & Mentor Review) */}
              <div className={styles.ideBody}>
                {/* Code Editor Pane */}
                <div className={styles.editorPane}>
                  <div className={styles.gutter}>
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
                  </div>
                  <pre className={styles.editorCode}>
<code><span className={styles.kw}>def</span> <span className={styles.fn}>parse_tokens</span>(stream: <span className={styles.type}>list</span>) -&gt; <span className={styles.type}>dict</span>:
    <span className={styles.doc}>"""Extract valid payload entities from telemetry stream."""</span>
    buffer = {}
    <span className={styles.kw}>for</span> item <span className={styles.kw}>in</span> stream:
        <span className={styles.comment}># Guard against unverified telemetry items</span>
        <span className={styles.kw}>if not</span> item.get(<span className={styles.str}>"valid"</span>):
            <span className={styles.kw}>continue</span>
        buffer[item[<span className={styles.str}>"id"</span>]] = item.get(<span className={styles.str}>"payload"</span>, {})
    <span className={styles.kw}>return</span> buffer</code>
                  </pre>

                  {/* Inline Mentor Feedback Callout */}
                  <div className={styles.inlineReviewBox}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.mentorAvatar}>SK</div>
                      <span className={styles.mentorName}>Sarah K.</span>
                      <span className={styles.mentorRole}>Course Mentor</span>
                      <span className={styles.reviewTime}>Line 7 · Just now</span>
                    </div>
                    <p className={styles.reviewText}>
                      Solid edge case guard on line 7! Notice how you handled missing payloads with a default dictionary—this prevents downstream <code>KeyError</code> exceptions in the pipeline.
                    </p>
                  </div>
                </div>

                {/* Test Runner & Output Console */}
                <div className={styles.consolePane}>
                  <div className={styles.consoleHeader}>
                    <div className={styles.consoleTitle}>
                      <CheckCircle2 size={14} className={styles.consoleSuccessIcon} />
                      <span>Test Results</span>
                    </div>
                    <span className={styles.testBadge}>3 of 3 Passed (0.034s)</span>
                  </div>

                  <div className={styles.testCaseList}>
                    <div className={styles.testCaseItem}>
                      <CheckCircle2 size={13} className={styles.testCheck} />
                      <span className={styles.testName}>test_valid_payload_parsing</span>
                      <span className={styles.testDuration}>12ms</span>
                    </div>
                    <div className={styles.testCaseItem}>
                      <CheckCircle2 size={13} className={styles.testCheck} />
                      <span className={styles.testName}>test_unverified_items_skipped</span>
                      <span className={styles.testDuration}>8ms</span>
                    </div>
                    <div className={styles.testCaseItem}>
                      <CheckCircle2 size={13} className={styles.testCheck} />
                      <span className={styles.testName}>test_empty_stream_fallback</span>
                      <span className={styles.testDuration}>14ms</span>
                    </div>
                  </div>

                  <div className={styles.terminalStdout}>
                    <div className={styles.stdoutPrompt}>$ python3 -m unittest test_stream.py -v</div>
                    <div className={styles.stdoutLine}>test_valid_payload_parsing ... ok</div>
                    <div className={styles.stdoutLine}>test_unverified_items_skipped ... ok</div>
                    <div className={styles.stdoutLine}>test_empty_stream_fallback ... ok</div>
                    <div className={styles.stdoutSummary}>------------------------------------------------------</div>
                    <div className={styles.stdoutSummary}>Ran 3 tests in 0.034s · Status: OK · Exit Code: 0</div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className={styles.ideFooter}>
                <div className={styles.footerLeft}>
                  <span>Python 3.11.4</span>
                  <span>UTF-8</span>
                  <span>Spaces: 4</span>
                </div>
                <div className={styles.footerRight}>
                  <span className={styles.statusLiveDot} />
                  <span>Sandbox VM: Connected (22ms)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 1: Built for Mentors & Classrooms (Logo Brand Green #34A853) ─ */}
        <section id="classrooms" className={styles.classroomsSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.classroomsHeader}>
              <div className={styles.classroomsEyebrow}>CLASSROOM TELEMETRY &amp; LIVE PAIRING</div>
              <h2 className={styles.classroomsTitle}>
                Real-time visibility into student code. Live 1-on-1 pairing.
              </h2>
              <p className={styles.classroomsSubtitle}>
                Eliminate the setup overhead at the start of every session. Monitor which test cases students are stuck on,
                join their editor with shared cursors, and deliver precision feedback.
              </p>
            </div>

            <div className={styles.telemetryCard}>
              <div className={styles.telemetryHeader}>
                <div className={styles.telemetryTitleGroup}>
                  <span className={styles.cohortTag}>COHORT CS-104</span>
                  <span className={styles.cohortCount}>18 Students Online</span>
                </div>

                <div className={styles.cohortActions}>
                  <div className={styles.invitePill}>
                    <span className={styles.inviteLabel}>Invite Code:</span>
                    <code className={styles.inviteCode}>CS-104-ALGO</code>
                    <button 
                      type="button" 
                      onClick={handleCopyInvite} 
                      className={styles.copyPillBtn}
                      aria-label="Copy cohort code"
                    >
                      {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCode ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              <div className={styles.rosterTableWrapper}>
                <table className={styles.rosterTable}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Current Exercise</th>
                      <th>Automated Tests</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className={styles.studentCell}>
                          <div className={styles.studentAvatar}>AR</div>
                          <div className={styles.studentInfo}>
                            <span className={styles.studentName}>Alex Rivera</span>
                            <span className={styles.studentEmail}>alex.r@example.edu</span>
                          </div>
                        </div>
                      </td>
                      <td>Binary Search Tree: Inorder Traversal</td>
                      <td>
                        <span className={styles.testScoreGreen}>4 / 4 Passing</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.badgeGreen}`}>Completed</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button type="button" className={styles.inspectBtn}><span>View Solution</span></button>
                      </td>
                    </tr>

                    <tr className={styles.activeRow}>
                      <td>
                        <div className={styles.studentCell}>
                          <div className={`${styles.studentAvatar} ${styles.avatarBlue}`}>MC</div>
                          <div className={styles.studentInfo}>
                            <span className={styles.studentName}>Maya Chen</span>
                            <span className={styles.studentEmail}>maya.c@example.edu</span>
                          </div>
                        </div>
                      </td>
                      <td>Telemetry Stream Parser</td>
                      <td>
                        <span className={styles.testScoreAmber}>2 / 3 Passing</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.badgeAmber}`}>Editing Line 8</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button 
                          type="button" 
                          className={styles.pairLiveBtn}
                          onClick={() => navigate("/app/classrooms")}
                        >
                          <Laptop size={13} />
                          <span>Pair Live</span>
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className={styles.studentCell}>
                          <div className={styles.studentAvatar}>DK</div>
                          <div className={styles.studentInfo}>
                            <span className={styles.studentName}>David Kim</span>
                            <span className={styles.studentEmail}>david.k@example.edu</span>
                          </div>
                        </div>
                      </td>
                      <td>Recursion &amp; Memoization</td>
                      <td>
                        <span className={styles.testScoreAmber}>1 / 4 Passing</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.badgeRed}`}>Stuck on Test 2</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button 
                          type="button" 
                          className={styles.pairLiveBtn}
                          onClick={() => navigate("/app/classrooms")}
                        >
                          <Laptop size={13} />
                          <span>Pair Live</span>
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className={styles.studentCell}>
                          <div className={styles.studentAvatar}>ER</div>
                          <div className={styles.studentInfo}>
                            <span className={styles.studentName}>Elena Rostova</span>
                            <span className={styles.studentEmail}>elena.r@example.edu</span>
                          </div>
                        </div>
                      </td>
                      <td>Hash Map Collision Resolution</td>
                      <td>
                        <span className={styles.testScoreGreen}>3 / 3 Passing</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.badgeGreen}`}>Completed</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button type="button" className={styles.inspectBtn}><span>View Solution</span></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ── Chromatic Transition: Green Telemetry ⟶ Red Curriculum ── */}
        <div className={styles.sectionTransition} aria-label="Transition from Live Mentorship to Guided Tracks">
          <svg
            className={styles.transitionSvg}
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* Mid ambient wave gradient */}
              <linearGradient id="ambientGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34A853" stopOpacity="0.25" />
                <stop offset="35%" stopColor="#F9AB00" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#EA4335" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#EA4335" stopOpacity="0.25" />
              </linearGradient>

              {/* Luminous crest sweep beam */}
              <linearGradient id="crestBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34A853" stopOpacity="0" />
                <stop offset="25%" stopColor="#34A853" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="75%" stopColor="#F9AB00" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#EA4335" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Back ambient wave with amber warm glow */}
            <path
              className={styles.backWave}
              d="M0,40 C400,90 800,20 1200,80 C1320,95 1380,85 1440,75 L1440,120 L0,120 Z"
              fill="#F9AB00"
              opacity="0.2"
            />

            {/* Mid drifting wave with logo triad gradient */}
            <path
              className={styles.midWave}
              d="M0,65 C320,30 640,100 960,45 C1160,10 1320,70 1440,55 L1440,120 L0,120 Z"
              fill="url(#ambientGrad)"
            />

            {/* Front seamless wave connecting flush into #EA4335 */}
            <path
              className={styles.frontWave}
              d="M0,50 C200,95 380,95 500,75 C650,50 800,20 950,35 C1120,50 1300,75 1440,60 L1440,120 L0,120 Z"
              fill="#EA4335"
            />

            {/* Luminous animated energy pulse along the wave crest */}
            <path
              className={styles.crestBeam}
              d="M0,50 C200,95 380,95 500,75 C650,50 800,20 950,35 C1120,50 1300,75 1440,60"
              fill="none"
              stroke="url(#crestBeamGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>

        </div>

        {/* ── Section 2: Structured Curriculum Tracks (Logo Brand Red #EA4335) ── */}
        <section id="curriculum" className={styles.curriculumSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.curriculumHeader}>
              <div className={styles.curriculumEyebrow}>STRUCTURED TRACKS</div>
              <h2 className={styles.curriculumTitle}>
                Curriculum engineered around building, not syntax memorization.
              </h2>
              <p className={styles.curriculumSubtitle}>
                Step-by-step engineering tracks combining foundational theory, hands-on browser labs,
                and verified milestone projects.
              </p>
            </div>

            <div className={styles.tracksGrid}>
              {/* Track 1 */}
              <div className={styles.trackCard}>
                <div className={styles.trackHeader}>
                  <span className={styles.trackTag}>Core Track</span>
                  <span className={styles.trackLevel}>Beginner to Intermediate</span>
                </div>
                <h3 className={styles.trackTitle}>Python Foundations &amp; Algorithms</h3>
                <p className={styles.trackDesc}>
                  Master control flow, memory mental models, object-oriented concepts, and core data structures
                  through algorithmic problem solving.
                </p>
                <div className={styles.trackMeta}>
                  <div className={styles.metaItem}>
                    <BookOpen size={14} />
                    <span>32 Interactive Lessons</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Layers size={14} />
                    <span>8 Verified Projects</span>
                  </div>
                </div>
                <div className={styles.trackTopics}>
                  <span className={styles.topicPill}>Control Flow</span>
                  <span className={styles.topicPill}>Data Structures</span>
                  <span className={styles.topicPill}>Recursion</span>
                  <span className={styles.topicPill}>Unit Testing</span>
                </div>
                <div className={styles.trackFooter}>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate("/app/paths")}
                    icon={<ChevronRight size={14} />}
                  >
                    Explore Track
                  </Button>
                </div>
              </div>

              {/* Track 2 */}
              <div className={styles.trackCard}>
                <div className={styles.trackHeader}>
                  <span className={styles.trackTag}>Fullstack Track</span>
                  <span className={styles.trackLevel}>Intermediate</span>
                </div>
                <h3 className={styles.trackTitle}>Web Systems &amp; Modern JavaScript</h3>
                <p className={styles.trackDesc}>
                  Build reactive client applications and understand modern browser execution, DOM manipulation,
                  asynchronous event loops, and RESTful API design.
                </p>
                <div className={styles.trackMeta}>
                  <div className={styles.metaItem}>
                    <BookOpen size={14} />
                    <span>28 Interactive Lessons</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Layers size={14} />
                    <span>6 Verified Projects</span>
                  </div>
                </div>
                <div className={styles.trackTopics}>
                  <span className={styles.topicPill}>DOM Engine</span>
                  <span className={styles.topicPill}>Async / Promises</span>
                  <span className={styles.topicPill}>REST APIs</span>
                  <span className={styles.topicPill}>State Architecture</span>
                </div>
                <div className={styles.trackFooter}>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate("/app/paths")}
                    icon={<ChevronRight size={14} />}
                  >
                    Explore Track
                  </Button>
                </div>
              </div>

              {/* Track 3 */}
              <div className={styles.trackCard}>
                <div className={styles.trackHeader}>
                  <span className={styles.trackTag}>Advanced Track</span>
                  <span className={styles.trackLevel}>Intermediate to Advanced</span>
                </div>
                <h3 className={styles.trackTitle}>Software Design &amp; Engineering Patterns</h3>
                <p className={styles.trackDesc}>
                  Develop production-grade software engineering habits: clean interfaces, automated test-driven development,
                  concurrency basics, and modular architecture.
                </p>
                <div className={styles.trackMeta}>
                  <div className={styles.metaItem}>
                    <BookOpen size={14} />
                    <span>24 Interactive Lessons</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Layers size={14} />
                    <span>5 Verified Projects</span>
                  </div>
                </div>
                <div className={styles.trackTopics}>
                  <span className={styles.topicPill}>Design Patterns</span>
                  <span className={styles.topicPill}>TDD &amp; PyTest</span>
                  <span className={styles.topicPill}>Concurrency</span>
                  <span className={styles.topicPill}>System Optimization</span>
                </div>
                <div className={styles.trackFooter}>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate("/app/paths")}
                    icon={<ChevronRight size={14} />}
                  >
                    Explore Track
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Call to Action Hub (Clean Porcelain #F8FAFC) ───────────── */}
        <section className={styles.ctaSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.ctaHeader}>
              <div className={styles.ctaEyebrow}>GET STARTED TODAY</div>
              <h2 className={styles.ctaTitle}>Start building your engineering momentum.</h2>
              <p className={styles.ctaSubtitle}>
                Free forever for individual learners. Purpose-built for classrooms, bootcamps, and tutoring cohorts.
              </p>
            </div>

            <div className={styles.openBookContainer}>
              {/* Silk Ribbon Bookmark */}
              <div className={styles.bookRibbon} aria-hidden="true" />

              <div className={styles.bookSpread}>
                {/* Left Page: Learner */}
                <div className={`${styles.bookPage} ${styles.bookPageLeft}`}>
                  <div className={styles.folioHeader}>
                    <span className={styles.folioPageNum}>PAGE 01</span>
                    <span className={styles.folioRule} />
                    <span className={styles.folioChapter}>LEARNER SYLLABUS</span>
                  </div>

                  <div className={styles.ctaBoxHeader}>
                    <span className={styles.ctaAudience}>FOR INDIVIDUAL LEARNERS</span>
                    <h3 className={styles.ctaBoxTitle}>Start building your engineering portfolio.</h3>
                    <p className={styles.ctaBoxDesc}>
                      Gain immediate access to all core learning tracks, in-browser execution sandboxes,
                      and automated test-driven challenges. Free forever for individuals.
                    </p>
                  </div>

                  <ul className={styles.ctaFeatureList}>
                    <li><CheckCircle2 size={14} className={styles.featureCheck} /> In-browser development container</li>
                    <li><CheckCircle2 size={14} className={styles.featureCheck} /> Automated unit-test grading &amp; feedback</li>
                    <li><CheckCircle2 size={14} className={styles.featureCheck} /> Free access to all foundational paths</li>
                  </ul>

                  <div className={styles.ctaBoxAction}>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      onClick={() => navigate(currentUser ? "/app/dashboard" : "/signup?role=student")}
                      icon={<ArrowRight size={16} />}
                    >
                      Create Free Account
                    </Button>
                  </div>

                  <div className={styles.folioFooter}>
                    <span>VIBESKOOL CORE</span>
                    <span>01</span>
                  </div>
                </div>

                {/* Center Spine Crease */}
                <div className={styles.bookSpine} aria-hidden="true">
                  <div className={styles.spineGutter} />
                  <div className={styles.spineSeam} />
                </div>

                {/* Right Page: Instructor */}
                <div className={`${styles.bookPage} ${styles.bookPageRight}`}>
                  <div className={styles.folioHeader}>
                    <span className={styles.folioPageNum}>PAGE 02</span>
                    <span className={styles.folioRule} />
                    <span className={styles.folioChapter}>INSTRUCTOR PROTOCOL</span>
                  </div>

                  <div className={styles.ctaBoxHeader}>
                    <span className={`${styles.ctaAudience} ${styles.audienceAmber}`}>FOR TUTORS &amp; INSTRUCTORS</span>
                    <h3 className={styles.ctaBoxTitle}>Lead classes with zero infrastructure drag.</h3>
                    <p className={styles.ctaBoxDesc}>
                      Deploy student cohorts in seconds. Observe live progress, build custom auto-graded coding challenges,
                      and pair with students directly in their browser editor.
                    </p>
                  </div>

                  <ul className={styles.ctaFeatureList}>
                    <li><CheckCircle2 size={14} className={styles.featureCheck} /> Unlimited student classrooms &amp; cohorts</li>
                    <li><CheckCircle2 size={14} className={styles.featureCheck} /> 1-click multiplayer editor pairing</li>
                    <li><CheckCircle2 size={14} className={styles.featureCheck} /> Custom exercise &amp; test suite authoring</li>
                  </ul>

                  <div className={styles.ctaBoxAction}>
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      onClick={() => navigate(currentUser ? "/app/dashboard" : "/signup?role=teacher")}
                      icon={<Users size={16} />}
                    >
                      Create Tutor Account
                    </Button>
                  </div>

                  <div className={styles.folioFooter}>
                    <span>COLLABORATIVE OPS</span>
                    <span>02</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrandCol}>
            <BrandLogo size={24} showText={true} skoolColor="#FFFFFF" />
            <p className={styles.footerTagline}>
              The collaborative coding classroom for learners and mentors.
            </p>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} VibeSkool. All rights reserved.
            </p>
          </div>

          <div className={styles.footerLinksGrid}>
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Product</span>
              <Link to="/app/paths" className={styles.footerLink}>Curriculum Tracks</Link>
              <Link to="/app/lab" className={styles.footerLink}>Code Playground</Link>
              <Link to="/app/classrooms" className={styles.footerLink}>Classrooms</Link>
              <Link to="/app/showcase" className={styles.footerLink}>Project Showcase</Link>
            </div>

            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Platform</span>
              <span className={styles.footerStaticLink}>In-Browser WebContainer</span>
              <span className={styles.footerStaticLink}>Real-time Pairing</span>
              <span className={styles.footerStaticLink}>Zero Local Config</span>
              <span className={styles.footerStaticLink}>Automated Testing</span>
            </div>

            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Account</span>
              <Link to="/login" className={styles.footerLink}>Log in</Link>
              <Link to="/signup" className={styles.footerLink}>Get started</Link>
              <Link to="/app/dashboard" className={styles.footerLink}>Student Dashboard</Link>
              <Link to="/app/teacher/dashboard" className={styles.footerLink}>Instructor Cockpit</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
