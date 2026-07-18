// Simulate the CodeBlock rendering to find any crash

import { LESSONS_CONTENT } from './src/lib/store.js';

const kw = new Set(['function','return','const','let','var','if','else','for','while','async','await','import','export','default','class','new','this','from','of','in','typeof','instanceof']);

function tokenize(text, kw) {
  const tokens = text.split(/(\b(?:[A-Z][a-zA-Z0-9_]*)(?=\s*\()|\b(const|let|var|function|return|if|else|for|while|async|await|import|export|default|class|new|this|from|of|in|typeof|instanceof)\b|(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;|`[^`]*?`))/)
  return tokens.filter(Boolean).map((t, i) => {
    if (kw.has(t)) return { type: 'kw', text: t }
    if (/^[A-Z][a-zA-Z0-9_]*$/.test(t)) return { type: 'fn', text: t }
    if (/^["'`]/.test(t)) return { type: 'str', text: t }
    return { type: 'text', text: t }
  })
}

function highlightLine(line) {
  if (/^\s*\/\//.test(line)) {
    return { type: 'comment', text: line }
  }
  const parts = line.split(/(\/\/.*)/)
  if (parts.length === 1) return { type: 'code', tokens: tokenize(line, kw) }
  return { type: 'code-comment', code: tokenize(parts[0], kw), comment: parts[1] }
}

const dom = LESSONS_CONTENT['m2c-js-dom-fetch'];
for (const sec of dom.sections) {
  if (!sec.code) continue;
  const lines = sec.code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    try {
      const result = highlightLine(lines[i]);
      if (result.type === 'code' && result.tokens.some(t => t === null || t === undefined)) {
        console.log('NULL TOKEN at ' + sec.heading + ' line ' + i);
      }
    } catch (e) {
      console.log('CRASH at ' + sec.heading + ' line ' + i + ': ' + lines[i].substring(0, 80));
      console.log('Error:', e.message);
    }
  }
}

console.log('\nJS Fundamentals:');
const js = LESSONS_CONTENT['m2c-js-fundamentals'];
for (const sec of js.sections) {
  if (!sec.code) continue;
  const lines = sec.code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    try {
      highlightLine(lines[i]);
    } catch (e) {
      console.log('CRASH at ' + sec.heading + ' line ' + i + ': ' + lines[i].substring(0, 80));
      console.log('Error:', e.message);
    }
  }
}

console.log('All simulated render checks passed');
