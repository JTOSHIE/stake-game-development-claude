// dist_hygiene_gate.mjs, JOB 3(i) (2026-07-26).
//
// NO DOCUMENTATION SHIPS, and the bundle figure is re-recorded here rather than
// quoted from a document nobody can re-run.
//
// WHY THIS EXISTS SEPARATELY FROM THE BUILD PLUGIN
// ------------------------------------------------
// `vite.config.ts`'s `pruneDocs` deletes documentation from `dist` at
// closeBundle. That is the fix. This is the assertion, and the two are
// deliberately not the same thing: a plugin that stops running, or has a path
// edited, or is skipped because someone built with a different config, fails
// silently and the bundle just quietly carries the file again. That is exactly
// how `build_diet_verify.mjs` sat broken for ten days while its committed result
// was cited as compliance evidence.
//
// So this reads `dist` as it stands, knows nothing about how it got that way,
// and fails if a documentation file is present. It would go red if the plugin
// were deleted tomorrow.
//
// WHAT WAS ACTUALLY SHIPPING
// --------------------------
// `assets/themes/future-spinner/sounds/README.md`, an audio generation-notes
// document naming the model, the seeds, the prompts and the licence paths, was
// in the bundle and was served from the portal in the owner's own 104-file
// listing. TR-063's dist scan found it because of its seventeen em dashes; the
// dashes were fixed at source and the row raised the real question, which is
// that the file ships at all. Anyone who could fetch the game could fetch our
// tooling provenance.
//
// Run (from frontend/, after `npm run build`): node scripts/dist_hygiene_gate.mjs

