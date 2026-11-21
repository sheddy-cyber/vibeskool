import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Avatar, Empty, Skeleton } from '@/components/classroom/Parts'
import ProjectCard from '@/components/showcase/ProjectCard'
import { classroomApi, showcaseApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { errorText } from '@/lib/classroom'
import { notify } from '@/lib/dialog'
import { isTouch } from '@/lib/device'
import ui from '../classroom/Classroom.module.css'
import styles from './Showcase.module.css'

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_IMAGE = 8 * 1024 * 1024
const MAX_TAGS = 6
const COMMON_TAGS = ['html', 'css', 'javascript', 'react', 'python', 'api', 'node', 'django', 'tailwind', 'ai']
const GITHUB_REPO = /^https:\/\/github\.com\/[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/
const ROLE = { teacher: 'Tutor', admin: 'Admin', student: 'Student' }

/* ── Link checks (the server checks again) ─────────────────── */
function withScheme(v) {
  const s = v.trim()
  if (!s) return ''
  return /^https?:\/\//i.test(s) ? s : `https://${s}`
}

function normaliseRepo(v) {
  let s = withScheme(v).replace(/^http:\/\//i, 'https://').replace(/^https:\/\/www\.github\.com/i, 'https://github.com')
  s = s.replace(/\/+$/, '').replace(/\.git$/, '')
  return s
}

function liveProblem(v) {
  if (!v) return null
  let u
  try { u = new URL(v) } catch { return "That doesn't look like a web address" }
  if (!['http:', 'https:'].includes(u.protocol)) return 'Use a link that starts with https://'
  const h = u.hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || /^(127\.|10\.|192\.168\.|0\.0\.0\.0)/.test(h)) {
    return 'That link only works on your own computer. Deploy the site and share its public link.'
  }
  if (!h.includes('.')) return "That doesn't look like a web address"
  return null
}

function repoProblem(v) {
  if (!v) return null
  if (!GITHUB_REPO.test(v)) return 'Use the link to a GitHub repository, like https://github.com/you/project'
  return null
}

/* ── Image picker ─────────────────────────────────────────── */
function ImagePicker({ preview, onPick, onRemove, alt, onAlt }) {
  const input = useRef(null)
  const [over, setOver] = useState(false)

  const take = (file) => {
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) {
      notify({ title: 'That file type won’t work', body: 'Use a PNG, JPG, WebP or GIF.', tone: 'error' })
      return
    }
    if (file.size > MAX_IMAGE) {
      notify({ title: 'That image is over 8 MB', body: 'Try a smaller screenshot.', tone: 'error' })
      return
    }
    onPick(file)
  }

  // Paste a screenshot anywhere on the page (unless you're typing)
  useEffect(() => {
    const onPaste = (e) => {
      if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return
      const file = [...(e.clipboardData?.files || [])].find((f) => f.type.startsWith('image/'))
      if (file) { e.preventDefault(); take(file) }
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  })

  return (
    <div className={styles.imageRow}>
      {preview ? (
        <>
          <div className={styles.imageFrame}><img src={preview} alt={alt || 'Preview'} /></div>
          <div className={styles.imageTools}>
            <button type="button" className={`${ui.btnGhost} ${ui.sm}`} onClick={() => input.current?.click()}><Icon name="image" size={15} /> Replace</button>
            <button type="button" className={`${ui.btnDanger} ${ui.sm}`} onClick={onRemove}><Icon name="trash" size={15} /> Remove</button>
          </div>
          <label className={ui.field} style={{ marginBottom: 0 }}>
            <span>Describe the image <small className={ui.muted}>(for screen readers)</small></span>
            <input className={ui.input} value={alt} onChange={(e) => onAlt(e.target.value)} maxLength={200} placeholder="e.g. The home page, with a search box and three recipe cards" />
          </label>
        </>
      ) : (
        <div
          className={styles.drop}
          role="button"
          tabIndex={0}
          data-over={over || undefined}
          onClick={() => input.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click() } }}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]) }}
        >
          <span className={styles.dropIcon}><Icon name="image" size={22} /></span>
          <strong>Add a preview image</strong>
          <span>{isTouch() ? 'Tap to choose a photo or screenshot' : 'Drop it here, click to choose, or paste a screenshot'}</span>
          <small>PNG, JPG, WebP or GIF, up to 8 MB. Wide screenshots (16:10) look best.</small>
        </div>
      )}
      <input ref={input} type="file" accept={IMAGE_TYPES.join(',')} hidden onChange={(e) => { take(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

/* ── Tags ─────────────────────────────────────────────────── */
function TagInput({ tags, onChange, error }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const clean = (raw) => raw.trim().toLowerCase().replace(/^#+/, '').replace(/[^a-z0-9 .+#-]/g, '').replace(/\s+/g, ' ').slice(0, 24).trim()
  const addMany = (raws) => {
    const next = [...tags]
    for (const raw of raws) {
      const t = clean(raw)
      if (t && !next.includes(t) && next.length < MAX_TAGS) next.push(t)
    }
    if (next.length !== tags.length) onChange(next)
  }
  const add = (raw) => addMany([raw])
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
      setDraft('')
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }
  const suggestions = COMMON_TAGS.filter((t) => !tags.includes(t)).slice(0, 8)
  return (
    <div className={ui.field}>
      <span className={styles.labelRow}>What it's built with <span className={styles.counter}>{tags.length}/{MAX_TAGS}</span></span>
      <div className={styles.chipInput} onClick={() => inputRef.current?.focus()}>
        {tags.map((t) => (
          <span key={t} className={styles.chip}>
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><Icon name="close" size={12} /></button>
          </span>
        ))}
        {tags.length < MAX_TAGS && (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => {
              // A comma (typed or pasted) finishes a tag
              const parts = e.target.value.split(',')
              if (parts.length > 1) { addMany(parts.slice(0, -1)); setDraft(parts.at(-1)) } else setDraft(e.target.value)
            }}
            onKeyDown={onKey}
            onBlur={() => { if (draft) { add(draft); setDraft('') } }}
            placeholder={tags.length ? '' : 'Type a tag and press Enter'}
            aria-label="Add a tag"
          />
        )}
      </div>
      {tags.length < MAX_TAGS && suggestions.length > 0 && (
        <div className={styles.suggest}>
          {suggestions.map((t) => <button key={t} type="button" onClick={() => add(t)}>+ {t}</button>)}
        </div>
      )}
      {error && <small className={styles.fieldError}>{error}</small>}
    </div>
  )
}

/* ── Collaborators ────────────────────────────────────────── */
function PeoplePicker({ me, owner, people, onChange, canManage, error }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState(null)
  const [active, setActive] = useState(0)
  const box = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => {
      showcaseApi.people(q.trim()).then((d) => { setResults(d.people); setActive(0) }).catch(() => setResults([]))
    }, 200)
    return () => clearTimeout(t)
  }, [q, open])

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => { if (!box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const choices = (results || []).filter((p) => p.id !== owner.id && !people.some((x) => x.id === p.id))
  const pick = (p) => { onChange([...people, p]); setQ(''); setActive(0) }

  return (
    <div>
      <div className={styles.people}>
        <div className={styles.personRow}>
          <Avatar user={owner} size={32} />
          <span>
            <span className={styles.personName}>{owner.display_name}{owner.id === me.id ? ' (you)' : ''}</span>
            <span className={styles.personRole}>{ROLE[owner.role] || 'Student'} · shared it</span>
          </span>
        </div>
        {people.map((p) => (
          <div key={p.id} className={styles.personRow}>
            <Avatar user={p} size={32} />
            <span>
              <span className={styles.personName}>{p.display_name}{p.id === me.id ? ' (you)' : ''}</span>
              <span className={styles.personRole}>{ROLE[p.role] || 'Student'}</span>
            </span>
            {canManage && (
              <button type="button" className={ui.iconBtn} onClick={() => onChange(people.filter((x) => x.id !== p.id))} aria-label={`Remove ${p.display_name}`}>
                <Icon name="close" size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
      {canManage ? (
        <div className={styles.picker} ref={box}>
          <div className={styles.inputIcon}>
            <Icon name="people" size={16} />
            <input
              className={ui.input}
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (!open) return
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, choices.length - 1)) }
                if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
                if (e.key === 'Enter' && choices[active]) { e.preventDefault(); pick(choices[active]) }
                if (e.key === 'Escape') setOpen(false)
              }}
              placeholder="Add a classmate or tutor who worked on it"
              aria-label="Add a person"
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
            />
          </div>
          {open && (
            <ul className={styles.results} role="listbox">
              {results === null ? <p>Looking…</p> : choices.length === 0 ? (
                <p>{q ? `Nobody in your classes matches “${q}”.` : 'You can add people you share a class with. Join a class to work with others.'}</p>
              ) : choices.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <button type="button" data-active={i === active || undefined} onMouseEnter={() => setActive(i)} onClick={() => pick(p)}>
                    <Avatar user={p} size={26} />
                    <span style={{ flex: 1 }}>{p.display_name}</span>
                    <span className={styles.personRole}>{ROLE[p.role]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className={styles.fieldHint}>Only {owner.display_name} can change who's on this project.</p>
      )}
      {error && <small className={styles.fieldError}>{error}</small>}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ProjectEditor() {
  const { projectId } = useParams()
  const editing = Boolean(projectId)
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const me = useMemo(() => ({ id: currentUser.id, display_name: currentUser.name, avatar_url: currentUser.avatar, role: currentUser.role }), [currentUser])

  const [loaded, setLoaded] = useState(!editing)
  const [loadError, setLoadError] = useState(null)
  const [original, setOriginal] = useState(null)
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [tags, setTags] = useState([])
  const [classId, setClassId] = useState('')
  const [owner, setOwner] = useState(me)
  const [people, setPeople] = useState([])
  const [canManage, setCanManage] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageRemoved, setImageRemoved] = useState(false)
  const [imageAlt, setImageAlt] = useState('')
  const [classes, setClasses] = useState([])
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [saving, setSaving] = useState(null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => { classroomApi.list().then((d) => setClasses(d.classrooms || [])).catch(() => {}) }, [])

  useEffect(() => {
    if (!editing) return
    showcaseApi.get(projectId).then(({ project: p }) => {
      if (!p.permissions.edit) { setLoadError("You can only edit projects you worked on."); return }
      setOriginal(p)
      setTitle(p.title); setTagline(p.tagline); setDescription(p.description || '')
      setLiveUrl(p.live_url); setRepoUrl(p.repo_url); setTags(p.tags)
      setClassId(p.classroom?.id || '')
      const own = p.members.find((m) => m.project_role === 'owner') || p.members[0]
      setOwner(own)
      setPeople(p.members.filter((m) => m.id !== own.id))
      setCanManage(p.permissions.manage)
      setImagePreview(p.image_url); setImageAlt(p.image_alt)
      setLoaded(true)
    }).catch((err) => setLoadError(errorText(err)))
  }, [editing, projectId])

  // Mark the form dirty on any change after loading
  const change = (setter) => (v) => { setter(v); setDirty(true) }
  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  // Revoke object URLs we made for local previews
  useEffect(() => () => { if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview) }, [imagePreview])

  const errors = {
    title: !title.trim() ? 'Give your project a name' : null,
    live_url: liveProblem(liveUrl),
    repo_url: repoProblem(repoUrl),
  }
  const shown = (key) => serverErrors[key] || (touched[key] ? errors[key] : null)
  const hasLink = Boolean(liveUrl || repoUrl)
  const published = original?.status === 'published'

  const save = useCallback(async (status) => {
    setTouched({ title: true, live_url: true, repo_url: true })
    if (errors.title || errors.live_url || errors.repo_url) {
      notify({ title: 'A few things need fixing', body: errors.title || errors.live_url || errors.repo_url, tone: 'error' })
      return
    }
    if (status === 'published' && !hasLink) {
      notify({ title: 'Add a link first', body: 'People need the live site or the code to look at.', tone: 'error' })
      return
    }
    setSaving(status || 'save')
    setServerErrors({})
    const payload = {
      title: title.trim(), tagline: tagline.trim(), description, live_url: liveUrl, repo_url: repoUrl,
      tags, image_alt: imageAlt, classroomId: classId || null,
      ...(canManage ? { collaboratorIds: people.map((p) => p.id) } : {}),
      ...(status ? { status } : {}),
    }
    try {
      const res = editing ? await showcaseApi.update(projectId, payload) : await showcaseApi.create(payload)
      const id = res.project.id
      try {
        if (imageFile) await showcaseApi.uploadImage(id, imageFile, imageAlt)
        else if (imageRemoved && original?.image_url) await showcaseApi.removeImage(id)
      } catch (err) {
        notify({ title: 'Saved, but the image didn’t upload', body: errorText(err), tone: 'error' })
      }
      setDirty(false)
      const nowPublished = res.project.status === 'published'
      notify({
        title: nowPublished && !published ? 'Published to the showcase' : editing ? 'Changes saved' : 'Saved as a draft',
        body: res.xpAwarded ? `You earned ${res.xpAwarded} XP for sharing your work.` : undefined,
        tone: 'success',
      })
      navigate(`/app/showcase/${id}`)
    } catch (err) {
      const fields = err.data?.fields || {}
      setServerErrors(Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])))
      notify({ title: "Couldn't save", body: errorText(err), tone: 'error' })
    } finally {
      setSaving(null)
    }
  }, [errors, hasLink, title, tagline, description, liveUrl, repoUrl, tags, imageAlt, classId, canManage, people, editing, projectId, imageFile, imageRemoved, original, published, navigate])

  if (loadError) {
    return (
      <div className={ui.page}>
        <Link to="/app/showcase" className={ui.crumb}><Icon name="arrowLeft" size={15} /> Showcase</Link>
        <div className={ui.card}><Empty icon="lock" title="Couldn't open the editor">{loadError}</Empty></div>
      </div>
    )
  }
  if (!loaded) return <div className={ui.page}><div className={`${ui.card} ${ui.cardPad}`}><Skeleton lines={6} /></div></div>

  const previewProject = {
    id: original?.id || 'new-project',
    title: title.trim() || 'Your project',
    tagline: tagline.trim() || 'One line about what it is or does.',
    tags,
    members: [owner, ...people],
    image_url: imageRemoved ? '' : imagePreview,
    image_alt: imageAlt,
    appreciations: original?.appreciations || 0,
    comments_count: original?.comments_count || 0,
    status: published ? 'published' : 'draft',
  }
  const ready = [
    { done: Boolean(title.trim()), label: 'A name' },
    { done: hasLink && !errors.live_url && !errors.repo_url, label: 'A link to the site or the code' },
    { done: Boolean(tagline.trim()), label: 'A one-line summary' },
    { done: Boolean(previewProject.image_url), label: 'A preview image (recommended)' },
    { done: description.trim().length >= 40, label: 'The story behind it' },
  ]

  return (
    <div className={ui.page}>
      <Link to={editing ? `/app/showcase/${projectId}` : '/app/showcase'} className={ui.crumb}>
        <Icon name="arrowLeft" size={15} /> {editing ? original.title : 'Showcase'}
      </Link>
      <header className={ui.head} style={{ marginBottom: 22 }}>
        <div className={ui.headText}>
          <h1 className={ui.title}>{editing ? 'Edit project' : 'Share a project'}</h1>
          <p className={ui.lead}>{editing ? 'Changes show up as soon as you save.' : 'Show what you built: the live site, the code, or both. Save a draft any time; only you and your collaborators see drafts.'}</p>
        </div>
      </header>

      <div className={styles.editor}>
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); save(published ? undefined : 'published') }} noValidate>
          <section className={`${ui.card} ${styles.section}`}>
            <div className={styles.sectionHead}><h2>The basics</h2></div>
            <label className={ui.field}>
              <span>Name</span>
              <input className={ui.input} value={title} onChange={(e) => change(setTitle)(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, title: true }))} maxLength={80} placeholder="e.g. Recipe box" autoFocus={!editing} />
              {shown('title') && <small className={styles.fieldError}>{shown('title')}</small>}
            </label>
            <label className={ui.field}>
              <span className={styles.labelRow}>One-line summary <span className={styles.counter} data-over={tagline.length > 140 || undefined}>{tagline.length}/140</span></span>
              <input className={ui.input} value={tagline} onChange={(e) => change(setTagline)(e.target.value)} maxLength={140} placeholder="What it is or what it does, in a sentence" />
            </label>
          </section>

          <section className={`${ui.card} ${styles.section}`}>
            <div className={styles.sectionHead}>
              <h2>Links</h2>
              <p>Add at least one to publish. Links open in a new tab.</p>
            </div>
            <label className={ui.field}>
              <span>Live site</span>
              <span className={`${styles.inputIcon} ${shown('live_url') ? styles.inputBad : ''}`}>
                <Icon name="web" size={16} />
                <input
                  className={ui.input}
                  type="url"
                  inputMode="url"
                  value={liveUrl}
                  onChange={(e) => change(setLiveUrl)(e.target.value)}
                  onBlur={() => { setLiveUrl(withScheme(liveUrl)); setTouched((t) => ({ ...t, live_url: true })) }}
                  placeholder="https://your-site.netlify.app"
                />
              </span>
              {shown('live_url') ? <small className={styles.fieldError}>{shown('live_url')}</small> : <small className={styles.fieldHint}>Where people can use it: Netlify, Vercel, GitHub Pages and the like.</small>}
            </label>
            <label className={ui.field}>
              <span>GitHub repository</span>
              <span className={`${styles.inputIcon} ${shown('repo_url') ? styles.inputBad : ''}`}>
                <Icon name="branch" size={16} />
                <input
                  className={ui.input}
                  type="url"
                  inputMode="url"
                  value={repoUrl}
                  onChange={(e) => change(setRepoUrl)(e.target.value)}
                  onBlur={() => { setRepoUrl(normaliseRepo(repoUrl)); setTouched((t) => ({ ...t, repo_url: true })) }}
                  placeholder="https://github.com/you/project"
                />
              </span>
              {shown('repo_url') ? <small className={styles.fieldError}>{shown('repo_url')}</small> : <small className={styles.fieldHint}>Make sure the repository is public so others can read the code.</small>}
            </label>
          </section>

          <section className={`${ui.card} ${styles.section}`} style={{ paddingBottom: 22 }}>
            <div className={styles.sectionHead}>
              <h2>Preview image</h2>
              <p>A screenshot of your project. Without one, we make a cover from the name.</p>
            </div>
            <ImagePicker
              preview={imageRemoved ? '' : imagePreview}
              alt={imageAlt}
              onAlt={change(setImageAlt)}
              onPick={(file) => { setImageFile(file); setImagePreview(URL.createObjectURL(file)); setImageRemoved(false); setDirty(true) }}
              onRemove={() => { setImageFile(null); setImageRemoved(true); setDirty(true) }}
            />
          </section>

          <section className={`${ui.card} ${styles.section}`}>
            <div className={styles.sectionHead}><h2>The story</h2></div>
            <label className={ui.field}>
              <span className={styles.labelRow}>About the project <span className={styles.counter}>{description.length}/6000</span></span>
              <textarea
                className={ui.textarea}
                rows={7}
                value={description}
                onChange={(e) => change(setDescription)(e.target.value)}
                maxLength={6000}
                placeholder={'What does it do?\nHow did you build it, and where did AI help?\nWhat was hard, and what did you learn?'}
              />
            </label>
            <TagInput tags={tags} onChange={change(setTags)} error={serverErrors.tags} />
          </section>

          <section className={`${ui.card} ${styles.section}`} style={{ paddingBottom: 22 }}>
            <div className={styles.sectionHead}>
              <h2>Who built it</h2>
              <p>Everyone listed here gets credit, can edit the project, and sees it on their profile.</p>
            </div>
            <PeoplePicker me={me} owner={owner} people={people} onChange={change(setPeople)} canManage={canManage} error={serverErrors.collaboratorIds} />
            {classes.length > 0 && (
              <label className={ui.field} style={{ marginTop: 18, marginBottom: 0 }}>
                <span>Built in a class <small className={ui.muted}>(optional)</small></span>
                <select className={ui.select} value={classId} onChange={(e) => change(setClassId)(e.target.value)}>
                  <option value="">Not part of a class</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <small className={styles.fieldHint}>The class's tutor can feature it on the showcase.</small>
                {serverErrors.classroomId && <small className={styles.fieldError}>{serverErrors.classroomId}</small>}
              </label>
            )}
          </section>

          <div className={styles.saveBar}>
            <span className={styles.saveNote}>{published ? 'This project is live on the showcase.' : 'Drafts are only visible to the people who built it.'}</span>
            <Link to={editing ? `/app/showcase/${projectId}` : '/app/showcase'} className={ui.btnGhost}>Cancel</Link>
            {published ? (
              <button type="submit" className={ui.btnPrimary} disabled={Boolean(saving)}>{saving ? 'Saving…' : 'Save changes'}</button>
            ) : (
              <>
                <button type="button" className={ui.btnGhost} onClick={() => save('draft')} disabled={Boolean(saving)}>{saving === 'draft' ? 'Saving…' : 'Save draft'}</button>
                <button type="submit" className={ui.btnPrimary} disabled={Boolean(saving)}>{saving === 'published' ? 'Publishing…' : 'Publish'}</button>
              </>
            )}
          </div>
        </form>

        <aside className={styles.previewCol} aria-label="Preview">
          <span className={styles.previewLabel}>How it will look</span>
          <div ref={(el) => { if (el) el.inert = true }} aria-hidden="true">
            <ProjectCard project={previewProject} />
          </div>
          <div className={`${ui.card} ${ui.cardPad}`}>
            <h2 className={ui.sectionTitle} style={{ marginBottom: 10 }}>Before you publish</h2>
            <ul className={styles.checklist}>
              {ready.map((r) => (
                <li key={r.label} data-done={r.done || undefined}>
                  <Icon name={r.done ? 'check' : 'clock'} size={15} /> {r.label}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
