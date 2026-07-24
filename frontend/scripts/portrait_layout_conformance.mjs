// portrait_layout_conformance.mjs — PORTRAIT LAYOUT PASS, 2026-07-14;
// extended by the LANDSCAPE COMPACT HUD PASS, 2026-07-14b;
// extended by PORTRAIT LAYOUT V2, GRID-FIRST RECOMPOSITION, 2026-07-14c.
//
// Permanent mobile conformance suite: Playwright device descriptors
// (isMobile true), iPhone 14 + Pixel 7, portrait AND landscape each.
//   - committed screenshots: idle, spin, win, buy modal, paytable,
//     OVERBOOST-active -> reports/screens/portrait-v2/<device>-portrait/
//     (2026-07-14c: portrait's composition changed fundamentally - grid-first
//     recomposition, no scene/logo, controls pinned to the bottom safe-area -
//     so proofs moved from portrait-v1/ to a new v2 directory rather than
//     silently overwriting the old composition's screenshots) and
//     reports/screens/landscape-compact-v1/<device>-landscape/ (2026-07-14b:
//     landscape phones under 500px height render App.svelte's compact
//     single-row HUD instead of the old LAYOUT_SPEC absolute layout;
//     directory name unchanged this pass since the compact-strip composition
//     itself is untouched by 2026-07-14c, only cross-cutting SessionPanel/
//     dev-chip changes affect its content).
//   - touch-target audit: every visible interactive element (button,
//     [role=button], input, a[href], [tabindex]) asserts effective
//     (post-scale) bounding box >= 44px on both dimensions. Elements marked
//     data-dev (the collapsed DEV chip and its popover contents - dev-only,
//     confirmed absent from the real production build via `vite preview`)
//     are excluded, since they only appear because this suite drives the dev
//     server (needed for the window.__testStores hook), not a production
//     build.
//   - font-legibility assert: computed font-size >= 11px rendered, on the
//     portrait HUD's own text elements AND (2026-07-14b) the compact-
//     landscape strip's own text elements - closing the PR #78 disclosed
//     .fs-label/.audio-label sub-11px finding for both landscape profiles,
//     since they no longer render that template at all. Desktop landscape
//     (>=500px tall) still isn't covered by any Playwright device profile
//     here, so its .fs-label/.audio-label text remains an unsampled,
//     out-of-scope surface - not claimed as fixed.
//   - session-panel audit (2026-07-14c, item 3): the persistent TIME/SPINS/
//     NET overlay must be absent by default and reachable via the HUD menu's
//     "Session" item as an on-demand sheet, in every layout mode.
//   - frame-gate: re-run of the long-frame (>100ms) check across several
//     spins on the mobile (touch, device-scale-factor) profile.
//
// Run (from frontend/): node scripts/portrait_layout_conformance.mjs

import { chromium, devices } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
// 2026-07-14c: portrait's composition changed fundamentally (grid-first
// recomposition - no scene/logo, much larger grid, controls pinned to the
// true bottom safe-area), so its proofs move to a new v2 directory rather
// than overwriting v1's screenshots of the old composition in place.
const PORTRAIT_SCREENS_ROOT = join(__dirname, '..', '..', 'reports', 'screens', 'portrait-v2')
const LANDSCAPE_COMPACT_SCREENS_ROOT = join(__dirname, '..', '..', 'reports', 'screens', 'landscape-compact-v1')
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(PORTRAIT_SCREENS_ROOT, { recursive: true })
mkdirSync(LANDSCAPE_COMPACT_SCREENS_ROOT, { recursive: true })

const DEVICE_PROFILES = [
  { label: 'iphone14', portrait: 'iPhone 14', landscape: 'iPhone 14 landscape' },
  { label: 'pixel7', portrait: 'Pixel 7', landscape: 'Pixel 7 landscape' },
]

const TOUCH_TARGET_MIN = 44
const FONT_MIN = 11
const LONG_FRAME_MS = 100

async function getFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolvePromise(port))
    })
  })
}

function startDevServer(port) {
  return new Promise((resolvePreview, reject) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let resolved = false
    const onData = (d) => {
      const s = d.toString()
      if (!resolved && (/Local/.test(s) || new RegExp(`localhost:${port}`).test(s))) {
        resolved = true
        resolvePreview(proc)
      }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}

async function dismissIntro(page) {
  // HeroSplash (ANIMATION UPLIFT PASS 2026-07-16, item 1) shows first, on
  // every load, ahead of the once-per-session rules modal below.
  const splash = page.locator('[data-testid="hero-splash"]')
  if (await splash.count() > 0 && await splash.isVisible().catch(() => false)) {
    await splash.click()
    await page.waitForTimeout(100)
  }
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
}

async function waitSpinDone(page, timeout = 20000) {
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="spin-button"].spinning'),
    { timeout },
  )
}

async function waitTestStores(page) {
  await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
}

/** Enumerate every visible interactive element and its post-scale bounding
 *  box. Returns [{selector, testid, w, h, pass}]. */
