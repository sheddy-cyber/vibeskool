import { runNode } from '@/lib/shell/node'
import { runPython } from '@/lib/pyodide'

/* Runs an exercise's test cases in the browser.

   Each test is an expression (like `add(1, 2)`) evaluated after the code, and
   what it prints is compared with the expected output. A test with no
   expression compares what the code itself prints. This is how exercises are
   checked when the server has no code runner (Judge0) set up, and how tutors
   try their tests while writing them.

   JavaScript runs in the same sandboxed worker the Playground uses; Python
   runs in Pyodide, in its own worker. Both are stopped if they run too long.

   Returns { passed, score, results: [{ input, expected, actual, passed, stderr }] } */

const same = (actual, expected) => String(actual ?? '').trim() === String(expected ?? '').trim()

function summarise(cases, outputs) {
  const results = cases.map((tc, i) => {
    const { actual = '', error = '' } = outputs[i] || {}
    return {
      input: tc.input,
      expected: tc.expected_output,
      actual,
      passed: !error && same(actual, tc.expected_output),
      stderr: error,
    }
  })
  const ok = results.filter((r) => r.passed).length
  const score = results.length ? Math.round((ok / results.length) * 100) : 0
  return { passed: results.length > 0 && ok === results.length, score, results }
}

async function runJsCase(code, expr) {
  // A random marker separates what the code prints from what the test prints
  const marker = `<<VS-${Math.random().toString(36).slice(2)}>>`
  const out = []
  const err = []
  const writer = {
    print: (text = '', tone) => (tone === 'err' ? err : out).push(String(text)),
    note: () => {},
  }
  const program = expr
    ? `${code}\n;console.log(${JSON.stringify(marker)});console.log((\n${expr}\n));`
    : code
  await runNode({ code: program, filename: 'solution.js', out: writer, timeout: 4000 })
  const text = out.join('\n')
  const at = text.indexOf(marker)
  const actual = expr ? (at >= 0 ? text.slice(at + marker.length) : '') : text
  const error = err.filter((line) => line.trim()).join('\n')
  return { actual: actual.trim(), error: at < 0 && expr && !error ? 'Your code stopped before this test ran.' : error }
}

export async function runJsTests(code, cases) {
  const outputs = []
  for (const tc of cases) outputs.push(await runJsCase(code, String(tc.input || '').trim()))
  return summarise(cases, outputs)
}

export async function runPythonTests(code, cases, { onLoading } = {}) {
  const outputs = await runPython(code, cases.map((tc) => String(tc.input || '').trim()), { onLoading })
  return summarise(cases, outputs)
}

export function runTests(language, code, cases, options) {
  if (language === 'python') return runPythonTests(code, cases, options)
  return runJsTests(code, cases)
}
