#!/usr/bin/env node
//
// r153_operator_strip_proof.mjs: the R153 proofs (reports/briefs/FS_R153_OperatorStripHeroStill_Prompt.md,
// TASK 3), run against a PRODUCTION build with the wallet served real committed book rounds from
// src/lib/services/__fixtures__/replay_rounds.json, exactly as look_pass_capture.mjs serves them.
// No DEV hook exists in that build and none is used.
//
// THREE SECTIONS, one per claim the brief makes:
//
//   S  THE STRIP IS A CONTROL, at 1280x800 and 390x844. The plate is #12141a at 90% with 8px
//      corners and nothing else (no image, no gradient, no shadow, no border); BALANCE, WIN and BET
//      labels are 10px tracked caps at 60% white; the three values are white, in Exo 2, tabular,
//      and carry digits from the live stores; BET has exactly one chevron pair, stroked; no <img>
//      and no raster or gradient background anywhere in the HUD; and the spin ring is the ONLY
//      chromatic paint in the HUD (every colour on every visible HUD element is classified, and a
//      saturated one anywhere but the ring is a finding). Every HUD control takes a 44x44 press,
//      probed with elementFromPoint at the four corners of a 44px square on its centre.
//   H  A FIVE-SPIN SESSION NEVER WAITS ON THE HERO, at 1280x800. Five real rounds (3.9x, 16.2x,
//      loss, 16.2x, 3.9x: two big wins, the second straight after the first, which is the case the
//      R152 hero win queue existed for). Each spin is pressed the moment SPIN is enabled again. At
//      every press it records what the hero is doing, and over the session it records every request
//      for a hero strip. The hero must be one <img> of ui/scene_character.png that never changes,
//      no reaction state may exist, nothing on the hero may animate except the float and its three
//      light accents, and zero requests may reach ui/hero/.
//   G  THE GAUGE IS OUT OF THE BAR, at 1280x800. The base feature fixture carries a natural
//      retrigger, and the retrigger beat is the moment the flame gauge is lifted to z90. At that
//      moment the strip's own box is photographed with the jets shown and with them hidden; any
//      pixel that differs inside the box is the gauge's ink on the bar. A second pair taken with
//      no toggle at all is the noise floor.
//
// POSITIVE CONTROL, which every all-clean result here needs: --expect head runs the same three
// sections against a build of 895815b9 (pass DIST=<that dist>) and requires each section to FIND
// what R153 removed: the strip contract fails, a hero reaction is running at a press after a big
// win or a strip is requested, and the gauge leaves ink inside the strip box. An instrument that
// cannot see the defect where it exists has not shown it is absent here.
//
// WHERE IT WRITES. Scratch only (convention (h.1)): qaTmpDir('r153-proof', <label>). The R153 brief
// fences rasters, so nothing this writes is meant for a commit.
//
// USAGE (from frontend/)
//   node scripts/r153_operator_strip_proof.mjs                       # the R153 build in dist/
//   DIST=<dir> node scripts/r153_operator_strip_proof.mjs --expect head --label head
//
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { dismissIntro, waitSpinDone } from './lib/dismissOverlays.mjs'
import { startStaticServer } from './lib/previewServer.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = process.env.DIST ? resolve(process.env.DIST) : join(ROOT, 'dist')
const argv = process.argv.slice(2)
let EXPECT = 'r153', LABEL = 'r153'
while (argv.length) {
  const a = argv.shift()
  if (a === '--expect') EXPECT = argv.shift()
  else if (a === '--label') LABEL = argv.shift()
  else { console.error(`unknown argument: ${a}`); process.exit(2) }
}
if (EXPECT !== 'r153' && EXPECT !== 'head') { console.error('--expect must be r153 or head'); process.exit(2) }
const OUT = qaTmpDir('r153-proof', LABEL)
mkdirSync(OUT, { recursive: true })

const HARD_TIMEOUT_MS = 9 * 60_000
setTimeout(() => { console.error('R153 PROOF: HARD TIMEOUT, failing red'); process.exit(1) }, HARD_TIMEOUT_MS).unref()

const RGS_HOST = 'rgs.r153-proof.invalid'
const START_MICROS = 50_000_000_000
const FIXTURES = JSON.parse(readFileSync(join(ROOT, 'src/lib/services/__fixtures__/replay_rounds.json'), 'utf-8'))
const MODE_COST = { base: 1, cruise: 1, antelite: 1.25, bonus: 100, super: 400 }