async function auditTouchTargets(page) {
  return page.evaluate((MIN) => {
    const els = Array.from(document.querySelectorAll(
      'button, [role="button"], input, a[href], [tabindex]:not([tabindex="-1"])',
    ))
    return els
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        // Excludes PixiJS's own off-screen accessibility helper button
        // (rendered at top:-1000px by its internal AccessibilityManager) and
        // anything else parked outside the true viewport - not a reachable
        // touch target for a real user regardless of its box size.
        const onScreen = r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth
        // Excludes dev-only elements (theme selector, reel-mode toggle -
        // 2026-07-14b: marked data-dev in App.svelte, confirmed absent from
        // the real `vite preview` production DOM). This suite drives the dev
        // server (needed for window.__testStores), so these render here even
        // though a real player never sees them - auditing them against the
        // production 44px bar would be a false failure, not a real one.
        const isDevOnly = el.hasAttribute('data-dev')
        return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && onScreen && !isDevOnly
      })
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          testid: el.getAttribute('data-testid') || null,
          label: el.getAttribute('aria-label') || el.textContent?.trim()?.slice(0, 24) || null,
          tag: el.tagName.toLowerCase(),
          w: Math.round(r.width * 10) / 10,
          h: Math.round(r.height * 10) / 10,
          pass: r.width >= MIN && r.height >= MIN,
        }
      })
  }, TOUCH_TARGET_MIN)
}

/** Sample computed font-size on the portrait HUD's own text elements. */
async function auditPortraitFontSizes(page) {
  return page.evaluate((MIN) => {
    const selectors = [
      '.p-stat-label', '.p-stat-value', '.p-spin-txt', '.p-tier',
      '.p-max-cap', '.p-fm-entry-label', '.p-fm-entry-active', '.p-mode-badge',
    ]
    const out = []
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        const size = parseFloat(getComputedStyle(el).fontSize)
        out.push({ selector: sel, text: el.textContent?.trim()?.slice(0, 20) ?? '', fontSizePx: size, pass: size >= MIN })
      })
    }
    return out
  }, FONT_MIN)
}

/** Sample computed font-size on the compact-landscape strip's own text
 *  elements (2026-07-14b) - the same gate as portrait's, applied to .c-*. */
async function auditCompactLandscapeFontSizes(page) {
  return page.evaluate((MIN) => {
    const selectors = [
      '.c-stat-label', '.c-stat-value', '.c-tier', '.c-max-cap', '.c-mode-badge',
    ]
    const out = []
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        const size = parseFloat(getComputedStyle(el).fontSize)
        out.push({ selector: sel, text: el.textContent?.trim()?.slice(0, 20) ?? '', fontSizePx: size, pass: size >= MIN })
      })
    }
    return out
  }, FONT_MIN)
}

/** Diagnostic-only sample of known pre-existing sub-11px landscape text -
 *  not gated this pass (see session report), reported for visibility. */
async function sampleLandscapeSmallText(page) {
  return page.evaluate(() => {
    const out = []
    for (const sel of ['.fs-label', '.audio-label']) {
      document.querySelectorAll(sel).forEach((el) => {
        out.push({ selector: sel, fontSizePx: parseFloat(getComputedStyle(el).fontSize) })
      })
    }
    return out
  })
}

/** SessionPanel conformance assert (2026-07-14c, item 3): the persistent
 *  TIME/SPINS/NET overlay must be absent by default, and the same
 *  information must be reachable via the HUD menu's "Session" item as an
 *  on-demand sheet. Assumes the HUD menu is currently closed (true after
 *  the paytable step, which calls openPaytable() -> showMenu = false). */
async function auditSessionPanel(page) {
  const pinnedByDefault = await page.evaluate(
    () => document.querySelectorAll('[data-testid="session-panel-pinned"]').length > 0,
  )
  const menu = page.locator('[aria-label="Menu"]')
  await menu.first().click()
  await page.waitForTimeout(150)
  const sessionItem = page.locator('[data-testid="open-session-panel"]')
  const menuItemFound = (await sessionItem.count()) > 0
  if (menuItemFound) await sessionItem.click()
  await page.waitForTimeout(150)
  const sheetReachable = await page.evaluate(
    () => document.querySelectorAll('[data-testid="session-panel-sheet"]').length > 0,
  )
  // Close the sheet again so later steps (overboost screenshot, frame gate)
  // start from a clean state.
  if (sheetReachable) {
    await page.locator('.sp-sheet-close').click().catch(() => {})
    await page.waitForTimeout(100)
  }
  return {
    absentByDefault: !pinnedByDefault,
    reachableViaMenu: menuItemFound && sheetReachable,
    pass: !pinnedByDefault && menuItemFound && sheetReachable,
  }
}

/** Overdrive meter geometry (2026-07-15, item 2): confirms a real bonus buy,
 *  waits past the title-card transition, and asserts BonusInstrumentColumn
 *  (compact .pm-strip in portrait, the LAYOUT_SPEC .instrument-column
 *  otherwise) is fully within the true viewport bounds - not just present in
 *  the DOM, since the portrait v2 pass found the gauge column could be
 *  wholly off-screen while still "rendered". Skips gracefully (marks n/a)
 *  if the buy control isn't reachable at all. */
