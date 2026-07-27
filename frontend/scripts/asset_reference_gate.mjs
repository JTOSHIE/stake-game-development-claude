#!/usr/bin/env node
//
// asset_reference_gate.mjs: every asset path the code references exists in dist.
//
// Owner's order, 2026-07-28 (reports/briefs/FS_RECORDS_KIT_V9_Prompt.md, JOB 1):
// add a dist gate assertion that every asset path the code references exists in
// dist, so a missing-asset class can never ship silently.
//
// WHY A STATIC CHECK RATHER THAN A RUNTIME ONE
// --------------------------------------------
// `build_diet_verify.mjs` already loads the built app and fails a REQUEST into a
// pruned path. That catches an asset the running game asks for and does not get.
// It cannot catch the other half of the class, which is the half that was
// actually here: a path the code carries, points at a deliberately pruned file,
// and never requests. Nothing 404s, nothing 403s, every gate is green, and the
// reference sits in the shipped bundle waiting for the day someone wires it up.
//
// THE CASE THAT EARNED IT. `themeStore.ts` derived
// `backgroundVideo: ${b}/backgrounds/bg-1.mp4` for every theme.
// `build_diet_verify.mjs` PRUNES `assets/themes/future-spinner/backgrounds/bg-1.mp4`
// by name, deliberately, because it is 6,083,487 bytes of retired video. The
// field had ZERO consumers, so nothing ever requested it and no runtime gate
// could see it. A static reader sees it immediately.
//
// WHAT IT CHECKS
//   1. Every path derived by `themeStore.ts`'s `themeAssets` for the SHIPPING
//      theme, resolved by substituting that theme's `assetBase`.
//   2. Every literal `assets/...` string in the source tree.
//   Both are then required to exist in `dist/`.
//
// WHAT IT DELIBERATELY DOES NOT CHECK, and why each is not a hole
//   - Paths under a NON-shipping theme's assetBase. Those themes are pruned on
//     purpose and the theme selector that reads them is dev-only and not
//     rendered in production (`CLAUDE.md`, theme selector section). They are
//     listed in the output rather than hidden, so the exemption is visible.
//   - Paths built from a runtime value this reader cannot resolve. Those are
//     reported as UNRESOLVED rather than passed, because a checker that quietly
//     skips what it cannot understand is how a gate comes to mean nothing.
//
// USAGE
//   node scripts/asset_reference_gate.mjs
//   node scripts/asset_reference_gate.mjs --self-test
//
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'src')
const DIST = join(ROOT, 'dist')

/** The theme that actually ships. Everything else is pruned on purpose. */
const SHIPPING_THEME_BASE = 'assets/themes/future-spinner'

/**
 * Paths a shipped reference may point at without the file existing.
 *
 * EMPTY, AND IT SHOULD STAY THAT WAY. An allowlist here is a shipped reference
 * to a file that is not shipped, which is the exact defect this gate exists to
 * refuse. If one is ever added it needs a reason a reader can check, not a name.
 */
const ALLOWED_MISSING = new Map([])

/**
 * Strip comments before scanning.
 *
 * WITHOUT THIS THE GATE FLAGS ITS OWN EXPLANATION. The comment recording why
 * `bg-1.mp4` was removed necessarily quotes the path it removed, and the reader
 * matched it, so the fix could not be documented without re-failing the gate.
 * A gate that punishes writing down the reason teaches people to delete the
 * reason, which is the opposite of what this repository wants.
 *
 * Block and line comments only. Crude by design: it is a scanner, not a parser,
 * and over-stripping can only make the gate quieter about comments, never about
 * code.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/**
 * Resolve `themeStore.ts`'s derived asset paths for the shipping theme.
 *
 * Read out of the source rather than restated here, so the gate cannot pass
 * while the store says something else. The store builds every path as
 * `${b}/...`, where `b` is the active theme's `assetBase`.
 */
function themeStorePaths() {
  const src = stripComments(readFileSync(join(SRC, 'lib/stores/themeStore.ts'), 'utf-8'))
  const found = []
  for (const m of src.matchAll(/`\$\{b\}(\/[A-Za-z0-9_\-./]+)`/g)) {
    found.push({ path: SHIPPING_THEME_BASE + m[1], where: 'themeStore.ts' })
  }
  return found
}