const results = { dist: DIST, expect: EXPECT, version: null, sections: {} }
let failures = 0
function record(section, label, ok, detail) {
  ;(results.sections[section] ??= []).push({ label, ok, detail })
  if (!ok) { failures++; console.error(`  FAIL [${section}] ${label}: ${JSON.stringify(detail).slice(0, 400)}`) }
  else console.log(`  ok   [${section}] ${label}`)
}

async function routeWallet(page, state) {
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const req = route.request()
    const url = req.url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) {
      return json({
        balance: { amount: START_MICROS, currency: 'USD' },
        config: {
          minBet: 100_000, maxBet: 100_000_000, stepBet: 100_000, defaultBetLevel: 1_000_000,
          betLevels: [100_000, 500_000, 1_000_000, 2_000_000],
          jurisdiction: {
            socialCasino: false, disabledFullscreen: false, disabledTurbo: false, disabledSuperTurbo: false,
            disabledAutoplay: false, disabledSlamstop: false, disabledSpacebar: false, disabledBuyFeature: false,
            displayNetPosition: false, displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
          },
        },
        round: null,
      })
    }
    if (url.includes('/wallet/play')) {
      let mode = 'base'
      try { mode = req.postDataJSON()?.mode ?? 'base' } catch { /* no body */ }
      if (!MODE_COST[mode]) mode = 'base'
      const key = state.queue.length ? state.queue.shift() : 'loss'
      const round = (FIXTURES[mode] || FIXTURES.base)[key] || FIXTURES.base.loss
      state.bets += 1
      const bet = 1_000_000
      return json({
        balance: { amount: START_MICROS - state.bets * Math.round(bet * MODE_COST[mode]), currency: 'USD' },
        round: {
          betID: 900_000 + state.bets, active: true, mode, amount: bet,
          payout: Math.round((bet * (round.payoutMultiplier ?? 0)) / 100),
          payoutMultiplier: (round.payoutMultiplier ?? 0) / 100,
          state: { events: round.events },
        },
      })
    }
    if (url.includes('/wallet/end-round')) return json({ balance: { amount: START_MICROS, currency: 'USD' } })
    return json({})
  })
}

async function openGame(browser, base, vp, state, onRequest) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { const t = m.text(); if (t.startsWith('Future Spinner ')) results.version = t })
  if (onRequest) page.on('request', onRequest)
  await routeWallet(page, state)
  await page.goto(`${base}/?sessionID=r153-proof&rgs_url=${RGS_HOST}&lang=en`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2400)
  await dismissIntro(page).catch(() => {})
  await page.waitForTimeout(1500)
  return { ctx, page, pageErrors }
}

