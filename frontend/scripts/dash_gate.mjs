#!/usr/bin/env node
//
// dash_gate.mjs: the em/en dash gate, rebuilt per TR-063's ruling.
//
// WHY THIS REPLACES player_string_dash_check.mjs
// ----------------------------------------------
// The old gate failed twice, and the second failure is the instructive one.
//
// First failure: its FILES list was two files while the convention it enforced
// said "no em dashes or en dashes anywhere", so TR-060 found two em dashes
// rendering to players on the real platform while the gate reported PASS.
//
// Second failure: it was widened from 2 files to 25 and recorded as closed.
// It was still wrong. Line 65 read `codePart.match(/'([^'\\]|\\.)*'/g)`, i.e.
// SINGLE-QUOTED JAVASCRIPT LITERALS ONLY, and the two strings it had been
// written to catch were markup prose between tags. The widened gate could not
// have caught them either. It also never scanned src/App.svelte, which was
// shipping an em dash in the document title, player-visible in the browser tab,
// the whole time it reported PASS at 25 files.
//
// THE RULING (Fable, 2026-07-26): scan the BUILT DIST, because dist is what
// reaches a player and it is agnostic to how the string was authored. A source
// scan sits behind it as a fast pre-build check. And per CLAUDE.md convention
// (p), this gate ships a seeded-violation self-test that plants a real dash and
// must FAIL on it before its PASS counts.
//
// USAGE
//   node scripts/dash_gate.mjs              scan dist (build first)
//   node scripts/dash_gate.mjs --source     scan source only, no build needed
//   node scripts/dash_gate.mjs --self-test  prove the gate fails on a seeded dash
//
import { readFileSync, readdirSync, statSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

const EM = '—'
const EN = '–'

// Text-bearing extensions in dist. Binary assets cannot carry a rendered dash
// and scanning them would only produce false positives from byte coincidence.
const DIST_TEXT = new Set(['.js', '.css', '.html', '.json', '.md', '.svg', '.txt'])
const SRC_TEXT = new Set(['.svelte', '.ts', '.js', '.css', '.html'])

// REVIEWED ALLOWLIST. Every entry needs a reason and a reviewer. Empty by
// design: nothing has yet earned an exemption, and an allowlist that starts
// populated is an allowlist nobody reads.
//
// Shape: { file: <substring or regex>, text: <exact surrounding snippet>, why: <reason> }
const ALLOWLIST = []

function walk(dir, exts, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    if (name === 'node_modules' || name === '.git') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, exts, out)
    else if (exts.has(extname(name))) out.push(p)
  }
  return out
}

function isAllowed(file, line) {
  return ALLOWLIST.some((a) => file.includes(a.file) && line.includes(a.text))
}

/** Scan a set of files for EM/EN, returning findings. `skipComments` for source. */
function scanFiles(files, { skipComments }) {
  const findings = []
  for (const p of files) {
    let src
    try { src = readFileSync(p, 'utf-8') } catch { continue }
    if (!src.includes(EM) && !src.includes(EN)) continue
    const rel = relative(ROOT, p)
    src.split('\n').forEach((line, i) => {
      if (!line.includes(EM) && !line.includes(EN)) return
      if (skipComments) {
        const t = line.trim()
        // A whole-line comment cannot reach dist: the bundler strips it. These
        // are counted and reported, never failed, so the gate stays about what
        // actually ships. See the note printed at the end of a source run.
        if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('<!--')) {
          findings.push({ file: rel, line: i + 1, text: t.slice(0, 100), comment: true })
          return
        }
        // A trailing `//` comment on a code line is equally unshipped, but only
        // if the dash is inside the comment part rather than before it.
        const idx = line.indexOf('//')
        if (idx >= 0) {
          const code = line.slice(0, idx)
          if (!code.includes(EM) && !code.includes(EN)) {
            findings.push({ file: rel, line: i + 1, text: t.slice(0, 100), comment: true })
            return
          }
        }
      }
      if (isAllowed(rel, line)) return
      findings.push({ file: rel, line: i + 1, text: line.trim().slice(0, 100), comment: false })
    })
  }
  return findings
}

