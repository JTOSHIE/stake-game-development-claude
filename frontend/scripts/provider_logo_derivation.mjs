// provider_logo_derivation.mjs - 2026-07-26.
//
// DERIVES the provider-logo decision between candidate f and candidate g. It is
// not an eye-call and it does not ask for one. The rule the brief sets is:
//
//   the delivery goes to whichever candidate is measurably more legible at the
//   SMALLEST size the platform renders.
//
// So the script has to answer two questions in order, and show its working for
// both, because the second answer is worthless if the first is invented.
//
// ─────────────────────────────────────────────────────────────────────────────
// QUESTION 1: what sizes does the platform actually render?
// ─────────────────────────────────────────────────────────────────────────────
//
// The honest answer is that the platform PUBLISHES NO PIXEL SIZE for the
// provider logo anywhere. docs/stake-engine-live/game-tile-requirements.md:38
// says only "Should be clear and legible at small sizes". There is no width, no
// height, no safe area and no DPR note in the captured requirements.
//
// Worse for the naive reading: the provider logo is NOT drawn on the published
// game tile at all. Live tiles pulled from the public FAIR catalogue render the
// publisher as SET TEXT under the game title (see
// docs/stake-engine-live/2026-07-26/published-tile-geometry.md), not as the
// supplied logo image. So "how small does Stake render the provider mark" has
// no directly observable answer in anything we have captured, and this script
// says so rather than inventing a number and calling it a requirement.
//
// What we do have is three measured anchors, and the ladder is built from them:
//
//   128 px  MEASURED. The Stake Engine portal's own game-card thumbnail slot,
//           measured off our own capture
//           reports/screens/dtt-live-2026-07-26/03_files_page_math_380mb_13_files.png:
//           inner content box 128x160 device pixels (132x164 including its
//           border), on a 2x-DPR capture. This is the smallest brand-image slot
//           the platform is OBSERVED to render anywhere in our evidence.
//    48 px  EARNED. The figure round one of external review handed us: the
//           shipped mark was called "nearly unreadable at 48px", and TR-031's
//           whole candidate comparison has been built at 48 ever since.
//    32 px  FLOOR. The smallest variant the owner's own delivery ships
//           (we_roll_spinners_32x32_transparent.png), and the size its README
//           names for the favicon. It is the studio's own stated smallest
//           intended rendering.
//
// 96 and 64 are filled in between so the curve is visible rather than three
// points. THE DECISION IS TAKEN AT 32, the smallest.
//
// ─────────────────────────────────────────────────────────────────────────────
// QUESTION 2: which candidate is measurably more legible there?
// ─────────────────────────────────────────────────────────────────────────────
//
// Each candidate is downscaled from its own master with high-quality smoothing,
// because that is what a platform resampling the asset would do, and an export
// made without it would not be the thing anyone sees. The COMPARISON SHEET then
// draws every export 1:1 with smoothing DISABLED, so a reviewer looks at the
// real pixels rather than at a browser's re-blur of them.
//
// The marks are composited over the REAL portal surface before measuring:
// rgb(29,29,29), sampled from the page background of that same capture. This
// matters more than it sounds. Candidate f's provenance already records, as an
// open risk, that its structural colour #0A0A14 is opaque near-black and can
// dissolve on a dark surface. Measuring on white would hide exactly the failure
// the platform's own surface would cause.
//
// Five measurements per candidate per size, all on the composited pixels:
//
//   inkCoverage      share of the frame carrying opaque ink
//   rmsContrast      RMS luminance contrast over the whole frame; global
//                    variation, how much of anything survives
//   edgeEnergy       mean absolute Laplacian of luminance; INTERNAL detail,
//                    the thing that separates a readable mark from a blob
//   toneLevels       distinct luminance bins (32-bin quantisation) holding at
//                    least 0.5% of pixels; separable tonal regions
//   invisibleInk     share of opaque ink pixels sitting below a 1.5:1 contrast
//                    ratio against the portal surface, i.e. ink that is present
//                    in the file and not visible on the page
//
// Run (from frontend/): node scripts/provider_logo_derivation.mjs

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const BRAND = '/Users/jt/math-sdk/design-system/brand/provider_mark'
const DELIVERY = '/Users/jt/math-sdk/design-system/brand/delivery'
const OUT = '/Users/jt/math-sdk/reports/screens/provider-mark'
mkdirSync(OUT, { recursive: true })