// ── S: the strip ─────────────────────────────────────────────────────────────
async function stripFacts(page, profile) {
  return page.evaluate((profile) => {
    const desk = profile === 'fs'
    const root = desk ? null : document.querySelector('.p-hud')
    const inHud = (el) => desk ? !!el.closest('.fs-hud') : !!root && root.contains(el)
    const plateEl = desk ? document.querySelector('[data-testid="hud-panel"]') : document.querySelector('.p-top-group')
    const pc = plateEl ? getComputedStyle(plateEl) : null
    const plate = pc && {
      bg: pc.backgroundColor, img: pc.backgroundImage, radius: pc.borderTopLeftRadius,
      shadow: pc.boxShadow, border: pc.borderTopWidth + ' ' + pc.borderRightWidth + ' ' + pc.borderBottomWidth + ' ' + pc.borderLeftWidth,
    }
    const labels = [...document.querySelectorAll(desk ? '.fs-hud .fs-label' : '.p-hud .p-stat-label')].map((el) => {
      const c = getComputedStyle(el)
      return { text: el.textContent.trim(), size: c.fontSize, tt: c.textTransform, ls: parseFloat(c.letterSpacing) || 0, color: c.color }
    })
    const valueSel = ['[data-testid="hud-balance"] [data-money]', '[data-testid="hud-win"] [data-money]', '[data-testid="bet-window"]']
    const values = valueSel.map((sel) => {
      const el = [...document.querySelectorAll(sel)].find(inHud)
      if (!el) return { sel, missing: true }
      const c = getComputedStyle(el)
      return { sel, text: el.textContent.trim(), color: c.color, family: c.fontFamily, tnum: c.fontVariantNumeric }
    })
    const keys = [...document.querySelectorAll('button[aria-label]')].filter(inHud)
      .filter((b) => /increase bet|decrease bet/i.test(b.getAttribute('aria-label')))
      .map((b) => {
        const p = b.querySelector('svg path')
        const pc2 = p ? getComputedStyle(p) : null
        return { label: b.getAttribute('aria-label'), fill: pc2?.fill, stroke: pc2?.stroke, bgImg: getComputedStyle(b).backgroundImage }
      })
    // Every visible HUD element: rasters, gradients, shadows, and every colour it paints.
    const toRGBA = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 } }
    const sat = ({ r, g, b }) => { const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255; const l = (mx + mn) / 2; if (mx === mn) return 0; return (mx - mn) / (1 - Math.abs(2 * l - 1)) }
    const all = [...document.querySelectorAll('body *')].filter(inHud)
    const imgs = all.filter((e) => e.tagName === 'IMG').map((e) => e.getAttribute('src'))
    const rasters = [], gradients = [], shadows = [], chroma = []
    const ringSel = desk ? '.fs-spin .ring' : '.p-spin'
    for (const el of all) {
      const r = el.getBoundingClientRect()
      const c = getComputedStyle(el)
      if (r.width === 0 || r.height === 0 || c.visibility === 'hidden' || c.display === 'none' || Number(c.opacity) === 0) continue
      const name = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '')
      if (/url\(/.test(c.backgroundImage)) rasters.push(name)
      if (/gradient/.test(c.backgroundImage)) gradients.push(name)
      if (c.boxShadow !== 'none') shadows.push(`${name}: ${c.boxShadow}`)
      if (c.textShadow !== 'none') shadows.push(`${name} text: ${c.textShadow}`)
      const isRing = el.matches(ringSel)
      const paints = []
      paints.push(['background', c.backgroundColor])
      for (const side of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(c[`border${side}Width`]) > 0) paints.push([`border-${side}`, c[`border${side}Color`]])
      if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) paints.push(['color', c.color])
      if (el instanceof SVGElement && el.tagName !== 'svg') { paints.push(['fill', c.fill]); paints.push(['stroke', c.stroke]) }
      for (const [prop, val] of paints) {
        const v = toRGBA(val || '')
        if (!v || v.a < 0.05) continue
        if (sat(v) > 0.2 && !(isRing && prop.startsWith('border'))) chroma.push(`${name} ${prop} ${val}`)
      }
    }
    const ring = document.querySelector(ringSel)
    const rc = ring ? getComputedStyle(ring) : null
    return {
      plate, labels, values, keys, imgs, rasters, gradients, shadows, chroma,
      ring: rc && { width: rc.borderTopWidth, color: rc.borderTopColor, radius: rc.borderTopLeftRadius },
    }
  }, profile)
}

async function touchFacts(page, profile) {
  return page.evaluate((profile) => {
    const desk = profile === 'fs'
    const root = desk ? null : document.querySelector('.p-hud')
    const inHud = (el) => desk ? !!el.closest('.fs-hud') : !!root && root.contains(el)
    const controls = [...document.querySelectorAll('button')].filter(inHud).filter((b) => {
      const r = b.getBoundingClientRect(); const c = getComputedStyle(b)
      return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && !b.disabled && !b.closest('.hud-menu, .auto-menu')
    })
    return controls.map((b) => {
      const r = b.getBoundingClientRect()
      // HUD_SPEC.md rule 3 measures the bounding box, so the box must be at least 44x44, and the
      // press must land: the centre and the four points 21.5px out along each axis must hit the
      // control. Axis points, not corners: a 48px circle cannot contain a 44px square's corners
      // (that needs 62px), and the first draft of this probe failed every circle for it. The
      // chevron keys' box is the drawn key plus the 20px it extends away from the other key.
      let top = r.top, bottom = r.bottom, left = r.left, right = r.right
      // The desktop BET readout's ::after covers the whole BET face (R153), so its box is the face.
      if (b.matches('.fs-bet .bet-open')) {
        const f = b.closest('.fs-face').getBoundingClientRect()
        top = f.top; bottom = f.bottom; left = f.left; right = f.right
      }
      if (b.classList.contains('fs-arrow')) {
        const up = b === b.parentElement.firstElementChild
        if (up) top -= 20; else bottom += 20
      }
      const w = right - left, h = bottom - top
      const ccx = (left + right) / 2, ccy = (top + bottom) / 2
      const pts = [[ccx, ccy], [ccx - 21.5, ccy], [ccx + 21.5, ccy], [ccx, ccy - 21.5], [ccx, ccy + 21.5]]
      const hits = pts.map(([x, y]) => { const e = document.elementFromPoint(x, y); return !!e && (e === b || b.contains(e)) })
      return { label: b.getAttribute('aria-label') || b.className, w: Math.round(w), h: Math.round(h), ok: w >= 44 && h >= 44 && hits.every(Boolean), hits }
    })
  }, profile)
}