// Non-gating diagnostic (2026-07-15, NEON LIFT item 3): reports the luminance
// gap between a symbol tile's plate background and its symbol art so the
// "8-12% lighter plate" target can be tracked over time. Never fails the
// suite (pass is always true) - it's a trend readout, not a conformance gate.
async function auditSymbolLuminanceDiagnostic(page) {
  return page.evaluate(async () => {
    const cell = document.querySelector('.symbol-cell')
    if (!cell) return { skipped: true, reason: 'no symbol-cell found', pass: true }
    const plateBg = getComputedStyle(cell).backgroundColor
    const parsed = plateBg.match(/rgba?\(([^)]+)\)/)
    let plateLuminance = null
    if (parsed) {
      const [r, g, b] = parsed[1].split(',').map((v) => parseFloat(v))
      plateLuminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    }
    const img = cell.querySelector('.symbol-img')
    if (!img || !img.src) return { skipped: true, reason: 'no symbol-img found', plateLuminance, pass: true }
    const loadedImg = await new Promise((resolve) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => resolve(null)
      el.src = img.src
    })
    if (!loadedImg) return { skipped: true, reason: 'symbol image failed to load', plateLuminance, pass: true }
    const canvas = document.createElement('canvas')
    canvas.width = loadedImg.naturalWidth
    canvas.height = loadedImg.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(loadedImg, 0, 0)
    let data
    try {
      data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    } catch {
      return { skipped: true, reason: 'canvas read blocked', plateLuminance, pass: true }
    }
    let total = 0
    let count = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 16) continue
      total += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
      count++
    }
    const artLuminance = count > 0 ? total / count : null
    const luminanceDeltaPct = plateLuminance != null && artLuminance != null ? (artLuminance - plateLuminance) * 100 : null
    return { plateLuminance, artLuminance, luminanceDeltaPct, pass: true }
  })
}

/** OWNER AUDIT REMEDIATION item A2: every FEATURES menu item must be fully
 *  visible and tappable - either already on screen, or reachable by
 *  scrolling .fm-cards to it. Scrolls the card list to the very bottom (the
 *  worst case) and asserts the last card's full bounding box then sits
 *  inside the viewport, rather than being clipped by the panel's own
 *  overflow:hidden edge with no way to reach it (the touch-target audit
 *  only measures size, which is why this escaped it - a clipped element can
 *  still report a healthy width/height). */
async function auditMenuViewportClipping(browser, baseUrl, deviceName) {
  const context = await browser.newContext({ ...devices[deviceName] })
  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await waitTestStores(page)
  await dismissIntro(page)

  const featureMenuBtn = page.locator('[data-testid="feature-menu-button"]')
  if ((await featureMenuBtn.count()) === 0) {
    await context.close()
    return { skipped: true, reason: 'no feature-menu-button', pass: true }
  }
  await featureMenuBtn.click()
  await page.waitForTimeout(150)

  const result = await page.evaluate(() => {
    const list = document.querySelector('.fm-cards')
    if (!list) return { pass: false, reason: 'no .fm-cards element found' }
    list.scrollTop = list.scrollHeight
    const cards = Array.from(document.querySelectorAll('[data-testid^="feature-card-"]'))
    if (cards.length === 0) return { pass: false, reason: 'no feature cards found' }
    const last = cards[cards.length - 1]
    const r = last.getBoundingClientRect()
    const fullyVisible = r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth
    return {
      lastCardId: last.getAttribute('data-testid'),
      rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), viewportH: window.innerHeight },
      pass: fullyVisible,
    }
  })
  await context.close()
  return result
}

/** OWNER AUDIT REMEDIATION item B1: stress-test the balance/win/bet plates
 *  at $999,999.99 - the currency string must not show a "US" prefix
 *  (currencyDisplay: 'narrowSymbol'), and the rendered value must not
 *  overflow its own box (scrollWidth > clientWidth) nor visually truncate
 *  (textContent must be the full, untruncated string - the CSS
 *  text-overflow:ellipsis fallback staying purely defensive, not doing the
 *  real work). */
async function auditHudStressValues(browser, baseUrl) {
  const context = await browser.newContext({ ...devices['iPhone 14'] })
  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await waitTestStores(page)
  await dismissIntro(page)

  await page.evaluate(() => {
    // rgsBetLevels must be set BEFORE betAmount: HudOverlay has a reactive
    // snap-to-nearest-valid-ladder-level guard (by design, for the real
    // bet-stepper UX) that silently overrides any betAmount not exactly on
    // the ladder - confirmed the hard way (a direct betAmount.set(999999.99)
    // got snapped straight back to BET_LEVELS' $100 max). Extending the
    // ladder to include the stress value is how a real high-stakes RGS
    // deployment would present it anyway, not a workaround.
    window.__testStores.rgsBetLevels.set([0.10, 1.00, 100.00, 999999.99])
    window.__testStores.balance.set(999999.99)
    window.__testStores.betAmount.set(999999.99)
    window.__testStores.winAmount.set(999999.99)
  })
  // 400ms alone isn't enough: displayedWinAmount count-up runs up to
  // WIN_COUNTUP_MAX_MS (800ms) before settling on the true target value.
  await page.waitForTimeout(1000)

  const result = await page.evaluate(() => {
    const selectors = ['.p-stat-value.cyan', '.p-stat-value.gold', '.p-stat-value.magenta']
    const out = []
    for (const sel of selectors) {
      const el = document.querySelector(sel)
      if (!el) { out.push({ selector: sel, pass: false, reason: 'element not found' }); continue }
      const text = el.textContent ?? ''
      const hasUsPrefix = /US\$/.test(text)
      const overflows = el.scrollWidth > el.clientWidth + 1 // +1px rounding tolerance
      const expectedDigits = '999,999.99'
      const containsFullValue = text.includes(expectedDigits)
      out.push({
        selector: sel, text,
        hasUsPrefix, overflows, containsFullValue,
        pass: !hasUsPrefix && !overflows && containsFullValue,
      })
    }
    return out
  })

  await context.close()
  const pass = result.every((r) => r.pass)
  return { result, pass }
}

