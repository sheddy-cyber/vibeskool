/* Python in the browser, for checking exercises (Pyodide, Python 3.13).

   Pyodide (about 11 MB) is downloaded the first time someone checks a Python
   exercise, then the browser keeps it cached. It runs in a Web Worker, so
   the page stays responsive, and a run that takes too long (an endless loop)
   is stopped by ending the worker; the next run starts a fresh one. */

const VERSION = '0.29.5'
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`
const TIMEOUT_MS = 8000

const WORKER_SRC = `
importScripts(${JSON.stringify(INDEX_URL)} + 'pyodide.js');
const ready = loadPyodide({ indexURL: ${JSON.stringify(INDEX_URL)} }).then(async (py) => {
  py.setStdin({ error: true });  // input() has no keyboard here
  await py.runPythonAsync(\`
import sys, io, json

def _vs_run(code, exprs):
    results = []
    for expr in exprs:
        ns = {'__name__': '__main__'}
        out, old = io.StringIO(), sys.stdout
        sys.stdout = out
        actual, error = '', ''
        try:
            exec(compile(code, 'main.py', 'exec'), ns)
            if expr:
                out.seek(0)
                out.truncate(0)
                try:
                    print(eval(compile(expr, '<test>', 'eval'), ns))
                except BaseException as e:
                    error = f'{type(e).__name__}: {e}'
            actual = out.getvalue()
        except BaseException as e:
            error = f'{type(e).__name__}: {e}'
        finally:
            sys.stdout = old
        results.append({'actual': actual.strip(), 'error': error})
    return json.dumps(results)
\`);
  return py;
});
self.onmessage = async (e) => {
  const { id, code, exprs } = e.data;
  try {
    const py = await ready;
    postMessage({ id, kind: 'ready' });
    const run = py.globals.get('_vs_run');
    const json = run(code, py.toPy(exprs));
    run.destroy();
    postMessage({ id, kind: 'done', results: JSON.parse(json) });
  } catch (err) {
    postMessage({ id, kind: 'failed', message: String(err && err.message || err) });
  }
};
`

let worker = null
let loaded = false
let seq = 0

function getWorker() {
  if (!worker) {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }))
    worker = new Worker(url)
    loaded = false
  }
  return worker
}

function reset() {
  worker?.terminate()
  worker = null
  loaded = false
}

/** Runs the code once per expression; returns [{ actual, error }] in order. */
export function runPython(code, exprs, { onLoading } = {}) {
  const w = getWorker()
  if (!loaded) onLoading?.(true)
  const id = ++seq
  return new Promise((resolve) => {
    // Loading Pyodide can take a while on a slow connection, so the clock for
    // an endless loop only starts once it's ready
    let timer = null
    const finish = (results) => {
      clearTimeout(timer)
      w.removeEventListener('message', onMessage)
      onLoading?.(false)
      resolve(results)
    }
    const all = (error) => exprs.map(() => ({ actual: '', error }))
    const onMessage = (e) => {
      const m = e.data
      if (m.id !== id) return
      if (m.kind === 'ready') {
        loaded = true
        onLoading?.(false)
        timer = setTimeout(() => {
          reset()
          finish(all(`Your code was still running after ${TIMEOUT_MS / 1000} seconds, so it was stopped. A loop that never ends is the usual cause.`))
        }, TIMEOUT_MS)
      } else if (m.kind === 'done') {
        finish(m.results)
      } else if (m.kind === 'failed') {
        reset()
        finish(all(/load|fetch|network|importScripts/i.test(m.message)
          ? "Python couldn't load in this browser. Check your connection and try again."
          : m.message))
      }
    }
    w.addEventListener('message', onMessage)
    w.onerror = () => { reset(); finish(all("Python couldn't start in this browser. Check your connection and try again.")) }
    w.postMessage({ id, code, exprs })
  })
}