function report(label, findings, { treatCommentsAsFailure = false } = {}) {
  const real = findings.filter((f) => !f.comment)
  const comments = findings.filter((f) => f.comment)
  const failures = treatCommentsAsFailure ? findings : real

  if (comments.length && !treatCommentsAsFailure) {
    console.log(`${label}: ${comments.length} dash(es) in comments, which never reach dist (reported, not failed)`)
  }
  if (failures.length) {
    console.error(`\n${label}: FAIL, ${failures.length} em or en dash(es) that can reach a player`)
    for (const f of failures) console.error(`  ${f.file}:${f.line}  ${f.text}`)
    return false
  }
  console.log(`${label}: PASS`)
  return true
}

// ── self-test, convention (p) ────────────────────────────────────────────────
//
// Plants a violation IN THE FORM THAT ACTUALLY SHIPPED and proves the gate goes
// red on each. Seeding a form the gate happens to handle, while the real defect
// occurs in another form, teaches nothing: that is precisely how the previous
// gate passed while broken. So all four real-world forms are seeded.
if (process.argv.includes('--self-test')) {
  const tmp = join(ROOT, '.dash-gate-selftest')
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })

  const cases = [
    ['markup-prose.html', `<p>All matching symbol positions count ${EM} no fixed paylines.</p>`,
      'markup prose between tags, the exact form TR-060 shipped and the old gate could not see'],
    ['double-quoted.js', `const t = "Future Spinner ${EM} We Roll Spinners"`,
      'double-quoted literal, invisible to the old single-quote regex'],
    ['template-literal.js', 'const t = `[Sound] Failed: ${url} ' + EM + ' using fallback`',
      'template literal, also invisible to the old regex'],
    ['en-dash.css', `/* nope */ .x::after { content: "10${EN}20"; }`,
      'en dash, which the convention forbids equally'],
  ]

  let allRed = true
  for (const [name, body, why] of cases) {
    writeFileSync(join(tmp, name), body, 'utf-8')
    const found = scanFiles([join(tmp, name)], { skipComments: false }).filter((f) => !f.comment)
    const red = found.length > 0
    console.log(`  ${red ? 'caught' : 'MISSED'}  ${name}: ${why}`)
    if (!red) allRed = false
    rmSync(join(tmp, name), { force: true })
  }

  // And a negative control: a clean file must NOT trip the gate, or the gate is
  // just returning true for everything.
  writeFileSync(join(tmp, 'clean.js'), 'const t = "Future Spinner, We Roll Spinners"', 'utf-8')
  const cleanFound = scanFiles([join(tmp, 'clean.js')], { skipComments: false }).filter((f) => !f.comment)
  const cleanOk = cleanFound.length === 0
  console.log(`  ${cleanOk ? 'clean  ' : 'FALSE+ '}  clean.js: negative control, a dash-free file must pass`)
  rmSync(tmp, { recursive: true, force: true })

  if (!allRed || !cleanOk) {
    console.error('\nDASH GATE SELF-TEST: FAIL. The gate does not catch what it claims to catch.')
    process.exit(1)
  }
  console.log('\nDASH GATE SELF-TEST: PASS (4 seeded violations caught, negative control clean)')
  process.exit(0)
}

// ── source scan ──────────────────────────────────────────────────────────────
const sourceOnly = process.argv.includes('--source')
const srcFiles = walk(join(ROOT, 'src'), SRC_TEXT)
const srcFindings = scanFiles(srcFiles, { skipComments: true })
const srcOk = report(`SOURCE SCAN (${srcFiles.length} files under src/)`, srcFindings)

if (sourceOnly) {
  if (!srcOk) process.exit(1)
  process.exit(0)
}

// ── dist scan, the authority ─────────────────────────────────────────────────
const distDir = join(ROOT, 'dist')
let distFiles = []
try { statSync(distDir); distFiles = walk(distDir, DIST_TEXT) } catch {
  console.error('\nDIST SCAN: no dist/ found. Build first (npm run build), or use --source.')
  process.exit(1)
}
const distFindings = scanFiles(distFiles, { skipComments: false })
const distOk = report(`DIST SCAN (${distFiles.length} text files in dist/)`, distFindings, {
  treatCommentsAsFailure: true,
})

if (!srcOk || !distOk) {
  console.error('\nConvention: use a comma, a colon, or a plain hyphen instead.')
  process.exit(1)
}
console.log('\nDASH GATE: PASS (source and dist both clean)')