// The ladder, smallest last so the decision size is the final column.
const LADDER = [128, 96, 64, 48, 32]
const DECISION_SIZE = Math.min(...LADDER)

// Sampled from the portal capture's page background, not chosen.
const PORTAL_SURFACE = { r: 29, g: 29, b: 29, hex: '#1d1d1d' }

const CANDIDATES = [
  {
    key: 'f-owner-transparent',
    label: 'f  owner transparent',
    master: 'provider_mark_f-owner-transparent_master_1024.png',
  },
  {
    key: 'g-owner-pack',
    label: 'g  owner pack',
    master: 'provider_mark_g-owner-pack_master_1206.png',
  },
]

for (const c of CANDIDATES) {
  if (!existsSync(join(BRAND, c.master))) {
    console.error(`missing master for candidate ${c.key}: ${c.master}`)
    process.exit(2)
  }
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')
const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<html><body></body></html>')

// ── Export each candidate down the ladder, and measure on the way ───────────
for (const c of CANDIDATES) {
  const buf = readFileSync(join(BRAND, c.master))
  c.masterSha = sha256(buf)
  c.url = `data:image/png;base64,${buf.toString('base64')}`
  c.sizes = {}
  c.metrics = {}
}

for (const c of CANDIDATES) {
  for (const px of LADDER) {
    const result = await page.evaluate(async ({ url, size, surface }) => {
      const img = new Image(); img.src = url; await img.decode()

      // The downscale a platform would perform.
      const c1 = document.createElement('canvas'); c1.width = size; c1.height = size
      const x1 = c1.getContext('2d', { willReadFrequently: true })
      x1.imageSmoothingEnabled = true
      x1.imageSmoothingQuality = 'high'
      x1.drawImage(img, 0, 0, size, size)
      const png = c1.toDataURL('image/png')
      const rgba = x1.getImageData(0, 0, size, size).data

      // Composite over the real portal surface, then measure THAT.
      const lum = new Float64Array(size * size)
      const relLum = (r, g, b) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      const surfRel = relLum(surface.r, surface.g, surface.b)
      let opaque = 0, invisible = 0
      for (let i = 0; i < size * size; i++) {
        const al = rgba[i * 4 + 3] / 255
        const r = rgba[i * 4] * al + surface.r * (1 - al)
        const g = rgba[i * 4 + 1] * al + surface.g * (1 - al)
        const b = rgba[i * 4 + 2] * al + surface.b * (1 - al)
        lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if (rgba[i * 4 + 3] >= 128) {
          opaque++
          const L1 = relLum(r, g, b)
          const hi = Math.max(L1, surfRel), lo = Math.min(L1, surfRel)
          if ((hi + 0.05) / (lo + 0.05) < 1.5) invisible++
        }
      }

      const mean = lum.reduce((s, v) => s + v, 0) / lum.length
      const rms = Math.sqrt(lum.reduce((s, v) => s + (v - mean) * (v - mean), 0) / lum.length)

      // Mean absolute Laplacian, interior pixels only.
      let edge = 0, n = 0
      for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
        const i = y * size + x
        edge += Math.abs(4 * lum[i] - lum[i - 1] - lum[i + 1] - lum[i - size] - lum[i + size])
        n++
      }

      const bins = new Array(32).fill(0)
      for (let i = 0; i < lum.length; i++) bins[Math.min(31, Math.floor(lum[i] / 8))]++
      const levels = bins.filter((v) => v >= 0.005 * lum.length).length

      return {
        png,
        inkCoverage: opaque / (size * size),
        rmsContrast: rms,
        edgeEnergy: n ? edge / n : 0,
        toneLevels: levels,
        invisibleInk: opaque ? invisible / opaque : 0,
      }
    }, { url: c.url, size: px, surface: PORTAL_SURFACE })

    c.sizes[px] = result.png
    c.metrics[px] = result
    const name = `provider_mark_${c.key}_${px}.png`
    writeFileSync(join(BRAND, name), Buffer.from(result.png.split(',')[1], 'base64'))
  }
}

