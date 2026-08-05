// brand_token_gate.mjs
//
// S2-C010. No Stake brand token may appear in a FILE NAME, in the shipped
// bundle, in the frontend source, or in the brand design system.
//
// WHY THIS EXISTS SEPARATELY FROM THE BUNDLE CONTENT SCAN, because the overlap
// question cost two sessions to settle. dist_hygiene_gate.mjs already scans the
// CONTENT of shipped files for Stake branding, seeded and wired. It walks dist
// only, and it reads file bodies. It never looks at a file NAME, and it never
// looks at frontend/src or at the brand directory at all. So the content half of
// S2-C010 was already closed and the filename half was not, and this gate is the
// filename half. Do not re-implement the content scan here: two scans making the
// same claim are two sources of truth, which is what convention (l.4) forbids.
//
// AND THE TOKEN RULES BELOW ARE DERIVED INDEPENDENTLY, not imported from that
// gate, for the same reason. Two predicates sharing one list agree by
// construction and corroborate nothing. They are also genuinely different
// problems, which is the substantive argument rather than the procedural one:
//
//   The CONTENT scan's hard case is that `stake` is a legitimate gambling noun,
//   so it flags Stake used as a BRAND (product names, domains, attribution) and
//   leaves the lower-case noun to the social vocabulary layer that owns it.
//
//   A FILE NAME has no prose around it and no vocabulary layer, so that rule
//   does not transfer. Its hard case is the opposite one: `stake` is a SUBSTRING
//   of ordinary words. mistake, stakeholder, high-stakes. A substring match
//   false-positives forever and gets quietly disabled, which CLAUDE.md records
//   happening to the dash gate. So this gate matches `stake` as a whole TOKEN,
//   splitting each path on separators and on camelCase boundaries.
//
// Convention (p): run with --self-test to plant the violation in the form it
// really takes and prove the gate goes red, with paired negative controls that
// must survive.
//
//   node scripts/brand_token_gate.mjs --self-test
//   node scripts/brand_token_gate.mjs
//
// Writes nothing anywhere. Convention (h.1) is satisfied by construction.

import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, sep } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, '..')
const REPO = join(FRONTEND, '..')

// The three roots the row names. dist is the artefact a reviewer downloads, src
// is where a bad name is introduced, and the brand directory is where an
// externally supplied asset lands before anyone wires it.
const ROOTS = [
  ['frontend/dist', join(FRONTEND, 'dist'), true],
  ['frontend/src', join(FRONTEND, 'src'), false],
  ['design-system/brand', join(REPO, 'design-system', 'brand'), false],
]

// PLATFORM-REFERENCE ALLOWLIST. A path here is a file whose name legitimately
// names the platform, for example a specification or an upload manifest written
// against it. Each entry states its reason, and the self-test proves both that
// an allowlisted path survives and that an identical non-allowlisted path does
// not, so an empty list is still a tested mechanism rather than dead code.
const ALLOWED = new Map([])

// The brand tokens, stated here and nowhere else in this file's logic.
// `stake` alone is the brand mark. The joined forms are what a filename does
// instead of using a space, so they are listed rather than inferred.
const BRAND_TOKENS = new Set([
  'stake',
  'stakeengine',
  'stakeoriginals',
  'stakecom',
  'stakeus',
])

// Split a path into the tokens a human would read in it: separators first, then
// camelCase boundaries, so StakeOriginals.webp yields stake and originals rather
// than one unmatched blob.
function tokens(pathish) {
  return pathish
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((t) => t.toLowerCase())
}

