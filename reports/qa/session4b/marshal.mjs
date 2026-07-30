// Marshal Wave A plus Session 3's JOB 4 into ONE disposition per finding, for
// all 118. Every row gets FIXED, PARKED or STRUCK. "Minor" is not a disposition.
import { readFileSync, writeFileSync } from 'node:fs'

const LEDGER = 'reports/qa/session3/UPHELD_118.tsv'
const JOB4 = 'reports/qa/session3/JOB4_CAUSE_REDERIVATION.md'
const WAVE_A = process.argv[2]

// Fixes actually applied and re-proven by this session. A row enters this map
// only when the fix is APPLIED, GATED and RE-PROVEN, per the brief: a fix
// without its re-proof does not count.
const FIXED = {
  'S2-C020': 'Q-26 swept, 6 instances in prose.ts. Gate multiplication_sign_gate.mjs (seeded). '
    + 'Re-proof reports/qa/session4b/social_string_conformance_2026-07-30_q26_reproof.json. Commit fec8d61',
  'S2-C021': 'Q-26 swept, 45 instances in prose.locales.ts, enumeration completed at 51 before the fix. '
    + 'Gate multiplication_sign_gate.mjs (seeded). Re-proof as S2-C020. Commit fec8d61',
}

const rows = readFileSync(LEDGER, 'utf-8').split('\n').slice(1)
  .filter((l) => l.startsWith('S2-C'))
  .map((l) => { const f = l.split('\t'); return { id: f[0], sev: f[1], family: f[2], disposition: f[3], path: f[5] } })

// Session 3's 27, read from its own disposition table rather than restated.
const job4 = {}
for (const line of readFileSync(JOB4, 'utf-8').split('\n')) {
  const m = line.match(/^\|\s*(S2-C\d+)\s*\|\s*(\w+)\s*\|\s*\*\*(\w+)\*\*\s*\|\s*(\w+)\s*\|\s*(\w+)\s*\|/)
  if (m) job4[m[1]] = { verdict: m[3], symptom: m[4], fixSize: m[5] }
}

const waveA = {}
for (const f of JSON.parse(readFileSync(WAVE_A, 'utf-8'))) waveA[f.id] = f

const out = []
for (const r of rows) {
  const w = waveA[r.id]
  const j = job4[r.id]
  const src = w ? `wave-a:${w.squad}` : (j ? 'session3:JOB4' : 'NONE')
  const symptom = w ? w.symptom_real_at_head : (j ? j.symptom : 'UNKNOWN')
  const fixSize = w ? w.fix_size : (j ? j.fixSize : 'UNKNOWN')
  const locked = w && w.needs_locked_path && !/^NO/i.test(w.needs_locked_path) ? w.needs_locked_path : ''

  let disposition, why
  if (FIXED[r.id]) {
    disposition = 'FIXED'; why = FIXED[r.id]
  } else if (src === 'NONE') {
    disposition = 'PARKED'; why = 'NO CAUSE DERIVED BY ANY SESSION. Not eligible for a fix under this brief.'
  } else if (symptom === 'NO') {
    disposition = 'STRUCK'; why = `symptom is NOT real at HEAD; re-derivation (${src}) refuted it`
  } else if (locked) {
    disposition = 'PARKED'; why = `SANCTION REQUEST: the fix requires EDITING the locked path ${locked}`
  } else if (fixSize === 'PARK') {
    disposition = 'PARKED'; why = `owner decision required; re-derivation (${src}) returned PARK`
  } else if (fixSize === 'LARGER_THAN_SMALL') {
    disposition = 'PARKED'; why = `LARGER THAN SMALL; needs its own surgical brief per protocol rule 6`
  } else if (fixSize === 'NO_FIX_NEEDED') {
    disposition = 'STRUCK'; why = `re-derivation (${src}) found nothing to fix; symptom ${symptom}`
  } else {
    disposition = 'PARKED'
    why = `CAUSE DERIVED (${src}), fix specified as ${fixSize}, NOT APPLIED: this session's fix batch closed after MID-01`
  }

  out.push({ ...r, src, symptom, fixSize, locked, disposition, why,
    derived: w ? (w.derived_cause || '') : '', fixLoc: w ? (w.fix_location || '') : '',
    proposed: w ? (w.proposed_fix || '') : '', risk: w ? (w.regression_risk || '') : '' })
}

const tally = (k) => out.reduce((m, r) => (m[r[k]] = (m[r[k]] || 0) + 1, m), {})
console.log('rows:', out.length)
console.log('disposition:', JSON.stringify(tally('disposition')))
console.log('source     :', JSON.stringify(tally('src')))
console.log('symptom    :', JSON.stringify(tally('symptom')))

writeFileSync('reports/qa/session4b/DISPOSITIONS.tsv',
  'id\tsev\tdisposition\twhy\tsource\tsymptom_at_head\tfix_size\tfix_location\tlocked_path\n'
  + out.map((r) => [r.id, r.sev, r.disposition, r.why, r.src, r.symptom, r.fixSize,
      (r.fixLoc || '').replace(/\s+/g, ' '), r.locked].join('\t')).join('\n') + '\n')

writeFileSync('reports/qa/session4b/waveA_raw.json', JSON.stringify(out, null, 1) + '\n')
console.log('wrote DISPOSITIONS.tsv and waveA_raw.json')