/** OWNER AUDIT REMEDIATION item B5: the infinite autoplay option must show
 *  when jurisdiction flags impose no autoplay cap, and hide when they do -
 *  asserts both flag states against the real DOM, not just the derived
 *  store's own value. */
async function auditAutoInfiniteOption(browser, baseUrl) {
  const context = await browser.newContext({ ...devices['iPhone 14'] })
  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await waitTestStores(page)
  await dismissIntro(page)

  const autoBtn = page.locator('.p-autoplay-wrapper .p-round-btn')

  // Uncapped: no jurisdiction flags set, maxAutoplaySpins defaults Infinity.
  await autoBtn.click()
  await page.waitForTimeout(150)
  const uncappedVisible = await page.locator('[data-testid="auto-infinite"]').isVisible().catch(() => false)
  await autoBtn.click() // close the menu
  await page.waitForTimeout(150)

  // Capped: jurisdiction flag sets a concrete autoplay cap.
  await page.evaluate(() => { window.__testStores.jurisdictionFlags.set({ maxAutoplaySpins: 100 }) })
  await page.waitForTimeout(150)
  await autoBtn.click()
  await page.waitForTimeout(150)
  const cappedVisible = await page.locator('[data-testid="auto-infinite"]').isVisible().catch(() => false)

  await context.close()
  const pass = uncappedVisible === true && cappedVisible === false
  return { uncappedVisible, cappedVisible, pass }
}

/** OWNER AUDIT REMEDIATION item A1: every menu card's displayed cost must
 *  equal MODE_COST x current bet, and the buy-confirm modal's body text
 *  multiplier must agree with its own price plate - the exact drift that
 *  let NITRO show "100x" in the confirm body while debiting 400x. Reads the
 *  live bet from window.__testStores.betAmount (a Svelte store) rather than
 *  importing fsModes.ts, so this checks what's actually ON SCREEN, not
 *  whether the source config agrees with itself. */
async function auditCostLabelConsistency(browser, baseUrl) {
  const context = await browser.newContext({ ...devices['iPhone 14'] })
  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await waitTestStores(page)
  await dismissIntro(page)
  // NITRO's 400x buy tier needs a comfortably large balance to reach an
  // enabled ACTIVATE button - the default mock balance covers bonus's 100x
  // but not super's 400x, which otherwise silently skips this exact check.
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })

  const results = []
  const featureMenuBtn = page.locator('[data-testid="feature-menu-button"]')
  if ((await featureMenuBtn.count()) === 0) {
    await context.close()
    return { skipped: true, reason: 'no feature-menu-button', pass: true }
  }
  await featureMenuBtn.click()
  await page.waitForTimeout(150)

  const bet = await page.evaluate(() => {
    let v
    const unsub = window.__testStores.betAmount.subscribe((x) => { v = x })
    unsub()
    return v
  })

  // 1. Every card's own "{cost}x - $Y.YY" is internally consistent with bet.
  // Standing-mode cards (normal/cruise/overboost) show a bare per-spin
  // multiplier ("1x bet", "1.25x bet") with no resolved dollar figure - A3
  // adds a persistent resolved-cost line for those; nothing to cross-check
  // here yet, so they're skipped rather than false-failed on a format they
  // were never meant to have.
  const cardChecks = await page.evaluate((betVal) => {
    const cards = Array.from(document.querySelectorAll('[data-testid^="feature-card-"]'))
    return cards.map((card) => {
      const id = card.getAttribute('data-testid').replace('feature-card-', '')
      const costEl = card.querySelector('.fm-cost')
      const text = costEl?.textContent?.trim() ?? ''
      if (/×\s*bet\s*$/i.test(text)) return { id, text, skipped: true, reason: 'per-spin multiplier card, no resolved price to check', pass: true }
      const multMatch = text.match(/([\d.]+)\s*[x×]/i)
      const priceMatch = text.match(/([\d,.]+)\s*$/)
      if (!multMatch || !priceMatch) return { id, text, pass: false, reason: 'could not parse cost label' }
      const mult = parseFloat(multMatch[1])
      const shownPrice = parseFloat(priceMatch[1].replace(/,/g, ''))
      const expectedPrice = mult * betVal
      const pass = Math.abs(shownPrice - expectedPrice) < 0.01
      return { id, text, mult, shownPrice, expectedPrice, pass }
    })
  }, bet)
  results.push(...cardChecks.map((c) => ({ scope: 'menu-card', ...c })))

  // 2. Each buy-tier's confirm modal: body-text multiplier vs its own price plate.
  const buyTierIds = cardChecks
    .filter((c) => c.id === 'bonus' || c.id === 'super')
    .map((c) => c.id)
  for (const id of buyTierIds) {
    try {
      // activateBuy() closes the FEATURES menu itself the moment ACTIVATE is
      // tapped (by design, so the confirm dialog takes focus) - the menu
      // must be reopened before every iteration, not just once up front.
      if ((await page.locator('[data-testid="feature-menu-cards"]').count()) === 0) {
        await featureMenuBtn.click()
        await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 5000 })
      }
      const activateBtn = page.locator(`[data-testid="activate-${id}"]`)
      if ((await activateBtn.count()) === 0) {
        results.push({ scope: 'buy-confirm-modal', id, pass: false, reason: 'no activate button found' })
        continue
      }
      await activateBtn.click({ timeout: 5000 })
      await page.waitForSelector('.buy-desc', { timeout: 5000 })
      const modalCheck = await page.evaluate((betVal) => {
        const body = document.querySelector('.buy-desc')?.textContent ?? ''
        // .buy-price-val was renamed .buy-stat-val.gold under B4's redesign
        // (the single price plate became a price/RTP/max-win 3-cell row).
        const priceEl = document.querySelector('.buy-stat-val.gold')
        const priceText = priceEl?.textContent ?? ''
        const multMatch = body.match(/([\d.]+)\s*[x×]/i)
        const priceMatch = priceText.match(/([\d,.]+)/)
        if (!multMatch || !priceMatch) return { pass: false, reason: 'could not parse modal text', body, priceText }
        const mult = parseFloat(multMatch[1])
        const shownPrice = parseFloat(priceMatch[1].replace(/,/g, ''))
        const expectedPrice = mult * betVal
        const pass = Math.abs(shownPrice - expectedPrice) < 0.01
        return { mult, shownPrice, expectedPrice, pass, body }
      }, bet)
      results.push({ scope: 'buy-confirm-modal', id, ...modalCheck })
      const cancelBtn = page.locator('.buy-cancel')
      if ((await cancelBtn.count()) > 0) await cancelBtn.click()
      await page.waitForSelector('.buy-desc', { state: 'detached', timeout: 5000 }).catch(() => {})
    } catch (err) {
      results.push({ scope: 'buy-confirm-modal', id, pass: false, reason: `exception: ${err.message}` })
    }
  }

  // 3. OWNER AUDIT REMEDIATION A3: the persistent "This spin costs" line
  // must update live while the menu stays open, purely from a bet-store
  // change (no re-open, no other interaction).
  if ((await page.locator('[data-testid="feature-menu-cards"]').count()) === 0) {
    await featureMenuBtn.click()
    await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 5000 }).catch(() => {})
  }
  const before = await page.locator('[data-testid="current-spin-cost"]').textContent().catch(() => null)
  await page.evaluate((newBet) => { window.__testStores.betAmount.set(newBet) }, bet * 3 + 1)
  await page.waitForTimeout(200)
  const after = await page.locator('[data-testid="current-spin-cost"]').textContent().catch(() => null)
  results.push({
    scope: 'live-reactivity',
    id: 'current-spin-cost',
    before, after,
    pass: before !== null && after !== null && before !== after,
  })

  await context.close()
  const pass = results.every((r) => r.pass)
  return { results, pass }
}

