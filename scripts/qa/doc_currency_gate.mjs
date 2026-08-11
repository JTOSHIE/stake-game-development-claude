// doc_currency_gate.mjs: a committed document may not make a claim that is no
// longer true of HEAD.
//
// Built 2026-07-29 to `docs/records/DOC_CURRENCY_GATE_SPEC.md`, the approved
// design, from `reports/briefs/FS_GAP_CURRENCY_GATE_Prompt.md`.
//
// WHY THIS EXISTS, and the chain is the argument
// ----------------------------------------------
// `COMPLIANCE_WATCH.md` recorded the platform payments page as NOT YET MIRRORED.
// Thirteen lines later, written 34 minutes after it the same day, it recorded
// the same page as MIRRORED. The first entry was never struck. It survived four
// days, and then the Head of Engineering read it while reviewing a brief,
// treated it as evidence, and cited it as proof the requirements corpus was
// incomplete. It was written into the next session's brief as an instruction and
// reached that session's boot as a VERIFIED premise.
//
// Three consecutive readers trusted the document and the document was wrong. No
// amount of care at the reading end catches that, because a reader has no cheap
// way to know a prose line is stale. A machine does, and that is the whole of
// this gate's case for existing.
//
// THE TWO HALVES, because a currency gate can only check a claim that is written
// in a checkable form
// -------------------
//   PHASE 1  Five classes that are checkable TODAY with no change to how any
//            document is written. Most of the value for a fraction of the cost.
//   PHASE 2  An annotation convention, `<!--CHECK: ...-->`, for the claims a
//            machine cannot infer from the prose alone. Opt-in by definition.
//
// Phase 2 is here because the defect that actually cost this project a corrupted
// work order is a phase 2 claim, and convention (p) requires the gate to be
// seeded with the form that really shipped. A gate whose self-test cannot plant
// its own founding defect has not been tested against it.
//
// THE PHASE 1 CLASSES
// -------------------
//   DEAD_PATH         a backticked path that does not exist at HEAD
//   STALE_LINE        `file.ts:123`, where the file is gone or has fewer lines
//   DEAD_SYMBOL       `symbol()` cited at `file:line`, absent from that file
//   DEAD_COMMIT       a 7 to 40 character SHA that `git cat-file` cannot
//                     resolve AFTER the R044 second-chance resolver (below)
//                     has tried to fetch it, targeted then via pull refs
//   DEAD_DOCREF       a backticked `.md` path, or `DOC.md` section N, that is gone
//   SUPERSEDED_CITED  a LIVE document citing reports/archive/superseded/, added
//                     2026-08-05 by S2-C082. The file EXISTS, which is the whole
//                     point: DEAD_PATH cannot fire, the citation resolves
//                     perfectly, and it is still wrong.
//
// The count is deliberately not written into this heading, per convention (s).
// It was "THE FIVE" while the code listed five, and adding a sixth would have
// made the heading false the moment it landed. This header has already been
// stale once, recorded below; that is not repeated here.
//
// THE FOUR PHASE 2 PREDICATES, kept deliberately small
// ----------------------------------------------------
//   <!--CHECK: exists <glob>-->        at least one tracked file matches
//   <!--CHECK: !exists <glob>-->       none does
//   <!--CHECK: count=N <glob>-->       exactly N do
//   <!--CHECK: grep "<pat>" <glob>-->  the pattern appears in a matching file
//   <!--CHECK: !grep "<pat>" <glob>--> it appears in none
//
// A richer language will not be used, and a predicate nobody writes checks
// nothing. Five forms is the ceiling, not the starting point.
//
// SCOPE
// -----
// Every tracked `.md` EXCEPT FIVE classes, enumerated at OUT_OF_SCOPE and
// OUT_OF_SCOPE_SEGMENTS below, which is the authority. Restated here only
// because a reader meets this comment first:
//
//   reports/archive/            dated records of what was true then
//   docs/stake-engine-live/     verbatim third-party captures, not ours to keep current
//   reports/briefs/             convention (f) forbids editing a brief, so a finding
//                               here is FORBIDDEN TO FIX
//   reports/SESSION_REPORT.md   the same dated records, copied verbatim into
//                               reports/archive/, so the identical sentences were
//                               excluded in one path and scanned in another
//   any path segment `shards`   dated signed squad evidence
//
// Re-checking a dated record against a moved HEAD is exactly the epoch trap
// (`FULL_AUDIT_METHOD.md` 2.2). All five remain valid TARGETS: a reference INTO
// any of them resolves normally.
//
// THIS COMMENT WAS ITSELF STALE, and it is worth recording rather than quietly
// correcting. It named TWO exclusions against a code list of five, from the
// 2026-07-29 scope amendment that added three and never updated the prose eighty
// lines above it. Found by reading, in Session 3's JOB 5, because the gate reads
// citations and never the prose around them, so **it cannot check its own
// header**. That blind spot is declared below and this is what it costs.
//
// THE FROZEN-DEBT RATCHET, per `FULL_AUDIT_METHOD.md` 3.1
// -------------------------------------------------------
// The first real run finds more than one session can fix, so the existing
// findings are frozen and the gate goes live anyway. The freeze is keyed by
// CLASS, FILE and TEXT rather than by text alone, so the same dead path
// appearing in a new document still fails. The frozen count prints on every run,
// because a gate quietly excusing a hundred claims reads exactly like a gate with
// nothing to excuse. The list is checked in BOTH directions, so an entry that
// matches nothing fails too: a ratchet that can rust is not a ratchet.
//
// WHAT IT DELIBERATELY CANNOT SEE, stated per `FULL_AUDIT_METHOD.md` 2.6, because
// a parked class is only honestly parked if its enumeration is honest
// ---------------------------------------------------------------------
//   - Anything inside a fenced code block. Fences here hold shell commands,
//     sample markdown and illustrative snippets, including this gate's own
//     syntax documented in the spec. Resolving paths out of them is a
//     false-positive machine, and a gate that cries wolf gets switched off.
//   - Prose AROUND a citation. `WinBanner.svelte:205 renders an ASCII x` is
//     checked for whether line 205 exists, never for what it says.
//   - A contradiction between two prose lines that are each internally
//     checkable but disagree with each other, unless both carry predicates.
//   - Paths under a gitignored directory (`frontend/dist/`, `worktrees/`).
//     Those are build output and machine state; they are reported as
//     UNRESOLVABLE and counted, never silently dropped, because a checker that
//     quietly skips what it cannot understand is how a gate comes to mean
//     nothing.
//
// Run:
//   node scripts/qa/doc_currency_gate.mjs               scan, honour the baseline
//   node scripts/qa/doc_currency_gate.mjs --self-test   convention (p)
//   node scripts/qa/doc_currency_gate.mjs --freeze      rewrite the baseline
//   node scripts/qa/doc_currency_gate.mjs --report      full findings, no exit code

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const REPO_ROOT = resolve(new URL('../..', import.meta.url).pathname)
const BASELINE_PATH = join(REPO_ROOT, 'scripts', 'qa', 'doc_currency_baseline.json')