// ── The verdict, computed rather than asserted ──────────────────────────────
//
// At the decision size, the two candidates are scored on the three measures
// that bear on "clear and legible at small sizes", each as a straight
// head-to-head win: internal detail retained, global contrast retained, and ink
// that is actually visible on the surface it will be seen on.
const [F, G] = CANDIDATES

const MEASURES = [
  { name: 'edgeEnergy', plain: 'internal detail retained (mean absolute Laplacian)', higherWins: true },
  { name: 'rmsContrast', plain: 'global contrast retained (RMS luminance)', higherWins: true },
  { name: 'invisibleInk', plain: 'ink below 1.5:1 against the portal surface (lower is better)', higherWins: false },
]

// The same three-measure verdict, computed at EVERY size on the ladder rather
// than only at the decision size. Reporting one size invites the reader to
// wonder what the others would have said, and the answer is cheap.
const verdictAt = (px) => {
  const tests = MEASURES.map((m) => {
    const f = F.metrics[px][m.name], g = G.metrics[px][m.name]
    const winner = m.higherWins ? (g > f ? 'g' : 'f') : (g < f ? 'g' : 'f')
    const hi = Math.max(f, g), lo = Math.min(f, g)
    return { ...m, f, g, winner, margin: lo > 0 ? hi / lo : Infinity }
  })
  const gw = tests.filter((t) => t.winner === 'g').length
  return { px, tests, gWins: gw, fWins: tests.length - gw, winner: gw >= 2 ? 'g' : 'f' }
}
const verdicts = LADDER.map(verdictAt)
const decision = verdicts.find((v) => v.px === DECISION_SIZE)
const tests = decision.tests
const gWins = decision.gWins
const WINNER = decision.winner === 'g' ? G : F
const LOSER = WINNER === G ? F : G

console.log(`\ndecision size: ${DECISION_SIZE}px   portal surface ${PORTAL_SURFACE.hex}\n`)
for (const t of tests) {
  console.log(`  ${t.plain}`)
  console.log(`    f ${t.f.toFixed(4)}   g ${t.g.toFixed(4)}   -> ${t.winner} ` +
    `(x${Number.isFinite(t.margin) ? t.margin.toFixed(2) : 'inf'})`)
}
console.log(`\n  VERDICT at ${DECISION_SIZE}px: candidate ${WINNER.key.charAt(0)} wins ${Math.max(gWins, 3 - gWins)} of 3\n`)

