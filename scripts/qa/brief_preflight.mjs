#!/usr/bin/env node
//
// brief_preflight.mjs: check a DRAFT work order before it is issued.
//
// WHY THIS EXISTS, and it is a confession rather than a design note
// ------------------------------------------------------------------
// Briefs are the one document class deliberately EXCLUDED from
// doc_currency_gate.mjs, because convention (f) says a brief is saved verbatim
// and is never tidied or corrected: it is the evidence for every claim its
// session makes. That exclusion is right.
//
// The implication was missed by the person who wrote the exclusion. **A
// document that can never be corrected afterwards is precisely the one that
// must be checked BEFORE it lands.** So this runs on a DRAFT, on the way out,
// and never on a committed brief.
//
// It was built after four false claims reached work orders in a single arc,
// all authored by the Head of Engineering, all of the same shape: a SECONDARY
// source treated as a primary one.
//
//   1. A stale line in COMPLIANCE_WATCH.md was read and cited as evidence that
//      a page was not mirrored. It was mirrored 34 minutes after that line was
//      written. **A document is a claim, not evidence.**
//   2. `census.mjs` was cited as the tool a previous session used. It was
//      written to scratch and never committed. **A narration is not a
//      repository.**
//   3. "36 currency codes" was stated after seven rows were spot-checked. The
//      capture published 49. **A sample is not a count.**
//   4. A baseline header read 334/51 against a body of 333/50. **Unchecked
//      arithmetic is not arithmetic.**
//
// Three of those four are mechanically catchable and are caught here. The
// fourth, the sample presented as a count, is caught by requiring a figure to
// carry the COMMAND that produced it rather than a citation to a document.
//
// WHAT IT CHECKS
// --------------
//   DEAD_PATH        a backticked path in the brief does not exist at HEAD
//   STALE_LINE       a `file:line` citation resolves to a file too short, or gone
//   FALSE_ABSENCE    the brief asserts something is missing, and it is present
//   BARE_VERIFIED    a premise tagged VERIFIED carries no method and no command
//   THIN_HEADER      the header rule 14 and rule 15 require is incomplete
//
// WHAT IT DELIBERATELY DOES NOT CHECK, per FULL_AUDIT_METHOD 2.6, because a
// parked class is only honestly parked if its enumeration is honest:
//   - Whether the PROSE around a citation is true. Same blind spot the currency
//     gate records at DOC_CURRENCY_GATE_SPEC.md section 8.
//   - Whether a JUDGEMENT is sound. "Larger than small" was wrong for a one-line
//     fix and no script would have known.
//   - Whether the brief's PLAN is good. This checks facts, never strategy.
//
// Run:
//   node scripts/qa/brief_preflight.mjs <draft.md>     check a draft
//   node scripts/qa/brief_preflight.mjs --self-test    convention (p)
//
import { readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import {
  scanTree, resolvePath, looksLikePath, inlineSpans, readableLines,
} from './doc_currency_gate.mjs'

const REPO_ROOT = resolve(new URL('../..', import.meta.url).pathname)

// A premise line tagged VERIFIED must show HOW. Either a backticked command or
// path, or a named method. Citing another DOCUMENT is explicitly not enough:
// that is failure 1 above, and it is the one that actually reached a session.
const METHOD_RE = /`[^`]+`|\bby (direct read|recount|measurement|running|git|grep|counting)\b|\bgit \w+|\bgrep\b|\bwc -l\b|\bls\b/i
const VERIFIED_RE = /\*\*VERIFIED\b[^*]*\*\*/i

// Claims of absence. If a brief says a thing is missing, the thing had better
// be missing, because a work order built on a false absence sends a session
// looking for something that is already there.
// `never committed` was here and was REMOVED on the first real run, which
// flagged `.claude/settings.json` in the currency brief. That line reads
// "temporarily and NEVER committed", meaning the EDIT is never committed, not
// the file. The phrase describes an action in one reading and a file state in
// the other, and a script cannot tell them apart. Dropping it costs nothing:
// a brief citing a file that was never committed is already caught as
// DEAD_PATH, which is the stronger signal anyway.
//
// Third gate in this project whose first real run corrected it, exactly as
// FULL_AUDIT_METHOD 3.2 predicts. Fixed structurally rather than allowlisted.
const ABSENCE_RE = /\b(not yet mirrored|does not exist|no longer exists?|was deleted|is missing|is absent|does not currently exist|exists nowhere)\b/i

const REQUIRED_HEADER = [
  { key: 'BUDGET', re: /\bBUDGET\s*:/ },
  { key: 'STOP LINES', re: /\bSTOP LINES?\s*:/i },
  { key: 'DEGRADATION ORDER', re: /\bDEGRADATION ORDER\s*:/i },
  { key: 'DONE MEANS', re: /\bDONE MEANS\s*:/i },
]

function fenceMask(lines) {
  // Fenced blocks hold shell commands and sample markdown. Resolving paths out
  // of them is a false-positive machine; the currency gate learned this too.
  const masked = new Set()
  let inFence = false
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; masked.add(i); return }
    if (inFence) masked.add(i)
  })
  return masked
}

function countLines(ctx, file) {
  try {
    const src = readFileSync(join(ctx.root, file), 'utf-8')
    const n = src.split('\n').length
    ctx.lineCounts.set(file, n)
    return n
  } catch { return undefined }
}

export function checkBrief(src, ctx, file = 'DRAFT') {
  const findings = []
  const lines = readableLines(src)
  const masked = fenceMask(lines)

  lines.forEach((line, i) => {
    const n = i + 1
    if (masked.has(i)) return

    // NEGATION AWARENESS. A line that ASSERTS an absence is judged the opposite
    // way round: a path that is gone confirms the claim, and a path that exists
    // refutes it. Without this a brief correctly reporting a dead file is
    // flagged for mentioning it, which is the blind spot the currency gate
    // records at DOC_CURRENCY_GATE_SPEC.md section 8.
    const claimsAbsence = ABSENCE_RE.test(line)

    for (const span of inlineSpans(line)) {
      const t = span.text

      // file:line, and file:start-end
      const cite = t.match(/^([^\s:]+\.[A-Za-z0-9]+):(\d+)(?:-(\d+))?$/)
      if (cite) {
        const hit = resolvePath(cite[1], ctx, null)
        if (!hit.exists) {
          if (!claimsAbsence) findings.push({ cls: 'STALE_LINE', line: n, text: t, why: 'file does not exist at HEAD' })
          continue
        }
        if (!hit.unique) continue
        const count = ctx.lineCounts.get(hit.unique) ?? countLines(ctx, hit.unique)
        const want = Number(cite[3] || cite[2])
        if (count !== undefined && want > count) {
          findings.push({ cls: 'STALE_LINE', line: n, text: t, why: `${hit.unique} has ${count} lines, cited ${want}` })
        }
        continue
      }

      if (!looksLikePath(t)) continue
      const hit = resolvePath(t, ctx, null)
      if (claimsAbsence) {
        if (hit.exists) {
          findings.push({
            cls: 'FALSE_ABSENCE', line: n, text: t,
            why: `the brief states an absence, but ${hit.unique || t} EXISTS at HEAD`,
          })
        }
        continue
      }
      if (!hit.exists) {
        findings.push({ cls: 'DEAD_PATH', line: n, text: t, why: 'does not exist at HEAD' })
      }
    }

    // A VERIFIED premise with no method shown.
    if (VERIFIED_RE.test(line) && !METHOD_RE.test(line)) {
      findings.push({
        cls: 'BARE_VERIFIED', line: n, text: line.trim().slice(0, 90),
        why: 'tagged VERIFIED with no command, path or named method. Citing a document is not verification',
      })
    }
  })

  for (const h of REQUIRED_HEADER) {
    if (!h.re.test(src)) {
      findings.push({ cls: 'THIN_HEADER', line: 0, text: h.key, why: 'required by protocol rules 14 and 15 and by _TEMPLATE.md' })
    }
  }
  return findings
}

function report(file, findings) {
  const by = {}
  for (const f of findings) (by[f.cls] ||= []).push(f)
  console.log(`\nBRIEF PREFLIGHT: ${file}`)
  if (!findings.length) {
    console.log('  no findings. The facts check out; the PLAN is still yours to judge.\n')
    console.log('BRIEF PREFLIGHT: PASS')
    return true
  }
  for (const [cls, list] of Object.entries(by)) {
    console.log(`\n  ${cls}  (${list.length})`)
    for (const f of list) console.log(`    ${f.line ? 'line ' + f.line : 'header'}  ${f.text}\n        ${f.why}`)
  }
  console.log(`\nBRIEF PREFLIGHT: FAIL, ${findings.length} finding(s)`)
  console.log('A brief is saved verbatim and never corrected, per convention (f).')
  console.log('Fix the DRAFT now: after it is issued the error is permanent.\n')
  return false
}

// ── convention (p): the four real failures, planted ──────────────────────────
function selfTest() {
  const dir = mkdtempSync(join(tmpdir(), 'brief-preflight-'))
  const git = (a) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' })
  git(['init', '-q'])
  const write = (rel, body) => {
    const full = join(dir, rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, body)
  }
  write('scripts/qa/real_thing.mjs', '// exists\n')
  write('docs/mirror/payments.md', '# payments\n')
  write('short.md', 'one\ntwo\n')
  git(['add', '-A'])
  execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'base'], { cwd: dir, stdio: 'ignore' })
  const { ctx } = scanTree(dir)

  const HEADER = 'BUDGET: 7.0M\nSTOP LINES: none\nDEGRADATION ORDER: a then b\nDONE MEANS: it is done\n'
  let ok = true
  const run = (label, expected, body, cls, bare) => {
    const got = checkBrief((bare ? '' : HEADER) + body, ctx).filter((f) => !cls || f.cls === cls).length
    const good = expected === 0 ? got === 0 : got >= 1
    if (!good) ok = false
    console.log(`  ${good ? 'caught' : 'MISSED'}  ${label}\n           expected ${expected === 0 ? 'none' : 'a finding'}, got ${got}`)
  }

  console.log('\nBRIEF PREFLIGHT SELF-TEST, the four failures that produced it\n')
  run('FAILURE 2  a brief citing a script that was never committed', 1,
    'The tool used was `scripts/qa/census.mjs`, which did the classification.\n', 'DEAD_PATH')
  run('FAILURE 1  a brief asserting an absence about a path that EXISTS', 1,
    'The corpus is missing the payments page: `docs/mirror/payments.md` does not exist.\n', 'FALSE_ABSENCE')
  run('FAILURE 3  a figure tagged VERIFIED with no command behind it', 1,
    '- **VERIFIED**: the table has 36 codes.\n', 'BARE_VERIFIED')
  run('FAILURE 4  a line citation past the end of a real file', 1,
    'See `short.md:97` for the header.\n', 'STALE_LINE')
  run('THIN HEADER  a brief with no stop lines', 1,
    'BUDGET: 7M\nDEGRADATION ORDER: x\nDONE MEANS: y\n', 'THIN_HEADER', true)

  console.log('')
  const controls = [
    ['CONTROL 1  a real path is not flagged', '`scripts/qa/real_thing.mjs` is the tool.\n'],
    ['CONTROL 2  a VERIFIED premise WITH a command passes', '- **VERIFIED 2026-07-30** by direct read, `git ls-files`: 36 codes.\n'],
    ['CONTROL 3  a true absence is not flagged', 'There is no `scripts/qa/nope.mjs` in the tree; it does not exist.\n'],
    ['CONTROL 4  a fenced example is not resolved', '```\nnode scripts/qa/census.mjs --run\n```\n'],
    ['CONTROL 5  a valid line citation passes', 'See `short.md:2`.\n'],
  ]
  for (const [label, body] of controls) run(label, 0, body)

  rmSync(dir, { recursive: true, force: true })
  console.log(`\nBRIEF PREFLIGHT SELF-TEST: ${ok ? 'PASS (every failure caught, every control clean)' : 'FAIL'}`)
  return ok
}

const arg = process.argv[2]
if (arg === '--self-test') {
  process.exit(selfTest() ? 0 : 1)
} else if (!arg) {
  console.error('usage: node scripts/qa/brief_preflight.mjs <draft.md> | --self-test')
  process.exit(2)
} else {
  const { ctx } = scanTree(REPO_ROOT)
  const src = readFileSync(arg, 'utf8')
  process.exit(report(arg, checkBrief(src, ctx, arg)) ? 0 : 1)
}
