import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Copy, Plus, UserRound } from "lucide-react";
import styles from "./ProductPreviews.module.css";

/* Hand-built product previews for the landing page.
   They mirror real screens (lesson, classroom roster, exercise builder)
   and are presentational only. */

function CodeLines({ lines }) {
  return (
    <pre className={styles.code}>
      {lines.map((line, i) => (
        <div key={i} className={styles.codeLine}>
          <span className={styles.lineNo}>{i + 1}</span>
          <code>
            {line.map(([cls, text], j) => (
              <span key={j} className={cls ? styles[cls] : undefined}>
                {text}
              </span>
            ))}
          </code>
        </div>
      ))}
    </pre>
  );
}

/* Real lessons from the Full Stack path: each one states the minimum it teaches. */
const LESSONS = [
  {
    module: "How the internet works",
    lesson: "HTTP status codes",
    duration: "9 min",
    goal: "read network errors and understand what the browser is telling you.",
    cmd: "curl -I https://example.com/nope",
    out: [["HTTP/2 ", ""], ["404", "err"]],
    prompt: "I'm getting a 404 when I visit my site. Explain what it means in plain English and give me a checklist of what to check first.",
    note: "Nice. Now try it on your own project's URL.",
  },
  {
    module: "Tooling",
    lesson: "Git fundamentals",
    duration: "11 min",
    goal: "save snapshots of your work and never lose progress again.",
    cmd: 'git commit -m "first commit"',
    out: [["[main 3f2a91c] ", ""], ["first commit", "ok"]],
    prompt: "Walk me through my first commit and creating a branch. Explain what each command does before I run it.",
    note: "Good habit. Commit before you ask AI for big changes.",
  },
  {
    module: "Tooling",
    lesson: "Project structure & npm",
    duration: "8 min",
    goal: "find your way around any AI-generated project without getting lost.",
    cmd: "npm init -y",
    out: [["Wrote to ", ""], ["package.json", "ok"]],
    prompt: "Explain what each field in my package.json means, using my own project as the example.",
    note: "Now find the start script and run it.",
  },
  {
    module: "Back-end fundamentals",
    lesson: "REST & environment variables",
    duration: "9 min",
    goal: "design clean APIs and keep secrets out of your source code.",
    cmd: "curl localhost:4000/api/config",
    out: [['{ "port": ', ""], ['"4000"', "ok"], [" }", ""]],
    prompt: "Write Express routes for a tasks resource, and load the port from process.env instead of hard-coding it.",
    note: "Add .env to your .gitignore before you push.",
  },
  {
    module: "Vibecoding",
    lesson: "Reading AI output critically",
    duration: "11 min",
    goal: "check AI-written code for security holes, made-up APIs and logic bugs.",
    cmd: "node checkout.test.js",
    out: [["✗ ", "err"], ["total skips the last item", ""]],
    prompt: "Show me an AI-written function with a subtle off-by-one bug, then explain how to spot it and fix it.",
    note: "Good catch. That's the one most people miss.",
  },
];

const SLIDE_MS = 6500;
const ease = [0.22, 1, 0.36, 1];

function useTypewriter(text, run, speed = 34) {
  const [n, setN] = useState(run ? 0 : text.length);
  useEffect(() => {
    if (!run) {
      setN(text.length);
      return undefined;
    }
    setN(0);
    let i = 0;
    let timer;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < text.length) timer = setTimeout(tick, speed + Math.random() * 30);
    };
    timer = setTimeout(tick, 450);
    return () => clearTimeout(timer);
  }, [text, run, speed]);
  return [text.slice(0, n), n >= text.length];
}

function Words({ text, reduce }) {
  return (
    <span aria-hidden="true">
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          className={styles.word}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, delay: i * 0.035, ease }}
        >
          {w + " "}
        </motion.span>
      ))}
    </span>
  );
}

