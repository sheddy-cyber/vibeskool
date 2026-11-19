import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useInView, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  ArrowRight,
  Blocks,
  BrainCircuit,
  Check,
  Cpu,
  Gamepad2,
  Menu,
  Smartphone,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEnforceLightTheme } from "@/lib/theme";
import { BrandLogo } from "@/components/ui";
import { LearnerScene, PairingScene, StackArt } from "@/components/art/Illustrations";
import FistBump from "@/components/art/FistBump";
import {
  ExerciseBuilderPreview,
  LessonPreview,
  RosterPreview,
} from "@/components/landing/ProductPreviews";
import { EASE, Item, MaskText, Stagger } from "@/components/landing/Motion";
import styles from "./LandingPage.module.css";

/* ── Content ───────────────────────────────────────────────── */

const NAV_LINKS = [
  { href: "#approach", label: "Our approach" },
  { href: "#paths", label: "Paths" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#tutors", label: "For tutors" },
];

const LESSON_PARTS = [
  {
    title: "The idea",
    body: "Explained in plain English, with only the detail you'll actually use.",
  },
  {
    title: "Try it yourself",
    body: "A short exercise in the terminal or editor, so it sticks.",
  },
  {
    title: "Ask AI",
    body: "A ready-made prompt that shows you how to get a useful answer.",
  },
];

const FEATURED_MODULES = [
  "How the internet actually works",
  "Tooling: your developer workbench",
  "Front-end fundamentals",
  "React fundamentals",
  "Back-end fundamentals",
  "Connecting the stack",
  "Security essentials",
  "Vibecoding: using AI well",
  "Capstone project",
];

const UPCOMING_PATHS = [
  { icon: Smartphone, name: "Mobile apps", desc: "iOS and Android apps with cross-platform tooling." },
  { icon: Gamepad2, name: "Game development", desc: "Game loops, physics and engines." },
  { icon: BrainCircuit, name: "AI & machine learning", desc: "Train models and ship them in real apps." },
  { icon: Blocks, name: "Blockchain & Web3", desc: "Smart contracts and decentralised apps." },
  { icon: Cpu, name: "OS & low-level", desc: "Memory, processes and how computers run code." },
];

const STEPS = {
  learn: [
    {
      title: "Create a free account",
      body: "Choose a path and open the first lesson. There's nothing to download or set up.",
    },
    {
      title: "Write real code from day one",
      body: "Every lesson has an editor right next to it, plus checks that tell you when your code works.",
    },
    {
      title: "Get help when you're stuck",
      body: "Join a tutor's class with a code. They can see where you are and work through it with you in your editor.",
    },
  ],
  teach: [
    {
      title: "Create a classroom",
      body: "You get a join code to share. Students sign up and land straight in your class.",
    },
    {
      title: "See progress as it happens",
      body: "Know which lesson each student is on, and which check they can't get past.",
    },
    {
      title: "Step into their code",
      body: "Open a student's editor and fix the problem together, live, without screen sharing.",
    },
  ],
};

const TUTOR_POINTS = [
  "Share one join code with the whole class",
  "Spot who's stuck before they have to ask",
  "Pair in a student's editor in real time",
  "Write your own exercises with starter code and checks",
];

/* ── Small pieces ──────────────────────────────────────────── */

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: EASE },
};

const revealArt = {
  initial: { opacity: 0, y: 32, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1, ease: EASE },
};

