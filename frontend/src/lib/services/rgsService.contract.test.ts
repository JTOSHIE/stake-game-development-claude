// rgsService.contract.test.ts - R2R JOB 4 (2026-07-25). New CI gate 11a.
// Run (from frontend/): npx tsx src/lib/services/rgsService.contract.test.ts
//
// Proves the wallet layer speaks the PINNED OFFICIAL CONTRACT, against
// official-shaped fixtures transcribed from
// node_modules/stake-engine/src/types.ts at
// df9e126d79b3fe1ef353f4fac9c1699cd79a4d3e.
//
// WHY THIS FILE EXISTS AT ALL, stated so it is not deleted as duplication:
// rgsService.parse.test.ts (gate 11) proves the EVENT layer is aligned, using
// real decoded book rows, and it restates the mapping because the module was
// locked when it was written. This file proves the ENVELOPE around those events
// is the official one, and it imports the real functions rather than copying
// them, so a change to the service cannot pass by leaving a copy untouched.
//
// The fixtures are the shapes the official client reads in client.ts:
//   authenticate  data.balance.{amount,currency}
//                 data.config.{minBet,maxBet,stepBet,defaultBetLevel,betLevels}
//                 data.config.jurisdiction.{...12 flags}
//                 data.round
//   play          data.balance, data.round
//   end-round     data.balance   (request body: sessionID ONLY)

import { get } from 'svelte/store'
import {
  authenticate, play, endRound, normaliseRgsUrl,
  _extractRoundEvents, _buildMockPlayResponse,
  CURRENCY_SCALE,
  type SessionParams,
} from './rgsService.ts'
import { jurisdictionFlags } from '../stores/jurisdiction.ts'
import { rgJurisdiction } from '../stores/responsibleGambling.ts'

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}
const checkThat = (name: string, cond: boolean) => {
  if (cond) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}`) }
}

const M = CURRENCY_SCALE

// ── A recording fetch stub ───────────────────────────────────────────────────
interface Sent { url: string; body: Record<string, unknown> }
const sent: Sent[] = []
let nextResponse: unknown = {}
;(globalThis as unknown as { fetch: unknown }).fetch = async (url: string, init: { body: string }) => {
  sent.push({ url, body: JSON.parse(init.body) })
  return { ok: true, status: 200, json: async () => nextResponse } as unknown as Response
}

const params: SessionParams = {
  sessionID: 'sess-1', lang: 'en', device: 'desktop', rgs_url: 'https://rgs.example',
}

// ── 1. rgs_url host normalisation ────────────────────────────────────────────
// The launch parameter is a bare HOST. The official client builds
// `https://${rgs_url}`; this file did not, so every wallet request went to a
// relative path on our own origin.
console.log('\nRGS_URL NORMALISATION, matching the official client and replayService')
check('a bare host gains https', normaliseRgsUrl('rgs.stake-engine.com'), 'https://rgs.stake-engine.com')
check('an https url is left alone', normaliseRgsUrl('https://rgs.stake-engine.com'), 'https://rgs.stake-engine.com')
check('an http url is left alone', normaliseRgsUrl('http://localhost:8080'), 'http://localhost:8080')
check('a trailing slash is trimmed so paths do not double up', normaliseRgsUrl('rgs.example.com/'), 'https://rgs.example.com')

// ── 2. authenticate: the official nested envelope ────────────────────────────
console.log('\nAUTHENTICATE against an official-shaped response')
sent.length = 0
nextResponse = {
  balance: { amount: 123_450_000, currency: 'XSC' },
  config: {
    minBet: 100_000,
    maxBet: 100_000_000,
    stepBet: 100_000,
    defaultBetLevel: 1_000_000,
    betLevels: [100_000, 500_000, 1_000_000, 2_000_000],
    jurisdiction: {
      socialCasino: true, disabledFullscreen: false, disabledTurbo: true,
      disabledSuperTurbo: true, disabledAutoplay: false, disabledSlamstop: true,
      disabledSpacebar: true, disabledBuyFeature: true, displayNetPosition: false,
      displayRTP: true, displaySessionTimer: true, minimumRoundDuration: 2500,
    },
  },
  round: null,
}
const auth = await authenticate(params)