// Dated records and verbatim upstream captures. Prefix match on the repo-relative path.
//
// WIDENED 2026-07-29 by the Head of Engineering, on the scope question the gate's
// own build session raised and correctly refused to decide for itself. Recorded
// here rather than in a commit message alone, because a scope narrowing that
// shrinks a frozen baseline must carry its reason where the next reader will
// find it.
//
// THE SPEC CONTRADICTED ITSELF. `DOC_CURRENCY_GATE_SPEC.md` section 4 says dated
// records are not to be kept current, because re-checking them against a moved
// HEAD is the epoch trap (`FULL_AUDIT_METHOD.md` 2.2). Section 6's scan scope
// then excluded only `reports/archive/`. Section 4 is the one that is right, and
// three more classes belong under it:
//
//   1. `reports/briefs/`. THE DECISIVE CASE, and it is one entry. Convention (f)
//      says a brief is saved verbatim and is NEVER tidied or corrected, because
//      it is the evidence for every claim its session makes. The gate froze a
//      dead reference inside a brief, so it was holding a finding that is
//      FORBIDDEN TO FIX. A gate that demands an impossible action is broken, not
//      strict.
//   2. `reports/SESSION_REPORT.md`. The exclusion was already incoherent:
//      `reports/archive/` holds per-session EXTRACTS of this very file, so the
//      same sentences were excluded in one path and scanned in another.
//   3. `**/shards/`. Dated, signed squad evidence from one epoch. A shard
//      reporting "orphan: x.png does not exist" was being flagged FOR CORRECTLY
//      REPORTING A DEAD PATH, which penalises accurate findings.
//
// WHAT IS DELIBERATELY STILL SCANNED, so this is a narrowing and not a retreat:
// ledgers, dispositions, trackers, CLAUDE.md, the specs and every other LIVE
// working document. A stale citation in those misleads someone about to act, and
// that is the whole point of the gate. 341 of the 492 frozen claims were in this
// class and every one of them is still held.
const OUT_OF_SCOPE = [
  'reports/archive/',
  'docs/stake-engine-live/',
  'reports/briefs/',
  'reports/SESSION_REPORT.md',
]

// Path SEGMENT match rather than prefix, since shards live at
// `reports/qa/<topic>/shards/`. Same epoch-trap reasoning as above.
const OUT_OF_SCOPE_SEGMENTS = ['/shards/']

// Gitignored trees that legitimately exist without being tracked. A reference
// into one of these cannot be judged from git, so it is reported UNRESOLVABLE
// rather than counted dead. Derived from `.gitignore` and kept short on purpose.
const UNRESOLVABLE_PREFIXES = [
  'frontend/dist/', 'dist/', 'worktrees/', '.evidence-scratch/', '.owner-preview/',
  'node_modules/', '__pycache__/', 'env/',
]

// Directory names `.gitignore` excludes wherever they appear, so the maths
// package's generated outputs are reported UNRESOLVABLE rather than dead. They
// exist on a machine that has run the simulation and nowhere else, and this gate
// reads git.
// VERIFIED against the tree rather than copied from `.gitignore`, because the
// two disagree: `**/library/**` is ignored, and nine files under it are tracked
// anyway, `publish_files/` among them. Those nine ARE the submission artefact
// set, which makes it the worst possible place for the gate to be blind, so
// `library` is deliberately absent from this list.
const UNRESOLVABLE_SEGMENTS = new Set([
  'books', 'books_compressed', 'lookup_tables', 'configs', 'forces',
  'optimization_files', 'node_modules', '__pycache__', 'site', 'target',
])

// Extensions a document citation may carry, DERIVED from the tracked tree rather
// than listed by hand, because a hand-written list goes stale exactly the way
// this gate exists to prevent.
//
// The first run read `import.meta.env.DEV`, `round.state`, `authenticate.round`
// and `state.events` as file paths: they are dotted expressions and JSON field
// accessors, and they are indistinguishable from `file.ext` by shape alone. The
// tree itself is the authority on what an extension is here.
//
// THE COST, declared rather than hidden: an extension that appears nowhere in the
// tracked tree is not judged. `books_base.jsonl.zst` is the live example, and it
// is gitignored anyway, so the gate could not have judged it either way.
let TRACKED_EXTENSIONS = null
export function extensionsOf(tracked) {
  const set = new Set()
  for (const f of tracked) {
    const m = f.match(/\.([A-Za-z0-9]+)$/)
    if (m) set.add(m[1].toLowerCase())
  }
  return set
}

// A symbol claim is only read against a CODE file. A backticked identifier beside
// a citation into a `.txt` or a `.md` is prose about a document, not an assertion
// that a symbol lives there, and reading it as one produced `url()` charged
// against `orphan_candidates.txt`.
const CODE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'mjs', 'cjs', 'jsx', 'svelte', 'py', 'rs', 'css', 'html',
  'json', 'yml', 'yaml', 'sh', 'toml',
])

// ── git plumbing ─────────────────────────────────────────────────────────────

const git = (args, cwd = REPO_ROOT) =>
  execFileSync('git', args, { cwd, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 })

export function trackedFiles(cwd = REPO_ROOT) {
  return git(['ls-files'], cwd).split('\n').map((f) => f.trim()).filter(Boolean)
}

function commitResolves(sha, cwd = REPO_ROOT) {
  try {
    execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], { cwd, stdio: 'ignore' })
    return true
  } catch { return false }
}

// ── the R044 second-chance resolver, 2026-08-11 ──────────────────────────────
//
// A deleted branch's tip stops resolving in every fresh clone the moment the
// deletion lands, while the dated records that cite it are records and are not
// rewritten (the a5b51567 case: owner-approved deletions executed, two
// documents correct on the day they were written, every CI push red). Fable's
// R044 ruling: when a cited SHA fails local resolution, try to FETCH it before
// calling it dead, because GitHub keeps every pull request's head reachable
// forever under the immutable refs/pull/N/head namespace.
//
// TWO ATTEMPTS, in order, both MEASURED before this was written:
//
//   1. The ruling's letter, one targeted `git fetch origin <sha>`. Measured
//      2026-08-11 against GitHub on BOTH transports for a SHA that IS a pull
//      head tip: https answers "couldn't find remote ref", ssh the same, so
//      GitHub does not serve bare-SHA wants here today. The attempt is kept
//      anyway: it is nearly free, it is what the ruling names, and it starts
//      working by itself the day GitHub advertises the capability.
//   2. The fallback that realises the ruling's intent: fetch the pull-heads
//      namespace once per run into refs/prefetch/pull/* (git's own maintenance
//      prefetch namespace, hidden from branch listing and gc-safe). Verified
//      2026-08-11 in a fresh anonymous https clone: one fetch, and a5b51567
//      resolves. The kept refs also keep the resurrection objects alive
//      locally, which is what the records promise.
//
// Only after both is DEAD_COMMIT reported. The self-test seeds both sides:
// a SHA that exists only on the origin's pull ref must be RESCUED, and a
// fabricated SHA must still FAIL through both attempts.
const pullPrefetchDone = new Set()
function commitResolvesWithFetch(sha, cwd = REPO_ROOT) {
  if (commitResolves(sha, cwd)) return true
  try {
    execFileSync('git', ['fetch', '--quiet', 'origin', sha], { cwd, stdio: 'ignore', timeout: 30_000 })
  } catch {}
  if (commitResolves(sha, cwd)) return true
  if (!pullPrefetchDone.has(cwd)) {
    pullPrefetchDone.add(cwd)
    try {
      execFileSync('git', ['fetch', '--quiet', 'origin', '+refs/pull/*/head:refs/prefetch/pull/*'],
        { cwd, stdio: 'ignore', timeout: 120_000 })
    } catch {}
  }
  return commitResolves(sha, cwd)
}

// ── the scope question, asked once ───────────────────────────────────────────

const inScope = (f) =>
  f.endsWith('.md')
  && !OUT_OF_SCOPE.some((p) => f.startsWith(p))
  && !OUT_OF_SCOPE_SEGMENTS.some((s) => f.includes(s))

// ── glob matching, shared by the path classes and the phase 2 predicates ─────
//
// `**` crosses separators, `*` does not, `?` is one non-separator character.
// Anything else is literal. Small on purpose: the predicates that use it are
// deliberately few, and a richer matcher would invite richer predicates.
function globToRegExp(glob) {
  let out = '^'
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]
    if (c === '*') {
      if (glob[i + 1] === '*') { out += '.*'; i++; if (glob[i + 1] === '/') i++ }
      else out += '[^/]*'
    } else if (c === '?') out += '[^/]'
    else out += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(out + '$')
}

