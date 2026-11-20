import React from 'react'
import { Avatar } from '@/components/classroom/Parts'
import styles from './Teaching.module.css'

/* Course colours. Fixed values so a course looks the same in both themes. */
export const COURSE_COLORS = {
  violet: '#7C5CE0',
  blue: '#2F6FDF',
  green: '#1E8E5A',
  amber: '#C98A0B',
  coral: '#D9583B',
  teal: '#0F8A8A',
  pink: '#C93F86',
  slate: '#5B6474',
}

export function colorOf(name) {
  return COURSE_COLORS[name] || COURSE_COLORS.slate
}

export function CourseSwatch({ course, size = 42 }) {
  const initial = (course.title || '?').trim().charAt(0).toUpperCase()
  return (
    <span className={styles.swatch} style={{ '--sw': colorOf(course.color), width: size, height: size }} aria-hidden="true">
      {initial}
    </span>
  )
}

export const COURSE_ROLE = { owner: 'Owner', editor: 'Editor', admin: 'Admin' }

export function Faces({ people = [], size = 24, max = 4 }) {
  const shown = people.slice(0, max)
  return (
    <span className={styles.faces} title={people.map((p) => p.display_name).join(', ')}>
      {shown.map((p) => <Avatar key={p.id} user={p} size={size} />)}
      {people.length > max && <span className={styles.count} data-tone="quiet">+{people.length - max}</span>}
    </span>
  )
}

export function plural(n, one, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}
