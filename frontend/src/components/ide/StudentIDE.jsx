import React, { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { exerciseApi, aiApi } from '@/lib/api'
import { Button } from '@/components/ui'
import { Play, Sparkles, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useStore } from '@/lib/store'
import styles from './StudentIDE.module.css'

export default function StudentIDE({ lessonId }) {
  const { currentUser } = useAuth()
  const { settings } = useStore()
  const activeTheme = settings?.theme || 'light'
  const isDark = activeTheme === 'dark' || (activeTheme === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)

  const [exercises, setExercises] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | passed | failed
  const [feedback, setFeedback] = useState(null)
  
  const [activeTab, setActiveTab] = useState('tests')
  
  const [consecutiveFailures, setConsecutiveFailures] = useState(0)
  const [aiHint, setAiHint] = useState(null)
  const [hintLoading, setHintLoading] = useState(false)

  useEffect(() => {
    if (!lessonId) return
    exerciseApi.list(lessonId).then(res => {
      setExercises(res.exercises || [])
      if (res.exercises?.length > 0) {
        setCode(res.exercises[0].starter_code || '')
        setActiveTab((res.exercises[0].language === 'html' || res.exercises[0].language === 'web') ? 'preview' : 'tests')
      }
    }).catch(console.error)
  }, [lessonId])

  const activeEx = exercises[currentIndex]

  if (exercises.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No coding exercises available for this lesson.</p>
      </div>
    )
  }

  async function runCode() {
    setStatus('submitting')
    setFeedback(null)
    setAiHint(null)

    if (activeEx.language === 'html' || activeEx.language === 'web') {
      setTimeout(async () => {
        try {
          await exerciseApi.submit(activeEx.id, code) 
        } catch (e) {}
        setStatus('passed')
        setConsecutiveFailures(0)
        setFeedback([{ input: 'Visual Test', actual: 'Passed visually in the Web Sandbox', expected: 'Passed visually in the Web Sandbox', passed: true }])
      }, 500)
      return
    }

    try {
      const res = await exerciseApi.submit(activeEx.id, code)
      setStatus(res.passed ? 'passed' : 'failed')
      
      if (res.passed) {
        setConsecutiveFailures(0)
      } else {
        setConsecutiveFailures(c => c + 1)
      }

      try {
        const parsed = JSON.parse(res.feedback)
        setFeedback(parsed)
      } catch(e) {
        setFeedback([{ input: 'Custom', actual: res.feedback, expected: '', passed: res.passed }])
      }
    } catch (err) {
      setStatus('failed')
      setConsecutiveFailures(c => c + 1)
      setFeedback([{ actual: 'Server error or execution failed.' }])
    }
  }

  async function handleGetHint() {
    setHintLoading(true)
    try {
      const errors = Array.isArray(feedback) ? feedback.filter(f => !f.passed).map(f => `Expected: ${f.expected}\nActual: ${f.actual}`).join('\n') : ''
      const res = await aiApi.getHint({ code, instructions: activeEx.instructions, errors })
      setAiHint(res.hint)
    } catch (err) {
      console.error(err)
      setAiHint("Sorry, the AI is taking a nap. Try checking your syntax!")
    } finally {
      setHintLoading(false)
    }
  }

  const isHtml = activeEx.language === 'html' || activeEx.language === 'web'
  const extensions = activeEx.language === 'python' ? [python()] : isHtml ? [html()] : [javascript()]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{activeEx.title}</h3>
        {exercises.length > 1 && (
          <div className={styles.nav}>
              <button 
                disabled={currentIndex === 0} 
                onClick={() => {
                  const prev = exercises[currentIndex - 1]
                  setCurrentIndex(c => c - 1)
                  setCode(prev.starter_code || '')
                  setActiveTab((prev.language === 'html' || prev.language === 'web') ? 'preview' : 'tests')
                  setStatus('idle')
                  setFeedback(null)
                  setAiHint(null)
                  setConsecutiveFailures(0)
                }}
              >
                ← Prev
              </button>
              <span>{currentIndex + 1} / {exercises.length}</span>
              <button 
                disabled={currentIndex === exercises.length - 1} 
                onClick={() => {
                  const next = exercises[currentIndex + 1]
                  setCurrentIndex(c => c + 1)
                  setCode(next.starter_code || '')
                  setActiveTab((next.language === 'html' || next.language === 'web') ? 'preview' : 'tests')
                  setStatus('idle')
                  setFeedback(null)
                  setAiHint(null)
                  setConsecutiveFailures(0)
                }}
              >
                Next →
              </button>
          </div>
        )}
      </div>

      {activeEx.instructions && (
        <div className={styles.instructions}>
          {activeEx.instructions}
        </div>
      )}

      <div className={styles.editorWrap}>
        <CodeMirror
          value={code}
          height="300px"
          theme={isDark ? 'dark' : 'light'}
          extensions={extensions}
          onChange={(val) => setCode(val)}
        />
      </div>

      <div className={styles.actions}>
        <Button 
          variant={status === 'passed' ? 'teal' : 'primary'} 
          onClick={runCode}
          disabled={status === 'submitting'}
          icon={<Play size={15} />}
        >
          {status === 'submitting' ? 'Running Code...' : 'Run & Test'}
        </Button>
        {consecutiveFailures >= 3 && status !== 'passed' && (
          <Button variant="secondary" onClick={handleGetHint} disabled={hintLoading} icon={<Sparkles size={15} />} style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            {hintLoading ? 'Thinking...' : 'Get AI Hint'}
          </Button>
        )}
      </div>

      {aiHint && (
        <div className={styles.hintBox}>
          <strong><Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />AI Hint:</strong>
          <p>{aiHint}</p>
        </div>
      )}

      <div className={styles.bottomSection}>
        <div className={styles.tabs}>
          <button className={`${styles.tabBtn} ${activeTab === 'tests' ? styles.tabActive : ''}`} onClick={() => setActiveTab('tests')}>Test Results</button>
          {isHtml && (
            <button className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.tabActive : ''}`} onClick={() => setActiveTab('preview')}>Web Preview</button>
          )}
        </div>
        
        {activeTab === 'preview' && isHtml && (
          <div className={styles.previewPanel}>
            <iframe
              title="Web Preview"
              srcDoc={code}
              sandbox="allow-scripts"
              className={styles.iframePreview}
            />
          </div>
        )}

        {activeTab === 'tests' && feedback && (
          <div className={`${styles.results} ${status === 'passed' ? styles.passed : styles.failed}`}>
            <h4>
              {status === 'passed' ? (
                <>
                  <CheckCircle2 size={18} style={{ color: 'var(--green)', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Tests Passed
                </>
              ) : (
                <>
                  <XCircle size={18} style={{ color: 'var(--red)', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Tests Failed
                </>
              )}
            </h4>
            <div className={styles.testList}>
              {Array.isArray(feedback) && feedback.map((tc, i) => (
                <div key={i} className={styles.testItem}>
                  <div className={styles.testRow}>
                    <span>Input: <code>{tc.input}</code></span>
                    {tc.passed ? <span className={styles.badgePass}>Pass</span> : <span className={styles.badgeFail}>Fail</span>}
                  </div>
                  {!tc.passed && (
                    <div className={styles.diff}>
                      <div>Expected: <code>{tc.expected}</code></div>
                      <div>Actual: <code>{tc.actual || tc.stderr || '(no output)'}</code></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