// Does a repo-relative path exist at HEAD, and if so, WHICH tracked file is it?
//
// RESOLUTION IS BY SUFFIX, and that is the single most important correction the
// first real run forced. This repository's prose cites `checks.yml`,
// `App.svelte` and `WinBanner.svelte:205`, not their full repository paths, and
// that is the normal register of every document in it. A gate that resolved only
// full paths read 5,368 live files as dead on its first run. That is a design
// flaw in the gate, not a list of exceptions in the documents, and the fix
// belongs here rather than in a baseline.
//
// So a reference resolves if any tracked file ENDS WITH it on a path boundary.
// `METHOD.md` finds `docs/METHOD.md`; `github/workflows/checks.yml` finds
// `.github/workflows/checks.yml`, which is also how the missing leading dot
// stops mattering.
//
// AMBIGUITY IS NOT RESOLVED BY GUESSING. Where a suffix matches more than one
// tracked file the reference EXISTS but has no unique target, so a line-count or
// symbol check against it is skipped and counted rather than charged to an
// arbitrary one of the matches.
export function resolvePath(p, ctx, fromFile) {
  // A reference written RELATIVE to the citing document, `../LEDGER.md`, is
  // resolved against that document's own directory, which is the only reading
  // that can be correct. Without this the gate reported every sibling and parent
  // reference in a sharded report tree as dead.
  if (fromFile && /^\.\.?\//.test(p)) {
    const parts = fromFile.split('/').slice(0, -1)
    for (const seg of p.split('/')) {
      if (seg === '.' || seg === '') continue
      if (seg === '..') parts.pop()
      else parts.push(seg)
    }
    p = parts.join('/')
  }
  const clean = p.replace(/\/+$/, '')
  if (!clean) return { exists: true, unique: null }
  if (ctx.trackedSet.has(clean)) return { exists: true, unique: clean }
  if (p.includes('*') || p.includes('?')) {
    const re = globToRegExp(p)
    const hits = ctx.tracked.filter((f) => re.test(f))
    return { exists: hits.length > 0, unique: hits.length === 1 ? hits[0] : null }
  }
  const suffix = ctx.bySuffix.get(clean)
  if (suffix) return { exists: true, unique: suffix.length === 1 ? suffix[0] : null }
  const asDir = clean + '/'
  if (ctx.tracked.some((f) => f.startsWith(asDir) || f.includes('/' + asDir))) {
    return { exists: true, unique: null }
  }
  return { exists: false, unique: null }
}

const isUnresolvable = (p) =>
  UNRESOLVABLE_PREFIXES.some((pre) => p === pre.slice(0, -1) || p.startsWith(pre))
  || p.split('/').some((seg) => UNRESOLVABLE_SEGMENTS.has(seg))

// ── markdown reading: fences out, inline spans in ────────────────────────────
//
// Returns one entry per line: its text with fenced regions blanked, so line
// numbers stay true for reporting while fenced content is invisible to every
// class. Blanking rather than dropping is what keeps `file.md:120` citations
// meaningful in the gate's own output.
export function readableLines(src) {
  const lines = src.split('\n')
  let fence = null
  return lines.map((line) => {
    const open = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (fence) {
      if (open && open[1][0] === fence[0] && open[1].length >= fence.length) fence = null
      return ''
    }
    if (open) { fence = open[1]; return '' }
    return line
  })
}

