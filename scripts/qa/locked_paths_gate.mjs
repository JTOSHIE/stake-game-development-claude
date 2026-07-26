// locked_paths_gate.mjs, JOB 3(h) (2026-07-26).
//
// Fails any push or pull request that touches a LOCKED path without an
// owner-sanction token in the commit message that touched it.
//
// WHY A CI GATE AND NOT JUST THE DENY RULES
// -----------------------------------------
// `.claude/settings.json`'s `deny` rules guard the EDIT AND WRITE TOOLS. They do
// not guard git. CLAUDE.md records the near-miss in terms:
//
//   "the purge script walked src/ in bulk and wrote to this file before it was
//    caught by the commit's own verification and reverted. The deny rules guard
//    the Edit and Write tools, not a python loop invoked through Bash."
//
// That is the hole. A shell loop, a `cp`, a `sed -i`, a rebase that resurrects a
// reverted hunk, or a merge that brings someone else's change along, all reach a
// locked path without any tool ever being denied. The deny rules stop a builder
// from typing into the file; nothing stopped the bytes arriving by another route.
// This gate reads what actually landed, which is the only thing that matters.
//
// It is deliberately NOT a replacement for the deny rules. They stop the common
// case at the moment it happens, with the right error, in the right place. This
// catches everything else, at the last point where catching it is still cheap.
//
// THE TOKEN
// ---------
// A commit that legitimately changes a locked path carries, on its own line in
// the commit message:
//
//   LOCK-SANCTION: <YYYY-MM-DD> <locked-path>[, <locked-path>]...
//
// e.g.
//
//   LOCK-SANCTION: 2026-07-25 frontend/src/lib/services/rgsService.ts
//
// The paths are enumerated rather than implied, and the gate checks BOTH
// directions:
//
//   every locked path the commit touches must be named   (no silent extras)
//   every path named must actually be touched            (no blanket sanction)
//
// The second direction is the one that keeps this honest over time. Without it,
// a single "LOCK-SANCTION: ... every locked path" would get pasted forward
// forever and the gate would become a formality. PR #103's real sanction named
// exactly two deny lines, and that is the discipline this encodes.
//
// Run:
//   node scripts/qa/locked_paths_gate.mjs                  # HEAD against its parent
//   node scripts/qa/locked_paths_gate.mjs <base> <head>    # an explicit range
//   node scripts/qa/locked_paths_gate.mjs --self-test      # convention (p)

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * The four locked paths, transcribed from `.claude/settings.json`'s deny rules
 * and CLAUDE.md's "Locked files" section.
 *
 * `.claude/settings.json` is here because it is the lock MECHANISM: a commit
 * that quietly removes a deny line has unlocked everything else, and the
 * lock-exception convention is explicit that the lift is "a temporary,
 * NEVER-COMMITTED working-tree edit ... restored before any commit".
 * A committed change to that file is therefore always either a mistake or a
 * deliberate policy change, and both want a human to have said so.
 */
export const LOCKED = [
  'frontend/src/lib/services/rgsService.ts',
  'frontend/src/lib/stores/gameStore.ts',
  'games/future_spinner/',      // prefix: the whole maths package
  '.claude/settings.json',
]

/** True when `file` is inside a locked path. */
export function isLocked(file) {
  return LOCKED.some((p) => (p.endsWith('/') ? file.startsWith(p) : file === p))
}

/** Which locked path a file belongs to, for reporting and for token matching. */
export function lockedRootOf(file) {
  return LOCKED.find((p) => (p.endsWith('/') ? file.startsWith(p) : file === p)) ?? null
}

const TOKEN_RE = /^LOCK-SANCTION:\s*(\d{4}-\d{2}-\d{2})\s+(.+?)\s*$/m

/**
 * Decide one commit. Pure, so the self-test can drive it with no git at all,
 * and so the rule is readable in one place.
 *
 * @param message the full commit message
 * @param files   the locked files that commit touched
 * @returns {{ok: boolean, reason?: string, sanction?: object}}
 */
export function judge(message, files) {
  const touchedRoots = [...new Set(files.map(lockedRootOf))].filter(Boolean).sort()
  if (touchedRoots.length === 0) return { ok: true }

  const m = TOKEN_RE.exec(message || '')
  if (!m) {
    return {
      ok: false,
      reason: `touches locked path(s) ${touchedRoots.join(', ')} with no LOCK-SANCTION token`,
    }
  }
  const [, date, pathList] = m
  const named = pathList.split(',').map((s) => s.trim()).filter(Boolean).sort()

  // Both directions. Missing means a locked path slipped in unsanctioned;
  // extra means a sanction broader than the change it authorises.
  const missing = touchedRoots.filter((r) => !named.includes(r))
  const extra = named.filter((n) => !touchedRoots.includes(n))
  if (missing.length) {
    return { ok: false, reason: `LOCK-SANCTION does not name ${missing.join(', ')}, which this commit changes` }
  }
  if (extra.length) {
    return {
      ok: false,
      reason: `LOCK-SANCTION names ${extra.join(', ')}, which this commit does not change. `
        + 'A sanction authorises exactly what it names, so a broader one is rejected rather than ignored.',
    }
  }
  if (Number.isNaN(Date.parse(date))) {
    return { ok: false, reason: `LOCK-SANCTION carries an unparseable date "${date}"` }
  }
  return { ok: true, sanction: { date, paths: named } }
}

