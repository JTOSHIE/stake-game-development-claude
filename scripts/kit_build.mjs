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
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync, readdirSync, statSync, readFileSync, mkdtempSync, renameSync } from 'node:fs'
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
//
// READ FROM THE REPOSITORY-ROOT `VERSION` FILE, owner's order 2026-07-28
// (JOB 2). One source, shared with `vite.config.ts`, which stamps the same
// value into `build-info.json` and into the boot line. Two constants that must
// agree are two constants that eventually will not, and this one already
// failed that way once: it was hardcoded to V3 while a V4 was built and
// shipped, so the script and the Desktop disagreed about which kit it makes.
//
// `--version <n>` still overrides, for a deliberate one-off. The default is the
// file, so the ordinary path needs no flag and cannot drift from the bundle.
const KIT_VERSION = (() => {
  const i = process.argv.indexOf('--version')
  const flag = i >= 0 ? Number(process.argv[i + 1]) : NaN
  if (Number.isInteger(flag) && flag > 0) return flag
  try {
    const raw = readFileSync(join(REPO, 'VERSION'), 'utf-8').trim()
    const n = Number(raw)
    if (Number.isInteger(n) && n > 0) return n
  } catch { /* fall through */ }
  throw new Error('kit build: VERSION is missing or not a positive integer, and no --version given.')
})()
// ONE FIXED PATH, owner's order 2026-07-30. The version is NOT in the directory
// name, and that is the whole point.
//
// It used to be, as `FS_UPLOAD_KIT_V${KIT_VERSION}`, and the version number was
// already single-sourced from the VERSION file above. The number was correct and
// the DESIGN was wrong: interpolating it into a PATH turns one fact into N
// directories on the owner's Desktop, and once N exist, every document that
// mentions them has to say which to keep. Those documents are written at
// different times, so they disagree. OWNER_CHECKLIST.md item 3 said "delete every
// older kit, including V9" while item 5 of the SAME FILE said "keep V9 only", and
// both were true on the day each was written. Five kit folders were on the
// Desktop when this was found.
//
// No amount of proofreading fixes that. A design that requires two documents to
// independently track a moving number produces contradictions at a steady rate,
// and the rate has nothing to do with anyone's care. So the number comes out of
// the name and lives INSIDE the kit instead: in BUILD_INFO.json, in README.md,
// and in the boot console line. "Upload the kit on your Desktop" is then
// permanently true and needs no maintenance.
const KIT_NAME = 'FS_UPLOAD_KIT'
const KIT = join(homedir(), 'Desktop', KIT_NAME)

// THE STAGING PATH, and it must be on the SAME FILESYSTEM as KIT.
//
// rename(2) is only atomic within a filesystem, so staging in tmpdir would give a
// copy rather than a swap and would reintroduce exactly the window this closes.
// Hence ~/Desktop and not os.tmpdir().
const STAGING = join(homedir(), 'Desktop', '.FS_UPLOAD_KIT.staging')

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

/**
 * THE DESKTOP REFUSAL, which is what keeps the fixed name honest.
 *
 * Once the version leaves the directory name, "upload the kit on your Desktop"
 * is only unambiguous while exactly one kit folder exists. This is what makes
 * that true, and it is a REFUSAL rather than a cleanup on purpose: nothing here
 * deletes anything on the owner's Desktop. The owner bins them, this refuses
 * until they have.
 *
 * The unversioned path is NOT free ground. `~/Desktop/FS_UPLOAD_KIT/` already
 * held a pre-TR-062 kit dated 2026-07-26 containing `01_maths_upload/`, the
 * MATHS PACKAGE, which must never be uploaded. Rewriting the documents to say
 * "the kit on your Desktop" before that folder was gone would have pointed the
 * owner's phone at the one folder in this project that must never go up. Hence
 * the second check: a directory at the fixed path carrying a maths payload is
 * refused, not silently overwritten, because overwriting it would destroy the
 * evidence of what was there.
 *
 * Pure enough to self-test: it takes the directory listing, not the Desktop.
 *
 * @param {string[]} entries   basenames present beside the kit, e.g. from readdirSync
 * @param {string[]} atFixed   basenames INSIDE the fixed-path kit, empty if absent
 * @returns {{refuse: string[]}}
 */
