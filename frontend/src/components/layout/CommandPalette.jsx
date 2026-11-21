import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { usePalette } from '@/lib/palette'
import { buildPathModel, pickActivePath, shortModuleName } from '@/lib/learning'
import Icon from '@/components/icons/Icons'
import styles from './CommandPalette.module.css'

const PAGES = [
  { label: 'Home', to: '/app/dashboard', icon: 'home' },
  { label: 'Paths', to: '/app/paths', icon: 'route' },
  { label: 'Playground', to: '/app/lab', icon: 'terminal' },
  { label: 'Classrooms', to: '/app/classrooms', icon: 'classroom', hint: 'Join with a code' },
  { label: 'Showcase', to: '/app/showcase', icon: 'showcase' },
  { label: 'Profile', to: '/app/profile', icon: 'profile' },
  { label: 'Settings', to: '/app/settings', icon: 'settings' },
]

const TEACHER_PAGES = [
  { label: 'Teaching overview', to: '/app/teaching', icon: 'chart' },
  { label: 'My classes', to: '/app/classrooms', icon: 'board' },
  { label: 'Your courses', to: '/app/teaching/courses', icon: 'pen' },
  { label: 'Exercises', to: '/app/teaching/exercises', icon: 'checklist' },
]

function matches(haystack, tokens) {
  const h = haystack.toLowerCase()
  return tokens.every((t) => h.includes(t))
}

export default function CommandPalette() {
  const { open, hide, toggle } = usePalette()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { paths, fetchPaths, progress, completions, passedModules } = useStore()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin'

  // Global shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  // Passed modules come with progress; load it if search opens first
  useEffect(() => {
    if (open && currentUser && !progress) useStore.getState().fetchProgress?.()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    setQ('')
    setActive(0)
    if (!paths?.length) fetchPaths()
    const t = setTimeout(() => inputRef.current?.focus(), 10)
    return () => clearTimeout(t)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const completedIds = useMemo(() => new Set(Object.values(progress || {}).flat()), [progress])

  const sections = useMemo(() => {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const pages = [...PAGES, ...(isTeacher ? TEACHER_PAGES : [])].map((p) => ({ ...p, kind: 'page' }))

    const lessons = []
    ;(paths || []).forEach((p) => {
      ;(p.lessons_data || []).forEach((l) => {
        lessons.push({
          kind: 'lesson',
          label: l.title,
          hint: [shortModuleName(l.part), l.duration].filter(Boolean).join(' · '),
          to: `/app/paths/${p.id}/lessons/${l.id}`,
          icon: completedIds.has(l.id) ? 'check' : 'play',
          done: completedIds.has(l.id),
          haystack: `${l.title} ${l.part || ''} ${l.mekLabel || ''} ${p.name || ''}`,
        })
      })
    })

    // Each module's skill check. "skill check", "quiz" or "test" finds them all
    const checks = []
    const passedSet = new Set(passedModules || [])
    ;(paths || []).forEach((p) => {
      const model = buildPathModel(p, completedIds, passedSet)
      ;(model?.modules || []).filter((m) => m.hasCheck && m.total > 0).forEach((m) => {
        checks.push({
          kind: 'check',
          label: `Module ${m.index + 1} skill check: ${m.short}`,
          hint: m.passed ? 'Passed' : (paths.length > 1 ? p.name : `${m.total} lessons`),
          to: `/app/paths/${p.id}/modules/${m.id}/skill-check`,
          icon: m.passed ? 'check' : 'checklist',
          done: m.passed,
          haystack: `skill check quiz test module ${m.index + 1} ${m.title} ${m.short} ${p.name || ''}`,
        })
      })
    })

    if (!tokens.length) {
      const model = buildPathModel(
        pickActivePath(paths || [], completions || []),
        completedIds,
        new Set(passedModules || []),
      )
      const out = []
      if (model?.next) {
        out.push({
          title: 'Continue',
          items: [{
            kind: 'lesson',
            label: model.next.title,
            hint: [shortModuleName(model.next.part), model.next.duration].filter(Boolean).join(' · '),
            to: `/app/paths/${model.id}/lessons/${model.next.id}`,
            icon: 'play',
          }],
        })
      }
      out.push({ title: 'Go to', items: pages })
      return out
    }

    const pageHits = pages.filter((p) => matches(`${p.label} ${p.hint || ''}`, tokens))
    const checkHits = checks.filter((c) => matches(c.haystack, tokens)).slice(0, 9)
    const lessonHits = lessons
      .filter((l) => matches(l.haystack, tokens))
      .sort((a, b) => Number(matches(b.label, tokens)) - Number(matches(a.label, tokens)))
      .slice(0, 8)
    return [
      pageHits.length && { title: 'Go to', items: pageHits },
      checkHits.length && { title: 'Skill checks', items: checkHits },
      lessonHits.length && { title: 'Lessons', items: lessonHits },
    ].filter(Boolean)
  }, [q, paths, completedIds, completions, passedModules, isTeacher])

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections])

  useEffect(() => { setActive(0) }, [q])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const go = (item) => {
    if (!item) return
    hide()
    navigate(item.to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(flat[active]) }
    else if (e.key === 'Escape') { e.preventDefault(); hide() }
  }

  let index = -1
  return (
    <div className={styles.overlay} onMouseDown={hide} data-lenis-prevent>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.field}>
          <Icon name="search" size={19} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search lessons, skill checks and pages"
            aria-label="Search lessons, skill checks and pages"
            aria-controls="palette-list"
            aria-activedescendant={flat[active] ? `palette-${active}` : undefined}
          />
          <kbd onClick={hide} className={styles.escKey}>Esc</kbd>
          <button type="button" className={styles.cancel} onClick={hide}>Cancel</button>
        </div>

        <div className={styles.list} id="palette-list" role="listbox" ref={listRef}>
          {sections.length === 0 && (
            <p className={styles.empty}>Nothing matches "{q}". Try a topic like "git", "CORS" or "useState".</p>
          )}
          {sections.map((section) => (
            <div key={section.title} className={styles.section}>
              <div className={styles.sectionTitle}>{section.title}</div>
              {section.items.map((item) => {
                index += 1
                const i = index
                return (
                  <button
                    key={`${item.kind}-${item.to}`}
                    id={`palette-${i}`}
                    data-index={i}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={`${styles.row} ${i === active ? styles.rowActive : ''}`}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(item)}
                  >
                    <span className={`${styles.rowIcon} ${item.done ? styles.rowDone : ''}`}>
                      <Icon name={item.icon} size={17} active={i === active && !item.done} />
                    </span>
                    <span className={styles.rowLabel}>{item.label}</span>
                    {item.hint && <span className={styles.rowHint}>{item.hint}</span>}
                    <Icon name="arrowRight" size={15} className={styles.rowGo} />
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className={styles.foot}>
          <span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
          <span><kbd>Enter</kbd> to open</span>
        </div>
      </div>
    </div>
  )
}
