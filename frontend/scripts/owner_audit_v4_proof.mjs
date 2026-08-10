// owner_audit_v4_proof.mjs - OWNER AUDIT ROUND 4 conformance + proofs.
//
// Covers items 1, 3, 4, 5, 6. Item 2's before/after proofs are captured by
// splash_proof.mjs; item 7 is a design draft and ships no behaviour.
//
// Run (from frontend/): node scripts/owner_audit_v4_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = qaTmpDir()
const SHOTS = qaTmpDir('screens', 'owner-audit-v4')
mkdirSync(OUT, { recursive: true })
mkdirSync(SHOTS, { recursive: true })

// Item 1: the entry gate must appear on ALL FOUR profiles, not just portrait.
const PROFILES = [
  { name: 'desktop-landscape', w: 1280, h: 720 },
  { name: 'iphone14-portrait', w: 390, h: 844 },
  { name: 'pixel7-portrait', w: 412, h: 915 },
  { name: 'compact-landscape', w: 812, h: 375 },
]

// Item 3: each entry route must apply its own colourway. The wincap variants
// matter most: that window is where the NITRO route actually broke, because
// MaxWinCelebration's COLLECT gate runs before presentFeature.
const ROUTES = [
  { name: 'natural', card: null, cat: 'trigger_3', expect: 'colourway-natural' },
  { name: 'overdrive-buy', card: 'bonus', cat: 'bonus_win_mid', expect: 'colourway-overdrive' },
  { name: 'nitro-buy', card: 'super', cat: 'super_win_mid', expect: 'colourway-nitro' },
  { name: 'overdrive-buy-wincap', card: 'bonus', cat: 'wincap', expect: 'colourway-overdrive' },
  { name: 'nitro-buy-wincap', card: 'super', cat: 'super_wincap', expect: 'colourway-nitro' },
]

const failures = []
const results = {}
const check = (name, cond, detail) => { if (!cond) failures.push({ name, detail }) }