const git = (args, cwd) =>
  execFileSync('git', args, { cwd, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 })

/** Every commit in `base..head`, with its message and its locked files. */
function commitsIn(base, head, cwd) {
  const shas = git(['rev-list', `${base}..${head}`], cwd).split('\n').map((s) => s.trim()).filter(Boolean)
  return shas.map((sha) => {
    const message = git(['log', '-1', '--format=%B', sha], cwd)
    // --no-renames so a locked file that arrives by rename is still reported as
    // an addition to a locked path rather than disappearing into a rename pair.
    const files = git(['show', '--no-renames', '--pretty=format:', '--name-only', sha], cwd)
      .split('\n').map((s) => s.trim()).filter(Boolean)
    return { sha, message, files: files.filter(isLocked) }
  })
}

function resolveRange(argv) {
  if (argv.length >= 2) return { base: argv[0], head: argv[1] }
  // GitHub Actions supplies these; locally, fall back to HEAD's parent.
  const evBefore = process.env.GITHUB_EVENT_BEFORE
  const baseRef = process.env.GITHUB_BASE_SHA
  const headRef = process.env.GITHUB_SHA || 'HEAD'
  const ZERO = '0000000000000000000000000000000000000000'
  if (baseRef) return { base: baseRef, head: headRef }
  if (evBefore && evBefore !== ZERO) return { base: evBefore, head: headRef }
  return { base: 'HEAD~1', head: 'HEAD' }
}

