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
    // ADDED 2026-07-26. The owner's composed portrait tile, byte-identical.
    //
    // It is 408x546, which is the platform's OWN published tile geometry,
    // measured across a live sample of published assets rather than taken from
    // the docs, which give no dimensions at all
    // (docs/stake-engine-live/2026-07-26/published-tile-geometry.md).
    //
    // It does not replace the BG and FG layers, it sits beside them, because we
    // do not know which form the portal's Design Thumbnail editor takes and
    // nobody here has ever opened it. Why the layers could not simply be
    // derived from this file is measured in
    // design-system/brand/tile/TILE_LAYER_DERIVATION.md.
    from: join(BRAND, 'tile', 'tile_composed_master.png'),
    to: 'FutureSpinner-Tile.png',
    role: 'Composed tile, flat',
    rule: 'no published rule, matches observed published geometry',
    countsToward3MB: false,
  },
  {
    // ADOPTED 2026-07-26 on the owner's instruction, "Go with F", and
    // RE-CONFIRMED BY DERIVATION the same day when candidate g arrived: f took
    // 3 of 3 legibility measures at 32px and 2 of 3 at every other size on the
    // ladder. Full working in
    // design-system/brand/provider_mark/PROVIDER_LOGO_DERIVATION.md.
    //
    // Candidate f, the owner's second supplied mark, delivered at its NATIVE
    // 1024 master rather than at the 512 export. The platform asks for a "High
    // resolution PNG with a transparent background", and f's master is a
    // straight full-frame crop of the owner's file at its own resolution, so
    // delivering it means the submitted asset has been through no resampling
    // at all. Downscaling to 512 to match what candidate d happened to use
    // would have thrown away resolution for no reason.
    //
    // WHY f AND NOT e-transparent. The brief that adopted this opens with "Go
    // with F" and then names provider_mark_e-owner-supplied-transparent in its
    // JOB 1 body. Those contradict. "Go with F" is taken as the decision: it is
    // unambiguous, it stands alone at the top, and it directly answers the
    // question the previous session asked ("say f and I'll regenerate"). The
    // JOB 1 filename reads as carried over from when e-transparent was the
    // leading candidate. Recorded here rather than resolved silently, and
    // reversible by changing this one path and re-running.
    from: join(BRAND, 'provider_mark', 'provider_mark_f-owner-transparent_master_1024.png'),
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
  '## Two forms of the tile, and why both ship',
  '',
  '**We do not know which form the portal\'s Design Thumbnail editor takes, because',
  'nobody here has opened it: the game card still shows its placeholder.** So the set',
  'carries both, and the owner uses whichever the editor asks for.',
  '',
  '| If the editor wants | Use |',
  '|---|---|',
  '| a single composed image | `FutureSpinner-Tile.png` |',
  '| separate layers | `FutureSpinner-BG.jpg` and `FutureSpinner-FG.png` |',
  '',
  '`FutureSpinner-Tile.png` is the owner\'s composed artwork, byte-identical, at',
  '**408x546**. That is the platform\'s own published tile geometry, measured across a',
  'live sample of published assets rather than read off the docs, which give no',
  'dimensions at all: see `docs/stake-engine-live/2026-07-26/published-tile-geometry.md`.',
  'It is also the first portrait tile asset the project has held; BG and FG are both',
  'landscape.',
  '',
  '**The layers could not be derived from the composed master, and that was tested',
  'rather than assumed.** Roughly a fifth of the frame would have to be painted to',
  'recover a complete background behind the character, the type is baked into the',
  'pixels, and a third of the character silhouette has no confident matte edge. The',
  'measurements and the proof sheet are in',
  '`design-system/brand/tile/TILE_LAYER_DERIVATION.md`. If the editor wants layers, the',
  'composed master is the **reference** for how BG and FG should sit, not a source to',
  'cut them from.',
  '',
  '## Provider logo: ADOPTED, and re-confirmed by measurement',
  '',
  'The provider logo is candidate **f**, the owner\'s second supplied mark, adopted',
  '2026-07-26 on the instruction "Go with F". It is delivered at its NATIVE 1024',
  'resolution: f\'s master is a full-frame crop of the owner\'s file at its own',
  'size, so this asset has been through no resampling at all.',
  '',
  'It carries a real alpha channel, so the platform\'s transparent-background rule',
  'is met by the artwork itself rather than by a keying step performed on it, and',
  'it uses exactly three colours: `#00FFFF` and `#FF00FF` verbatim from the brand',
  'palette plus `#0A0A14` as structural near-black.',
  '',
  '**Candidate g, a full variant pack, arrived later the same day and was tested',
  'against f rather than filed beside it.** f took 3 of 3 legibility measures at 32px',
  'and 2 of 3 at every other size on the ladder, so the delivered file did not change.',
  'The working is in `design-system/brand/provider_mark/PROVIDER_LOGO_DERIVATION.md`.',
  'g is superseded for the portal mark and adopted as the studio brand set for',
  'everything else: favicon, site and print.',
  '',
  'Candidates a, b, c, d, e and g are superseded and kept. The comparison evidence',
  'stays at `reports/screens/provider-mark/`. To change the adopted mark, re-point',
  'the logo row in this script and re-run; nothing else in the set changes.',
  '',
  '**One thing still belongs to the owner**: the actual upload. The provider logo is',
  'a one-time square upload in Team Settings Branding, and the tile goes into the',
  'Tile Editor. Neither can be done from here.',
]
writeFileSync(join(DELIVERY, 'README.md'), doc.join('\n') + '\n')

for (const r of rows) console.log(`  ${r.to.padEnd(26)} ${kb(r.size).padStart(8)}  <- ${r.from.split('/').pop()}`)
console.log(`\nbackground + foreground: ${kb(combined)} / 3072 KB`)

if (!withinLimit) {
  console.error('TILE DELIVERY: FAIL, background plus foreground exceed the 3 MB ceiling')
  process.exit(1)
}
console.log('TILE DELIVERY: PASS')
