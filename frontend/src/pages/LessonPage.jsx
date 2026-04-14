import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, LESSONS_CONTENT, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { Button, MEKBar, CodeBlock, Callout, AiPromptBox } from '@/components/ui'
import FriendlyTerminal from '@/components/terminal/FriendlyTerminal'
import styles from './LessonPage.module.css'
import { FadeUp, RevealOnScroll, StaggerGroup } from '@/components/ui/Motion'

// ─── Inline conversation box ──────────────────────────────────────────────────
function InlineChat({ lesson }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const sys = `You are a patient, clear teaching assistant on VibeSkool. The student just read a lesson called "${lesson.title}" which covered: ${lesson.sections.map(s => s.heading).join(', ')}. Answer like a teacher taking questions after class — focused, concise, friendly. Keep replies under 150 words unless a code example is needed.`

      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 500,
          system: sys,
          messages: history,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const reply = data?.content?.[0]?.text || 'Something went wrong — try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Could not reach AI: ${e.message || 'unknown error'}. Make sure you have a valid Anthropic API key configured.`,
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className={styles.chat}>
      <div className={styles.chatHeader}>
        <div className={styles.chatTitle}>Got a question about this lesson?</div>
        <div className={styles.chatSub}>Ask below — AI will answer like a teacher. (Enter to send)</div>
      </div>

      {messages.length > 0 && (
        <div className={styles.chatMessages}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.chatMsg} ${styles[`chatMsg-${m.role}`]}`}>
              <span className={styles.chatAvatar}>{m.role === 'assistant' ? 'AI' : 'You'}</span>
              <div className={styles.chatBubble}>
                {m.content.split('\n').filter(Boolean).map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.chatMsg} ${styles['chatMsg-assistant']}`}>
              <span className={styles.chatAvatar}>AI</span>
              <div className={`${styles.chatBubble} ${styles.chatThinking}`}>
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div className={styles.chatInput}>
        <textarea
          className={styles.chatTextarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything about this lesson..."
          rows={2}
          disabled={loading}
        />
        <button
          className={styles.chatSend}
          onClick={send}
          disabled={loading || !input.trim()}
        >
          {loading ? '…' : 'Ask'}
        </button>
      </div>
    </div>
  )
}

// ─── Part badge colours ───────────────────────────────────────────────────────
const PART_COLORS = { Before: 'var(--amber)', During: 'var(--accent)', After: 'var(--green)' }

// ─── Main lesson page ─────────────────────────────────────────────────────────
export default function LessonPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { completeLesson, progress: storeProgress, settings } = useStore()
  const { currentUser, updateProgress } = useAuth()
  // Merge auth progress with store progress (auth wins when logged in)
  const progress = currentUser?.progress || storeProgress
  const [completed, setCompleted] = useState(false)
  const [showLab, setShowLab]     = useState(false)

  const lesson = LESSONS_CONTENT[id]

  if (!lesson) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2>Lesson coming soon</h2>
          <p>This lesson is being written. Check back shortly.</p>
          <Button onClick={() => navigate('/app/paths')}>← Back to Paths</Button>
        </div>
      </div>
    )
  }

  const path        = PATHS.find(p => p.id === lesson.pathId)
  const pathDone    = progress[lesson.pathId] || 0
  const pathTotal   = path?.lessons_data.length || 1
  const mekPct      = Math.min(100, Math.round((pathDone / pathTotal) * 100) + (completed ? 4 : 0))
  const lessonIdx   = path?.lessons_data.findIndex(l => l.id === id) ?? -1
  const nextLesson  = path?.lessons_data[lessonIdx + 1]
  const prevLesson  = lessonIdx > 0 ? path?.lessons_data[lessonIdx - 1] : null
  const partColor   = lesson.part ? PART_COLORS[lesson.part] : 'var(--accent)'

  function handleComplete() {
    if (!completed) {
      completeLesson(lesson.pathId)
      if (currentUser) updateProgress(lesson.pathId)
      setCompleted(true)
    }
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/paths')}>← Back</Button>
        <div className={styles.breadcrumb}>
          <span className={styles.bcrPath}>{path?.name}</span>
          <span className={styles.bcrSep}>›</span>
          {lesson.part && (
            <>
              <span className={styles.partBadge} style={{ color: partColor, borderColor: partColor }}>
                {lesson.part}
              </span>
              <span className={styles.bcrSep}>›</span>
            </>
          )}
          <span className={styles.bcrLesson}>{lesson.title}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.duration}>{lesson.duration}</span>
          {!completed
            ? <Button variant="teal" size="sm" onClick={handleComplete}>Mark complete</Button>
            : <span className={styles.doneBadge}>✓ Done</span>
          }
        </div>
      </div>

      {/* MEK bar */}
      {settings?.showMekBar !== false && (
        <MEKBar score={mekPct} label={lesson.mekLabel} />
      )}

      {/* Lesson content */}
      <div className={styles.content}>
        <FadeUp delay={80}><h1 className={styles.lessonTitle}>{lesson.title}</h1></FadeUp>

        <StaggerGroup stagger={90} baseDelay={160}>
        {lesson.sections.map((sec, i) => (
          <div key={i} className={styles.section}>
            <h2 className={styles.sectionHeading}>{sec.heading}</h2>
            {sec.body    && <p className={styles.sectionBody}>{sec.body}</p>}
            {sec.callout && <Callout color="violet">{sec.callout}</Callout>}
            {sec.code    && <CodeBlock code={sec.code} />}
          </div>
        ))}
        </StaggerGroup>

        <RevealOnScroll y={16}><AiPromptBox prompt={lesson.aiPrompt} /></RevealOnScroll>

        {/* Inline conversation */}
        <InlineChat lesson={lesson} />

        {/* Lab toggle */}
        <div className={styles.labToggle}>
          <button className={styles.labBtn} onClick={() => setShowLab(v => !v)}>
            {showLab ? '↑ Close Lab' : '↓ Open Lab — practice in the terminal'}
          </button>
        </div>
        {showLab && (
          <div className={styles.labWrap}>
            <FriendlyTerminal mission={lesson.terminalMission} mode="guided" />
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          {!completed ? (
            <div className={styles.footerRow}>
              {prevLesson && (
                <Button variant="secondary" onClick={() => navigate(`/app/lesson/${prevLesson.id}`)}>
                  ← Previous lesson
                </Button>
              )}
              <Button variant="teal" onClick={handleComplete}>
                Mark as complete and continue →
              </Button>
            </div>
          ) : nextLesson ? (
            <div className={styles.nextCard}>
              <div>
                <span className={styles.nextLabel}>Up next</span>
                <p className={styles.nextTitle}>{nextLesson.title}</p>
              </div>
              <div className={styles.nextActions}>
                {prevLesson && (
                  <Button variant="secondary" onClick={() => navigate(`/app/lesson/${prevLesson.id}`)}>
                    ← Previous
                  </Button>
                )}
                <Button onClick={() => navigate(`/app/lesson/${nextLesson.id}`)}>
                  Next lesson →
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.pathDone}>
              Path complete — ready for a Skill Check?
              <Button variant="teal" onClick={() => navigate('/app/skillcheck')}>
                Skill Check →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
