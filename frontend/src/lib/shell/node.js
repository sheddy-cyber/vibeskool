/* Runs a JavaScript file the way `node file.js` would, inside a Web Worker.
   A worker can be stopped at any time, so an infinite loop never freezes the
   page: it is ended after a timeout or when the learner presses Ctrl+C. */

const BUILTIN = ['fs', 'path', 'http', 'os', 'child_process', 'crypto', 'url', 'events']

const WORKER_SRC = `
const send = (kind, text) => postMessage({ kind, text });
const fmt = (v) => {
  if (typeof v === 'string') return v;
  if (v instanceof Error) return v.stack || String(v);
  try { return JSON.stringify(v, null, 2) ?? String(v); } catch { return String(v); }
};
const join = (args) => Array.from(args).map(fmt).join(' ');
self.console = {
  log: (...a) => send('out', join(a)),
  info: (...a) => send('out', join(a)),
  debug: (...a) => send('out', join(a)),
  table: (...a) => send('out', join(a)),
  warn: (...a) => send('warn', join(a)),
  error: (...a) => send('err', join(a)),
};
self.onmessage = async (e) => {
  const { code, filename, argv, builtins } = e.data;
  const require = (name) => {
    const err = new Error(builtins.includes(name)
      ? "The '" + name + "' module isn't available in this playground"
      : "Cannot find module '" + name + "'");
    err.code = 'MODULE_NOT_FOUND';
    err.__module = name;
    throw err;
  };
  const process = { argv: ['node', filename, ...argv], env: { NODE_ENV: 'development' }, exit: (c = 0) => { throw { __exit: c }; }, platform: 'linux', version: 'v20.11.1' };
  const module = { exports: {} };
  try {
    const fn = new Function('require', 'process', 'module', 'exports', '__filename', '"use strict";\\n' + code);
    const result = fn(require, process, module, module.exports, filename);
    if (result && typeof result.then === 'function') await result;
    setTimeout(() => postMessage({ kind: 'done', code: 0 }), 30);
  } catch (err) {
    if (err && err.__exit !== undefined) { postMessage({ kind: 'done', code: err.__exit }); return; }
    const stack = String(err && err.stack || '');
    const m = /<anonymous>:(\\d+):(\\d+)/.exec(stack);
    postMessage({ kind: 'crash', name: err && err.name || 'Error', message: err && err.message || String(err), line: m ? Number(m[1]) - 3 : null, module: err && err.__module || null });
  }
};
`

let workerUrl = null
const getUrl = () => {
  if (!workerUrl) workerUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }))
  return workerUrl
}

/**
 * @returns {Promise<number>} exit code
 */
export function runNode({ code, filename, argv = [], out, signal, timeout = 6000 }) {
  return new Promise((resolveExit) => {
    let worker
    try {
      worker = new Worker(getUrl())
    } catch {
      out.print('node: unable to start a JavaScript worker in this browser', 'err')
      resolveExit(1)
      return
    }
    let done = false
    const finish = (codeOut) => {
      if (done) return
      done = true
      clearTimeout(timer)
      worker.terminate()
      signal?.removeEventListener('abort', onAbort)
      resolveExit(codeOut)
    }
    const onAbort = () => finish(130)
    const timer = setTimeout(() => {
      out.print(`\nnode: ${filename} was still running after ${timeout / 1000}s, so it was stopped.`, 'err')
      out.note('This usually means a loop never ends. Check that its condition eventually becomes false.')
      finish(124)
    }, timeout)
    signal?.addEventListener('abort', onAbort)

    worker.onmessage = (e) => {
      const m = e.data
      if (m.kind === 'out') out.print(m.text)
      else if (m.kind === 'warn') out.print(m.text, 'warn')
      else if (m.kind === 'err') out.print(m.text, 'err')
      else if (m.kind === 'done') finish(m.code)
      else if (m.kind === 'crash') {
        const lines = code.split('\n')
        out.print('')
        if (m.line && lines[m.line - 1] !== undefined) {
          out.print(`${filename}:${m.line}`, 'err')
          out.print(lines[m.line - 1], 'err')
          out.print('')
        }
        out.print(`${m.name}: ${m.message}`, 'err')
        if (m.module) {
          out.note(BUILTIN.includes(m.module)
            ? `Node's built-in ${m.module} module can't run in a browser playground. Try this on your own machine.`
            : `Node can't find the ${m.module} package. Packages added with npm install here are recorded in package.json, but their code isn't downloaded.`)
        } else if (m.name === 'ReferenceError') {
          out.note(`Something is used before it exists${m.line ? ` on line ${m.line}` : ''}. It is often a typo in a name, or a variable declared further down.`)
        } else if (m.name === 'SyntaxError') {
          out.note('Node could not read the code. Look for a missing bracket, quote or comma.')
        } else if (m.name === 'TypeError') {
          out.note(`A value wasn't the type the code expected${m.line ? ` on line ${m.line}` : ''}, for example calling something that isn't a function.`)
        }
        finish(1)
      }
    }
    worker.onerror = (e) => {
      e.preventDefault?.()
      out.print(`SyntaxError: ${e.message?.replace(/^Uncaught (SyntaxError: )?/, '') || 'Invalid or unexpected token'}`, 'err')
      out.note('Node could not read the code. Look for a missing bracket, quote or comma.')
      finish(1)
    }
    worker.postMessage({ code, filename, argv, builtins: BUILTIN })
  })
}
