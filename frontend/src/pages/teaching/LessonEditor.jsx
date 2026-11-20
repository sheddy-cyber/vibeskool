import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import CodeBlock from '@/components/lesson/CodeBlock'
import { Empty, Modal, Skeleton } from '@/components/classroom/Parts'
import { studioApi } from '@/lib/api'
import { errorText, timeAgo } from '@/lib/classroom'
import { confirmDialog, notify } from '@/lib/dialog'
import { inlineTokens, splitParagraphs } from '@/lib/lessonText'
import lessonStyles from '../LessonPage.module.css'
import ui from '../classroom/Classroom.module.css'
import settingsStyles from '../SettingsPage.module.css'
import styles from './Teaching.module.css'

const PREVIEW_KEY = 'vibeskool_lesson_preview'
// Stable keys so reordering keeps each card's state; stripped by the server
const key = () => Math.random().toString(36).slice(2, 10)
const blank = () => ({ _k: key(), heading: '', body: '' })

/* ── Same rendering as the lesson page ────────────────────── */
function Prose({ text }) {
  return splitParagraphs(text).map((p, i) => (
    <p key={i} className={lessonStyles.para}>
      {inlineTokens(p).map((t, j) => (t.type === 'code' ? <code key={j}>{t.text}</code> : <React.Fragment key={j}>{t.text}</React.Fragment>))}
    </p>
  ))
}

function Preview({ lesson }) {
  return (
    <div className={`${ui.card} ${styles.previewCol}`} aria-label="Preview">
      <span className={styles.previewLabel}><Icon name="eye" size={14} /> What students see</span>
      <h2 className={styles.previewTitle}>{lesson.title || 'Untitled lesson'}</h2>
      {lesson.goal && <p className={styles.previewGoal}>Enough to {lesson.goal.replace(/^enough to /i, '').replace(/\.$/, '')}.</p>}
      {lesson.sections.map((s, i) => (
        <section key={i} className={lessonStyles.section}>
          {s.heading && (
            <h3 className={lessonStyles.h}>
              <span className={lessonStyles.hNum}>{String(i + 1).padStart(2, '0')}</span>
              <span>{s.heading}</span>
            </h3>
          )}
          {s.body && <Prose text={s.body} />}
          {s.callout && (
            <aside className={lessonStyles.note}>
              <span className={lessonStyles.noteIcon} aria-hidden="true"><Icon name="note" size={18} /></span>
              <div><span className={lessonStyles.noteLabel}>Worth knowing</span><Prose text={s.callout} /></div>
            </aside>
          )}
          {s.code && <CodeBlock code={s.code} />}
        </section>
      ))}
      {!lesson.sections.some((s) => s.heading || s.body || s.code) && <p className={ui.muted}>Start writing and the lesson appears here.</p>}
    </div>
  )
}

function AutoText({ value, onChange, minRows = 3, ...rest }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])
  return <textarea ref={ref} rows={minRows} value={value} onChange={(e) => onChange(e.target.value)} {...rest} style={{ overflow: 'hidden', resize: 'none' }} />
}

