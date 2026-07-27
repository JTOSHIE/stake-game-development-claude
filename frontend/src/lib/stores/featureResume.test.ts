// featureResume.test.ts - TR-099 (2026-07-28), the flow rather than the model.
//
// `presentationCheckpoint.test.ts` proves the validator refuses what it should.
// This proves `recoverSession` DOES THE RIGHT THING WITH THAT ANSWER: what gets
// offered, what gets presented, what gets settled, and in which order.
//
// Run (from frontend/): npx tsx src/lib/stores/featureResume.test.ts
//
// Fixtures are official-shaped: an `authenticate` response carrying an active
// round with `betID`, `active: true` and a `state.events` array taken from a
// real triggered round in the shipped sample book.
//
// THE TWO PROPERTIES THAT MATTER MOST, and they are asserted by call ORDER
// rather than by two independent spies that could both be true in any sequence:
//
//   1. The offer is made BEFORE anything is presented. A player cannot be asked
//      whether to skip a presentation that has already started.
//   2. The round is presented BEFORE it is settled, resumed or not. That is the
//      existing guarantee and resume must not weaken it.

import { readFileSync } from 'node:fs'
import { get } from 'svelte/store'
import { recoverSession, resetSessionRecovery } from './sessionRecovery.ts'
import { balance } from './gameStore.ts'
import { interpretEvents, type PresentationScript, type RawEvent } from '../services/roundInterpreter.ts'
import { writeCheckpoint, readCheckpoint, clearCheckpoint, figuresAt } from './presentationCheckpoint.ts'

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}
const checkThat = (name: string, cond: boolean) => {
  if (cond) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}`) }
}

// ── storage ─────────────────────────────────────────────────────────────────
const backing = new Map<string, string>()
let storageThrows = false
;(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => { if (storageThrows) throw new Error('nope'); return backing.get(k) ?? null },
  setItem: (k: string, v: string) => { if (storageThrows) throw new Error('nope'); backing.set(k, v) },
  removeItem: (k: string) => { if (storageThrows) throw new Error('nope'); backing.delete(k) },
}

// ── the round ───────────────────────────────────────────────────────────────
interface Sample { mode: string; category: string; round: { id: number; payoutMultiplier: number; events: RawEvent[] } }
const samples = JSON.parse(readFileSync('src/lib/mock/sample_rounds.json', 'utf-8')) as Sample[]
const triggered = samples.find((s) => s.category.startsWith('trigger_') && s.mode === 'base')!
const ordinary = samples.find((s) => s.category === 'base_win_mid') ?? samples[0]
const script: PresentationScript = interpretEvents(triggered.round.events)
const BET_ID = 4242

// ── the official-shaped platform stub ───────────────────────────────────────
const seq: string[] = []
let activeEvents: RawEvent[] = triggered.round.events
let roundBetID = BET_ID

const platform = {
  parseSessionParams: () => ({ sessionID: 's', rgs_url: 'https://x' }),
  authenticate: async () => ({
    balance: 100, minBet: 0.1, maxBet: 100, stepBet: 0.1, betLevels: [1],
    defaultBetLevel: 1, currency: 'USD',
    round: { betID: roundBetID, active: true, mode: 'base', state: { events: activeEvents } },
    jurisdictionFlags: {
      socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
      disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
      disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
      displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
    },
    jurisdiction: {},
  }),
  endRound: async () => { seq.push('endRound'); return { balance: 777 } },
} as unknown as Parameters<typeof recoverSession>[1]

let presentedResumeIndex: number | null | undefined
const present = async (_s: PresentationScript, resumeFromIndex?: number | null) => {
  seq.push('present')
  presentedResumeIndex = resumeFromIndex ?? null
}

let offered: { playedSpins: number; totalSpins: number } | null = null
const offerAccepting = async (info: { playedSpins: number; totalSpins: number }) => {
  seq.push('offer'); offered = info; return true
}
const offerDeclining = async (info: { playedSpins: number; totalSpins: number }) => {
  seq.push('offer'); offered = info; return false
}

function reset(): void {
  seq.length = 0
  presentedResumeIndex = undefined
  offered = null
  storageThrows = false
  activeEvents = triggered.round.events
  roundBetID = BET_ID
  backing.clear()
  resetSessionRecovery()
  balance.set(0)
}
const writeAt = (i: number, betID = BET_ID) =>
  writeCheckpoint({ betID, phase: 'free', freeSpinIndex: i, ...figuresAt(script, i) })

// ── 1. a valid cursor, offer ACCEPTED ───────────────────────────────────────
console.log('\nA VALID CURSOR, OFFER ACCEPTED')
reset(); writeAt(1)
{
  const out = await recoverSession(false, platform, present, offerAccepting)
  check('the offer came BEFORE the presentation and the settle',
    seq, ['offer', 'present', 'endRound'])
  check('the player was told where they were, one-based on the played count',
    offered, { playedSpins: 2, totalSpins: script.freeSpins.length })
  check('the presentation was handed the resume index', presentedResumeIndex, 2)
  check('the outcome records it', out.kind === 'resumed' ? out.resumedFromIndex : 'not-resumed', 2)
  check('the round still settled', out.kind === 'resumed' ? out.balance : null, 777)
  check('and the balance came from endRound, not from storage', get(balance), 777)
  check('the cursor is cleared once the round is closed', readCheckpoint(), null)
}

// ── 2. a valid cursor, offer DECLINED ───────────────────────────────────────
console.log('\nA VALID CURSOR, OFFER DECLINED: THE WHOLE ROUND PLAYS')
reset(); writeAt(2)
{
  const out = await recoverSession(false, platform, present, offerDeclining)
  check('the offer was still made', seq, ['offer', 'present', 'endRound'])
  check('but nothing was skipped', presentedResumeIndex, null)
  check('the outcome records no resume', out.kind === 'resumed' ? out.resumedFromIndex : 'x', null)
  check('the round settled identically', get(balance), 777)
  check('and the declined cursor is gone', readCheckpoint(), null)
}

// ── 3. no cursor at all: today's flow, and NO offer ─────────────────────────
console.log('\nNO CURSOR: THE EXISTING FLOW, AND THE PLAYER IS NOT ASKED')
reset()
{
  await recoverSession(false, platform, present, offerAccepting)
  check('no offer was made', seq, ['present', 'endRound'])
  check('the whole round played', presentedResumeIndex, null)
  check('and it settled', get(balance), 777)
}

// ── 4. a cursor for a DIFFERENT round ───────────────────────────────────────
console.log('\nA CURSOR FOR A DIFFERENT ROUND')
reset(); writeAt(1, 999999)
{
  const out = await recoverSession(false, platform, present, offerAccepting)
  check('the player is NOT asked about a round they were not in', seq, ['present', 'endRound'])
  check('the whole round played', presentedResumeIndex, null)
  check('the rejection is named', out.kind === 'resumed' ? out.checkpointRejection : 'x', 'bet-id')
  check('and the foreign cursor was cleared rather than left to match later',
    readCheckpoint(), null)
}

// ── 5. a forged cursor ──────────────────────────────────────────────────────
console.log('\nA FORGED CURSOR')
reset(); writeAt(1)
{
  const cp = readCheckpoint()!
  backing.set('fs:presentation-checkpoint',
    JSON.stringify({ ...cp, seenTotalCentibets: cp.seenTotalCentibets + 999_999 }))
  const out = await recoverSession(false, platform, present, offerAccepting)
  check('no offer, no skip', seq, ['present', 'endRound'])
  check('named as a checksum failure', out.kind === 'resumed' ? out.checkpointRejection : 'x', 'checksum')
  check('and the balance is still the platform figure', get(balance), 777)
}

// ── 6. an ORDINARY active round ─────────────────────────────────────────────
console.log('\nAN ORDINARY ACTIVE ROUND KEEPS RESUME-AND-SETTLE, UNCHANGED')
reset(); activeEvents = ordinary.round.events; writeAt(1)
{
  const out = await recoverSession(false, platform, present, offerAccepting)
  check('the player is not offered a feature resume on a base round',
    seq, ['present', 'endRound'])
  check('the round played and settled', get(balance), 777)
  checkThat('the rejection names the round shape rather than the cursor',
    out.kind === 'resumed' && out.checkpointRejection === 'not-triggered')
}

// ── 7. storage unavailable ──────────────────────────────────────────────────
console.log('\nSTORAGE UNAVAILABLE: SILENT, AND THE ROUND IS UNAFFECTED')
reset(); writeAt(1); storageThrows = true
{
  const out = await recoverSession(false, platform, present, offerAccepting)
  check('no offer, no skip, no error', seq, ['present', 'endRound'])
  check('the outcome is a normal resumed round', out.kind, 'resumed')
  check('and it settled', get(balance), 777)
}

// ── 8. an inactive round is still never touched ─────────────────────────────
console.log('\nRESUME DID NOT WEAKEN THE ACTIVE-ROUND GUARD')
reset(); writeAt(1)
{
  const inactive = {
    ...platform,
    authenticate: async () => ({
      balance: 100, minBet: 0.1, maxBet: 100, stepBet: 0.1, betLevels: [1],
      defaultBetLevel: 1, currency: 'USD',
      round: { betID: BET_ID, active: false, mode: 'base', state: { events: activeEvents } },
      jurisdictionFlags: {}, jurisdiction: {},
    }),
  } as unknown as Parameters<typeof recoverSession>[1]
  const out = await recoverSession(false, inactive, present, offerAccepting)
  check('a closed round is not offered, not presented and not settled', seq, [])
  check('and the outcome is nothing to do', out.kind, 'none')
}

console.log('')
if (failures > 0) {
  console.error(`FEATURE RESUME FLOW: FAIL (${failures})`)
  process.exit(1)
}
console.log('FEATURE RESUME FLOW: PASS (offered before anything plays, presented before it settles)')
process.exit(0)
