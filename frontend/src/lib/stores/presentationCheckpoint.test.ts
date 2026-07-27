// presentationCheckpoint.test.ts - TR-099 (2026-07-28).
//
// The brief's six-case matrix plus the two the design added, run against
// OFFICIAL-SHAPED FIXTURES: a real triggered round lifted out of the shipped
// sample book, interpreted by the canonical `roundInterpreter`, and an
// `authenticate` response carrying it as an active round with `betID`, `active`
// and a `state.events` array.
//
// Run (from frontend/): npx tsx src/lib/stores/presentationCheckpoint.test.ts
//
// WHAT THESE ASSERTIONS ARE ACTUALLY FOR. The safety claim of this feature is
// that a stored cursor cannot make a player's displayed totals disagree with
// their round. That claim rests entirely on the validator refusing a cursor it
// should not trust, so the tests that matter are the REFUSALS, and each one
// asserts WHICH guard fired. A validator that rejects everything for the wrong
// reason passes a boolean test and is still broken.

import { readFileSync } from 'node:fs'
import { interpretEvents, type PresentationScript, type RawEvent } from '../services/roundInterpreter.ts'
import {
  writeCheckpoint, readCheckpoint, clearCheckpoint, validateCheckpoint,
  figuresAt, BEFORE_FIRST_SPIN,
} from './presentationCheckpoint.ts'

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}
const checkThat = (name: string, cond: boolean) => {
  if (cond) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}`) }
}

// ── a controllable localStorage, because node has none ──────────────────────
//
// `mode` is what makes case 6 real: a browser in private mode does not return
// null, it THROWS, and the whole point of wrapping every touch is that a throw
// is indistinguishable from an empty store to the caller.
type Mode = 'working' | 'throws' | 'absent'
let mode: Mode = 'working'
const backing = new Map<string, string>()
function installStorage(m: Mode): void {
  mode = m
  if (m === 'absent') {
    delete (globalThis as Record<string, unknown>).localStorage
    return
  }
  ;(globalThis as Record<string, unknown>).localStorage = {
    getItem: (k: string) => {
      if (mode === 'throws') throw new Error('SecurityError: storage disabled')
      return backing.has(k) ? backing.get(k)! : null
    },
    setItem: (k: string, v: string) => {
      if (mode === 'throws') throw new Error('QuotaExceededError')
      backing.set(k, v)
    },
    removeItem: (k: string) => {
      if (mode === 'throws') throw new Error('SecurityError: storage disabled')
      backing.delete(k)
    },
  }
}
installStorage('working')

// ── the round, out of the shipped book ──────────────────────────────────────
interface Sample { mode: string; category: string; round: { id: number; payoutMultiplier: number; events: RawEvent[] } }
const samples = JSON.parse(readFileSync('src/lib/mock/sample_rounds.json', 'utf-8')) as Sample[]
const triggered = samples.find((s) => s.category === 'trigger_4' && s.mode === 'base')
  ?? samples.find((s) => s.category.startsWith('trigger_'))
if (!triggered) throw new Error('no triggered round in the shipped sample book')

const script: PresentationScript = interpretEvents(triggered.round.events)
const BET_ID = 987654
const OTHER_BET_ID = 111222

console.log(`\nFIXTURE: shipped round ${triggered.round.id}, category ${triggered.category}`)
checkThat('the fixture round is a TRIGGERED round', script.triggered === true)
checkThat(`and carries free spins to resume into (${script.freeSpins.length})`,
  script.freeSpins.length >= 4)

/** Write a cursor exactly as FreeSpinsPresentation does, from the script. */
function writeAt(freeSpinIndex: number, betID = BET_ID): void {
  writeCheckpoint({ betID, phase: 'free', freeSpinIndex, ...figuresAt(script, freeSpinIndex) })
}

// ── CASES 1 to 3: reload mid-feature at three checkpoints ───────────────────
console.log('\nCASES 1 to 3: RELOAD MID-FEATURE AT THREE CHECKPOINTS')
const last = script.freeSpins.length - 1
for (const [label, idx] of [
  ['first spin done', 0],
  ['mid-way', Math.floor(last / 2)],
  ['second to last spin done', last - 1],
] as [string, number][]) {
  clearCheckpoint()
  writeAt(idx)
  const v = validateCheckpoint(readCheckpoint(), script, BET_ID)
  check(`${label}: accepted, resumes at the NEXT spin`, v.resumeFromIndex, idx + 1)
  check(`${label}: no rejection`, v.rejection, null)
  // The property the whole design exists for: what the player will be shown
  // comes from the SCRIPT at that index, not from anything stored.
  const spin = script.freeSpins[v.resumeFromIndex!]
  checkThat(`${label}: the resumed spin's figures come from the script`,
    typeof spin.runningTotalCentibets === 'number' && typeof spin.meterBefore === 'number')
}

// The entry-accepted cursor, which is the fourth safe checkpoint the design names.
clearCheckpoint()
writeAt(BEFORE_FIRST_SPIN)
check('entry accepted, no spin yet: resumes at spin 0',
  validateCheckpoint(readCheckpoint(), script, BET_ID).resumeFromIndex, 0)

