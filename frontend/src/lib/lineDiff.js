/* Line-by-line differences between two versions of some code.

   diffLines(before, after) returns rows in reading order:
     { type: 'same' | 'add' | 'del', text, a, b }
   where `a` is the 1-based line in `before` and `b` the line in `after`
   (null on the side the line isn't in). Within a change, removed lines come
   before the lines that replaced them, like a code review. */

const MAX_CELLS = 2_500_000 // beyond this, show the middle as replaced wholesale

export const splitLines = (code = '') => String(code).replace(/\r\n?/g, '\n').split('\n')

export function diffLines(before = '', after = '') {
  const A = splitLines(before)
  const B = splitLines(after)
  const rows = []

  // Matching lines at the start and end don't need the full comparison
  let start = 0
  while (start < A.length && start < B.length && A[start] === B[start]) start++
  let endA = A.length
  let endB = B.length
  while (endA > start && endB > start && A[endA - 1] === B[endB - 1]) { endA--; endB-- }

  for (let i = 0; i < start; i++) rows.push({ type: 'same', text: B[i], a: i + 1, b: i + 1 })

  const n = endA - start
  const m = endB - start
  if (n * m > MAX_CELLS) {
    for (let i = 0; i < n; i++) rows.push({ type: 'del', text: A[start + i], a: start + i + 1, b: null })
    for (let j = 0; j < m; j++) rows.push({ type: 'add', text: B[start + j], a: null, b: start + j + 1 })
  } else {
    // Longest common subsequence, filled from the end so we can walk forwards
    const w = m + 1
    const lcs = new Uint32Array((n + 1) * w)
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        lcs[i * w + j] = A[start + i] === B[start + j]
          ? lcs[(i + 1) * w + j + 1] + 1
          : Math.max(lcs[(i + 1) * w + j], lcs[i * w + j + 1])
      }
    }
    let i = 0
    let j = 0
    while (i < n || j < m) {
      if (i < n && j < m && A[start + i] === B[start + j]) {
        rows.push({ type: 'same', text: B[start + j], a: start + i + 1, b: start + j + 1 }); i++; j++
      } else if (j >= m || (i < n && lcs[(i + 1) * w + j] >= lcs[i * w + j + 1])) {
        rows.push({ type: 'del', text: A[start + i], a: start + i + 1, b: null }); i++
      } else {
        rows.push({ type: 'add', text: B[start + j], a: null, b: start + j + 1 }); j++
      }
    }
  }

  for (let k = 0; k < A.length - endA; k++) {
    rows.push({ type: 'same', text: A[endA + k], a: endA + k + 1, b: endB + k + 1 })
  }
  return rows
}

export function diffStats(rows) {
  let added = 0
  let removed = 0
  for (const r of rows) {
    if (r.type === 'add') added++
    else if (r.type === 'del') removed++
  }
  return { added, removed, changed: added + removed > 0 }
}

/* Move line notes from one version of the code to the next. A note stays on
   its line when the line survives; when the line was removed or rewritten,
   it moves to whatever took its place (or the nearest line before it). */
export function moveNotes(notes, before, after) {
  if (!notes.length || before === after) return notes
  const rows = diffLines(before, after)
  const target = new Map()
  let lastB = 0
  let pending = []
  for (const r of rows) {
    if (r.type === 'del') { pending.push(r.a); continue }
    if (r.b != null) {
      if (r.type === 'same') target.set(r.a, r.b)
      for (const a of pending) target.set(a, r.b)
      pending = []
      lastB = r.b
    }
  }
  for (const a of pending) target.set(a, Math.max(lastB, 1))

  // One note per line: notes that land on the same line are joined
  const byLine = new Map()
  for (const n of notes) {
    const line = target.get(n.line) ?? Math.min(n.line, splitLines(after).length)
    byLine.set(line, byLine.has(line) ? `${byLine.get(line)}\n\n${n.body}` : n.body)
  }
  return [...byLine].map(([line, body]) => ({ line, body })).sort((x, y) => x.line - y.line)
}
