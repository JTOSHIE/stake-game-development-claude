// kit_manifest_gate.mjs - R053 TASK 4 (the R052 gate, landed here).
//
// THE CLAIM: the staged upload bundle at ~/Desktop/FS_UPLOAD_KIT's frontend
// half equals frontend/dist EXACTLY: same file names, same byte counts, same
// sha256 per file, nothing extra on either side. This is what makes the
// owner's delta sync checkable: a bundle that silently diverges from the
// build it claims to stage is the TR-047 class wearing a kit folder.
//
// Run, from the repository root (both trees must exist):
//   node scripts/qa/kit_manifest_gate.mjs
//   node scripts/qa/kit_manifest_gate.mjs --self-test   convention (p)
//
// Exit 0 on PASS, non-zero on FAIL, terminates (TR-123 contract). The
// self-test builds two SCRATCH trees and plants all three defect classes
// (a changed byte, a missing file, an extra file); the comparator must red
// on each and stay clean on the identical pair. The REAL trees are never
// written.

import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'
import { tmpdir } from 'node:os'
import { homedir } from 'node:os'

const REPO = join(import.meta.dirname, '..', '..')
const DIST = join(REPO, 'frontend', 'dist')
const KIT_FRONT = join(homedir(), 'Desktop', 'FS_UPLOAD_KIT', '02_frontend_upload')

function manifest(root) {
  const out = new Map()
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      const st = statSync(p)
      if (st.isDirectory()) walk(p)
      else {
        const body = readFileSync(p)
        out.set(relative(root, p), {
          bytes: st.size,
          sha256: createHash('sha256').update(body).digest('hex'),
        })
      }
    }
  }
  walk(root)
  return out
}

export function compare(a, b) {
  const findings = []
  for (const [rel, ma] of a) {
    const mb = b.get(rel)
    if (!mb) findings.push({ cls: 'MISSING_IN_BUNDLE', rel })
    else if (ma.bytes !== mb.bytes || ma.sha256 !== mb.sha256) {
      findings.push({ cls: 'CONTENT_DIVERGED', rel, dist: ma, bundle: mb })
    }
  }
  for (const rel of b.keys()) if (!a.has(rel)) findings.push({ cls: 'EXTRA_IN_BUNDLE', rel })
  return findings
}

if (process.argv.includes('--self-test')) {
  const t = mkdtempSync(join(tmpdir(), 'kit-manifest-'))
  const A = join(t, 'dist'); const B = join(t, 'bundle')
  for (const d of [A, B]) mkdirSync(join(d, 'assets'), { recursive: true })
  for (const d of [A, B]) {
    writeFileSync(join(d, 'index.html'), '<html>kit</html>')
    writeFileSync(join(d, 'assets', 'app.js'), 'console.log(1)')
  }
  let ok = true
  const clean = compare(manifest(A), manifest(B))
  console.log(`  ${clean.length === 0 ? 'clean  ' : 'FALSE+ '} an identical pair passes`)
  ok &&= clean.length === 0

  writeFileSync(join(B, 'assets', 'app.js'), 'console.log(2)')
  const diverged = compare(manifest(A), manifest(B))
  console.log(`  ${diverged.some((f) => f.cls === 'CONTENT_DIVERGED') ? 'caught ' : 'MISSED '} a changed byte in the bundle`)
  ok &&= diverged.some((f) => f.cls === 'CONTENT_DIVERGED')

  rmSync(join(B, 'index.html'))
  const missing = compare(manifest(A), manifest(B))
  console.log(`  ${missing.some((f) => f.cls === 'MISSING_IN_BUNDLE') ? 'caught ' : 'MISSED '} a file missing from the bundle`)
  ok &&= missing.some((f) => f.cls === 'MISSING_IN_BUNDLE')

  writeFileSync(join(B, 'stray.txt'), 'x')
  const extra = compare(manifest(A), manifest(B))
  console.log(`  ${extra.some((f) => f.cls === 'EXTRA_IN_BUNDLE') ? 'caught ' : 'MISSED '} an extra file in the bundle`)
  ok &&= extra.some((f) => f.cls === 'EXTRA_IN_BUNDLE')

  rmSync(t, { recursive: true, force: true })
  if (!ok) { console.error('\nKIT MANIFEST GATE SELF-TEST: FAIL'); process.exit(1) }
  console.log('\nKIT MANIFEST GATE SELF-TEST: PASS (3 seeded classes caught, identical pair clean)')
  process.exit(0)
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('KIT MANIFEST GATE: no build at frontend/dist. Build first.')
  process.exit(2)
}
if (!existsSync(KIT_FRONT)) {
  console.error(`KIT MANIFEST GATE: no staged bundle at ${KIT_FRONT}. Run scripts/kit_build.mjs first.`)
  process.exit(2)
}

const findings = compare(manifest(DIST), manifest(KIT_FRONT))
if (findings.length) {
  console.error(`KIT MANIFEST GATE: FAIL, ${findings.length} divergence(s) between dist and the staged bundle`)
  for (const f of findings.slice(0, 20)) console.error(`  ${f.cls}  ${f.rel}`)
  process.exit(1)
}
const m = manifest(DIST)
const bytes = [...m.values()].reduce((a, x) => a + x.bytes, 0)
console.log(`KIT MANIFEST GATE: PASS (${m.size} files, ${bytes} bytes, names, bytes and sha256 all equal)`)
process.exit(0)
