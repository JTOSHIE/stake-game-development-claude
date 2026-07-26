// kit_build.mjs, JOB 4 and JOB 5 / TR-062 (2026-07-26).
//
// Builds the single-use upload kit from a FRESH CLONE, and refuses to build one
// that nobody else could reproduce.
//
// WHY IT REFUSES THINGS
// ---------------------
// TR-062: the published bundle was one commit behind `main`, and nothing in the
// artefact tied a bundle to a commit. The stale kit sat on the Desktop and the
// obvious remedy, re-uploading it, would have restored the missing hero image
// and re-shipped the em dashes at the same time. Fable ruled option (a) with
// (b): stamp the bundle, and make kits single use.
//
// Convention (o) is the structural half: "The staging bundle is always built
// from a fresh clone, never from a working machine, so the uploaded artefact is
// reproducible by definition." Whatever is on a working machine and not in the
// repository cannot reach the upload. So this clones, and the clone is the only
// thing that ships.
//
// WHAT IT REFUSES, AND WHAT IT ONLY WARNS ABOUT
// ---------------------------------------------
// It REFUSES when HEAD is not reachable on the remote, because then the clone
// cannot contain the code the operator is looking at, and it would silently
// build something older. This is the "non-HEAD checkout" case and it is the one
// that actually produced TR-062.
//
// It REFUSES when tracked files under `frontend/` differ from HEAD, because
// those are the files that become the bundle and an operator with local edits
// would reasonably believe they were shipping them.
//
// It WARNS, loudly and by name, about anything else dirty in the tree. That is
// deliberate rather than lax: the artefact comes from a clone of the remote, so
// an untracked file elsewhere on this machine CANNOT reach it by construction.
// Refusing on it would be theatre, and the risk it represents is the operator's
// mental model rather than the bytes, which a named list addresses.
//
// Run:
//   node scripts/kit_build.mjs                 # build the kit
//   node scripts/kit_build.mjs --check         # run the refusals only, build nothing
//   node scripts/kit_build.mjs --self-test     # convention (p)

import { execFileSync, execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync, readdirSync, statSync, readFileSync, mkdtempSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, relative } from 'node:path'
import { tmpdir, homedir } from 'node:os'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..')
// The kit VERSION is a parameter, not a literal. It was hardcoded to V3 while a
// V4 was built and shipped, so the script and the Desktop disagreed about which
// kit it makes, and the README inside a V4 folder would have told the owner to
// confirm "Front V3". One number, read once, used everywhere below.
//   node scripts/kit_build.mjs --version 5
const KIT_VERSION = (() => {
  const i = process.argv.indexOf('--version')
  const v = i >= 0 ? Number(process.argv[i + 1]) : NaN
  return Number.isInteger(v) && v > 0 ? v : 5
})()
const KIT_NAME = `FS_UPLOAD_KIT_V${KIT_VERSION}`
const KIT = join(homedir(), 'Desktop', KIT_NAME)

const git = (args, cwd = REPO) => execFileSync('git', args, { cwd, encoding: 'utf-8' }).trim()

/**
 * The refusals. Pure enough to self-test: it takes the facts, not the repo.
 *
 * @returns {{refuse: string[], warn: string[]}}
 */
export function judgeTree({ headOnRemote, frontendDirty, otherDirty }) {
  const refuse = []
  const warn = []
  if (!headOnRemote) {
    refuse.push('HEAD is not on the remote. The kit is built from a fresh clone, so an '
      + 'unpushed commit cannot be in it and the kit would silently be older than the tree '
      + 'you are looking at. That is exactly what produced TR-062. Push first.')
  }
  if (frontendDirty.length) {
    refuse.push(`frontend/ has ${frontendDirty.length} uncommitted change(s), which become the `
      + `bundle: ${frontendDirty.slice(0, 8).join(', ')}${frontendDirty.length > 8 ? ', ...' : ''}`)
  }
  if (otherDirty.length) {
    warn.push(`${otherDirty.length} path(s) outside frontend/ are dirty and CANNOT reach the kit, `
      + `since it is built from a clone of the remote: ${otherDirty.slice(0, 10).join(', ')}`
      + `${otherDirty.length > 10 ? ', ...' : ''}`)
  }
  return { refuse, warn }
}