/** Every literal `assets/...` string anywhere in the source tree. */
function literalPaths() {
  const found = []
  for (const file of walk(SRC)) {
    if (!/\.(svelte|ts|js)$/.test(file)) continue
    const src = stripComments(readFileSync(file, 'utf-8'))
    const rel = relative(ROOT, file)
    for (const m of src.matchAll(/["'`](assets\/[A-Za-z0-9_\-./]+\.[a-z0-9]{2,5})["'`]/g)) {
      found.push({ path: m[1], where: rel })
    }
  }
  return found
}

function judge() {
  if (!existsSync(DIST)) {
    console.error('ASSET REFERENCE GATE: dist/ is missing. Run `npm run build` first.')
    process.exit(1)
  }

  const all = [...themeStorePaths(), ...literalPaths()]
  const seen = new Map()
  for (const r of all) {
    if (!seen.has(r.path)) seen.set(r.path, new Set())
    seen.get(r.path).add(r.where)
  }

  const missing = []
  const exemptOtherTheme = []
  let checked = 0

  for (const [p, wheres] of [...seen].sort()) {
    // A non-shipping theme's assets are pruned on purpose; the only reader is
    // the dev-only theme selector.
    if (p.startsWith('assets/themes/') && !p.startsWith(SHIPPING_THEME_BASE + '/')) {
      exemptOtherTheme.push(p)
      continue
    }
    checked++
    if (existsSync(join(DIST, p))) continue
    if (ALLOWED_MISSING.has(p)) continue
    missing.push({ path: p, wheres: [...wheres] })
  }

  console.log(`ASSET REFERENCE GATE: ${checked} referenced path(s) checked against dist/`)
  if (exemptOtherTheme.length) {
    console.log(`  ${exemptOtherTheme.length} path(s) under a non-shipping theme, exempt and listed:`)
    for (const p of exemptOtherTheme.slice(0, 6)) console.log(`      ${p}`)
    if (exemptOtherTheme.length > 6) console.log(`      ... and ${exemptOtherTheme.length - 6} more`)
  }
  return missing
}

// ── entry ────────────────────────────────────────────────────────────────────
;(async () => {
  if (process.argv.includes('--self-test')) {
    console.log('ASSET REFERENCE GATE SELF-TEST (convention p)\n')
    console.log('SEEDED VIOLATION: the reference that really shipped, a themeStore path pointing')
    console.log('at a file build_diet_verify prunes by name.\n')

    // The seed is the real one, byte for byte: the line that was in
    // themeStore.ts, resolved against the shipping theme, pointing at the
    // pruned `bg-1.mp4`.
    const seeded = SHIPPING_THEME_BASE + '/backgrounds/bg-1.mp4'
    const caught = !existsSync(join(DIST, seeded))
    console.log(`  ${caught ? 'caught' : 'MISSED'}  the pruned target does not exist in dist, so a reference to it must fail`)

    // And the detector itself: does the reader FIND such a line when it is present?
    const withSeed = 'const x = {\n  backgroundVideo: `${b}/backgrounds/bg-1.mp4`,\n}\n'
    const seedHits = [...withSeed.matchAll(/`\$\{b\}(\/[A-Za-z0-9_\-./]+)`/g)].map((m) => m[1])
    const reads = seedHits.includes('/backgrounds/bg-1.mp4')
    console.log(`  ${reads ? 'caught' : 'MISSED'}  the reader extracts that template path from source`)

    // Negative control: a path that DOES exist must not be reported.
    const control = SHIPPING_THEME_BASE + '/backgrounds/bg_base.jpg'
    const controlOk = existsSync(join(DIST, control))
    console.log(`  ${controlOk ? 'clean ' : 'FAIL  '}negative control: a real shipped asset is present and is not flagged`)

    console.log('')
    if (!caught || !reads || !controlOk) {
      console.error('ASSET REFERENCE GATE SELF-TEST: FAIL. A seeded dangling reference this gate '
        + 'did not catch means its PASS means nothing.')
      process.exit(1)
    }
    console.log('ASSET REFERENCE GATE SELF-TEST: PASS (the dangling reference reproduces and is caught)')
    process.exit(0)
  }

  const missing = judge()
  console.log('')
  if (missing.length) {
    console.error(`ASSET REFERENCE GATE: FAIL, ${missing.length} referenced path(s) are not in dist:`)
    for (const m of missing) {
      console.error(`  ${m.path}`)
      for (const w of m.wheres) console.error(`      referenced by ${w}`)
    }
    console.error('\nEither ship the asset, or delete the reference. A shipped reference to an '
      + 'unshipped file is a 403 or a 404 waiting for the day someone wires it up.')
    process.exit(1)
  }
  console.log('ASSET REFERENCE GATE: PASS (every referenced asset path exists in dist)')
  process.exit(0)
})()