check('posts to /wallet/authenticate on the normalised host', sent[0].url, 'https://rgs.example/wallet/authenticate')
check('sends sessionID AND language, as the official client does', sent[0].body, { sessionID: 'sess-1', language: 'en' })
// THE UNIT. API_MULTIPLIER is 1_000_000 in the official helpers, identical to
// our CURRENCY_SCALE, so 123_450_000 micros is 123.45.
check('balance.amount is read from the NESTED balance object, in micros', auth.balance, 123.45)
check('currency comes from balance.currency, not a sibling field', auth.currency, 'XSC')
check('minBet comes from config, in micros', auth.minBet, 0.1)
check('maxBet comes from config, in micros', auth.maxBet, 100)
check('stepBet comes from config, in micros', auth.stepBet, 0.1)
check('defaultBetLevel is carried through at last', auth.defaultBetLevel, 1)
check('betLevels come from config, each converted', auth.betLevels, [0.1, 0.5, 1, 2])
check('a null round stays null', auth.round, null)

// The four invented names must be absent from what we surface. This is the
// regression guard for TR-042 at the source rather than at the store.
checkThat('surfaced flags contain no invented minSpinMs',
  !Object.prototype.hasOwnProperty.call(auth.jurisdictionFlags, 'minSpinMs'))
checkThat('surfaced flags contain no invented maxAutoplaySpins',
  !Object.prototype.hasOwnProperty.call(auth.jurisdictionFlags, 'maxAutoplaySpins'))
check('all twelve official flags are present, in order',
  Object.keys(auth.jurisdictionFlags),
  ['socialCasino','disabledFullscreen','disabledTurbo','disabledSuperTurbo',
   'disabledAutoplay','disabledSlamstop','disabledSpacebar','disabledBuyFeature',
   'displayNetPosition','displayRTP','displaySessionTimer','minimumRoundDuration'])

// currencyDisplay: UNKNOWN at the pin. The official contract has no such field,
// so this must be undefined rather than fabricated. TR-012c stays open.
check('currencyDisplay is undefined, because the official contract has no such field',
  auth.currencyDisplay, undefined)

// ── 3. jurisdictionFlags delivery all the way to the RG store ────────────────
console.log('\nJURISDICTION FLAGS reach the RG layer, typed')
jurisdictionFlags.set(auth.jurisdiction)
const rg = get(rgJurisdiction)
check('minimumRoundDuration 2500 becomes the spin floor', rg.minSpinMs, 2500)
check('and therefore bans turbo', rg.turboDisabled, true)
check('displaySessionTimer becomes the mandatory session display', rg.mandatorySessionDisplay, true)
check('disabledSpacebar reaches the store', rg.spacebarDisabled, true)
check('disabledSlamstop reaches the store', rg.slamStopDisabled, true)
check('disabledSuperTurbo reaches the store', rg.superTurboDisabled, true)
check('displayRTP reaches the store', rg.displayRTP, true)
check('socialCasino reaches the store', rg.socialCasino, true)
check('the RG layer is switched on by real flags', rg.rgEnabled, true)
jurisdictionFlags.set({})

// ── 4. an active round on authenticate, official shape ───────────────────────
console.log('\nACTIVE ROUND on authenticate: {betID, active, mode, state}')
sent.length = 0
nextResponse = {
  balance: { amount: 10 * M, currency: 'USD' },
  config: { minBet: 100_000, maxBet: 100 * M, stepBet: 100_000, defaultBetLevel: M, betLevels: [M], jurisdiction: {} },
  round: {
    betID: 4242, active: true, mode: 'bonus', amount: M, payoutMultiplier: 1500,
    state: { events: [{ type: 'reveal', board: [], gameType: 'basegame' }] },
  },
}
const authRound = await authenticate(params)
check('betID is a NUMBER, not a roundId string', authRound.round?.betID, 4242)
check('active is the in-progress signal', authRound.round?.active, true)
check('mode survives', authRound.round?.mode, 'bonus')
checkThat('state carries the round events (the TR-035b premise change)',
  Array.isArray((authRound.round?.state as { events?: unknown[] })?.events))

// ── 5. play: {balance, round}, events inside round.state ─────────────────────
console.log('\nPLAY against an official-shaped response')
sent.length = 0
const playEvents = [
  { type: 'reveal', board: [], gameType: 'basegame' },
  { type: 'setTotalWin', amount: 250 },
  { type: 'finalWin', amount: 250 },
]
nextResponse = {
  balance: { amount: 99 * M, currency: 'USD' },
  round: {
    betID: 9001, active: true, mode: 'base',
    amount: M, payout: 2_500_000, payoutMultiplier: 250,
    state: { events: playEvents },
  },
}
const p = await play(params, 1)
check('posts to /wallet/play', sent[0].url, 'https://rgs.example/wallet/play')
check('sends sessionID, mode and a NUMERIC micros amount', sent[0].body, { sessionID: 'sess-1', mode: 'base', amount: 1_000_000 })
checkThat('amount is a number, not a string (the platform checks amount % stepBet)',
  typeof sent[0].body.amount === 'number')