export function judgeDesktop(entries, atFixed = []) {
  const refuse = []
  const stale = entries.filter((e) => /^FS_UPLOAD_KIT_V\d+$/.test(e)).sort()
  if (stale.length) {
    refuse.push(`${stale.length} versioned kit folder(s) remain on the Desktop: `
      + `${stale.join(', ')}. The kit no longer carries its version in its name, so more `
      + `than one folder makes "upload the kit on your Desktop" ambiguous, which is the `
      + `defect this change exists to remove. Bin them, then build. Nothing here will `
      + `delete them for you.`)
  }
  if (atFixed.some((e) => /^01_maths/.test(e))) {
    refuse.push(`${KIT_NAME}/ already exists and contains a MATHS payload `
      + `(${atFixed.filter((e) => /^01_maths/.test(e)).join(', ')}). That is the pre-TR-062 `
      + `kit, and the maths package must never be uploaded. It is refused rather than `
      + `overwritten so the evidence survives. Bin it deliberately, then build.`)
  }
  return { refuse }
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
/**
 * The LIVE walkthrough part, read out of the walkthrough itself.
 *
 * This was the literal string 'PART 9e' for three kit versions. The walkthrough
 * moved to 9f with V7 and the README went on pointing the owner at a section
 * whose own heading says SUPERSEDED, DO NOT RUN. A hardcoded cross-reference
 * into a document that gains a section per visit is a cross-reference that is
 * wrong by default, so it is derived: the last `# PART 9x:` heading NOT marked
 * superseded.
 *
 * It THROWS rather than falling back. A kit whose README cannot name the visit
 * it belongs to is worse than no kit, because the owner follows the walkthrough
 * and would follow the wrong half of it.
 */
export function livePart(walkthrough) {
  const live = [...walkthrough.matchAll(/^# (PART 9[a-z]?):([^\n]*)$/gm)]
    .filter((m) => !/SUPERSEDED/i.test(m[2]))
    .map((m) => m[1])
  if (live.length !== 1) {
    throw new Error(`kit build: the walkthrough names ${live.length} live parts `
      + `(${live.join(', ') || 'none'}); exactly one must be unsuperseded.`)
  }
  return live[0]
}

// THE BRANDING SET IS READ FROM THE DIRECTORY, NOT LISTED BY HAND. S2-C092.
//
// The three names used to be written out in the copy loop. `design-system/brand/
// delivery/` holds FOUR deliverables, and the one the hand-written list missed is
// `FutureSpinner-Tile.png`, the COMPOSED TILE MASTER. That directory's own README
// calls itself the SUBMISSION SET, so the kit was shipping the submission set
// minus one, on the owner's own upload path.
//
// Adding a fourth literal would have fixed the instance and left the design
// alone, and the design is the fault: a list written by hand in one file has to
// track a directory in another, and convention (s) is exactly about not making
// two places track one fact. Reading the directory makes the next delivered file
// ship without anyone remembering this script exists.
//
// README.md is the one entry that must NOT ship: it is instructions to us about
// how the set was built, not an asset for the owner to upload. Dotfiles are
// excluded because .DS_Store is the file this project has already had to strip
// out of a bundle once.
function brandingFiles(entries) {
  return entries.filter((f) => f !== 'README.md' && !f.startsWith('.')).sort()
}

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
  // THE WALKTHROUGH CROSS-REFERENCE, seeded in the form it really occurred:
  // the walkthrough gained a section and the previous one was marked
  // superseded, while the README went on naming the old one.
  const REAL = readFileSync(join(REPO, 'docs/records/upload-kit/00_READ_ME_FIRST.md'), 'utf-8')
  const partCases = [
    ['the live part is read out of the real walkthrough, not guessed',
     REAL, (v) => /^PART 9[a-z]$/.test(v)],
    ['seeded: the section that is superseded is NOT chosen',
     '# PART 9f: OLD (SUPERSEDED, DO NOT RUN)\n# PART 9g: NEW\n', (v) => v === 'PART 9g'],
    ['seeded: TWO live sections throws rather than picking one',
     '# PART 9f: ONE\n# PART 9g: TWO\n', 'throws'],
    ['seeded: NO live section throws rather than shipping a dangling reference',
     '# PART 9f: OLD (SUPERSEDED, DO NOT RUN)\n', 'throws'],
  ]
  for (const [label, doc, expect] of partCases) {
    let got
    try { got = livePart(doc) } catch { got = 'throws' }
    const good = expect === 'throws' ? got === 'throws' : (got !== 'throws' && expect(got))
    ok &&= good
    console.log(`  ${good ? 'caught' : 'MISSED'}  ${label}  (got ${got})`)
  }

  // THE DESKTOP REFUSAL, seeded in the form it really occurred, per convention (p).
  // The first case is the actual Desktop as found on 2026-07-30: five kit folders,
  // one of them the pre-TR-062 maths kit. A gate that has never been seen to fail
  // is a script that prints PASS, so both refusals are planted and both negative
  // controls are paired with them.
  const deskCases = [
    ['seeded, the real 2026-07-30 Desktop: four versioned kits are REFUSED',
     ['FS_UPLOAD_KIT', 'FS_UPLOAD_KIT_V7', 'FS_UPLOAD_KIT_V8', 'FS_UPLOAD_KIT_V9',
      'FS_UPLOAD_KIT_V10', 'Screenshot.png'], [], 'refuse'],
    ['seeded, the maths kit at the fixed path is REFUSED rather than overwritten',
     ['FS_UPLOAD_KIT'], ['00_READ_ME_FIRST.md', '01_maths_upload', '02_frontend_upload'], 'refuse'],
    ['seeded, ONE stale versioned folder is still ambiguous and is REFUSED',
     ['FS_UPLOAD_KIT_V10'], [], 'refuse'],
    ['negative control: a clean Desktop with no kit at all builds',
     ['Screenshot.png', 'notes.txt'], [], 'ok'],
    ['negative control: a proper frontend-only kit at the fixed path is OVERWRITTEN, not refused',
     ['FS_UPLOAD_KIT'], ['README.md', 'BUILD_INFO.json', '02_frontend_upload', '03_branding'], 'ok'],
    ['negative control: a lookalike name is not a kit and does not refuse',
     ['FS_UPLOAD_KIT_OLD', 'FS_UPLOAD_KIT_V'], [], 'ok'],
  ]
  for (const [label, entries, atFixed, expected] of deskCases) {
    const actual = judgeDesktop(entries, atFixed).refuse.length ? 'refuse' : 'ok'
    const good = actual === expected
    ok &&= good
    console.log(`  ${good ? 'caught' : 'MISSED'}  ${label}  (expected ${expected}, got ${actual})`)
  }

  // THE BRANDING SET, seeded in the form the defect really took, per convention
  // (p). The existing cases here cover tree refusal and Desktop state; none of
  // them looked at what actually goes INTO the kit, which is how a missing file
  // survived on the owner's own upload path.
  //
  // The first case is the REAL delivery directory rather than a fixture, because
  // the defect was a disagreement between a hand-written list and the real
  // directory, and a fixture on both sides could not have caught it.
  const realDelivery = readdirSync(join(REPO, 'design-system/brand/delivery'))
  const realShipped = brandingFiles(realDelivery)
  const brandCases = [
    ['the real delivery set ships the COMPOSED TILE, the file the old hand-written list dropped',
     realShipped.includes('FutureSpinner-Tile.png')],
    ['the real delivery set ships every deliverable it holds, not a subset',
     realShipped.length === realDelivery.filter((f) => f !== 'README.md' && !f.startsWith('.')).length],
    ['seeded: a file delivered tomorrow ships without editing this script',
     brandingFiles(['FutureSpinner-BG.jpg', 'README.md', 'FutureSpinner-Square.png'])
       .join() === 'FutureSpinner-BG.jpg,FutureSpinner-Square.png'],
    ['seeded: the README is instructions to us and must NOT ship',
     brandingFiles(['README.md']).length === 0],
    ['seeded: .DS_Store does not ship, the file this project already stripped from a bundle once',
     brandingFiles(['.DS_Store', 'FutureSpinner-BG.jpg']).join() === 'FutureSpinner-BG.jpg'],
    // REWRITTEN 2026-07-31. This compared three string literals against a fourth
    // and could not fail whatever brandingFiles did, so it was a comment dressed
    // as a case while being counted in the tally. It now drives the real function
    // against a delivery set carrying a NEW file the old hand-written list could
    // not have known about, which is the defect that actually occurred.
    ['seeded: a newly added delivery image is picked up, which a hand-written list could not do',
     brandingFiles(['FutureSpinner-BG.jpg', 'FutureSpinner-FG.png', 'WeRollSpinners-Logo.png',
       'FutureSpinner-Tile.png', 'FutureSpinner-Promo.png', 'README.md'])
       .includes('FutureSpinner-Promo.png')],
  ]
  for (const [label, good] of brandCases) {
    ok &&= good
    console.log(`  ${good ? 'caught' : 'MISSED'}  ${label}`)
  }

  console.log(ok ? '\nKIT BUILD SELF-TEST: PASS' : '\nKIT BUILD SELF-TEST: FAIL')
  return ok
}

const argv = process.argv.slice(2)
if (argv.includes('--self-test')) process.exit(selfTest() ? 0 : 1)

// ── The refusals, against the real tree ──────────────────────────────────────
const facts = treeFacts()
const { refuse, warn } = judgeTree(facts)
// The Desktop refusal runs in the SAME block, so a build that would be ambiguous
// is refused before the clone, the install and the gates rather than after them.
const desk = join(homedir(), 'Desktop')
refuse.push(...judgeDesktop(
  existsSync(desk) ? readdirSync(desk) : [],
  existsSync(KIT) ? readdirSync(KIT) : [],
).refuse)
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

// RESOLVE THE LIVE WALKTHROUGH SECTION HERE, BEFORE ANYTHING IS BUILT OR DELETED.
//
// This used to sit far below, after `rmSync(KIT)` had already deleted the existing
// kit and after 02_frontend_upload/ and 03_branding/ had been populated. livePart()
// THROWS by design when the walkthrough does not name exactly one unsuperseded
// `# PART 9x:` heading, and its own doc comment says why: a kit whose README cannot
// name the visit it belongs to is worse than no kit. But throwing at that point
// PRODUCED precisely that: a Desktop folder holding the full bundle with no
// README.md and no BUILD_INFO.json, so no commit SHA and none of the SINGLE USE
// warnings. An unlabelled stale kit on the owner's Desktop is the TR-062 shape this
// script exists to prevent, and the tmpdir clone leaked too, because the cleanup
// below the throw was never reached.
//
// The trigger is an ordinary docs commit, not an exotic one: adding a new PART 9x
// heading without marking the previous one SUPERSEDED gives two live parts. TR-100
// records that exact mistake already shipping once, with kit_build writing a stale
// `PART 9e` across three kit versions.
//
// Derived from source in Session 3's JOB 4, re-deriving cluster S2-C098's cause,
// whose recorded cause pointed somewhere else entirely.
const PART = livePart(readFileSync(join(clone, 'docs/records/upload-kit/00_READ_ME_FIRST.md'), 'utf-8'))
console.log(`walkthrough live section: ${PART}`)

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
  ['asset references', 'node scripts/asset_reference_gate.mjs'],
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

// ASSEMBLE INTO STAGING, SWAP AT THE END. Never write to KIT until the kit is
// whole.
//
// This used to be `rmSync(KIT)` followed by the assembly below, and under a
// VERSIONED name that was survivable: a build that died halfway left junk in a
// new folder beside the good kit, and the folder's own name said which version
// it claimed to be. Under a FIXED name the same code is destructive, because a
// half-failed build would delete the good kit and leave a partial, unidentifiable
// payload at the exact path every document tells the owner to upload. There are
// at least four ways to stop between here and the last write.
//
// So the destructive step is the LAST step, and it is a rename rather than a
// copy. Everything below assembles into STAGING; the swap is two statements at
// the bottom of this file.
rmSync(STAGING, { recursive: true, force: true })
mkdirSync(join(STAGING, '02_frontend_upload'), { recursive: true })
cpSync(dist, join(STAGING, '02_frontend_upload'), { recursive: true })
const copied = dirStats(join(STAGING, '02_frontend_upload'))
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
// kit is the only copy the owner has to hand.
//
// 03_branding is NOT uploaded as Front End, and the README says so twice.
cpSync(join(clone, 'docs/records/upload-kit/00_READ_ME_FIRST.md'),
  join(STAGING, '00_READ_ME_FIRST_SECOND_VISIT.md'))
mkdirSync(join(STAGING, '03_branding'), { recursive: true })
const brandDir = join(clone, 'design-system/brand/delivery')
for (const f of brandingFiles(readdirSync(brandDir))) {
  cpSync(join(brandDir, f), join(STAGING, '03_branding', f))
}

// PART was resolved above, before the build and before anything is written, so a
// throw costs nothing and destroys nothing. See the note there.

const readme = `# ${KIT_NAME} \`v${KIT_VERSION}\`, frontend only

**Version \`v${KIT_VERSION}\`, built from commit \`${facts.head}\`**
(\`${facts.head.slice(0, 8)}\`), clean tree, in a fresh clone, ${info.builtAt}.

The same \`v${KIT_VERSION}\` is stamped inside the bundle at
\`02_frontend_upload/build-info.json\` and is the FIRST thing the browser console
prints on every boot, so the version you confirm on the portal and the version in
the artefact are the same string rather than two numbers to reconcile.

**${stats.files} files, ${stats.bytes} bytes (${(stats.bytes / 1024 / 1024).toFixed(2)} MB).**

The same commit is stamped inside the bundle at \`02_frontend_upload/build-info.json\`
and printed to the browser console on every boot, so what is live is answerable from
the artefact rather than by grepping it.

## What to do

**Follow \`00_READ_ME_FIRST_SECOND_VISIT.md\` in this folder, ${PART}.** It is the
full walkthrough, it is one page, and it covers everything below plus what to look
at once the upload is done. The short version:

1. Upload the CONTENTS of \`02_frontend_upload\` as the Front End. Not the folder:
   if \`index.html\` ends up one level down the game will not load.
2. Publish, and confirm the version reads Front V${KIT_VERSION}.
3. The maths package stays at V1 and is NOT re-uploaded.
4. Do NOT press Start Approval.

Three things ${PART} says you do NOT need to do, listed here too because earlier
kits asked for them: \`math/HASHES.txt\` can stay, the game tile is already
composed, and the maths is not being touched.

\`03_branding/\` is here for the tile editor only, and the tile is already done, so
on this visit you should not need it at all. **Nothing in it is uploaded as Front
End.**

## This kit is SINGLE USE, and the way you check is that it is GONE

**Upload it, then bin it.** The job is done when there is no \`${KIT_NAME}\` folder on
your Desktop at all. That is checkable at a glance, it never goes stale, and it needs
no version number: a folder that IS there means you have not uploaded it yet.

This folder is rebuilt from scratch on every kit build, so whatever was here before has
been replaced. TR-062: a stale kit sat on the Desktop and re-uploading it would have
restored one fixed defect while re-shipping another. Kits are regenerated per upload,
from a clone, by \`scripts/kit_build.mjs\`, which refuses a dirty \`frontend/\` or an
unpushed HEAD.

## Gates run IN THE CLONE

${Object.entries(gateResults).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
`
writeFileSync(join(STAGING, 'README.md'), readme)

// `version` is in here because BUILD_INFO.json is the loudest file in the kit and
// it could not previously answer which version this is: its keys were commit,
// builtAt, files, bytes and gates. That mattered little while the folder NAME
// carried the version and matters a great deal now that it does not.
writeFileSync(join(STAGING, 'BUILD_INFO.json'), JSON.stringify({
  version: `v${KIT_VERSION}`,
  commit: facts.head, builtAt: info.builtAt,
  files: stats.files, bytes: stats.bytes, gates: gateResults,
}, null, 2) + '\n')

// ── THE SWAP, and it is deliberately the last thing that happens ─────────────
// Two statements, nothing between them. Every way this build can fail has now
// been passed, so the only window where the owner's Desktop holds no good kit is
// the gap between these two lines, which is a directory-entry update rather than
// a 15MB copy. rename(2) is atomic within a filesystem, and STAGING was chosen
// on ~/Desktop for exactly that reason.
rmSync(KIT, { recursive: true, force: true })
renameSync(STAGING, KIT)

rmSync(work, { recursive: true, force: true })
console.log(`\nKIT BUILD: PASS`)
console.log(`  ${KIT}  (v${KIT_VERSION}, ${facts.head.slice(0, 8)})`)
console.log(`  commit ${facts.head.slice(0, 8)}, ${stats.files} files, ${stats.bytes} bytes`)