async function sectionS(browser, base) {
  for (const vp of [{ slug: 'desktop-1280', width: 1280, height: 800, profile: 'fs' }, { slug: 'phone-390', width: 390, height: 844, profile: 'p' }]) {
    const state = { queue: [], bets: 0 }
    const { ctx, page } = await openGame(browser, base, vp, state)
    const f = await stripFacts(page, vp.profile)
    const t = await touchFacts(page, vp.profile)
    await page.screenshot({ path: join(OUT, `S_${vp.slug}_idle.png`) })
    writeFileSync(join(OUT, `S_${vp.slug}.json`), JSON.stringify({ strip: f, touch: t }, null, 2))
    const plateOk = !!f.plate && f.plate.bg === 'rgba(18, 20, 26, 0.9)' && f.plate.radius === '8px' && f.plate.img === 'none' &&
      f.plate.shadow === 'none' && f.plate.border === '0px 0px 0px 0px'
    const labelsOk = f.labels.length === 3 && f.labels.every((l) => l.size === '10px' && l.tt === 'uppercase' && l.ls > 0 && l.color === 'rgba(255, 255, 255, 0.6)')
    const valuesOk = f.values.every((v) => !v.missing && v.color === 'rgb(255, 255, 255)' && /^"?Exo 2/.test(v.family) && /tabular-nums/.test(v.tnum) && /\d/.test(v.text))
    const keysOk = f.keys.length === 2 && f.keys.every((k) => k.fill === 'none' && k.stroke && k.stroke !== 'none' && k.bgImg === 'none')
    const ringOk = !!f.ring && f.ring.width === '2px' && f.ring.radius === '50%'
    const paintOk = !f.imgs.length && !f.rasters.length && !f.gradients.length && !f.shadows.length && !f.chroma.length
    const touchOk = t.length > 0 && t.every((c) => c.ok)
    const contract = { plateOk, labelsOk, valuesOk, keysOk, ringOk, paintOk, touchOk }
    const label = `${vp.slug}: the strip is the operator control (${Object.entries(contract).filter(([, v]) => !v).map(([k]) => k).join(', ') || 'all clauses hold'})`
    if (EXPECT === 'r153') {
      record('S', label, Object.values(contract).every(Boolean), Object.values(contract).every(Boolean) ? { ring: f.ring, labels: f.labels.map((l) => l.text) } : { contract, plate: f.plate, labels: f.labels, values: f.values, keys: f.keys, imgs: f.imgs, rasters: f.rasters, gradients: f.gradients, shadows: f.shadows.slice(0, 6), chroma: f.chroma.slice(0, 8), touch: t.filter((c) => !c.ok) })
    } else {
      // Positive control: the HEAD bar must FAIL the contract, or the check cannot see a bezel.
      record('S', `${vp.slug} CONTROL: the HEAD bar fails the operator contract`, !Object.values(contract).every(Boolean), { contract, chroma: f.chroma.slice(0, 4), rasters: f.rasters, gradients: f.gradients.slice(0, 4) })
    }
    await ctx.close()
  }
}

// ── H: the hero never makes a session wait ───────────────────────────────────
async function heroAt(page) {
  return page.evaluate(() => {
    const layer = document.querySelector('.char-layer')
    if (!layer) return { missing: true }
    const imgs = [...layer.querySelectorAll('img')].map((i) => ({ src: i.getAttribute('src'), done: i.complete && i.naturalWidth > 0, w: i.naturalWidth }))
    const motionEls = [...layer.querySelectorAll('[data-motion]')].map((e) => e.getAttribute('data-motion'))
    const strips = [...layer.querySelectorAll('*')].map((e) => getComputedStyle(e).backgroundImage).filter((b) => /ui\/hero\//.test(b))
    const anims = layer.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').map((a) => a.animationName || a.constructor.name)
    return { imgs, motionEls, strips: strips.length, anims }
  })
}

const FLOAT_AND_ACCENTS = new Set(['char-idle', 'antenna-blink', 'visor-glint', 'chest-lamp-breathe'])
// Svelte scopes keyframe names (svelte-<hash>-char-idle); the first run of this proof compared the
// scoped names against bare ones and called the float a reaction. Compare the unscoped name.
const unscope = (n) => String(n).replace(/^svelte-[a-z0-9]+-/, '')

async function sectionH(browser, base) {
  const vp = { width: 1280, height: 800 }
  const SESSION = ['win', 'bigWin', 'loss', 'bigWin', 'win']
  const state = { queue: [...SESSION], bets: 0 }
  const heroRequests = []
  const { ctx, page, pageErrors } = await openGame(browser, base, vp, state, (req) => {
    if (/\/ui\/hero\//.test(req.url())) heroRequests.push(req.url().replace(base, ''))
  })
  const spinBtn = page.locator('[data-testid="spin-button"]')
  const presses = []
  const rest = await heroAt(page)
  for (let i = 0; i < SESSION.length; i++) {
    // Press the moment SPIN is enabled again: the session never waits on anything it does not have to.
    const tReady0 = Date.now()
    await page.waitForFunction(() => {
      const b = document.querySelector('[data-testid="spin-button"]')
      return b && !b.disabled && !b.classList.contains('spinning')
    }, null, { timeout: 30000 })
    const waitedMs = Date.now() - tReady0
    const atPress = await heroAt(page)
    const box = await spinBtn.boundingBox()
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    const t0 = Date.now()
    await page.waitForFunction(() => document.querySelector('[data-testid="spin-button"]')?.classList.contains('spinning'), null, { timeout: 5000 }).catch(() => {})
    await waitSpinDone(page, 30000)
    const settledMs = Date.now() - t0
    const atSettle = await heroAt(page)
    presses.push({ spin: i + 1, round: SESSION[i], waitedBeforePressMs: waitedMs, pressToSettleMs: settledMs, atPress, atSettle })
  }
  await page.screenshot({ path: join(OUT, 'H_desktop-1280_after_five.png') })
  await ctx.close()
  writeFileSync(join(OUT, 'H_session.json'), JSON.stringify({ rest, presses, heroRequests, pageErrors }, null, 2))

  const reactionsSeen = presses.flatMap((p) => [p.atPress, p.atSettle]).filter((h) => h.motionEls?.some((m) => m !== 'idle') || h.anims?.some((n) => !FLOAT_AND_ACCENTS.has(unscope(n))))
  if (EXPECT === 'r153') {
    const still = rest.imgs?.length === 1 && /\/ui\/scene_character\.png$/.test(rest.imgs[0].src) && rest.imgs[0].done && rest.imgs[0].w === 680
    record('H', 'the hero at rest is one decoded <img> of ui/scene_character.png (680 wide)', still, rest)
    const unchanged = presses.every((p) => [p.atPress, p.atSettle].every((h) => h.imgs?.length === 1 && h.imgs[0].src === rest.imgs?.[0]?.src && !h.motionEls.length && !h.strips))
    record('H', 'at all ten press and settle points the hero is that same still, with no reaction state and no strip', unchanged, presses.map((p) => ({ spin: p.spin, press: p.atPress, settle: p.atSettle })).filter((p) => !(p.press.imgs?.length === 1 && !p.press.motionEls.length)))
    record('H', 'nothing on the hero runs at any press or settle but the float and its three light accents', reactionsSeen.length === 0, reactionsSeen.slice(0, 3))
    record('H', 'zero requests for ui/hero/ in the session', heroRequests.length === 0, heroRequests)
    record('H', 'no page errors in the session', pageErrors.length === 0, pageErrors)
    console.log(`         session: ${presses.map((p) => `${p.round} ${p.pressToSettleMs}ms`).join(', ')}`)
  } else {
    const found = reactionsSeen.length > 0 || heroRequests.length > 0
    record('H', 'CONTROL: the HEAD session shows a hero reaction at a press or settle, or requests a strip', found, { reactionsAtPoints: reactionsSeen.length, heroRequests: heroRequests.length, sample: reactionsSeen.slice(0, 2) })
    console.log(`         session: ${presses.map((p) => `${p.round} ${p.pressToSettleMs}ms`).join(', ')}`)
  }
  results.session = presses.map((p) => ({ spin: p.spin, round: p.round, pressToSettleMs: p.pressToSettleMs, waitedBeforePressMs: p.waitedBeforePressMs }))
}

// ── G: the gauge out of the bar ──────────────────────────────────────────────
async function sectionG(browser, base) {
  const vp = { width: 1280, height: 800 }
  const state = { queue: ['feature'], bets: 0 }
  const { ctx, page, pageErrors } = await openGame(browser, base, vp, state)
  const box = await page.locator('[data-testid="spin-button"]').boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  const gate = page.locator('[data-testid="entry-continue"]')
  await gate.first().waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(600)
  const gb = await gate.first().boundingBox()
  await page.mouse.click(gb.x + gb.width / 2, gb.y + gb.height / 2)
  // The retrigger beat: the holder is lifted above the free-spins overlay.
  const beat = await page.waitForSelector('.jets-holder.above-overlay', { timeout: 120000 }).then(() => true).catch(() => false)
  if (!beat) { record('G', 'the retrigger beat was reached', false, { pageErrors }); await ctx.close(); return }
  await page.waitForTimeout(250)
  const clip = { x: 281, y: 600, width: 718, height: 88 }
  // Freeze EVERYTHING for the pair, so the only difference between the two shots is the jets'
  // presence. The first run paused only the jets and counted 20,513 pixels of small difference
  // across the box: the scene behind the 90% plate (car hover, neon) kept moving, and its biggest
  // steps were in the plate's uncovered rounded corner.
  await page.evaluate(() => { for (const a of document.getAnimations()) a.pause() })
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' })
  await page.waitForTimeout(120)
  const noise1 = await page.screenshot({ clip })
  const noise2 = await page.screenshot({ clip })
  const shown = await page.screenshot({ clip })
  await page.evaluate(() => { document.querySelector('.jets-holder').style.visibility = 'hidden' })
  await page.waitForTimeout(80)
  const hidden = await page.screenshot({ clip })
  await page.evaluate(() => { document.querySelector('.jets-holder').style.visibility = '' })
  await page.screenshot({ path: join(OUT, 'G_desktop-1280_retrigger_beat.png') })
  writeFileSync(join(OUT, 'G_strip_jets_shown.png'), shown)
  writeFileSync(join(OUT, 'G_strip_jets_hidden.png'), hidden)
  const counts = await page.evaluate(async ({ a, b, c, d }) => {
    async function px(b64) { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const x = cv.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height).data }
    const [A, B, C, D] = await Promise.all([a, b, c, d].map(px))
    const diff = (P, Q, t) => { let n = 0; for (let i = 0; i < P.length; i += 4) { if (Math.abs(P[i] - Q[i]) + Math.abs(P[i + 1] - Q[i + 1]) + Math.abs(P[i + 2] - Q[i + 2]) > t) n++ } return n }
    return { noise: diff(A, B, 24), gaugeInk: diff(C, D, 24), noiseAny: diff(A, B, 0), gaugeInkAny: diff(C, D, 0), total: A.length / 4 }
  }, { a: noise1.toString('base64'), b: noise2.toString('base64'), c: shown.toString('base64'), d: hidden.toString('base64') })
  await ctx.close()
  results.gauge = counts
  if (EXPECT === 'r153') {
    record('G', `nothing of the flame gauge paints inside the strip at the retrigger beat (${counts.gaugeInk} px differ with the jets shown vs hidden, noise floor ${counts.noise}, of ${counts.total})`, counts.gaugeInk <= counts.noise, counts)
  } else {
    record('G', `CONTROL: at HEAD the gauge paints inside the strip at the beat (${counts.gaugeInk} px vs noise ${counts.noise})`, counts.gaugeInk > counts.noise + 50, counts)
  }
}

const server = await startStaticServer(DIST)
const base = `http://127.0.0.1:${server.port}`
const browser = await chromium.launch()
try {
  console.log(`R153 PROOF (${EXPECT}) against ${DIST}\n`)
  await sectionS(browser, base)
  await sectionH(browser, base)
  await sectionG(browser, base)
} catch (e) {
  failures++
  console.error(`R153 PROOF: threw: ${e.stack || e}`)
} finally {
  await browser.close()
  await server.close()
}
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2))
console.log(`\nversion line: ${results.version}`)
console.log(`written to ${OUT}`)
if (failures || !results.version) { console.error(`R153 PROOF (${EXPECT}): FAIL (${failures} finding(s))`); process.exit(1) }
console.log(`R153 PROOF (${EXPECT}): PASS`)