// Inline code spans, `like this`. Backtick runs are matched by length, per
// CommonMark, so `` `a` `` inside a double-tick span does not split it.
export function inlineSpans(line) {
  const out = []
  const re = /(`+)([^`]|[^`].*?[^`])\1(?!`)/g
  let m
  while ((m = re.exec(line)) !== null) out.push({ text: m[2].trim(), index: m.index })
  return out
}

// ── the five phase 1 classes ─────────────────────────────────────────────────

// A backticked span is a PATH claim only if it looks like one. This predicate is
// where the false positives live, so every exclusion below is a structural
// answer to a real shape seen in this repository rather than an allowlist entry.
export function looksLikePath(s) {
  if (!s || s.length > 200) return false
  if (/\s/.test(s)) return false                       // a command, not a path
  if (/[<>{}$|"'\\]/.test(s)) return false             // <name>, ${var}, a template
  if (/^\[|\]$/.test(s)) return false                  // [path], a template bracket
  if (/:\/\//.test(s)) return false                    // a URL
  if (/^[A-Za-z]+:/.test(s) && !s.includes('/')) return false
  if (s.startsWith('#') || s.startsWith('@')) return false
  if (s.startsWith('/') || s.startsWith('~')) return false  // an absolute path on
  // somebody's machine. `/Users/jt/math-sdk/...` appears in this repository's
  // reports; it is one person's checkout, not a repository fact, and a gate that
  // judged it would be judging a machine it cannot see.
  if (/^-{1,2}[a-z]/.test(s)) return false             // a CLI flag
  if (/^\d+(\.\d+)*$/.test(s)) return false            // a version or a number
  if (s.includes('...')) return false                  // an elided path, `.../foo.png`
  if (/^\.[A-Za-z0-9]+\.[A-Za-z0-9]+$/.test(s)) return false  // `.test.ts`, a suffix
  // pattern rather than a file. `.gitignore` keeps its single dot and stays in.
  if (/^[A-Za-z0-9-]+\.(com|org|net|io|dev|ai|co|app|sh)(\/|$)/.test(s)) return false  // a bare domain
  const hasSlash = s.includes('/')
  const endsSlash = s.endsWith('/')
  const hasExt = /[A-Za-z0-9_)\]-]\.[A-Za-z][A-Za-z0-9]{0,5}$/.test(s)
  // A STEM IS REQUIRED before the extension, so a bare `.md` written while
  // discussing the convention is not read as a file that has gone missing.
  //
  // AND A REFERENCE MUST CARRY AN EXTENSION OR A TRAILING SLASH. Without one it
  // is indistinguishable from a branch name, and the first run proved it: 670
  // findings were `track/screenshot-analyst`, `claude/gap-analysis` and their
  // kin, which are branches this repository documents by name. Declared as a
  // blind spot in the header rather than papered over: a directory written
  // without its trailing slash is not checked.
  if (!hasExt && !endsSlash) return false
  if (!hasSlash && !hasExt) return false               // a bare identifier
  if (!hasSlash && hasExt && !/^[A-Za-z0-9_.-]+$/.test(s)) return false
  if (hasExt && TRACKED_EXTENSIONS) {
    const ext = s.match(/\.([A-Za-z0-9]+)$/)[1].toLowerCase()
    if (!TRACKED_EXTENSIONS.has(ext)) return false
  }
  return true
}

// A 7 to 40 character hex token is only read as a commit when it carries BOTH a
// digit and a hex letter, AND its line carries a git context word.
//
// Both halves were bought by the first real run. Without the letter, CI run ids
// (`15515148`) and dates written as digits (`20260707`) are hex. Without the
// context requirement, every content hash in every generation record becomes a
// finding: `65ef44c1ce96d351e96f69831bde8146` is an MD5 of an asset, and this
// project records source and shipped hashes for every adopted asset by standing
// convention. Requiring the context word costs a real SHA sitting alone in a
// table cell with no surrounding word, which is declared as a blind spot rather
// than traded for a hundred hashes read as dead commits.
//
// The `\b` anchors already exclude a 64 character sha256, which cannot match a
// 7-to-40 run bounded by word boundaries on both sides.
//
// AND THE LENGTHS ARE 7 TO 12, OR EXACTLY 40. Git abbreviates to a short prefix
// or prints the full 40; it does not produce 16, 20 or 32 character hex. This
// repository does, everywhere, because its asset provenance records carry MD5
// and truncated content hashes by standing convention: `65ef44c1ce96d351e96f...`
// is the background's source hash and `c7ecfa15dde8db42` is a truncated one.
// Restricting by length is what separates the two populations by construction
// rather than by keyword.
const SHA_RE = /\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])(?:[0-9a-f]{7,12}|[0-9a-f]{40})\b/g
const GIT_CONTEXT_RE = /\b(commit|commits|committed|sha|tip|revision|merge|merged|cherry-pick|reverted|HEAD|ancestor|parent)\b/i

// A code symbol, not an English word and not a filename: it ends in `()`, or is
// camelCase, or is SCREAMING_SNAKE.
//
// lower_snake_case was allowed on the first run and should not have been. In
// prose it is nearly always a module or a field name rather than a symbol, and
// it produced `swap_lookups` charged against `utils/swap_lookups.py`,
// `mechanical_class` against a census document, and `__pycache__` against a
// test-events document. `functionName()`, `betIndex` and `CURRENCY_SCALE` remain
// in, which is the shape the class was written for.
function looksLikeSymbol(s) {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*(\(\))?$/.test(s)) return false
  if (s.endsWith('()')) return true
  if (/[a-z][A-Z]/.test(s)) return true
  return /^[A-Z][A-Z0-9]*_[A-Z0-9_]*$/.test(s)
}

function scanDocument(file, src, ctx) {
  const found = []
  const add = (cls, text, line, detail) => found.push({ cls, file, text, line, detail })
  const lines = readableLines(src)
  const lineCount = (p) => {
    const cached = ctx.lineCounts.get(p)
    if (cached !== undefined) return cached
    let n = 0
    try { n = readFileSync(join(ctx.root, p), 'utf-8').split('\n').length } catch { n = -1 }
    ctx.lineCounts.set(p, n)
    return n
  }

  lines.forEach((raw, i) => {
    const lineNo = i + 1
    if (!raw.trim()) return
    const spans = inlineSpans(raw)

    // ── STALE_LINE, and it is checked BEFORE DEAD_PATH so a citation that is
    //    dead because its file is gone reports once, as the more specific class.
    const citedHere = new Set()
    const citedTargets = new Map()
    for (const src2 of [...spans.map((s) => s.text), raw]) {
      const re = /\b([A-Za-z0-9_./-]+\.[A-Za-z][A-Za-z0-9]{0,5}):(\d+)(?:-(\d+))?\b/g
      let m
      while ((m = re.exec(src2)) !== null) {
        let [, p, fromS, toS] = m
        if (src2[m.index - 1] === '/' || src2[m.index - 1] === '~') continue  // absolute, someone's machine
        // `\b` cannot match before a dot, so a citation into `.github/workflows/`
        // arrives here having lost its leading dot. 129 findings on the second
        // run were this one character.
        if (src2[m.index - 1] === '.') p = '.' + p
        const target = Math.max(Number(fromS), Number(toS || fromS))
        const key = `${p}:${fromS}${toS ? `-${toS}` : ''}`
        if (citedHere.has(key)) continue
        citedHere.add(key)
        if (isUnresolvable(p)) { ctx.unresolvable.push({ file, line: lineNo, text: key }); continue }
        const hit = resolvePath(p, ctx, file)
        if (!hit.exists) { add('STALE_LINE', key, lineNo, 'the cited file does not exist at HEAD'); continue }
        if (!hit.unique) { ctx.unresolvable.push({ file, line: lineNo, text: `${key} (ambiguous)` }); continue }
        citedTargets.set(key, hit.unique)
        const n = lineCount(hit.unique)
        if (n >= 0 && target > n) {
          add('STALE_LINE', key, lineNo, `cites line ${target}, ${hit.unique} has ${n}`)
        }
      }
    }

    // ── DEAD_SYMBOL. Only where the line carries EXACTLY ONE file citation, so
    //    "`foo()` in `a.ts` calls `bar()` in `b.ts:10`" cannot charge foo() to
    //    b.ts. Narrowing the trigger is the structural fix; guessing which
    //    symbol belongs to which file would be a gate that invents findings.
    const citations = [...citedTargets.keys()]
    if (citations.length === 1) {
      const cited = citations[0]
      const p = citedTargets.get(cited)
      const ext = (p || '').match(/\.([A-Za-z0-9]+)$/)
      if (p && !isUnresolvable(p) && ext && CODE_EXTENSIONS.has(ext[1].toLowerCase())) {
        let body = ctx.bodies.get(p)
        if (body === undefined) {
          try { body = readFileSync(join(ctx.root, p), 'utf-8') } catch { body = '' }
          ctx.bodies.set(p, body)
        }
        // The file's own stem is a MODULE reference, not a symbol claim.
        // `swap_lookups` beside `utils/swap_lookups.py` names the file.
        const stem = p.split('/').pop().replace(/\.[^.]+$/, '')
        for (const span of spans) {
          const s = span.text
          if (s === cited || s === p || s.endsWith(`/${p.split('/').pop()}`)) continue
          if (!looksLikeSymbol(s)) continue
          const ident = s.replace(/\(\)$/, '')
          if (ident === stem) continue
          if (!body.includes(ident)) {
            add('DEAD_SYMBOL', `${s} @ ${p}`, lineNo, `${ident} does not appear in ${p}`)
          }
        }
      }
    }

    // ── DEAD_PATH and DEAD_DOCREF, from the inline spans only.
    for (const span of spans) {
      const s = span.text
      if (/:\d+(-\d+)?$/.test(s)) continue            // already judged as STALE_LINE
      if (!looksLikePath(s)) continue
      if (isUnresolvable(s)) { ctx.unresolvable.push({ file, line: lineNo, text: s }); continue }
      if (resolvePath(s, ctx, file).exists) continue
      const cls = s.endsWith('.md') ? 'DEAD_DOCREF' : 'DEAD_PATH'
      add(cls, s, lineNo, 'does not exist at HEAD')
    }

    // ── SUPERSEDED_CITED. S2-C010's sibling problem, added 2026-08-05 by S2-C082.
    //
    // A live document citing something under reports/archive/superseded/ as
    // EVIDENCE. The whole point of this class is that the file EXISTS, so
    // DEAD_PATH above cannot fire and never will: the citation resolves
    // perfectly and is still wrong, because the document it points at has been
    // superseded and the reader is being sent to retired material.
    //
    // SUBMISSION_DOSSIER.md carried two of these, in its section 2 inventory
    // cell and its compliance narrative, both pointing at MATH_VALIDATION.md as
    // the evidence for the five-mode re-validation. A reviewer following either
    // one landed in reports/archive/superseded/.
    //
    // Documents INSIDE the archive may cite their neighbours freely, and a live
    // document that genuinely needs to name a retired file historically has the
    // same escape as every other class here: the finding freezes into the
    // baseline with its reason, and the ratchet stops the NEXT one. This is a
    // new-citation gate, not a purge.
    for (const span of spans) {
      const s = span.text
      if (!s.startsWith('reports/archive/superseded/')) continue
      if (file.startsWith('reports/archive/')) continue
      add('SUPERSEDED_CITED', s, lineNo,
        'is superseded, so citing it sends a reader to retired material; cite the successor')
    }

    // ── DEAD_DOCREF, the section half. `DOC.md` 3.1, or `DOC.md` section 4.
    //    Only fires where the target document actually uses numbered headings,
    //    which is what keeps a trailing year or a table figure from reading as
    //    a section number.
    {
      const re = /`([A-Za-z0-9_./-]+\.md)`[,:]?\s+(?:section\s+)?(\d{1,2}(?:\.\d{1,2})?)\b/gi
      let m
      while ((m = re.exec(raw)) !== null) {
        const [, docPath, section] = m
        const target = ctx.resolveDoc(docPath)
        if (!target) continue
        let headings = ctx.headings.get(target)
        if (headings === undefined) {
          let body = ''
          try { body = readFileSync(join(ctx.root, target), 'utf-8') } catch { body = '' }
          headings = body.split('\n').filter((l) => /^#{1,6}\s/.test(l))
          ctx.headings.set(target, headings)
        }
        const numbered = headings.filter((h) => /^#{1,6}\s+\d/.test(h))
        if (!numbered.length) continue
        const hit = numbered.some((h) => new RegExp(`^#{1,6}\\s+${section.replace('.', '\\.')}(\\D|$)`).test(h))
        if (!hit) add('DEAD_DOCREF', `${docPath} ${section}`, lineNo, `no section ${section} in ${target}`)
      }
    }

    // ── DEAD_COMMIT.
    if (GIT_CONTEXT_RE.test(raw) && !/\b(hash|hashes|md5|sha256|sha1|checksum|digest|run|runs|job|id)\b/i.test(raw)) {
      const candidates = new Set()
      let m
      SHA_RE.lastIndex = 0
      while ((m = SHA_RE.exec(raw)) !== null) candidates.add(m[0])
      for (const sha of candidates) {
        // R044: the second-chance resolver, so a SHA preserved only by an
        // immutable pull ref is fetched rather than reported dead.
        if (ctx.shaCache.get(sha) === undefined) ctx.shaCache.set(sha, commitResolvesWithFetch(sha, ctx.root))
        if (!ctx.shaCache.get(sha)) add('DEAD_COMMIT', sha, lineNo, 'git cat-file cannot resolve it, and neither fetch attempt rescued it')
      }
    }
  })

  // ── PHASE 2: the annotation predicates. Outside fences, so the syntax
  //    documented in the spec's own markdown fence is read as documentation.
  lines.forEach((raw, i) => {
    const re = /<!--\s*CHECK:\s*(.+?)\s*-->/g
    let m
    while ((m = re.exec(raw)) !== null) {
      const verdict = evaluatePredicate(m[1], ctx)
      if (verdict.ok === false) add('STALE_CLAIM', m[1], i + 1, verdict.why)
      else if (verdict.ok === null) add('BAD_PREDICATE', m[1], i + 1, verdict.why)
    }
  })

  return found
}

