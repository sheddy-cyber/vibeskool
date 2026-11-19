/* Turns the plain strings stored for a lesson into structure the page can
   lay out: readable paragraphs, inline code, mission steps and prompt
   placeholders. Pure functions, no React. */

/** Long bodies are stored as one paragraph. Break them at sentence ends
    into chunks of roughly three sentences so they read comfortably. */
export function splitParagraphs(body = '', target = 380) {
  const text = String(body).trim()
  if (!text) return []
  if (text.includes('\n')) return text.split(/\n{1,}/).map((p) => p.trim()).filter(Boolean)
  if (text.length <= target + 120) return [text]

  // Sentence ends: . ! ? followed by space and a capital, quote or tag
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z"“(<])/)
  const out = []
  let cur = ''
  sentences.forEach((s) => {
    if (cur && cur.length + s.length > target) {
      out.push(cur)
      cur = s
    } else {
      cur = cur ? `${cur} ${s}` : s
    }
  })
  if (cur) {
    // Avoid a lonely short last paragraph
    if (out.length && cur.length < 120) out[out.length - 1] += ` ${cur}`
    else out.push(cur)
  }
  return out
}

/** Marks HTML tags written inside prose (e.g. <img>, </p>) as inline code. */
export function inlineTokens(text = '') {
  const parts = []
  const re = /<\/?[a-zA-Z!][^<>]{0,60}>/g
  let last = 0
  let m
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ type: 'text', text: text.slice(last, m.index) })
    parts.push({ type: 'code', text: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) })
  return parts
}

const COMMAND_START = /^(pwd|ls|cd|mkdir|touch|rm|cp|mv|cat|echo|git|npm|npx|node|curl|ping|nslookup|code)\b(?!\s+into\b)/

const CMD_LABEL =/(?:^|[.!?]\s+|\s)(?:then\s+)?(?:try|type|run)\s*:\s*/gi

/**
 * Missions come in three shapes:
 *  - commands to run ("Type: curl -I … — explanation. Then try: …")
 *  - a chain of steps ("Create a folder → cd into it → git init …")
 *  - a task in prose ("Write an Express server that …")
 */
export function parseMission(raw) {
  const text = typeof raw === 'string' ? raw.trim() : raw?.text || raw?.mission || ''
  if (!text) return null

  // Commands
  const labels = [...text.matchAll(CMD_LABEL)]
  if (labels.length) {
    const intro = text.slice(0, labels[0].index).trim()
    const steps = labels.map((m, i) => {
      const start = m.index + m[0].length
      const end = i + 1 < labels.length ? labels[i + 1].index : text.length
      const chunk = text.slice(start, end).trim()
      const dash = chunk.search(/\s[—–]\s|\s-\s/)
      const cmd = (dash >= 0 ? chunk.slice(0, dash) : chunk.split(/\.\s/)[0]).trim().replace(/[.,;]$/, '')
      const note = dash >= 0 ? chunk.slice(dash).replace(/^\s*[—–-]\s*/, '').trim() : chunk.slice(cmd.length).replace(/^[.\s]+/, '').trim()
      const tidy = note ? note.charAt(0).toUpperCase() + note.slice(1) : ''
      return { cmd, note: tidy && !/[.!?:)"”]$/.test(tidy) ? `${tidy}.` : tidy }
    }).filter((s) => s.cmd)
    if (steps.length) return { kind: 'commands', intro, steps }
  }

  // Chain of steps
  const chain = text.split(/\s+→\s+/)
  if (chain.length >= 3) {
    const lastRaw = chain[chain.length - 1]
    const dot = lastRaw.indexOf('. ')
    const steps = [...chain.slice(0, -1), dot >= 0 ? lastRaw.slice(0, dot) : lastRaw]
    const outro = dot >= 0 ? lastRaw.slice(dot + 2).trim() : ''
    // "Work through these in order: pwd" -> intro + first step
    let intro = ''
    const colon = steps[0].indexOf(': ')
    if (colon > 0) {
      intro = steps[0].slice(0, colon).trim()
      steps[0] = steps[0].slice(colon + 2)
    }
    return {
      kind: 'chain',
      intro,
      steps: steps.map((s) => {
        const t = s.trim()
        return { text: t, isCmd: COMMAND_START.test(t) }
      }),
      outro,
    }
  }

  // Task in prose: first sentence is the task, the rest is detail
  const [first, ...rest] = text.split(/(?<=[.!?])\s+(?=[A-Z])/)
  return { kind: 'task', task: first, detail: rest.join(' ') }
}

/** Splits a prompt into text and [placeholder] parts. */
export function promptParts(prompt = '') {
  const parts = []
  const re = /\[[^\]]{1,60}\]/g
  let last = 0
  let m
  while ((m = re.exec(prompt))) {
    if (m.index > last) parts.push({ type: 'text', text: prompt.slice(last, m.index) })
    parts.push({ type: 'slot', text: m[0] })
    last = m.index + m[0].length
  }
  if (last < prompt.length) parts.push({ type: 'text', text: prompt.slice(last) })
  return parts
}

/** Guess which language the scratchpad should open in for this lesson. */
export function scratchLanguage(lesson) {
  const id = String(lesson?.id || '')
  const t = `${lesson?.title || ''} ${lesson?.part || ''}`.toLowerCase()
  if (/^m2a|html/.test(id) || /\bhtml\b/.test(t)) return 'html'
  if (/^m2b|css/.test(id) || /\bcss\b/.test(t)) return 'html'
  return 'js'
}

/** URL-safe id for a heading */
export function slug(text = '', i = 0) {
  const s = String(text).toLowerCase().replace(/<[^>]*>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)
  return `s${i + 1}-${s || 'part'}`
}