// ── The seeded self-test, convention (p) ─────────────────────────────────────
//
// "plant the exact defect the gate exists to catch, in the form it really
//  occurs, and prove the gate goes red."
//
// The form it really occurs is a commit that touches a locked file, so the
// self-test builds a REAL throwaway git repository and makes real commits in it,
// rather than calling `judge()` with hand-made arrays. Testing the predicate
// alone would prove nothing about the git plumbing, and the git plumbing is
// where a path-matching gate actually goes wrong: `--name-only` output shape,
// rename detection, merge commits, an empty range.
function selfTest() {
  const dir = mkdtempSync(join(tmpdir(), 'locked-gate-'))
  const results = []
  const run = (label, fn) => {
    let outcome
    try { outcome = fn() } catch (e) { outcome = { ok: false, threw: e.message } }
    results.push({ label, ...outcome })
    const good = outcome.expected === outcome.actual
    console.log(`  ${good ? 'caught' : 'MISSED'}  ${label}  (expected ${outcome.expected}, got ${outcome.actual})`)
    return good
  }
  const commit = (msg, files) => {
    for (const [f, body] of Object.entries(files)) {
      const full = join(dir, f)
      mkdirSync(join(full, '..'), { recursive: true })
      writeFileSync(full, body)
    }
    git(['add', '-A'], dir)
    git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', msg], dir)
    return git(['rev-parse', 'HEAD'], dir).trim()
  }
  const verdict = (base, head) => {
    const bad = commitsIn(base, head, dir).map((c) => judge(c.message, c.files)).filter((v) => !v.ok)
    return bad.length === 0 ? 'PASS' : 'FAIL'
  }

  let allGood = true
  try {
    git(['init', '-q', '-b', 'main'], dir)
    const root = commit('chore: base', { 'README.md': 'x\n' })

    // 1. THE REAL DEFECT: a locked file changed with no token.
    const c1 = commit('fix: tweak the wallet layer',
      { 'frontend/src/lib/services/rgsService.ts': 'export const a = 1\n' })
    allGood &= run('a locked file changed with NO token', () => ({ expected: 'FAIL', actual: verdict(root, c1) }))

    // 2. The same change, correctly sanctioned.
    const c2 = commit('fix: tweak the wallet layer\n\nLOCK-SANCTION: 2026-07-26 frontend/src/lib/services/rgsService.ts\n',
      { 'frontend/src/lib/services/rgsService.ts': 'export const a = 2\n' })
    allGood &= run('the same change WITH a matching token', () => ({ expected: 'PASS', actual: verdict(c1, c2) }))

    // 3. A token that names one locked path while the commit touches two. This
    //    is the near-miss CLAUDE.md records: a bulk operation reaching a second
    //    locked file nobody meant to include.
    const c3 = commit('fix: two files\n\nLOCK-SANCTION: 2026-07-26 frontend/src/lib/services/rgsService.ts\n',
      { 'frontend/src/lib/services/rgsService.ts': 'export const a = 3\n',
        'frontend/src/lib/stores/gameStore.ts': 'export const b = 1\n' })
    allGood &= run('a token naming ONE path while TWO are touched', () => ({ expected: 'FAIL', actual: verdict(c2, c3) }))

    // 4. A blanket sanction naming more than it changes.
    const c4 = commit('fix: one file\n\nLOCK-SANCTION: 2026-07-26 frontend/src/lib/services/rgsService.ts, games/future_spinner/\n',
      { 'frontend/src/lib/services/rgsService.ts': 'export const a = 4\n' })
    allGood &= run('a blanket token naming MORE than it changes', () => ({ expected: 'FAIL', actual: verdict(c3, c4) }))

    // 5. The maths package, matched by prefix rather than by exact path.
    const c5 = commit('maths: retune', { 'games/future_spinner/library/x.csv': '1,2\n' })
    allGood &= run('a file INSIDE games/future_spinner/ with no token', () => ({ expected: 'FAIL', actual: verdict(c4, c5) }))

    // 6. The lock mechanism itself. A committed deny-rule change unlocks
    //    everything else, so it is locked by the same rule.
    const c6 = commit('chore: settings', { '.claude/settings.json': '{"permissions":{"deny":[]}}\n' })
    allGood &= run('.claude/settings.json committed with no token', () => ({ expected: 'FAIL', actual: verdict(c5, c6) }))

    // 7. A locked file arriving by RENAME. Without --no-renames git reports this
    //    as a rename pair and a naive scan of the new name alone can miss the
    //    locked side entirely.
    writeFileSync(join(dir, 'frontend/src/lib/stores/gameStore.ts'), 'export const b = 2\n')
    git(['add', '-A'], dir)
    git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'chore: rename in'], dir)
    const c7 = git(['rev-parse', 'HEAD'], dir).trim()
    allGood &= run('a locked file touched via a bulk add', () => ({ expected: 'FAIL', actual: verdict(c6, c7) }))

    // 8. THE NEGATIVE CONTROL. Ordinary work must pass, or the gate is simply a
    //    red light and everyone routes around it.
    const c8 = commit('feat: something unrelated', { 'frontend/src/lib/utils/thing.ts': 'export const c = 1\n' })
    allGood &= run('negative control: an ordinary commit', () => ({ expected: 'PASS', actual: verdict(c7, c8) }))

    // 9. An empty range must not pass by having nothing to look at in a way that
    //    hides an error. It passes, but it says so.
    allGood &= run('negative control: an empty range', () => ({ expected: 'PASS', actual: verdict(c8, c8) }))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  console.log(allGood ? '\nLOCKED PATHS SELF-TEST: PASS' : '\nLOCKED PATHS SELF-TEST: FAIL')
  return allGood
}

// ── Entry point ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
if (argv.includes('--self-test')) {
  process.exit(selfTest() ? 0 : 1)
}

const { base, head } = resolveRange(argv)
let commits
try {
  commits = commitsIn(base, head, process.cwd())
} catch (e) {
  console.error(`LOCKED PATHS: could not read the range ${base}..${head}`)
  console.error(String(e.message).split('\n')[0])
  console.error('On a shallow CI checkout, set fetch-depth: 0 so the range exists.')
  process.exit(2)
}

const violations = []
let sanctioned = 0
for (const c of commits) {
  const v = judge(c.message, c.files)
  if (!v.ok) violations.push({ sha: c.sha.slice(0, 8), files: c.files, reason: v.reason })
  else if (v.sanction) {
    sanctioned += 1
    console.log(`  sanctioned  ${c.sha.slice(0, 8)}  ${v.sanction.date}  ${v.sanction.paths.join(', ')}`)
  }
}

console.log(`LOCKED PATHS: ${commits.length} commit(s) in ${base}..${head}, ${sanctioned} sanctioned, ${violations.length} violation(s)`)

if (process.env.GITHUB_STEP_SUMMARY && violations.length) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `### Locked paths\n\n${violations.map((v) => `- \`${v.sha}\` ${v.reason}\n  - ${v.files.join('\n  - ')}`).join('\n')}\n`)
}

if (violations.length) {
  console.error('\nLOCKED PATHS: FAIL')
  for (const v of violations) {
    console.error(`  ${v.sha}: ${v.reason}`)
    for (const f of v.files) console.error(`      ${f}`)
  }
  console.error('\nIf this change is owner-sanctioned, add to the commit message, on its own line:')
  console.error('  LOCK-SANCTION: <YYYY-MM-DD> <locked-path>[, <locked-path>]...')
  console.error('naming exactly the locked paths the commit changes. See CLAUDE.md, "Locked files".')
  process.exit(1)
}
console.log('\nLOCKED PATHS: PASS')
