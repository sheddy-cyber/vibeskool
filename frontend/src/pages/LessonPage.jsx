import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, LESSONS_CONTENT, PATHS } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { Button, MEKBar, CodeBlock, Callout, AiPromptBox } from '@/components/ui'
import FriendlyTerminal from '@/components/terminal/FriendlyTerminal'
import styles from './LessonPage.module.css'
import { FadeUp, RevealOnScroll, StaggerGroup } from '@/components/ui/Motion'

// ─── Persona prompts ───
const TUTOR_PERSONAS = {
  friendly: {
    name: 'Friendly Assistant',
    emoji: '🎓',
    role: 'friendly coding coach',
    prompt: 'You are a warm, supportive, and encouraging teacher. Answer in simple terms under 130 words. Encourage the student.'
  },
  socrates: {
    name: 'Socrates AI',
    emoji: '🏛️',
    role: 'Socratic guide',
    prompt: 'You are a Socratic tutor. Do NOT give the student the answer directly. Ask 1-2 guiding questions that push the student to deduce the concept themselves. Keep it under 140 words.'
  },
  auditor: {
    name: 'Security Auditor',
    emoji: '🛡️',
    role: 'cyber security auditor',
    prompt: 'You are a cybersecurity expert. Explain code in terms of potential exploits, bugs, password safety, and standard protection (e.g. CSRF, SQL Injection). Keep it concise, under 140 words.'
  }
}

// ─── Generative Mock Responses for fallback ───
function getSimulatedResponse(message, lessonId, persona) {
  const msg = message.toLowerCase()
  const pInfo = TUTOR_PERSONAS[persona]
  
  let content = ''
  
  if (msg.includes('dns') || msg.includes('ip') || msg.includes('domain')) {
    content = `Excellent question! Think of an IP address as a coordinate or mailing address (e.g., 142.250.80.14) that computers use to find each other, whereas a Domain Name (like google.com) is just the nickname. DNS acts like the internet's phonebook, translating the nickname to the actual address. Without DNS, you would have to type numbers for every site. `
  } else if (msg.includes('http') || msg.includes('request') || msg.includes('status')) {
    content = `HTTP is the agreed protocol (or coffee shop script) for web communication. When you click a link, you send a GET request. The server replies with a status code. 200 OK means success, 404 means the URL path was wrong, and 500 means the server's code crashed. HTTPS adds encryption so snooping routers can't read details. `
  } else if (msg.includes('git') || msg.includes('commit') || msg.includes('github')) {
    content = `Git tracks your file history like a timeline of snapshots. When you run git add, you stage your changes. Git commit saves that snapshot locally. GitHub is the cloud storage (remote) where you share your snapshots. It allows multiple people to work on the same codebase without overwriting each other. `
  } else if (msg.includes('cors') || msg.includes('api')) {
    content = `CORS (Cross-Origin Resource Sharing) is a browser security guard. It blocks frontends running on localhost:5173 from fetching data from backends on localhost:4000 unless the backend explicitly says "I trust localhost:5173". You resolve it by configuring the cors middleware in your backend Express server. `
  } else if (msg.includes('why') || msg.includes('how') || msg.includes('what')) {
    content = `In terms of the Minimum Effective Knowledge (MEK), understanding this concept is about knowing *how* it connects. For this lesson, focus on the structural flow: your browser requests information, the server processes it, and the database remembers. Knowing this allows you to direct AI tools to write the exact functions you need. `
  } else {
    content = `That's a very relevant point for this module! In VibeSkool, we look at this through the lens of AI direction. If you were directing Claude or ChatGPT to write code for this, you'd want to explain the inputs, outputs, and safety constraints. `
  }

  // Adjust output based on persona
  if (persona === 'socrates') {
    return `🏛️ Socrates AI thinks:\n\n${content}\n\nTo help you think deeper: If you were explaining this mechanism to a non-technical manager, what analogy would you use to describe the relationship?`
  }
  if (persona === 'auditor') {
    return `🛡️ Security Auditor Audit:\n\n${content}\n\nRemember: an insecure connection or unparameterised inputs on this layer can lead to serious breaches like data leaks or SQL injections. Always validate incoming requests on the server side.`
  }
  
  return `🎓 Friendly Assistant Coach:\n\n${content}\n\nKeep up the great work! You're building the right mindset to direct AI tools.`
}