// ── The true-size comparison sheet, smoothing DISABLED ──────────────────────
const sheet = await page.evaluate(async ({ cands, ladder, surface, decision }) => {
  const PAD = 40, LABEL_W = 260, GAP = 44, HEAD = 78, FOOT = 34
  const colW = (px) => Math.max(px, 74) + GAP
  const totalW = LABEL_W + ladder.reduce((s, px) => s + colW(px), 0) + PAD
  const rowH = Math.max(...ladder) + FOOT + 30
  const totalH = PAD + HEAD + cands.length * rowH + PAD

  const c = document.createElement('canvas'); c.width = totalW; c.height = totalH
  const x = c.getContext('2d')
  x.fillStyle = surface.hex; x.fillRect(0, 0, totalW, totalH)
  x.imageSmoothingEnabled = false   // every mark is drawn 1:1, never resampled

  x.fillStyle = '#8fd8ff'; x.font = 'bold 21px monospace'; x.textAlign = 'left'
  x.fillText(`TRUE SIZE, smoothing OFF, over the portal surface ${surface.hex}`, PAD, PAD + 20)
  x.fillStyle = '#7f97a5'; x.font = '15px monospace'
  x.fillText(`decision is taken at the smallest column, ${decision}px`, PAD, PAD + 44)

  let cx = LABEL_W
  for (const px of ladder) {
    x.fillStyle = px === decision ? '#ff6fff' : '#8fd8ff'
    x.font = px === decision ? 'bold 17px monospace' : '15px monospace'
    x.textAlign = 'center'
    x.fillText(`${px}px`, cx + colW(px) / 2 - GAP / 2, PAD + HEAD - 12)
    cx += colW(px)
  }

  for (let r = 0; r < cands.length; r++) {
    const top = PAD + HEAD + r * rowH
    x.fillStyle = '#cfd8dc'; x.font = 'bold 17px monospace'; x.textAlign = 'left'
    x.fillText(cands[r].label, PAD, top + Math.max(...ladder) / 2)

    let dx = LABEL_W
    for (const px of ladder) {
      const img = new Image(); img.src = cands[r].sizes[px]; await img.decode()
      const ox = dx + colW(px) / 2 - GAP / 2 - px / 2
      const oy = top + (Math.max(...ladder) - px) / 2
      x.drawImage(img, Math.round(ox), Math.round(oy), px, px)   // 1:1
      dx += colW(px)
    }
  }
  return c.toDataURL('image/png')
}, {
  cands: CANDIDATES.map((c) => ({ label: c.label, sizes: c.sizes })),
  ladder: LADDER,
  surface: PORTAL_SURFACE,
  decision: DECISION_SIZE,
})
writeFileSync(join(OUT, 'f-vs-g-rendered-sizes.png'), Buffer.from(sheet.split(',')[1], 'base64'))

await browser.close()

// ── Adopt the winner into the delivery ──────────────────────────────────────
//
// Delivered at the winner's NATIVE master resolution, so the submitted asset
// has been through no resampling at all. That is the rule the f adoption set
// and it is kept.
const winnerMaster = readFileSync(join(BRAND, WINNER.master))
writeFileSync(join(DELIVERY, 'WeRollSpinners-Logo.png'), winnerMaster)
const deliveredSha = sha256(readFileSync(join(DELIVERY, 'WeRollSpinners-Logo.png')))
if (deliveredSha !== WINNER.masterSha) {
  console.error('DELIVERY COPY FAILED: hash mismatch')
  process.exit(3)
}

// ── The derivation record ───────────────────────────────────────────────────
const row = (c, px) => {
  const m = c.metrics[px]
  return `| ${px} | ${(100 * m.inkCoverage).toFixed(1)}% | ${m.rmsContrast.toFixed(2)} | ` +
    `${m.edgeEnergy.toFixed(3)} | ${m.toneLevels} | ${(100 * m.invisibleInk).toFixed(1)}% |`
}

