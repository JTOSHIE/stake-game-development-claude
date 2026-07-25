// tile_delivery_build.mjs - TR-045, R2R-R JOB D (2026-07-26).
//
// Assembles the submission tile set under the PLATFORM'S OWN NAMING CONVENTION,
// which round-two reviewer 3 filed as the tile half of its eighth finding:
// "Background and foreground exist and meet the size limit, but delivery names
// do not follow the published convention."
//
// The convention, quoted from the dated mirror at
// docs/stake-engine-live/game-tile-requirements.md lines 29, 33 and 37:
//
//   "Naming convention: GameTitle-BG.format (e.g., CrownConquest-BG.png ...)"
//   "Naming convention: GameTitle-FG.png (e.g., CrownConquest-FG.png)"
//   "Naming convention: ProviderName-Logo.png (e.g., ZuckGames-Logo.png)"
//
// Game title: Future Spinner. Provider: We Roll Spinners. So the set is
// FutureSpinner-BG.jpg, FutureSpinner-FG.png and WeRollSpinners-Logo.png.
//
// COPIES INTO design-system/brand/delivery/, RATHER THAN RENAMING IN PLACE, and
// the distinction is deliberate. The masters are named for what they ARE, and
// two committed GENERATION_NOTE files describe how each was produced BY THOSE
// NAMES. Renaming them in place would orphan that provenance to save a copy of
// a file we already hold. The delivery directory is the submission set; the
// brand directory remains the working set. Anyone can see which is which.
//
// The 3MB combined ceiling on background plus foreground is CHECKED, not
// assumed, and the build fails if it is exceeded.
//
// Run (from frontend/): node scripts/tile_delivery_build.mjs

import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const BRAND = '/Users/jt/math-sdk/design-system/brand'
const DELIVERY = join(BRAND, 'delivery')
mkdirSync(DELIVERY, { recursive: true })

const SET = [
  {
    from: join(BRAND, 'tile', 'tile_background_master.jpg'),
    to: 'FutureSpinner-BG.jpg',
    role: 'Background image',
    rule: 'GameTitle-BG.format',
    countsToward3MB: true,
  },
  {
    from: join(BRAND, 'tile', 'tile_hero_full.png'),
    to: 'FutureSpinner-FG.png',
    role: 'Foreground image',
    rule: 'GameTitle-FG.png',
    countsToward3MB: true,
  },
  {
    // Written by provider_mark_build.mjs, which owns the mark itself. Listed
    // here so the delivery set is described in one place.
    from: join(BRAND, 'provider_mark', 'provider_mark_d-purpose-drawn_512.png'),
    to: 'WeRollSpinners-Logo.png',
    role: 'Provider Logo',
    rule: 'ProviderName-Logo.png',
    countsToward3MB: false,
  },
]

const LIMIT_BYTES = 3 * 1024 * 1024
let combined = 0
const rows = []

for (const item of SET) {
  if (!existsSync(item.from)) {
    console.error(`MISSING source: ${item.from}`)
    process.exit(1)
  }
  const buf = readFileSync(item.from)
  writeFileSync(join(DELIVERY, item.to), buf)
  const size = statSync(join(DELIVERY, item.to)).size
  if (item.countsToward3MB) combined += size
  rows.push({
    ...item,
    size,
    sha: createHash('sha256').update(buf).digest('hex'),
  })
}

const withinLimit = combined <= LIMIT_BYTES
const kb = (n) => `${(n / 1024).toFixed(0)} KB`

const doc = [
  '# Submission tile delivery set',
  '',
  'Built by `frontend/scripts/tile_delivery_build.mjs`. Names follow the platform',
  'convention quoted verbatim from the dated mirror at',
  '`docs/stake-engine-live/game-tile-requirements.md` (fetched 2026-07-04).',
  '',
  '| Delivered as | Platform rule | Role | Size | SHA-256 |',
  '|---|---|---|---|---|',
  ...rows.map((r) => `| \`${r.to}\` | \`${r.rule}\` | ${r.role} | ${kb(r.size)} | \`${r.sha.slice(0, 16)}...\` |`),
  '',
  `**Background plus foreground: ${kb(combined)} against the 3 MB ceiling.** ` +
  `${withinLimit ? 'Within the limit.' : 'OVER THE LIMIT.'} The platform states ` +
  '"Please ensure that the background & foreground images don\'t exceed more than 3MB combined", ' +
  'and the provider logo is not part of that sum, so it is excluded from the total above.',
  '',
  '## Why these are copies rather than renames',
  '',
  'The masters under `design-system/brand/tile/` are named for what they are, and',
  'two committed `GENERATION_NOTE` files describe how each was produced BY THOSE',
  'NAMES. Renaming in place would orphan that provenance to save a duplicate of a',
  'file already held. This directory is the SUBMISSION SET; `tile/` and',
  '`provider_mark/` remain the working set.',
  '',
  '## Source of each file',
  '',
  ...rows.map((r) => `- \`${r.to}\` from \`${r.from.replace('/Users/jt/math-sdk/', '')}\``),
  '',
  '## Not yet adopted',
  '',
  'The provider logo here is candidate **d**, the purpose-drawn mark. The owner',
  'eye-call across a, b, c and d is still open',
  '(`reports/screens/provider-mark/48px-legibility-comparison.png`). If the owner',
  'picks a different candidate, re-point the logo row above and re-run; nothing',
  'else in the set changes.',
]
writeFileSync(join(DELIVERY, 'README.md'), doc.join('\n') + '\n')

for (const r of rows) console.log(`  ${r.to.padEnd(26)} ${kb(r.size).padStart(8)}  <- ${r.from.split('/').pop()}`)
console.log(`\nbackground + foreground: ${kb(combined)} / 3072 KB`)

if (!withinLimit) {
  console.error('TILE DELIVERY: FAIL, background plus foreground exceed the 3 MB ceiling')
  process.exit(1)
}
console.log('TILE DELIVERY: PASS')
