// replay_figures_proof.mjs
//
// S2-C006 EVIDENCE CAPTURE. Drives the replay through all three visible phases
// (ready, playing, complete) in two modes and writes six PNGs plus one JSON
// observation ledger, so the before and after states of the bet cost and the
// applied cost multiplier can be compared frame by frame.
//
// CONVENTION (h.1): THIS WRITES TO SCRATCH AND NEVER INTO A COMMITTED EVIDENCE
// DIRECTORY. Frames are copied into reports/screens/ deliberately, by a job that
// says that is what it is doing. Evidence a casual re-run can overwrite is not
// evidence, which is the SA-012 lesson this default exists to honour. Override
// with --out=<dir> only to another scratch path.
//
// The server, the port, the query-string builder, the fixture and the route
// interception are copied from replay_contract_gate.mjs so the surface under
// capture is the same surface that gate drives.
//
// Usage, from frontend/, after `npm run build`:
//   node scripts/replay_figures_proof.mjs [--out=<scratch dir>]
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')
const DIST = join(REPO, 'frontend', 'dist')
const outArg = process.argv.find((a) => a.startsWith('--out='))
const OUT = outArg ? outArg.slice('--out='.length) : join(tmpdir(), 'replay-figures-proof')
mkdirSync(OUT, { recursive: true })

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('no build at frontend/dist')
  process.exit(2)
}

const FIX = JSON.parse(readFileSync(
  join(REPO, 'frontend', 'src', 'lib', 'services', '__fixtures__', 'replay_rounds.json'), 'utf8'))

// Copied verbatim from replay_contract_gate.mjs.
const P = {
  game: '0e872280-c94a-4bcf-a55b-b649c4a02fc0',
  version: '1',
  mode: 'super',
  event: '22975',
  rgsHost: 'rgs.stake-engine.com',
  currency: 'EUR',
  amountMicros: '10000000',
  lang: 'en',
  social: 'false',
}
const REPLAY_QS = (o = {}) => {
  const p = { ...P, ...o }
  return `replay=true&game=${p.game}&version=${p.version}&mode=${p.mode}&event=${p.event}`
    + `&rgs_url=${p.rgsHost}&currency=${p.currency}&amount=${p.amountMicros}`
    + `&lang=${p.lang}&device=desktop&social=${p.social}`
}

const PORT = 4519
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webp': 'image/webp',
}

function serve() {
  const srv = createServer((req, res) => {
    let p = req.url.split('?')[0]
    if (p === '/') p = '/index.html'
    const f = join(DIST, decodeURIComponent(p))
    if (!existsSync(f) || f.endsWith('/')) { res.writeHead(404); res.end('not found'); return }
    const body = readFileSync(f)
    res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' })
    res.end(body)
  })
  return new Promise((r) => srv.listen(PORT, () => r(srv)))
}

const txt = async (page, sel) => {
  try {
    const loc = page.locator(sel)
    if (!(await loc.count())) return { present: false, text: '' }
    return { present: true, text: (await loc.first().innerText()).replace(/\s+/g, ' ').trim() }
  } catch { return { present: false, text: '' } }
}

/** Everything read at one capture point, alongside the PNG. */
async function observe(page, label, file) {
  await page.screenshot({ path: join(OUT, file) })
  const controls = await txt(page, '.replay-controls')
  const body = await txt(page, 'body')
  const start = await txt(page, '.start-replay')
  const figures = await txt(page, '.replay-figures')
  const line3 = await txt(page, '.btn-line-3')
  return { label, file, controls, body, start, figures, line3 }
}

async function captureMode(browser, { mode, costMultiplier, round }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.route(/^(?!http:\/\/localhost:4519).*/, async (route) => {
    const url = route.request().url()
    if (!url.includes('/bet/replay/')) { await route.abort(); return }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        payoutMultiplier: round.payoutMultiplier,
        costMultiplier,
        state: { events: round.events },
      }),
    })
  })

  await page.goto(`http://localhost:${PORT}/?${REPLAY_QS({ mode })}`, { waitUntil: 'domcontentloaded' })
  await page.locator('.start-replay').waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(700) // let the ready card settle before the frame

  const frames = []
  frames.push(await observe(page, 'ready', `${mode}-1-ready.png`))

  await page.locator('.start-replay').click({ timeout: 5000 })
  frames.push(await observe(page, 'playing', `${mode}-2-playing.png`))

  const reached = await page.locator('.play-again')
    .waitFor({ state: 'visible', timeout: 25000 }).then(() => true).catch(() => false)
  await page.waitForTimeout(400)
  const complete = await observe(page, 'complete', `${mode}-3-complete.png`)
  complete.playAgainAppeared = reached
  frames.push(complete)

  await page.close()
  return { mode, costMultiplier, frames }
}

const srv = await serve()
const browser = await chromium.launch()
const ledger = []
try {
  // THE SAME ROUND PAYLOAD FOR BOTH MODES, deliberately, so the only variables
  // between the two captures are the `mode` query parameter and costMultiplier,
  // which is exactly what this evidence is about.
  //
  // The first attempt used FIX.super.feature for super and it was unusable: the
  // client reads payoutMultiplier as a RAW multiplier, so 17110 is 17110x, over
  // the 5000x cap, and the max-win splash covered the playing frame and held the
  // round on a COLLECT gate so `.play-again` never appeared inside 25s. Recorded
  // rather than silently swapped, because "the fixture is in centibets" is the
  // wrong assumption a later reader would otherwise make again.
  const ROUND = FIX.base.win // payoutMultiplier 390, well under the 5000x cap
  ledger.push(await captureMode(browser, { mode: 'base', costMultiplier: 1.0, round: ROUND }))
  ledger.push(await captureMode(browser, { mode: 'super', costMultiplier: 400.0, round: ROUND }))
} finally {
  await browser.close()
  await new Promise((r) => srv.close(r))
}
writeFileSync(join(OUT, '_observations.json'), JSON.stringify(ledger, null, 2))

for (const m of ledger) {
  console.log(`\n===== MODE ${m.mode}  costMultiplier ${m.costMultiplier} =====`)
  for (const f of m.frames) {
    console.log(`\n  --- ${f.label}  (${f.file})${f.playAgainAppeared === false ? '  [play-again NEVER APPEARED]' : ''}`)
    console.log(`      .replay-controls present=${f.controls.present} :: "${f.controls.text}"`)
    console.log(`      .start-replay    present=${f.start.present} :: "${f.start.text}"`)
    console.log(`      .btn-line-3      present=${f.line3.present} :: "${f.line3.text}"`)
    console.log(`      .replay-figures  present=${f.figures.present} :: "${f.figures.text}"`)
    console.log(`      body: "${f.body.text}"`)
  }
}
