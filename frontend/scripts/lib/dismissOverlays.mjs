// dismissOverlays.mjs — shared dismissIntro() for Playwright conformance
// scripts (OWNER AUDIT ROUND 3, item 10 follow-up: Fable-suggested dedup of
// the dismissIntro() implementation that had drifted to ~20 near-duplicate
// copies across scripts/*.mjs).
//
// HeroSplash (ANIMATION UPLIFT PASS 2026-07-16, item 1) shows first, on
// every load, ahead of the once-per-session rules modal below.
//
// Polls for up to ~2s rather than a single instantaneous check: HeroSplash
// has its own fade/entrance timing, and sessionStorage (its "seen" flag) is
// scoped per BROWSING CONTEXT - every fresh browser.newPage() starts with
// none set, so the splash always reappears there. A single-shot isVisible()
// check raced the splash's entrance often enough in practice to leave it
// covering the FEATURES/spin controls, hanging every subsequent locator
// wait on that fresh page (Round 2's whole "splash race" debugging cycle).

// Clicks whichever mid-round gate (if any) is currently blocking further
// progress - the FreeSpinsPresentation entry/retrigger CLICK TO CONTINUE
// card, or the MaxWinCelebration wincap "COLLECT" gate (5,000x hard cap,
// every mode) - so waitSpinDone()/waitFeatureDrained() don't hang the first
// time a session actually hits the cap.
const PENDING_GATE_SELECTORS = ['[data-testid="entry-continue"]', '[data-testid="max-win-collect"]']
async function clickAnyPendingGate(page) {
  let clicked = false
  for (const sel of PENDING_GATE_SELECTORS) {
    const gate = page.locator(sel)
    if (await gate.count() > 0 && await gate.isVisible().catch(() => false)) {
      await clickViaDom(gate).catch(() => {})
      clicked = true
    }
  }
  return clicked
}

// Clicks an element via the DOM's own .click(), bypassing Playwright's
// actionability checks entirely (visibility, stability, AND being within the
// viewport - {force:true} skips the first two but still hard-errors on the
// third). At extreme viewports (Stake's 400x225 mini-player popout,
// platform_conformance_item2.mjs item c) these full-size overlays can render
// with their dismiss control genuinely outside the visible viewport - no
// in-viewport coordinate exists for Playwright's mouse event to target. This
// is fine for a harness dismissing a known, deterministic overlay, but an
// overlay unreachable at that size is itself a real product finding - see
// OWNER AUDIT ROUND 3 session report.
async function clickViaDom(locator) {
  await locator.evaluate((el) => el.click())
}

export async function dismissIntro(page) {
  const deadline = Date.now() + 2000
  while (Date.now() < deadline) {
    const splash = page.locator('[data-testid="hero-splash"]')
    if (await splash.count() > 0 && await splash.isVisible().catch(() => false)) {
      await clickViaDom(splash)
      await page.waitForTimeout(100)
      break
    }
    await page.waitForTimeout(100)
  }
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await clickViaDom(btn)
    await page.waitForTimeout(100)
  }
}

// waitSpinDone() - shared with dismissIntro() for the same reason (OWNER
// AUDIT ROUND 3, item 10 follow-up dedup). The CLICK TO CONTINUE gate
// (FreeSpinsPresentation's entry overlay) holds the spin button's
// `.spinning` class on through a natural or bought feature trigger until a
// real click dismisses it - an unattended waitForFunction that only polls
// `.spinning` hangs forever on any harness that drives a guaranteed trigger
// (bonus buy) or hits one naturally. Round 2 fixed this for qa_soak.mjs/
// portrait_layout_conformance.mjs/mock_pool_trigger_check.mjs but the fix
// never propagated to every other script with its own copy-pasted
// waitSpinDone, which is exactly the drift this shared helper closes.
export async function waitSpinDone(page, timeout = 20000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    // Check for (and click through) a pending gate BEFORE trusting `.spinning`
    // - it clears as soon as the round data resolves, which can be before a
    // wincap MaxWinCelebration COLLECT gate has been dismissed, so checking
    // `done` first would return with that gate still open and blocking the
    // NEXT caller's spin-button click.
    const gateClicked = await clickAnyPendingGate(page)
    const done = await page.evaluate(() => !document.querySelector('[data-testid="spin-button"].spinning'))
    if (done && !gateClicked) return
    await page.waitForTimeout(150)
  }
  throw new Error(`waitSpinDone: spin still in progress after ${timeout}ms`)
}

// waitFeatureDrained() - `.spinning` clears as soon as the base round request
// resolves, which can be well before a triggered free-spins feature has
// actually finished playing out its own auto-advancing spins (no further
// entry-continue gate involved once past the entry card) - a caller that
// needs the FEATURES trigger button back (only rendered while !featureActive)
// must wait for FreeSpinsPresentation's own overlay to fully clear, not just
// for waitSpinDone() to return.
//
// MUST exclude `.warm-mount` descendants: App.svelte permanently mounts a
// hidden warm-mount subtree containing a duplicate FreeSpinsPresentation
// instance sharing the exact same data-testid="freespins-overlay" - a plain
// querySelectorAll count is >=1 from the moment the page loads, before any
// spin at all, and this function would then never observe `active === false`
// and always time out regardless of real feature state (confirmed: an
// earlier version of this function without the exclusion hung even on
// base_win_small, a curated round with zero free-spins events).
export async function waitFeatureDrained(page, timeout = 60000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const gateClicked = await clickAnyPendingGate(page)
    const active = await page.evaluate(
      () => [...document.querySelectorAll('[data-testid="freespins-overlay"]')].some((el) => !el.closest('.warm-mount')),
    )
    if (!active && !gateClicked) return
    await page.waitForTimeout(200)
  }
  throw new Error(`waitFeatureDrained: feature still active after ${timeout}ms`)
}
