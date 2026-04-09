import React, { useState } from 'react'
import { PATHS, LESSONS_CONTENT } from '@/lib/store'
import { CodeBlock } from '@/components/ui'
import styles from './AdminCMSPage.module.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BLANK_LESSON = () => ({
  pathId: '',
  title: '',
  duration: '10 min',
  part: '',
  mekLabel: '',
  sections: [{ heading: '', body: '', callout: '', code: '' }],
  aiPrompt: '',
  terminalMission: '',
})

function SectionEditor({ section, idx, onChange, onRemove }) {
  const set = (key, val) => onChange(idx, { ...section, [key]: val })
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionTop}>
        <span className={styles.sectionNum}>Section {idx + 1}</span>
        <button className={styles.removeBtn} onClick={() => onRemove(idx)}>Remove</button>
      </div>
      <label className={styles.fieldLabel}>Heading</label>
      <input
        className={styles.input}
        value={section.heading}
        onChange={e => set('heading', e.target.value)}
        placeholder="e.g. The idea in plain English"
      />
      <label className={styles.fieldLabel}>Body text</label>
      <textarea
        className={styles.textarea}
        rows={4}
        value={section.body}
        onChange={e => set('body', e.target.value)}
        placeholder="Explanation text..."
      />
      <label className={styles.fieldLabel}>Callout (optional highlight box)</label>
      <input
        className={styles.input}
        value={section.callout}
        onChange={e => set('callout', e.target.value)}
        placeholder="Key insight to emphasise..."
      />
      <label className={styles.fieldLabel}>Code block (optional)</label>
      <textarea
        className={styles.codeArea}
        rows={6}
        value={section.code}
        onChange={e => set('code', e.target.value)}
        placeholder="Code example..."
        spellCheck={false}
      />
    </div>
  )
}

// ─── JSON output formatter ─────────────────────────────────────────────────────
function toStoreEntry(id, lesson) {
  const sections = lesson.sections
    .filter(s => s.heading || s.body || s.code)
    .map(s => {
      const obj = {}
      if (s.heading) obj.heading = s.heading
      if (s.body)    obj.body    = s.body
      if (s.callout) obj.callout = s.callout
      if (s.code)    obj.code    = s.code
      return obj
    })

  return `  '${id}': {
    pathId: '${lesson.pathId}',
    title: \`${lesson.title}\`,
    duration: '${lesson.duration}',${lesson.part ? `\n    part: '${lesson.part}',` : ''}
    mekLabel: \`${lesson.mekLabel}\`,
    sections: ${JSON.stringify(sections, null, 6).replace(/"([^"]+)":/g, '$1:').replace(/"/g, '`')},
    aiPrompt: \`${lesson.aiPrompt}\`,
    terminalMission: \`${lesson.terminalMission}\`,
  },`
}

