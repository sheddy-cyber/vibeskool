import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore, LESSONS_CONTENT, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { CodeBlock } from '@/components/ui'
import FriendlyTerminal from '@/components/terminal/FriendlyTerminal'
import styles from './LessonPage.module.css'

export default function LessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { progress, completeLesson } = useStore()
  const { currentUser, completeLesson: completeAuthenticatedLesson } = useAuth()
  const [explanation, setExplanation] = useState('')
  const [tested, setTested] = useState(false)
  const [copied, setCopied] = useState(false)
  const [completeNotice, setCompleteNotice] = useState(false)

  const lesson = LESSONS_CONTENT[id] || {
    id: id || 'intro', pathId: 'full-stack-web', title: 'Internet Protocols and Request Lifecycle', duration: '10 min', part: 'M0: Internet', mekLabel: 'Trace a request from browser to server and back.',
    sections: [{ heading: 'The core mental model', body: 'A web interaction begins with a client request sent to a host. A domain is resolved through DNS, and the request is routed to an application server that returns a response.', callout: 'AI can write a route, but it cannot infer your network boundary unless you state it.', code: 'const response = await fetch("https://api.example.edu/health");\nconst result = await response.json();\nconsole.log(result.status);' }],
    aiPrompt: 'Explain the request boundary, expected response shape, status codes, and failure handling before proposing implementation.', terminalMission: 'Run a small command and observe what the terminal reports.'
  }
  const path = PATHS.find(item => item.id === (lesson.pathId || 'full-stack-web')) || PATHS[0]
  const foundIndex = path.lessons_data?.findIndex(item => item.id === lesson.id) ?? 0
  const currentIndex = foundIndex < 0 ? 0 : foundIndex
  const previous = currentIndex > 0 ? path.lessons_data[currentIndex - 1] : null
  const next = currentIndex < path.lessons_data.length - 1 ? path.lessons_data[currentIndex + 1] : null
  const done = (progress[path.id] || 0) > currentIndex
  const canComplete = done || (tested && explanation.trim().length >= 24)

  const copyPrompt = () => {
    navigator.clipboard?.writeText(lesson.aiPrompt || '')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  const markComplete = () => {
    if (!canComplete) return
    if (!done) {
      completeLesson(path.id, currentIndex)
      if (currentUser) completeAuthenticatedLesson(path.id, currentIndex)
    }
    setCompleteNotice(true)
    window.setTimeout(() => setCompleteNotice(false), 2500)
  }

  return (
    <div className={styles.page}>
      <header className={styles.crumbs}><Link to="/app/paths">Course catalogue</Link><span> / </span><Link to="/app/paths">{path.name}</Link><span> / </span><b>{lesson.part || 'Module'}</b><span className={styles.lessonCount}>Lesson {String(currentIndex + 1).padStart(2, '0')} of {path.lessons_data.length}</span></header>

      <div className={styles.layout}>
        <article className={styles.reading}>
          <header className={styles.lessonHead}><p className={styles.eyebrow}>Study entry / {lesson.duration || '10 min'}</p><h1>{lesson.title}</h1><p className={styles.abstract}>{lesson.mekLabel || 'Build a durable mental model before asking an AI to implement it.'}</p></header>

          <aside className={styles.claim}><span>[ learning claim ]</span><p>By the end of this entry, you should be able to describe the relevant boundary, name the important constraint, and recognise what evidence would test your explanation.</p></aside>

          <div className={styles.content}>{lesson.sections?.map((section, index) => <section className={styles.section} key={`${section.heading}-${index}`}><div className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</div><div><h2>{section.heading}</h2>{section.body && <p className={styles.body}>{section.body}</p>}{section.callout && <aside className={styles.note}><span>Margin note</span><p>{section.callout}</p></aside>}{section.code && <CodeBlock code={section.code} filename={`lesson-${String(currentIndex + 1).padStart(2, '0')}.js`} />}</div></section>)}</div>

          {lesson.aiPrompt && <section className={styles.prompt}><header><div><p className={styles.eyebrow}>After manual understanding</p><h2>Prompt with constraints.</h2></div><button onClick={copyPrompt}>{copied ? 'Copied' : 'Copy prompt'} <span>→</span></button></header><pre>{lesson.aiPrompt}</pre><p>Do not treat this as an answer key. State the boundaries and verification criteria before you ask for code.</p></section>}

          <section className={styles.practice}><header><p className={styles.eyebrow}>Practice record</p><h2>Run something small<br />and inspect the result.</h2><p>{lesson.terminalMission || 'Use the controlled terminal to make the lesson’s behaviour observable.'}</p></header><FriendlyTerminal mission={lesson.terminalMission} /></section>
        </article>

        <aside className={styles.rail}>
          <div className={styles.railStatus}><p className={styles.eyebrow}>Entry status</p><div><strong>{done ? 'Recorded' : 'In progress'}</strong><span>{lesson.duration || '10 min'} reading and practice</span></div></div>
          <div className={styles.completion}><p className={styles.eyebrow}>Before completion</p><h2>Leave an explanation.</h2><label htmlFor="lesson-explanation">In your own words, what does this lesson change or protect?</label><textarea id="lesson-explanation" value={explanation} onChange={event => setExplanation(event.target.value)} placeholder="A concise explanation is enough. Be specific about the boundary, rule, or test." /><label className={styles.check}><input type="checkbox" checked={tested} onChange={event => setTested(event.target.checked)} /><span>I ran, inspected, or otherwise verified an example.</span></label><button className={canComplete ? styles.ready : ''} disabled={!canComplete} onClick={markComplete}>{done ? 'Completion recorded' : 'Mark as explained'} <span>→</span></button>{!done && <p className={styles.requirement}>Write at least a short explanation and confirm a verification step to complete this entry.</p>}</div>
          <nav className={styles.entryNav} aria-label="Lesson sequence">{previous ? <Link to={`/app/lesson/${previous.id}`}><span>Previous</span>{previous.title}</Link> : <span />}{next ? <Link to={`/app/lesson/${next.id}`}><span>Next</span>{next.title}</Link> : <span />}</nav>
        </aside>
      </div>

      {completeNotice && <div className={styles.notice} role="status">Study record updated. Continue only when you can still explain the work.</div>}
    </div>
  )
}
