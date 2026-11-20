import React, { useMemo, useState } from 'react'
import Icon from '@/components/icons/Icons'
import { CopyButton } from '@/components/lesson/CodeBlock'
import { detectLanguage, highlightLines, LANG_LABEL } from '@/lib/highlight'
import { timeAgo } from '@/lib/classroom'
import { Avatar } from './Parts'
import styles from './CodeReview.module.css'

/* Submitted code with feedback threads under the lines they're about.
   With `onComment`, hovering a line shows a + in the gutter to comment on it. */

function Thread({ comments }) {
  return (
    <div className={styles.thread}>
      {comments.map((c) => (
        <div key={c.id} className={styles.comment}>
          <Avatar user={c.author} size={26} />
          <div className={styles.commentMain}>
            <p className={styles.commentMeta}>
              <strong>{c.author.display_name}</strong>
              {c.author.role === 'teacher' && <span className={styles.tutorTag}>Tutor</span>}
              <span>{timeAgo(c.created_at)}</span>
            </p>
            <p className={styles.commentBody}>{c.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Composer({ line, onSubmit, onCancel }) {
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    const ok = await onSubmit(body.trim())
    setBusy(false)
    if (ok !== false) setBody('')
  }
  return (
    <form className={styles.composer} onSubmit={send}>
      <textarea
        autoFocus
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(e)
        }}
        placeholder={`Comment on line ${line}…`}
        aria-label={`Comment on line ${line}`}
      />
      <div className={styles.composerRow}>
        <span className={styles.hint}>Ctrl Enter to send</span>
        <button type="button" className={styles.ghostBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.sendBtn} disabled={busy || !body.trim()}>
          {busy ? 'Sending…' : 'Comment'}
        </button>
      </div>
    </form>
  )
}

export default function CodeReview({ code = '', comments = [], onComment, title }) {
  const lang = useMemo(() => detectLanguage(code), [code])
  const lines = useMemo(() => highlightLines(code, lang), [code, lang])
  const [openLine, setOpenLine] = useState(null)

  const outdated = useMemo(() => comments.filter((c) => c.line && c.outdated), [comments])
  const byLine = useMemo(() => {
    const m = new Map()
    for (const c of comments) {
      if (!c.line || c.outdated) continue
      if (!m.has(c.line)) m.set(c.line, [])
      m.get(c.line).push(c)
    }
    return m
  }, [comments])

  const lineCount = byLine.size
  return (
    <figure className={styles.block} data-commentable={onComment ? true : undefined}>
      <figcaption className={styles.bar}>
        <span className={styles.lang}>
          <Icon name="code" size={15} />
          {title || LANG_LABEL[lang] || 'Code'}
          {lineCount > 0 && <span className={styles.count}>{lineCount} line{lineCount === 1 ? '' : 's'} with feedback</span>}
          {outdated.length > 0 && <span className={styles.countDim}>{outdated.length} on changed lines</span>}
        </span>
        <CopyButton text={code} />
      </figcaption>
      <div className={styles.pre} role="table" aria-label="Submitted code">
        {lines.map((toks, i) => {
          const n = i + 1
          const thread = byLine.get(n)
          return (
            <React.Fragment key={n}>
              <div className={styles.line} role="row" data-has-thread={thread ? true : undefined} data-open={openLine === n || undefined}>
                <span className={styles.gutter} role="rowheader">
                  {onComment && (
                    <button
                      type="button"
                      className={styles.add}
                      onClick={() => setOpenLine(openLine === n ? null : n)}
                      aria-label={`Comment on line ${n}`}
                      title={`Comment on line ${n}`}
                    >
                      <Icon name="plus" size={13} />
                    </button>
                  )}
                  <span className={styles.num}>{n}</span>
                </span>
                <code className={styles.src} role="cell">
                  {toks.length === 0 ? '​' : toks.map((t, j) => (
                    t.cls ? <span key={j} className={t.cls}>{t.text}</span> : <React.Fragment key={j}>{t.text}</React.Fragment>
                  ))}
                </code>
              </div>
              {(thread || openLine === n) && (
                <div className={styles.inline}>
                  {thread && <Thread comments={thread} />}
                  {openLine === n ? (
                    <Composer
                      line={n}
                      onCancel={() => setOpenLine(null)}
                      onSubmit={async (body) => {
                        const ok = await onComment({ line: n, body })
                        if (ok !== false) setOpenLine(null)
                        return ok
                      }}
                    />
                  ) : onComment && (
                    <button type="button" className={styles.replyLink} onClick={() => setOpenLine(n)}>Reply on line {n}</button>
                  )}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
      {outdated.length > 0 && (
        <details className={styles.earlier} open={outdated.length <= 3}>
          <summary>
            <Icon name="chevronRight" size={14} className={styles.earlierChevron} />
            Feedback on lines that have changed since
            <span className={styles.earlierCount}>{outdated.length}</span>
          </summary>
          <ul className={styles.earlierList}>
            {[...outdated].sort((a, b) => a.line - b.line).map((c) => (
              <li key={c.id} className={styles.earlierItem}>
                <p className={styles.earlierWhere}>
                  Line {c.line} was <code>{c.line_text.trim() || '(empty line)'}</code>
                </p>
                <Thread comments={[c]} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </figure>
  )
}