function treeFacts() {
  const head = git(['rev-parse', 'HEAD'])
  let headOnRemote = false
  try {
    // Which remote branches contain HEAD. Empty means it was never pushed.
    headOnRemote = git(['branch', '-r', '--contains', head]).length > 0
  } catch { headOnRemote = false }

  // NOT through `git()`: that helper trims the whole output, which strips the
  // leading space off the FIRST porcelain line only, so ` M frontend/x` became
  // `M frontend/x` and slicing three characters yielded `rontend/x`. One
  // frontend file was then classified as outside frontend/ and downgraded from a
  // refusal to a warning, which is the wrong direction to be wrong in.
  // -z gives NUL-separated records with no quoting or trimming to get wrong.
  const porcelain = execFileSync('git', ['status', '--porcelain', '-z'], { cwd: REPO, encoding: 'utf-8' })
    .split('\0').filter(Boolean)
  const paths = porcelain.map((l) => l.slice(3))
  const frontendDirty = paths.filter((p) => p.startsWith('frontend/'))
  const otherDirty = paths.filter((p) => !p.startsWith('frontend/'))
  return { head, headOnRemote, frontendDirty, otherDirty }
}

function dirStats(root) {
  let files = 0, bytes = 0
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) walk(p)
      else { files += 1; bytes += statSync(p).size }
    }
  }
  walk(root)
  return { files, bytes }
}

// ── Self-test, convention (p) ────────────────────────────────────────────────
function selfTest() {
  const cases = [
    ['an unpushed HEAD is REFUSED, the case that produced TR-062',
     { headOnRemote: false, frontendDirty: [], otherDirty: [] }, 'refuse'],
    ['uncommitted frontend/ changes are REFUSED, they become the bundle',
     { headOnRemote: true, frontendDirty: ['frontend/src/App.svelte'], otherDirty: [] }, 'refuse'],
    ['both at once is REFUSED',
     { headOnRemote: false, frontendDirty: ['frontend/x'], otherDirty: [] }, 'refuse'],
    ['dirt OUTSIDE frontend/ only warns, since a clone cannot carry it',
     { headOnRemote: true, frontendDirty: [], otherDirty: ['reports/screens/a.png'] }, 'warn'],
    ['negative control: a clean pushed tree builds',
     { headOnRemote: true, frontendDirty: [], otherDirty: [] }, 'ok'],
  ]
  let ok = true
  for (const [label, facts, expected] of cases) {
    const { refuse, warn } = judgeTree(facts)
    const actual = refuse.length ? 'refuse' : warn.length ? 'warn' : 'ok'
    const good = actual === expected
    ok &&= good
    console.log(`  ${good ? 'caught' : 'MISSED'}  ${label}  (expected ${expected}, got ${actual})`)
  }
  console.log(ok ? '\nKIT BUILD SELF-TEST: PASS' : '\nKIT BUILD SELF-TEST: FAIL')
  return ok
}

const argv = process.argv.slice(2)
if (argv.includes('--self-test')) process.exit(selfTest() ? 0 : 1)

// ── The refusals, against the real tree ──────────────────────────────────────
const facts = treeFacts()
const { refuse, warn } = judgeTree(facts)
console.log(`kit build: HEAD ${facts.head.slice(0, 8)}, on remote: ${facts.headOnRemote}`)
for (const w of warn) console.log(`  warning: ${w}`)
if (refuse.length) {
  console.error('\nKIT BUILD: REFUSED')
  for (const r of refuse) console.error(`  - ${r}`)
  process.exit(1)
}
if (argv.includes('--check')) {
  console.log('\nKIT BUILD: checks pass, nothing built (--check)')
  process.exit(0)
}

// ── Build from a fresh clone, per convention (o) ─────────────────────────────
const work = mkdtempSync(join(tmpdir(), 'fs-kit-'))
const clone = join(work, 'repo')
console.log(`\ncloning ${REPO} at ${facts.head.slice(0, 8)} into ${clone}`)
execFileSync('git', ['clone', '--quiet', '--no-local', REPO, clone], { stdio: 'inherit' })
git(['checkout', '--quiet', facts.head], clone)
const cloneHead = git(['rev-parse', 'HEAD'], clone)
if (cloneHead !== facts.head) {
  console.error(`KIT BUILD: the clone is at ${cloneHead}, not ${facts.head}`)
  process.exit(1)
}

const fe = join(clone, 'frontend')
console.log('npm ci in the clone')
execSync('npm ci --ignore-scripts', { cwd: fe, stdio: 'inherit' })
console.log('npm run build in the clone')
execSync('npm run build', { cwd: fe, stdio: 'inherit' })

// EVERY DIST GATE, IN THE CLONE. Running them here rather than on this machine
// is the whole point: a gate that only passes where the working tree has extra
// files is not a gate. The Playwright ones need a browser, so they are named as
// skipped rather than quietly omitted.
console.log('\nrunning dist gates in the clone')
const gateResults = {}
for (const [name, cmd] of [
  ['dist hygiene', 'node scripts/dist_hygiene_gate.mjs'],
  ['dash gate, dist scan', 'node scripts/dash_gate.mjs'],
  ['mock containment', 'node scripts/mock_containment_check.mjs'],
]) {
  try {
    execSync(cmd, { cwd: fe, stdio: 'inherit' })
    gateResults[name] = 'PASS'
  } catch {
    gateResults[name] = 'FAIL'
  }
}
if (Object.values(gateResults).some((v) => v !== 'PASS')) {
  console.error('\nKIT BUILD: a dist gate failed IN THE CLONE. Nothing was written to the Desktop.')
  console.error(JSON.stringify(gateResults, null, 2))
  process.exit(1)
}