async function auditOverdriveMeterOnScreen(page, screensDir) {
  const featureMenuBtn = page.locator('[data-testid="feature-menu-button"]')
  if ((await featureMenuBtn.count()) === 0) {
    return { skipped: true, reason: 'no feature-menu-button', pass: true }
  }
  await featureMenuBtn.click()
  await page.waitForTimeout(150)
  const activateBonus = page.locator('[data-testid="activate-bonus"]')
  if ((await activateBonus.count()) === 0) {
    return { skipped: true, reason: 'no activate-bonus (jurisdiction disabled?)', pass: true }
  }
  await activateBonus.click()
  await page.waitForTimeout(150)
  const confirmBtn = page.locator('[data-testid="buy-confirm"]')
  if ((await confirmBtn.count()) === 0) {
    return { skipped: true, reason: 'no buy-confirm', pass: true }
  }
  await confirmBtn.click()
  // Past the ~1.8s title-card transition (FreeSpinsPresentation's own
  // dur(1800) timer) so displayMeter has actually applied, not still
  // showing its pre-reset placeholder.
  await page.waitForTimeout(2200)

  const geometry = await page.evaluate(() => {
    // Two instances can share this testid: the always-mounted, normally
    // invisible warm-up copy (App.svelte's .warm-mount, visibility:hidden
    // after its one-time paint) and the real, currently-shown one. Filter
    // for genuine visibility/size rather than class name, since both the
    // warm-mount and a real landscape/desktop instance render as
    // .instrument-column (only portrait's real instance is .pm-strip).
    const candidates = Array.from(document.querySelectorAll('[data-testid="bonus-instrument-column"]'))
    const el = candidates.find((e) => {
      const r = e.getBoundingClientRect()
      const style = getComputedStyle(e)
      const warmMount = e.closest('.warm-mount')
      return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && !warmMount
    })
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      className: el.className,
      top: r.top, left: r.left, bottom: r.bottom, right: r.right,
      onScreen: r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth,
    }
  })

  await page.screenshot({ path: join(screensDir, 'overdrive-meter.png') }).catch(() => {})

  // Let the round finish so later steps (frame gate) start clean.
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="spin-button"].spinning'),
    { timeout: 20000 },
  ).catch(() => {})
  await page.waitForTimeout(200)

  if (!geometry) return { found: false, pass: false }
  return { found: true, ...geometry, pass: geometry.onScreen }
}

async function startFrameSampler(page) {
  await page.evaluate(() => {
    window.__frameTimes = []
    let last = performance.now()
    function tick(t) {
      window.__frameTimes.push(t - last)
      last = t
      window.__rafHandle = requestAnimationFrame(tick)
    }
    window.__rafHandle = requestAnimationFrame(tick)
  })
}