// ── phase 2 predicate evaluation ─────────────────────────────────────────────
//
// A malformed predicate is a FINDING, never a skip. The failure mode this is
// written against is a predicate that quietly evaluates to nothing and reads,
// in a green run, exactly like a predicate that passed.
export function evaluatePredicate(text, ctx) {
  const matches = (glob) => {
    const re = globToRegExp(glob)
    const direct = ctx.tracked.filter((f) => re.test(f))
    if (direct.length) return direct
    const asDir = glob.replace(/\/+$/, '') + '/'
    return ctx.tracked.filter((f) => f.startsWith(asDir))
  }

  let m
  if ((m = text.match(/^(!?)exists\s+(\S+)$/))) {
    const [, neg, glob] = m
    const n = matches(glob).length
    if (neg) return n === 0 ? { ok: true } : { ok: false, why: `!exists ${glob}, but ${n} file(s) match` }
    return n > 0 ? { ok: true } : { ok: false, why: `exists ${glob}, but nothing matches` }
  }
  if ((m = text.match(/^count=(\d+)\s+(\S+)$/))) {
    const [, want, glob] = m
    const n = matches(glob).length
    return n === Number(want) ? { ok: true } : { ok: false, why: `count=${want} ${glob}, found ${n}` }
  }
  if ((m = text.match(/^(!?)grep\s+(?:-\w+\s+)*["'](.+?)["']\s+(\S+)$/))) {
    const [, neg, pattern, glob] = m
    const files = matches(glob)
    if (!files.length) return { ok: null, why: `grep target ${glob} matches no tracked file` }
    let hits = 0
    for (const f of files) {
      let body = ctx.bodies.get(f)
      if (body === undefined) {
        try { body = readFileSync(join(ctx.root, f), 'utf-8') } catch { body = '' }
        ctx.bodies.set(f, body)
      }
      if (body.includes(pattern)) hits++
    }
    if (neg) return hits === 0 ? { ok: true } : { ok: false, why: `!grep "${pattern}" ${glob}, found in ${hits} file(s)` }
    return hits > 0 ? { ok: true } : { ok: false, why: `grep "${pattern}" ${glob}, found in none of ${files.length} file(s)` }
  }
  return { ok: null, why: 'not one of exists, !exists, count=N, grep, !grep' }
}

// ── the scan, over a tree ────────────────────────────────────────────────────

export function scanTree(root) {
  const tracked = trackedFiles(root)
  const trackedSet = new Set(tracked)
  TRACKED_EXTENSIONS = extensionsOf(tracked)
  const docs = tracked.filter(inScope)
  // Every path suffix of every tracked file, on path boundaries, so
  // `WinBanner.svelte` and `components/WinBanner.svelte` both find
  // `frontend/src/lib/components/WinBanner.svelte`. Built once; the first run
  // spent its whole false-positive budget on references this map resolves.
  const bySuffix = new Map()
  for (const f of tracked) {
    const parts = f.split('/')
    for (let i = parts.length - 1; i >= 0; i--) {
      const suffix = parts.slice(i).join('/')
      if (suffix === f && i !== 0) continue
      if (!bySuffix.has(suffix)) bySuffix.set(suffix, [])
      bySuffix.get(suffix).push(f)
    }
  }
  const ctx = {
    root, tracked, trackedSet, bySuffix,
    lineCounts: new Map(), bodies: new Map(), headings: new Map(), shaCache: new Map(),
    unresolvable: [],
    resolveDoc(p) { return resolvePath(p, ctx).unique },
  }
  const findings = []
  for (const f of docs) {
    let src
    try { src = readFileSync(join(root, f), 'utf-8') } catch { continue }
    findings.push(...scanDocument(f, src, ctx))
  }
  return { ctx, findings, docs, tracked, unresolvable: ctx.unresolvable }
}

// ── the frozen-debt ratchet ──────────────────────────────────────────────────

const keyOf = (f) => `${f.cls}\u0000${f.file}\u0000${f.text}`

/**
 * The baseline's own HEADER must agree with its own BODY.
 *
 * `frozen_count` and `by_class` are written by `--freeze` and then never read
 * again: every count this gate prints is recomputed from the `frozen` array. So
 * they are decorative, and a decorative number inside a checked file is exactly
 * the defect class this project keeps paying for.
 *
 * They drifted within 24 hours of being correct. The currency-table session
 * burned one DEAD_SYMBOL entry from the array, which is precisely what the
 * ratchet requires, and left the header saying 334 and 51 where the body held
 * 333 and 50. Nobody was careless: the header is simply not something a person
 * edits when they burn an entry, because nothing ever made them.
 *
 * So it is checked rather than trusted. Same argument as the both-directions
 * rust check below: a number that cannot go wrong noisily will go wrong quietly,
 * and this one is the number a reader quotes.
 */
export function baselineHeaderProblems(raw, entries) {
  const problems = []
  if (raw.frozen_count !== undefined && raw.frozen_count !== entries.length) {
    problems.push(`frozen_count says ${raw.frozen_count}, the frozen array holds ${entries.length}`)
  }
  if (raw.by_class) {
    const actual = {}
    for (const e of entries) actual[e.cls] = (actual[e.cls] || 0) + 1
    for (const cls of [...new Set([...Object.keys(raw.by_class), ...Object.keys(actual)])].sort()) {
      if ((raw.by_class[cls] || 0) !== (actual[cls] || 0)) {
        problems.push(`by_class.${cls} says ${raw.by_class[cls] ?? 0}, the array holds ${actual[cls] ?? 0}`)
      }
    }
  }
  return problems
}

/** Exit-on-failure wrapper. Kept separate so the self-test can drive the pure
 *  predicate above without `process.exit` taking the harness with it. */
function assertBaselineHeaderMatchesBody(raw, entries) {
  const problems = baselineHeaderProblems(raw, entries)
  if (!problems.length) return
  console.error('DOC CURRENCY GATE: FAIL, the baseline disagrees with itself')
  console.error('')
  for (const p of problems) console.error(`  ${p}`)
  console.error('')
  console.error('An entry was burned or added without the header being recomputed. Either')
  console.error('rerun  node scripts/qa/doc_currency_gate.mjs --freeze  or correct the header')
  console.error('by hand. Do not skip it: the header is the only number in that file which')
  console.error('nothing else checks, and it is the one a reader quotes.')
  process.exit(1)
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return { entries: [], keys: new Set() }
  const raw = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'))
  const entries = raw.frozen || []
  assertBaselineHeaderMatchesBody(raw, entries)
  return { entries, keys: new Set(entries.map((e) => `${e.cls}\u0000${e.file}\u0000${e.text}`)), meta: raw }
}

function writeBaseline(findings) {
  const seen = new Map()
  for (const f of findings) if (!seen.has(keyOf(f))) seen.set(keyOf(f), { cls: f.cls, file: f.file, text: f.text, detail: f.detail })
  const entries = [...seen.values()].sort((a, b) =>
    a.file.localeCompare(b.file) || a.cls.localeCompare(b.cls) || a.text.localeCompare(b.text))
  const byClass = {}
  for (const e of entries) byClass[e.cls] = (byClass[e.cls] || 0) + 1
  writeFileSync(BASELINE_PATH, JSON.stringify({
    _comment: [
      'FROZEN DEBT, per FULL_AUDIT_METHOD.md 3.1. These are the document claims that were',
      'already stale when the gate went live. The gate fails on anything NOT in this list,',
      'so new drift is caught from day one, and it fails on any entry here that stops',
      'matching, so a fix that lands without burning its entry is caught too.',
      'Keyed by class AND file AND text: a bare text allowlist would excuse the same dead',
      'path appearing in a new document tomorrow.',
      'BURN EACH ENTRY IN THE SAME COMMIT AS ITS FIX. The count in the log is the count in',
      'the gate, and the list visibly empties. Do not add to this file to make a run green.',
    ],
    frozen_count: entries.length,
    by_class: byClass,
    frozen: entries,
  }, null, 2) + '\n')
  return entries.length
}

// ── the seeded self-test, convention (p) ─────────────────────────────────────
//
// "Plant the exact defect the gate exists to catch, in the form it really
//  occurs, and prove the gate goes red."
//
// The form it really occurs in is a COMMITTED DOCUMENT inside a real repository,
// so the self-test builds a throwaway git repository, commits real files into it
// and runs the SHIPPED scanTree over it. Calling the regexes with hand-made
// strings would prove something about the regexes and nothing about the parts
// that actually go wrong: `git ls-files` output shape, directory-versus-file
// resolution, fenced-block blanking, and SHA resolution against a real object
// database.
//
// Seed 1 is the payments case, which is the one that matters. It is a phase 2
// claim, so a phase 1 only gate cannot go red on it, which is precisely why the
// predicate engine is in this file rather than deferred.
function selfTest() {
  const dir = mkdtempSync(join(tmpdir(), 'doc-currency-gate-'))
  const results = []
  let allGood = true

  const write = (rel, body) => {
    const full = join(dir, rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, body)
  }
  const commit = (msg) => {
    git(['add', '-A'], dir)
    git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', msg], dir)
    return git(['rev-parse', 'HEAD'], dir).trim()
  }
  const findingsFor = (file, cls) =>
    scanTree(dir).findings.filter((f) => f.file === file && (!cls || f.cls === cls))

  const run = (label, expected, fn) => {
    let actual
    try { actual = fn() } catch (e) { actual = `THREW ${e.message}` }
    const good = actual === expected
    if (!good) allGood = false
    results.push({ label, expected, actual, good })
    console.log(`  ${good ? 'caught ' : 'MISSED '} ${label}\n           expected ${expected}, got ${actual}`)
    return good
  }

  try {
    git(['init', '-q', '-b', 'main'], dir)

    // A small but REAL tree, so every resolution below is a real resolution.
    write('README.md', '# t\n')
    write('src/thing.ts', Array.from({ length: 200 }, (_, i) => `// line ${i + 1}`).join('\n') + '\n')
    write('src/kept.ts', 'export function stillHere() { return 1 }\n')
    write('docs/stake-engine-live/general/payments.md', 'upstream capture of the payments page\n')
    write('shots/a.png', 'x')
    write('shots/b.png', 'x')
    write('docs/METHOD.md', '# METHOD\n\n## 1. First\n\n## 2. Second\n')
    const rootSha = commit('chore: base')

    // ── SEED 1, THE ONE THAT MATTERS. The defect that corrupted a work order:
    //    a document asserting a page is NOT YET MIRRORED while the mirrored
    //    file sits in the tree. Written in the exact shape the convention
    //    prescribes, against a path that really exists in this throwaway repo.
    write('COMPLIANCE_WATCH.md',
      'Entry 5. The platform payments page is NOT YET MIRRORED. '
      + '<!--CHECK: !exists docs/stake-engine-live/*/payments.md-->\n')
    commit('docs: the shipped defect')
    run('SEED 1  NOT YET MIRRORED about a path that EXISTS', 1,
      () => findingsFor('COMPLIANCE_WATCH.md', 'STALE_CLAIM').length)

    // ── SEED 2. A line citation past the end of a 200 line file.
    write('CITE.md', 'The parser is at `src/thing.ts:9999`, which is worth reading.\n')
    commit('docs: seed 2')
    run('SEED 2  `src/thing.ts:9999` against a 200 line file', 1,
      () => findingsFor('CITE.md', 'STALE_LINE').length)

    // ── SEED 3. A backticked path that was deleted.
    write('PATHS.md', 'The retired helper lived at `frontend/src/lib/gone.ts` until last week.\n')
    commit('docs: seed 3')
    run('SEED 3  a backticked path that does not exist', 1,
      () => findingsFor('PATHS.md', 'DEAD_PATH').length)

    // ── SEED 3b. A LIVE document citing a superseded file that EXISTS. The
    //    point of the seed is the negative control beside it: the same citation
    //    from inside the archive must survive, or the class would forbid the
    //    archive from describing itself.
    write('reports/archive/superseded/OLD.md', 'Retired.\n')
    write('LIVE.md', 'Maths verified in `reports/archive/superseded/OLD.md`.\n')
    write('reports/archive/NOTE.md', 'See `reports/archive/superseded/OLD.md` for the retired pass.\n')
    commit('docs: seed 3b')
    run('SEED 3b  a live document cites a superseded file that EXISTS', 1,
      () => findingsFor('LIVE.md', 'SUPERSEDED_CITED').length)
    run('CONTROL 3b  the same citation from inside the archive is NOT flagged', 0,
      () => findingsFor('reports/archive/NOTE.md', 'SUPERSEDED_CITED').length)

    // ── SEED 4. A commit SHA that does not resolve, in a git context. At this
    //    point the throwaway repo has NO origin, so both R044 fetch attempts
    //    fail instantly and the class still fires: the resolver must never
    //    turn "no remote" into a pass.
    write('SHAS.md', `Merged at commit \`deadbee1234\`, and the real tip is \`${rootSha.slice(0, 9)}\`.\n`)
    commit('docs: seed 4')
    run('SEED 4  a commit SHA that does not resolve (no origin to rescue from)', 1,
      () => findingsFor('SHAS.md', 'DEAD_COMMIT').length)

    // ── SEED 4b, the R044 RESCUED case, in the form it really occurred: a SHA
    //    that resolves NOWHERE locally and lives only on the origin's
    //    immutable pull ref, exactly like a deleted session branch's tip. A
    //    real second repository plays GitHub: its commit sits only under
    //    refs/pull/1/head, this repo gains it as `origin`, and the targeted
    //    bare-SHA fetch fails against it just as GitHub refuses it today, so
    //    the rescue must come from the pull-refs prefetch, which is the path
    //    CI actually takes.
    const originDir = mkdtempSync(join(tmpdir(), 'doc-currency-origin-'))
    git(['init', '-q', '-b', 'main'], originDir)
    writeFileSync(join(originDir, 'base.txt'), 'origin base\n')
    git(['add', '-A'], originDir)
    git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'base'], originDir)
    git(['checkout', '-qb', 'session-branch'], originDir)
    writeFileSync(join(originDir, 'f.txt'), 'kept only by a pull ref\n')
    git(['add', '-A'], originDir)
    git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'the deleted tip'], originDir)
    const rescuedSha = git(['rev-parse', 'HEAD'], originDir).trim()
    git(['update-ref', 'refs/pull/1/head', rescuedSha], originDir)
    git(['checkout', '-q', 'main'], originDir)
    git(['branch', '-qD', 'session-branch'], originDir)   // the tip now lives ONLY on the pull ref
    git(['remote', 'add', 'origin', originDir], dir)
    // The prefetch is once per run, and SEED 4 legitimately spent this repo's
    // attempt while it had no origin. Clearing the guard here simulates the
    // next run, which is the situation the rescue exists for.
    pullPrefetchDone.delete(dir)
    write('RESCUE.md', `The audit branch tip was commit \`${rescuedSha.slice(0, 8)}\`, deleted since.\n`)
    commit('docs: seed 4b')
    run('SEED 4b  a SHA held only by the origin pull ref is RESCUED, not reported', 0,
      () => findingsFor('RESCUE.md', 'DEAD_COMMIT').length)

    // ── SEED 4c, the R044 FABRICATED case: a full-length SHA that no
    //    repository holds must still fail through BOTH fetch attempts against
    //    a real origin, or the resolver has widened the gate into a pass.
    write('FABRICATED.md', 'Restored at commit `1f2e3d4c5b6a79881f2e3d4c5b6a79881f2e3d4c` per the log.\n')
    commit('docs: seed 4c')
    run('SEED 4c  a fabricated SHA still fails through both fetch attempts', 1,
      () => findingsFor('FABRICATED.md', 'DEAD_COMMIT').length)

    // ── SEED 5. count=N against a directory holding N minus 1. The spec's
    //    example is 519 against 518; the arithmetic is the form, not the
    //    magnitude, so the throwaway repo uses 3 against 2.
    write('COUNT.md', 'The capture set holds three frames. <!--CHECK: count=3 shots/*.png-->\n')
    commit('docs: seed 5')
    run('SEED 5  count=3 against a directory holding 2', 1,
      () => findingsFor('COUNT.md', 'STALE_CLAIM').length)

    // ── The extra class the five seeds do not otherwise cover, so no class in
    //    this gate ships without having been seen to fail.
    write('SYM.md', 'The old entry point was `removedHelper()` at `src/kept.ts:1`.\n')
    write('DOCREF.md', 'See `docs/METHOD.md` section 9 for the rest.\n')
    write('MISSINGDOC.md', 'The rationale is in `docs/NOWHERE.md`.\n')
    commit('docs: the remaining classes')
    run('SEED 6  a symbol cited at a file that does not contain it', 1,
      () => findingsFor('SYM.md', 'DEAD_SYMBOL').length)
    run('SEED 7  a section number the target document does not have', 1,
      () => findingsFor('DOCREF.md', 'DEAD_DOCREF').length)
    run('SEED 8  a backticked .md path that does not exist', 1,
      () => findingsFor('MISSINGDOC.md', 'DEAD_DOCREF').length)

    // ── NEGATIVE CONTROL 1. A dated record inside reports/archive/ carrying
    //    EVERY defect above must not be flagged. It is a description of what
    //    was true then, and re-checking it against a moved HEAD is the epoch
    //    trap. This is the control that stops the gate rewriting history.
    const everyDefect =
      'Then: the page was NOT YET MIRRORED <!--CHECK: !exists docs/stake-engine-live/*/payments.md-->,\n'
      + 'the parser sat at `src/thing.ts:9999`, `frontend/src/lib/gone.ts` was live,\n'
      + 'the tip was `deadbee1234`, and `docs/NOWHERE.md` held the rationale.\n'
    write('reports/archive/2026-07-01_old.md', everyDefect)
    write('docs/stake-engine-live/general/capture.md', everyDefect)
    commit('docs: the negative controls')
    run('CONTROL 1  a dated archive carrying all five defects is NOT flagged', 0,
      () => findingsFor('reports/archive/2026-07-01_old.md').length)
    run('CONTROL 2  a verbatim upstream capture is NOT flagged', 0,
      () => findingsFor('docs/stake-engine-live/general/capture.md').length)

    // ── NEGATIVE CONTROLS 2b to 2d. The three epoch-trapped classes widened
    // into OUT_OF_SCOPE on 2026-07-29. Seeded because a scope change that
    // SHRINKS a frozen baseline must be provable, not asserted: each of these
    // carries every defect the gate knows and must be silent.
    write('reports/briefs/FS_SOME_Prompt.md', everyDefect)
    write('reports/SESSION_REPORT.md', everyDefect)
    write('reports/qa/some_topic/shards/S01.md', everyDefect)
    run('CONTROL 2b a brief, which convention (f) forbids editing, is NOT flagged', 0,
      () => findingsFor('reports/briefs/FS_SOME_Prompt.md').length)
    run('CONTROL 2c the living session report is NOT flagged', 0,
      () => findingsFor('reports/SESSION_REPORT.md').length)
    run('CONTROL 2d a dated signed squad shard is NOT flagged', 0,
      () => findingsFor('reports/qa/some_topic/shards/S01.md').length)

    // ── SEED 9. THE OTHER HALF OF THAT CHANGE, and the one that stops it being
    // a retreat. The SAME defects in a LIVE working document must still fail.
    // Without this, CONTROL 2b to 2d could be satisfied by a gate that had
    // simply stopped working.
    write('reports/qa/some_topic/LEDGER.md', everyDefect)
    // COMMIT before asserting. `write` only touches disk and `scanTree` reads
    // TRACKED files, so an uncommitted seed is not scanned at all. Learned here
    // the useful way: without this line CONTROL 2b to 2d passed for the WRONG
    // REASON, silent because untracked rather than silent because excluded, and
    // SEED 9 is what exposed it. That is precisely the job a paired positive
    // seed does for a negative control.
    commit('docs: the scope controls and their live-document counterpart')
    run('SEED 9  a LIVE ledger carrying the same defects IS still flagged', 5,
      () => findingsFor('reports/qa/some_topic/LEDGER.md').length)

    // ── NEGATIVE CONTROL 3. Every defect above, inside a FENCED CODE BLOCK, in
    //    an in-scope document. This is the blind spot the header declares, and
    //    a declared blind spot is only honest if it is also tested: if fenced
    //    content ever starts producing findings, this control goes red rather
    //    than the change passing quietly.
    write('FENCED.md', '# Example\n\n```markdown\n' + everyDefect + '```\n')
    commit('docs: the fenced control')
    run('CONTROL 3  the same defects inside a fenced block are NOT flagged', 0,
      () => findingsFor('FENCED.md').length)

    // ── NEGATIVE CONTROL 4. The corrected forms all pass. A gate that fires on
    //    clean input is useless in a different way.
    write('CLEAN.md',
      'The page is mirrored. <!--CHECK: exists docs/stake-engine-live/*/payments.md-->\n'
      + 'The parser is at `src/thing.ts:120`. The helper is `src/kept.ts`.\n'
      + `The capture set holds two frames. <!--CHECK: count=2 shots/*.png-->\n`
      + `Merged at commit \`${rootSha.slice(0, 9)}\`. See \`docs/METHOD.md\` section 2.\n`
      + 'The entry point is `stillHere()` at `src/kept.ts:1`.\n'
      + 'Nothing references `<!--CHECK: !grep "removedHelper" src-->` yet.\n')
    commit('docs: the clean control')
    run('CONTROL 4  the corrected form of every seed PASSES', 0,
      () => findingsFor('CLEAN.md').length)

    // ── NEGATIVE CONTROL 5. The ratchet's second direction. A frozen entry that
    //    no longer matches anything must fail, or the list can rust.
    const live = scanTree(dir).findings
    run('CONTROL 5  a frozen entry matching nothing is detected as rusted', 1, () => {
      const keys = new Set(live.map(keyOf))
      const ghost = { cls: 'DEAD_PATH', file: 'PATHS.md', text: 'frontend/src/lib/never-existed.ts' }
      return [ghost].filter((e) => !keys.has(`${e.cls}\u0000${e.file}\u0000${e.text}`)).length
    })

    // ── NEGATIVE CONTROL 6. A malformed predicate is a finding, not a skip. A
    //    predicate that silently evaluates to nothing reads, in a green run,
    //    exactly like a predicate that passed.
    write('BADPRED.md', 'Something is true. <!--CHECK: probably yes-->\n')
    commit('docs: the malformed predicate control')
    run('CONTROL 6  a malformed predicate is REPORTED, not skipped', 1,
      () => findingsFor('BADPRED.md', 'BAD_PREDICATE').length)

    // ── SEED 7, THE BASELINE'S HEADER AGAINST ITS OWN BODY.
    //
    // Seeded in the form it really occurred, which is the whole of convention
    // (p). On 2026-07-29 the currency-table session burned one DEAD_SYMBOL entry
    // from the frozen array, exactly as the ratchet requires, and the header
    // kept saying 334 and 51 while the body held 333 and 50. It survived a full
    // green CI run, because every count the gate prints is recomputed from the
    // array and nothing ever read the header. So the numbers a HUMAN quotes were
    // the only numbers in the file that nothing checked.
    //
    // The seed is that exact off-by-one, not a dramatic one, because an
    // off-by-one is what burning a single entry produces.
    const body3 = [
      { cls: 'DEAD_PATH', file: 'A.md', text: 'x' },
      { cls: 'DEAD_PATH', file: 'B.md', text: 'y' },
      { cls: 'DEAD_SYMBOL', file: 'C.md', text: 'z' },
    ]
    run('SEED 7a   frozen_count one ahead of the array, the burned-entry form', 1,
      () => baselineHeaderProblems({ frozen_count: 4 }, body3).length)
    run('SEED 7b   by_class disagreeing on one class', 1,
      () => baselineHeaderProblems(
        { by_class: { DEAD_PATH: 2, DEAD_SYMBOL: 2 } }, body3).length)
    run('SEED 7c   a class present in the body and absent from the header', 1,
      () => baselineHeaderProblems({ by_class: { DEAD_PATH: 2 } }, body3).length)

    // PAIRED POSITIVES. A check that only ever says no is not a check, and this
    // one guards a file that must stay editable by hand.
    run('CONTROL 7a a header agreeing with its body is silent', 0,
      () => baselineHeaderProblems(
        { frozen_count: 3, by_class: { DEAD_PATH: 2, DEAD_SYMBOL: 1 } }, body3).length)
    run('CONTROL 7b a baseline predating the header fields is not failed', 0,
      () => baselineHeaderProblems({}, body3).length)
    run('CONTROL 7c an empty baseline with an honest header is silent', 0,
      () => baselineHeaderProblems({ frozen_count: 0, by_class: {} }, []).length)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }

  console.log(`\nSELF-TEST: ${results.filter((r) => r.good).length}/${results.length} cases correct`)
  if (!allGood) {
    console.error('\nDOC CURRENCY GATE SELF-TEST: FAIL')
    console.error('  A gate that has never been seen to fail is a script that prints PASS.')
    console.error('  Convention (p) says its PASS does not count until every seed goes red.')
    process.exit(1)
  }
  console.log('DOC CURRENCY GATE SELF-TEST: PASS (every seed red, every control green)')
}

