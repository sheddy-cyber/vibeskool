import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { progressApi } from '@/lib/api'
import { buildPathModel } from '@/lib/learning'
import { QUIZ_QUESTIONS } from '@/lib/quiz_questions'
import { buildAttempt, PASS_MARK } from '@/lib/quiz'
import Icon from '@/components/icons/Icons'
import CodeBlock from '@/components/lesson/CodeBlock'
import styles from './SkillCheckPage.module.css'
import { confirmDialog } from '@/lib/dialog'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const SECONDS_PER_QUESTION = 30

function ScoreRing({ pct, passed, size = 132 }) {
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className={styles.ring} style={{ width: size, height: size }} data-passed={passed}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className={styles.ringTrack} strokeWidth={stroke} />
        {/* pass mark tick */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={styles.ringMark}
          strokeWidth={stroke + 6}
          strokeDasharray={`2 ${c - 2}`}
          strokeDashoffset={-(c * PASS_MARK) / 100 + 1}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={styles.ringValue}
          style={{ '--c': c }}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className={styles.ringLabel}>
        <span className={styles.ringNum}><strong>{pct}</strong>%</span>
      </div>
    </div>
  )
}

function PassMark() {
  return (
    <svg viewBox="0 0 32 32" width="40" height="40" className={styles.passMark} aria-hidden="true">
      <g transform="rotate(-12 16 16)">
        <rect x="5.95" y="9.5" width="5.2" height="13" rx="2.6" fill="#F2553D" />
        <rect x="13.4" y="4" width="5.2" height="24" rx="2.6" fill="#1A73E8" />
        <rect x="20.85" y="7.5" width="5.2" height="17" rx="2.6" fill="#1FA463" />
      </g>
    </svg>
  )
}

