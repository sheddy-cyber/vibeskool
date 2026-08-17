import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useStore, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { QUIZ_QUESTIONS } from '@/lib/quiz_questions'
import styles from './SkillCheckPage.module.css'
import { FadeUp, ScaleIn } from '@/components/ui/Motion'

export default function SkillCheckPage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const { currentUser, passModule: authPassModule } = useAuth()
  const { passModule: storePassModule } = useStore()

  const QUESTIONS = QUIZ_QUESTIONS[moduleId] || []

  const [current, setCurrent]   = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore]       = useState(0)
  const [done, setDone]         = useState(false)
  const [answers, setAnswers]   = useState([])

  // Reset state if moduleId changes
  useEffect(() => {
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setDone(false)
    setAnswers([])
  }, [moduleId])

  if (!QUESTIONS.length) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2>Test Coming Soon</h2>
          <p>No quiz found for module ID "{moduleId}".</p>
          <Button onClick={() => navigate('/app/paths')}>← Back to Paths</Button>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[current]

  function answer(opt, idx) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    const correct = opt.correct
    if (correct) setScore(s => s + 1)
    setAnswers(prev => [...prev, { question: q.topic, correct }])
  }

  function next() {
    if (current + 1 >= QUESTIONS.length) {
      setDone(true)
      const finalScore = score + (q.options[selected]?.correct ? 1 : 0)
      const pct = Math.round((finalScore / QUESTIONS.length) * 100)
      if (pct >= 70) {
        storePassModule(moduleId)
        if (currentUser) {
          authPassModule(moduleId)
        }
      }
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  function restart() {
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setDone(false)
    setAnswers([])
  }

  const pct = Math.round((score / QUESTIONS.length) * 100)
  const passed = pct >= 70

  const path = PATHS.find(p => p.id === 'full-stack-web')
  const currentModule = path?.modules.find(m => m.id === moduleId)
  const currentModIdx = path?.modules.findIndex(m => m.id === moduleId) ?? -1
  const nextMod = path?.modules[currentModIdx + 1]
  const nextModLessons = nextMod ? path.lessons_data.filter(l => l.part?.startsWith(nextMod.id.replace('m', 'M') + ':')) : []
  const nextLessonId = nextModLessons[0]?.id

  if (done) {
    return (
      <div className={styles.page}>
        <ScaleIn delay={0}><div className={styles.results}>
          <div className={styles.resultIcon} style={{
            background: passed ? 'var(--green-dim)' : 'var(--red-dim)',
            border: `1px solid ${passed ? 'var(--green-border)' : 'var(--red-border)'}`,
          }}>
            {passed
              ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            }
          </div>
          <h1 className={styles.resultTitle}>
            {passed ? 'Module unlocked!' : 'Keep reviewing — you\'re close.'}
          </h1>
          <div className={styles.scoreCircle} data-passed={passed} style={{ borderColor: passed ? 'var(--green)' : 'var(--red)' }}>
            <span className={styles.scoreNum} style={{ color: passed ? 'var(--green)' : 'var(--red)' }}>{pct}%</span>
            <span className={styles.scoreLabel}>{score}/{QUESTIONS.length} correct</span>
          </div>
          <p className={styles.resultSub}>
            {passed
              ? `Congratulations! You scored ${pct}% and earned +10 MEK points! You have unlocked the next module's curriculum.`
              : `You got ${QUESTIONS.length - score} questions wrong (requires 70% or 14/20 to pass). Review the lessons in this module and try again.`}
          </p>
          <div className={styles.answerSummary}>
            {answers.map((a, i) => (
              <div key={i} className={`${styles.answerRow} ${a.correct ? styles.correct : styles.wrong}`}>
                <span style={{display:'flex',alignItems:'center'}}>
                  {a.correct
                    ? <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="3" x2="9" y2="9"/><line x1="9" y1="3" x2="3" y2="9"/></svg>
                  }
                </span>
                <span>{a.question}</span>
              </div>
            ))}
          </div>
          <div className={styles.resultActions}>
            {passed ? (
              nextLessonId ? (
                <Button onClick={() => navigate(`/app/lesson/${nextLessonId}`)} variant="primary">
                  Start Module {nextMod.id.replace('m', '')} →
                </Button>
              ) : (
                <Button onClick={() => navigate('/app/paths')} variant="teal">
                  Back to Paths ✓
                </Button>
              )
            ) : (
              <>
                <Button onClick={restart} variant="secondary">Try again</Button>
                <Button onClick={() => navigate('/app/paths')} variant="secondary">
                  Back to Paths
                </Button>
              </>
            )}
          </div>
        </div></ScaleIn>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <FadeUp delay={0}><div className={styles.header}>
        <div>
          <span className={styles.moduleTag}>Module {moduleId.replace('m', '')} Test</span>
          <h1 className={styles.title}>{currentModule?.title || 'Skill Check'}</h1>
          <p className={styles.sub}>20 questions. Score 70% (14/20) or higher to unlock the next module.</p>
        </div>
        <div className={styles.progress}>
          <span className={styles.progressNum}>{current + 1} / {QUESTIONS.length}</span>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div></FadeUp>

      {/* Question card */}
      <ScaleIn delay={60} key={current}><div className={styles.questionCard}>
        <div className={styles.topicBadge}>{q.topic}</div>
        <p className={styles.question}>{q.question.split('\n\n')[0]}</p>
        {q.code && (
          <pre className={styles.questionCode}>{q.code}</pre>
        )}

        <div className={styles.options}>
          {q.options.map((opt, i) => {
            let cls = styles.option
            if (answered) {
              if (opt.correct)          cls += ` ${styles.optCorrect}`
              else if (i === selected)  cls += ` ${styles.optWrong}`
              else                      cls += ` ${styles.optDim}`
            }
            return (
              <button key={i} className={cls} onClick={() => answer(opt, i)} disabled={answered}>
                <span className={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
                <span>{opt.text}</span>
              </button>
            )
          })}
        </div>

        {answered && (
          <div className={`${styles.explanation} ${q.options[selected]?.correct ? styles.expCorrect : styles.expWrong}`}>
            <span className={styles.expIcon}>
              {q.options[selected]?.correct
                ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                : <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="3" x2="9" y2="9"/><line x1="9" y1="3" x2="3" y2="9"/></svg>
              }
            </span>
            <p>{q.explanation}</p>
          </div>
        )}

        {answered && (
          <div className={styles.nextRow}>
            <Button onClick={next} variant={current + 1 >= QUESTIONS.length ? 'teal' : 'primary'}>
              {current + 1 >= QUESTIONS.length ? 'See results →' : 'Next question →'}
            </Button>
          </div>
        )}
      </div></ScaleIn>
    </div>
  )
}