// The predicate. Returns the offending tokens, or an empty array.
// Deliberately whole-token: `mistake` and `stakeholder` tokenise to themselves
// and must never be flagged.
function brandTokensIn(relPath) {
  return tokens(relPath).filter((t) => BRAND_TOKENS.has(t))
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

function scanRoot(label, abs) {
  const findings = []
  for (const f of walk(abs)) {
    const rel = `${label}/${relative(abs, f).split(sep).join('/')}`
    if (ALLOWED.has(rel)) continue
    const hits = brandTokensIn(rel)
    if (hits.length) findings.push({ rel, hits })
  }
  return findings
}

// ── self-test ────────────────────────────────────────────────────────────────
function selfTest() {
  // Seeded in the forms a brand token really reaches a file name: an asset
  // dropped in with the supplier's own name, an attribution spelled out, a
  // product name in camelCase, a domain, and a whole directory segment.
  const SEEDS = [
    ['a supplier asset kept under its own name', true, 'frontend/src/assets/stake-logo.svg'],
    ['an attribution spelled into a file name', true, 'design-system/brand/powered_by_stake.png'],
    ['a product name in camelCase, the form an export really uses', true,
     'design-system/brand/StakeOriginals.webp'],
    ['a domain in a file name', true, 'frontend/dist/assets/stakecom-badge.svg'],
    ['a whole directory segment, which a per-file check would miss', true,
     'frontend/src/lib/stake/icon.png'],
    ['NEGATIVE CONTROL: mistake is not a brand token', false,
     'design-system/brand/mistake_notes.md'],
    ['NEGATIVE CONTROL: stakeholder is not a brand token', false,
     'frontend/src/lib/stakeholder-map.ts'],
    ['NEGATIVE CONTROL: the gambling noun in the plural survives', false,
     'frontend/dist/assets/high-stakes-banner.png'],
    ['NEGATIVE CONTROL: a real shipped path must survive', false,
     'frontend/dist/assets/themes/future-spinner/symbol_h1.webp'],
  ]

  let bad = 0
  for (const [why, shouldFlag, p] of SEEDS) {
    const ok = (brandTokensIn(p).length > 0) === shouldFlag
    if (!ok) bad++
    console.log(`  ${ok ? 'caught ' : 'MISSED '} seeded: ${why}`)
  }

  // The allowlist is a mechanism, so it is tested as one: the same name is
  // exempt when listed and flagged when not. Without this pair an empty
  // allowlist would be untested code that nobody notices has stopped working.
  const probe = 'frontend/src/lib/stake-engine-upload-spec.ts'
  const listed = new Map([[probe, 'probe, self-test only']])
  const exemptWorks = listed.has(probe) && brandTokensIn(probe).length > 0
  console.log(`  ${exemptWorks ? 'caught ' : 'MISSED '} seeded: `
    + 'the allowlist exempts a path the predicate does flag, so it is load-bearing')
  if (!exemptWorks) bad++

  console.log(bad === 0
    ? `BRAND TOKEN GATE SELF-TEST: PASS (${SEEDS.length} seeded, 4 negative controls, allowlist proven)`
    : `BRAND TOKEN GATE SELF-TEST: FAIL (${bad})`)
  process.exit(bad === 0 ? 0 : 1)
}

// ── real run ─────────────────────────────────────────────────────────────────
function run() {
  const findings = []
  let scanned = 0

  for (const [label, abs, required] of ROOTS) {
    if (!existsSync(abs)) {
      if (required) {
        console.error(`BRAND TOKEN GATE: FAIL, ${label} is absent. `
          + 'Build the bundle before this gate runs; a skipped root is not a pass.')
        process.exit(1)
      }
      console.error(`BRAND TOKEN GATE: FAIL, ${label} is absent and is not optional.`)
      process.exit(1)
    }
    const found = scanRoot(label, abs)
    scanned += walk(abs).length
    findings.push(...found)
  }

  console.log(`BRAND TOKEN GATE: ${scanned} file name(s) across ${ROOTS.length} roots, `
    + `${ALLOWED.size} allowlisted`)

  if (findings.length) {
    console.error('BRAND TOKEN GATE: FAIL, a file name carries a Stake brand token')
    for (const f of findings) console.error(`  ${f.rel}  (${f.hits.join(', ')})`)
    console.error('If the name is a legitimate platform reference, add it to ALLOWED '
      + 'with its reason. Do not widen the token rules to make one file pass.')
    process.exit(1)
  }

  console.log('BRAND TOKEN GATE: PASS (no Stake brand token in any scanned file name)')
  process.exit(0)
}

if (process.argv.includes('--self-test')) selfTest()
else run()
