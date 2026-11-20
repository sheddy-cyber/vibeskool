import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import CodeBlock from '@/components/lesson/CodeBlock'
import CodeChanges from '@/components/classroom/CodeChanges'
import { Avatar, Empty, Pill, Segmented, Skeleton } from '@/components/classroom/Parts'
import { classroomApi, contentApi } from '@/lib/api'
import { errorText, timeAgo } from '@/lib/classroom'
import { useLive } from '@/lib/live'
import { confirmDialog, notify } from '@/lib/dialog'
import CodeReviewEditor from './CodeReviewEditor'
import styles from './Classroom.module.css'

const FILTERS = [
  { id: 'all', label: 'Everything', params: {} },
  { id: 'open', label: 'Open questions', params: { open: 1 } },
  { id: 'question', label: 'All questions', params: { kind: 'question' } },
  { id: 'announcement', label: 'Announcements', params: { kind: 'announcement' } },
]

let lessonCache = null
function useLessons(enabled) {
  const [lessons, setLessons] = useState(lessonCache || [])
  useEffect(() => {
    if (!enabled || lessonCache) return
    contentApi.getLessons().then((d) => { lessonCache = d.lessons || []; setLessons(lessonCache) }).catch(() => {})
  }, [enabled])
  return lessons
}

function lessonHref(lesson) {
  return `/app/paths/${lesson.pathId}/lessons/${lesson.id}`
}

