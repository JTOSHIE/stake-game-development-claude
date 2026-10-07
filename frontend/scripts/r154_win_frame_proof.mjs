#!/usr/bin/env node
//
// r154_win_frame_proof.mjs: the R154 TASK 2 proof (reports/briefs/FS_R154_MergeRuleWinBanner_Prompt.md),
// run against a PRODUCTION build. The wallet is routed and serves the committed base.bigWin book round
// from src/lib/services/__fixtures__/replay_rounds.json with its payout set per tier (16.2x, 45x, 162x
// of a 1.00 bet), which is how the R154 wave 1 measurement pinned BIG, MEGA and EPIC: the client takes
// the win from round.payout and the tier from winAmount / betAmount. No DEV hook exists in that build.
//
// WHAT IT CLAIMS, at 1280x720 and 390x844, for BIG, MEGA and EPIC (six cases), once the count-up has
// landed and with timers cleared and animations paused:
//
//   F1  THE FRAME LOADS. The banner holds one .c1-frame whose computed border-image-source is
//       <assetBase>/frames/frame-2.png; that URL answered 200 with an image content type, and the
//       browser decodes it to 800x640. The 200-only check is not enough here: the static server, like
//       vite preview, answers an unknown path with index.html and 200, which is how a stylesheet-relative
//       url() would 404 in production while every other gate stayed green (R154 wave 1).
//   F2  NOTHING BAKED. Every raster the banner subtree draws (img src, background-image, border-image)
//       is on a list of committed text-free files: the three tier artworks, the shock ring, the coin and
//       frame-2.png. A lettered raster arriving later fails this.
//   F3  EVERYTHING READ IS LIVE. The tier label is the tier's word, the amount equals the HUD WIN pod's
//       text and the paid figure, and the multiplier reads <n> x BET, all as DOM text.
//   F4  THE FRAME IS BEHIND THE LABEL AND THE AMOUNT. The frame's box contains the label's, the
//       amount's and the multiplier's boxes.
//   F5  IT FITS. Label and amount: scrollWidth <= clientWidth + 1.
//   F6  NO INK IS CLIPPED. The amount clips its own overflow; its region is photographed as drawn and
//       again with overflow visible, and any differing pixel is glyph ink the plaque's tighter line box
//       cut off. Same for the label.
//   F7  IT STANDS ON THE BAND'S EDGE. The plaque's bottom is at or above the face's bottom, the face
//       keeps the band's measured height (1280: 111 / 140 / 172; 390: 138 / 148.5 / 159 stage px), and
//       at 1280 the plaque lies inside the reel frame's x 320 to 960.
//   F8  THE HUD IS UNTOUCHED. Hiding the banner changes zero pixels of the HUD WIN pod.
//
// POSITIVE CONTROL: --expect head runs the same cases against main's build (DIST=<that dist>) and
// requires F1 to FAIL in every case, since main has no frame. An instrument that cannot see the
// frame's absence there has not shown its presence here.
//
// WHERE IT WRITES. Scratch only (convention (h.1)): qaTmpDir('r154-proof', <label>).
//
// USAGE (from frontend/)
//   node scripts/r154_win_frame_proof.mjs                                  # the build in dist/
//   DIST=<dir> node scripts/r154_win_frame_proof.mjs --expect head --label head
//
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { startStaticServer } from './lib/previewServer.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = process.env.DIST ? resolve(process.env.DIST) : join(ROOT, 'dist')
const argv = process.argv.slice(2)
let EXPECT = 'r154', LABEL = 'r154'
while (argv.length) {
  const a = argv.shift()
  if (a === '--expect') EXPECT = argv.shift()
  else if (a === '--label') LABEL = argv.shift()
  else { console.error(`unknown argument: ${a}`); process.exit(2) }
}
if (EXPECT !== 'r154' && EXPECT !== 'head') { console.error('--expect must be r154 or head'); process.exit(2) }
const OUT = qaTmpDir('r154-proof', LABEL)
mkdirSync(OUT, { recursive: true })

const HARD_TIMEOUT_MS = 10 * 60_000
setTimeout(() => { console.error('R154 PROOF: HARD TIMEOUT, failing red'); process.exit(1) }, HARD_TIMEOUT_MS).unref()

