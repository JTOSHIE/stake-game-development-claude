#!/usr/bin/env node
//
// r154_win_frame_proof.mjs: the R154 TASK 2 proof (reports/briefs/FS_R154_MergeRuleWinBanner_Prompt.md),
// run against a PRODUCTION build. The wallet is routed and serves the committed base.bigWin book round
// from src/lib/services/__fixtures__/replay_rounds.json with its payout set per tier (16.2x, 45x, 162x
// of a 1.00 bet), which is how the R154 wave 1 measurement pinned BIG, MEGA and EPIC: the client takes
// the win from round.payout and the tier from winAmount / betAmount. No DEV hook exists in that build.
//
// CASES. 1280x720 and 390x844 at BIG, MEGA and EPIC (the brief's two widths); EPIC at 1366x768, where
// the stage is scaled by a non-integer factor; EPIC at 768x1024, a portrait screen wider than the 500px
// phone breakpoint; and EPIC paid in Egyptian pounds at 1280 and 390, whose currency sign draws in the
// numeric stack's fallback face. Each case is held once the entry animation has finished and the
// count-up has landed, with timers cleared and endless animations paused at the start of their cycle.
//
// WHAT IT CLAIMS, per case:
//   F1  THE FRAME LOADS. The banner holds the .c1-frame pair; its computed border-image-source is
//       <assetBase>/frames/frame-2.png, every response for it was 200 with an image type, and the browser
//       decodes that exact URL to 800x640. A 200 alone proves nothing: the static server, like vite
//       preview, answers an unknown path with index.html and 200, which is how a stylesheet-relative
//       url() 404s in production while other gates stay green (R154 wave 1).
//   F2  NOTHING BAKED. Every raster the banner subtree draws (img src, and every url() in
//       background-image, border-image-source, mask-image and content, on elements and their ::before
//       and ::after) is on a list of committed text-free files.
//   F3  EVERYTHING READ IS LIVE. The tier label is the tier's word, the amount is the paid figure and
//       equals the HUD WIN pod's text, and the multiplier reads <n> x BET, all as DOM text.
//   F4  THE FRAME IS BEHIND THE LABEL AND THE AMOUNT. The frame's box contains the label's, the
//       amount's and the multiplier's, and the frame paints under them (positioned, lower z-index, one
//       stacking context).
//   F5  IT FITS. Label and amount: scrollWidth <= clientWidth + 1.
//   F6  NO INK IS CLIPPED. The amount clips its own overflow. Its region is photographed with the art
//       layers hidden, as drawn and with overflow visible; a pixel OUTSIDE the box that comes back bright
//       is ink the clip cut. (The label does not clip, so it cannot be cut and is not tested.)
//   F7  IT STANDS ON THE BAND'S EDGE. The plaque's bottom is at or above the face's bottom, and the face
//       keeps the band's height as wave 1 measured it on main (1280: 111 / 140 / 172; 390: 138.14 /
//       148.5 / 158.86 stage px). At 1280 the plaque lies inside the reel frame's x 320 to 960; on
//       every screen the frame lies inside the viewport.
//   F8  THE HUD IS UNTOUCHED. Hiding the banner changes zero pixels of the HUD WIN pod.
//   F9  NO SEAMS. The frame is a 9-slice, and wherever the stage scale is not 1 its joints drew a
//       one-pixel seam across the neon core (35 to 49 levels deep, wave 2). The worst dip in the core at
//       the joints, against the core either side, must be 14 levels or less. Measured with the seal at
//       390, 360, 430, 1366, 1920 and 1280 (1x, and 390 at 3x): 10 at most, the residue being the
//       corner tube's own shading where it bends (looked at 8x: no line). Without the seal: 18.8 at
//       least, and 26 to 49 in most cases.
//
// CONTROLS, convention (p), each planting the defect in the form it really took:
//   F1  in the 1280 BIG case the frame's inline url is replaced by the path a stylesheet-relative url
//       resolves to in production (assets/assets/...), and the decode check must FAIL.
//   F6  in the 1280 Egyptian pound case the amount's clip room (padding-block / margin-block) is removed,
//       which is the R154 first cut that cut the sign's feet, and the detector must see cut ink.
//   F9  in the 1366 case the seal copy of the frame is hidden, which is the first cut, and the dip must
//       exceed 15 levels.
//   --expect head runs the cases against main's build (DIST=<that dist>) and requires F1 to FAIL in
//   every case, since main has no frame.
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

