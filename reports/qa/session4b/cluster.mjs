// JOB 1: cluster the 118 across ALL severity tiers, then filter by severity.
// Per AGENT_BUDGET_AND_SCHEDULING.md 4.4: this is grep-level clustering and its
// corroboration counts are HYPOTHESES, not evidence.
import { readFileSync } from 'node:fs'

const LOCKED = [
  'frontend/src/lib/services/rgsService.ts',
  'frontend/src/lib/stores/gameStore.ts',
  'games/future_spinner/',
  '.claude/settings.json',
]

const rows = readFileSync(process.argv[2], 'utf-8').split('\n').slice(1)
  .filter((l) => l.startsWith('S2-C'))
  .map((l) => {
    const [cluster, sev, family, disposition, file, path, finding] = l.split('\t')
    return { cluster, sev, family, disposition, file, path, finding }
  })

// Primary file = first path-looking token in the path column.
const fileRe = /([A-Za-z0-9_.\-/]+\.(svelte|ts|css|mjs|json|md|yml|py|png|jpg|txt|tsv))/
function primary(r) {
  const m = (r.path || '').match(fileRe)
  return m ? m[1] : '(no file)'
}
// Does the row cite a locked path anywhere in its path column?
function citesLocked(r) {
  return LOCKED.filter((L) => (r.path || '').includes(L))
}
// Is the row FILED at a locked path (primary file is locked)?
function filedLocked(r) {
  const p = primary(r)
  return LOCKED.some((L) => p === L || p.startsWith(L))
}

// SURFACE = the coherent unit a squad can own. Derived from the primary file.
function surface(r) {
  const p = primary(r)
  if (/replayService\.ts|ReplayMode\.svelte|REPLAY_TEST_EVENTS\.md|replayRounds/.test(p)) return 'A-REPLAY'
  if (/currency\.ts/.test(p)) return 'B-CURRENCY'
  if (/prose\.ts|prose\.locales\.ts/.test(p)) return 'C-PROSE-I18N'
  if (/app\.css/.test(p)) return 'D-APP-CSS'
  if (/HudOverlay\.svelte|WinBanner\.svelte/.test(p)) return 'E-HUD-BANNER'
  if (/PaytableModal\.svelte/.test(p)) return 'F-PAYTABLE'
  if (/fsModes\.ts/.test(p)) return 'G-MODES-COST'
  if (/betLadder\.ts|gameStore\.ts|rgsService\.ts/.test(p)) return 'H-BET-LADDER-RGS'
  if (/GameGrid\.svelte/.test(p)) return 'I-GRID-GEOMETRY'
  if (/App\.svelte|main\.ts|vite\.config\.ts|package\.json|checks\.yml|publish-stake-engine\.yml/.test(p)) return 'J-APP-BUILD-CI'
  if (/kit_build\.mjs|tile_master_ingest\.mjs|tile_delivery_build\.mjs|dist_hygiene_gate\.mjs/.test(p)) return 'K-KIT-BUILD'
  if (/design-system\/|hero_icon|FutureSpinner-|WeRollSpinners-/.test(p)) return 'L-BRAND-ASSETS'
  if (/SUBMISSION_DOSSIER\.md/.test(p)) return 'M-DOSSIER'
  if (/COMPLIANCE_WATCH\.md/.test(p)) return 'N-COMPLIANCE-WATCH'
  if (/WRS_MASTER_DOCUMENT\.md|OWNER_CHECKLIST\.md/.test(p)) return 'O-MASTER-OWNER'
  if (/BOOKS_MANIFEST\.md|math_selfaudit|validate_math/.test(p)) return 'Q-BOOKS-MATH'
  if (/reports\/qa\/|reports\/SESSION_REPORT\.md/.test(p)) return 'P-QA-ARTEFACTS'
  return 'R-OTHER-DOCS'
}

const bySurface = new Map()
for (const r of rows) {
  const s = surface(r)
  if (!bySurface.has(s)) bySurface.set(s, [])
  bySurface.get(s).push(r)
}

const CODE = /^frontend\/src\//
let totalCheck = 0
console.log('SURFACE\tROWS\tSTREAM\tHIGH\tMED\tLOW\tUPHELD\tCAUSE_UNSOUND\tENUM_INCOMPLETE\tCODE_ROWS\tFILED_LOCKED\tCITES_LOCKED')
for (const [s, rs] of [...bySurface].sort()) {
  totalCheck += rs.length
  const c = (f) => rs.filter(f).length
  console.log([
    s, rs.length,
    c((r) => r.sev === 'STREAM'), c((r) => r.sev === 'HIGH'),
    c((r) => r.sev === 'MEDIUM'), c((r) => r.sev === 'LOW'),
    c((r) => r.disposition === 'UPHELD'),
    c((r) => /CAUSE UNSOUND/.test(r.disposition)),
    c((r) => /ENUMERATION INCOMPLETE/.test(r.disposition)),
    c((r) => CODE.test(primary(r))),
    c(filedLocked),
    c((r) => citesLocked(r).length > 0),
  ].join('\t'))
}
console.log(`TOTAL\t${totalCheck}`)

console.log('\n=== ROWS FILED AT A LOCKED PATH ===')
for (const r of rows.filter(filedLocked)) console.log(`${r.cluster}\t${r.sev}\t${r.disposition}\t${primary(r)}`)

console.log('\n=== ROWS CITING A LOCKED PATH BUT FILED ELSEWHERE ===')
for (const r of rows.filter((r) => !filedLocked(r) && citesLocked(r).length)) {
  console.log(`${r.cluster}\t${r.sev}\t${r.disposition}\tfiled=${primary(r)}\tcites=${citesLocked(r).join(',')}`)
}

console.log('\n=== CODE-FIXABLE SET (frontend/src, not filed at a locked path) ===')
const fixable = rows.filter((r) => CODE.test(primary(r)) && !filedLocked(r))
console.log(`count=${fixable.length}`)
const byFile = new Map()
for (const r of fixable) {
  const p = primary(r)
  if (!byFile.has(p)) byFile.set(p, [])
  byFile.get(p).push(`${r.cluster}(${r.sev[0]})`)
}
for (const [f, ids] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${String(ids.length).padStart(2)}  ${f}\t${ids.join(' ')}`)
}

console.log('\n=== PER-SURFACE ROW IDS (the squad manifest) ===')
for (const [s, rs] of [...bySurface].sort()) {
  console.log(`${s}\t${rs.map((r) => r.cluster).join(' ')}`)
}