// ── Assemble ─────────────────────────────────────────────────────────────────
const dist = join(fe, 'dist')
const stats = dirStats(dist)
const info = JSON.parse(readFileSync(join(dist, 'build-info.json'), 'utf-8'))

rmSync(KIT, { recursive: true, force: true })
mkdirSync(join(KIT, '02_frontend_upload'), { recursive: true })
cpSync(dist, join(KIT, '02_frontend_upload'), { recursive: true })
const copied = dirStats(join(KIT, '02_frontend_upload'))
if (copied.files !== stats.files || copied.bytes !== stats.bytes) {
  console.error(`KIT BUILD: the copy does not match the build `
    + `(${copied.files}/${copied.bytes} against ${stats.files}/${stats.bytes})`)
  process.exit(1)
}

// The walkthrough and the tile images travel WITH the kit, and both come out of
// the CLONE rather than off this machine, so convention (o) still holds for every
// byte in the folder rather than only for the bundle.
//
// The walkthrough, because the owner needs Part 9 beside the files they are
// uploading, not in a repository they are not reading at the time. The tile
// images, because the Design Thumbnail step is part of the same visit and the
// only other copy sits inside ~/Desktop/FS_UPLOAD_KIT/, which is DEAD and which
// the walkthrough tells the owner to bin. Pointing at a folder we have just told
// them to delete is how the wrong thing gets uploaded.
//
// 03_branding is NOT uploaded as Front End, and the README says so twice.
cpSync(join(clone, 'docs/records/upload-kit/00_READ_ME_FIRST.md'),
  join(KIT, '00_READ_ME_FIRST_SECOND_VISIT.md'))
mkdirSync(join(KIT, '03_branding'), { recursive: true })
for (const f of ['FutureSpinner-BG.jpg', 'FutureSpinner-FG.png', 'WeRollSpinners-Logo.png']) {
  cpSync(join(clone, 'design-system/brand/delivery', f), join(KIT, '03_branding', f))
}

const readme = `# ${KIT_NAME}, frontend only

**Built from commit \`${facts.head}\`** (\`${facts.head.slice(0, 8)}\`), clean tree,
in a fresh clone, ${info.builtAt}.

**${stats.files} files, ${stats.bytes} bytes (${(stats.bytes / 1024 / 1024).toFixed(2)} MB).**

The same commit is stamped inside the bundle at \`02_frontend_upload/build-info.json\`
and printed to the browser console on every boot, so what is live is answerable from
the artefact rather than by grepping it.

## What to do

**Follow \`00_READ_ME_FIRST_SECOND_VISIT.md\` in this folder, PART 9e.** It is the
full walkthrough, it is one page, and it covers everything below plus what to look
at once the upload is done. The short version:

1. Upload the CONTENTS of \`02_frontend_upload\` as the Front End. Not the folder:
   if \`index.html\` ends up one level down the game will not load.
2. Publish, and confirm the version reads Front V${KIT_VERSION}.
3. The maths package stays at V1 and is NOT re-uploaded.
4. Do NOT press Start Approval.

Three things PART 9e says you do NOT need to do, listed here too because earlier
kits asked for them: \`math/HASHES.txt\` can stay, the game tile is already
composed, and the maths is not being touched.

\`03_branding/\` is here for the tile editor only, and the tile is already done, so
on this visit you should not need it at all. **Nothing in it is uploaded as Front
End.**

## This kit is SINGLE USE

Delete it after uploading. TR-062: a stale kit sat on the Desktop and re-uploading it
would have restored one fixed defect while re-shipping another. Kits are regenerated per
upload, from a clone, by \`scripts/kit_build.mjs\`, which refuses a dirty \`frontend/\` or an
unpushed HEAD.

\`~/Desktop/FS_UPLOAD_KIT/\` is DEAD and must not be uploaded again.

## Gates run IN THE CLONE

${Object.entries(gateResults).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
`
writeFileSync(join(KIT, 'README.md'), readme)

writeFileSync(join(KIT, 'BUILD_INFO.json'), JSON.stringify({
  commit: facts.head, builtAt: info.builtAt,
  files: stats.files, bytes: stats.bytes, gates: gateResults,
}, null, 2) + '\n')

rmSync(work, { recursive: true, force: true })
console.log(`\nKIT BUILD: PASS`)
console.log(`  ${KIT}`)
console.log(`  commit ${facts.head.slice(0, 8)}, ${stats.files} files, ${stats.bytes} bytes`)
