#!/usr/bin/env node
//
// preview_server_gate.mjs: the in-process static server serves the bundle, and
// a gate leaves nothing running.
//
// TR-101, Fable's ruling 2026-07-28, option (c).
//
// TWO CLAIMS, AND BOTH ARE SEEDED
// -------------------------------
// 1. The replacement actually serves dist/ the way the gates need it: the
//    entry document, hashed assets, the shipped font, a JSON file, an SPA
//    fallback, a Range request, and a real browser booting the real game off
//    it. A drop-in that does not serve correctly turns eighteen gates red for a
//    reason that has nothing to do with what they test.
// 2. The post-run assertion detects a survivor. Convention (p): the seed plants
//    a detached child that outlives its parent's intent, which is the exact
//    shape of the defect (a `vite preview` that escaped its process group), and
//    the assertion must go RED on it.
//
// The second is the one that matters. An assertion that has never been seen to
// fail is a line that prints ok.
//
// USAGE
//   node scripts/preview_server_gate.mjs
//   node scripts/preview_server_gate.mjs --self-test
//
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { startStaticServer, checkNoSurvivors, assertNoSurvivors, descendants } from './lib/previewServer.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')

const HARD_TIMEOUT_MS = 3 * 60_000
setTimeout(() => {
  console.error(`PREVIEW SERVER GATE: HARD TIMEOUT after ${HARD_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, HARD_TIMEOUT_MS)

const failures = []
const ok = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}`); if (!cond) failures.push(msg) }

async function serveChecks() {
  if (!existsSync(DIST)) {
    console.error('PREVIEW SERVER GATE: dist/ is missing. Run `npm run build` first.')
    process.exit(1)
  }
  const server = await startStaticServer(DIST)
  try {
    ok(server.port > 0, `bound an ephemeral port the kernel chose (${server.port})`)

    const entry = await fetch(`${server.url}/`)
    ok(entry.status === 200, 'GET / serves the entry document')
    ok((entry.headers.get('content-type') || '').startsWith('text/html'),
      `and as text/html (${entry.headers.get('content-type')})`)
    const html = await entry.text()
    ok(/<div id="app"|<script/.test(html), 'which is the real built index.html')

    // A hashed asset, taken from the bundle rather than guessed at.
    const assets = existsSync(join(DIST, 'assets')) ? readdirSync(join(DIST, 'assets')) : []
    const js = assets.find((f) => f.endsWith('.js'))
    const font = assets.find((f) => f.endsWith('.woff') || f.endsWith('.woff2'))
    if (js) {
      const r = await fetch(`${server.url}/assets/${js}`)
      ok(r.status === 200 && (r.headers.get('content-type') || '').includes('javascript'),
        `a hashed JS asset serves as javascript (${js.slice(0, 28)}...)`)
    }
    if (font) {
      const r = await fetch(`${server.url}/assets/${font}`)
      ok(r.status === 200 && (r.headers.get('content-type') || '').startsWith('font/'),
        'the shipped font serves with a font content-type')
    }

    const bi = await fetch(`${server.url}/build-info.json`)
    ok(bi.status === 200, 'build-info.json serves')
    const parsed = await bi.json().catch(() => null)
    ok(parsed && typeof parsed.commit === 'string', 'and parses as JSON with a commit')

    // Range, because a headless browser asks for it on media.
    if (js) {
      const r = await fetch(`${server.url}/assets/${js}`, { headers: { range: 'bytes=0-9' } })
      const body = await r.text()
      ok(r.status === 206 && body.length === 10,
        `a Range request answers 206 with exactly the bytes asked for (${r.status}, ${body.length}B)`)
    }

    const spa = await fetch(`${server.url}/no/such/route`)
    ok(spa.status === 200, 'an unknown route falls back to index.html, as vite preview did')

    const esc = await fetch(`${server.url}/../../package.json`)
    ok(esc.status !== 200 || !(await esc.text()).includes('"devDependencies"'),
      'a traversal attempt does not serve a file outside the root')

    // THE REAL TEST: a real browser boots the real game off it.
    const browser = await chromium.launch()
    try {
      const page = await browser.newPage({ viewport: { width: 1200, height: 675 } })
      const errors = []
      page.on('pageerror', (e) => errors.push(String(e)))
      await page.goto(`${server.url}/?sessionID=preview-server-gate&rgs_url=rgs.preview.invalid&lang=en`,
        { waitUntil: 'domcontentloaded' })
      await page.locator('[data-testid="spin-button"]').first()
        .waitFor({ state: 'visible', timeout: 45_000 })
      ok(true, 'a real chromium boots the real bundle from it and reaches the HUD')
      ok(errors.length === 0, `and raises no page errors (${errors.length})`)
    } finally {
      await browser.close().catch(() => {})
    }
  } finally {
    await server.close()
  }

  // The close must be real: nothing may still be listening.
  const after = await fetch(`http://127.0.0.1:${server.port}/`).then(() => true).catch(() => false)
  ok(after === false, 'after close() the port answers nothing, so the server really stopped')
}

;(async () => {
  const selfTest = process.argv.includes('--self-test')

  if (selfTest) {
    console.log('PREVIEW SERVER GATE SELF-TEST (convention p)\n')
    console.log('SEEDED VIOLATION: a detached child that outlives its parent\'s intent, which is')
    console.log('exactly what an escaped `vite preview` was')

    const clean = checkNoSurvivors()
    console.log(`  ${clean.ok ? 'ok    ' : 'note  '}baseline: ${clean.survivors.length} survivor(s) before seeding`)

    // The seed. `detached` and its own group, so a naive group-kill on the
    // parent would miss it, which is the defect verbatim.
    const ghost = spawn('sleep', ['120'], { detached: true, stdio: 'ignore' })
    ghost.unref()
    await new Promise((r) => setTimeout(r, 400))

    const seeded = checkNoSurvivors()
    const caught = seeded.survivors.some((s) => /sleep 120/.test(s.cmd))
    console.log(`  ${caught ? 'caught' : 'MISSED'}  the assertion SEES a leaked detached child `
      + `(${seeded.survivors.length} survivor(s))`)
    for (const s of seeded.survivors) console.log(`          ${s.pid}  ${s.cmd}`)

    const reported = assertNoSurvivors('seeded run')
    console.log(`  ${reported === false ? 'caught' : 'MISSED'}  and assertNoSurvivors() returns FALSE, failing the gate`)

    try { process.kill(ghost.pid, 'SIGKILL') } catch { /* already gone */ }
    await new Promise((r) => setTimeout(r, 400))

    const cleaned = checkNoSurvivors()
    const negControl = cleaned.survivors.every((s) => !/sleep 120/.test(s.cmd))
    console.log(`  ${negControl ? 'ok    ' : 'FAIL  '}negative control: once reaped, the assertion is clean again`)

    console.log('')
    if (!caught || reported !== false || !negControl) {
      console.error('PREVIEW SERVER GATE SELF-TEST: FAIL. A seeded leak this gate did not catch '
        + 'means its PASS means nothing.')
      process.exit(1)
    }
    console.log('PREVIEW SERVER GATE SELF-TEST: PASS (a leaked child reproduces and is caught)')
    process.exit(0)
  }

  console.log('PREVIEW SERVER GATE\n')
  console.log('SERVING:')
  await serveChecks()

  console.log('\nSURVIVORS:')
  // playwright leaves nothing once browser.close() has run, and the server was
  // never a process, so this must be empty.
  const clean = assertNoSurvivors('preview server gate')
  if (!clean) failures.push('this gate left processes behind')

  console.log('')
  if (failures.length) {
    for (const f of failures) console.error(`  ${f}`)
    console.error(`\nPREVIEW SERVER GATE: FAIL (${failures.length})`)
    process.exit(1)
  }
  console.log('PREVIEW SERVER GATE: PASS (serves the bundle in-process, and leaves nothing running)')
  process.exit(0)
})()
