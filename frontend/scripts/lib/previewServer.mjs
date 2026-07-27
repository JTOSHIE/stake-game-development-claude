// previewServer.mjs - TR-101, Fable's ruling 2026-07-28, option (c).
//
// Serves `dist/` from INSIDE the gate process. There is no child process, so
// there is nothing to orphan.
//
// WHAT THIS REPLACES, AND WHY MANAGING IT BETTER WAS THE WRONG ANSWER
// -------------------------------------------------------------------
// Eighteen scripts each carried their own copy of:
//
//     spawn('npx', ['vite', 'preview', ...], { detached: true })
//     ...
//     process.kill(-proc.pid, 'SIGTERM')
//
// The group signal does not reliably reach it. Measured at the close of one
// session: seven leaked preview servers, fourteen processes, eighteen held
// ports, plus two orphaned chromium groups.
//
// The worse half was already written down in this codebase as a symptom without
// being recognised as a cause. `layout_fit_gate.mjs`'s hard-timeout comment says
// it exactly: killing the `npx` wrapper orphans the real vite child, whose
// INHERITED STDOUT PIPE holds the parent's event loop open. So a gate that FAILS
// mid-run can hang forever. One `portrait_layout_conformance.mjs` process was
// found hung for 1 day 9 hours with five chromium attached, its log ending in a
// TimeoutError two days earlier.
//
// Fable ruled option (c) over port-reaping precisely because it DELETES the
// orphanable child rather than managing it. Port-reaping was approved only as a
// temporary guard during a staged migration, to be removed by the pass that
// completed it. This migration completed in one pass, so that guard was never
// written: there is no window for it to cover.
//
// THREE THINGS THIS GETS RIGHT THAT THE SPAWNED VERSION DID NOT
// --------------------------------------------------------------
// 1. NO PORT RACE. `getFreePort()` opened a socket, closed it, and handed the
//    number to a process that bound it a second later. Two gates starting at
//    once could be handed the same port. Here the server binds port 0 and
//    REPORTS what the kernel gave it, so the port cannot be taken in between.
// 2. SOCKETS ARE DESTROYED ON CLOSE. `server.close()` alone waits for every
//    keep-alive connection to drain, and a browser holds them open, so a naive
//    close is a hang of exactly the kind being removed. Every socket is tracked
//    and destroyed.
// 3. IT CANNOT SURVIVE THE PROCESS. If the gate dies, the server dies with it,
//    because it IS the gate. That is the whole ruling in one sentence.

import { createServer } from 'node:http'
import { createReadStream, statSync, existsSync } from 'node:fs'
import { join, extname, normalize, sep } from 'node:path'
import { execFileSync } from 'node:child_process'

/** Content types for everything the shipped bundle actually contains. */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.zst': 'application/zstd',
}

/**
 * Serve a directory over HTTP from this process.
 *
 * @param {string} root absolute path to the directory to serve, normally dist/
 * @returns {Promise<{ url: string, port: number, close: () => Promise<void> }>}
 */
