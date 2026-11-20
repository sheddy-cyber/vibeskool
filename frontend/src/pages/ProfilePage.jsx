import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Avatar, Empty, Modal, Skeleton } from '@/components/classroom/Parts'
import ProjectCard from '@/components/showcase/ProjectCard'
import { authApi, peopleApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { errorText } from '@/lib/classroom'
import { notify } from '@/lib/dialog'
import { useStore } from '@/lib/store'
import ui from './classroom/Classroom.module.css'
import styles from './ProfilePage.module.css'

const ROLE = { teacher: 'Tutor', admin: 'Admin', student: 'Student' }
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

function monthYear(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function siteLabel(url) {
  try { return new URL(url).host.replace(/^www\./, '') } catch { return url }
}

/* ── Edit dialog ──────────────────────────────────────────── */
function EditProfile({ onClose }) {
  const { currentUser, updateProfile, applyUser } = useAuth()
  const [name, setName] = useState(currentUser.name)
  const [headline, setHeadline] = useState(currentUser.headline)
  const [bio, setBio] = useState(currentUser.bio)
  const [github, setGithub] = useState(currentUser.github)
  const [website, setWebsite] = useState(currentUser.website)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const file = useRef(null)
  const me = { display_name: currentUser.name, avatar_url: currentUser.avatar, role: currentUser.role }
  const hasPhoto = /^https?:\/\//.test(currentUser.avatar || '')

  const uploadPhoto = async (f) => {
    if (!f) return
    if (!IMAGE_TYPES.includes(f.type)) { notify({ title: 'Use a PNG, JPG, WebP or GIF', tone: 'error' }); return }
    if (f.size > 8 * 1024 * 1024) { notify({ title: 'That photo is over 8 MB', tone: 'error' }); return }
    setPhotoBusy(true)
    try {
      const res = await authApi.uploadAvatar(f)
      applyUser(res.user)
    } catch (err) {
      notify({ title: "Couldn't upload that photo", body: errorText(err), tone: 'error' })
    } finally {
      setPhotoBusy(false)
    }
  }

  const removePhoto = async () => {
    setPhotoBusy(true)
    try { applyUser((await authApi.removeAvatar()).user) } finally { setPhotoBusy(false) }
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    try {
      await updateProfile({ displayName: name, headline, bio, github, website })
      notify({ title: 'Profile updated', tone: 'success' })
      onClose()
    } catch (err) {
      const f = err.data?.fields || {}
      setErrors(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])))
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Edit profile"
      description="This is what other people at VibeSkool see. Your email is never shown."
      onClose={onClose}
      footer={
        <>
          <button type="button" className={ui.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" form="profile-form" className={ui.btnPrimary} disabled={busy || name.trim().length < 2}>{busy ? 'Saving…' : 'Save'}</button>
        </>
      }
    >
      <div className={styles.photoRow}>
        <Avatar user={me} size={64} />
        <div className={styles.photoTools}>
          <button type="button" className={`${ui.btnGhost} ${ui.sm}`} onClick={() => file.current?.click()} disabled={photoBusy}>
            <Icon name="image" size={15} /> {photoBusy ? 'Uploading…' : hasPhoto ? 'Change photo' : 'Upload a photo'}
          </button>
          {hasPhoto && <button type="button" className={`${ui.btnDanger} ${ui.sm}`} onClick={removePhoto} disabled={photoBusy}>Remove</button>}
        </div>
        <input ref={file} type="file" accept={IMAGE_TYPES.join(',')} hidden onChange={(e) => { uploadPhoto(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      <form id="profile-form" onSubmit={save}>
        <label className={ui.field}>
          <span>Name</span>
          <input className={ui.input} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          {errors.displayName && <small className={styles.fieldError}>{errors.displayName}</small>}
        </label>
        <label className={ui.field}>
          <span className={styles.labelRow}>Headline <span className={styles.counter}>{headline.length}/80</span></span>
          <input className={ui.input} value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={80} placeholder="e.g. Learning full-stack, one build at a time" />
        </label>
        <label className={ui.field}>
          <span className={styles.labelRow}>About you <span className={styles.counter}>{bio.length}/500</span></span>
          <textarea className={ui.textarea} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} placeholder="What are you learning, and what do you want to build?" />
        </label>
        <label className={ui.field}>
          <span>GitHub</span>
          <span className={styles.prefix}>
            <span>github.com/</span>
            <input
              className={ui.input}
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              onBlur={() => setGithub((v) => v.trim().replace(/^@/, '').replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/\/+$/, ''))}
              maxLength={60}
              placeholder="username"
              autoComplete="off"
              spellCheck="false"
            />
          </span>
          {errors.github && <small className={styles.fieldError}>{errors.github}</small>}
        </label>
        <label className={ui.field}>
          <span>Website</span>
          <input className={ui.input} value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={300} placeholder="https://your-site.dev" inputMode="url" />
          {errors.website && <small className={styles.fieldError}>{errors.website}</small>}
        </label>
      </form>
    </Modal>
  )
}

/* ── Learning progress (your own profile only) ────────────── */
function Learning() {
  const { paths, fetchPaths, progress } = useStore()
  useEffect(() => { if (!paths.length) fetchPaths() }, [paths.length, fetchPaths])
  const rows = useMemo(() => paths.map((p) => {
    const total = p.lessons_data?.length || 0
    const done = (progress[p.id] || []).length
    return { id: p.id, name: p.name, total, done, pct: total ? Math.round((done / total) * 100) : 0 }
  }).filter((r) => r.total).sort((a, b) => b.done - a.done), [paths, progress])
  if (!rows.length) return null
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={ui.sectionTitle}>Your learning</h2>
          <p className={ui.sectionSub}>Only you see this part.</p>
        </div>
      </div>
      <ul className={`${ui.card} ${styles.paths}`}>
        {rows.map((r) => (
          <li key={r.id}>
            <Link to={`/app/paths/${r.id}`} className={styles.pathRow}>
              <span>
                <span className={styles.pathName}>{r.name}</span>
                <span className={styles.pathSub} style={{ display: 'block' }}>{r.done} of {r.total} lessons</span>
              </span>
              <span className={styles.bar}><span style={{ width: `${r.pct}%` }} /></span>
              <span className={styles.pct}>{r.pct}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { personId } = useParams()
  const { currentUser } = useAuth()
  const id = personId || currentUser?.id
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!id) return
    setData(null)
    setError(null)
    peopleApi.get(id).then(setData).catch((err) => setError(err.status === 404 ? "This person doesn't exist." : errorText(err)))
  }, [id, currentUser?.name, currentUser?.avatar, currentUser?.headline, currentUser?.bio, currentUser?.github, currentUser?.website])

  if (error) {
    return <div className={ui.page}><div className={ui.card}><Empty icon="profile" title="Couldn't open this profile">{error}</Empty></div></div>
  }
  if (!data) {
    return (
      <div className={ui.page}>
        <div className={`${ui.card} ${styles.hero}`}><span style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--bg-raised)' }} /><Skeleton lines={3} /></div>
      </div>
    )
  }

  const { person, stats, teaching, projects, isMe } = data
  const tutor = person.role !== 'student'
  const first = person.display_name.split(' ')[0]
  const emptyProfile = isMe && !person.headline && !person.bio && !person.github_username && !person.website_url

  return (
    <div className={ui.page}>
      <section className={`${ui.card} ${styles.hero}`}>
        {isMe ? (
          <button type="button" className={styles.avatarBtn} onClick={() => setEditing(true)} aria-label="Change your photo">
            <Avatar user={person} size={88} />
          </button>
        ) : <Avatar user={person} size={88} />}
        <div style={{ minWidth: 0 }}>
          <h1 className={styles.name}>
            {person.display_name}
            <span className={styles.role} data-tone={tutor ? 'tutor' : undefined}>{ROLE[person.role] || 'Student'}</span>
          </h1>
          {person.headline && <p className={styles.headline}>{person.headline}</p>}
          {person.bio && <p className={styles.bio}>{person.bio}</p>}
          <div className={styles.links}>
            {person.github_username && (
              <a href={`https://github.com/${person.github_username}`} target="_blank" rel="noopener noreferrer"><Icon name="branch" size={15} />{person.github_username}</a>
            )}
            {person.website_url && (
              <a href={person.website_url} target="_blank" rel="noopener noreferrer"><Icon name="web" size={15} />{siteLabel(person.website_url)}</a>
            )}
            <span><Icon name="clock" size={15} />Joined {monthYear(person.joined)}</span>
          </div>
          {emptyProfile && (
            <p className={styles.nudgeEdit}>
              Add a headline, a few words about you and your GitHub so classmates know who you are.
              <button type="button" className={ui.textBtn} data-tone="accent" onClick={() => setEditing(true)}>Add them</button>
            </p>
          )}
        </div>
        {isMe && (
          <div className={styles.heroActions}>
            <button type="button" className={ui.btnGhost} onClick={() => setEditing(true)}><Icon name="pen" size={16} /> Edit profile</button>
          </div>
        )}
      </section>

      {teaching ? (
        <div className={`${ui.card} ${styles.stats}`} data-cols="2">
          <div className={styles.stat}><p className={styles.statNum}>{teaching.classes}</p><p className={styles.statLabel}>Classes taught</p></div>
          <div className={styles.stat}><p className={styles.statNum}>{teaching.students}</p><p className={styles.statLabel}>Students</p></div>
        </div>
      ) : stats ? (
        <div className={`${ui.card} ${styles.stats}`}>
          <div className={styles.stat}><p className={styles.statNum}>{stats.lessonsCompleted}</p><p className={styles.statLabel}>Lessons finished</p></div>
          <div className={styles.stat}><p className={styles.statNum}>{stats.passedModules.length}</p><p className={styles.statLabel}>Skill checks passed</p></div>
          <div className={styles.stat}><p className={styles.statNum}>{stats.currentStreak}</p><p className={styles.statLabel}>Day streak (best {stats.longestStreak})</p></div>
          <div className={styles.stat}><p className={styles.statNum}>{stats.xp}</p><p className={styles.statLabel}>XP</p></div>
        </div>
      ) : (
        <div className={`${ui.card} ${styles.private}`}><Icon name="lock" size={17} /> {first} keeps their learning stats private.</div>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h2 className={ui.sectionTitle}>{isMe ? 'Your projects' : 'Projects'}</h2>
            <p className={ui.sectionSub}>{isMe ? 'Including drafts, which only you and your collaborators see.' : `Things ${first} built or helped build.`}</p>
          </div>
          {isMe && projects.length > 0 && <Link to="/app/showcase/new" className={`${ui.btnGhost} ${ui.sm}`}><Icon name="plus" size={15} /> Share a project</Link>}
        </div>
        {projects.length ? (
          <div className={styles.grid}>{projects.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        ) : (
          <div className={ui.card}>
            {isMe ? (
              <Empty icon="showcase" title="Nothing shared yet" action={<Link to="/app/showcase/new" className={ui.btnPrimary}><Icon name="plus" size={16} /> Share a project</Link>}>
                Your projects show up here and on the showcase.
              </Empty>
            ) : <Empty icon="showcase" title={`${first} hasn't shared a project yet`} />}
          </div>
        )}
      </section>

      {isMe && person.role === 'student' && <Learning />}

      {editing && <EditProfile onClose={() => setEditing(false)} />}
    </div>
  )
}
