import { runNode } from '@/lib/shell/node'

/* Run JavaScript test cases in the browser, in the same sandboxed worker the
   Playground uses. Each case prints one expression after the code, and what
   it prints is compared with the expected output, exactly like the server.

   Used by tutors to check an exercise while writing it. (Students' answers
   are checked on the server, so they can't mark their own work.) */
export async function runJsTests(code, cases) {
  const results = []
  for (const tc of cases) {
    const out = []
    const err = []
    const writer = {
      print: (text = '', tone) => (tone === 'err' ? err : out).push(String(text)),
      note: () => {},
    }
    await runNode({ code: `${code}\nconsole.log(${tc.input})`, filename: 'solution.js', out: writer, timeout: 4000 })
    const actual = out.join('\n').trim()
    results.push({
      input: tc.input,
      expected: tc.expected_output,
      actual,
      passed: actual === String(tc.expected_output ?? '').trim(),
      stderr: err.filter(Boolean).join('\n'),
    })
  }
  const ok = results.filter((r) => r.passed).length
  const score = results.length ? Math.round((ok / results.length) * 100) : 0
  return { passed: results.length > 0 && ok === results.length, score, results }
}