check('balance comes from the nested object', p.balance, 99)
check('win comes from round.payout, in micros', p.win, 2.5)
check('winMicros is preserved raw', p.winMicros, 2_500_000)
check('payoutMultiplier is carried in centibets', p.payoutMultiplier, 250)
check('active is carried', p.active, true)
check('betID is carried as a number', p.betID, 9001)
check('roundId is preserved as the string form of betID', p.roundId, '9001')
check('events are lifted out of round.state', p.events.length, 3)

// ── 6. end-round: sessionID ONLY, balance ONLY ───────────────────────────────
console.log('\nEND-ROUND: the official body and the official response')
sent.length = 0
nextResponse = { balance: { amount: 101_500_000, currency: 'USD' } }
const e = await endRound(params, '9001')
check('posts to /wallet/end-round', sent[0].url, 'https://rgs.example/wallet/end-round')
check('sends ONLY sessionID, no roundId', sent[0].body, { sessionID: 'sess-1' })
checkThat('roundId is genuinely absent from the request body',
  !Object.prototype.hasOwnProperty.call(sent[0].body, 'roundId'))
check('balance comes from the nested object', e.balance, 101.5)
check('roundId on the result is the ECHO of the argument, never read from the response', e.roundId, '9001')

// ── 7. round.state event extraction, both accepted forms ─────────────────────
console.log('\nROUND.STATE extraction, an inference that is labelled as one')
check('state.events is read first, matching the replay endpoint',
  _extractRoundEvents({ events: [{ type: 'reveal' }] }).length, 1)
check('a state that IS the array is accepted', _extractRoundEvents([{ type: 'reveal' }]).length, 1)
check('an unexpected shape yields an empty stream rather than throwing', _extractRoundEvents({ nope: 1 }), [])
check('null yields an empty stream', _extractRoundEvents(null), [])

// ── 8. the mock now emits the OFFICIAL envelope ──────────────────────────────
// The old mock built a SpinResult directly and exercised none of the parsing.
// It now produces an official-shaped response carrying the real reveal/winInfo
// schema, so mock and live share one code path and one vocabulary.
console.log('\nMOCK emits the official envelope and the real event schema')
const visible = [
  ['H1','H1','L3','L2'],
  ['H1','L1','L3','L2'],
  ['H1','M1','L3','L2'],
  ['L1','M2','L3','L2'],
  ['L1','M2','L3','L2'],
]
const mock = _buildMockPlayResponse(1, visible, 500 * M, 7)
checkThat('balance is the nested official object',
  typeof mock.balance.amount === 'number' && typeof mock.balance.currency === 'string')
check('round carries a numeric betID', mock.round.betID, 7)
check('round is never left active in mock mode', mock.round.active, false)
checkThat('payoutMultiplier is in centibets', typeof mock.round.payoutMultiplier === 'number')
const mockEvents = _extractRoundEvents(mock.round.state)
checkThat('state.events carries the real schema, not board/win/scatter',
  mockEvents.some((ev) => ev.type === 'reveal') &&
  mockEvents.some((ev) => ev.type === 'finalWin') &&
  !mockEvents.some((ev) => ev.type === 'board' || ev.type === 'win' || ev.type === 'scatter'))
const reveal = mockEvents.find((ev) => ev.type === 'reveal') as { board: unknown[][] }
check('the mock board is 5 reels', reveal.board.length, 5)
check('each reel is SIX rows, the visible four plus one padding row each end', reveal.board.map((r) => r.length), [6, 6, 6, 6, 6])
// H1 pays 22.00 for five-of-a-kind at one way per reel: 3 x 2 x 1 x 0 stops at
// reel 3, so the H1 three-of-a-kind line is what pays here. The assertion that
// matters is the UNIT, not the amount: wins are centibets, and payout micros
// must equal (centibets / 100) x bet x CURRENCY_SCALE exactly.
check('payout micros equal centibets/100 x bet x scale, exactly',
  mock.round.payout, Math.round((mock.round.payoutMultiplier! / 100) * 1 * M))

if (failures) { console.error(`\nWALLET CONTRACT: FAIL (${failures})`); process.exit(1) }
console.log('\nWALLET CONTRACT: PASS')