async function getFreePort() {
  return new Promise((res, rej) => {
    const s = createServer()
    s.on('error', rej)
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
  })
}
function startDevServer(port) {
  return new Promise((res, rej) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'],
      { cwd: join(__dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'] })
    let done = false
    const on = (d) => { if (!done && /Local|localhost/.test(d.toString())) { done = true; res(proc) } }
    proc.stdout.on('data', on); proc.stderr.on('data', on); proc.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite did not start')) }, 20000)
  })
}

const visible = (page, sel) => page.evaluate((s) => {
  const el = [...document.querySelectorAll(s)].filter((e) => !e.closest('.warm-mount'))[0]
  if (!el) return null
  const r = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  return {
    w: Math.round(r.width), h: Math.round(r.height),
    inViewport: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
    visible: cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0,
    text: (el.textContent || '').trim().slice(0, 60),
  }
}, sel)

async function openBuy(page, card) {
  await page.locator('[data-testid="feature-menu-button"]').first().click()
  await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 })
  await page.locator(`[data-testid="activate-${card}"]`).click()
  await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 10000 })
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const base = `http://localhost:${port}`
  try {
    const browser = await chromium.launch()

    // ── Item 1: entry gate on all four profiles ───────────────────────────
    results.item1_entryGate = {}
    for (const p of PROFILES) {
      const page = await browser.newPage({ viewport: { width: p.w, height: p.h } })
      await page.goto(`${base}/?mockCategory=trigger_3`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)
      await page.locator('[data-testid="spin-button"]').click()
      await page.waitForTimeout(9000)
      const gate = await visible(page, '[data-testid="entry-continue"]')
      results.item1_entryGate[p.name] = gate
      check(`item1 ${p.name}: entry gate present`, !!gate, 'not in DOM')
      check(`item1 ${p.name}: entry gate visible and in viewport`,
        !!gate && gate.visible && gate.inViewport && gate.h > 0, JSON.stringify(gate))
      await page.screenshot({ path: join(SHOTS, `item1-entry-gate-${p.name}.png`) })
      await page.close()
    }

    // ── Item 3: colourway matches the entry route ─────────────────────────
    results.item3_colourway = {}
    for (const r of ROUTES) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      await page.goto(`${base}/?mockCategory=${r.cat}`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)
      await page.evaluate(() => { window.__testStores?.balance?.set(1_000_000) })
      if (r.card) { await openBuy(page, r.card); await page.locator('[data-testid="buy-confirm"]').click() }
      else { await page.locator('[data-testid="spin-button"]').click() }
      await page.waitForTimeout(7000)
      const cls = await page.evaluate(() => {
        const j = [...document.querySelectorAll('.jets')].filter((e) => !e.closest('.warm-mount'))[0]
        return j ? [...j.classList].find((c) => c.startsWith('colourway-')) : null
      })
      // Owner clarification: the differentiation the owner asked for is the
      // BORDERS and SHADING, not the jets. Assert the backdrop and frame carry
      // the same route as the flames, so the three surfaces cannot disagree.
      const surfaces = await page.evaluate(() => {
        const bg = [...document.querySelectorAll('.bg-still.overdrive')].filter((e) => !e.closest('.warm-mount'))[0]
        const fr = [...document.querySelectorAll('.game-frame')].filter((e) => !e.closest('.warm-mount'))[0]
        // Absence of a route class means the overdrive visual is not active YET
        // (during the wincap COLLECT window it has not started), which is NOT the
        // same as "the overdrive route". Report null so the caller can tell the
        // difference instead of silently reading it as overdrive.
        const route = (el, activeClass) => {
          if (!el || !el.classList.contains(activeClass)) return null
          if (el.classList.contains('nitro-active')) return 'nitro'
          if (el.classList.contains('route-natural')) return 'natural'
          return 'overdrive'
        }
        return { backdrop: route(bg, 'active'), frame: route(fr, 'overdrive-active') }
      })
      const expectedRoute = r.expect.replace('colourway-', '')
      results.item3_colourway[r.name] = { applied: cls, expected: r.expect, ...surfaces }
      // null means the overdrive visual had not engaged at sample time (the
      // wincap COLLECT gate holds it off). Only assert the route when it has.
      check(`item3 ${r.name}: backdrop route matches`,
        surfaces.backdrop === null || surfaces.backdrop === expectedRoute,
        `backdrop ${surfaces.backdrop}, expected ${expectedRoute}`)
      check(`item3 ${r.name}: frame route matches`,
        surfaces.frame === null || surfaces.frame === expectedRoute,
        `frame ${surfaces.frame}, expected ${expectedRoute}`)
      // Asserted at the max-win window too: this is where NITRO fell through to
      // 'natural' before the fix, because liveIsNitroEntry had not arrived yet.
      check(`item3 ${r.name}: colourway matches entry route`, cls === r.expect,
        `applied ${cls}, expected ${r.expect}`)
      await page.screenshot({ path: join(SHOTS, `item3-route-${r.name}.png`) })
      await page.close()
    }

    // ── Items 4, 5, 6 ─────────────────────────────────────────────────────
    for (const [prof, w, h] of [['desktop', 1280, 720], ['portrait', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } })
      await page.goto(base, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)

      // Item 5: grille glyph replaces the hamburger, both layouts.
      const grille = await page.evaluate(() => {
        const btn = [...document.querySelectorAll('[data-testid="feature-menu-button"]')]
          .filter((e) => !e.closest('.warm-mount') && e.getBoundingClientRect().height > 0)[0]
        if (!btn) return null
        const svg = btn.querySelector('svg')
        const r = btn.getBoundingClientRect()
        return {
          hasGrille: !!btn.querySelector('svg.fm-entry-grille'),
          hasRect: !!svg?.querySelector('rect'),
          slats: svg ? svg.querySelectorAll('path').length : 0,
          btnW: Math.round(r.width), btnH: Math.round(r.height),
        }
      })
      results[`item5_grille_${prof}`] = grille
      check(`item5 ${prof}: grille glyph present`, !!grille?.hasGrille, JSON.stringify(grille))
      check(`item5 ${prof}: grille has housing + slats`, !!grille?.hasRect && grille.slats >= 1,
        JSON.stringify(grille))
      // Touch target preserved (the 44px rule from Round 3).
      check(`item5 ${prof}: touch target >= 44px`, !!grille && grille.btnH >= 44,
        `height ${grille?.btnH}`)

      // Item 6: portrait carries the lockup, not plain text.
      if (prof === 'portrait') {
        const wm = await page.evaluate(() => {
          const img = document.querySelector('.portrait-wordmark-img')
          if (!img) return { img: false }
          const r = img.getBoundingClientRect()
          return { img: true, w: Math.round(r.width), h: Math.round(r.height), complete: img.complete }
        })
        results.item6_wordmark = wm
        check('item6: portrait uses the lockup image', wm.img === true, JSON.stringify(wm))
        check('item6: lockup actually rendered', wm.img && wm.h > 0 && wm.w > 0, JSON.stringify(wm))
      }
      await page.screenshot({ path: join(SHOTS, `items56-${prof}.png`) })

      // Item 4: buy dialog quotes the cap against the BASE bet.
      await page.locator('[data-testid="feature-menu-button"]').first().click()
      await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 })
      await page.evaluate(() => { window.__testStores?.balance?.set(1_000_000) })
      await page.locator('[data-testid="activate-bonus"]').click()
      await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 10000 })
      const dlg = (await page.locator('.buy-modal, [data-testid="buy-confirm"]')
        .first().locator('xpath=ancestor-or-self::div[contains(@class,"buy")][1]').innerText()).replace(/\s+/g, ' ')
      results[`item4_buyDialog_${prof}`] = dlg.slice(0, 200)
      check(`item4 ${prof}: buy dialog says "base bet"`, /5,000×\s*base bet/i.test(dlg), dlg.slice(0, 160))
      await page.screenshot({ path: join(SHOTS, `item4-buy-dialog-${prof}.png`) })
      await page.close()
    }

    // Item 4, paytable: mode cards use "base bet", general rules keep the short form.
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      await page.goto(base, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)
      await page.locator('button.fs-menu').click()
      await page.locator('.hud-menu-item').first().click()
      await page.waitForSelector('[data-testid="interface-guide"]', { timeout: 10000 })
      const paytable = await page.evaluate(() => ({
        modeCards: [...document.querySelectorAll('.fs-mode-stat-value')].map((e) => e.textContent.trim()),
        rulesRow: [...document.querySelectorAll('.fs-rtp-val')].map((e) => e.textContent.trim()),
      }))
      results.item4_paytable = paytable
      check('item4 paytable: mode cards quote base bet',
        paytable.modeCards.some((t) => /base bet/i.test(t)), JSON.stringify(paytable.modeCards))
      check('item4 paytable: general rules row keeps the short form',
        paytable.rulesRow.some((t) => /^5,000×$/.test(t)), JSON.stringify(paytable.rulesRow))
      await page.screenshot({ path: join(SHOTS, 'item4-paytable.png'), fullPage: true })
      await page.close()
    }

    await browser.close()
  } finally {
    server.kill()
  }

  results.failures = failures
  results.pass = failures.length === 0
  writeFileSync(join(OUT, 'owner_audit_v4_2026-07-26.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
  if (failures.length) {
    console.error(`\nOWNER AUDIT V4: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log('\nOWNER AUDIT V4: PASS')
}

run().catch((e) => { console.error(e); process.exit(1) })
