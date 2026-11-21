/* Skill check helpers. The questions, the dealing of answer positions and the
   marking all live on the server (see skillCheckApi in lib/api.js). */

/** "Question text\n\ncode" -> { prompt, code } */
export function splitQuestion(text = '') {
  const s = String(text)
  const i = s.indexOf('\n\n')
  if (i < 0) return { prompt: s.trim(), code: null }
  return { prompt: s.slice(0, i).trim(), code: s.slice(i + 2).replace(/\s+$/, '') }
}

// Shown before the server has answered; the server's own pass mark wins
export const PASS_MARK = 70
