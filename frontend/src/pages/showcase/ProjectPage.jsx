import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { ActionMenu, Avatar, Empty, Skeleton } from '@/components/classroom/Parts'
import { ProjectMedia } from '@/components/showcase/ProjectCard'
import { useCopy } from '@/components/lesson/CodeBlock'
import { showcaseApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { errorText, shortDate, timeAgo } from '@/lib/classroom'
import { confirmDialog, notify } from '@/lib/dialog'
import ui from '../classroom/Classroom.module.css'
import styles from './Showcase.module.css'

const ROLE = { teacher: 'Tutor', admin: 'Admin', student: 'Student' }


function Comments({ project, me }) {
  const [items, setItems] = useState(null)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    showcaseApi.comments(project.id).then((d) => setItems(d.comments)).catch(() => setItems([]))
  }, [project.id])

  const send = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    try {
      const { comment } = await showcaseApi.comment(project.id, body.trim())
      setItems((list) => [...list, comment])
      setBody('')
    } catch (err) {
      notify({ title: "Couldn't post your comment", body: errorText(err), tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const remove = async (c) => {
    if (!(await confirmDialog({ tone: 'danger', title: 'Delete this comment?', confirmLabel: 'Delete' }))) return
    try {
      await showcaseApi.deleteComment(project.id, c.id)
      setItems((list) => list.filter((x) => x.id !== c.id))
    } catch (err) {
      notify({ title: "Couldn't delete it", body: errorText(err), tone: 'error' })
    }
  }

  return (
    <section aria-labelledby="comments-title">
      <h2 id="comments-title" className={ui.sectionTitle} style={{ marginBottom: 14 }}>
        Comments{items?.length ? ` · ${items.length}` : ''}
      </h2>
      <div className={styles.comments}>
        {items === null ? <Skeleton lines={2} /> : items.length === 0 && (
          <p className={ui.muted}>{project.status === 'published' ? 'No comments yet. Say what you liked, or ask how something works.' : 'Comments open once the project is published.'}</p>
        )}
        {items?.map((c) => (
          <div key={c.id} className={styles.comment}>
            <Avatar user={c.author} size={32} />
            <div className={styles.commentBox}>
              <p className={styles.commentMeta}>
                <Link to={`/app/people/${c.author.id}`}>{c.author.display_name}</Link>
                {c.author.role === 'teacher' && <span className={ui.tag} data-tone="accent">Tutor</span>}
                <span>{timeAgo(c.created_at)}</span>
                {c.can_delete && <button type="button" className={ui.textBtn} data-tone="danger" onClick={() => remove(c)} style={{ padding: 0, fontSize: 12.5 }}>Delete</button>}
              </p>
              <p className={styles.commentBody}>{c.body}</p>
            </div>
          </div>
        ))}
        {project.status === 'published' && (
          <form className={styles.commentForm} onSubmit={send}>
            <Avatar user={{ display_name: me.name, avatar_url: me.avatar, role: me.role }} size={32} />
            <div>
              <textarea
                className={ui.textarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(e) }}
                placeholder="Write a comment…"
                aria-label="Write a comment"
                maxLength={2000}
                rows={2}
              />
              {body.trim() && (
                <div className={styles.commentRow}>
                  <button type="submit" className={`${ui.btnPrimary} ${ui.sm}`} disabled={busy}>{busy ? 'Posting…' : 'Comment'}</button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [project, setProject] = useState(null)
  const [error, setError] = useState(null)
  const [pop, setPop] = useState(false)
  const [copied, copy] = useCopy()

  useEffect(() => {
    setProject(null)
    setError(null)
    showcaseApi.get(projectId)
      .then((d) => setProject(d.project))
      .catch((err) => setError(err.status === 404 ? "This project doesn't exist, or it's a draft only its makers can see." : errorText(err)))
  }, [projectId])

  if (error) {
    return (
      <div className={ui.page}>
        <Link to="/app/showcase" className={ui.crumb}><Icon name="arrowLeft" size={15} /> Showcase</Link>
        <div className={ui.card}><Empty icon="showcase" title="Couldn't open this project">{error}</Empty></div>
      </div>
    )
  }
  if (!project) {
    return (
      <div className={ui.page}>
        <div style={{ maxWidth: 560, marginBottom: 24 }}><Skeleton lines={3} /></div>
        <div className={ui.card} style={{ aspectRatio: '16 / 9' }} />
      </div>
    )
  }

  const me = currentUser
  const mine = project.members.some((m) => m.id === me.id)
  const owner = project.members.find((m) => m.project_role === 'owner')
  const published = project.status === 'published'
  const perms = project.permissions

  const update = async (data, message) => {
    try {
      const res = await showcaseApi.update(project.id, data)
      setProject(res.project)
      notify({ title: message, body: res.xpAwarded ? `You earned ${res.xpAwarded} XP for sharing it.` : undefined, tone: 'success' })
    } catch (err) {
      notify({ title: "Couldn't update the project", body: errorText(err), tone: 'error' })
    }
  }

  const appreciate = async () => {
    const was = project.appreciated
    setProject((p) => ({ ...p, appreciated: !was, appreciations: p.appreciations + (was ? -1 : 1) }))
    if (!was) { setPop(true); setTimeout(() => setPop(false), 400) }
    try {
      const res = await showcaseApi.appreciate(project.id)
      setProject((p) => ({ ...p, appreciated: res.appreciated, appreciations: res.appreciations }))
    } catch (err) {
      setProject((p) => ({ ...p, appreciated: was, appreciations: p.appreciations + (was ? 1 : -1) }))
      notify({ title: "Couldn't save that", body: errorText(err), tone: 'error' })
    }
  }

  const feature = async () => {
    try {
      const { featured } = await showcaseApi.feature(project.id)
      setProject((p) => ({ ...p, featured }))
      notify({ title: featured ? 'Featured on the showcase' : 'No longer featured', tone: 'success' })
    } catch (err) {
      notify({ title: "Couldn't change that", body: errorText(err), tone: 'error' })
    }
  }

  const remove = async () => {
    const ok = await confirmDialog({
      tone: 'danger', title: `Delete “${project.title}”?`,
      body: 'Its preview, appreciations and comments are deleted too. This can’t be undone.', confirmLabel: 'Delete project',
    })
    if (!ok) return
    try {
      await showcaseApi.delete(project.id)
      notify({ title: 'Project deleted', tone: 'success' })
      navigate('/app/showcase?scope=mine')
    } catch (err) {
      notify({ title: "Couldn't delete it", body: errorText(err), tone: 'error' })
    }
  }

  const leave = async () => {
    const ok = await confirmDialog({ title: 'Take yourself off this project?', body: `It stays on the showcase under ${owner?.display_name || 'the owner'}'s name.`, confirmLabel: 'Leave project' })
    if (!ok) return
    try {
      await showcaseApi.leave(project.id)
      notify({ title: "You're no longer on this project", tone: 'success' })
      navigate('/app/showcase')
    } catch (err) {
      notify({ title: "Couldn't do that", body: errorText(err), tone: 'error' })
    }
  }

  const menu = []
  if (perms.feature && published) menu.push({ label: project.featured ? 'Stop featuring' : 'Feature on the showcase', icon: 'flag', onClick: feature })
  if (perms.edit && published) menu.push({ label: 'Move back to drafts', icon: 'eye', onClick: () => update({ status: 'draft' }, 'Moved to drafts') })
  if (mine && !perms.manage) menu.push({ label: 'Leave this project', icon: 'logout', onClick: leave })
  if (perms.manage) menu.push({ label: 'Delete project', icon: 'trash', tone: 'danger', onClick: remove })

  return (
    <div className={ui.page}>
      <Link to="/app/showcase" className={ui.crumb}><Icon name="arrowLeft" size={15} /> Showcase</Link>

      {!published && (
        <div className={styles.draftBar}>
          <Icon name="eye" size={18} />
          <p><strong>This is a draft.</strong> Only the people who built it can see it.</p>
          {perms.edit && (project.live_url || project.repo_url) && (
            <button type="button" className={`${ui.btnPrimary} ${ui.sm}`} onClick={() => update({ status: 'published' }, 'Published to the showcase')}>Publish</button>
          )}
        </div>
      )}

      <header className={styles.projectHead}>
        <div>
          <h1 className={ui.title}>{project.title}</h1>
          {project.tagline && <p className={ui.lead}>{project.tagline}</p>}
          {(project.live_url || project.repo_url) && (
            <div className={styles.links}>
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={ui.btnPrimary}>
                  <Icon name="web" size={16} /> Visit the site <span className={styles.linkSub}>{project.live_host}</span>
                </a>
              )}
              {project.repo_url && (
                <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className={ui.btnGhost}>
                  <Icon name="branch" size={16} /> View the code <span className={styles.linkSub}>{project.repo_label}</span>
                </a>
              )}
            </div>
          )}
        </div>
        <div className={styles.headActions}>
          {perms.edit && <Link to={`/app/showcase/${project.id}/edit`} className={ui.btnGhost}><Icon name="pen" size={16} /> Edit</Link>}
          <ActionMenu items={menu} buttonClassName={ui.btnGhost} />
        </div>
      </header>

      <div className={styles.projectLayout}>
        <div className={styles.projectMain}>
          <div className={styles.shot}>
            {project.image_url ? (
              <a href={project.image_url} target="_blank" rel="noopener noreferrer" aria-label="Open the full-size image">
                <ProjectMedia project={project} priority />
              </a>
            ) : <ProjectMedia project={project} priority />}
          </div>

          <section aria-labelledby="story-title">
            <h2 id="story-title" className={ui.sectionTitle} style={{ marginBottom: 10 }}>About this project</h2>
            {project.description
              ? <p className={styles.story}>{project.description}</p>
              : <p className={styles.storyEmpty}>{perms.edit ? 'Add the story behind it: what it does, how you built it, what you learned.' : 'No description yet.'}</p>}
          </section>

          <Comments project={project} me={me} />
        </div>

        <aside className={styles.side}>
          {published && (
            <button
              type="button"
              className={styles.appreciate}
              aria-pressed={project.appreciated}
              onClick={appreciate}
              disabled={mine}
              title={mine ? "You can't appreciate your own project" : undefined}
            >
              <Icon name="heart" size={19} className={pop ? styles.pop : undefined} />
              {mine ? 'Appreciations' : project.appreciated ? 'Appreciated' : 'Appreciate'}
              <span className={styles.count}>{project.appreciations}</span>
            </button>
          )}

          <section className={`${ui.card} ${ui.cardPad}`}>
            <h2 className={ui.sectionTitle} style={{ marginBottom: 10 }}>
              Built by
            </h2>
            <ul className={styles.memberList}>
              {project.members.map((m) => (
                <li key={m.id}>
                  <Link to={`/app/people/${m.id}`} className={styles.member}>
                    <Avatar user={m} size={36} />
                    <span style={{ minWidth: 0 }}>
                      <span className={styles.memberName}>{m.display_name}{m.id === me.id ? ' (you)' : ''}</span>
                      <span className={styles.memberRole}>{ROLE[m.role] || 'Student'}{project.members.length > 1 && m.project_role === 'owner' ? ' · shared it' : ''}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${ui.card} ${ui.cardPad}`}>
            <ul className={styles.facts}>
              {project.classroom && (
                <li><span className={styles.factLabel}>Built in</span><span className={styles.factValue}><Link to={`/app/classrooms/${project.classroom.id}`}>{project.classroom.name}</Link></span></li>
              )}
              <li><span className={styles.factLabel}>{published ? 'Shared' : 'Started'}</span><span className={styles.factValue}>{shortDate(project.published_at || project.created_at)}</span></li>
              {project.featured && <li><span className={styles.factLabel}>Featured</span><span className={styles.factValue}>By a tutor</span></li>}
            </ul>
            {project.tags.length > 0 && (
              <div className={styles.tagList} style={{ marginTop: 16 }}>
                {project.tags.map((t) => <Link key={t} to={`/app/showcase?tag=${encodeURIComponent(t)}`} className={styles.tagPill}>{t}</Link>)}
              </div>
            )}
            <button type="button" className={ui.textBtn} onClick={() => copy(window.location.href)} style={{ marginTop: 16 }}>
              <Icon name={copied ? 'check' : 'copy'} size={15} /> {copied ? 'Link copied' : 'Copy link to this page'}
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}
