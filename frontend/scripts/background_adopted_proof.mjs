// background_adopted_proof.mjs - 2026-07-27.
//
// Convention (h) evidence for the BG: V1 adoption: what the shipped background
// actually looks like behind the live frame, now that it is the shipped
// background rather than a candidate served through a parameter.
//
// This exists because the eye-call captures do NOT cover it. The previous
// session was briefed to capture current against v2, and the owner chose v1
// after seeing it in the local session, so nothing in the repository showed v1
// in frame at the platform's presets. A decision recorded without a picture of
// what was decided is a gap.
//
// It also captures the Overdrive state, which is the pair that matters most
// here: the base and its derived variant must read as one city under two
// lights, and that is only checkable by looking at both.
//
// Run (from frontend/, after `npm run build`):
//   FS_WRITE_EVIDENCE=1 node scripts/background_adopted_proof.mjs

import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'
import { startStaticServer, assertNoSurvivors } from './lib/previewServer.mjs'

const OUT = evidenceDir('reports', 'screens', 'background-adopted-2026-07-27')
const QA = evidenceDir('reports', 'qa')
announceEvidenceMode('background_adopted_proof')

const PRESETS = [
  { key: 'desktop_1200x675', width: 1200, height: 675 },
  { key: 'mobile_portrait_375x667', width: 375, height: 667 },
  { key: 'popout_s_400x225', width: 400, height: 225 },
]

// This captures the PRODUCTION build, where `?mock=1` does not exist, so the
// RGS is stubbed exactly as smallscreen_composition_gate.mjs stubs it. Without
// this the game boots into its "session could not be verified" banner and the
// capture shows an error bar across the art. Same shape as that gate's
// authBody, deliberately, so the two agree about what a booted game looks like.
const RGS_HOST = 'rgs.background-adopted-proof.invalid'
const authBody = () => ({
  balance: { amount: 100_000_000, currency: 'USD' },
  config: {
    minBet: 100_000, maxBet: 100_000_000, stepBet: 100_000,
    defaultBetLevel: 1_000_000, betLevels: [100_000, 500_000, 1_000_000, 2_000_000],
    jurisdiction: {
      socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
      disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
      disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
      displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
    },
  },
  round: null,
})

const GAME_URL = (port) =>
  `http://localhost:${port}/?sessionID=background-adopted-proof&rgs_url=${RGS_HOST}&lang=en`

async function stubRgs(page) {
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const url = route.request().url()
    const json = (o) => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify(o),
    })
    if (url.includes('/wallet/authenticate')) return json(authBody())
    return json({})
  })
}

const freePort = () => new Promise((res) => {
  const srv = createServer()
  srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
})

// TR-101, option (c): served in-process, no child to orphan.
const server = await startStaticServer(join(import.meta.dirname, '..', 'dist'))
const port = server.port
await new Promise((res, rej) => {
  let done = false
  preview.stdout.on('data', (d) => {
    if (!done && String(d).includes('Local')) { done = true; res() }
  })
  setTimeout(() => { if (!done) rej(new Error('vite preview did not start')) }, 20000)
})

const browser = await chromium.launch()
const rows = []

for (const p of PRESETS) {
  const page = await browser.newPage({ viewport: { width: p.width, height: p.height } })
  await stubRgs(page)
  await page.goto(GAME_URL(port), { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(page)
  await page.waitForTimeout(1500)

  // Read what actually shipped, rather than trusting the build.
  const served = await page.evaluate(() => {
    const base = document.querySelector('img.bg-still:not(.overdrive)')
    const over = document.querySelector('img.bg-still.overdrive')
    return {
      baseSrc: base?.getAttribute('src') ?? null,
      baseDecoded: !!base && base.complete && base.naturalWidth > 0,
      overSrc: over?.getAttribute('src') ?? null,
      overDecoded: !!over && over.complete && over.naturalWidth > 0,
      noCandidatePath: !(base?.getAttribute('src') ?? '').includes('candidates/'),
    }
  })
  await page.screenshot({ path: `${OUT}/${p.key}.png` })

  const ok = served.baseDecoded && served.overDecoded && served.noCandidatePath
  rows.push({ preset: p.key, ...served, ok })
  console.log(`  ${p.key.padEnd(26)} ${ok ? 'OK ' : 'BAD'} base=${served.baseSrc}`)
  await page.close()
}

// The Overdrive pair, at desktop, with the variant forced visible. The class is
// what App.svelte toggles while the feature plays, so setting it directly shows
// exactly the layer a player sees, without driving a whole bonus round.
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 } })
  await stubRgs(page)
  await page.goto(GAME_URL(port), { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(page)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/desktop_overdrive_off.png` })
  await page.evaluate(() => {
    document.querySelector('img.bg-still.overdrive')?.classList.add('active')
  })
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${OUT}/desktop_overdrive_on.png` })
  await page.close()
}

await browser.close()
preview.kill('SIGTERM')

const bad = rows.filter((r) => !r.ok)
writeFileSync(join(QA, 'background_adopted_proof.json'), JSON.stringify({
  generated: new Date().toISOString(),
  script: 'frontend/scripts/background_adopted_proof.mjs',
  ruling: 'BG: V1, owner, 2026-07-27',
  rows,
  allOk: bad.length === 0,
}, null, 2) + '\n')

console.log(`\n${rows.length - bad.length} of ${rows.length} presets serving the adopted background`)
if (bad.length) { console.log('FAILED'); process.exit(1) }
console.log('base and Overdrive both decode, no candidate path in the shipped build')