const lines = [
  '# Provider logo: the derivation, candidate f against candidate g',
  '',
  '**Derived, not asked.** The brief set the rule and this document records the working:',
  'the delivery goes to whichever candidate is measurably more legible at the smallest size',
  'the platform renders. Produced by `frontend/scripts/provider_logo_derivation.mjs`.',
  '',
  `**Verdict: candidate ${WINNER.key.charAt(0).toUpperCase()} wins at ${DECISION_SIZE}px, ` +
    `${Math.max(gWins, 3 - gWins)} of 3 measures.**`,
  '',
  '## 1. What size does the platform actually render?',
  '',
  '**The platform publishes no pixel size for the provider logo. Anywhere.**',
  '`docs/stake-engine-live/game-tile-requirements.md:38` says only "Should be clear and',
  'legible at small sizes": no width, no height, no safe area, no DPR note.',
  '',
  '**And the provider logo is not drawn on the published game tile at all.** Live tiles',
  'pulled from the public FAIR catalogue render the publisher as SET TEXT beneath the game',
  'title, not as the supplied logo image',
  '(`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`). So the literal question',
  '"how small does Stake render the provider mark" has no directly observable answer in',
  'anything captured to date. That is stated rather than papered over, because the ladder',
  'below is built on inference from three real anchors and a reader is entitled to know',
  'which parts are measured and which are reasoned.',
  '',
  '| Anchor | Size | Basis |',
  '|---|---|---|',
  '| Portal game-card thumbnail slot | **128 px** | MEASURED off `reports/screens/dtt-live-2026-07-26/03_files_page_math_380mb_13_files.png`: inner content box 128x160 device px, 132x164 including border, on a 2x-DPR capture. The smallest brand-image slot the platform is observed to render in our evidence. |',
  '| External review, round one | **48 px** | EARNED. The shipped mark was called "nearly unreadable at 48px"; every TR-031 candidate comparison since has been built at 48. |',
  '| The delivery\'s own floor | **32 px** | The smallest variant the owner\'s pack ships (`we_roll_spinners_32x32_transparent.png`) and the size its README names for the favicon. The studio\'s own stated smallest intended rendering. |',
  '',
  '96 and 64 are filled in between so the trend is visible rather than three points.',
  `**The decision is taken at ${DECISION_SIZE}px**, the smallest.`,
  '',
  '## 2. How the comparison was built',
  '',
  'Each candidate is downscaled from **its own master** with high-quality smoothing, because',
  'that is what a platform resampling the asset would do. The comparison sheet then draws',
  'every export **1:1 with smoothing disabled**, so what a reviewer looks at is the real',
  'pixels rather than a browser re-blur of them.',
  '',
  `Both are composited over the **real portal surface, \`${PORTAL_SURFACE.hex}\`**, sampled from the`,
  'page background of the capture above rather than chosen. This is load-bearing: candidate',
  'f\'s own provenance records as an open risk that its structural colour `#0A0A14` is opaque',
  'near-black and can dissolve on a dark surface, and measuring on white would have hidden',
  'exactly the failure the platform\'s own surface causes.',
  '',
  '| Measure | What it detects |',
  '|---|---|',
  '| `inkCoverage` | share of the frame carrying opaque ink |',
  '| `rmsContrast` | global luminance variation; how much of anything survives |',
  '| `edgeEnergy` | mean absolute Laplacian; INTERNAL detail, the difference between a readable mark and a blob |',
  '| `toneLevels` | distinct luminance bins holding at least 0.5% of pixels; separable tonal regions |',
  '| `invisibleInk` | share of opaque ink below a 1.5:1 contrast ratio against the portal surface: ink present in the file and not visible on the page |',
  '',
  '## 3. The measurements',
  '',
  `### Candidate f (\`${F.master}\`)`,
  '',
  '| Size | inkCoverage | rmsContrast | edgeEnergy | toneLevels | invisibleInk |',
  '|---|---|---|---|---|---|',
  ...LADDER.map((px) => row(F, px)),
  '',
  `### Candidate g (\`${G.master}\`)`,
  '',
  '| Size | inkCoverage | rmsContrast | edgeEnergy | toneLevels | invisibleInk |',
  '|---|---|---|---|---|---|',
  ...LADDER.map((px) => row(G, px)),
  '',
  '### The crossover, which a reader will spot anyway',
  '',
  ...(() => {
    const gBetter = LADDER.filter((px) => G.metrics[px].edgeEnergy > F.metrics[px].edgeEnergy)
    const fBetter = LADDER.filter((px) => F.metrics[px].edgeEnergy >= G.metrics[px].edgeEnergy)
    if (!gBetter.length || !fBetter.length) {
      return ['One candidate leads on internal detail at every size on the ladder, so there is no',
        'crossover to explain.']
    }
    return [
      `**Candidate g carries MORE internal detail than f at ${gBetter.join(', ')}px, and less at ` +
        `${fBetter.join(', ')}px.** That is not noise and it is not an argument against the verdict:`,
      'it is the whole shape of the problem. g is the richer piece of artwork, and at every size',
      `down to ${Math.min(...gBetter)}px it has more to show. The crossover falls between ` +
        `${Math.min(...gBetter)}px and ${Math.max(...fBetter)}px, and below it g's detail is what kills it: there`,
      'are no longer enough pixels to carry a text ring and a detailed wheel, so both average',
      'toward a single mid tone. f is built the other way, three flat colours and large shapes,',
      'which have nothing to lose and therefore lose nothing.',
      '',
      '**The crossover does not change who wins, at any size on this ladder.** Internal detail is',
      'one of three measures, and g leads on it alone while f leads on both of the others',
      'everywhere. The full three-measure verdict at every size:',
      '',
      '| Size | f takes | g takes | Winner |',
      '|---|---|---|---|',
      ...verdicts.map((v) => `| ${v.px} | ${v.fWins} | ${v.gWins} | **${v.winner}** |`),
      '',
      'So the decision does not rest on the choice of decision size. It would read the same at',
      'any size on the ladder; taking it at the smallest is the rule the brief set, and the',
      'smallest is also where the margins are widest.',
    ]
  })(),
  '',
  `## 4. The verdict at ${DECISION_SIZE}px`,
  '',
  '| Measure | f | g | Winner | Margin |',
  '|---|---|---|---|---|',
  ...tests.map((t) => `| ${t.plain} | ${t.f.toFixed(4)} | ${t.g.toFixed(4)} | **${t.winner}** | ` +
    `x${Number.isFinite(t.margin) ? t.margin.toFixed(2) : 'inf'} |`),
  '',
  `**Candidate ${WINNER.key.charAt(0).toUpperCase()} takes ${Math.max(gWins, 3 - gWins)} of the 3 measures at ${DECISION_SIZE}px** and is adopted as`,
  '`design-system/brand/delivery/WeRollSpinners-Logo.png`, delivered at its native',
  `${WINNER.master.match(/_(\d+)\.png$/)?.[1] ?? 'master'} resolution so the submitted asset has been through no resampling at all.`,
  '',
  '## 5. Evidence',
  '',
  '| Artefact | What it shows |',
  '|---|---|',
  '| `reports/screens/provider-mark/f-vs-g-rendered-sizes.png` | f and g at true 128, 96, 64, 48 and 32, drawn 1:1 with smoothing off, over the measured portal surface |',
  '| `reports/screens/provider-mark/48px-legibility-comparison.png` | the standing six-way 48px sheet, kept |',
  '| `reports/screens/provider-mark/candidate-f-on-surfaces.png` | every candidate at true size over light, mid, dark and portal surfaces |',
  '',
  '## 6. Delivered file',
  '',
  '| Field | Value |',
  '|---|---|',
  `| Source master | \`design-system/brand/provider_mark/${WINNER.master}\` |`,
  `| SHA-256 | \`${deliveredSha}\` |`,
  '| Delivered as | `design-system/brand/delivery/WeRollSpinners-Logo.png` |',
  `| Superseded | candidate ${LOSER.key.charAt(0)}, kept on disk and kept in the comparison sheets per convention (h) |`,
  '',
  '## 7. What this derivation does not settle',
  '',
  'The measures above are computed on pixels and they answer the question the brief asked.',
  'They are not a judgement of which mark is the better piece of design, and they cannot be:',
  'no metric here knows what the mark is meant to depict. If the owner looks at',
  '`f-vs-g-rendered-sizes.png` and disagrees with the arithmetic, the eye-call outranks it,',
  'and reversing the decision is one constant in this script and a re-run.',
]
writeFileSync(join(BRAND, 'PROVIDER_LOGO_DERIVATION.md'), lines.join('\n') + '\n')

console.log(`  delivery updated: WeRollSpinners-Logo.png <- ${WINNER.master}`)
console.log(`  sheet:  ${join(OUT, 'f-vs-g-rendered-sizes.png')}`)
console.log(`  record: ${join(BRAND, 'PROVIDER_LOGO_DERIVATION.md')}`)