// ─── Main CMS ─────────────────────────────────────────────────────────────────
export default function AdminCMSPage() {
  const [mode, setMode]               = useState('list')   // 'list' | 'edit' | 'preview'
  const [lesson, setLesson]           = useState(BLANK_LESSON())
  const [lessonId, setLessonId]       = useState('')
  const [editingExisting, setEditing] = useState(false)
  const [copied, setCopied]           = useState(false)

  const allLessonIds = Object.keys(LESSONS_CONTENT)

  function newLesson() {
    setLesson(BLANK_LESSON())
    setLessonId('')
    setEditing(false)
    setMode('edit')
  }

  function editLesson(id) {
    const l = LESSONS_CONTENT[id]
    if (!l) return
    setLessonId(id)
    setLesson({
      pathId: l.pathId || '',
      title: l.title || '',
      duration: l.duration || '10 min',
      part: l.part || '',
      mekLabel: l.mekLabel || '',
      sections: l.sections?.map(s => ({
        heading: s.heading || '',
        body:    s.body    || '',
        callout: s.callout || '',
        code:    s.code    || '',
      })) || [{ heading: '', body: '', callout: '', code: '' }],
      aiPrompt: l.aiPrompt || '',
      terminalMission: l.terminalMission || '',
    })
    setEditing(true)
    setMode('edit')
  }

  function setField(key, val) {
    setLesson(prev => ({ ...prev, [key]: val }))
  }

  function addSection() {
    setLesson(prev => ({
      ...prev,
      sections: [...prev.sections, { heading: '', body: '', callout: '', code: '' }],
    }))
  }

  function updateSection(idx, updated) {
    setLesson(prev => {
      const sections = [...prev.sections]
      sections[idx] = updated
      return { ...prev, sections }
    })
  }

  function removeSection(idx) {
    setLesson(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }))
  }

  const output = toStoreEntry(lessonId || 'lesson-id', lesson)

  function copyOutput() {
    navigator.clipboard?.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── List view ──────────────────────────────────────────────────────────────
  if (mode === 'list') {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Content Management</h1>
            <p className={styles.sub}>Write and edit lesson content. Copy the output into store.js to publish.</p>
          </div>
          <button className={styles.primaryBtn} onClick={newLesson}>+ New Lesson</button>
        </div>

        <div className={styles.pathList}>
          {PATHS.map(path => {
            const lessons = path.lessons_data
            return (
              <div key={path.id} className={styles.pathGroup}>
                <div className={styles.pathGroupHeader}>
                  <span className={styles.pathGroupIcon}>{path.icon}</span>
                  <span className={styles.pathGroupName}>{path.name}</span>
                  <span className={styles.pathGroupCount}>{lessons.length} lessons</span>
                </div>
                <div className={styles.lessonList}>
                  {lessons.map(l => {
                    const hasContent = !!LESSONS_CONTENT[l.id]
                    return (
                      <div key={l.id} className={styles.lessonRow}>
                        <div className={styles.lessonRowLeft}>
                          <span className={`${styles.contentDot} ${hasContent ? styles.dotFull : styles.dotEmpty}`} />
                          <div>
                            <span className={styles.lessonRowTitle}>{l.title}</span>
                            <span className={styles.lessonRowMeta}>{l.id} · {l.duration}</span>
                          </div>
                        </div>
                        <button
                          className={styles.editBtn}
                          onClick={() => editLesson(l.id)}
                          disabled={!hasContent}
                          title={hasContent ? 'Edit this lesson' : 'No content yet — create new'}
                        >
                          {hasContent ? 'Edit' : 'No content'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Edit view ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{editingExisting ? 'Edit Lesson' : 'New Lesson'}</h1>
          <p className={styles.sub}>Fill in the fields below. Copy the output and paste it into store.js to publish.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.ghostBtn} onClick={() => setMode('list')}>← All lessons</button>
          <button className={styles.ghostBtn} onClick={() => setMode('preview')}>Preview output</button>
        </div>
      </div>

      <div className={styles.editorGrid}>
        {/* Left: form */}
        <div className={styles.form}>

          {/* Meta */}
          <div className={styles.fieldGroup}>
            <h2 className={styles.groupTitle}>Lesson metadata</h2>

            <label className={styles.fieldLabel}>Lesson ID <span className={styles.hint}>(used in URL — no spaces, use hyphens)</span></label>
            <input
              className={styles.input}
              value={lessonId}
              onChange={e => setLessonId(e.target.value.toLowerCase().replace(/\s+/g,'-'))}
              placeholder="e.g. js-functions"
              disabled={editingExisting}
            />

            <label className={styles.fieldLabel}>Title</label>
            <input
              className={styles.input}
              value={lesson.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="e.g. Functions — reusable code blocks"
            />

            <div className={styles.row3}>
              <div>
                <label className={styles.fieldLabel}>Path</label>
                <select className={styles.select} value={lesson.pathId} onChange={e => setField('pathId', e.target.value)}>
                  <option value="">— select —</option>
                  {PATHS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.fieldLabel}>Duration</label>
                <input className={styles.input} value={lesson.duration} onChange={e => setField('duration', e.target.value)} placeholder="10 min" />
              </div>
              <div>
                <label className={styles.fieldLabel}>Part <span className={styles.hint}>(optional)</span></label>
                <select className={styles.select} value={lesson.part} onChange={e => setField('part', e.target.value)}>
                  <option value="">— none —</option>
                  <option value="Before">Before</option>
                  <option value="During">During</option>
                  <option value="After">After</option>
                </select>
              </div>
            </div>

            <label className={styles.fieldLabel}>MEK label <span className={styles.hint}>(completion state, e.g. "enough to read any JS file")</span></label>
            <input
              className={styles.input}
              value={lesson.mekLabel}
              onChange={e => setField('mekLabel', e.target.value)}
              placeholder="enough to..."
            />
          </div>

          {/* Sections */}
          <div className={styles.fieldGroup}>
            <div className={styles.groupHeaderRow}>
              <h2 className={styles.groupTitle}>Sections</h2>
              <button className={styles.addBtn} onClick={addSection}>+ Add section</button>
            </div>
            {lesson.sections.map((sec, idx) => (
              <SectionEditor
                key={idx}
                section={sec}
                idx={idx}
                onChange={updateSection}
                onRemove={removeSection}
              />
            ))}
          </div>

          {/* AI Prompt + Terminal */}
          <div className={styles.fieldGroup}>
            <h2 className={styles.groupTitle}>Actions</h2>

            <label className={styles.fieldLabel}>AI Prompt template <span className={styles.hint}>(shown at bottom of lesson for students to copy)</span></label>
            <textarea
              className={styles.textarea}
              rows={4}
              value={lesson.aiPrompt}
              onChange={e => setField('aiPrompt', e.target.value)}
              placeholder="e.g. Write me a JavaScript function that..."
            />

            <label className={styles.fieldLabel}>Terminal mission <span className={styles.hint}>(shown as the guided task in the Lab)</span></label>
            <input
              className={styles.input}
              value={lesson.terminalMission}
              onChange={e => setField('terminalMission', e.target.value)}
              placeholder="e.g. Type: greetUser('your name')"
            />
          </div>
        </div>

        {/* Right: live output */}
        <div className={styles.outputPanel}>
          <div className={styles.outputHeader}>
            <span className={styles.outputTitle}>Generated code</span>
            <button className={styles.copyBtn} onClick={copyOutput}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className={styles.outputInfo}>
            Paste this into <code>frontend/src/lib/store.js</code> inside the <code>LESSONS_CONTENT</code> object.
          </div>
          <pre className={styles.outputCode}>{output}</pre>
        </div>
      </div>
    </div>
  )
}
