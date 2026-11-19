import React, { useEffect, useRef, useState } from 'react'
import { aiApi } from '@/lib/api'
import { BrandMark } from '@/components/ui'
import Icon from '@/components/icons/Icons'
import CodeBlock from './CodeBlock'
import styles from './Tutor.module.css'

/* ── Reply formatting: paragraphs, lists, `code`, **bold**, fenced code ── */

function inline(text, keyBase) {
  const parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (/^`[^`]+`$/.test(p)) return <code key={`${keyBase}-${i}`}>{p.slice(1, -1)}</code>
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={`${keyBase}-${i}`}>{p.slice(2, -2)}</strong>
    return <React.Fragment key={`${keyBase}-${i}`}>{p}</React.Fragment>
  })
}

function Reply({ text }) {
  const blocks = []
  const fence = /```(\w+)?\n?([\s\S]*?)```/g
  let last = 0
  let m
  while ((m = fence.exec(text))) {
    if (m.index > last) blocks.push({ type: 'prose', text: text.slice(last, m.index) })
    blocks.push({ type: 'code', lang: m[1], text: m[2].replace(/\n$/, '') })
    last = m.index + m[0].length
  }
  if (last < text.length) blocks.push({ type: 'prose', text: text.slice(last) })

  const out = []
  blocks.forEach((b, bi) => {
    if (b.type === 'code') {
      const map = { js: 'js', javascript: 'js', jsx: 'js', html: 'html', css: 'css', bash: 'shell', sh: 'shell', shell: 'shell', python: 'python', py: 'python', json: 'json' }
      out.push(<CodeBlock key={`c${bi}`} code={b.text} language={map[(b.lang || '').toLowerCase()]} />)
      return
    }
    b.text.split(/\n{2,}/).forEach((para, pi) => {
      const lines = para.split('\n').filter((l) => l.trim())
      if (!lines.length) return
      const isList = lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))
      const key = `p${bi}-${pi}`
      if (isList) {
        const ordered = /^\s*\d/.test(lines[0])
        const Tag = ordered ? 'ol' : 'ul'
        out.push(
          <Tag key={key}>
            {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ''), `${key}-${li}`)}</li>)}
          </Tag>,
        )
      } else {
        out.push(<p key={key}>{inline(lines.join(' ').replace(/^#+\s*/, ''), key)}</p>)
      }
    })
  })
  return <div className={styles.reply}>{out}</div>
}

const SUGGESTIONS = [
  'Explain the main idea more simply',
  'Give me a real example of this',
  'Ask me three questions to check I understood',
]

export default function Tutor({ lesson, sections, pending, onPendingUsed }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const q = String(text || '').trim()
    if (!q || loading) return
    const prior = messages.filter((m) => !m.error).slice(-6)
    setMessages((ms) => [...ms, { role: 'user', content: q }])
    setInput('')
    setLoading(true)

    const transcript = prior.length
      ? `Earlier in this conversation:\n${prior.map((m) => `${m.role === 'user' ? 'Learner' : 'Tutor'}: ${m.content}`).join('\n')}\n\nThe learner now asks: ${q}`
      : q

    try {
      const res = await aiApi.chat({
        message: transcript,
        persona: 'friendly',
        lessonContext: {
          title: lesson?.title,
          mekLabel: lesson?.mekLabel,
          sections: (sections || []).map((s) => ({ heading: s.heading, body: (s.body || '').slice(0, 160) })),
        },
      })
      setMessages((ms) => [...ms, { role: 'assistant', content: res.reply || 'No answer came back. Try asking again.' }])
    } catch (err) {
      const offline = err?.status === 503
      setMessages((ms) => [...ms, {
        role: 'assistant',
        error: true,
        content: offline
          ? "The tutor is offline right now. You can still copy the lesson's prompt into any AI tool you use."
          : "That didn't go through. Check your connection and try again.",
      }])
    } finally {
      setLoading(false)
    }
  }

  // A prompt handed over from the lesson ("Ask the tutor")
  const handled = useRef(null)
  useEffect(() => {
    if (!pending?.text || handled.current === pending.id) return
    handled.current = pending.id
    send(pending.text)
    onPendingUsed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending?.id])

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send(input)
    }
  }

  // Grow the box with its content, up to a limit
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  return (
    <div className={styles.tutor}>
      <div className={styles.list} ref={listRef} aria-live="polite">
        {messages.length === 0 ? (
          <div className={styles.intro}>
            <BrandMark size={30} />
            <h3>Ask about this lesson</h3>
            <p>
              The tutor knows what <strong>{lesson?.title}</strong> covers. It answers in plain English
              and keeps it short.
            </p>
            <div className={styles.suggest}>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  {s}
                  <Icon name="arrowRight" size={14} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            m.role === 'user' ? (
              <div key={i} className={styles.user}>{m.content}</div>
            ) : (
              <div key={i} className={`${styles.bot} ${m.error ? styles.botError : ''}`}>
                <span className={styles.botMark} aria-hidden="true"><BrandMark size={16} /></span>
                <Reply text={m.content} />
              </div>
            )
          ))
        )}
        {loading && (
          <div className={styles.bot} aria-label="The tutor is writing">
            <span className={styles.botMark} aria-hidden="true"><BrandMark size={16} /></span>
            <span className={styles.typing}><i /><i /><i /></span>
          </div>
        )}
      </div>

      <form
        className={styles.composer}
        onSubmit={(e) => { e.preventDefault(); send(input) }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask a question about this lesson"
          aria-label="Message the tutor"
        />
        <button type="submit" className={styles.send} disabled={!input.trim() || loading} aria-label="Send">
          <Icon name="send" size={17} />
        </button>
      </form>
      <p className={styles.hint}>Enter to send · Shift + Enter for a new line</p>
    </div>
  )
}
