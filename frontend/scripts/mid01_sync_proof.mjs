#!/usr/bin/env node
//
// mid01_sync_proof.mjs: freshly captured evidence that the banner and the WIN
// pod show one number.
//
// Convention (h): a pass that changes what renders commits before and after
// proof screenshots. Convention (h.1): this is an EVIDENCE REGENERATION job and
// says so, which is what entitles it to write into a committed evidence
// directory. The gate itself (win_countup_sync_gate.mjs) writes nothing.
//
// WHAT "BEFORE" MEANS HERE, stated plainly rather than fudged. The fix is a
// wiring change, so a before frame cannot be captured from the fixed tree. The
// before evidence is therefore two things, both committed beside these frames:
//   - SEEDED_BEFORE.txt, the gate's own --self-test transcript, which drives the
//     two pre-fix duration rules and prints the exact divergence per tier;
//   - the parent commit, where WinBanner.svelte:79 and HudOverlay.svelte:312
//     each still declare their own loop.
// The frames below are the AFTER, captured live at the moment of worst former
// divergence.
//
// Run (from frontend/): node scripts/mid01_sync_proof.mjs
//
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, '..', 'reports', 'screens', 'mid01-countup-sync-2026-07-30')
mkdirSync(OUT, { recursive: true })

// Sampled at the moment the two clocks used to be furthest apart: partway
// through the celebration, where the old HUD rule had already settled and the
// banner was still counting.
const TIERS = [
  { name: 'big', multiplier: 16, tierMs: 1400, sampleAt: 700 },
  { name: 'mega', multiplier: 40, tierMs: 2000, sampleAt: 1000 },
  { name: 'epic', multiplier: 150, tierMs: 2800, sampleAt: 1200 },
]

const READ = `() => {
  const visible = (sel) => {
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) return (el.innerText || '').replace(/\\s+/g, ' ').trim()
    }
    return null
  }
  return { banner: visible('[data-testid="win-amount"]'), hud: visible('[data-testid="hud-win"]') }
}`

function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
  })
}

function startDevServer(port) {
  return new Promise((res, rej) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'],
    })
    let done = false
    const onData = (d) => { if (!done && /Local/.test(d.toString())) { done = true; res(proc) } }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite dev server did not start in time')) }, 20000)
  })
}

const money = (t) => (t ? (t.match(/[^\s]*\d[\d.,]*[^\s]*/g) || []).pop() : null)

;(async () => {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const browser = await chromium.launch()
  const record = []
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
    await page.waitForFunction(() => window.__testStores?.winAmount, { timeout: 10000 })
    await dismissIntro(page)

    for (const tier of TIERS) {
      await page.evaluate(() => {
        window.__testStores.isSpinning.set(true)
        window.__testStores.winAmount.set(0)
      })
      await page.waitForTimeout(150)
      await page.evaluate((m) => {
        window.__testStores.balance.set(10_000_000)
        window.__testStores.betAmount.set(1)
        window.__testStores.isSpinning.set(false)
        window.__testStores.winAmount.set(m)
      }, tier.multiplier)

      await page.waitForTimeout(tier.sampleAt)
      const mid = await page.evaluate(`(${READ})()`)
      const file = `${tier.name}_mid_countup.png`
      await page.screenshot({ path: join(OUT, file) })

      await page.waitForTimeout(tier.tierMs + 300 - tier.sampleAt)
      const settled = await page.evaluate(`(${READ})()`)
      const settledFile = `${tier.name}_settled.png`
      await page.screenshot({ path: join(OUT, settledFile) })

      const agree = money(mid.banner) === money(mid.hud)
      record.push({
        tier: tier.name,
        multiplier: tier.multiplier,
        tierMs: tier.tierMs,
        sampledAtMs: tier.sampleAt,
        midCountUp: { banner: money(mid.banner), hud: money(mid.hud), agree },
        settled: { banner: money(settled.banner), hud: money(settled.hud) },
        frames: [file, settledFile],
      })
      console.log(`${tier.name.padEnd(5)} at ${tier.sampleAt}ms: banner ${money(mid.banner)} / HUD ${money(mid.hud)}  ${agree ? 'AGREE' : 'DIVERGE'}`)
    }
  } finally {
    await browser.close().catch(() => {})
    try { server.kill('SIGTERM') } catch { /* already gone */ }
  }

  const allAgree = record.every((r) => r.midCountUp.agree)
  writeFileSync(join(OUT, 'PROOF.json'), JSON.stringify({
    pass: 'MID-01, one shared win count-up source',
    captured: '2026-07-30',
    method: 'live dev build, bet=1 so winAmount is the bet multiple, sampled mid count-up where the two former clocks were furthest apart',
    allAgree,
    record,
  }, null, 2) + '\n')
  console.log(`\n${allAgree ? 'PASS' : 'FAIL'}: wrote ${record.length * 2} frames and PROOF.json to ${OUT}`)
  if (!allAgree) process.exit(1)
})().catch((err) => { console.error(err); process.exit(1) })
