import React, { useMemo, useState } from 'react'
import Icon from '@/components/icons/Icons'
import CodeChanges from '@/components/classroom/CodeChanges'
import MiniEditor from '@/components/classroom/MiniEditor'
import { Segmented } from '@/components/classroom/Parts'
import { classroomApi } from '@/lib/api'
import { errorText } from '@/lib/classroom'
import { confirmDialog, notify } from '@/lib/dialog'
import { isTouch } from '@/lib/device'
import { detectLanguage } from '@/lib/highlight'
import { moveNotes } from '@/lib/lineDiff'
import styles from './Classroom.module.css'

const firstName = (name = '') => name.trim().split(/\s+/)[0] || 'the student'
const sameNotes = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* The tutor edits the code in a student's post and leaves notes on lines.
   The student's own code is never changed: everyone sees the tutor's
   version next to it, with the changes highlighted. */
export default function CodeReviewEditor({ room, post, onSaved, onCancel }) {
  const review = post.code_review
  const start = review?.code ?? post.code
  const startNotes = useMemo(() => review?.notes || [], [review])
  const [draft, setDraft] = useState(start)
  const [notes, setNotes] = useState(startNotes)
  const [anchor, setAnchor] = useState(start) // the code the notes' line numbers refer to
  const [tab, setTab] = useState('edit')
  const [busy, setBusy] = useState(false)
  const lang = useMemo(() => detectLanguage(post.code), [post.code])
  const name = firstName(post.author.display_name)

  // Notes follow their lines as the code changes
  const settled = () => (anchor === draft ? notes : moveNotes(notes, anchor, draft))
  const settle = () => {
    const next = settled()
    if (anchor !== draft) { setNotes(next); setAnchor(draft) }
    return next
  }

  const currentNotes = settled()
  const dirty = draft !== start || !sameNotes(currentNotes, startNotes)
  const empty = draft === post.code && currentNotes.length === 0

  const switchTab = (next) => {
    if (next === 'notes') settle()
    setTab(next)
  }

  const save = async () => {
    if (!draft.trim()) { notify({ title: 'The code can’t be empty', tone: 'error' }); return }
    const finalNotes = settle()
    setBusy(true)
    try {
      const { post: next } = await classroomApi.saveCodeReview(room.id, post.id, { code: draft, notes: finalNotes })
      onSaved(next)
      notify({ title: post.is_private ? `Shared with ${name}` : 'Shared with the class', tone: 'success' })
    } catch (err) {
      notify({ title: "Couldn't save your changes", body: errorText(err), tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    if (dirty) {
      const ok = await confirmDialog({ title: 'Discard your changes?', body: 'Your edits and notes on this code haven’t been shared yet.', confirmLabel: 'Discard', tone: 'danger' })
      if (!ok) return
    }
    onCancel()
  }

  return (
    <section className={styles.reviewEditor} aria-label={`Edit ${name}'s code`}>
      <div className={styles.reviewHead}>
        <p className={styles.reviewTitle}>
          <Icon name="pen" size={16} /> {review ? 'Your edit of' : 'Editing'} {name}’s code
        </p>
        <Segmented
          value={tab}
          onChange={switchTab}
          label="Edit the code or add notes"
          options={[
            { value: 'edit', label: 'Edit code', icon: 'code' },
            { value: 'notes', label: currentNotes.length ? `Notes · ${currentNotes.length}` : 'Notes', icon: 'note' },
          ]}
        />
      </div>

      {tab === 'edit' ? (
        <>
          <MiniEditor value={draft} onChange={setDraft} language={lang} label={`${name}'s code`} height="120px" maxHeight="440px" autoFocus />
          <p className={styles.reviewHint}>
            Fix or rewrite anything. {name}’s original stays as it is; what you change is highlighted for them.
          </p>
        </>
      ) : (
        <>
          <CodeChanges base={post.code} code={draft} notes={notes} onNotesChange={setNotes} by={review?.by} initialView="changes" />
          <p className={styles.reviewHint}>{isTouch() ? 'Tap + beside a line to explain it.' : 'Hover a line and press + to explain it.'} Notes sit under their line.</p>
        </>
      )}

      <div className={styles.reviewFoot}>
        <span className={styles.reviewAudience}>
          <Icon name={post.is_private ? 'lock' : 'people'} size={14} />
          {post.is_private ? `Only ${name} will see this` : `${name} and the class will see this. Only you can edit it.`}
        </span>
        <button type="button" className={`${styles.btnGhost} ${styles.sm}`} onClick={cancel} disabled={busy}>Cancel</button>
        <button
          type="button"
          className={`${styles.btnPrimary} ${styles.sm}`}
          onClick={save}
          disabled={busy || !dirty || empty}
          title={empty ? 'Change the code or add a note first' : undefined}
        >
          {busy ? 'Saving…' : review ? 'Update' : 'Share changes'}
        </button>
      </div>
    </section>
  )
}