export function startStaticServer(root) {
  if (!existsSync(root)) {
    throw new Error(`previewServer: ${root} does not exist. Run \`npm run build\` first.`)
  }

  /** Live sockets, so close() can destroy them rather than wait for a browser. */
  const sockets = new Set()

  const server = createServer((req, res) => {
    let pathname
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    } catch {
      res.writeHead(400).end('bad request')
      return
    }
    if (pathname.endsWith('/')) pathname += 'index.html'

    // PATH TRAVERSAL, refused rather than assumed impossible. The gate loads
    // URLs it composes itself today, but a served directory that can be walked
    // out of is a served directory that will eventually be walked out of.
    const rel = normalize(pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '')
    const file = join(root, rel)
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end('forbidden')
      return
    }

    let stat
    try {
      stat = statSync(file)
      if (stat.isDirectory()) throw new Error('directory')
    } catch {
      // A single-page app: an unknown path is the app's own route, so index.html
      // answers it. This mirrors `vite preview`'s behaviour, which the gates
      // were written against.
      const index = join(root, 'index.html')
      if (!existsSync(index)) { res.writeHead(404).end('not found'); return }
      const body = createReadStream(index)
      res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' })
      body.pipe(res)
      return
    }

    const type = TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream'
    const range = req.headers.range

    // RANGE, because a headless browser asks for it on media and answering 200
    // to a Range request makes some players stall rather than fail, which is the
    // worst way for a gate to be wrong.
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
      if (m) {
        const size = stat.size
        let start = m[1] === '' ? size - Number(m[2]) : Number(m[1])
        let end = m[2] === '' || m[1] === '' ? size - 1 : Number(m[2])
        start = Math.max(0, Math.min(start, size - 1))
        end = Math.max(start, Math.min(end, size - 1))
        res.writeHead(206, {
          'content-type': type,
          'content-range': `bytes ${start}-${end}/${size}`,
          'accept-ranges': 'bytes',
          'content-length': String(end - start + 1),
          'cache-control': 'no-store',
        })
        createReadStream(file, { start, end }).pipe(res)
        return
      }
    }

    res.writeHead(200, {
      'content-type': type,
      'content-length': String(stat.size),
      'accept-ranges': 'bytes',
      // A gate must never read a previous run's bytes.
      'cache-control': 'no-store',
    })
    createReadStream(file).pipe(res)
  })

  server.on('connection', (s) => {
    sockets.add(s)
    s.on('close', () => sockets.delete(s))
  })

  return new Promise((resolve, reject) => {
    server.on('error', reject)
    // PORT 0: the kernel picks, and it is already bound when it tells us what it
    // picked. The old getFreePort() opened a socket, closed it, and handed the
    // number to a process that bound it a second later, which is a race two
    // concurrent gates could lose.
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({
        url: `http://127.0.0.1:${port}`,
        port,
        close: () => new Promise((done) => {
          // Destroy first. `server.close()` alone waits for keep-alive
          // connections to drain and a browser holds them open, so closing
          // without this is a hang of exactly the kind this module removes.
          for (const s of sockets) s.destroy()
          sockets.clear()
          server.close(() => done())
        }),
      })
    })
  })
}

/**
 * Every process descended from this one, transitively.
 *
 * `pgrep -P` is used rather than a process-table scan because it answers the
 * question that actually matters: not "is anything called vite running", which
 * would catch a developer's own dev server, but "did THIS gate leave anything
 * behind".
 */
export function descendants(pid = process.pid) {
  const out = []
  const walk = (p) => {
    let kids = ''
    try {
      kids = execFileSync('pgrep', ['-P', String(p)], { encoding: 'utf-8' }).trim()
    } catch {
      return  // pgrep exits non-zero when there are no children
    }
    for (const line of kids.split('\n').filter(Boolean)) {
      const child = Number(line)
      if (!Number.isFinite(child)) continue
      let cmd = ''
      try {
        cmd = execFileSync('ps', ['-o', 'command=', '-p', String(child)], { encoding: 'utf-8' }).trim()
      } catch { /* already gone, which is the wanted state */ }
      if (cmd) out.push({ pid: child, cmd: cmd.slice(0, 120) })
      walk(child)
    }
  }
  walk(pid)
  return out
}

/**
 * THE POST-RUN ASSERTION, per Fable's ruling: a gate leaves nothing running.
 *
 * Called after the browser is closed and the server is stopped. It is not a
 * cleanup step and deliberately does not kill anything: killing here would hide
 * the very defect it exists to report. It fails the gate instead, because a gate
 * that leaks is a gate whose next run measures a contended machine.
 *
 * @returns {{ ok: boolean, survivors: {pid:number,cmd:string}[] }}
 */
export function checkNoSurvivors({ graceMs = 2000, stepMs = 100 } = {}) {
  // A SHORT GRACE, and it is not a weakening of the check.
  //
  // `browser.close()` resolves when playwright has told chromium to go, not
  // when the kernel has reaped it, so an assertion that fires on the next line
  // can see a process that is already dying. Without this the gate would be
  // FLAKY IN CI, which is the one thing worse than the leak it detects: a gate
  // that goes red at random teaches everyone to ignore it.
  //
  // Two seconds cannot hide a real leak. The defect this exists for is a server
  // that outlives the process by hours or days, not by a scheduling quantum.
  const deadline = Date.now() + graceMs
  let survivors = descendants()
  while (survivors.length && Date.now() < deadline) {
    execFileSync('sleep', [String(stepMs / 1000)])
    survivors = descendants()
  }
  return { ok: survivors.length === 0, survivors }
}

/**
 * The same check, reported and enforced. Returns true when clean.
 */
export function assertNoSurvivors(label = 'gate') {
  const { ok, survivors } = checkNoSurvivors()
  if (ok) {
    console.log(`  ok    ${label}: no surviving child processes`)
    return true
  }
  console.error(`  FAIL  ${label}: ${survivors.length} process(es) survived this run`)
  for (const s of survivors) console.error(`          ${s.pid}  ${s.cmd}`)
  return false
}