/* ── Composer ─────────────────────────────────────────────── */
function Composer({ room, tutor, me, onPosted }) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState(tutor ? 'announcement' : 'question')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [lessonId, setLessonId] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [busy, setBusy] = useState(false)
  const lessons = useLessons(open)

  const reset = () => {
    setOpen(false); setTitle(''); setBody(''); setCode(''); setShowCode(false); setLessonId(''); setIsPrivate(false)
  }

  const kinds = tutor
    ? [{ value: 'announcement', label: 'Announcement', icon: 'flag' }, { value: 'post', label: 'Post', icon: 'chat' }]
    : [{ value: 'question', label: 'Ask the tutor', icon: 'idea' }, { value: 'post', label: 'Share with the class', icon: 'chat' }]

  const submit = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    try {
      const { post } = await classroomApi.createPost(room.id, {
        kind,
        title: title.trim(),
        body,
        code: showCode ? code : '',
        lessonId: lessonId || null,
        is_private: kind === 'question' && isPrivate,
        pinned: tutor && kind === 'announcement',
      })
      onPosted(post)
      reset()
    } catch (err) {
      notify({ title: "Couldn't post that", body: errorText(err), tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const placeholder = tutor
    ? 'Share something with the class…'
    : 'Ask your tutor a question, or share something with the class…'

  if (!open) {
    return (
      <div className={`${styles.card} ${styles.composer}`}>
        <div className={styles.composerTop}>
          <Avatar user={{ display_name: me.name, avatar_url: me.avatar, role: me.role }} size={36} />
          <button type="button" className={styles.composerPrompt} onClick={() => setOpen(true)}>{placeholder}</button>
        </div>
      </div>
    )
  }

  return (
    <form className={`${styles.card} ${styles.composer}`} onSubmit={submit}>
      <Segmented value={kind} onChange={setKind} options={kinds} label="What are you posting?" />
      <div className={styles.composerBody}>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === 'question' ? 'Your question in one line (optional)' : 'Title (optional)'}
          maxLength={160}
          style={{ marginBottom: 10 }}
        />
        <textarea
          autoFocus
          className={styles.textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={kind === 'question'
            ? "What are you trying to do, and what happened instead? The more detail, the faster you'll get help."
            : 'Write something…'}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e) }}
        />
        {showCode && (
          <textarea
            autoFocus
            className={`${styles.textarea} ${styles.mono}`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste the code you're asking about"
            rows={6}
            spellCheck="false"
            style={{ marginTop: 10 }}
          />
        )}
      </div>
      <div className={styles.composerTools}>
        <button type="button" className={styles.textBtn} data-tone={showCode ? 'accent' : undefined} onClick={() => setShowCode((v) => !v)}>
          <Icon name="code" size={16} /> {showCode ? 'Remove code' : 'Add code'}
        </button>
        <select className={styles.select} value={lessonId} onChange={(e) => setLessonId(e.target.value)} aria-label="About a lesson">
          <option value="">Not about a lesson</option>
          {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        {kind === 'question' && !tutor && (
          <label className={styles.check}>
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            Only my tutor can see this
          </label>
        )}
        <div className={styles.composerSend}>
          <button type="button" className={`${styles.btnGhost} ${styles.sm}`} onClick={reset}>Cancel</button>
          <button type="submit" className={`${styles.btnPrimary} ${styles.sm}`} disabled={busy || !body.trim()}>
            {busy ? 'Posting…' : kind === 'question' ? 'Ask' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}

/* ── Post ─────────────────────────────────────────────────── */
function PostMenu({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  if (!items.length) return null
  return (
    <div className={styles.menuWrap} ref={ref}>
      <button type="button" className={styles.iconBtn} onClick={() => setOpen((v) => !v)} aria-label="Post options" aria-expanded={open}>
        <Icon name="list" size={17} />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {items.map((it) => (
            <button key={it.label} type="button" role="menuitem" data-tone={it.tone} onClick={() => { setOpen(false); it.onClick() }}>
              <Icon name={it.icon} size={16} /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ReplyForm({ onSend, placeholder }) {
  const [body, setBody] = useState('')
  const [active, setActive] = useState(false)
  const [busy, setBusy] = useState(false)
  const send = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    const ok = await onSend(body.trim())
    setBusy(false)
    if (ok) { setBody(''); setActive(false) }
  }
  return (
    <form className={styles.replyForm} data-active={active || body ? true : undefined} onSubmit={send}>
      <div className={styles.replyFormMain}>
        <textarea
          className={styles.textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => setActive(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(e) }}
          placeholder={placeholder}
          aria-label="Write a reply"
        />
        {(active || body) && (
          <div className={styles.replyFormRow}>
            <button type="button" className={`${styles.btnGhost} ${styles.sm}`} onClick={() => { setBody(''); setActive(false) }}>Cancel</button>
            <button type="submit" className={`${styles.btnPrimary} ${styles.sm}`} disabled={busy || !body.trim()}>{busy ? 'Sending…' : 'Reply'}</button>
          </div>
        )}
      </div>
    </form>
  )
}

function Post({ post, room, tutor, me, onChange, onRemove, focused }) {
  const [expanded, setExpanded] = useState(false)
  const [editingCode, setEditingCode] = useState(false)
  const mine = post.author.id === me.id
  const byTutor = post.author.id === room.teacher_id
  const question = post.kind === 'question'
  const canPickAnswer = question && (mine || tutor)
  // The tutor can edit the code in someone else's post; everyone else sees
  // their version and answers in the replies
  const canEditCode = tutor && !mine && Boolean(post.code?.trim())
  const review = post.code_review

  const update = async (data, done) => {
    try {
      const { post: next } = await classroomApi.updatePost(room.id, post.id, data)
      onChange(next)
      if (done) notify({ title: done, tone: 'success' })
    } catch (err) {
      notify({ title: "Couldn't update the post", body: errorText(err), tone: 'error' })
    }
  }

  const remove = async () => {
    const ok = await confirmDialog({ tone: 'danger', title: 'Delete this post?', body: 'Its replies will be deleted too. This can’t be undone.', confirmLabel: 'Delete post' })
    if (!ok) return
    try {
      await classroomApi.deletePost(room.id, post.id)
      onRemove(post.id)
    } catch (err) {
      notify({ title: "Couldn't delete the post", body: errorText(err), tone: 'error' })
    }
  }

  const reply = async (body) => {
    try {
      const { reply: r } = await classroomApi.reply(room.id, post.id, { body })
      onChange({ ...post, replies: [...post.replies, r] })
      setExpanded(true)
      return true
    } catch (err) {
      notify({ title: "Couldn't send your reply", body: errorText(err), tone: 'error' })
      return false
    }
  }

  const accept = async (r) => {
    try {
      await classroomApi.acceptReply(room.id, r.id)
      onChange({
        ...post,
        resolved: true,
        resolved_at: post.resolved_at || new Date().toISOString(),
        replies: post.replies.map((x) => ({ ...x, accepted: x.id === r.id })),
      })
    } catch (err) {
      notify({ title: "Couldn't mark the answer", body: errorText(err), tone: 'error' })
    }
  }

  const removeReply = async (r) => {
    const ok = await confirmDialog({ tone: 'danger', title: 'Delete this reply?', confirmLabel: 'Delete reply' })
    if (!ok) return
    try {
      await classroomApi.deleteReply(room.id, r.id)
      onChange({ ...post, replies: post.replies.filter((x) => x.id !== r.id) })
    } catch (err) {
      notify({ title: "Couldn't delete the reply", body: errorText(err), tone: 'error' })
    }
  }

  const removeReview = async () => {
    const ok = await confirmDialog({
      tone: 'danger',
      title: 'Remove your edit?',
      body: `${post.author.display_name.split(' ')[0]} will see their original code again, without your changes or notes.`,
      confirmLabel: 'Remove edit',
    })
    if (!ok) return
    try {
      const { post: next } = await classroomApi.removeCodeReview(room.id, post.id)
      onChange(next)
    } catch (err) {
      notify({ title: "Couldn't remove your edit", body: errorText(err), tone: 'error' })
    }
  }

  const menu = []
  if (canEditCode && !editingCode) menu.push({ label: review ? 'Edit your changes to the code' : 'Edit the code', icon: 'pen', onClick: () => setEditingCode(true) })
  if (canEditCode && review && !editingCode) menu.push({ label: 'Remove your edit', icon: 'reset', onClick: removeReview })
  if (tutor) menu.push({ label: post.pinned ? 'Unpin' : 'Pin to the top', icon: 'flag', onClick: () => update({ pinned: !post.pinned }) })
  if (question && (mine || tutor)) {
    menu.push(post.resolved
      ? { label: 'Reopen question', icon: 'reset', onClick: () => update({ resolved: false }) }
      : { label: 'Mark as resolved', icon: 'check', onClick: () => update({ resolved: true }, 'Marked as resolved') })
  }
  if (mine || tutor) menu.push({ label: 'Delete', icon: 'trash', tone: 'danger', onClick: remove })

  const replies = post.replies || []
  const hidden = !expanded && replies.length > 3 ? replies.length - 2 : 0
  const shown = hidden ? replies.slice(-2) : replies

  return (
    <article
      id={`post-${post.id}`}
      className={`${styles.card} ${styles.post}`}
      data-pinned={post.pinned || undefined}
      style={focused ? { boxShadow: '0 0 0 3px var(--accent-dim)', borderColor: 'var(--accent)' } : undefined}
    >
      <header className={styles.postHead}>
        <Avatar user={post.author} size={36} tutor={byTutor} />
        <div className={styles.postWho}>
          <p className={styles.postName}>
            {post.author.display_name}
            {byTutor && <span className={styles.tag} data-tone="accent">Tutor</span>}
          </p>
          <p className={styles.postMeta}>
            <span>{timeAgo(post.created_at)}</span>
            {post.edited_at && <span>· edited</span>}
          </p>
        </div>
        {post.pinned && <span className={styles.tag} data-tone="accent"><Icon name="flag" size={12} /> Pinned</span>}
        {post.kind === 'announcement' && !post.pinned && <span className={styles.tag}>Announcement</span>}
        {question && (post.resolved ? <Pill tone="done">Resolved</Pill> : <Pill tone="warn">Open question</Pill>)}
        {post.is_private && <span className={styles.tag} title="Only you and the tutor can see this"><Icon name="lock" size={12} /> Private</span>}
        <PostMenu items={menu} />
      </header>

      {post.title && <h3 className={styles.postTitle}>{post.title}</h3>}
      <p className={styles.postBody}>{post.body}</p>
      {post.code && (
        editingCode ? (
          <div className={styles.postCode}>
            <CodeReviewEditor
              room={room}
              post={post}
              onCancel={() => setEditingCode(false)}
              onSaved={(next) => { onChange(next); setEditingCode(false) }}
            />
          </div>
        ) : review ? (
          <div className={styles.postCode}>
            <CodeChanges
              key={review.at}
              base={review.base}
              code={review.code}
              notes={review.notes}
              by={review.by}
              at={review.at}
              whose={mine ? 'your' : `${post.author.display_name.split(' ')[0]}’s`}
              outdatedBy={review.outdated ? (mine ? 'You' : post.author.display_name.split(' ')[0]) : null}
            />
            {canEditCode && (
              <button type="button" className={styles.textBtn} data-tone="accent" onClick={() => setEditingCode(true)} style={{ marginTop: 8 }}>
                <Icon name="pen" size={14} /> Edit your changes
              </button>
            )}
          </div>
        ) : (
          <div className={styles.postCode}>
            <CodeBlock code={post.code} />
            {canEditCode && (
              <button type="button" className={styles.textBtn} data-tone="accent" onClick={() => setEditingCode(true)} style={{ marginTop: 8 }}>
                <Icon name="pen" size={14} /> Edit the code and add notes
              </button>
            )}
          </div>
        )
      )}
      {post.lesson && (
        <Link to={lessonHref(post.lesson)} className={styles.lessonLink}>
          <Icon name="book" size={15} /> {post.lesson.title}
        </Link>
      )}

      {(replies.length > 0) && (
        <div className={styles.replies}>
          {hidden > 0 && (
            <button type="button" className={styles.textBtn} onClick={() => setExpanded(true)}>
              Show {hidden} earlier repl{hidden === 1 ? 'y' : 'ies'}
            </button>
          )}
          {shown.map((r) => {
            const rTutor = r.author.id === room.teacher_id
            return (
              <div key={r.id} className={styles.reply} data-accepted={r.accepted || undefined}>
                <Avatar user={r.author} size={30} tutor={rTutor} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.replyBox}>
                    <p className={styles.replyMeta}>
                      <strong>{r.author.display_name}</strong>
                      {rTutor && <span className={styles.tag} data-tone="accent">Tutor</span>}
                      <span>{timeAgo(r.created_at)}</span>
                      {r.accepted && <span className={styles.answer}><Icon name="check" size={13} /> Answer</span>}
                    </p>
                    <p className={styles.replyText}>{r.body}</p>
                  </div>
                  <div className={styles.replyActions}>
                    {canPickAnswer && !r.accepted && r.author.id !== post.author.id && (
                      <button type="button" className={styles.textBtn} data-tone="accent" onClick={() => accept(r)}>
                        <Icon name="check" size={14} /> Mark as the answer
                      </button>
                    )}
                    {(r.author.id === me.id || tutor) && (
                      <button type="button" className={styles.textBtn} data-tone="danger" onClick={() => removeReply(r)}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ReplyForm
        onSend={reply}
        placeholder={question && !mine && tutor && !post.resolved ? 'Answer this question…' : 'Write a reply…'}
      />
    </article>
  )
}

/* ── Stream tab ───────────────────────────────────────────── */
export default function Stream({ room, tutor, me, aside, strip }) {
  const [params, setParams] = useSearchParams()
  const filterId = params.get('show') || 'all'
  const focusId = Number(params.get('post')) || null
  const filter = FILTERS.find((f) => f.id === filterId) || FILTERS[0]
  const [state, setState] = useState({ loading: true, posts: [], hasMore: false, error: null })
  const [loadingMore, setLoadingMore] = useState(false)
  const [focused, setFocused] = useState(null)
  const pages = useRef(1)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const d = await classroomApi.posts(room.id, filter.params)
      setState((s) => (quiet && pages.current > 1 ? s : { loading: false, posts: d.posts, hasMore: d.hasMore, error: null }))
      if (!quiet) pages.current = 1
    } catch (err) {
      if (!quiet) setState({ loading: false, posts: [], hasMore: false, error: errorText(err) })
    }
  }, [room.id, filter])

  useEffect(() => { load() }, [load])

  // Someone posted, replied or resolved something: fetch quietly
  useLive(['stream'], () => load(true))

  // Jump to a post linked from "Needs help"
  useEffect(() => {
    if (!focusId || state.loading) return
    const el = document.getElementById(`post-${focusId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.querySelector('form textarea')?.focus({ preventScroll: true })
    setFocused(focusId)
    const t = setTimeout(() => setFocused(null), 2400)
    return () => clearTimeout(t)
  }, [focusId, state.loading])

  const more = async () => {
    const last = state.posts.filter((p) => !p.pinned).at(-1)
    if (!last) return
    setLoadingMore(true)
    try {
      const d = await classroomApi.posts(room.id, { ...filter.params, before: last.id })
      pages.current += 1
      setState((s) => ({ ...s, posts: [...s.posts, ...d.posts], hasMore: d.hasMore }))
    } finally {
      setLoadingMore(false)
    }
  }

  const setFilter = (id) => {
    const next = new URLSearchParams(params)
    if (id === 'all') next.delete('show'); else next.set('show', id)
    next.delete('post')
    setParams(next, { replace: true })
  }

  const change = (p) => setState((s) => ({ ...s, posts: s.posts.map((x) => (x.id === p.id ? p : x)) }))
  const removed = (id) => setState((s) => ({ ...s, posts: s.posts.filter((x) => x.id !== id) }))
  const posted = (p) => {
    // Switching to "Everything" reloads, and the new post comes back with it
    if (filter.id !== 'all') { setFilter('all'); return }
    setState((s) => ({ ...s, posts: [p, ...s.posts] }))
  }

  const sorted = useMemo(() => {
    const pinned = state.posts.filter((p) => p.pinned)
    return [...pinned, ...state.posts.filter((p) => !p.pinned)]
  }, [state.posts])

  const emptyText = {
    all: tutor ? 'Post an announcement to welcome everyone, or wait for the first question.' : 'Ask the first question, or say hello to the class.',
    open: 'No open questions. Nice.',
    question: 'No questions yet.',
    announcement: 'No announcements yet.',
  }[filter.id]

  return (
    <div className={styles.layout}>
      <div>
        {strip}
        <Composer room={room} tutor={tutor} me={me} onPosted={posted} />
        <div className={styles.filters} role="toolbar" aria-label="Filter the stream">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={styles.chip} aria-pressed={f.id === filter.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        {state.loading ? (
          <div className={styles.feed}>
            {[0, 1].map((i) => <div key={i} className={`${styles.card} ${styles.post}`}><Skeleton lines={4} /></div>)}
          </div>
        ) : state.error ? (
          <div className={styles.card}><Empty icon="close" title="Couldn't load the stream">{state.error}</Empty></div>
        ) : sorted.length === 0 ? (
          <div className={styles.card}><Empty icon="chat" title="Nothing here yet">{emptyText}</Empty></div>
        ) : (
          <div className={styles.feed}>
            {sorted.map((p) => (
              <Post key={p.id} post={p} room={room} tutor={tutor} me={me} onChange={change} onRemove={removed} focused={focused === p.id} />
            ))}
            {state.hasMore && (
              <button type="button" className={`${styles.btnGhost} ${styles.more}`} onClick={more} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Show older posts'}
              </button>
            )}
          </div>
        )}
      </div>
      <aside className={styles.aside}>{aside}</aside>
    </div>
  )
}