const RGS_HOST = 'rgs.r154-proof.invalid'
const START_MICROS = 50_000_000_000
const BET_MICROS = 1_000_000
const FIXTURES = JSON.parse(readFileSync(join(ROOT, 'src/lib/services/__fixtures__/replay_rounds.json'), 'utf-8'))
const TIER_CENTIBETS = { big: 1620, mega: 4500, epic: 16200 }
const TIER_WORD = { big: 'BIG WIN', mega: 'MEGA WIN', epic: 'EPIC WIN' }
const BAND_H = { 1280: { big: 111, mega: 140, epic: 172 }, 390: { big: 138, mega: 148.5, epic: 159 } }
const VIEWPORTS = { 1280: { width: 1280, height: 720 }, 390: { width: 390, height: 844 } }
const TEXT_FREE = [
  'ui/win/burst_big.png', 'ui/win/bloom_mega.png', 'ui/win/burst_epic.png',
  'ui/particles/shock_ring.png', 'ui/particles/coin.png', 'frames/frame-2.png',
]

// The count-up lengths are read from their single source rather than restated here.
const cuSrc = readFileSync(join(ROOT, 'src/lib/stores/winCountUp.ts'), 'utf-8')
const cu = cuSrc.match(/export const TIER_COUNT_UP_MS[^=]*=\s*\{\s*big:\s*(\d+),\s*mega:\s*(\d+),\s*epic:\s*(\d+)/)
if (!cu) { console.error('R154 PROOF: TIER_COUNT_UP_MS not found in winCountUp.ts'); process.exit(1) }
const COUNT_UP_MS = { big: +cu[1], mega: +cu[2], epic: +cu[3] }

const results = { dist: DIST, expect: EXPECT, version: null, cases: [] }
let failures = 0
function check(rec, id, ok, detail) {
  rec.checks.push({ id, ok, detail })
  if (!ok) { rec.failed.push(id); console.error(`  FAIL ${rec.key} ${id}: ${JSON.stringify(detail).slice(0, 300)}`) }
  else console.log(`  ok   ${rec.key} ${id}`)
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
          minBet: 100_000, maxBet: 100_000_000, stepBet: 100_000, defaultBetLevel: BET_MICROS,
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
      state.bets += 1
      const cb = state.centibets
      return json({
        balance: { amount: START_MICROS - state.bets * BET_MICROS, currency: 'USD' },
        round: {
          betID: 900_000 + state.bets, active: true, mode: 'base', amount: BET_MICROS,
          payout: Math.round((BET_MICROS * cb) / 100), payoutMultiplier: cb / 100,
          state: { events: FIXTURES.base.bigWin.events },
        },
      })
    }
    if (url.includes('/wallet/end-round')) return json({ balance: { amount: START_MICROS, currency: 'USD' } })
    return json({})
  })
}

