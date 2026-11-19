/* Builds one attempt at a skill check.

   Answer positions are dealt, not left to chance: across an attempt the
   correct answer lands on A, B, C and D equally often (as near as the
   question count allows), in a random order. Pure random shuffling can
   still produce runs like "B, B, B"; dealing removes position as a clue
   while staying unpredictable. A new deal is made for every attempt. */

function randInt(n) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] % n
  }
  return Math.floor(Math.random() * n)
}

export function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** "Question text\n\ncode" -> { prompt, code } */
export function splitQuestion(text = '') {
  const s = String(text)
  const i = s.indexOf('\n\n')
  if (i < 0) return { prompt: s.trim(), code: null }
  return { prompt: s.slice(0, i).trim(), code: s.slice(i + 2).replace(/\s+$/, '') }
}

export function buildAttempt(questions = []) {
  const optionCounts = questions.map((q) => q.options.length)
  const minOptions = Math.min(...optionCounts)

  // Deal target slots for the correct answers: 0,1,2,3,0,1,2,3… then shuffle
  const slots = shuffle(questions.map((_, i) => i % minOptions))

  return questions.map((q, qi) => {
    const right = q.options.find((o) => o.correct)
    const wrong = shuffle(q.options.filter((o) => !o.correct))
    const target = Math.min(slots[qi], q.options.length - 1)
    const options = [...wrong]
    options.splice(target, 0, right)
    const { prompt, code } = splitQuestion(q.question)
    return {
      id: q.id,
      topic: q.topic,
      prompt,
      code: q.code || code,
      explanation: q.explanation,
      options: options.map((o) => ({ text: o.text, correct: !!o.correct })),
      answer: target,
    }
  })
}

export const PASS_MARK = 70
