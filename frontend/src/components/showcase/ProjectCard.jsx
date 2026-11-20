import React from 'react'
import { Link } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Avatar } from '@/components/classroom/Parts'
import styles from './ProjectCard.module.css'

/* Calm, fixed palettes for projects without a preview image. They are
   "art", so they look the same in light and dark mode. */
const PALETTES = [
  { bg: '#F3EEE6', ink: '#2B2620', accent: '#D9663F' },
  { bg: '#16213A', ink: '#E8EEF7', accent: '#FFC43D' },
  { bg: '#DDF0E6', ink: '#12372A', accent: '#1E8E5A' },
  { bg: '#2A1F3D', ink: '#F1E9FF', accent: '#C59BFF' },
  { bg: '#E3EEFC', ink: '#13294B', accent: '#1A73E8' },
  { bg: '#F6E1D7', ink: '#4A2318', accent: '#C2491D' },
]

function hash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export function paletteFor(project) {
  return PALETTES[hash(project.id || project.title) % PALETTES.length]
}

/** The preview: the uploaded image, or a generated cover with the title. */
export function ProjectMedia({ project, className = '', priority = false, preview }) {
  const src = preview || project.image_url
  if (src) {
    return (
      <div className={`${styles.media} ${className}`}>
        <img
          src={src}
          alt={project.image_alt || `Preview of ${project.title}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
    )
  }
  const p = paletteFor(project)
  return (
    <div
      className={`${styles.media} ${styles.cover} ${className}`}
      style={{ '--c-bg': p.bg, '--c-ink': p.ink, '--c-accent': p.accent }}
      role="img"
      aria-label={`${project.title || 'Untitled project'} (no preview image)`}
    >
      <span className={styles.coverTags} aria-hidden="true">{(project.tags || []).slice(0, 3).join(' · ')}</span>
      <span className={styles.coverTitle} aria-hidden="true">{project.title || 'Untitled project'}</span>
    </div>
  )
}

/** "Ada Okafor & Tunde Bello", "Ada Okafor, Tunde Bello +2" */
export function namesFor(members = []) {
  const names = members.map((m) => m.display_name)
  if (names.length <= 1) return names[0] || ''
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names[0]}, ${names[1]} +${names.length - 2}`
}

export function Byline({ members = [], size = 24, linked = true }) {
  const shown = members.slice(0, 3)
  const tutor = members.some((m) => m.role === 'teacher')
  return (
    <div className={styles.byline}>
      <span className={styles.stack} aria-hidden="true">
        {shown.map((m) => <Avatar key={m.id} user={m} size={size} />)}
      </span>
      <span className={styles.names}>
        {linked && members.length <= 2
          ? members.map((m, i) => (
            <React.Fragment key={m.id}>
              {i > 0 && ' & '}
              <Link to={`/app/people/${m.id}`} className={styles.nameLink}>{m.display_name}</Link>
            </React.Fragment>
          ))
          : namesFor(members)}
      </span>
      {tutor && <span className={styles.tutorTag}>Tutor</span>}
    </div>
  )
}

export default function ProjectCard({ project, priority = false }) {
  const href = `/app/showcase/${project.id}`
  return (
    <article className={styles.card}>
      <Link to={href} className={styles.mediaLink} tabIndex={-1} aria-hidden="true">
        <ProjectMedia project={project} priority={priority} />
        {project.status === 'draft' && <span className={styles.flag}>Draft</span>}
        {project.featured && <span className={styles.flag} data-tone="featured"><Icon name="flag" size={12} /> Featured</span>}
      </Link>
      <div className={styles.body}>
        <h3 className={styles.title}><Link to={href}>{project.title}</Link></h3>
        {project.tagline && <p className={styles.tagline}>{project.tagline}</p>}
        <div className={styles.foot}>
          <Byline members={project.members} />
          <span className={styles.meta}>
            <span className={styles.metaItem} data-on={project.appreciated || undefined} title={`${project.appreciations} appreciation${project.appreciations === 1 ? '' : 's'}`}>
              <Icon name="heart" size={15} />{project.appreciations}
            </span>
            {project.comments_count > 0 && (
              <span className={styles.metaItem} title={`${project.comments_count} comment${project.comments_count === 1 ? '' : 's'}`}>
                <Icon name="chat" size={15} />{project.comments_count}
              </span>
            )}
          </span>
        </div>
      </div>
    </article>
  )
}