async function runCase(browser, base, vpKey, tier) {
  const rec = { key: `${vpKey}/${tier}`, vp: vpKey, tier, checks: [], failed: [], frameResponses: [] }
  const ctx = await browser.newContext({ viewport: VIEWPORTS[vpKey], deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { const t = m.text(); if (t.startsWith('Future Spinner ')) results.version = t })
  page.on('response', (r) => {
    if (r.url().includes('/frames/frame-2.png')) rec.frameResponses.push({ url: r.url().replace(base, ''), status: r.status(), type: r.headers()['content-type'] || '' })
  })
  await routeWallet(page, { bets: 0, centibets: TIER_CENTIBETS[tier] })
  try {
    await page.goto(`${base}/?sessionID=r154-proof&rgs_url=${RGS_HOST}&lang=en`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2400)
    await dismissIntro(page).catch(() => {})
    await page.waitForTimeout(1500)
    await page.evaluate(() => document.fonts.ready.then(() => true))
    await page.waitForFunction(() => {
      const b = [...document.querySelectorAll('[data-testid="spin-button"]')].find((e) => !e.closest('.warm-mount') && e.getBoundingClientRect().width > 0)
      return b && !b.disabled
    }, null, { timeout: 30000 })
    const spin = await page.locator('[data-testid="spin-button"]:visible').first().boundingBox()
    await page.mouse.click(spin.x + spin.width / 2, spin.y + spin.height / 2)
    await page.waitForFunction(() => [...document.querySelectorAll('[data-testid="win-banner"]')].some((e) => !e.closest('.warm-mount')), null, { timeout: 30000 })
    await page.waitForTimeout(COUNT_UP_MS[tier] + 300)
    // Hold the frame: clear pending timers (the banner's own leave timer would remove it mid-proof)
    // and pause every animation at the start of its cycle, so two shots of the same state are equal.
    await page.evaluate(() => {
      const top = setTimeout(() => {}, 0)
      for (let i = 1; i <= top; i++) clearTimeout(i)
      for (const a of document.getAnimations()) {
        a.pause()
        const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null
        if (t && t.iterations === Infinity && typeof a.currentTime === 'number') {
          const d = t.delay || 0, dur = typeof t.duration === 'number' ? t.duration : 0
          if (dur > 0 && a.currentTime > d) a.currentTime = d + Math.floor((a.currentTime - d) / dur) * dur
        }
      }
    })
    await page.waitForTimeout(200)
    await page.screenshot({ path: join(OUT, `${vpKey}_${tier}.png`) })

    const f = await page.evaluate((TEXT_FREE) => {
      const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount'))
      const ci = b.closest('.canvas-inner')
      const ciR = ci.getBoundingClientRect()
      const scale = ciR.width / ci.offsetWidth
      const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height } }
      const S = (r) => r && { x: (r.x - ciR.left) / scale, right: (r.right - ciR.left) / scale, y: (r.y - ciR.top) / scale, bottom: (r.bottom - ciR.top) / scale, h: r.h / scale }
      const frame = b.querySelectorAll('.c1-frame')
      const urlOf = (v) => { const m = /url\("?([^")]+)"?\)/.exec(v || ''); return m ? m[1] : null }
      const rasters = new Set()
      for (const e of [b, ...b.querySelectorAll('*')]) {
        if (e.tagName === 'IMG') rasters.add(e.currentSrc || e.src)
        const c = getComputedStyle(e)
        for (const v of [c.backgroundImage, c.borderImageSource]) { const u = urlOf(v); if (u) rasters.add(u) }
      }
      const offList = [...rasters].filter((u) => !TEXT_FREE.some((t) => u.endsWith('/' + t)))
      const label = b.querySelector('.c1-tier-label'), amount = b.querySelector('[data-testid="win-amount"]'), mult = b.querySelector('.c1-mult')
      const pod = [...document.querySelectorAll('[data-testid="hud-win"]')].find((x) => x.getBoundingClientRect().width > 0 && !x.closest('.warm-mount'))
      const face = b.querySelector('.fs-plate > .fs-face'), lockup = b.querySelector('.c1-lockup')
      return {
        frameCount: frame.length,
        frameSrc: frame[0] ? urlOf(getComputedStyle(frame[0]).borderImageSource) : null,
        rasters: [...rasters], offList,
        labelText: label ? label.textContent.trim() : null,
        amountText: amount ? amount.textContent.trim() : null,
        multText: mult ? mult.textContent.trim() : null,
        hudWinText: pod ? pod.textContent.replace(/\s+/g, ' ').trim() : null,
        frameR: R(frame[0]), labelR: R(label), amountR: R(amount), multR: R(mult), podR: R(pod),
        faceS: S(R(face)), lockupS: S(R(lockup)),
        fit: {
          label: label ? { scroll: label.scrollWidth, client: label.clientWidth } : null,
          amount: amount ? { scroll: amount.scrollWidth, client: amount.clientWidth } : null,
        },
        tierClass: (b.className.match(/tier-(big|mega|epic)/) || [])[1] || null,
      }
    }, TEXT_FREE)
    rec.facts = f
    check(rec, 'tier pinned', f.tierClass === tier, { tierClass: f.tierClass })

    // F1
    let decoded = null
    if (f.frameSrc) {
      decoded = await page.evaluate(async (u) => {
        const img = new Image(); img.src = u
        try { await img.decode(); return { w: img.naturalWidth, h: img.naturalHeight } } catch (e) { return { error: String(e) } }
      }, f.frameSrc)
    }
    const resp = rec.frameResponses.find((r) => f.frameSrc && f.frameSrc.endsWith(r.url.replace(/^\.?\//, '')))
    check(rec, 'F1 frame loads', f.frameCount === 1 && !!f.frameSrc && /\/frames\/frame-2\.png$/.test(f.frameSrc)
      && rec.frameResponses.length > 0 && rec.frameResponses.every((r) => r.status === 200 && /^image\/png/.test(r.type))
      && decoded && decoded.w === 800 && decoded.h === 640,
      { frameCount: f.frameCount, frameSrc: f.frameSrc, responses: rec.frameResponses, decoded, matched: resp || null })

    // F2
    check(rec, 'F2 nothing baked', f.offList.length === 0, { offList: f.offList, rasters: f.rasters })

    // F3
    const paid = `$${(TIER_CENTIBETS[tier] / 100).toFixed(2)}`
    const multRe = new RegExp(`^${Math.round(TIER_CENTIBETS[tier] / 100)}\\u00d7 BET$`)
    check(rec, 'F3 live text', f.labelText === TIER_WORD[tier] && f.amountText === paid && !!f.hudWinText && f.hudWinText.includes(paid)
      && multRe.test(f.multText || ''), { label: f.labelText, amount: f.amountText, hud: f.hudWinText, mult: f.multText })

    // F4
    const inside = (o, i) => o && i && i.x >= o.x - 0.5 && i.right <= o.right + 0.5 && i.y >= o.y - 0.5 && i.bottom <= o.bottom + 0.5
    check(rec, 'F4 frame behind label and amount', inside(f.frameR, f.labelR) && inside(f.frameR, f.amountR) && inside(f.frameR, f.multR),
      { frame: f.frameR, label: f.labelR, amount: f.amountR, mult: f.multR })

    // F5
    const fits = (x) => x && x.scroll <= x.client + 1
    check(rec, 'F5 fits', fits(f.fit.label) && fits(f.fit.amount), f.fit)

    // F6. Lifting the clip re-composites the tier art blended behind the plaque (mix-blend-mode:
    // screen), which moves a few dozen backdrop pixels by up to 37 levels with no text involved
    // (measured on the first cut of this proof). So the art layers are hidden for this check, and
    // only pixels OUTSIDE the element's own box are counted: clipped ink can only reappear there,
    // and only where it reappears bright (see the test below).
    const ART = '.c1-tier-burst, .c1-shockwave, .c1-particle-layer, .c1-coin-layer, .c1-chromatic-flash'
    const setStyle = (sel, prop, val) => page.evaluate(([sel, prop, val]) => {
      const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount'))
      for (const e of b.querySelectorAll(sel)) { if (val === null) e.style.removeProperty(prop); else e.style.setProperty(prop, val, 'important') }
    }, [sel, prop, val])
    const clipDiff = async (sel, tag) => {
      const r = await page.evaluate((sel) => {
        const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount'))
        const q = b.querySelector(sel).getBoundingClientRect(); return { x: q.left, y: q.top, right: q.right, bottom: q.bottom }
      }, sel)
      const vp = VIEWPORTS[vpKey]
      const pad = 14
      const clip = { x: Math.max(0, Math.floor(r.x - pad)), y: Math.max(0, Math.floor(r.y - pad)) }
      clip.width = Math.min(vp.width, Math.ceil(r.right + pad)) - clip.x
      clip.height = Math.min(vp.height, Math.ceil(r.bottom + pad)) - clip.y
      await setStyle(ART, 'visibility', 'hidden')
      const a = await page.screenshot({ clip })
      await setStyle(sel, 'overflow', 'visible')
      const c = await page.screenshot({ clip })
      await setStyle(sel, 'overflow', null)
      await setStyle(ART, 'visibility', null)
      if (a.equals(c)) return 0
      writeFileSync(join(OUT, `${vpKey}_${tier}_${tag}_clipped.png`), a)
      writeFileSync(join(OUT, `${vpKey}_${tier}_${tag}_unclipped.png`), c)
      const box = { x0: r.x - clip.x, y0: r.y - clip.y, x1: r.right - clip.x, y1: r.bottom - clip.y }
      return page.evaluate(async ([x, y, box]) => {
        const load = (b64) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + b64 })
        const [i1, i2] = await Promise.all([load(x), load(y)])
        const cv = document.createElement('canvas'); cv.width = i1.width; cv.height = i1.height
        const g = cv.getContext('2d'); g.drawImage(i1, 0, 0); const d1 = g.getImageData(0, 0, cv.width, cv.height).data
        g.clearRect(0, 0, cv.width, cv.height); g.drawImage(i2, 0, 0); const d2 = g.getImageData(0, 0, cv.width, cv.height).data
        let n = 0
        for (let py = 0; py < cv.height; py++) for (let px = 0; px < cv.width; px++) {
          if (px >= box.x0 && px < box.x1 && py >= box.y0 && py < box.y1) continue
          const k = (py * cv.width + px) * 4
          // Ink that reappears is BRIGHT (the amount is near-white, the label a lifted tier colour) and
          // much brighter than what the clip left there. The reel canvas keeps repainting under paused
          // CSS, which moves dark backdrop pixels by about ten levels; that is not counted.
          const l1 = 0.2126 * d1[k] + 0.7152 * d1[k + 1] + 0.0722 * d1[k + 2]
          const l2 = 0.2126 * d2[k] + 0.7152 * d2[k + 1] + 0.0722 * d2[k + 2]
          if (l2 - l1 > 40 && Math.max(d2[k], d2[k + 1], d2[k + 2]) > 150) n++
        }
        return n
      }, [a.toString('base64'), c.toString('base64'), box])
    }
    const amountClip = await clipDiff('[data-testid="win-amount"]', 'amount')
    const labelClip = await clipDiff('.c1-tier-label', 'label')
    check(rec, 'F6 no ink clipped', amountClip === 0 && labelClip === 0, { amountPixelsCut: amountClip, labelPixelsCut: labelClip })
    // The detector's own positive control, once per run: squeeze the amount's line box to 0.6 so its
    // glyphs must overrun it, and require the detector to see ink outside the box.
    if (vpKey === '1280' && tier === 'big') {
      await setStyle('[data-testid="win-amount"]', 'line-height', '0.6')
      const seeded = await clipDiff('[data-testid="win-amount"]', 'seeded')
      await setStyle('[data-testid="win-amount"]', 'line-height', null)
      check(rec, 'F6 detector sees a seeded clip', seeded > 50, { seededPixelsCut: seeded })
    }

    // F7
    const bandH = BAND_H[vpKey][tier]
    const geomOk = f.lockupS && f.faceS && f.lockupS.bottom <= f.faceS.bottom + 0.5 && Math.abs(f.faceS.h - bandH) <= 0.6
      && (vpKey !== '1280' || (f.lockupS.x >= 320 - 0.5 && f.lockupS.right <= 960 + 0.5))
    check(rec, 'F7 stands on the band edge', !!geomOk, { lockup: f.lockupS, face: f.faceS, bandH })

    // F8
    let podChanged = null
    if (f.podR) {
      const clip = { x: Math.floor(f.podR.x), y: Math.floor(f.podR.y), width: Math.ceil(f.podR.w), height: Math.ceil(f.podR.h) }
      const shown = await page.screenshot({ clip })
      await page.evaluate(() => { const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount')); b.style.setProperty('visibility', 'hidden', 'important') })
      const hidden = await page.screenshot({ clip })
      await page.evaluate(() => { const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount')); b.style.removeProperty('visibility') })
      podChanged = shown.equals(hidden) ? 0 : 'differs'
    }
    check(rec, 'F8 HUD WIN pod untouched', podChanged === 0, { podChanged, pod: f.podR })
    check(rec, 'no page errors', pageErrors.length === 0, pageErrors)
  } catch (e) {
    check(rec, 'case ran', false, String(e && e.stack || e))
  } finally {
    await ctx.close()
  }
  return rec
}

const server = await startStaticServer(DIST)
const base = `http://127.0.0.1:${server.port}`
let browser
try {
  browser = await chromium.launch()
  for (const vp of ['1280', '390']) for (const tier of ['big', 'mega', 'epic']) results.cases.push(await runCase(browser, base, vp, tier))
} finally {
  if (browser) await browser.close()
  await server.close()
}

// Verdict. In r154 mode every check must pass. In head mode the build is main's, which has no frame:
// every case must still pin its tier and run, and F1 must FAIL in every case.
if (EXPECT === 'r154') failures = results.cases.reduce((n, c) => n + c.failed.length, 0)
else {
  for (const c of results.cases) {
    const ran = !c.failed.includes('case ran') && !c.failed.includes('tier pinned')
    if (!ran || !c.failed.includes('F1 frame loads')) { failures++; console.error(`  CONTROL ${c.key}: expected F1 to fail on main's build (ran=${ran}, failed=${JSON.stringify(c.failed)})`) }
  }
}
results.version = results.version || null
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2))
console.log(`\nR154 PROOF (${EXPECT}) ${results.version || 'version line not seen'}: ${failures === 0 ? 'PASS' : `FAIL (${failures})`}  ${join(OUT, 'results.json')}`)
process.exit(failures === 0 ? 0 : 1)
