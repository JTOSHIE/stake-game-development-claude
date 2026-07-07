// scan_wallet_floats.mjs — wallet-path float scan (Wiring Integrity Audit, item c).
//
// CLAUDE.md's "Integer micros rule" is mandatory, zero float tolerance: currency
// maths must route through CURRENCY_SCALE via Math.round/Math.floor, never a raw
// dollar multiplication. The buy-tier billing bug's own audit found exactly one
// live violation of this (App.svelte's handleBuy computed `cost = bet * MODE_COST`
// with no rounding, which then reached gameStore's mock-mode balance subtraction
// as a raw float) - this script is the permanent regression gate for that class
// of bug, not a general-purpose data-flow analyser.
//
// Scope and honest limits: this is a line-level heuristic, not a type-aware
// static analyser. It flags every assignment to a money-shaped variable name
// (cost/price/amount/wager/stake/win/payout/debit/credit) via multiplication
// (`= ... *`) that does not also contain Math.round(/Math.floor( on the SAME
// line. A deliberate exception (e.g. a value that is genuinely display-only and
// never reaches a request/store write) can be allow-listed with a trailing
// `// wallet-scan: ok <reason>` comment - every allowlist entry is printed in
// the report so an allowlist cannot silently grow without review.
//
// Run: node scripts/scan_wallet_floats.mjs (from frontend/)
// Exits non-zero if any unreviewed violation is found (CI-ready).

import { readFileSync, globSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = join(__dirname, '..', 'src')

const MONEY_NAME = /\b(cost|price|amount|wager|stake|win|payout|debit|credit)\w*\s*=(?!=)/i
const HAS_MULTIPLY = /\*/
const HAS_ROUNDING = /Math\.(round|floor)\s*\(/
const ALLOWLIST_MARKER = /\/\/\s*wallet-scan:\s*ok\b/
const IS_COMMENT_LINE = /^\s*(\/\/|\*|\/\*)/

// Locked files (CLAUDE.md: rgsService.ts, gameStore.ts) are out of scope for
// this scanner - a finding there cannot be remediated (fixed, or annotated
// with an allowlist comment) without an owner-sanctioned lock exception, so a
// permanent CI gate must not fail against code this repo isn't allowed to
// touch. Any such finding is reviewed manually and called out in the audit
// report instead; see reports/qa/wiring_integrity_audit_2026-07-07.md.
const LOCKED_PATHS = ['lib/services/rgsService.ts', 'lib/stores/gameStore.ts']

function listSourceFiles(dir) {
  // Plain recursive walk (no glob dependency beyond node:fs's own globSync,
  // available in current Node) - scoped to .ts/.svelte, skips node_modules/dist.
  const out = []
  const entries = globSync(join(dir, '**', '*.{ts,svelte}'), { withFileTypes: false })
  for (const p of entries) {
    if (p.includes('node_modules') || p.includes('/dist/') || p.endsWith('.test.ts') || p.endsWith('.determinism.test.ts')) continue
    if (LOCKED_PATHS.some((locked) => p.endsWith(locked))) continue
    out.push(p)
  }
  return out.sort()
}

function scanFile(path) {
  const text = readFileSync(path, 'utf8')
  const lines = text.split('\n')
  const violations = []
  const allowlisted = []
  lines.forEach((line, i) => {
    if (IS_COMMENT_LINE.test(line)) return
    if (!MONEY_NAME.test(line) || !HAS_MULTIPLY.test(line)) return
    const rounded = HAS_ROUNDING.test(line)
    const allowlisted_ = ALLOWLIST_MARKER.test(line)
    if (rounded) return
    if (allowlisted_) {
      allowlisted.push({ path, line: i + 1, text: line.trim() })
      return
    }
    violations.push({ path, line: i + 1, text: line.trim() })
  })
  return { violations, allowlisted }
}

function main() {
  const files = listSourceFiles(SRC_DIR)
  let allViolations = []
  let allAllowlisted = []
  for (const f of files) {
    const { violations, allowlisted } = scanFile(f)
    allViolations = allViolations.concat(violations)
    allAllowlisted = allAllowlisted.concat(allowlisted)
  }

  console.log(`Wallet-path float scan: ${files.length} files scanned.`)
  console.log('')

  if (allAllowlisted.length) {
    console.log(`=== ALLOWLISTED (${allAllowlisted.length}) - reviewed, marked "wallet-scan: ok" ===`)
    for (const a of allAllowlisted) {
      console.log(`  ${a.path.replace(SRC_DIR, 'src')}:${a.line}  ${a.text}`)
    }
    console.log('')
  }

  if (allViolations.length) {
    console.log(`=== VIOLATIONS (${allViolations.length}) - money-named variable multiplied without Math.round/floor on the same line ===`)
    for (const v of allViolations) {
      console.log(`  ${v.path.replace(SRC_DIR, 'src')}:${v.line}  ${v.text}`)
    }
    console.log('')
    console.log('WALLET FLOAT SCAN: FAIL')
    process.exitCode = 1
    return
  }

  console.log('WALLET FLOAT SCAN: PASS (no unreviewed raw-float currency multiplication found)')
}

main()
