import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import styles from './SkillCheckPage.module.css'

const QUESTIONS = [
  {
    id: 1,
    topic: `JavaScript Functions`,
    question: `You see this in AI-generated code:\n\nfunction calculateTotal(price, tax)\n\nWhat does this line do?`,
    code: `function calculateTotal(price, tax)`,
    options: [
      { text: `It runs a calculation immediately when the page loads`, correct: false },
      { text: `It defines a reusable block of code that takes two inputs`, correct: true },
      { text: `It stores the number 0 in a variable called calculateTotal`, correct: false },
      { text: `It imports a math library from the internet`, correct: false },
    ],
    explanation: `A function declaration defines what to do when called — it doesn't run anything yet. The name is calculateTotal, and price and tax are its parameters (the inputs it needs). This is the most common pattern in any AI-generated codebase.`,
  },
  {
    id: 2,
    topic: `HTML Structure`,
    question: `What is the correct relationship between these two HTML elements?`,
    code: `<div>\n  <p>Hello world</p>\n</div>`,
    options: [
      { text: `They are siblings — two elements at the same level`, correct: false },
      { text: `The p is the parent and the div is the child`, correct: false },
      { text: `The div is the parent and the p is the child (nested inside it)`, correct: true },
      { text: `They are duplicates of the same element`, correct: false },
    ],
    explanation: `When an element sits inside another, the outer one is the parent and the inner one is the child. Reading this nesting is the core skill for understanding any AI-generated HTML.`,
  },
  {
    id: 3,
    topic: `Variables`,
    question: `What is the difference between let and const in JavaScript?`,
    code: `let name = "Shedrach"\nconst age = 25`,
    options: [
      { text: `let is for numbers, const is for text`, correct: false },
      { text: `There is no difference — they do the same thing`, correct: false },
      { text: `const variables cannot be reassigned; let variables can`, correct: true },
      { text: `const runs faster than let`, correct: false },
    ],
    explanation: `const means the variable's value is locked after assignment — AI uses it for things that shouldn't change. let means the value can be updated later. When you see const in AI code, you know that value is meant to stay fixed.`,
  },
  {
    id: 4,
    topic: `APIs`,
    question: `What does this line of code do?`,
    code: `fetch("https://api.example.com/users")`,
    options: [
      { text: `It saves a user to the database`, correct: false },
      { text: `It makes a request to get data from an external URL`, correct: true },
      { text: `It opens a new browser tab to that URL`, correct: false },
      { text: `It deletes all users from the API`, correct: false },
    ],
    explanation: `fetch() is how JavaScript requests data from an API. By default it's a GET request — asking the server to send you something. When AI generates API calls, fetch() (or its cousin axios) is almost always what it uses.`,
  },
  {
    id: 5,
    topic: `Reading AI Code`,
    question: `AI gives you this error. What does it mean?\n\nTypeError: Cannot read properties of undefined (reading 'name')`,
    options: [
      { text: `Your computer doesn't have permission to read the file`, correct: false },
      { text: `The variable you're trying to read a property from doesn't exist yet`, correct: true },
      { text: `The word 'name' is a reserved keyword in JavaScript`, correct: false },
      { text: `There is a typo in the word "properties"`, correct: false },
    ],
    explanation: `This error means you're trying to access .name on something that is undefined (doesn't exist). The fix: check that the variable is defined and has data before accessing its properties. This is one of the most common AI code errors you'll encounter.`,
  },
]

export default function SkillCheckPage() {
  const navigate = useNavigate()
  const [current, setCurrent]   = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore]       = useState(0)
  const [done, setDone]         = useState(false)
  const [answers, setAnswers]   = useState([])

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

  if (done) {
    const passed = pct >= 60
    return (
      <div className={styles.page}>
        <div className={styles.results + ' animate-fade-in'}>
          <div className={styles.resultIcon} style={{
            background: passed ? 'var(--accent-dim)' : 'var(--red-dim)',
            border: `1px solid ${passed ? 'var(--accent-border)' : 'var(--red-border)'}`,
          }}>
            {passed
              ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            }
          </div>
          <h1 className={styles.resultTitle}>
            {passed ? 'You\'re ready to build.' : 'Keep going — you\'re close.'}
          </h1>
          <div className={styles.scoreCircle} data-passed={passed}>
            <span className={styles.scoreNum}>{pct}%</span>
            <span className={styles.scoreLabel}>{score}/{QUESTIONS.length} correct</span>
          </div>
          <p className={styles.resultSub}>
            {passed
              ? `You have enough knowledge to effectively direct AI in these topics. Open a lesson that interests you and start building.`
              : `You got ${QUESTIONS.length - score} questions wrong. Review those topics in the lesson pages and try again.`}
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
            <Button onClick={restart} variant="secondary">Try again</Button>
            {passed && (
              <Button onClick={() => navigate('/app/paths')}>
                Back to Paths →
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header + ' animate-fade-in'}>
        <div>
          <h1 className={styles.title}>Skill Check</h1>
          <p className={styles.sub}>10 minutes. Prove you know enough to build with AI.</p>
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
      </div>

      {/* Question card */}
      <div className={styles.questionCard + ' animate-fade-in'} key={current}>
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
      </div>
    </div>
  )
}