import { readdirSync, statSync, existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const QA = evidenceDir('reports', 'qa')
announceEvidenceMode('dist_hygiene_gate')

/**
 * Documentation extensions and bare names.
 *
 * Kept in step with `pruneDocs` in `vite.config.ts` BY BEING A SECOND
 * INDEPENDENT STATEMENT of the same rule rather than an import from it. Sharing
 * the list would mean a mistake in the list is invisible to both sides, which
 * is convention (l.4): two methods agreeing means nothing when they share their
 * input. If these two ever disagree the gate goes red and someone reads both,
 * which is the correct outcome.
 */
const DOC_EXTENSIONS = ['.md', '.markdown', '.mdx', '.txt', '.rst', '.adoc', '.doc', '.docx', '.pdf']
const DOC_BASENAMES = ['LICENSE', 'LICENCE', 'NOTICE', 'CHANGELOG', 'AUTHORS', 'CONTRIBUTING', 'README']

/**
 * The 25 MB budget, from `SUBMISSION_DOSSIER.md` section 5.
 * Asserted here as well as recorded, so the figure in the report is one this
 * script computed on this build rather than one carried forward.
 */
const BUDGET_BYTES = 25 * 1024 * 1024

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const isDoc = (name) => {
  const lower = name.toLowerCase()
  return DOC_EXTENSIONS.some((e) => lower.endsWith(e)) || DOC_BASENAMES.includes(name.toUpperCase())
}

const failures = []
const check = (name, cond, detail = '') => {
  if (!cond) failures.push({ name, detail })
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond || !detail ? '' : `  ${detail}`}`)
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/ is absent. Run `npm run build` first.')
  process.exit(2)
}

const files = walk(DIST)
const docs = files.filter((f) => isDoc(f.split('/').pop())).map((f) => relative(DIST, f))
const totalBytes = files.reduce((n, f) => n + statSync(f).size, 0)

const byExt = {}
for (const f of files) {
  const n = f.split('/').pop()
  const ext = n.includes('.') ? n.slice(n.lastIndexOf('.')) : '(none)'
  byExt[ext] = (byExt[ext] || 0) + 1
}

console.log(`DIST HYGIENE: ${files.length} files, ${totalBytes} bytes (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`)
check('no documentation file ships', docs.length === 0, docs.join(', '))
check('the bundle is inside the 25 MB budget', totalBytes <= BUDGET_BYTES,
  `${(totalBytes / 1024 / 1024).toFixed(2)} MB against ${(BUDGET_BYTES / 1024 / 1024).toFixed(0)} MB`)
// A dist with almost nothing in it would satisfy both checks above and mean the
// build failed. mock_containment_check.mjs learned this the hard way: it
// reported PASS while scanning one file.
check('dist is a real build rather than an empty directory', files.length > 50, `${files.length} files`)

// ── The build stamp describes THIS bundle, JOB 4 / TR-062 ───────────────────
//
// A provenance file that says the wrong thing is worse than none, and the way
// it goes wrong is drift: someone moves the write earlier in closeBundle, the
// prunes then run after it, and the recorded figures describe a bundle that no
// longer exists. So the two are reconciled rather than both merely recorded.
//
// build-info.json deliberately records the total EXCLUDING itself, since
// including it has no fixed point. The check is therefore: recorded bytes plus
// this file's own size equals what is on disk.
const infoPath = join(DIST, 'build-info.json')
let info = null
if (existsSync(infoPath)) {
  try { info = JSON.parse(readFileSync(infoPath, 'utf-8')) } catch { info = null }
}
check('dist carries a build stamp', info !== null, 'build-info.json missing or unparseable')
if (info) {
  const infoBytes = statSync(infoPath).size
  check('the build stamp names a commit',
    /^[0-9a-f]{40}$/.test(info.commit || ''), String(info.commit))
  check('the build stamp reconciles with the bundle on disk',
    info.bundleBytesExcludingThisFile + infoBytes === totalBytes
      && info.bundleFilesExcludingThisFile + 1 === files.length,
    `stamp says ${info.bundleFilesExcludingThisFile} files / ${info.bundleBytesExcludingThisFile} bytes `
      + `plus itself at ${infoBytes}; disk has ${files.length} files / ${totalBytes} bytes`)
}

// ── No data: URI assets in shipped CSS or JS, JOB 1 2026-07-28 ──────────────
//
// The platform's CSP font-src is 'self', observed live 2026-07-28. A font
// inlined as a data: URI is refused by that policy and the system font leaks
// through mid-interface, with nothing in the build log saying so.
// vite.config.ts sets assetsInlineLimit: 0 so nothing is ever inlined; this is
// the independent assertion on the artefact, per the same split as the
// documentation rule above.
//
// The predicate has to be sharper than "no data: anywhere", because pixi.js
// legitimately ships five short data: URI capability probes (tiny avif, webp,
// png, svg and webm test payloads, longest 711 characters, measured on the
// shipped chunk). Those are feature detection, not assets, and they must
// survive. So the rule is three-part:
//   1. any data: URI in a shipped CSS file fails, at any size (fonts inline
//      into CSS url(), and our CSS carries none legitimately);
//   2. any data:font/* or data:application/font* in CSS or JS fails, at any
//      size, because fonts are the class the CSP blocks;
//   3. any base64 data: URI in a shipped JS file with a payload of 2048
//      characters or more fails, which is the shape of an inlined asset and
//      roughly three times the largest legitimate probe.
// Residual, stated rather than hidden: a sub-2KB non-font asset inlined into
// JS would pass rule 3. assetsInlineLimit: 0 means Vite writes no such thing,
// and the regression this gate exists to catch, the limit creeping back up and
// re-inlining fonts and small images, produces payloads far past the line.
const FONT_MIME_RE = /^data:(font\/|application\/font|application\/x-font)/i
const BASE64_PAYLOAD_LIMIT = 2048

function dataUriViolations(text, isCss) {
  const found = []
  const re = /data:[a-z0-9.+-]+\/[a-z0-9.+-]+[;,][^"'`)\s\\]*/gi
  let m
  while ((m = re.exec(text))) {
    const uri = m[0]
    if (isCss) { found.push({ uri: uri.slice(0, 64), rule: 'css carries no data: URIs' }); continue }
    if (FONT_MIME_RE.test(uri)) { found.push({ uri: uri.slice(0, 64), rule: 'no font data: URI anywhere' }); continue }
    const b64 = uri.indexOf('base64,')
    if (b64 !== -1 && uri.length - (b64 + 7) >= BASE64_PAYLOAD_LIMIT) {
      found.push({ uri: uri.slice(0, 64), rule: `base64 payload >= ${BASE64_PAYLOAD_LIMIT} chars in js` })
    }
  }
  return found
}