function Segmented({ value, onChange, options, label, tone = "light" }) {
  return (
    <div
      className={`${styles.segmented} ${tone === "soft" ? styles.segmentedSoft : ""}`}
      role="tablist"
      aria-label={label}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={value === opt.value ? styles.segActive : undefined}
          onClick={() => onChange(opt.value)}
        >
          {value === opt.value && (
            <motion.span
              layoutId={`seg-${label}`}
              className={styles.segPill}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <span className={styles.segLabel}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [role, setRole] = useState("learn");
  const [howRole, setHowRole] = useState("learn");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHover, setNavHover] = useState(null);
  const lenisRef = useRef(null);
  const heroRef = useRef(null);
  const howRef = useRef(null);
  const howInView = useInView(howRef, { once: true, margin: "-60px" });
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroVisualY = useTransform(heroProgress, [0, 1], [0, -70]);
  const heroCopyY = useTransform(heroProgress, [0, 1], [0, -24]);

  useEnforceLightTheme();

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: { offset: -72 },
    });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    lenisRef.current?.stop();
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenisRef.current?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const startLearning = () =>
    navigate(currentUser ? "/app/dashboard" : "/signup?role=student");
  const startTeaching = () =>
    navigate(
      !currentUser
        ? "/signup?role=teacher"
        : currentUser.role === "teacher"
          ? "/app/teacher/classrooms"
          : "/app/dashboard"
    );

  const scrollTo = (hash) => {
    setMenuOpen(false);
    const el = document.querySelector(hash);
    if (!el) return;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.start();
      lenis.scrollTo(el, { offset: -72, force: true });
    }
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        {/* ── Header ───────────────────────────────────────── */}
        <header className={`${styles.header} ${scrolled || menuOpen ? styles.headerScrolled : ""}`}>
          <div className={styles.headerInner}>
            <Link to="/" className={styles.brand} aria-label="VibeSkool home">
              <BrandLogo size={26} />
            </Link>

            <nav className={styles.nav} aria-label="Main" onMouseLeave={() => setNavHover(null)}>
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className={styles.navLink}
                  onMouseEnter={() => setNavHover(l.href)}
                  onFocus={() => setNavHover(l.href)}
                  onBlur={() => setNavHover(null)}
                >
                  {navHover === l.href && (
                    <motion.span
                      layoutId="nav-hover"
                      className={styles.navPill}
                      transition={{ type: "spring", stiffness: 520, damping: 42 }}
                    />
                  )}
                  <span className={styles.navLabel}>{l.label}</span>
                </a>
              ))}
            </nav>

            <div className={styles.headerActions}>
              {currentUser ? (
                <Link to="/app/dashboard" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link to="/signin" className={styles.loginLink}>
                    Log in
                  </Link>
                  <Link to="/signup" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>
                    Sign up
                  </Link>
                </>
              )}
              <button
                type="button"
                className={styles.menuBtn}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                id="mobile-menu"
                className={styles.mobileMenu}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {NAV_LINKS.map((l) => (
                  <button key={l.href} type="button" onClick={() => scrollTo(l.href)}>
                    {l.label}
                    <ArrowRight size={16} />
                  </button>
                ))}
                {!currentUser && (
                  <div className={styles.mobileMenuActions}>
                    <Link to="/signin" className={`${styles.btn} ${styles.btnOutline}`}>
                      Log in
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main>
          {/* ── Hero ───────────────────────────────────────── */}
          <section className={styles.hero} ref={heroRef}>
            <div className={`${styles.container} ${styles.heroGrid}`}>
              <motion.div className={styles.heroCopy} style={{ y: heroCopyY }}>
                <MaskText
                  as="h1"
                  onMount
                  className={styles.heroTitle}
                  text="Learn just enough code to build with AI."
                  delay={0.1}
                  stagger={0.06}
                />
                <motion.p
                  className={styles.heroLead}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
                >
                  AI can write the code. You still need to know what to ask for, read
                  what comes back, and fix it when it breaks. We teach exactly that
                  much, with a tutor there when you get stuck.
                </motion.p>

                <motion.div
                  className={styles.roleCard}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.68, ease: EASE }}
                >
                  <Segmented
                    label="hero-role"
                    value={role}
                    onChange={setRole}
                    options={[
                      { value: "learn", label: "I want to learn" },
                      { value: "teach", label: "I want to teach" },
                    ]}
                  />

                  <AnimatePresence mode="wait" initial={false}>
                    {role === "learn" ? (
                      <motion.div
                        key="learn"
                        className={styles.roleBody}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p>
                          Start with <strong>Full Stack Web Development</strong>: nine
                          modules, from how the internet works to shipping your own app.
                        </p>
                        <div className={styles.roleActions}>
                          <button type="button" onClick={startLearning} className={`${styles.btn} ${styles.btnPrimary}`}>
                            Start learning for free
                          </button>
                          <button type="button" onClick={() => scrollTo("#paths")} className={styles.textLink}>
                            See what's inside <ArrowRight size={15} />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="teach"
                        className={styles.roleBody}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p>
                          Create a classroom, share the join code, and follow every
                          student's progress while they work.
                        </p>
                        <div className={styles.roleActions}>
                          <button type="button" onClick={startTeaching} className={`${styles.btn} ${styles.btnPrimary}`}>
                            Create a classroom
                          </button>
                          <button type="button" onClick={() => scrollTo("#tutors")} className={styles.textLink}>
                            How it works for tutors <ArrowRight size={15} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.ul
                  className={styles.heroFacts}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <li><Check size={15} strokeWidth={2.5} /> Free to start</li>
                  <li><Check size={15} strokeWidth={2.5} /> Nothing to install</li>
                  <li><Check size={15} strokeWidth={2.5} /> Lessons of about ten minutes</li>
                </motion.ul>
              </motion.div>

              <motion.div className={styles.heroVisual} style={{ y: heroVisualY }}>
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.25 }}
                  >
                    {role === "learn" ? <LessonPreview /> : <RosterPreview />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ── Approach (minimum effective knowledge) ─────── */}
          <section id="approach" className={styles.section}>
            <div className={`${styles.container} ${styles.approachGrid}`}>
              <div className={styles.approachCopy}>
                <MaskText className={styles.h2} text="The minimum you need. Nothing you don't." />
                <motion.p className={styles.sectionLead} {...reveal}>
                  Every lesson starts by telling you what it's for: enough to read a
                  network error, enough to trace a bug through your app. You learn
                  that much, practise it, then put it to work with AI.
                </motion.p>

                <Stagger as="ol" className={styles.parts} delay={0.15} gap={0.12}>
                  {LESSON_PARTS.map((p, i) => (
                    <Item as="li" key={p.title}>
                      <span className={styles.partNum}>{i + 1}</span>
                      <div>
                        <h3>{p.title}</h3>
                        <p>{p.body}</p>
                      </div>
                    </Item>
                  ))}
                </Stagger>

                <motion.p className={styles.skipNote} {...reveal}>
                  <strong>What we leave out:</strong> syntax drills, puzzles you'd never
                  meet in a real project, and theory that doesn't change what you build.
                </motion.p>
              </div>

              <motion.div className={styles.approachArt} {...revealArt}>
                <LearnerScene className={styles.art} />
              </motion.div>
            </div>
          </section>

          {/* ── Paths ──────────────────────────────────────── */}
          <section id="paths" className={`${styles.section} ${styles.sectionTight}`}>
            <div className={styles.container}>
              <div className={styles.sectionHead}>
                <MaskText className={styles.h2} text="Pick what you want to build" />
                <motion.p className={styles.sectionLead} {...reveal}>
                  Each path is a sequence of short lessons and small projects,
                  in the order you'd actually need them.
                </motion.p>
              </div>

              <motion.article className={styles.featured} {...reveal}>
                <div className={styles.featuredMain}>
                  <StackArt className={styles.stackArt} />
                  <div className={styles.featuredTag}>Open now</div>
                  <h3 className={styles.featuredTitle}>Full Stack Web Development</h3>
                  <p className={styles.featuredDesc}>
                    Build complete web apps, from the page in the browser to the
                    database behind it, and learn to work with AI along the way.
                  </p>
                  <div className={styles.featuredMeta}>
                    <span>9 modules</span>
                    <span aria-hidden="true">·</span>
                    <span>43 lessons</span>
                    <span aria-hidden="true">·</span>
                    <span>Beginner friendly</span>
                  </div>
                  <button type="button" onClick={startLearning} className={`${styles.btn} ${styles.btnDark}`}>
                    Start this path
                  </button>
                </div>

                <Stagger as="ol" className={styles.moduleList} delay={0.2} gap={0.05}>
                  {FEATURED_MODULES.map((m, i) => (
                    <Item as="li" key={m} y={10}>
                      <span className={styles.moduleNum}>{String(i + 1).padStart(2, "0")}</span>
                      {m}
                    </Item>
                  ))}
                </Stagger>
              </motion.article>

              <motion.div className={styles.upcomingHead} {...reveal}>
                <h3>Coming next</h3>
                <span>New paths open as their lessons are finished.</span>
              </motion.div>

              <Stagger className={styles.upcoming} gap={0.07}>
                {UPCOMING_PATHS.map(({ icon: Icon, name, desc }) => (
                  <Item key={name} className={styles.upcomingCard}>
                    <span className={styles.pathIconSoft}><Icon size={18} /></span>
                    <h4>{name}</h4>
                    <p>{desc}</p>
                  </Item>
                ))}
              </Stagger>
            </div>
          </section>

          {/* ── How it works ───────────────────────────────── */}
          <section id="how-it-works" className={`${styles.section} ${styles.sectionSoft}`}>
            <div className={styles.container}>
              <motion.div className={styles.howHead} {...reveal}>
                <MaskText className={styles.h2} text="How it works" />
                <Segmented
                  label="how-role"
                  tone="soft"
                  value={howRole}
                  onChange={setHowRole}
                  options={[
                    { value: "learn", label: "For students" },
                    { value: "teach", label: "For tutors" },
                  ]}
                />
              </motion.div>

              <div className={styles.howGrid} ref={howRef}>
              <AnimatePresence mode="wait" initial={false}>
                <Stagger
                  as="ol"
                  key={howRole}
                  className={styles.steps}
                  gap={0.09}
                  show={howInView}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  {STEPS[howRole].map((s, i) => (
                    <Item as="li" key={s.title} className={styles.step}>
                      <span className={styles.stepNum}>{i + 1}</span>
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </Item>
                  ))}
                </Stagger>
              </AnimatePresence>
              <motion.div className={styles.howArt} {...revealArt}>
                <PairingScene className={styles.art} />
              </motion.div>
              </div>
            </div>
          </section>

          {/* ── Tutors ─────────────────────────────────────── */}
          <section id="tutors" className={styles.section}>
            <div className={styles.container}>
              <motion.div className={styles.tutorBand} {...reveal}>
                <div className={styles.tutorCopy}>
                  <span className={styles.tutorKicker}>For tutors and teachers</span>
                  <MaskText className={styles.tutorTitle} text="Run your whole class from one screen." delay={0.15} />
                  <p className={styles.tutorLead}>
                    Spend the session teaching, not fixing installs. Your students
                    code in the browser and you see exactly where each of them is.
                  </p>
                  <Stagger as="ul" className={styles.tutorList} delay={0.3} gap={0.08}>
                    {TUTOR_POINTS.map((p) => (
                      <Item as="li" key={p} y={10}>
                        <Check size={16} strokeWidth={2.5} />
                        {p}
                      </Item>
                    ))}
                  </Stagger>
                  <div className={styles.tutorActions}>
                    <button type="button" onClick={startTeaching} className={`${styles.btn} ${styles.btnLight}`}>
                      Create a tutor account
                    </button>
                    <span className={styles.tutorNote}>Students join with your code. Nothing to install.</span>
                  </div>
                </div>

                <motion.div
                  className={styles.tutorVisual}
                  initial={{ opacity: 0, y: 40, rotate: 1.5 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1, delay: 0.2, ease: EASE }}
                >
                  <ExerciseBuilderPreview />
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ── Closing CTA ────────────────────────────────── */}
          <section className={styles.closing}>
            <div className={`${styles.container} ${styles.closingInner}`}>
              <MaskText className={styles.closingTitle} text="Your first lesson takes about ten minutes." />
              <motion.p className={styles.closingLead} {...reveal}>Make an account and you'll be writing code straight away.</motion.p>
              <FistBump onLearn={startLearning} onTeach={startTeaching} />
            </div>
          </section>
        </main>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className={styles.footer}>
          <div className={`${styles.container} ${styles.footerGrid}`}>
            <div className={styles.footerBrand}>
              <BrandLogo size={24} />
              <p>Learn just enough code to build with AI, with a tutor in your corner.</p>
            </div>

            <nav className={styles.footerCols} aria-label="Footer">
              <div>
                <h4>Learn</h4>
                <a href="#approach">Our approach</a>
                <a href="#paths">Paths</a>
                <a href="#how-it-works">How it works</a>
                <Link to="/signup?role=student">Create an account</Link>
              </div>
              <div>
                <h4>Teach</h4>
                <a href="#tutors">For tutors</a>
                <Link to="/signup?role=teacher">Create a classroom</Link>
              </div>
              <div>
                <h4>Account</h4>
                <Link to="/signin">Log in</Link>
                <Link to="/signup">Sign up</Link>
              </div>
            </nav>
          </div>

          <div className={`${styles.container} ${styles.footerBottom}`}>
            <span>© {new Date().getFullYear()} VibeSkool</span>
            <div>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