const HARD_TIMEOUT_MS = 15 * 60_000
setTimeout(() => { console.error('R154 PROOF: HARD TIMEOUT, failing red'); process.exit(1) }, HARD_TIMEOUT_MS).unref()

const RGS_HOST = 'rgs.r154-proof.invalid'
const START_MICROS = 50_000_000_000
const BET_MICROS = 1_000_000
const FIXTURES = JSON.parse(readFileSync(join(ROOT, 'src/lib/services/__fixtures__/replay_rounds.json'), 'utf-8'))
const TIER_CENTIBETS = { big: 1620, mega: 4500, epic: 16200 }
const TIER_WORD = { big: 'BIG WIN', mega: 'MEGA WIN', epic: 'EPIC WIN' }
const TEXT_FREE = [
  'ui/win/burst_big.png', 'ui/win/bloom_mega.png', 'ui/win/burst_epic.png',
  'ui/particles/shock_ring.png', 'ui/particles/coin.png', 'frames/frame-2.png',
]
// The band heights wave 1 measured on main's build, which the face must keep (stage px).
const BAND_H = { desktop: { big: 111, mega: 140, epic: 172 }, phone: { big: 138.14, mega: 148.5, epic: 158.86 } }
const CASES = [
  ...['big', 'mega', 'epic'].map((tier) => ({ key: `1280/${tier}`, w: 1280, h: 720, tier, band: 'desktop', reelX: true })),
  ...['big', 'mega', 'epic'].map((tier) => ({ key: `390/${tier}`, w: 390, h: 844, tier, band: 'phone' })),
  { key: '1366/epic', w: 1366, h: 768, tier: 'epic', band: 'desktop', seamControl: true },
  { key: '768x1024/epic', w: 768, h: 1024, tier: 'epic', band: 'desktop' },
  { key: 'egp1280/epic', w: 1280, h: 720, tier: 'epic', band: 'desktop', currency: 'EGP', clipControl: true },
  { key: 'egp390/epic', w: 390, h: 844, tier: 'epic', band: 'phone', currency: 'EGP' },
]
CASES[0].urlControl = true

// The count-up lengths are read from their single source rather than restated here.
const cuSrc = readFileSync(join(ROOT, 'src/lib/stores/winCountUp.ts'), 'utf-8')
const cu = cuSrc.match(/export const TIER_COUNT_UP_MS[^=]*=\s*\{\s*big:\s*(\d+),\s*mega:\s*(\d+),\s*epic:\s*(\d+)/)
if (!cu) { console.error('R154 PROOF: TIER_COUNT_UP_MS not found in winCountUp.ts'); process.exit(1) }
const COUNT_UP_MS = { big: +cu[1], mega: +cu[2], epic: +cu[3] }

const results = { dist: DIST, expect: EXPECT, version: null, cases: [] }
function check(rec, id, ok, detail) {
  rec.checks.push({ id, ok, detail })
  if (!ok) { rec.failed.push(id); console.error(`  FAIL ${rec.key} ${id}: ${JSON.stringify(detail).slice(0, 300)}`) }
  else console.log(`  ok   ${rec.key} ${id}`)
}

async function routeWallet(page, c) {
  let bets = 0
  const currency = c.currency || 'USD'
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const req = route.request()
    const url = req.url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) {
      return json({
        balance: { amount: START_MICROS, currency },
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
      bets += 1
      const cb = TIER_CENTIBETS[c.tier]
      return json({
        balance: { amount: START_MICROS - bets * BET_MICROS, currency },
        round: {
          betID: 900_000 + bets, active: true, mode: 'base', amount: BET_MICROS,
          payout: Math.round((BET_MICROS * cb) / 100), payoutMultiplier: cb / 100,
          state: { events: FIXTURES.base.bigWin.events },
        },
      })
    }
    if (url.includes('/wallet/end-round')) return json({ balance: { amount: START_MICROS, currency } })
    return json({})
  })
}

const ART = '.c1-tier-burst, .c1-shockwave, .c1-particle-layer, .c1-coin-layer, .c1-chromatic-flash'

