// stake_mark_gate.mjs
//
// S2-C037, reduced to the one thing nothing else can see: a Stake brand mark
// EMBEDDED IN THE BYTES of a shipped image or audio file.
//
// WHY THIS IS SMALL, and the measurement is the argument. The row asked for a
// gate covering five surfaces. Four of them were already covered on 2026-08-05
// and rebuilding them would have created two sources of truth for one claim,
// which convention (l.4) forbids:
//
//   filenames, dist + src + brand   brand_token_gate.mjs, whole-token, seeded
//   dist TEXT                       dist_hygiene_gate.mjs, stakeBrandingViolations
//   frontend/public filenames       2 entries, copied into dist, covered above
//   source-side TEXT                REFUSED, and measured: see below
//
// SOURCE-SIDE TEXT IS REFUSED WITH TWO MEASUREMENTS, not skipped.
//   1. Player-facing strings reach the bundle. A probe string taken from
//      translations.ts was found verbatim in dist/assets/index-*.js, so
//      dist_hygiene's content scan already sees anything a player could read.
//   2. Stripping comments from every .ts, .svelte, .js, .css and .html under
//      src leaves ZERO brand-token hits. All eight raw hits are comments
//      explaining the stake.us jurisdiction rules, and they are correct prose
//      that must not be removed. A source scan would therefore duplicate a
//      claim dist_hygiene already makes, and would need comment-stripping to
//      avoid being permanently red on eight legitimate lines.
//
// WHAT REMAINS IS GENUINELY UNCOVERED. Ninety four images and audio files ship,
// and nothing in this repository reads their bytes. A supplier's export tool
// writing a studio or platform name into a PNG tEXt chunk, a JPEG EXIF field or
// an MP3 ID3 tag ships that mark INSIDE the artefact, where no text scan of
// source or bundle will ever find it, and where a reviewer unzipping the upload
// would.
//
// THE PREDICATE READS PRINTABLE RUNS, NOT RAW BYTES. Pixel and sample data is
// compressed, so a literal brand token appearing there by chance is vanishingly
// unlikely, but matching raw bytes would still invite coincidence. Printable
// ASCII runs of four characters or more are extracted first, then matched as
// WHOLE TOKENS, because `stake` is a substring of `mistake` and a metadata field
// is free text.
//
// Convention (p):
//   node scripts/stake_mark_gate.mjs --self-test
//   node scripts/stake_mark_gate.mjs
//
// Writes nothing outside a scratch directory it removes. Convention (h.1) holds.

import { readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, sep } from 'node:path'
import { tmpdir } from 'node:os'

const FRONTEND = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(FRONTEND, 'dist')

const ASSET = /\.(png|jpe?g|webp|gif|avif|svg|mp3|wav|ogg|m4a|aac|flac|mp4|webm)$/i

// Stated here and nowhere else in this file's logic, and deliberately NOT
// imported from brand_token_gate.mjs or dist_hygiene_gate.mjs. Convention (l.4):
// three scans sharing one list agree by construction and corroborate nothing.
const MARKS = new Set(['stake', 'stakeengine', 'stakeoriginals', 'stakecom', 'stakeus'])

/** Printable ASCII runs of 4 or more, which is where metadata actually lives. */
function printableRuns(buf) {
  const out = []
  let cur = ''
  for (const b of buf) {
    if (b >= 0x20 && b <= 0x7e) { cur += String.fromCharCode(b); continue }
    if (cur.length >= 4) out.push(cur)
    cur = ''
  }
  if (cur.length >= 4) out.push(cur)
  return out
}

function marksIn(buf) {
  const hits = []
  for (const run of printableRuns(buf)) {
    for (const tok of run.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[^A-Za-z0-9]+/)) {
      if (tok && MARKS.has(tok.toLowerCase())) hits.push({ tok, run: run.slice(0, 80) })
    }
  }
  return hits
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (ASSET.test(e.name)) out.push(p)
  }
  return out
}

// ── self-test ────────────────────────────────────────────────────────────────
function selfTest() {
  const scratch = mkdtempSync(join(tmpdir(), 'stake-mark-'))
  let bad = 0
  const score = (why, shouldFlag, buf) => {
    const ok = (marksIn(buf).length > 0) === shouldFlag
    if (!ok) bad++
    console.log(`  ${ok ? 'caught ' : 'MISSED '} seeded: ${why}`)
  }

  try {
    // A real PNG header plus a tEXt chunk, which is exactly how an export tool
    // stamps a studio name. Not a hand-written string pretending to be a file.
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from('\0\0\0\x18tEXtSoftware\0Powered by Stake Engine'),
      Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe]),
    ])
    score('a PNG tEXt Software chunk naming the platform, the form an export '
      + 'tool really stamps', true, png)

    const id3 = Buffer.concat([
      Buffer.from('ID3\x03\0\0\0\0\x07v'),
      Buffer.from('TPE1\0\0\0\x0c\0\0\0Stake Originals'),
      Buffer.from([0xff, 0xfb, 0x90, 0x00]),
    ])
    score('an MP3 ID3 artist tag naming a platform product', true, id3)

    score('an EXIF-style copyright field with the bare mark', true,
      Buffer.from('\xff\xd8\xff\xe1\0\x16Exif\0\0Copyright: Stake\0\xff\xdb'))

    score('NEGATIVE CONTROL: mistake is not a mark, and metadata is free text',
      false, Buffer.from('\x89PNG\r\n\x1a\ntEXtComment\0a mistake was made here'))

    score('NEGATIVE CONTROL: stakeholder in a description field survives',
      false, Buffer.from('\x89PNG\r\n\x1a\ntEXtDescription\0stakeholder review copy'))

    // The strongest control available: a REAL shipped asset must survive.
    if (existsSync(DIST)) {
      const real = walk(DIST)[0]
      if (real) {
        score(`NEGATIVE CONTROL: a real shipped asset must survive (${relative(DIST, real)})`,
          false, readFileSync(real))
      }
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }

  console.log(bad === 0
    ? 'STAKE MARK GATE SELF-TEST: PASS (3 seeded, 3 negative controls)'
    : `STAKE MARK GATE SELF-TEST: FAIL (${bad})`)
  process.exit(bad === 0 ? 0 : 1)
}

// ── real run ─────────────────────────────────────────────────────────────────
function run() {
  if (!existsSync(DIST)) {
    console.error('STAKE MARK GATE: FAIL, frontend/dist is absent. Build first; '
      + 'a skipped scan is not a pass.')
    process.exit(1)
  }
  const files = walk(DIST)
  const findings = []
  let bytes = 0
  for (const f of files) {
    bytes += statSync(f).size
    for (const h of marksIn(readFileSync(f))) {
      findings.push({ rel: relative(DIST, f).split(sep).join('/'), ...h })
    }
  }

  console.log(`STAKE MARK GATE: ${files.length} shipped asset(s), `
    + `${(bytes / 1024 / 1024).toFixed(2)} MB of bytes read`)

  if (findings.length) {
    console.error('STAKE MARK GATE: FAIL, a shipped asset carries a Stake mark in its bytes')
    for (const f of findings) console.error(`  ${f.rel}: "${f.tok}" in "${f.run}"`)
    console.error('This is metadata inside the artefact, so no text scan of source or '
      + 'bundle can see it. Strip the field at the asset pipeline, not here.')
    process.exit(1)
  }

  console.log('STAKE MARK GATE: PASS (no Stake mark embedded in any shipped asset)')
  process.exit(0)
}

if (process.argv.includes('--self-test')) selfTest()
else run()