// ── entry point ──────────────────────────────────────────────────────────────
//
// GUARDED, 2026-07-30. Everything below is top-level and used to run on IMPORT,
// so `brief_preflight.mjs` importing the resolver silently ran the whole gate
// and inherited its argv: a `--self-test` on the importer executed the gate's
// self-test instead. Found on the importer's first run.
//
// The lesson is the one FULL_AUDIT_METHOD 2.3 already records in a different
// costume: an instruction constrains the agent, not the side effects of the
// software it invokes. A module that DOES something on import is that hazard
// in library form, and the fix is a path guarantee rather than a convention
// about who may import what.
const IS_ENTRY = process.argv[1]
  && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)

if (!IS_ENTRY) {
  // Imported as a library. Export surface only, no side effects, no exit.
} else {

const argv = process.argv.slice(2)

if (argv.includes('--self-test')) {
  console.log('DOC CURRENCY GATE, seeded self-test, convention (p)\n')
  selfTest()
  process.exit(0)
}

const { findings, docs, unresolvable } = scanTree(REPO_ROOT)

if (argv.includes('--freeze')) {
  const n = writeBaseline(findings)
  console.log(`DOC CURRENCY GATE: froze ${n} finding(s) from ${findings.length} occurrence(s) into`)
  console.log(`  scripts/qa/doc_currency_baseline.json`)
  process.exit(0)
}

const byClass = {}
for (const f of findings) byClass[f.cls] = (byClass[f.cls] || 0) + 1

if (argv.includes('--report')) {
  for (const f of findings.slice().sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
    console.log(`${f.cls}\t${f.file}:${f.line}\t${f.text}\t${f.detail}`)
  }
  console.log(`\n${findings.length} occurrence(s) across ${docs.length} document(s):`,
    JSON.stringify(byClass))
  process.exit(0)
}

const baseline = loadBaseline()
const liveKeys = new Set(findings.map(keyOf))
const fresh = findings.filter((f) => !baseline.keys.has(keyOf(f)))
const rusted = baseline.entries.filter((e) => !liveKeys.has(`${e.cls}\u0000${e.file}\u0000${e.text}`))

console.log(`DOC CURRENCY GATE: ${docs.length} document(s) scanned, `
  + `${findings.length} occurrence(s), ${baseline.entries.length} frozen, ${fresh.length} new`)
console.log(`  by class: ${JSON.stringify(byClass)}`)
console.log(`  ${unresolvable.length} reference(s) into gitignored trees, reported not judged`)

if (fresh.length) {
  console.error('\nDOC CURRENCY GATE: FAIL, a document makes a claim that is not true of HEAD')
  for (const f of fresh.slice(0, 60)) {
    console.error(`  ${f.cls}  ${f.file}:${f.line}\n      ${f.text}\n      ${f.detail}`)
  }
  if (fresh.length > 60) console.error(`  ... and ${fresh.length - 60} more`)
  console.error('\nFix the document, or fix the thing it describes. Adding an entry to')
  console.error('scripts/qa/doc_currency_baseline.json to make this green is not a fix: the')
  console.error('baseline is the debt that existed when the gate went live, and it only shrinks.')
}

if (rusted.length) {
  console.error('\nDOC CURRENCY GATE: FAIL, the frozen baseline has rusted')
  for (const e of rusted) console.error(`  ${e.cls}  ${e.file}\n      ${e.text}  (matches nothing now)`)
  console.error('\nThese entries no longer match any finding, which means a fix landed without')
  console.error('its entry being burned. Remove them from the baseline in the same commit as')
  console.error('the fix. A ratchet that can rust is not a ratchet.')
}

if (fresh.length || rusted.length) process.exit(1)
console.log(`\nDOC CURRENCY GATE: PASS (${baseline.entries.length} frozen claim(s) still outstanding)`)

} // end entry point guard