const codeFiles = files.filter((f) => /\.(js|css)$/i.test(f))
const uriViolations = []
for (const f of codeFiles) {
  const isCss = f.toLowerCase().endsWith('.css')
  for (const v of dataUriViolations(readFileSync(f, 'utf-8'), isCss)) {
    uriViolations.push({ file: relative(DIST, f), ...v })
  }
}
check('no data: URI assets ship in CSS or JS', uriViolations.length === 0,
  uriViolations.map((v) => `${v.file}: ${v.uri}... (${v.rule})`).join('; '))

// Seeded per convention (p): the forms Vite really emits when inlining.
const longB64 = 'A'.repeat(2200)
const URI_SEEDS = [
  ['a woff2 inlined into CSS url(), the exact CSP-blocked form',
   true, `@font-face{src:url(data:font/woff2;base64,${longB64}) format("woff2")}`],
  ['any data: URI in CSS, even a small image',
   true, `.x{background:url(data:image/png;base64,iVBORw0KGgo=)}`],
  ['a font data: URI in JS, below the size line',
   false, `const f="data:font/woff2;base64,d09GMgABAAAAA";`],
  ['a large inlined image asset in JS',
   false, `export default "data:image/png;base64,${longB64}"`],
]
const uriSeeded = URI_SEEDS.map(([why, isCss, text]) => ({ why, caught: dataUriViolations(text, isCss).length > 0 }))
// Negative control: the real shipped JS, pixi probes included, must survive.
const uriControlClean = codeFiles.every((f) =>
  f.toLowerCase().endsWith('.css') || dataUriViolations(readFileSync(f, 'utf-8'), false).length === 0)
for (const s of uriSeeded) console.log(`  ${s.caught ? 'caught' : 'MISSED'}  seeded: ${s.why}`)
console.log(`  ${uriControlClean ? 'clean ' : 'FALSE+'}  seeded: negative control, shipped JS with its pixi probes must survive`)
check('the data: URI scan can actually fail',
  uriSeeded.every((s) => s.caught) && uriControlClean)

// ── SEEDED VIOLATION, convention (p) ─────────────────────────────────────────
//
// This gate claims the shipped-documentation class is closed, so it must be
// seen to fail. The seed is the exact file that really shipped, at the exact
// path it shipped from, rather than a convenient `foo.md` at the root: the
// defect occurred deep inside an asset directory, and a scan that only looked
// at the top level would have passed on the real thing while catching the seed.
const SEEDS = [
  ['the file that really shipped, deep inside an asset directory',
   'assets/themes/future-spinner/sounds/README.md'],
  ['a bare LICENSE with no extension',
   'assets/fonts/LICENSE'],
  ['a text file at the bundle root',
   'CHANGELOG.txt'],
  ['an uppercase extension',
   'assets/NOTES.MD'],
]
const seeded = SEEDS.map(([why, path]) => ({ why, caught: isDoc(path.split('/').pop()) }))
// Negative control: every extension this bundle genuinely ships must survive.
const REAL = ['index.html', 'assets/index-abc.js', 'assets/index-abc.css', 'sprite.png',
  'bgm_loop.mp3', 'bgm_loop.webm', 'tile.jpg', 'orbitron.woff2', 'orbitron.woff', 'build-info.json']
const controlClean = REAL.every((f) => !isDoc(f.split('/').pop()))

for (const s of seeded) console.log(`  ${s.caught ? 'caught' : 'MISSED'}  seeded: ${s.why}`)
console.log(`  ${controlClean ? 'clean ' : 'FALSE+'}  seeded: negative control, every shipped format must survive`)
check('the documentation scan can actually fail',
  seeded.every((s) => s.caught) && controlClean)

writeFileSync(join(QA, 'dist_hygiene_2026-07-26.json'), JSON.stringify({
  generated: '2026-07-26',
  job: 'JOB 3(i), no documentation ships',
  dist: { files: files.length, bytes: totalBytes, megabytes: +(totalBytes / 1024 / 1024).toFixed(2) },
  budgetBytes: BUDGET_BYTES,
  filesByExtension: byExt,
  documentationFound: docs,
  buildStamp: info,
  seeded, negativeControl: controlClean,
  dataUriViolations: uriViolations,
  dataUriSeeded: uriSeeded, dataUriNegativeControl: uriControlClean,
  pass: failures.length === 0,
  failures,
}, null, 2))

if (failures.length) {
  console.error(`\nDIST HYGIENE: FAIL (${failures.length})`)
  for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
  process.exit(1)
}
console.log('\nDIST HYGIENE: PASS')