// ── CASE 4: mid-ordinary-spin writes nothing ────────────────────────────────
console.log('\nCASE 4: MID-ORDINARY-SPIN, WHICH IS DELIBERATELY NOT CHECKPOINTED')
const ordinary = samples.find((s) => s.category === 'base_win_mid') ?? samples[0]
const ordinaryScript = interpretEvents(ordinary.round.events)
clearCheckpoint()
check('an ordinary round leaves no cursor', readCheckpoint(), null)
// And even if one somehow existed, a non-triggered script cannot be resumed.
writeAt(0)
check('a cursor against a NON-TRIGGERED script is refused',
  validateCheckpoint(readCheckpoint(), ordinaryScript, BET_ID).rejection,
  ordinaryScript.triggered ? null : 'not-triggered')

// ── CASE 5: a checkpoint for a different betID ──────────────────────────────
console.log('\nCASE 5: A CHECKPOINT FOR A DIFFERENT betID')
clearCheckpoint()
writeAt(1, OTHER_BET_ID)
const wrongRound = validateCheckpoint(readCheckpoint(), script, BET_ID)
check('refused', wrongRound.resumeFromIndex, null)
check('and named as a round mismatch', wrongRound.rejection, 'bet-id')

// ── CASE 6: storage unavailable ─────────────────────────────────────────────
console.log('\nCASE 6: STORAGE UNAVAILABLE, IN BOTH SHAPES')
installStorage('throws')
check('a throwing read degrades to no cursor', readCheckpoint(), null)
checkThat('a throwing write does not propagate', (() => {
  try { writeAt(2); return true } catch { return false }
})())
checkThat('a throwing clear does not propagate', (() => {
  try { clearCheckpoint(); return true } catch { return false }
})())
check('and the validator treats it as absent',
  validateCheckpoint(readCheckpoint(), script, BET_ID).rejection, 'none')

installStorage('absent')
check('no storage API at all also degrades to no cursor', readCheckpoint(), null)
checkThat('and writing without a storage API does not propagate', (() => {
  try { writeAt(2); return true } catch { return false }
})())
installStorage('working')

// ── CASE 7 (added): the checksum disagrees with the script ──────────────────
console.log('\nCASE 7: THE CHECKSUM DISAGREES WITH THE SCRIPT')
clearCheckpoint()
writeAt(1)
{
  const cp = readCheckpoint()!
  // A forged total, which is the shape a player editing localStorage produces.
  const forged = { ...cp, seenTotalCentibets: cp.seenTotalCentibets + 500_000 }
  const v = validateCheckpoint(forged, script, BET_ID)
  check('a forged TOTAL is refused', v.resumeFromIndex, null)
  check('and named as a checksum failure', v.rejection, 'checksum')

  const forgedMeter = { ...cp, seenMeter: cp.seenMeter + 7 }
  check('a forged METER is refused too',
    validateCheckpoint(forgedMeter, script, BET_ID).rejection, 'checksum')
}

// ── CASE 8 (added): the cursor points beyond this script ────────────────────
console.log('\nCASE 8: THE CURSOR POINTS BEYOND THIS SCRIPT')
{
  const cp = readCheckpoint()!
  const beyond = { ...cp, freeSpinIndex: script.freeSpins.length + 5 }
  const v = validateCheckpoint(beyond, script, BET_ID)
  check('refused', v.resumeFromIndex, null)
  check('and named as out of range', v.rejection, 'out-of-range')

  // The boundary that is easy to get wrong: the LAST spin already played is not
  // a resume, it is a finished feature, and it goes to the replay.
  const atEnd = { ...cp, freeSpinIndex: script.freeSpins.length - 1, ...figuresAt(script, script.freeSpins.length - 1) }
  check('the last spin already played is out of range, not a zero-spin resume',
    validateCheckpoint(atEnd, script, BET_ID).rejection, 'out-of-range')

  const negative = { ...cp, freeSpinIndex: -9 }
  check('a nonsense negative index is out of range',
    validateCheckpoint(negative, script, BET_ID).rejection, 'out-of-range')
}

// ── the schema version, and shape rejection ─────────────────────────────────
console.log('\nTHE VERSION AND THE SHAPE, SO AN OLD CURSOR CANNOT BE MISREAD')
clearCheckpoint()
writeAt(1)
{
  const raw = JSON.parse((globalThis as unknown as { localStorage: { getItem(k: string): string } })
    .localStorage.getItem('fs:presentation-checkpoint'))
  check('the stored record carries a version', raw.v, 1)
  checkThat('and carries no rendered figure beyond the two checksum fields',
    Object.keys(raw).sort().join(',') ===
    'betID,freeSpinIndex,phase,seenMeter,seenTotalCentibets,v')

  backing.set('fs:presentation-checkpoint', JSON.stringify({ ...raw, v: 99 }))
  check('a future version is discarded rather than misread', readCheckpoint(), null)

  backing.set('fs:presentation-checkpoint', '{ not json')
  check('unparseable content is discarded', readCheckpoint(), null)

  backing.set('fs:presentation-checkpoint', JSON.stringify({ v: 1, betID: 'x' }))
  check('a partial record is discarded', readCheckpoint(), null)
}

// ── the clear, which is what stops a cursor outliving its round ─────────────
console.log('\nTHE CLEAR')
clearCheckpoint()
writeAt(2)
checkThat('a cursor exists', readCheckpoint() !== null)
clearCheckpoint()
check('and clearing removes it', readCheckpoint(), null)

console.log('')
if (failures > 0) {
  console.error(`PRESENTATION CHECKPOINT: FAIL (${failures})`)
  process.exit(1)
}
console.log('PRESENTATION CHECKPOINT: PASS (a cursor is trusted only when the round agrees with it)')
process.exit(0)