/* ── One section ──────────────────────────────────────────── */
function SectionCard({ s, i, total, onChange, onMove, onRemove, onAddBelow, drag }) {
  const [showNote, setShowNote] = useState(Boolean(s.callout))
  const [showCode, setShowCode] = useState(Boolean(s.code))
  const set = (key) => (v) => onChange({ ...s, [key]: v })
  return (
    <div
      className={`${ui.card} ${styles.sectionCard}`}
      data-dragging={drag.dragging === i || undefined}
      data-over={drag.over === i || undefined}
      onDragOver={(e) => { if (drag.dragging !== null && drag.dragging !== i) { e.preventDefault(); drag.setOver(i) } }}
      onDrop={(e) => { e.preventDefault(); drag.drop(i) }}
    >
      <div className={styles.sectionTop}>
        <span
          className={styles.grip}
          draggable
          onDragStart={(e) => { drag.start(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)) }}
          onDragEnd={drag.end}
          title="Drag to reorder"
          aria-hidden="true"
        >
          <Icon name="list" size={15} />
        </span>
        <span className={styles.sectionNum}>Section {i + 1}</span>
        <span className="spacer" style={{ flex: 1 }} />
        <button type="button" className={styles.tinyBtn} onClick={() => onMove(-1)} disabled={i === 0} aria-label="Move section up"><Icon name="chevronDown" size={15} style={{ transform: 'rotate(180deg)' }} /></button>
        <button type="button" className={styles.tinyBtn} onClick={() => onMove(1)} disabled={i === total - 1} aria-label="Move section down"><Icon name="chevronDown" size={15} /></button>
        <button type="button" className={styles.tinyBtn} onClick={onRemove} disabled={total === 1} aria-label="Delete section"><Icon name="trash" size={15} /></button>
      </div>
      <input
        className={`${ui.input} ${styles.headingInput}`}
        value={s.heading || ''}
        onChange={(e) => set('heading')(e.target.value)}
        placeholder={i === 0 ? 'Open with a question or a familiar situation' : 'Heading'}
        maxLength={200}
        aria-label={`Section ${i + 1} heading`}
      />
      <AutoText
        className={ui.textarea}
        value={s.body || ''}
        onChange={set('body')}
        minRows={4}
        maxLength={12000}
        placeholder="Explain one idea in plain words. A blank line starts a new paragraph. Put `code` in backticks."
        aria-label={`Section ${i + 1} text`}
      />
      {showNote && (
        <div className={styles.extra}>
          <span className={styles.extraLabel}>Worth knowing <button type="button" className={ui.textBtn} onClick={() => { set('callout')(''); setShowNote(false) }}>Remove</button></span>
          <AutoText className={ui.textarea} value={s.callout || ''} onChange={set('callout')} minRows={2} maxLength={2000} placeholder="The one thing to remember from this section." aria-label="Note" />
        </div>
      )}
      {showCode && (
        <div className={styles.extra}>
          <span className={styles.extraLabel}>Code <button type="button" className={ui.textBtn} onClick={() => { set('code')(''); setShowCode(false) }}>Remove</button></span>
          <AutoText className={`${ui.textarea} ${ui.mono}`} value={s.code || ''} onChange={set('code')} minRows={4} maxLength={12000} placeholder="A short example. The language is detected for highlighting." spellCheck="false" aria-label="Code" />
        </div>
      )}
      <div className={styles.toggles}>
        {!showNote && <button type="button" className={ui.textBtn} onClick={() => setShowNote(true)}><Icon name="note" size={14} /> Add a note</button>}
        {!showCode && <button type="button" className={ui.textBtn} onClick={() => setShowCode(true)}><Icon name="code" size={14} /> Add code</button>}
        <button type="button" className={ui.textBtn} onClick={onAddBelow} style={{ marginLeft: 'auto' }}><Icon name="plus" size={14} /> Section below</button>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function LessonEditor() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [course, setCourse] = useState(null)
  const [base, setBase] = useState(null) // updated_at of the version we opened
  const [error, setError] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [conflict, setConflict] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [preview, setPreview] = useState(() => { try { return localStorage.getItem(PREVIEW_KEY) !== 'off' } catch { return true } })
  const [dragging, setDragging] = useState(null)
  const [over, setOver] = useState(null)

  const load = useCallback(() => studioApi.lesson(lessonId).then((d) => {
    const l = d.lesson
    setLesson({ ...l, sections: l.sections.length ? l.sections.map((x) => ({ ...x, _k: key() })) : [blank()] })
    setCourse(d.course)
    setBase(l.updated_at)
    setDirty(false)
  }).catch((err) => setError(err.status === 404 ? "This lesson doesn't exist, or you're not on its course team." : errorText(err))), [lessonId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const change = (patch) => { setLesson((l) => ({ ...l, ...patch })); setDirty(true) }
  const setSections = (fn) => { setLesson((l) => ({ ...l, sections: fn([...l.sections]) })); setDirty(true) }

  const save = useCallback(async (overwrite = false) => {
    if (!lesson || saving) return
    setSaving(true)
    setFieldErrors({})
    try {
      const res = await studioApi.updateLesson(lesson.id, {
        title: lesson.title, goal: lesson.goal || '', duration: lesson.duration || '', published: lesson.published,
        sections: lesson.sections.map(({ _k, ...rest }) => rest), terminal_mission: lesson.terminal_mission || '', ai_prompt: lesson.ai_prompt || '',
        baseUpdatedAt: overwrite ? conflict?.updated_at : base,
      })
      setBase(res.lesson.updated_at)
      setLesson((l) => ({ ...l, updated_at: res.lesson.updated_at, updated_by: res.lesson.updated_by, duration: res.lesson.duration }))
      setDirty(false)
      setConflict(null)
      notify({ title: 'Lesson saved', tone: 'success' })
    } catch (err) {
      if (err.status === 409) {
        setConflict({ message: err.data.error, updated_at: err.data.lesson.updated_at, theirs: err.data.lesson })
      } else {
        const f = err.data?.fields || {}
        setFieldErrors(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, Array.isArray(v) ? (typeof v[0] === 'string' ? v[0] : 'Check this field') : String(v)])))
        notify({ title: "Couldn't save the lesson", body: errorText(err), tone: 'error' })
      }
    } finally {
      setSaving(false)
    }
  }, [lesson, saving, base, conflict])

  // Ctrl/Cmd + S saves
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  const remove = async () => {
    const ok = await confirmDialog({ tone: 'danger', title: `Delete “${lesson.title}”?`, body: 'The lesson, its exercises and students’ progress on it are deleted for the whole team. This can’t be undone.', confirmLabel: 'Delete lesson' })
    if (!ok) return
    try {
      await studioApi.deleteLesson(lesson.id)
      setDirty(false)
      notify({ title: 'Lesson deleted', tone: 'success' })
      navigate(`/app/teaching/courses/${courseId}`)
    } catch (err) {
      notify({ title: "Couldn't delete it", body: errorText(err), tone: 'error' })
    }
  }

  const back = async () => {
    if (dirty) {
      const ok = await confirmDialog({ title: 'Leave without saving?', body: 'Your changes to this lesson will be lost.', confirmLabel: 'Leave', cancelLabel: 'Stay' })
      if (!ok) return
    }
    setDirty(false)
    navigate(`/app/teaching/courses/${courseId}`)
  }

  const togglePreview = () => setPreview((p) => { try { localStorage.setItem(PREVIEW_KEY, p ? 'off' : 'on') } catch {} return !p })

  if (error) {
    return (
      <div className={ui.page}>
        <Link to={`/app/teaching/courses/${courseId}`} className={ui.crumb}><Icon name="arrowLeft" size={15} /> Course</Link>
        <div className={ui.card}><Empty icon="lock" title="Couldn't open this lesson">{error}</Empty></div>
      </div>
    )
  }
  if (!lesson) return <div className={ui.page}><div className={`${ui.card} ${ui.cardPad}`}><Skeleton lines={8} /></div></div>

  const drag = {
    dragging, over, setOver,
    start: (i) => setDragging(i),
    end: () => { setDragging(null); setOver(null) },
    drop: (to) => {
      if (dragging === null || dragging === to) return
      setSections((ss) => { const [m] = ss.splice(dragging, 1); ss.splice(to, 0, m); return ss })
      setDragging(null)
      setOver(null)
    },
  }

  return (
    <div className={ui.page} style={{ maxWidth: preview ? 1320 : 900 }}>
      <button type="button" className={ui.crumb} onClick={back} style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
        <Icon name="arrowLeft" size={15} /> {course?.title}
      </button>
      <header className={styles.editorHead}>
        <div>
          <h1 className={ui.title} style={{ fontSize: 'clamp(24px, 2.6vw, 30px)' }}>{lesson.title || 'Untitled lesson'}</h1>
          <p className={ui.muted} style={{ marginTop: 6 }}>
            {lesson.updated_by ? `Last saved by ${lesson.updated_by.display_name} ${timeAgo(lesson.updated_at)}` : 'Not saved yet'}
          </p>
        </div>
        <div className={styles.headActions}>
          <Link to={`/app/teaching/exercises?lessonId=${lesson.id}`} className={ui.btnGhost}><Icon name="checklist" size={16} /> Exercises</Link>
          <button type="button" className={ui.btnGhost} onClick={togglePreview} aria-pressed={preview}><Icon name="eye" size={16} /> {preview ? 'Hide preview' : 'Show preview'}</button>
          <button type="button" className={ui.btnDanger} onClick={remove}><Icon name="trash" size={16} /> Delete</button>
        </div>
      </header>

      <div className={styles.lessonLayout} data-preview={preview ? 'on' : 'off'}>
        <div className={styles.editCol}>
          <section className={`${ui.card} ${ui.cardPad}`}>
            <label className={ui.field}>
              <span>Title</span>
              <input className={ui.input} value={lesson.title} onChange={(e) => change({ title: e.target.value })} maxLength={200} />
              {fieldErrors.title && <small className={ui.formError}>{fieldErrors.title}</small>}
            </label>
            <div className={styles.metaGrid}>
              <label className={ui.field}>
                <span>Students will learn enough to…</span>
                <input className={ui.input} value={lesson.goal || ''} onChange={(e) => change({ goal: e.target.value })} maxLength={120} placeholder="e.g. call an API and read its reply" />
              </label>
              <label className={ui.field}>
                <span>Length</span>
                <input className={ui.input} value={lesson.duration || ''} onChange={(e) => change({ duration: e.target.value })} maxLength={20} placeholder="8 min" />
                {fieldErrors.duration && <small className={ui.formError}>{fieldErrors.duration}</small>}
              </label>
            </div>
            <div className={settingsStyles.row} style={{ padding: '6px 0 4px' }}>
              <div className={settingsStyles.rowText}>
                <h3 className={settingsStyles.rowTitle}>Published</h3>
                <p className={settingsStyles.rowDesc}>Students only see published lessons, and only once the course is published too.</p>
              </div>
              <button type="button" role="switch" aria-checked={lesson.published} aria-label="Published" className={settingsStyles.switch} onClick={() => change({ published: !lesson.published })}><span /></button>
            </div>
          </section>

          {lesson.sections.map((s, i) => (
            <SectionCard
              key={s._k}
              s={s}
              i={i}
              total={lesson.sections.length}
              drag={drag}
              onChange={(next) => setSections((ss) => { ss[i] = next; return ss })}
              onMove={(d) => setSections((ss) => { const j = i + d; [ss[i], ss[j]] = [ss[j], ss[i]]; return ss })}
              onRemove={async () => {
                const empty = !s.heading && !s.body && !s.code && !s.callout
                if (!empty && !(await confirmDialog({ tone: 'danger', title: 'Delete this section?', confirmLabel: 'Delete section' }))) return
                setSections((ss) => ss.filter((_, k) => k !== i))
              }}
              onAddBelow={() => setSections((ss) => { ss.splice(i + 1, 0, blank()); return ss })}
            />
          ))}
          <button type="button" className={ui.btnGhost} onClick={() => setSections((ss) => [...ss, blank()])} style={{ justifySelf: 'start' }}>
            <Icon name="plus" size={16} /> Add a section
          </button>

          <section className={`${ui.card} ${ui.cardPad}`}>
            <h2 className={ui.sectionTitle} style={{ marginBottom: 12 }}>Practice</h2>
            <label className={ui.field}>
              <span>Terminal mission <small className={ui.muted}>(optional)</small></span>
              <AutoText className={ui.textarea} value={lesson.terminal_mission || ''} onChange={(v) => change({ terminal_mission: v })} minRows={2} maxLength={2000}
                placeholder="Try: curl https://example.com. Students get a “Try it here” button for each command after “Try:” or “Type:”." />
            </label>
            <label className={ui.field} style={{ marginBottom: 0 }}>
              <span>Guidance for the AI tutor <small className={ui.muted}>(optional)</small></span>
              <AutoText className={ui.textarea} value={lesson.ai_prompt || ''} onChange={(v) => change({ ai_prompt: v })} minRows={2} maxLength={4000}
                placeholder="What should the tutor focus on, or avoid giving away, when students ask about this lesson?" />
            </label>
          </section>

          <div className={styles.saveBar}>
            <span className={styles.saveState} data-tone={dirty ? 'dirty' : undefined}>
              {saving ? 'Saving…' : dirty ? 'Unsaved changes · Ctrl S to save' : 'All changes saved'}
            </span>
            <button type="button" className={ui.btnGhost} onClick={back}>Done</button>
            <button type="button" className={ui.btnPrimary} onClick={() => save()} disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>

        {preview && <Preview lesson={lesson} />}
      </div>

      {conflict && (
        <Modal
          title="Someone else saved this lesson"
          description={`${conflict.message} Choose which version to keep.`}
          onClose={() => setConflict(null)}
          footer={
            <>
              <button type="button" className={ui.btnGhost} onClick={() => { setConflict(null); load() }}>Load their version</button>
              <button type="button" className={ui.btnPrimary} onClick={() => save(true)}>Keep mine and save</button>
            </>
          }
        >
          <p className={ui.muted}>Loading theirs discards your unsaved edits. Keeping yours replaces what they saved.</p>
        </Modal>
      )}
    </div>
  )
}
