// background_candidate_proof.mjs - 2026-07-26.
//
// HISTORICAL, 2026-07-27. The eye-call it served is decided: the owner ruled
// BG: V1 and candidate v1 is now the shipped background, so the `candidates/`
// directory and App.svelte's `?bg=` parameter are both gone. This script
// therefore no longer runs against the working tree. It is kept because it is
// how the committed evidence in reports/screens/background-candidate-2026-07-26/
// was produced, and evidence whose method has been deleted is weaker evidence.
// To re-run it, restore the candidate files and the parameter from commit
// 6eaea1a. What shipped is proved by background_adopted_proof.mjs instead.
//
// Side-by-side in-game proofs for the background eye-call: the shipped
// background against ingested candidate v2, behind the live frame with the HUD
// present, at the three views the brief names.
//
// The presets are the PLATFORM'S OWN numbers, transcribed from the Developer
// Testing Tool's Screen menu in reports/qa/dtt_live_session_2026-07-26.md, not
// numbers of our choosing. The owner will eye-call this beside a real DTT
// session, so the frames should be the sizes that tool actually serves.
//
// Both sides of every pair come from ONE dev server and ONE build, differing
// only in App.svelte's DEV-gated `?bg=` parameter. That matters for the
// comparison to mean anything: two builds could differ in ways nobody
// intended, and the eye-call would be reading that difference instead of the
// background.
//
// This is the generating job for this evidence directory, per convention
// (h.1). Nothing else may write it.
//
// Run (from frontend/, with the dev server already up on 5173):
//   node scripts/background_candidate_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const ROOT = '/Users/jt/math-sdk'
const OUT = `${ROOT}/reports/screens/background-candidate-2026-07-26`
const BASE = 'http://localhost:5173'
const PY = `${ROOT}/scripts/assets/.venv/bin/python`

mkdirSync(OUT, { recursive: true })

// name, dimensions, and how the two frames should be stacked in the composite.
// Landscape frames read better stacked vertically on a phone, portrait frames
// read better beside each other; the owner is eye-calling this on a phone.
const PRESETS = [
  {
    key: 'desktop_1200x675',
    label: 'Desktop 1200 x 675',
    viewport: { width: 1200, height: 675 },
    stack: 'vertical',
  },
  {
    key: 'mobile_portrait_375x667',
    label: 'Mobile M portrait 375 x 667',
    viewport: { width: 375, height: 667 },
    stack: 'horizontal',
  },
  {
    key: 'popout_s_400x225',
    label: 'Popout S 400 x 225',
    viewport: { width: 400, height: 225 },
    stack: 'vertical',
  },
]

const ARMS = [
  { tag: 'current', param: 'current', label: 'CURRENT (shipped bg_base.jpg)' },
  { tag: 'v2', param: 'v2', label: 'CANDIDATE V2' },
]

const browser = await chromium.launch()
const results = []

for (const preset of PRESETS) {
  for (const arm of ARMS) {
    const page = await browser.newPage({ viewport: preset.viewport })
    const url = `${BASE}/?mock=1&bg=${arm.param}`
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
    await dismissIntro(page)
    // Let the backdrop settle: the rain layer animates and the Overdrive
    // still crossfades, so a capture taken too early can catch a transition.
    await page.waitForTimeout(1600)

    // Prove the arm actually took, rather than trusting the parameter. A
    // capture labelled V2 that silently served the shipped file would be
    // worse than no capture at all.
    const served = await page.evaluate(() => {
      const img = document.querySelector('img.bg-still:not(.overdrive)')
      return img ? { src: img.getAttribute('src'), complete: img.complete,
                     naturalWidth: img.naturalWidth } : null
    })
    const hudPresent = await page.locator('[data-testid="spin-button"]').isVisible()
    const dialogs = await page.locator('[role="dialog"]:visible').count()

    const shot = `${OUT}/${preset.key}__${arm.tag}.png`
    await page.screenshot({ path: shot })

    const expectFragment = arm.param === 'current'
      ? 'backgrounds/bg_base.jpg'
      : `candidates/bg_base_candidate_${arm.param}.jpg`
    const armVerified = !!served && served.src.endsWith(expectFragment)
      && served.complete && served.naturalWidth > 0

    results.push({
      preset: preset.key, arm: arm.tag, url, file: shot.slice(ROOT.length + 1),
      servedSrc: served?.src ?? null,
      servedDecoded: served ? served.complete && served.naturalWidth > 0 : false,
      armVerified, hudPresent, openDialogs: dialogs,
    })
    console.log(
      `${preset.key.padEnd(26)} ${arm.tag.padEnd(8)} ` +
      `arm:${armVerified ? 'OK ' : 'BAD'} hud:${hudPresent ? 'yes' : 'NO '} ` +
      `dialogs:${dialogs} src:${served?.src ?? 'none'}`,
    )
    await page.close()
  }
}
await browser.close()

const bad = results.filter((r) => !r.armVerified || !r.hudPresent || r.openDialogs > 0)

// Compose the labelled side-by-sides. Done in Pillow rather than in the
// browser because the composite is a document, not a page: burning the labels
// in is what makes a screenshot still legible months later in a report.
const composeSpec = PRESETS.map((p) => ({
  key: p.key, label: p.label, stack: p.stack,
  current: `${OUT}/${p.key}__current.png`,
  v2: `${OUT}/${p.key}__v2.png`,
  out: `${OUT}/${p.key}__current_vs_v2.png`,
  leftLabel: ARMS[0].label, rightLabel: ARMS[1].label,
}))
const specPath = `${OUT}/.compose_spec.json`
writeFileSync(specPath, JSON.stringify(composeSpec, null, 2))
const composeOut = execFileSync(
  PY, [`${ROOT}/scripts/assets/compose_side_by_side.py`, specPath],
  { encoding: 'utf-8' },
)
process.stdout.write(composeOut)

writeFileSync(`${OUT}/proof_results.json`, JSON.stringify({
  generated: new Date().toISOString(),
  script: 'frontend/scripts/background_candidate_proof.mjs',
  devServer: BASE,
  presetSource: 'reports/qa/dtt_live_session_2026-07-26.md, the DTT Screen menu',
  note: 'One dev server, one build; the arms differ only in the ?bg= parameter.',
  results,
  allArmsVerified: bad.length === 0,
}, null, 2) + '\n')

console.log(`\n${results.length} captures, ${results.length - bad.length} fully verified`)
if (bad.length) {
  console.log('FAILED: an arm did not serve what it claimed, or the HUD was absent')
  for (const b of bad) console.log(`  ${b.preset} ${b.arm}: ${JSON.stringify(b)}`)
  process.exit(1)
}
console.log('every arm served the background it claims, HUD present, no dialogs open')
