/* Simulated network tools. The playground is offline, so these return
   realistic responses for a few practice addresses used in the lessons,
   and say plainly when an address can't be reached. */

const HOSTS = {
  'example.com': '93.184.215.14',
  'www.example.com': '93.184.215.14',
  'google.com': '142.250.180.14',
  'www.google.com': '142.250.180.4',
  'jsonplaceholder.typicode.com': '104.21.48.207',
  'github.com': '140.82.121.3',
  'api.github.com': '140.82.121.6',
}

const EXAMPLE_HTML = `<!doctype html>
<html>
<head>
    <title>Example Domain</title>
    <meta charset="utf-8" />
</head>
<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents.</p>
</div>
</body>
</html>`

const NOT_FOUND_HTML = `<!doctype html>
<html>
<head><title>404 - Not Found</title></head>
<body><h1>404 - Not Found</h1></body>
</html>`

const TODOS = ['delectus aut autem', 'quis ut nam facilis et officia qui', 'fugiat veniam minus', 'et porro tempora', 'laboriosam mollitia et enim quasi adipisci quia provident illum']

function httpDate() {
  return new Date().toUTCString()
}

function respond(url) {
  const host = url.hostname
  const path = url.pathname.replace(/\/+$/, '') || '/'
  if (host === 'example.com' || host === 'www.example.com') {
    if (path === '/' || path === '/index.html') {
      return { status: 200, reason: 'OK', type: 'text/html; charset=UTF-8', body: EXAMPLE_HTML, extra: ['cache-control: max-age=604800', 'server: ECS (nyd/D11F)'] }
    }
    return { status: 404, reason: 'Not Found', type: 'text/html; charset=UTF-8', body: NOT_FOUND_HTML, extra: ['server: ECS (nyd/D11F)'] }
  }
  if (host === 'google.com') {
    return { status: 301, reason: 'Moved Permanently', type: 'text/html; charset=UTF-8', body: '<HTML><HEAD><TITLE>301 Moved</TITLE></HEAD><BODY>The document has moved <A HREF="https://www.google.com/">here</A>.</BODY></HTML>', extra: [`location: https://www.google.com${url.pathname}`] }
  }
  if (host === 'www.google.com') {
    return { status: 200, reason: 'OK', type: 'text/html; charset=ISO-8859-1', body: '<!doctype html><html><head><title>Google</title></head><body>…</body></html>', extra: ['server: gws'] }
  }
  if (host === 'jsonplaceholder.typicode.com') {
    let m = /^\/todos\/(\d+)$/.exec(path)
    if (m && +m[1] >= 1 && +m[1] <= 200) {
      const id = +m[1]
      const body = JSON.stringify({ userId: Math.ceil(id / 20), id, title: TODOS[(id - 1) % TODOS.length], completed: id % 3 === 0 }, null, 2)
      return { status: 200, reason: 'OK', type: 'application/json; charset=utf-8', body, extra: ['access-control-allow-origin: *'] }
    }
    m = /^\/users\/(\d+)$/.exec(path)
    if (m && +m[1] >= 1 && +m[1] <= 10) {
      const body = JSON.stringify({ id: +m[1], name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' }, null, 2)
      return { status: 200, reason: 'OK', type: 'application/json; charset=utf-8', body, extra: ['access-control-allow-origin: *'] }
    }
    if (path === '/todos') {
      const body = JSON.stringify([1, 2, 3].map((id) => ({ userId: 1, id, title: TODOS[id - 1], completed: false })), null, 2).replace(/\n]$/, ',\n  …\n]')
      return { status: 200, reason: 'OK', type: 'application/json; charset=utf-8', body, extra: [] }
    }
    return { status: 404, reason: 'Not Found', type: 'application/json; charset=utf-8', body: '{}', extra: [] }
  }
  if (host === 'api.github.com' || host === 'github.com') {
    return { status: 200, reason: 'OK', type: 'application/json; charset=utf-8', body: '{\n  "current_user_url": "https://api.github.com/user"\n}', extra: ['server: github.com'] }
  }
  return null
}

const NOTE_OFFLINE = 'The playground is offline, so it fakes replies for a few practice addresses: example.com, jsonplaceholder.typicode.com, google.com and github.com.'

export async function curl(args, out, { sleep }) {
  const flags = args.filter((a) => a.startsWith('-'))
  const target = args.find((a) => !a.startsWith('-'))
  const headOnly = flags.some((f) => f === '-I' || f === '--head')
  const include = flags.some((f) => f === '-i' || f === '--include')
  const follow = flags.some((f) => f === '-L' || f === '--location')
  if (!target) {
    out.print('curl: try \'curl --help\' for more information', 'err')
    return 2
  }
  let url
  try {
    url = new URL(/^[a-z]+:\/\//i.test(target) ? target : `http://${target}`)
  } catch {
    out.print(`curl: (3) URL rejected: Malformed input to a URL function`, 'err')
    return 3
  }
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    await sleep(120)
    out.print(`curl: (7) Failed to connect to ${url.hostname} port ${url.port || 80} after 0 ms: Couldn't connect to server`, 'err')
    out.note(`Nothing is listening on port ${url.port || 80} here. On your own machine, start your server first (for example with npm start), then try again.`)
    return 7
  }
  await sleep(260)
  let res = respond(url)
  if (!res) {
    if (!HOSTS[url.hostname] && !url.hostname.includes('.')) {
      out.print(`curl: (6) Could not resolve host: ${url.hostname}`, 'err')
      out.note("That isn't a full web address. Check the spelling, including the .com or .org part.")
      return 6
    }
    out.print(`curl: (6) Could not resolve host: ${url.hostname}`, 'err')
    out.note(NOTE_OFFLINE)
    return 6
  }
  if (follow && res.status >= 300 && res.status < 400) {
    const loc = res.extra.find((h) => h.startsWith('location: '))?.slice(10)
    if (loc) res = respond(new URL(loc)) || res
  }
  const proto = url.protocol === 'https:' ? 'HTTP/2' : 'HTTP/1.1'
  const head = () => {
    out.print(`${proto} ${res.status}${proto === 'HTTP/1.1' ? ` ${res.reason}` : ''}`, res.status < 300 ? 'ok' : res.status < 400 ? 'warn' : 'err')
    out.print(`content-type: ${res.type}`)
    out.print(`content-length: ${new Blob([res.body]).size}`)
    out.print(`date: ${httpDate()}`)
    res.extra.forEach((h) => out.print(h))
  }
  if (headOnly) { head(); return 0 }
  if (include) { head(); out.print('') }
  out.print(res.body)
  return 0
}

export async function ping(args, out, { sleep, signal }) {
  const host = args.find((a) => !a.startsWith('-'))
  if (!host) { out.print('ping: usage error: Destination address required', 'err'); return 1 }
  const ip = HOSTS[host] || (/^\d+\.\d+\.\d+\.\d+$/.test(host) ? host : null)
  if (!ip) {
    out.print(`ping: ${host}: Name or service not known`, 'err')
    out.note(HOSTS[host] === undefined && host.includes('.') ? NOTE_OFFLINE : "That name doesn't point to any server. Check the spelling.")
    return 2
  }
  const cIdx = args.indexOf('-c')
  const count = cIdx >= 0 ? Math.min(10, Number(args[cIdx + 1]) || 4) : 4
  out.print(`PING ${host} (${ip}) 56(84) bytes of data.`)
  const times = []
  for (let i = 1; i <= count; i += 1) {
    await sleep(520)
    if (signal.aborted) break
    const t = (11 + Math.random() * 6).toFixed(1)
    times.push(Number(t))
    out.print(`64 bytes from ${ip}: icmp_seq=${i} ttl=56 time=${t} ms`)
  }
  const n = times.length
  out.print('')
  out.print(`--- ${host} ping statistics ---`)
  out.print(`${n} packets transmitted, ${n} received, 0% packet loss`)
  if (n) {
    const avg = times.reduce((a, b) => a + b, 0) / n
    out.print(`rtt min/avg/max = ${Math.min(...times).toFixed(1)}/${avg.toFixed(1)}/${Math.max(...times).toFixed(1)} ms`)
  }
  return 0
}

export async function nslookup(args, out, { sleep }) {
  const host = args.find((a) => !a.startsWith('-'))
  if (!host) { out.print('Usage: nslookup <name>', 'err'); return 1 }
  await sleep(200)
  out.print('Server:\t\t8.8.8.8')
  out.print('Address:\t8.8.8.8#53')
  out.print('')
  const ip = HOSTS[host]
  if (!ip) {
    out.print(`** server can't find ${host}: NXDOMAIN`, 'err')
    out.note(host.includes('.') ? NOTE_OFFLINE : 'DNS has no record for that name. Check the spelling.')
    return 1
  }
  out.print('Non-authoritative answer:')
  out.print(`Name:\t${host}`)
  out.print(`Address: ${ip}`, 'ok')
  return 0
}