async function setStyle(page, sel, prop, val) {
  await page.evaluate(([sel, prop, val]) => {
    const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount'))
    for (const e of b.querySelectorAll(sel)) { if (val === null) e.style.removeProperty(prop); else e.style.setProperty(prop, val, 'important') }
  }, [sel, prop, val])
}

// Pixels that differ between two PNG screenshots of the same clip, counted only outside `box` and only
// where the second shot is bright and much brighter than the first: reappearing ink. The reel canvas
// keeps repainting under paused CSS and moves dark backdrop pixels by about ten levels; that is not ink.
async function inkOutside(page, a, c, box) {
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
      const l1 = 0.2126 * d1[k] + 0.7152 * d1[k + 1] + 0.0722 * d1[k + 2]
      const l2 = 0.2126 * d2[k] + 0.7152 * d2[k + 1] + 0.0722 * d2[k + 2]
      if (l2 - l1 > 40 && Math.max(d2[k], d2[k + 1], d2[k + 2]) > 150) n++
    }
    return n
  }, [a.toString('base64'), c.toString('base64'), box])
}

async function amountCut(page, c, tag) {
  const r = await page.evaluate(() => {
    const q = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount')).querySelector('[data-testid="win-amount"]').getBoundingClientRect()
    return { x: q.left, y: q.top, right: q.right, bottom: q.bottom }
  })
  const pad = 14
  const clip = { x: Math.max(0, Math.floor(r.x - pad)), y: Math.max(0, Math.floor(r.y - pad)) }
  clip.width = Math.min(c.w, Math.ceil(r.right + pad)) - clip.x
  clip.height = Math.min(c.h, Math.ceil(r.bottom + pad)) - clip.y
  await setStyle(page, ART, 'visibility', 'hidden')
  const a = await page.screenshot({ clip })
  await setStyle(page, '[data-testid="win-amount"]', 'overflow', 'visible')
  const b = await page.screenshot({ clip })
  await setStyle(page, '[data-testid="win-amount"]', 'overflow', null)
  await setStyle(page, ART, 'visibility', null)
  if (a.equals(b)) return 0
  writeFileSync(join(OUT, `${c.key.replace(/\W+/g, '_')}_${tag}_clipped.png`), a)
  writeFileSync(join(OUT, `${c.key.replace(/\W+/g, '_')}_${tag}_unclipped.png`), b)
  return inkOutside(page, a, b, { x0: r.x - clip.x, y0: r.y - clip.y, x1: r.right - clip.x, y1: r.bottom - clip.y })
}

// The worst dip in the frame's neon core at the four joints of the top edge and the left edge, against
// the core 5 to 14 px either side, with everything but the frame and its window hidden.
async function seamDip(page) {
  const geo = await page.evaluate((ART) => {
    const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount'))
    for (const e of b.querySelectorAll(ART + ', .c1-tier-label, .c1-amount, .c1-mult, .c1-price')) e.style.setProperty('visibility', 'hidden', 'important')
    const fr = b.querySelector('.c1-frame:not(.c1-frame--seal)'), lk = b.querySelector('.c1-lockup')
    if (!fr || !lk) return null
    const r = fr.getBoundingClientRect(), s = r.width / lk.offsetWidth
    return { x: r.left, y: r.top, w: r.width, h: r.height, bw: parseFloat(getComputedStyle(fr).borderTopWidth) * s }
  }, ART)
  if (!geo) {
    await page.evaluate((ART) => {
      const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount'))
      for (const e of b.querySelectorAll(ART + ', .c1-tier-label, .c1-amount, .c1-mult, .c1-price')) e.style.removeProperty('visibility')
    }, ART)
    return { worst: null, missing: 'no frame' }
  }
  const ox = Math.max(0, Math.floor(geo.x) - 4), oy = Math.max(0, Math.floor(geo.y) - 4)
  const shot = await page.screenshot({ clip: { x: ox, y: oy, width: Math.ceil(geo.w) + 8, height: Math.ceil(geo.h) + 8 } })
  await page.evaluate((ART) => {
    const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount'))
    for (const e of b.querySelectorAll(ART + ', .c1-tier-label, .c1-amount, .c1-mult, .c1-price')) e.style.removeProperty('visibility')
  }, ART)
  return page.evaluate(async ([b64, g, ox, oy]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const cx = c.getContext('2d'); cx.drawImage(img, 0, 0)
    const d = cx.getImageData(0, 0, c.width, c.height).data, W = c.width
    const L = (x, y) => { const k = (Math.round(y) * W + Math.round(x)) * 4; return 0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2] }
    const x0 = g.x - ox, y0 = g.y - oy, x1 = x0 + g.w, y1 = y0 + g.h, bw = g.bw
    let best = -1, coreY = 0, coreX = 0
    for (let y = Math.ceil(y0 + 1); y < y0 + bw - 1; y++) { let m = 0, n = 0; for (let x = x0 + bw + 8; x < x1 - bw - 8; x += 2) { m += L(x, y); n++ } m /= n; if (m > best) { best = m; coreY = y } }
    best = -1
    for (let x = Math.ceil(x0 + 1); x < x0 + bw - 1; x++) { let m = 0, n = 0; for (let y = y0 + bw + 8; y < y1 - bw - 8; y += 2) { m += L(x, y); n++ } m /= n; if (m > best) { best = m; coreX = x } }
    const dip = (fn, j) => {
      const near = [], far = []
      for (let t = -14; t <= 14; t++) { const v = fn(j + t); if (Math.abs(t) <= 2) near.push(v); else if (Math.abs(t) >= 5) far.push(v) }
      far.sort((a, b) => a - b)
      return far[Math.floor(far.length / 2)] - Math.min(...near)
    }
    const joints = [dip((x) => L(x, coreY), x0 + bw), dip((x) => L(x, coreY), x1 - bw), dip((y) => L(coreX, y), y0 + bw), dip((y) => L(coreX, y), y1 - bw)]
    return { joints: joints.map((v) => +v.toFixed(1)), worst: +Math.max(...joints).toFixed(1) }
  }, [shot.toString('base64'), geo, ox, oy])
}