async function readFrameSamples(page) {
  const frameTimes = await page.evaluate(() => window.__frameTimes.splice(0, window.__frameTimes.length))
  const longFrames = frameTimes.filter((t) => t > LONG_FRAME_MS)
  return { sampleCount: frameTimes.length, longFrameCount: longFrames.length, longFrames, pass: longFrames.length === 0 }
}

/** Frame gate (ANIMATION UPLIFT PASS 2026-07-16, item 6): "the frame gate is
 *  a hard gate throughout" - extended from the plain-spin baseline to also
 *  sample each of the pass's 6 new effects individually, so a long frame
 *  anywhere in the new choreography fails the same way a spin-induced one
 *  always has. Returns a per-effect breakdown plus a single aggregate pass. */
async function runFrameGate(page) {
  await startFrameSampler(page)
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })

  const bySegment = {}

  // 1. Plain spins (pre-existing baseline).
  for (let i = 0; i < 5; i++) {
    await page.locator('[data-testid="spin-button"]').click()
    await waitSpinDone(page)
    await page.waitForTimeout(120)
  }
  bySegment.plainSpins = await readFrameSamples(page)

  // 2. Win banner, epic tier (item 3: slam-in, shockwave, coin fountain,
  //    particle burst, chromatic flash).
  await page.evaluate(() => { window.__testStores.betAmount.set(1) })
  await page.evaluate(() => { window.__testStores.winAmount.set(150) })
  await page.waitForTimeout(3200) // full epic count-up (2800ms) + settle margin
  bySegment.winBannerEpic = await readFrameSamples(page)
  await page.evaluate(() => {
    window.__testStores.winAmount.set(0)
    window.__testStores.isSpinning.set(true)
  })
  await page.waitForTimeout(50)
  await page.evaluate(() => { window.__testStores.isSpinning.set(false) })
  await page.waitForTimeout(100)
  await readFrameSamples(page) // discard the reset blip, not part of any effect

  // 3. Anticipation (item 4: neighbour dim, tremble/zoom-drift, edge sparks) -
  //    dev-only forced hook, since a genuine tease window isn't reliably
  //    reachable through the buy flow (see GameGrid.svelte's test hook note).
  await page.evaluate(() => { window.__testGameGrid?.forceAnticipation() })
  await page.waitForTimeout(900)
  bySegment.anticipation = await readFrameSamples(page)
  await page.evaluate(() => { window.__testGameGrid?.clearAnticipationForce() })
  await page.waitForTimeout(100)
  await readFrameSamples(page) // discard

  // 4. Bonus entry gate (item 2: title-card slam, shockwave, flame-jet sync,
  //    smoke wisps) via a real guaranteed-trigger buy.
  const featureMenuBtn = page.locator('[data-testid="feature-menu-button"]')
  if ((await featureMenuBtn.count()) > 0) {
    await featureMenuBtn.click()
    await page.waitForTimeout(150)
    const activateBonus = page.locator('[data-testid="activate-bonus"]')
    if ((await activateBonus.count()) > 0) {
      await activateBonus.click()
      await page.waitForTimeout(150)
      const confirmBtn = page.locator('[data-testid="buy-confirm"]')
      if ((await confirmBtn.count()) > 0) {
        await readFrameSamples(page) // discard menu-open chrome
        await confirmBtn.click()
        await page.waitForSelector('[data-testid="overdrive-entry"]', { timeout: 8000 }).catch(() => {})
        await page.waitForTimeout(1600) // full compressed entry sequence (~1.3s) + margin
        bySegment.bonusEntryGate = await readFrameSamples(page)
        // Let the feature resolve so later profile steps start clean.
        await page.waitForFunction(
          () => !document.querySelector('[data-testid="freespins-overlay"]'),
          { timeout: 30000 },
        ).catch(() => {})
      }
    }
  }

  const allLongFrames = Object.values(bySegment).flatMap((s) => s.longFrames)
  const totalSamples = Object.values(bySegment).reduce((n, s) => n + s.sampleCount, 0)
  return {
    bySegment,
    sampleCount: totalSamples,
    longFrameCount: allLongFrames.length,
    longFrames: allLongFrames,
    pass: allLongFrames.length === 0,
  }
}

/** Splash frame cost (item 1) - the flicker-in sequence is the one new
 *  effect that can't be sampled inside runFrameGate/runProfile (it only
 *  plays once, before dismissIntro's very first call), so it gets its own
 *  fresh page load. Run once (iPhone 14 portrait), not per profile - a
 *  CSS-driven effect's frame cost doesn't meaningfully vary by device
 *  profile the way layout does, and a fresh navigation per profile would
 *  meaningfully slow the suite for no real extra coverage. */
async function auditSplashFrameCost(browser, baseUrl) {
  const context = await browser.newContext({ ...devices['iPhone 14'] })
  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="hero-splash"]', { timeout: 10000 }).catch(() => {})
  await startFrameSampler(page)
  await page.waitForTimeout(1400) // covers the full staged flicker-in (settles ~1.45s in)
  const result = await readFrameSamples(page)
  await context.close()
  return result
}

/** Idle attract frame cost (item 5) - needs ?fastIdle=1 (App.svelte's
 *  dev-only fast-forward), so it also gets its own fresh page load rather
 *  than reusing runProfile's un-parameterised baseUrl. */