export default function SkillCheckPage() {
  const { pathId: paramPathId, moduleId } = useParams()
  const navigate = useNavigate()
  const { paths, fetchPaths, progress, passedModules, fetchProgress } = useStore()

  useEffect(() => { if (!paths?.length) fetchPaths() }, [paths?.length, fetchPaths])

  const pathId = paramPathId || 'full-stack-web'
  const source = QUIZ_QUESTIONS[moduleId] || []

  const [phase, setPhase] = useState('intro') // intro | quiz | results
  const [attemptNo, setAttemptNo] = useState(0)
  const [idx, setIdx] = useState(0)
  const [picks, setPicks] = useState([])
  const [save, setSave] = useState({ state: 'idle' }) // idle | saving | saved | error
  const [openReview, setOpenReview] = useState(() => new Set())
  const nextRef = useRef(null)
  const cardRef = useRef(null)

  // A fresh deal of answer positions for every attempt
  const questions = useMemo(() => buildAttempt(source), [source, attemptNo]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPhase('intro')
    setIdx(0)
    setPicks([])
    setSave({ state: 'idle' })
  }, [moduleId])

  /* Module context */
  const path = (paths || []).find((p) => p.id === pathId)
  const completedIds = useMemo(() => new Set(Object.values(progress || {}).flat()), [progress])
  const passedSet = useMemo(() => new Set(passedModules || []), [passedModules])
  const model = useMemo(() => buildPathModel(path, completedIds, passedSet), [path, completedIds, passedSet])
  const mod = model?.modules.find((m) => m.id === moduleId) || null
  const nextMod = mod ? model.modules.find((m) => m.index === mod.index + 1) : null
  const nextLesson = nextMod?.lessons.find((l) => !l.done) || nextMod?.lessons[0] || null
  const alreadyPassed = passedSet.has(moduleId)
  const modNumber = mod ? mod.index + 1 : Number(String(moduleId).replace(/\D/g, '')) + 1

  /* Scoring */
  const total = questions.length
  const answered = picks.filter((p) => p !== undefined).length
  const correctCount = picks.reduce((n, p, i) => n + (p !== undefined && questions[i]?.options[p]?.correct ? 1 : 0), 0)
  const pct = total ? Math.round((correctCount / total) * 100) : 0
  const passed = pct >= PASS_MARK

  const q = questions[idx]
  const pick = picks[idx]
  const isAnswered = pick !== undefined
  const isLast = idx + 1 >= total

  const choose = useCallback((i) => {
    if (phase !== 'quiz' || picks[idx] !== undefined) return
    setPicks((p) => {
      const n = [...p]
      n[idx] = i
      return n
    })
  }, [phase, picks, idx])

  const advance = useCallback(() => {
    if (picks[idx] === undefined) return
    if (isLast) {
      setPhase('results')
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      setIdx((i) => i + 1)
    }
  }, [picks, idx, isLast])

  // Move focus to the next button once an answer is in, so Enter continues
  useEffect(() => {
    if (isAnswered) nextRef.current?.focus({ preventScroll: true })
  }, [isAnswered, idx])

  // Bring each new question into view on small screens
  useEffect(() => {
    if (phase === 'quiz') cardRef.current?.scrollIntoView({ block: 'nearest' })
  }, [idx, phase])

  // Keys: A–D or 1–4 to answer, Enter or → to continue
  useEffect(() => {
    if (phase !== 'quiz') return
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      const n = q?.options.length || 0
      let i = -1
      if (/^[1-9]$/.test(k)) i = Number(k) - 1
      else if (/^[a-z]$/.test(k)) i = k.charCodeAt(0) - 97
      if (i >= 0 && i < n) { e.preventDefault(); choose(i); return }
      if ((k === 'enter' || k === 'arrowright') && picks[idx] !== undefined) {
        if (k === 'enter' && document.activeElement === nextRef.current) return // the button handles it
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, q, choose, advance, picks, idx])

  /* Save a pass */
  const savePass = useCallback(async () => {
    setSave({ state: 'saving' })
    try {
      await progressApi.passModule(moduleId, pct)
      await fetchProgress()
      setSave({ state: 'saved' })
    } catch (err) {
      setSave({ state: 'error', message: err?.message })
    }
  }, [moduleId, pct, fetchProgress])

  useEffect(() => {
    if (phase === 'results' && passed && save.state === 'idle') savePass()
  }, [phase, passed, save.state, savePass])

  const start = () => {
    setAttemptNo((n) => n + 1)
    setIdx(0)
    setPicks([])
    setSave({ state: 'idle' })
    setOpenReview(new Set())
    setPhase('quiz')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const exit = async () => {
    if (answered > 0 && phase === 'quiz') {
      const ok = await confirmDialog({ title: 'Leave the skill check?', body: `You've answered ${answered} of ${total}. Your answers won't be saved.`, confirmLabel: 'Leave', cancelLabel: 'Keep going' })
      if (!ok) return
    }
    navigate(`/app/paths/${pathId}`)
  }

  /* ── No questions ─────────────────────────────────────────── */
  if (!source.length) {
    return (
      <div className={styles.page}>
        <Link to={`/app/paths/${pathId}`} className={styles.back}><Icon name="arrowLeft" size={15} /> Back to the path</Link>
        <div className={styles.card}>
          <h1 className={styles.title}>This skill check is on its way</h1>
          <p className={styles.lead}>There are no questions for this module yet. Carry on with the lessons in the meantime.</p>
          <div className={styles.actions}>
            <Link to={`/app/paths/${pathId}`} className={styles.btnPrimary}>Back to the path</Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Intro ────────────────────────────────────────────────── */
  if (phase === 'intro') {
    const minutes = Math.max(1, Math.round((total * SECONDS_PER_QUESTION) / 60))
    const lessonsLeft = mod ? mod.total - mod.done : 0
    return (
      <div className={styles.page}>
        <Link to={`/app/paths/${pathId}`} className={styles.back}><Icon name="arrowLeft" size={15} /> {path?.name || 'Back to the path'}</Link>

        <div className={styles.introCard}>
          <div className={styles.introTop}>
            <span className={styles.badgeIcon} aria-hidden="true"><Icon name="checklist" size={24} /></span>
            {alreadyPassed && <span className={styles.passedTag}><Icon name="check" size={14} /> Passed before</span>}
          </div>
          <span className={styles.kicker}>Module {modNumber} skill check</span>
          <h1 className={styles.title}>{mod?.title || 'Skill check'}</h1>
          <p className={styles.lead}>
            {total} questions on what this module covered. Answer each one and you'll see why it's right
            or wrong straight away, so the check teaches as much as it tests.
          </p>

          <dl className={styles.facts}>
            <div><dt><Icon name="list" size={16} /> Questions</dt><dd>{total}</dd></div>
            <div><dt><Icon name="clock" size={16} /> About</dt><dd>{minutes} min</dd></div>
            <div><dt><Icon name="target" size={16} /> To pass</dt><dd>{PASS_MARK}%</dd></div>
          </dl>

          {mod && lessonsLeft > 0 && (
            <p className={styles.notice}>
              You still have {lessonsLeft} {lessonsLeft === 1 ? 'lesson' : 'lessons'} left in this module. You can take
              the check now, but it covers all {mod.total}.
            </p>
          )}
          {alreadyPassed && (
            <p className={styles.notice}>You've passed this before. Retaking it is good practice and won't undo that.</p>
          )}

          <div className={styles.actions}>
            <button type="button" className={`${styles.btnPrimary} ${styles.btnLg}`} onClick={start}>
              Start the skill check <Icon name="arrowRight" size={17} />
            </button>
            <span className={styles.keysHint}>
              Answer with <kbd>A</kbd>–<kbd>D</kbd> or <kbd>1</kbd>–<kbd>4</kbd>, then <kbd>Enter</kbd> to continue
            </span>
          </div>
        </div>
      </div>
    )
  }

  /* ── Results ──────────────────────────────────────────────── */
  if (phase === 'results') {
    const missed = questions.map((qq, i) => ({ qq, i, p: picks[i] })).filter(({ qq, p }) => !qq.options[p]?.correct)
    const toggle = (i) => setOpenReview((s) => {
      const n = new Set(s)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })
    const need = Math.ceil((PASS_MARK / 100) * total)

    return (
      <div className={styles.page}>
        <Link to={`/app/paths/${pathId}`} className={styles.back}><Icon name="arrowLeft" size={15} /> {path?.name || 'Back to the path'}</Link>

        <div className={styles.resultCard} data-passed={passed}>
          <div className={styles.resultMain}>
            <div className={styles.resultText}>
              {passed && <PassMark />}
              <span className={styles.kicker}>Module {modNumber} skill check</span>
              <h1 className={styles.title}>{passed ? 'Passed' : 'Not yet'}</h1>
              <p className={styles.lead}>
                {passed
                  ? `${correctCount} of ${total} right. ${mod?.title || 'This module'} has stuck.`
                  : `${correctCount} of ${total} right. You need ${need} to pass, so ${need - correctCount} more next time.`}
              </p>
              {passed && (
                <p className={styles.saveNote} data-state={save.state} role="status">
                  {save.state === 'saving' && 'Saving your result…'}
                  {save.state === 'saved' && <><Icon name="check" size={14} /> Saved to your progress</>}
                  {save.state === 'error' && (
                    <>We couldn't save this. <button type="button" className={styles.linkBtn} onClick={savePass}>Try again</button></>
                  )}
                </p>
              )}
            </div>
            <ScoreRing pct={pct} passed={passed} />
          </div>

          <div className={styles.dots} aria-label="Your answers">
            {questions.map((qq, i) => {
              const ok = qq.options[picks[i]]?.correct
              return <span key={qq.id} className={styles.dotQ} data-ok={ok} title={`${i + 1}. ${qq.topic}: ${ok ? 'right' : 'wrong'}`} />
            })}
          </div>

          <div className={styles.actions}>
            {passed ? (
              <>
                {nextLesson ? (
                  <Link to={`/app/paths/${pathId}/lessons/${nextLesson.id}`} className={styles.btnPrimary}>
                    Start Module {nextMod.index + 1} <Icon name="arrowRight" size={16} />
                  </Link>
                ) : (
                  <Link to={`/app/paths/${pathId}`} className={styles.btnPrimary}>Back to the path</Link>
                )}
                <button type="button" className={styles.btnGhost} onClick={start}>
                  <Icon name="reset" size={16} /> Retake
                </button>
              </>
            ) : (
              <>
                <button type="button" className={styles.btnPrimary} onClick={start}>
                  <Icon name="reset" size={16} /> Try again
                </button>
                <Link to={`/app/paths/${pathId}`} className={styles.btnGhost}>Review the module</Link>
              </>
            )}
          </div>
        </div>

        {missed.length > 0 && (
          <section className={styles.review} aria-labelledby="review-title">
            <div className={styles.reviewHead}>
              <h2 id="review-title" className={styles.sectionTitle}>Worth another look</h2>
              <p className={styles.sectionSub}>
                {missed.length === 1 ? 'One question' : `${missed.length} questions`} to go over. Each one shows what you picked and why the answer is what it is.
              </p>
            </div>
            <ol className={styles.reviewList}>
              {missed.map(({ qq, i, p }) => {
                const open = openReview.has(i)
                const right = qq.options.find((o) => o.correct)
                return (
                  <li key={qq.id} className={styles.reviewItem} data-open={open}>
                    <button type="button" className={styles.reviewToggle} onClick={() => toggle(i)} aria-expanded={open}>
                      <span className={styles.reviewNum}>{i + 1}</span>
                      <span className={styles.reviewText}>
                        <span className={styles.reviewTopic}>{qq.topic}</span>
                        <span className={styles.reviewQ}>{qq.prompt}</span>
                      </span>
                      <Icon name="chevronDown" size={18} className={styles.chev} />
                    </button>
                    {open && (
                      <div className={styles.reviewBody}>
                        {qq.code && <CodeBlock code={qq.code} />}
                        <div className={styles.compare}>
                          <div data-kind="yours">
                            <span>You picked</span>
                            <p>{qq.options[p]?.text}</p>
                          </div>
                          <div data-kind="right">
                            <span>The answer</span>
                            <p>{right?.text}</p>
                          </div>
                        </div>
                        <p className={styles.why}>{qq.explanation}</p>
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        )}
      </div>
    )
  }

  /* ── Question ─────────────────────────────────────────────── */
  const right = isAnswered && q.options[pick]?.correct

  return (
    <div className={styles.page}>
      <div className={styles.quizBar}>
        <button type="button" className={styles.back} onClick={exit}>
          <Icon name="close" size={15} /> Exit
        </button>
        <span className={styles.quizTitle}>Module {modNumber} skill check</span>
        <span className={styles.count}>{idx + 1} <span>/ {total}</span></span>
      </div>

      <div className={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered} aria-label="Questions answered">
        {questions.map((qq, i) => {
          const p = picks[i]
          const state = p === undefined ? (i === idx ? 'now' : 'todo') : qq.options[p]?.correct ? 'right' : 'wrong'
          return <span key={qq.id} data-state={state} />
        })}
      </div>

      <div className={styles.qCard} ref={cardRef} key={`${attemptNo}-${idx}`}>
        <span className={styles.topic}>{q.topic}</span>
        <h1 className={styles.prompt}>{q.prompt}</h1>
        {q.code && <CodeBlock code={q.code} />}

        <div className={styles.options} role="radiogroup" aria-label="Answers">
          {q.options.map((o, i) => {
            let state = 'idle'
            if (isAnswered) {
              if (o.correct) state = 'right'
              else if (i === pick) state = 'wrong'
              else state = 'dim'
            }
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={pick === i}
                className={styles.option}
                data-state={state}
                onClick={() => choose(i)}
                disabled={isAnswered}
              >
                <span className={styles.letter}>
                  {state === 'right' ? <Icon name="check" size={15} /> : state === 'wrong' ? <Icon name="close" size={15} /> : LETTERS[i]}
                </span>
                <span className={styles.optText}>{o.text}</span>
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <div className={styles.feedback} data-right={right} role="status">
            <span className={styles.fbLabel}>{right ? 'Right.' : `Not quite. The answer is ${LETTERS[q.answer]}.`}</span>
            <p>{q.explanation}</p>
          </div>
        )}

        <div className={styles.qFoot}>
          <span className={styles.keysHint}>
            {isAnswered ? <>Press <kbd>Enter</kbd> to continue</> : <>Pick an answer, or press <kbd>A</kbd>–<kbd>{LETTERS[q.options.length - 1]}</kbd></>}
          </span>
          <button
            ref={nextRef}
            type="button"
            className={styles.btnPrimary}
            onClick={advance}
            disabled={!isAnswered}
          >
            {isLast ? 'See your result' : 'Next question'} <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
