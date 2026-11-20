/* Small helpers shared by the classroom pages. */

export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/** "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago", "12 Oct" */
export function timeAgo(value, now = Date.now()) {
  if (!value) return ''
  const t = new Date(value).getTime()
  const diff = Math.max(0, now - t)
  if (diff < MIN) return 'just now'
  if (diff < HOUR) return `${Math.floor(diff / MIN)} min ago`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} h ago`
  const days = Math.floor(diff / DAY)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return shortDate(value)
}

export function shortDate(value) {
  const d = new Date(value)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) })
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Due-date wording plus a tone: "Due today", "Due Thu 21 Nov", "2 days late". */
export function dueLabel(due, finished = false) {
  if (!due) return { text: 'No due date', tone: 'muted' }
  const d = new Date(due)
  const days = Math.round((startOfDay(d) - startOfDay(new Date())) / DAY)
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (finished) return { text: `Due ${shortDate(due)}`, tone: 'muted' }
  if (d < new Date()) {
    const late = Math.max(1, -days)
    return { text: days === 0 ? `Was due ${time}` : `${late} day${late === 1 ? '' : 's'} late`, tone: 'late' }
  }
  if (days === 0) return { text: `Due today, ${time}`, tone: 'soon' }
  if (days === 1) return { text: `Due tomorrow, ${time}`, tone: 'soon' }
  if (days < 7) return { text: `Due ${d.toLocaleDateString(undefined, { weekday: 'long' })}`, tone: 'normal' }
  return { text: `Due ${shortDate(due)}`, tone: 'normal' }
}

/** How each assignment status reads to a student and to a tutor. */
export const STATUS = {
  not_started: { label: 'To do', tone: 'muted' },
  missing: { label: 'Missing', tone: 'late' },
  submitted: { label: 'Handed in', tone: 'active' },
  changes_requested: { label: 'Changes requested', tone: 'warn' },
  approved: { label: 'Approved', tone: 'done' },
  done: { label: 'Done', tone: 'done' },
}

export const OPEN_STATUSES = ['not_started', 'missing', 'changes_requested']

export const KIND = {
  code: { label: 'Hand in code', icon: 'code' },
  link: { label: 'Hand in a link', icon: 'chain' },
  lesson: { label: 'Finish a lesson', icon: 'book' },
}

/** Tutor-facing wording for each "needs help" signal. */
export const FLAGS = {
  waiting_on_you: { label: 'Waiting on you', tone: 'late' },
  overdue: { label: 'Overdue work', tone: 'warn' },
  inactive: { label: 'Inactive', tone: 'muted' },
  changes_requested: { label: 'Fixing feedback', tone: 'active' },
}

/** A first draft of a nudge, based on why the student needs help. */
export function suggestNudge(row) {
  const first = row.student.display_name.split(' ')[0]
  if (row.overdue?.length) {
    const late = row.overdue[0]
    return late.kind === 'lesson'
      ? `Hi ${first}, "${late.title}" is past its due date. Want to go through it together?`
      : `Hi ${first}, "${late.title}" is past its due date. Anything I can help with? Hand in what you have, even if it isn't finished.`
  }
  if (row.flags.includes('inactive')) {
    return `Hi ${first}, haven't seen you in a while. Want to pick up where you left off together this week?`
  }
  if (row.changes_requested?.length) {
    return `Hi ${first}, just checking in on the changes for "${row.changes_requested[0].title}". Shout if anything in my feedback is unclear.`
  }
  return `Hi ${first}, how is it going? Let me know if anything is getting in the way.`
}

export function errorText(err, fallback = 'Something went wrong. Try again.') {
  return err?.data?.error || err?.message || fallback
}