async function auditIdleAttractFrameCost(browser, baseUrl) {
  const context = await browser.newContext({ ...devices['iPhone 14'] })
  const page = await context.newPage()
  await page.goto(`${baseUrl}?fastIdle=1`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await waitTestStores(page)
  await dismissIntro(page)
  await startFrameSampler(page)
  await page.waitForTimeout(1600) // past the 1200ms fastIdle threshold, well into the active loop
  const result = await readFrameSamples(page)
  await context.close()
  return result
}

/** Reduced-motion frame gate (ANIMATION UPLIFT PASS 2026-07-16, item 6:
 *  "re-run the full conformance suite including reduced-motion profiles") -
 *  reuses runFrameGate() verbatim against a context with reducedMotion:
 *  'reduce', on one representative profile (iPhone 14 portrait) rather than
 *  all four - reduced-motion strips animations globally regardless of
 *  device, so per-profile repetition here wouldn't add real coverage, just
 *  suite runtime. If anything this should show FEWER long frames than the
 *  full-motion run (every new effect's reduced-motion path is cheaper:
 *  fewer/no keyframe animations, static states instead). */
async function auditReducedMotionFrameGate(browser, baseUrl) {
  const context = await browser.newContext({ ...devices['iPhone 14'], reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await waitTestStores(page)
  await dismissIntro(page)
  const result = await runFrameGate(page)
  await context.close()
  return result
}

async function runProfile(browser, baseUrl, deviceLabel, orientation, deviceName, results) {
  const key = `${deviceLabel}-${orientation}`
  // Portrait proofs stay in portrait-v1/ (unchanged by the 2026-07-14b pass).
  // Landscape proofs move to landscape-compact-v1/ since these two device
  // profiles (both under the 500px compact-mode height breakpoint) now
  // render App.svelte's compact single-row HUD instead of the old
  // LAYOUT_SPEC absolute layout - their screenshots document fundamentally
  // different content, not a regression check against the old ones.
  const screensRoot = orientation === 'portrait' ? PORTRAIT_SCREENS_ROOT : LANDSCAPE_COMPACT_SCREENS_ROOT
  const screensDir = join(screensRoot, key)
  mkdirSync(screensDir, { recursive: true })
  const context = await browser.newContext({ ...devices[deviceName] })
  const page = await context.newPage()

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await waitTestStores(page)
  await dismissIntro(page)
  await page.evaluate(() => { window.__testStores.betAmount.set(1.0) })
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
  await page.waitForTimeout(150)

  const viewport = page.viewportSize()
  const entry = { device: deviceName, viewport, screenshots: {} }

  // idle
  await page.screenshot({ path: join(screensDir, 'idle.png') })
  entry.screenshots.idle = 'idle.png'
  entry.symbolLuminanceDiagnostic = await auditSymbolLuminanceDiagnostic(page)

  // spin (mid-flight)
  await page.locator('[data-testid="spin-button"]').click()
  await page.waitForTimeout(200)
  await page.screenshot({ path: join(screensDir, 'spin.png') })
  entry.screenshots.spin = 'spin.png'
  await waitSpinDone(page)

  // win
  await page.evaluate(() => { window.__testStores.winAmount.set(42.5) })
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(screensDir, 'win.png') })
  entry.screenshots.win = 'win.png'
  await page.evaluate(() => { window.__testStores.winAmount.set(0) })

  // buy modal (FeatureMenu -> BuyBonus confirm)
  const featureMenuBtn = page.locator('[data-testid="feature-menu-button"]')
  if (await featureMenuBtn.count() > 0) {
    await featureMenuBtn.click()
    await page.waitForTimeout(150)
    const activateBonus = page.locator('[data-testid="activate-bonus"]')
    if (await activateBonus.count() > 0) {
      await activateBonus.click()
      await page.waitForTimeout(150)
      await page.screenshot({ path: join(screensDir, 'buy-modal.png') })
      entry.screenshots.buyModal = 'buy-modal.png'
      // Close the buy confirm modal explicitly (it has no Escape handler) so
      // it doesn't intercept clicks on later steps.
      const cancelBtn = page.locator('.buy-cancel')
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click().catch(() => {})
        await page.waitForTimeout(150)
      }
    }
  }
  await page.waitForTimeout(100)

  // Overdrive meter geometry (2026-07-15, item 2): a REAL confirmed buy this
  // time (the prior step only screenshots the confirm modal then cancels),
  // waiting past the ~1.8s title-card transition so BonusInstrumentColumn's
  // own displayMeter has actually applied - then asserting the meter is
  // geometrically within the viewport on all four profiles, closing the gap
  // the portrait v2 session report disclosed (the gauge column previously
  // fell fully outside the visible window on at least one tested profile).
  entry.overdriveMeterAudit = await auditOverdriveMeterOnScreen(page, screensDir)

  // paytable
  await page.evaluate(() => { window.__testStores.showPaytable?.set?.(true) }).catch(() => {})
  const menuBtn = page.locator('[data-testid="feature-menu-button"], [aria-label="Menu"]').first()
  // Portrait exposes the paytable via the HUD's hamburger menu; landscape via
  // its own .fs-menu. Try the hamburger path generically across both.
  const hamburger = page.locator('[aria-label="Menu"]')
  if (await hamburger.count() > 0) {
    await hamburger.first().click()
    await page.waitForTimeout(150)
    const paytableItem = page.getByText('Paytable', { exact: false }).first()
    if (await paytableItem.count() > 0) {
      await paytableItem.click().catch(() => {})
      await page.waitForTimeout(200)
    }
  }
  await page.screenshot({ path: join(screensDir, 'paytable.png') })
  entry.screenshots.paytable = 'paytable.png'
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(100)

  // SessionPanel: absent by default, reachable via the HUD menu (item 3,
  // 2026-07-14c).
  entry.sessionPanelAudit = await auditSessionPanel(page)

  // OVERBOOST active
  await page.evaluate(() => { window.__testStores.standingMode.set('antelite') })
  await page.waitForTimeout(200)
  await page.screenshot({ path: join(screensDir, 'overboost-active.png') })
  entry.screenshots.overboostActive = 'overboost-active.png'
  await page.evaluate(() => { window.__testStores.standingMode.set('base') })

  // touch-target audit
  const targets = await auditTouchTargets(page)
  const failingTargets = targets.filter((t) => !t.pass)
  entry.touchTargetAudit = {
    totalChecked: targets.length,
    failing: failingTargets,
    pass: failingTargets.length === 0,
  }

  // font legibility - portrait's own .p-* elements, or (2026-07-14b)
  // compact-landscape's own .c-* elements. Both device profiles used here
  // are under the 500px compact-mode breakpoint, so the landscape branch is
  // always the compact strip, never the old LAYOUT_SPEC template.
  if (orientation === 'portrait') {
    const fonts = await auditPortraitFontSizes(page)
    const failingFonts = fonts.filter((f) => !f.pass)
    entry.fontLegibilityAudit = { totalChecked: fonts.length, failing: failingFonts, pass: failingFonts.length === 0 }
  } else {
    const fonts = await auditCompactLandscapeFontSizes(page)
    const failingFonts = fonts.filter((f) => !f.pass)
    entry.fontLegibilityAudit = { totalChecked: fonts.length, failing: failingFonts, pass: failingFonts.length === 0 }
    // Diagnostic-only, kept on per item 3 of the 2026-07-14b brief: samples
    // the OLD LAYOUT_SPEC .fs-label/.audio-label selectors too. Expected to
    // come back empty for these two profiles now (they don't render that
    // template below the compact breakpoint) - a non-empty result here would
    // mean the compact-mode gate itself regressed, so it stays as a live
    // canary rather than being deleted now that its original finding closed.
    entry.landscapeSmallTextDiagnostic = await sampleLandscapeSmallText(page)
  }

  // frame gate
  entry.frameGate = await runFrameGate(page)

  results[key] = entry
  await context.close()
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const results = {}

  try {
    const browser = await chromium.launch()
    for (const profile of DEVICE_PROFILES) {
      console.error(`[progress] ${profile.label} portrait`)
      await runProfile(browser, baseUrl, profile.label, 'portrait', profile.portrait, results)
      console.error(`[progress] ${profile.label} landscape`)
      await runProfile(browser, baseUrl, profile.label, 'landscape', profile.landscape, results)
    }
    console.error('[progress] splash frame cost (item 1)')
    results.splashFrameGate = await auditSplashFrameCost(browser, baseUrl)
    console.error('[progress] idle attract frame cost (item 5)')
    results.idleAttractFrameGate = await auditIdleAttractFrameCost(browser, baseUrl)
    console.error('[progress] reduced-motion frame gate (item 6)')
    results.reducedMotionFrameGate = await auditReducedMotionFrameGate(browser, baseUrl)
    console.error('[progress] cost label consistency (OWNER AUDIT REMEDIATION A1)')
    results.costLabelConsistency = await auditCostLabelConsistency(browser, baseUrl)
    console.error('[progress] menu viewport clipping (OWNER AUDIT REMEDIATION A2)')
    results.menuViewportClipping = {}
    for (const profile of DEVICE_PROFILES) {
      results.menuViewportClipping[`${profile.label}-portrait`] = await auditMenuViewportClipping(
        browser, baseUrl, profile.portrait,
      )
      results.menuViewportClipping[`${profile.label}-landscape`] = await auditMenuViewportClipping(
        browser, baseUrl, profile.landscape,
      )
    }
    console.error('[progress] HUD stress values (OWNER AUDIT REMEDIATION B1)')
    results.hudStressValues = await auditHudStressValues(browser, baseUrl)
    console.error('[progress] autoplay infinite option (OWNER AUDIT REMEDIATION B5)')
    results.autoInfiniteOption = await auditAutoInfiniteOption(browser, baseUrl)
    await browser.close()
  } finally {
    server.kill()
  }

  const outPath = join(OUT_DIR, 'portrait-layout-conformance-2026-07-14.json')
  writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
  console.log(`\nResults written to ${outPath}`)
  console.log(`Portrait screenshots written to ${PORTRAIT_SCREENS_ROOT}`)
  console.log(`Landscape screenshots written to ${LANDSCAPE_COMPACT_SCREENS_ROOT}`)

  const failures = []
  function collectFailures(obj, path) {
    if (obj === null || typeof obj !== 'object') return
    if ('pass' in obj && obj.pass === false) failures.push(path)
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'pass') continue
      collectFailures(value, path ? `${path}.${key}` : key)
    }
  }
  collectFailures(results, '')

  if (failures.length > 0) {
    console.error(`\nPORTRAIT LAYOUT CONFORMANCE: FAILURES DETECTED - ${failures.join(', ')}`)
    process.exitCode = 1
  } else {
    console.log('\nPORTRAIT LAYOUT CONFORMANCE: ALL CHECKS PASS')
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
