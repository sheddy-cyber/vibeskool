import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { contentApi, progressApi, aiApi } from '@/lib/api'
import { Button, CodeBlock, Callout } from '@/components/ui'
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Terminal, Sparkles, X, Send } from 'lucide-react'
import StudentIDE from '@/components/ide/StudentIDE'
import FriendlyTerminal from '@/components/terminal/FriendlyTerminal'
import styles from './LessonPage.module.css'

export default function LessonPage() {
  const { pathId: paramPathId, lessonId: paramLessonId, id } = useParams()
  const lessonId = paramLessonId || id
  const navigate = useNavigate()
  const { paths, fetchPaths } = useStore()
  const { currentUser, checkUser } = useAuth()
  
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('ide')
  
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    if (paths.length === 0) fetchPaths()
  }, [paths.length, fetchPaths])

  useEffect(() => {
    if (!lessonId) return
    setLoading(true)
    contentApi.getLesson(lessonId).then(data => {
      setLesson(data.lesson)
    }).catch(err => {
      console.error(err)
    }).finally(() => {
      setLoading(false)
    })
  }, [lessonId])

  const path = paramPathId 
    ? paths.find(p => p.id === paramPathId) 
    : paths.find(p => p.lessons_data?.some(l => l.id === lessonId)) || paths[0]
  
  let currentModule = null
  let lessonIdx = -1
  if (path && path.lessons_data) {
    lessonIdx = path.lessons_data.findIndex(l => l.id === lessonId)
    const lData = path.lessons_data[lessonIdx]
    if (lData && lData.part) {
      currentModule = path.modules?.find(m => lData.part.toLowerCase().startsWith(m.id.toLowerCase() + ':'))
    }
  }

  const nextLesson = path?.lessons_data?.[lessonIdx + 1]
  const userCompleted = currentUser?.progress?.completedLessons || currentUser?.completedLessons || []
  const isCompleted = userCompleted.includes(lessonId)

  async function handleComplete() {
    if (!isCompleted && currentUser) {
      try {
        await progressApi.completeLesson(lessonId, path?.id)
        await checkUser()
      } catch (err) {
        console.error('Failed to complete lesson:', err)
      }
    }
    if (nextLesson && path) {
      navigate(`/app/paths/${path.id}/lessons/${nextLesson.id}`)
    } else {
      navigate('/app/paths')
    }
  }

  async function handleChat(e) {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return
    const userMsg = { role: 'user', content: chatInput }
    setMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const res = await aiApi.chat({
        persona: 'friendly',
        history,
        lessonContext: lesson.title
      })
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.page}><p style={{padding: 32}}>Loading lesson...</p></div>
  }

  if (!lesson) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2>Lesson not found</h2>
          <Button onClick={() => navigate('/app/paths')} icon={<ArrowLeft size={16} />}>Back to Courses</Button>
        </div>
      </div>
    )
  }

  const sections = Array.isArray(lesson.sections) 
    ? lesson.sections 
    : (lesson.content_json?.sections || (Array.isArray(lesson.content_json) ? lesson.content_json : []))
  
  const learningGoal = lesson.mekLabel || lesson.mek_label

  return (
    <div className={styles.page}>
      
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <div className={styles.breadcrumb}>
            <span className={styles.bcrPath}>{path?.name || path?.title || 'Course'}</span>
            <span className={styles.bcrSep}>›</span>
            {currentModule && (
              <>
                <span className={styles.partBadge}>{currentModule.title}</span>
                <span className={styles.bcrSep}>›</span>
              </>
            )}
            <span className={styles.bcrLesson}>{lesson.title}</span>
          </div>
          <div>
            <Button variant="secondary" onClick={() => setSidebarOpen(!sidebarOpen)} icon={<Code2 size={16} />}>
              {sidebarOpen ? 'Close Editor' : 'Open Code Editor'}
            </Button>
          </div>
        </div>

        <div className={styles.readingPane}>
          <h1 className={styles.lessonTitle}>{lesson.title}</h1>
          {learningGoal && (
            <div className={styles.mekLabel}>
              <strong>What you'll learn:</strong> {learningGoal}
            </div>
          )}

          <div className={styles.content}>
            {sections && sections.length > 0 ? (
              sections.map((sec, i) => (
                <div key={i} className={styles.section}>
                  {sec.heading && <h2 className={styles.sectionHeading}>{sec.heading}</h2>}
                  {sec.body && <p className={styles.sectionBody}>{sec.body}</p>}
                  {sec.callout && <Callout color="violet">{sec.callout}</Callout>}
                  {sec.code && <CodeBlock code={sec.code} />}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', padding: '24px 0' }}>
                {lesson.description || 'Welcome to this lesson! Explore the topic and open the code editor to practice.'}
              </p>
            )}
          </div>

          <div className={styles.bottomNav}>
            <Button 
              variant={isCompleted ? "secondary" : "primary"} 
              onClick={handleComplete} 
              size="lg"
              icon={isCompleted ? (nextLesson ? <ArrowRight size={16} /> : <ArrowLeft size={16} />) : <CheckCircle2 size={16} />}
            >
              {isCompleted ? (nextLesson ? 'Next Lesson' : 'Back to Courses') : 'Mark as Done'}
            </Button>
          </div>
        </div>
      </div>

      <div className={`${styles.practiceSidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.tabs}>
            <button className={`${styles.tabBtn} ${activeTab === 'ide' ? styles.tabActive : ''}`} onClick={() => setActiveTab('ide')}>
              <Code2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Code
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'terminal' ? styles.tabActive : ''}`} onClick={() => setActiveTab('terminal')}>
              <Terminal size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Terminal
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.tabActive : ''}`} onClick={() => setActiveTab('chat')}>
              <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Ask AI
            </button>
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.sidebarBody}>
          {activeTab === 'ide' && <StudentIDE lessonId={lesson.id} />}
          
          {activeTab === 'terminal' && (
            <FriendlyTerminal mission={`Try the concepts from ${lesson.title}`} mode="guided" workspaceFiles={{}} />
          )}

          {activeTab === 'chat' && (
            <div className={styles.chatContainer}>
              <div className={styles.chatMessages}>
                {messages.length === 0 ? (
                  <p className={styles.chatEmpty}>Hi! I'm your AI tutor. Ask me anything about this lesson.</p>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`${styles.chatMsg} ${styles['chatMsg-' + m.role]}`}>
                      <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong>
                      <p>{m.content}</p>
                    </div>
                  ))
                )}
                {chatLoading && <p className={styles.chatLoading}>Thinking...</p>}
              </div>
              <form onSubmit={handleChat} className={styles.chatForm}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder="Ask a question..."
                  className={styles.chatInput}
                />
                <Button type="submit" size="sm" disabled={chatLoading} icon={<Send size={14} />}>Send</Button>
              </form>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