async function runCase(browser, base, c) {
  const rec = { key: c.key, checks: [], failed: [], frameResponses: [] }
  const ctx = await browser.newContext({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { const t = m.text(); if (t.startsWith('Future Spinner ')) results.version = t })
  page.on('response', (r) => {
    if (r.url().includes('/frames/frame-2.png')) rec.frameResponses.push({ url: r.url().replace(base, ''), status: r.status(), type: r.headers()['content-type'] || '' })
  })
  await routeWallet(page, c)
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
    await page.waitForFunction(() => !![...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount')), null, { timeout: 30000 })
    // Wait for the entry to FINISH rather than for a fixed time: on a loaded machine the entry can
    // still be waiting to start seconds after mount (wave 2 saw it on main's build and this one alike).
    await page.waitForFunction(() => {
      const w = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount'))?.querySelector('.c1-plate-wrap')
      return !!w && w.getAnimations().every((a) => a.playState === 'finished' || a.effect?.getComputedTiming?.().iterations === Infinity)
    }, null, { timeout: 30000 })
    await page.waitForTimeout(COUNT_UP_MS[c.tier] + 300)
    // Hold the frame: clear pending timers (the banner's own leave timer would remove it mid-proof)
    // and pause every endless animation at the start of its cycle, so two shots of one state are equal.
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
    await page.screenshot({ path: join(OUT, `${c.key.replace(/\W+/g, '_')}.png`) })

    const f = await page.evaluate((TEXT_FREE) => {
      const b = [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount'))
      const ci = b.closest('.canvas-inner')
      const ciR = ci.getBoundingClientRect()
      const scale = ciR.width / ci.offsetWidth
      const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height } }
      const S = (r) => r && { x: (r.x - ciR.left) / scale, right: (r.right - ciR.left) / scale, y: (r.y - ciR.top) / scale, bottom: (r.bottom - ciR.top) / scale, h: r.h / scale }
      const frames = b.querySelectorAll('.c1-frame')
      const main = b.querySelector('.c1-frame:not(.c1-frame--seal)')
      const urls = (v) => [...(v || '').matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1])
      const rasters = new Set()
      for (const e of [b, ...b.querySelectorAll('*')]) {
        if (e.tagName === 'IMG') rasters.add(e.currentSrc || e.src)
        for (const pseudo of [null, '::before', '::after']) {
          const cs = getComputedStyle(e, pseudo)
          for (const v of [cs.backgroundImage, cs.borderImageSource, cs.maskImage, cs.webkitMaskImage, cs.content]) for (const u of urls(v)) rasters.add(u)
        }
      }
      const offList = [...rasters].filter((u) => !TEXT_FREE.some((t) => u.endsWith('/' + t)))
      const label = b.querySelector('.c1-tier-label'), amount = b.querySelector('[data-testid="win-amount"]'), mult = b.querySelector('.c1-mult')
      const pod = [...document.querySelectorAll('[data-testid="hud-win"]')].find((x) => x.getBoundingClientRect().width > 0 && !x.closest('.warm-mount'))
      const face = b.querySelector('.fs-plate > .fs-face'), lockup = b.querySelector('.c1-lockup')
      const z = (e) => { const cs = getComputedStyle(e); return { pos: cs.position, z: parseInt(cs.zIndex, 10), parent: e.parentElement === lockup } }
      return {
        frameCount: frames.length,
        frameSrcs: [...frames].map((e) => (urls(getComputedStyle(e).borderImageSource)[0] || null)),
        rasters: [...rasters], offList,
        labelText: label ? label.textContent.trim() : null,
        amountText: amount ? amount.textContent.trim() : null,
        multText: mult ? mult.textContent.trim() : null,
        hudWinText: pod ? pod.textContent.replace(/\s+/g, ' ').trim() : null,
        frameR: R(main), labelR: R(label), amountR: R(amount), multR: R(mult), podR: R(pod),
        faceS: S(R(face)), lockupS: S(R(lockup)),
        order: main && label && amount && mult ? { frame: z(main), label: z(label), amount: z(amount), mult: z(mult) } : null,
        fit: {
          label: label ? { scroll: label.scrollWidth, client: label.clientWidth } : null,
          amount: amount ? { scroll: amount.scrollWidth, client: amount.clientWidth } : null,
        },
        tierClass: (b.className.match(/tier-(big|mega|epic)/) || [])[1] || null,
      }
    }, TEXT_FREE)
    rec.facts = f
    check(rec, 'tier pinned', f.tierClass === c.tier, { tierClass: f.tierClass })

    // F1
    const decode = (u) => page.evaluate(async (u) => {
      const img = new Image(); img.src = u
      try { await img.decode(); return { w: img.naturalWidth, h: img.naturalHeight } } catch (e) { return { error: String(e) } }
    }, u)
    const decoded = []
    for (const u of f.frameSrcs) decoded.push(u ? await decode(u) : null)
    check(rec, 'F1 frame loads', f.frameCount === 2 && f.frameSrcs.every((u) => u && /\/frames\/frame-2\.png$/.test(u))
      && rec.frameResponses.length > 0 && rec.frameResponses.every((r) => r.status === 200 && /^image\//.test(r.type))
      && decoded.every((d) => d && d.w === 800 && d.h === 640),
      { frameCount: f.frameCount, frameSrcs: f.frameSrcs, responses: rec.frameResponses, decoded })
    if (c.urlControl && f.frameSrcs[0]) {
      // The production trap: a stylesheet-relative url resolves under /assets/, i.e. assets/assets/...
      const trap = f.frameSrcs[0].replace('/assets/themes/', '/assets/assets/themes/')
      const d = await decode(trap)
      check(rec, 'F1 control: the stylesheet-relative path fails to decode', !(d && d.w === 800 && d.h === 640), { trap, decoded: d })
    }

    // F2
    check(rec, 'F2 nothing baked', f.offList.length === 0, { offList: f.offList, rasters: f.rasters })

    // F3
    const n = Math.round(TIER_CENTIBETS[c.tier] / 100)
    const fig = (TIER_CENTIBETS[c.tier] / 100).toFixed(2)
    const amountOk = c.currency ? !!f.amountText && f.amountText.includes(fig) : f.amountText === `$${fig}`
    check(rec, 'F3 live text', f.labelText === TIER_WORD[c.tier] && amountOk && !!f.hudWinText && f.hudWinText.includes(f.amountText || '\u0000')
      && new RegExp(`^${n}\\u00d7 BET$`).test(f.multText || ''), { label: f.labelText, amount: f.amountText, hud: f.hudWinText, mult: f.multText })

    // F4
    const inside = (o, i) => o && i && i.x >= o.x - 0.5 && i.right <= o.right + 0.5 && i.y >= o.y - 0.5 && i.bottom <= o.bottom + 0.5
    const o = f.order
    const behind = !!o && [o.label, o.amount, o.mult].every((t) => t.parent && t.pos !== 'static' && t.z > o.frame.z) && o.frame.parent && o.frame.pos !== 'static'
    check(rec, 'F4 frame behind label and amount', inside(f.frameR, f.labelR) && inside(f.frameR, f.amountR) && inside(f.frameR, f.multR) && behind,
      { frame: f.frameR, label: f.labelR, amount: f.amountR, mult: f.multR, order: o })

    // F5
    const fits = (x) => x && x.scroll <= x.client + 1
    check(rec, 'F5 fits', fits(f.fit.label) && fits(f.fit.amount), f.fit)

    // F6
    const cut = await amountCut(page, c, 'asbuilt')
    check(rec, 'F6 no ink clipped', cut === 0, { amountPixelsCut: cut })
    if (c.clipControl) {
      await setStyle(page, '[data-testid="win-amount"]', 'padding-block', '0px')
      await setStyle(page, '[data-testid="win-amount"]', 'margin-block', '0px')
      const seeded = await amountCut(page, c, 'seeded')
      await setStyle(page, '[data-testid="win-amount"]', 'padding-block', null)
      await setStyle(page, '[data-testid="win-amount"]', 'margin-block', null)
      check(rec, 'F6 control: without the clip room the sign is cut', seeded > 20, { seededPixelsCut: seeded })
    }

    // F7
    const bandH = BAND_H[c.band][c.tier]
    const geomOk = f.lockupS && f.faceS && f.lockupS.bottom <= f.faceS.bottom + 0.5 && Math.abs(f.faceS.h - bandH) <= 0.6
      && (!c.reelX || (f.lockupS.x >= 320 - 0.5 && f.lockupS.right <= 960 + 0.5))
      && f.frameR.x >= -0.5 && f.frameR.right <= c.w + 0.5
    check(rec, 'F7 stands on the band edge, inside the screen', !!geomOk, { lockup: f.lockupS, face: f.faceS, bandH, frame: f.frameR, viewportW: c.w })

    // F8
    let podChanged = null
    if (f.podR) {
      const clip = { x: Math.floor(f.podR.x), y: Math.floor(f.podR.y), width: Math.ceil(f.podR.w), height: Math.ceil(f.podR.h) }
      const shown = await page.screenshot({ clip })
      await page.evaluate(() => { [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount')).style.setProperty('visibility', 'hidden', 'important') })
      const hidden = await page.screenshot({ clip })
      await page.evaluate(() => { [...document.querySelectorAll('[data-testid="win-banner"]')].find((e) => !e.closest('.warm-mount')).style.removeProperty('visibility') })
      podChanged = shown.equals(hidden) ? 0 : 'differs'
    }
    check(rec, 'F8 HUD WIN pod untouched', podChanged === 0, { podChanged, pod: f.podR })

    // F9
    const seam = await seamDip(page)
    check(rec, 'F9 no seams at the joints', seam.worst !== null && seam.worst <= 14, seam)
    if (c.seamControl) {
      await setStyle(page, '.c1-frame--seal', 'display', 'none')
      const seeded = await seamDip(page)
      await setStyle(page, '.c1-frame--seal', 'display', null)
      check(rec, 'F9 control: without the seal the joints show', seeded.worst > 15, seeded)
    }
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
  for (const c of CASES) results.cases.push(await runCase(browser, base, c))
} finally {
  if (browser) await browser.close()
  await server.close()
}

// Verdict. In r154 mode every check must pass. In head mode the build is main's, which has no frame:
// every case must still pin its tier and run, and F1 must FAIL in every case.
let failures = 0
if (EXPECT === 'r154') failures = results.cases.reduce((n, c) => n + c.failed.length, 0)
else {
  for (const c of results.cases) {
    const ran = !c.failed.includes('case ran') && !c.failed.includes('tier pinned')
    if (!ran || !c.failed.includes('F1 frame loads')) { failures++; console.error(`  CONTROL ${c.key}: expected F1 to fail on main's build (ran=${ran}, failed=${JSON.stringify(c.failed)})`) }
  }
}
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2))
console.log(`\nR154 PROOF (${EXPECT}) ${results.version || 'version line not seen'}: ${failures === 0 ? 'PASS' : `FAIL (${failures})`}  ${join(OUT, 'results.json')}`)
process.exit(failures === 0 ? 0 : 1)
