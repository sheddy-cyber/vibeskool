import React, { useMemo, useState } from 'react'
import Icon from '@/components/icons/Icons'
import { CopyButton } from '@/components/lesson/CodeBlock'
import { detectLanguage, highlightLines, LANG_LABEL } from '@/lib/highlight'
import { diffLines, diffStats, splitLines } from '@/lib/lineDiff'
import { timeAgo } from '@/lib/classroom'
import { Avatar } from './Parts'
import styles from './CodeChanges.module.css'

/* The tutor's version of a student's code: what changed (added lines in
   green, removed lines in red) and the tutor's notes under the lines they're
   about. Everyone who can see the post sees this; with `onNotesChange` (the
   tutor, while editing) notes can be added, edited and removed in place. */

const VIEWS = [
  { id: 'changes', label: 'Changes' },
  { id: 'final', label: 'Edited' },
  { id: 'original', label: 'Original' },
]

function NoteEditor({ line, initial = '', onSave, onRemove, onCancel }) {
  const [body, setBody] = useState(initial)
  const save = (e) => {
    e.preventDefault()
    if (body.trim()) onSave(body.trim())
  }
  return (
    <form className={styles.noteForm} onSubmit={save}>
      <textarea
        autoFocus
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(e)
        }}
        maxLength={1000}
        placeholder={`What should they notice on line ${line}?`}
        aria-label={`Note on line ${line}`}
      />
      <div className={styles.noteRow}>
        {onRemove && <button type="button" className={styles.linkDanger} onClick={onRemove}>Remove note</button>}
        <button type="button" className={styles.ghostBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.sendBtn} disabled={!body.trim()}>{initial ? 'Update note' : 'Add note'}</button>
      </div>
    </form>
  )
}

function Note({ body, by, onEdit }) {
  return (
    <div className={styles.note}>
      {by && <Avatar user={by} size={24} tutor />}
      <div className={styles.noteMain}>
        <p className={styles.noteMeta}>
          <strong>{by?.display_name || 'Tutor'}</strong>
          <span className={styles.tutorTag}>Tutor</span>
          {onEdit && <button type="button" className={styles.linkBtn} onClick={onEdit}>Edit</button>}
        </p>
        <p className={styles.noteBody}>{body}</p>
      </div>
    </div>
  )
}

export default function CodeChanges({
  base = '',
  code = '',
  notes = [],
  by,
  at,
  outdatedBy,
  whose,
  onNotesChange,
  initialView,
}) {
  const rows = useMemo(() => diffLines(base, code), [base, code])
  const stats = useMemo(() => diffStats(rows), [rows])
  const lang = useMemo(() => detectLanguage(code || base), [code, base])
  const tokA = useMemo(() => highlightLines(base, lang), [base, lang])
  const tokB = useMemo(() => highlightLines(code, lang), [code, lang])
  const [view, setView] = useState(initialView || (stats.changed ? 'changes' : 'final'))
  const [openLine, setOpenLine] = useState(null)
  const editable = Boolean(onNotesChange)
  const shownView = stats.changed ? view : 'final'

  const noteAt = useMemo(() => new Map(notes.map((n) => [n.line, n.body])), [notes])

  const visible = useMemo(() => {
    if (shownView === 'original') return splitLines(base).map((text, i) => ({ type: 'same', text, a: i + 1, b: null }))
    if (shownView === 'final') return rows.filter((r) => r.type !== 'del')
    return rows
  }, [rows, shownView, base])

  const setNote = (line, body) => {
    const rest = notes.filter((n) => n.line !== line)
    onNotesChange(body ? [...rest, { line, body }].sort((x, y) => x.line - y.line) : rest)
    setOpenLine(null)
  }

  const label = stats.changed ? 'Edited code' : 'Notes on the code'
  return (
    <figure className={styles.block} data-editable={editable || undefined}>
      <figcaption className={styles.bar}>
        <span className={styles.lang}>
          <Icon name="code" size={15} />
          <span>{label}</span>
          <span className={styles.langName}>{LANG_LABEL[lang] || 'Code'}</span>
          {stats.added > 0 && <span className={styles.statAdd} title={`${stats.added} line${stats.added === 1 ? '' : 's'} added`}>+{stats.added}</span>}
          {stats.removed > 0 && <span className={styles.statDel} title={`${stats.removed} line${stats.removed === 1 ? '' : 's'} removed`}>−{stats.removed}</span>}
          {notes.length > 0 && <span className={styles.statNote}>{notes.length} note{notes.length === 1 ? '' : 's'}</span>}
        </span>
        <span className={styles.tools}>
          {stats.changed && (
            <span className={styles.views} role="tablist" aria-label="Show">
              {VIEWS.map((v) => (
                <button key={v.id} type="button" role="tab" aria-selected={shownView === v.id} className={styles.view} onClick={() => setView(v.id)}>
                  {v.label}
                </button>
              ))}
            </span>
          )}
          <CopyButton text={shownView === 'original' ? base : code} />
        </span>
      </figcaption>

      {(by || outdatedBy) && !editable && (
        <p className={styles.byline}>
          {by && <><strong>{by.display_name}</strong> {stats.changed ? `edited ${whose || 'this'} code` : 'left notes on this code'}{at && <> · {timeAgo(at)}</>}</>}
          {outdatedBy && <span className={styles.outdated}>{outdatedBy} changed the code after this</span>}
        </p>
      )}

      <div className={styles.pre} role="table" aria-label={label}>
        {visible.map((r, i) => {
          const tokens = (r.b != null && shownView !== 'original' ? tokB[r.b - 1] : tokA[r.a - 1]) || [{ text: r.text }]
          const line = shownView === 'original' ? null : r.b
          const note = line != null ? noteAt.get(line) : undefined
          const open = editable && line != null && openLine === line
          const kind = shownView === 'original' ? 'same' : r.type
          return (
            <React.Fragment key={i}>
              <div className={styles.line} role="row" data-type={kind} data-noted={note ? true : undefined} data-open={open || undefined}>
                <span className={styles.gutter} role="rowheader">
                  {editable && line != null && (
                    <button
                      type="button"
                      className={styles.add}
                      onClick={() => setOpenLine(open ? null : line)}
                      aria-label={note ? `Edit the note on line ${line}` : `Add a note on line ${line}`}
                      title={note ? 'Edit note' : 'Add a note'}
                    >
                      <Icon name={note ? 'pen' : 'plus'} size={13} />
                    </button>
                  )}
                  <span className={styles.num}>{shownView === 'original' ? r.a : (r.b ?? '')}</span>
                  <span className={styles.mark} aria-label={kind === 'add' ? 'added' : kind === 'del' ? 'removed' : undefined}>
                    {kind === 'add' ? '+' : kind === 'del' ? '−' : ''}
                  </span>
                </span>
                <code className={styles.src} role="cell">
                  {tokens.length === 0 ? '​' : tokens.map((t, j) => (
                    t.cls ? <span key={j} className={t.cls}>{t.text}</span> : <React.Fragment key={j}>{t.text}</React.Fragment>
                  ))}
                </code>
              </div>
              {(note || open) && (
                <div className={styles.inline}>
                  {open ? (
                    <NoteEditor
                      line={line}
                      initial={note || ''}
                      onSave={(body) => setNote(line, body)}
                      onRemove={note ? () => setNote(line, '') : undefined}
                      onCancel={() => setOpenLine(null)}
                    />
                  ) : (
                    <Note body={note} by={by} onEdit={editable ? () => setOpenLine(line) : undefined} />
                  )}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </figure>
  )
}
