// player_string_dash_check.mjs - R9 (2026-07-27).
//
// Convention (a) forbids em dashes and en dashes "anywhere in any output".
// Committed documents are reviewed by humans; PLAYER-FACING STRINGS are not, and
// they are the ones that reach a reviewer's screen. This gate makes the rule
// machine-enforced for the i18n tree, which held 35 dash instances inside string
// literals before this pass.
//
// Static, no browser, no dev server: safe for CI.
//
// Scope note: only STRING LITERALS are checked. Dashes inside source comments are
// left alone deliberately, since comments are engineering prose and never render.
//
// Run (from frontend/): node scripts/player_string_dash_check.mjs

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')

// The i18n tree is the authority for player-facing copy. fsModes carries the
// mode labels and blurbs, which are equally player-facing.
//
// WIDENED 2026-07-26, from the owner's first live portal session. This list was
// exactly the two files below, and the convention it enforces says "no em
// dashes or en dashes anywhere". Two em dashes were therefore sitting in
// PaytableModal.svelte's prose and rendering to the player on the real
// platform, in a gate that reported PASS while scanning two files.
//
// That is the same shape as the social conformance script round-two reviewer 3
// dismantled: a gate whose name implies broad coverage while its scope is a
// couple of hand-listed files. Every component is now scanned, because every
// component can carry a hardcoded player-facing string, which is precisely how
// these two got there.
const FILES = [
  'src/lib/i18n/translations.ts',
  'src/lib/config/fsModes.ts',
  ...readdirSync(join(ROOT, 'src/lib/components'))
    .filter((f) => f.endsWith('.svelte'))
    .map((f) => `src/lib/components/${f}`),
]

const EM = '—'
const EN = '–'

const findings = []

for (const rel of FILES) {
  const path = join(ROOT, rel)
  const src = readFileSync(path, 'utf-8')
  const lines = src.split('\n')

  lines.forEach((line, i) => {
    // Skip whole-line comments outright.
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return

    // Strip any trailing line comment so a dash in a comment on a code line is
    // not reported. Naive but adequate: these files use simple `//` comments.
    const codePart = line.split('//')[0]

    // Only look inside single-quoted string literals.
    const literals = codePart.match(/'([^'\\]|\\.)*'/g) || []
    for (const lit of literals) {
      if (lit.includes(EM) || lit.includes(EN)) {
        findings.push({
          file: relative(ROOT, path),
          line: i + 1,
          text: lit.length > 90 ? `${lit.slice(0, 90)}...` : lit,
        })
      }
    }
  })
}

console.log(`PLAYER STRING DASH CHECK: scanned ${FILES.length} files`)

if (findings.length) {
  console.error(`\nFAIL: ${findings.length} player-facing string(s) contain an em dash or en dash`)
  for (const f of findings) console.error(`  ${f.file}:${f.line}  ${f.text}`)
  console.error('\nConvention (a): use a comma, a colon, or a plain hyphen instead.')
  process.exit(1)
}

console.log('PLAYER STRING DASH CHECK: PASS (no em or en dashes in player-facing strings)')
