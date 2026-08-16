import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { QUIZ_QUESTIONS } from '@/lib/quiz_questions'
import styles from './SkillCheckPage.module.css'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

export default function SkillCheckPage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const { currentUser, passModule: passAuthenticatedModule } = useAuth()
  const { passModule: passStoredModule, user: storedUser } = useStore()
  const questions = QUIZ_QUESTIONS[moduleId] || []
  const course = PATHS[0]
  const module = course.modules?.find(item => item.id === moduleId)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [responses, setResponses] = useState([])
  const [score, setScore] = useState(0)
  const [finalScore, setFinalScore] = useState(null)

  useEffect(() => {
    setCurrent(0); setSelected(null); setAnswered(false); setResponses([]); setScore(0); setFinalScore(null)
  }, [moduleId])

  if (!questions.length) return <div className={styles.page}><section className={styles.empty}><p className={styles.eyebrow}>Assessment unavailable</p><h1>This module has no review questions yet.</h1><p>Return to the course sequence and continue with the published study entries.</p><Link to="/app/paths">Back to course catalogue <span>→</span></Link></section></div>

  const question = questions[current]
  const resultPercent = finalScore === null ? 0 : Math.round((finalScore / questions.length) * 100)
  const passed = resultPercent >= 70
  const studentName = currentUser?.name || storedUser?.name || 'Student'
  const select = index => {
    if (answered) return
    const correct = Boolean(question.options[index]?.correct)
    setSelected(index); setAnswered(true)
    if (correct) setScore(value => value + 1)
  }
  const next = () => {
    const correct = Boolean(question.options[selected]?.correct)
    const nextResponses = [...responses, { topic: question.topic, correct }]
    if (current + 1 === questions.length) {
      const totalScore = score + (correct ? 1 : 0)
      setResponses(nextResponses)
      setFinalScore(totalScore)
      if (Math.round((totalScore / questions.length) * 100) >= 70) {
        passStoredModule(moduleId)
        if (currentUser) passAuthenticatedModule(moduleId)
      }
      return
    }
    setResponses(nextResponses)
    setCurrent(value => value + 1); setSelected(null); setAnswered(false)
  }
  const restart = () => { setCurrent(0); setSelected(null); setAnswered(false); setResponses([]); setScore(0); setFinalScore(null) }

  if (finalScore !== null) {
    const reviewTopics = responses.filter(item => !item.correct).map(item => item.topic)
    return <div className={styles.page}><section className={styles.result}><p className={styles.eyebrow}>Module review / complete</p><h1>{passed ? 'Assessment record updated.' : 'Further study is recommended.'}</h1><p className={styles.resultLead}>{passed ? `${studentName} demonstrated the required understanding for ${module?.title || moduleId.toUpperCase()}. The module assessment is now recorded in the course transcript.` : `You answered ${resultPercent}% correctly. Return to the relevant study entries, test the examples again, then retake this review when the reasoning is clearer.`}</p><div className={styles.resultScore}><strong>{resultPercent}</strong><span>percent correct</span><p>{finalScore} of {questions.length} questions</p></div><div className={styles.resultRecord}><span>Record</span><p>{passed ? 'Assessment passed · reflected in your transcript' : 'No assessment record added · review remains available'}</p><span>Standard</span><p>70% correct, with each answer explained after selection</p></div>{!passed && reviewTopics.length > 0 && <div className={styles.review}><h2>Return to these concepts</h2><ul>{[...new Set(reviewTopics)].slice(0, 6).map(topic => <li key={topic}>{topic}</li>)}</ul></div>}<footer><button onClick={restart}>Retake this review <span>↺</span></button><Link to="/app/paths">Return to course catalogue <span>→</span></Link></footer></section></div>
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}><div><p className={styles.eyebrow}>Module assessment / {moduleId.toUpperCase()}</p><h1>{module?.title || 'Module review'}</h1><p>Choose the answer you can defend. Feedback appears after each response so that this remains a study assessment, not a memory game.</p></div><div className={styles.standard}><span>Assessment standard</span><b>70% correct</b><p>{questions.length} questions · explained feedback</p></div></header>

      <div className={styles.assessment}>
        <aside className={styles.trace}><p className={styles.eyebrow}>Question trace</p><ol>{questions.map((item, index) => { const response = index < responses.length ? responses[index] : null; return <li key={item.id} className={`${index === current ? styles.traceCurrent : ''} ${response?.correct ? styles.traceCorrect : response ? styles.traceIncorrect : ''}`} aria-current={index === current ? 'step' : undefined}>{String(index + 1).padStart(2, '0')}</li> })}</ol><p>{current + 1} of {questions.length}</p></aside>
        <section className={styles.questionSheet}><header><span>{question.topic || 'Core concept'}</span><span>{question.difficulty || 'Study review'}</span></header><h2>{question.question}</h2>{question.code && <pre><code>{question.code}</code></pre>}<div className={styles.options}>{question.options.map((option, index) => { const correct = option.correct; const chosen = selected === index; const state = answered ? correct ? styles.correct : chosen ? styles.incorrect : '' : ''; return <button key={option.text} className={`${styles.option} ${state}`} onClick={() => select(index)} disabled={answered}><span>{LETTERS[index]}</span><p>{option.text}</p>{answered && correct && <i>Correct</i>}</button> })}</div>{answered && <div className={styles.feedback}><span>{question.options[selected]?.correct ? 'Reasoning holds' : 'Reconsider the boundary'}</span><p>{question.explanation || 'Return to the associated study entry and identify the rule that changes this answer.'}</p></div>}<footer>{answered ? <button onClick={next}>{current + 1 === questions.length ? 'Finish assessment' : 'Continue to next question'} <span>→</span></button> : <p>Select the answer you would be prepared to explain to another student.</p>}</footer></section>
      </div>
    </div>
  )
}