export function LessonPreview() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef(null);
  const lesson = LESSONS[index];
  const running = !paused && visible;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % LESSONS.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, running]);

  const [typed, typedDone] = useTypewriter(lesson.cmd, !reduce);

  return (
    <div
      ref={rootRef}
      className={styles.stage}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.window}>
        <div className={styles.windowBar}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              className={styles.crumbs}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <span>{lesson.module}</span>
              <span className={styles.crumbSep}>/</span>
              <span className={styles.crumbCurrent}>{lesson.lesson}</span>
            </motion.div>
          </AnimatePresence>
          <span className={styles.duration}>{lesson.duration}</span>
        </div>

        <div className={styles.goal}>
          <span className={styles.goalLabel}>You'll learn enough to</span>
          <p className={styles.goalText}>
            <span className="sr-only">{lesson.goal}</span>
            <Words key={index} text={lesson.goal} reduce={reduce} />
          </p>
          <div className={styles.progress} role="tablist" aria-label="Example lessons">
            {LESSONS.map((l, i) => (
              <button
                key={l.lesson}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={l.lesson}
                className={styles.progressSeg}
                onClick={() => setIndex(i)}
              >
                <span
                  key={i === index ? `active-${index}` : `idle-${i}`}
                  className={styles.progressFill}
                  data-state={i < index ? "done" : i === index ? "active" : "todo"}
                  style={{ "--dur": `${SLIDE_MS}ms`, "--play": running ? "running" : "paused" }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.lessonBlock}>
          <span className={styles.blockTitle}>Try it</span>
          <pre className={styles.terminal}>
            <div className={styles.termLine}>
              <span className={styles.prompt}>$</span>
              {typed}
              {!typedDone && <span className={styles.caret} />}
            </div>
            <motion.div
              key={index}
              className={styles.termOut}
              initial={{ opacity: 0 }}
              animate={{ opacity: typedDone ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {lesson.out.map(([t, kind], i) => (
                <span key={i} className={kind === "err" ? styles.termErr : kind === "ok" ? styles.termOk : undefined}>
                  {t}
                </span>
              ))}
            </motion.div>
          </pre>
        </div>

        <div className={styles.lessonBlock}>
          <div className={styles.blockHead}>
            <span className={styles.blockTitle}>Ask AI</span>
            <span className={styles.copyChip}>
              <Copy size={12} strokeWidth={2.25} /> Copy prompt
            </span>
          </div>
          <div className={styles.aiPrompt}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, delay: 0.1, ease }}
              >
                "{lesson.prompt}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.div
        className={styles.note}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9, ease }}
      >
        <span className={`${styles.avatar} ${styles.avatarGreen}`}>AO</span>
        <div>
          <div className={styles.noteMeta}>
            <strong>Amara</strong> <span>Tutor</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
            >
              {lesson.note}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

const ROSTER = [
  { initials: "JM", name: "Jide M.", lesson: "Loops over arrays", progress: 100, status: "done" },
  { initials: "SK", name: "Sara K.", lesson: "Loops over arrays", progress: 66, status: "stuck", detail: "Stuck on check 2" },
  { initials: "TN", name: "Tomi N.", lesson: "Functions", progress: 80, status: "working" },
  { initials: "LB", name: "Leah B.", lesson: "Loops over arrays", progress: 33, status: "working" },
];

const STATUS_LABEL = { done: "Done", working: "Working", stuck: "Needs help" };

export function RosterPreview() {
  return (
    <div className={styles.stage}>
      <div className={styles.window}>
        <div className={styles.rosterHead}>
          <div>
            <div className={styles.rosterTitle}>Evening class</div>
            <div className={styles.rosterSub}>12 students · 9 online</div>
          </div>
          <div className={styles.joinCode}>
            <span>Join code</span>
            <code>WEB-EVE-24</code>
          </div>
        </div>

        <ul className={styles.roster}>
          {ROSTER.map((s) => (
            <li key={s.name} className={s.status === "stuck" ? styles.rowFlag : undefined}>
              <span className={styles.avatar}>{s.initials}</span>
              <div className={styles.rosterMain}>
                <div className={styles.rosterName}>{s.name}</div>
                <div className={styles.rosterLesson}>{s.detail || s.lesson}</div>
              </div>
              <div className={styles.bar} aria-hidden="true">
                <span style={{ width: `${s.progress}%` }} data-status={s.status} />
              </div>
              {s.status === "stuck" ? (
                <span className={styles.joinBtn}>Open editor</span>
              ) : (
                <span className={styles.status} data-status={s.status}>
                  {STATUS_LABEL[s.status]}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className={`${styles.note} ${styles.noteRight}`}>
        <span className={`${styles.avatar} ${styles.avatarAmber}`}>SK</span>
        <div>
          <div className={styles.noteMeta}>
            <strong>Sara K.</strong> <span>asked for help</span>
          </div>
          <p>My total keeps coming out as NaN and I can't see why.</p>
        </div>
      </div>
    </div>
  );
}

const EX_CODE = [
  [["kw", "function"], ["", " "], ["fn", "reverseWords"], ["", "(sentence) {"]],
  [["", "  "], ["cm", "// your code here"]],
  [["", "}"]],
];

export function ExerciseBuilderPreview() {
  return (
    <div className={styles.builder}>
      <div className={styles.builderHead}>
        <span className={styles.builderLabel}>New exercise</span>
        <span className={styles.builderTitle}>Reverse the words in a sentence</span>
      </div>

      <div className={styles.builderSection}>
        <span className={styles.builderSectionTitle}>Starter code</span>
        <CodeLines lines={EX_CODE} />
      </div>

      <div className={styles.builderSection}>
        <span className={styles.builderSectionTitle}>Checks</span>
        <ul className={styles.testList}>
          {[
            ['reverseWords("hello world")', '"world hello"'],
            ['reverseWords("one")', '"one"'],
            ['reverseWords("")', '""'],
          ].map(([call, result], i) => (
            <motion.li
              key={call}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.15, ease }}
            >
              <code>{call}</code>
              <span className={styles.arrow}>→</span>
              <code>{result}</code>
            </motion.li>
          ))}
        </ul>
        <span className={styles.addCheck}>
          <Plus size={13} strokeWidth={2.5} /> Add check
        </span>
      </div>

      <div className={styles.builderFoot}>
        <span className={styles.assignTo}>
          <UserRound size={13} /> Evening class
        </span>
        <span className={styles.assignBtn}>Assign</span>
      </div>
    </div>
  );
}