// ─── Classroom conversation box ────────────────────────────────────────────────
function InlineChat({ lesson, anthropicKey }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [tutor, setTutor]       = useState('friendly') // friendly | socrates | auditor
  const [thinkingStep, setThinkingStep] = useState('')
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

    // Simulate thinking process
    const thoughts = ['Analyzing question context...', 'Reviewing lesson terms...', 'Formulating response...']
    for (let i = 0; i < thoughts.length; i++) {
      setThinkingStep(thoughts[i])
      await new Promise(r => setTimeout(r, 450))
    }

    if (!anthropicKey) {
      // Simulate typing delay for high-fidelity fallback response
      await new Promise(r => setTimeout(r, 400))
      const reply = getSimulatedResponse(text, lesson.id, tutor)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setLoading(false)
      setThinkingStep('')
      return
    }

    try {
      const activePersona = TUTOR_PERSONAS[tutor]
      const sys = `You are a patient, clear teaching assistant on VibeSkool. The student just read a lesson called "${lesson.title}" which covered: ${lesson.sections.map(s => s.heading).join(', ')}. ${activePersona.prompt} Answer like a ${activePersona.role} — focused, concise, friendly.`

      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
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
        content: `Could not reach AI: ${e.message || 'unknown error'}. Fallback simulated response:\n\n${getSimulatedResponse(text, lesson.id, tutor)}`,
      }])
    } finally {
      setLoading(false)
      setThinkingStep('')
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className={styles.chat}>
      <div className={styles.chatHeader}>
        <div>
          <div className={styles.chatTitle}>Got a question about this lesson?</div>
          <div className={styles.chatSub}>Ask below — your selected tutor will reply.</div>
        </div>
        <div className={styles.tutorSelectorWrap}>
          <select 
            value={tutor} 
            onChange={(e) => setTutor(e.target.value)}
            className={styles.tutorSelect}
            disabled={loading}
          >
            {Object.entries(TUTOR_PERSONAS).map(([key, p]) => (
              <option key={key} value={key}>
                {p.emoji} {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <div className={styles.chatEmpty}>
            <span className={styles.chatEmptyIcon}>{TUTOR_PERSONAS[tutor].emoji}</span>
            <p>I am active as <strong>{TUTOR_PERSONAS[tutor].name}</strong>. Ask me anything about DNS, IP addresses, HTTP status codes, or code logic!</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`${styles.chatMsg} ${styles[`chatMsg-${m.role}`]}`}>
              <span className={styles.chatAvatar}>
                {m.role === 'assistant' ? TUTOR_PERSONAS[tutor].emoji : '👤'}
              </span>
              <div className={styles.chatBubble}>
                {m.content.split('\n').filter(Boolean).map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className={`${styles.chatMsg} ${styles['chatMsg-assistant']}`}>
            <span className={styles.chatAvatar}>{TUTOR_PERSONAS[tutor].emoji}</span>
            <div className={styles.chatBubble}>
              <div className={styles.chatThinkingStep}>{thinkingStep}</div>
              <div className={styles.chatThinking}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.chatInput}>
        <textarea
          className={styles.chatTextarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Ask ${TUTOR_PERSONAS[tutor].name}...`}
          rows={1}
          disabled={loading}
        />
        <button
          className={styles.chatSend}
          onClick={send}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

// ─── Part badge colors ───
const PART_COLORS = { Before: 'var(--amber)', During: 'var(--accent)', After: 'var(--green)' }

export default function LessonPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { completeLesson, progress: storeProgress, settings, passedModules } = useStore()
  const { currentUser, updateProgress } = useAuth()
  
  // Merge auth progress
  const progress = currentUser?.progress || storeProgress
  const [completed, setCompleted] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState('terminal') // 'terminal' | 'tutor'

  const lesson = LESSONS_CONTENT[id]

  // Re-read completion state if ID changes
  useEffect(() => {
    setCompleted(false)
  }, [id])

  if (!lesson) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2>Lesson coming soon</h2>
          <p>This lesson is currently being drafted by our content creators.</p>
          <Button onClick={() => navigate('/app/paths')}>← Back to Paths</Button>
        </div>
      </div>
    )
  }

  const path        = PATHS.find(p => p.id === lesson.pathId)
  const currentModule = lesson.part && path?.modules?.find(m => lesson.part.startsWith(m.id.replace('m', 'M') + ':'))

  const modIndex = path?.modules?.findIndex(m => m.id === currentModule?.id) ?? -1
  const isUnlocked = modIndex <= 0 || (passedModules || []).includes(path?.modules[modIndex - 1].id)
  const isPassed = currentModule && (passedModules || []).includes(currentModule.id)

  if (!isUnlocked) {
    const prevMod = path?.modules[modIndex - 1]
    return (
      <div className={styles.page}>
        <div className={styles.lockedShield}>
          <div className={styles.lockedIcon}>🔒</div>
          <h2>Module Locked</h2>
          <p>You must pass the <strong>{prevMod?.title}</strong> Skill Check first before unlocking this lesson.</p>
          <div className={styles.lockedActions}>
            <Button onClick={() => navigate(`/app/skillcheck/${prevMod?.id}`)} variant="amber">
              Take {prevMod?.id.replace('m', 'Module ')} Skill Check →
            </Button>
            <Button onClick={() => navigate('/app/paths')} variant="secondary">
              Back to Paths
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const pathDone    = progress[lesson.pathId] || 0
  const pathTotal   = path?.lessons_data.length || 1
  const mekPct      = Math.min(100, Math.round((pathDone / pathTotal) * 100) + (completed ? 4 : 0))
  const lessonIdx   = path?.lessons_data.findIndex(l => l.id === id) ?? -1
  const nextLesson  = path?.lessons_data[lessonIdx + 1]
  const prevLesson  = lessonIdx > 0 ? path?.lessons_data[lessonIdx - 1] : null
  const partColor   = lesson.part ? PART_COLORS[lesson.part] : 'var(--accent)'

  const mLessons = currentModule ? path?.lessons_data.filter(l => l.part?.startsWith(currentModule.id.replace('m', 'M') + ':')) : []
  const isLastInModule = mLessons.length > 0 && mLessons[mLessons.length - 1].id === id

  function handleComplete() {
    if (!completed) {
      completeLesson(lesson.pathId)
      if (currentUser) updateProgress(lesson.pathId)
      setCompleted(true)
    }
  }

  return (
    <div className={styles.page}>
      
      {/* Header bar */}
      <div className={styles.header}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/paths')}>← Back</Button>
        <div className={styles.breadcrumb}>
          <span className={styles.bcrPath}>{path?.name}</span>
          <span className={styles.bcrSep}>›</span>
          {currentModule && (
            <>
              <span className={styles.partBadge} style={{ color: partColor, borderColor: partColor }}>
                {currentModule.title}
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
            : <span className={styles.doneBadge}>✓ Completed</span>
          }
        </div>
      </div>

      {/* MEK Progress Indicator */}
      {settings?.showMekBar !== false && (
        <div className={styles.mekBarWrap}>
          <MEKBar score={mekPct} label={lesson.mekLabel} />
        </div>
      )}

      {/* Double Pane Desktop Split Workspace */}
      <div className={styles.splitWorkspace}>
        
        {/* Left Pane: Readable Content */}
        <div className={styles.leftPane}>
          <FadeUp delay={80}>
            <h1 className={styles.lessonTitle}>{lesson.title}</h1>
          </FadeUp>

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

          <RevealOnScroll y={16}>
            <div className={styles.promptBoxSection}>
              <AiPromptBox prompt={lesson.aiPrompt} />
            </div>
          </RevealOnScroll>

          {/* Navigation controls at bottom of text */}
          <div className={styles.contentFooter}>
            {!completed ? (
              <div className={styles.footerRow}>
                {prevLesson && (
                  <Button variant="secondary" onClick={() => navigate(`/app/lesson/${prevLesson.id}`)}>
                    ← Previous
                  </Button>
                )}
                <Button variant="teal" onClick={handleComplete}>
                  Mark Complete & Continue →
                </Button>
              </div>
            ) : nextLesson ? (
              isLastInModule && !isPassed ? (
                <div className={styles.nextCard} style={{ border: '1px solid var(--amber-border)', background: 'var(--amber-dim)' }}>
                  <div>
                    <span className={styles.nextLabel} style={{ color: 'var(--amber)' }}>Module Complete!</span>
                    <p className={styles.nextTitle}>Ready for the {currentModule.id.replace('m', 'Module ')} Skill Check?</p>
                  </div>
                  <div className={styles.nextActions}>
                    {prevLesson && (
                      <Button variant="secondary" onClick={() => navigate(`/app/lesson/${prevLesson.id}`)}>
                        ← Previous
                      </Button>
                    )}
                    <Button variant="amber" onClick={() => navigate(`/app/skillcheck/${currentModule.id}`)}>
                      Take Skill Check →
                    </Button>
                  </div>
                </div>
              ) : (
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
              )
            ) : (
              <div className={styles.pathDone}>
                <h4>🎉 Path complete! Ready for your check?</h4>
                <Button variant="teal" onClick={() => navigate(`/app/skillcheck/${currentModule?.id}`)}>
                  Take Skill Check →
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Interactive Terminal & AI Tutor Tabs */}
        <div className={styles.rightPane}>
          <div className={styles.windowHeader}>
            <div className={styles.windowDots}>
              <div className={styles.dot} />
              <div className={styles.dot} />
              <div className={styles.dot} />
            </div>
          </div>
          <div className={styles.tabsHeader}>
            <button 
              className={`${styles.tabToggleBtn} ${activeRightTab === 'terminal' ? styles.tabToggleBtnActive : ''}`}
              onClick={() => setActiveRightTab('terminal')}
            >
              ⌨️ Terminal Lab
            </button>
            <button 
              className={`${styles.tabToggleBtn} ${activeRightTab === 'tutor' ? styles.tabToggleBtnActive : ''}`}
              onClick={() => setActiveRightTab('tutor')}
            >
              🤖 AI Teacher
            </button>
          </div>

          <div className={styles.tabsBody}>
            {activeRightTab === 'terminal' ? (
              <div className={styles.tabContentActive}>
                <div className={styles.missionCard}>
                  <div className={styles.missionHeader}>MISSION PROMPT</div>
                  <p className={styles.missionDesc}>{lesson.terminalMission}</p>
                </div>
                <FriendlyTerminal mission={lesson.terminalMission} mode="guided" />
              </div>
            ) : (
              <div className={styles.tabContentActive}>
                <InlineChat lesson={lesson} anthropicKey={settings?.anthropicKey} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
