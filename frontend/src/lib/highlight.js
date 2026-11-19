/* Static syntax highlighting for lesson code samples.
   Uses the same Lezer parsers as the editor, so colours match what the
   learner sees when they type. Shell snippets get a tiny hand-written pass. */

import { highlightCode, classHighlighter } from '@lezer/highlight'
import { jsxLanguage } from '@codemirror/lang-javascript'
import { htmlLanguage } from '@codemirror/lang-html'
import { cssLanguage } from '@codemirror/lang-css'
import { pythonLanguage } from '@codemirror/lang-python'

export const LANG_LABEL = {
  html: 'HTML',
  css: 'CSS',
  js: 'JavaScript',
  json: 'JSON',
  python: 'Python',
  shell: 'Terminal',
  http: 'HTTP',
  text: 'Text',
}

const SHELL_CMD = /^\s*(\$\s+)?(git|npm|npx|node|curl|mkdir|touch|nslookup|ping|pwd|ls|cd|echo|cat|rm|cp|mv|pip|python3?|code|brew|sudo|chmod|export|ssh|openssl|vercel|netlify|psql|yarn|pnpm)\b/m

/** Best guess at the language of a snippet from its content. */
export function detectLanguage(code = '') {
  const src = String(code).trim()
  if (!src) return 'text'
  if ((src.startsWith('{') || src.startsWith('[')) && (() => { try { JSON.parse(src); return true } catch { return false } })()) return 'json'
  if (/^\s*(def |class \w+\s*[:(]|import \w+\s*$|from \w+ import|print\()/m.test(src) && !/[;{}]\s*$/m.test(src)) return 'python'
  if (/^\s*(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+\s+HTTP\/\d|^\s*HTTP\/\d(\.\d)?\s+\d{3}/m.test(src)) return 'http'
  if (SHELL_CMD.test(src) && !/(=>|function\s|const\s|let\s|;\s*$)/m.test(src)) return 'shell'
  if (/^\s*(<!--|<!DOCTYPE|<[a-zA-Z])/i.test(src)) return 'html'
  const cssProps = (src.match(/^\s*[a-z-]+\s*:\s*[^;]+;\s*$/gm) || []).length
  if (cssProps >= 2 && /\{/.test(src) && !/(=>|function\s|const\s|let\s|return\s)/.test(src)) return 'css'
  if (/^\s*(@media|@import|:root|[.#][\w-]+\s*\{|\*\s*\{|[a-z]+\s*\{)/m.test(src) && cssProps >= 1 && !/(=>|function\s|const\s)/.test(src)) return 'css'
  return 'js'
}

const PARSERS = {
  html: () => htmlLanguage.parser,
  css: () => cssLanguage.parser,
  js: () => jsxLanguage.parser,
  json: () => jsxLanguage.parser,
  python: () => pythonLanguage.parser,
}

/** Shell: comments, the command word, flags and quoted strings. */
function shellLine(line) {
  const out = []
  const hash = line.search(/(^|\s)#/)
  const body = hash >= 0 ? line.slice(0, hash) : line
  const comment = hash >= 0 ? line.slice(hash) : ''
  let first = true
  body.split(/(\s+|"[^"]*"|'[^']*')/).forEach((tok) => {
    if (!tok) return
    if (/^\s+$/.test(tok)) out.push({ text: tok })
    else if (/^["']/.test(tok)) out.push({ text: tok, cls: 'tok-string' })
    else if (tok === '$' && first) out.push({ text: tok, cls: 'tok-prompt' })
    else if (first) { out.push({ text: tok, cls: 'tok-command' }); first = false }
    else if (/^--?[\w-]+/.test(tok)) out.push({ text: tok, cls: 'tok-flag' })
    else if (/^(https?:\/\/|\.{0,2}\/)/.test(tok)) out.push({ text: tok, cls: 'tok-url' })
    else if (/^(\||&&|>|>>|;)$/.test(tok)) { out.push({ text: tok, cls: 'tok-operator' }); first = true }
    else out.push({ text: tok })
  })
  if (comment) out.push({ text: comment, cls: 'tok-comment' })
  return out
}

/** HTTP messages: request/status line, header names, comments, JSON body */
function httpLine(line) {
  if (/^\s*(\/\/|#)/.test(line)) return [{ text: line, cls: 'tok-comment' }]
  let m = /^(\s*)(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)(\s+)(\S+)(\s+)(HTTP\/[\d.]+)(.*)$/.exec(line)
  if (m) return [{ text: m[1] }, { text: m[2], cls: 'tok-keyword' }, { text: m[3] }, { text: m[4], cls: 'tok-url' }, { text: m[5] }, { text: m[6], cls: 'tok-meta' }, { text: m[7] }]
  m = /^(\s*)(HTTP\/[\d.]+)(\s+)(\d{3})(.*)$/.exec(line)
  if (m) return [{ text: m[1] }, { text: m[2], cls: 'tok-meta' }, { text: m[3] }, { text: m[4], cls: 'tok-number' }, { text: m[5], cls: 'tok-string' }]
  m = /^([\w-]+)(:)(.*)$/.exec(line)
  if (m) return [{ text: m[1], cls: 'tok-propertyName' }, { text: m[2], cls: 'tok-punctuation' }, { text: m[3] }]
  if (/^\s*[{[]/.test(line)) {
    const out = []
    highlightCode(line, jsxLanguage.parser.parse(line), classHighlighter, (text, cls) => out.push({ text, cls }), () => {})
    return out
  }
  return [{ text: line }]
}

/**
 * Returns the code as lines of { text, cls } tokens.
 * @param {string} code
 * @param {string} lang one of LANG_LABEL's keys
 */
export function highlightLines(code = '', lang = 'js') {
  const src = String(code).replace(/\t/g, '  ')
  if (lang === 'shell') return src.split('\n').map(shellLine)
  if (lang === 'http') return src.split('\n').map(httpLine)
  const getParser = PARSERS[lang]
  if (!getParser) return src.split('\n').map((l) => [{ text: l }])

  const lines = [[]]
  try {
    const tree = getParser().parse(src)
    highlightCode(
      src,
      tree,
      classHighlighter,
      (text, cls) => lines[lines.length - 1].push({ text, cls }),
      () => lines.push([]),
    )
    return lines
  } catch {
    return src.split('\n').map((l) => [{ text: l }])
  }
}
