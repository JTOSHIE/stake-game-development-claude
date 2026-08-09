// responsibleGambling.test.ts, compliance gate for the RG autoplay logic.
// Run: npx tsx src/lib/stores/responsibleGambling.test.ts
//
// Verifies the autoplay STOP CONDITIONS, the minimum-round-duration enforcement,
// and session accounting - the pieces a regulator checks. Pure logic, no DOM.
//
// ============================================================================
// REWRITTEN AGAINST THE OFFICIAL FLAGS, R2R JOB 4 / TR-042, 2026-07-25.
// ============================================================================
//
// Round-two reviewer 3's fourth finding was aimed squarely at this file: "the
// tests pass because they inject those same non-platform properties". It was
// correct. Every jurisdiction assertion below used to call
//
//     jurisdictionFlags.set({ minSpinMs: 2500 })
//     jurisdictionFlags.set({ maxAutoplaySpins: 25 })
//
// and neither `minSpinMs` nor `maxAutoplaySpins` is a field of the official
// `JurisdictionFlags`. The store read what the test wrote, the test asserted
// what the store read, and the loop was closed with the platform outside it.
// A green gate proved only that two pieces of our own code agreed.
//
// Every flag name used below is now one of the official twelve, transcribed in
// rgsService.ts as `OfficialJurisdictionFlags` from the pinned ts-client. The
// first block is a REGRESSION GUARD asserting the four invented names do
// nothing, so reintroducing one cannot pass unnoticed.

import {
  autoplayLimits, defaultAutoplayLimits, autoplayShouldStop,
  rgSpinDelay, rgRecordSpin, rgResetSession, rgNetMicros, rgJurisdiction,
  rgAllowedAutoplayCounts, rgClampAutoplayCount, rgInfiniteAutoplayAllowed,
} from './responsibleGambling.ts'
import { speedTier, cycleSpeed, forceNormalSpeed } from './speedMode.ts'
import { isTurbo } from './gameStore.ts'
import { jurisdictionFlags } from './jurisdiction.ts'
import { get } from 'svelte/store'
import { readFileSync } from 'node:fs'

const M = 1_000_000 // one currency unit in micros
let pass = 0
const fail: string[] = []
function check(name: string, cond: boolean) {
  if (cond) pass++
  else fail.push(name)
}
const checkThat = check

// --- stop on any win ---
rgResetSession()
autoplayLimits.set({ ...defaultAutoplayLimits, stopOnFeature: false, stopOnAnyWin: true })
check('stopOnAnyWin: stops on a win', autoplayShouldStop({ winMicros: 5 * M, betMicros: M, triggered: false }).stop === true)
check('stopOnAnyWin: continues on a loss', autoplayShouldStop({ winMicros: 0, betMicros: M, triggered: false }).stop === false)

// --- single win limit (x total bet) ---
autoplayLimits.set({ ...defaultAutoplayLimits, stopOnFeature: false, singleWinLimitMult: 20 })
check('singleWinLimit: stops at >= 20x', autoplayShouldStop({ winMicros: 20 * M, betMicros: M, triggered: false }).stop === true)
check('singleWinLimit: continues below 20x', autoplayShouldStop({ winMicros: 19 * M, betMicros: M, triggered: false }).stop === false)

// --- stop on feature ---
autoplayLimits.set({ ...defaultAutoplayLimits, stopOnFeature: true })
check('stopOnFeature: stops when triggered', autoplayShouldStop({ winMicros: 0, betMicros: M, triggered: true }).stop === true)
check('stopOnFeature: continues when not', autoplayShouldStop({ winMicros: 0, betMicros: M, triggered: false }).stop === false)

// --- loss limit (session net) ---
rgResetSession()
autoplayLimits.set({ ...defaultAutoplayLimits, stopOnFeature: false, lossLimitMicros: 10 * M })
rgRecordSpin(6 * M, 0) // -6
rgRecordSpin(6 * M, 0) // -12  -> past the 10 limit
check('lossLimit: net is -12', get(rgNetMicros) === -12 * M)
check('lossLimit: stops once loss >= 10', autoplayShouldStop({ winMicros: 0, betMicros: M, triggered: false }).stop === true)

// --- session accounting ---
rgResetSession()
rgRecordSpin(2 * M, 5 * M) // wager 2, win 5 -> net +3
check('session: net +3 after a winning spin', get(rgNetMicros) === 3 * M)

// ── THE REGRESSION GUARD, R2R3 finding 4 ────────────────────────────────────
// The four invented flag names, set together, must change NOTHING. If any of
// these fails, someone has re-wired the store to a property the platform does
// not send, and a live session will silently run permissive again.
jurisdictionFlags.set({
  minSpinMs: 2500,
  realityCheckMs: 60_000,
  maxAutoplaySpins: 25,
  mandatorySessionDisplay: true,
})
check('invented minSpinMs sets no floor', get(rgJurisdiction).minSpinMs === 0)
check('invented minSpinMs does not ban turbo', get(rgJurisdiction).turboDisabled === false)
check('invented realityCheckMs stays off', get(rgJurisdiction).realityCheckMs === 0)
check('invented maxAutoplaySpins does not cap', get(rgJurisdiction).maxAutoplaySpins === Infinity)
check('invented mandatorySessionDisplay is ignored', get(rgJurisdiction).mandatorySessionDisplay === false)
check('invented flags do not switch the RG layer on', get(rgJurisdiction).rgEnabled === false)

// ── minimum round duration, the OFFICIAL flag ───────────────────────────────
jurisdictionFlags.set({ minimumRoundDuration: 2500 })
check('minimumRoundDuration: raises a short delay to 2500', rgSpinDelay(800) === 2500)
check('minimumRoundDuration: leaves a longer delay alone', rgSpinDelay(6000) === 6000)
check('minimumRoundDuration: derives onto minSpinMs', get(rgJurisdiction).minSpinMs === 2500)
check('minimumRoundDuration: switches the RG layer on', get(rgJurisdiction).rgEnabled === true)

// Wiring Integrity Audit, item 3(i): the platform manual has no general minimum
// spin interval (only UKGC-style jurisdictions do), so a session with no
// jurisdiction data must see a literal 0 ms floor - not just "the requested
// delay happens to pass through unchanged", but the resolved floor itself.
jurisdictionFlags.set({})
check('no jurisdiction data: no floor is applied', rgSpinDelay(800) === 800)
check('no jurisdiction data: floor resolves to a literal 0 ms', get(rgJurisdiction).minSpinMs === 0)
check('no jurisdiction data: RG layer is off', get(rgJurisdiction).rgEnabled === false)

// ── autoplay counts ─────────────────────────────────────────────────────────
// R7/TR-015's capping logic is intact and still asserted. What changed is where
// the cap comes from: no official flag caps autoplay, so the store is always
// uncapped and the cap is supplied explicitly by the caller. Asserting the
// logic against a passed cap keeps the behaviour pinned for the day a real flag
// exists, without pretending a flag exists today.

const AUTO_OPTIONS = [10, 25, 50, 100]

jurisdictionFlags.set({})
check('official contract: autoplay is never capped by a flag', get(rgJurisdiction).maxAutoplaySpins === Infinity)
check('uncapped: all autoplay counts offered', JSON.stringify(rgAllowedAutoplayCounts(AUTO_OPTIONS)) === JSON.stringify(AUTO_OPTIONS))
check('uncapped: infinite autoplay allowed', get(rgInfiniteAutoplayAllowed) === true)
check('uncapped: count is not clamped', rgClampAutoplayCount(100) === 100)

check('cap 25: only 10 and 25 offered', JSON.stringify(rgAllowedAutoplayCounts(AUTO_OPTIONS, 25)) === JSON.stringify([10, 25]))
check('cap 25: a request for 100 clamps to 25', rgClampAutoplayCount(100, 25) === 25)
check('cap 25: a legal request is untouched', rgClampAutoplayCount(10, 25) === 10)
check('cap below every option: the cap itself is offered', JSON.stringify(rgAllowedAutoplayCounts(AUTO_OPTIONS, 5)) === JSON.stringify([5]))
check('cap below every option: request clamps to the cap', rgClampAutoplayCount(10, 5) === 5)

// ── autoplay ban, official disabledAutoplay ─────────────────────────────────
jurisdictionFlags.set({ disabledAutoplay: true })
check('disabledAutoplay: derives', get(rgJurisdiction).autoplayDisabled === true)
check('disabledAutoplay: switches the RG layer on', get(rgJurisdiction).rgEnabled === true)

// ── turbo ban ───────────────────────────────────────────────────────────────
// Previously turboDisabled had ZERO readers: the flag was correct and the
// control cycled anyway.
jurisdictionFlags.set({})
forceNormalSpeed()
cycleSpeed()
check('no ban: speed cycles to turbo', get(speedTier) === 'turbo')
check('no ban: locked isTurbo stays in sync', get(isTurbo) === true)

jurisdictionFlags.set({ disabledTurbo: true })
check('explicit ban: flag derives', get(rgJurisdiction).turboDisabled === true)
check('explicit ban: a late-arriving ban resets the speed already chosen', get(speedTier) === 'normal')
check('explicit ban: locked isTurbo reset too', get(isTurbo) === false)
cycleSpeed()
check('explicit ban: cycleSpeed cannot reach turbo', get(speedTier) === 'normal')

// A minimum round duration implies the fast-play ban.
jurisdictionFlags.set({ minimumRoundDuration: 2500 })
check('minimumRoundDuration implies turboDisabled', get(rgJurisdiction).turboDisabled === true)
cycleSpeed()
check('minimumRoundDuration: speed stays normal', get(speedTier) === 'normal')
check('minimumRoundDuration: autoplay delay is raised to the minimum', rgSpinDelay(300) === 2500)
check('minimumRoundDuration: a longer delay is left alone', rgSpinDelay(4000) === 4000)

// ── the official flags that were being IGNORED entirely ─────────────────────
// R2R3: "it ignores several real flags". Each now derives onto a named field,
// so the controls they govern have something to read.
jurisdictionFlags.set({
  disabledSpacebar: true,
  disabledSlamstop: true,
  disabledSuperTurbo: true,
  disabledFullscreen: true,
  displayRTP: true,
  displaySessionTimer: true,
  displayNetPosition: true,
  socialCasino: true,
})
const j = get(rgJurisdiction)
check('disabledSpacebar derives', j.spacebarDisabled === true)
check('disabledSlamstop derives', j.slamStopDisabled === true)
check('disabledSuperTurbo derives', j.superTurboDisabled === true)
check('disabledFullscreen derives', j.fullscreenDisabled === true)
check('displayRTP derives', j.displayRTP === true)
check('displaySessionTimer derives', j.displayNetPosition === true && j.mandatorySessionDisplay === true)
check('displayNetPosition derives', j.displayNetPosition === true)
check('socialCasino derives', j.socialCasino === true)
check('displaySessionTimer switches the RG layer on', j.rgEnabled === true)

// ── THE FLAGS ARE ENFORCED, not merely derived ─────────────────────────────
// R7/TR-015's whole finding was that turboDisabled was computed correctly and
// every consumer ignored it. Seven of the flags added in the R2R wallet pass
// were in exactly that state: derived onto named fields with ZERO readers. The
// three that are ENFORCEMENT flags now have readers, and these assertions are
// what stop them losing them again.
console.log('\nENFORCEMENT, not derivation')

// disabledSuperTurbo bans the TOP tier only, so the cycle must still reach 2x.
jurisdictionFlags.set({ disabledSuperTurbo: true })
forceNormalSpeed()
cycleSpeed()
check('superTurbo ban: the first press still reaches turbo', get(speedTier) === 'turbo')
cycleSpeed()
check('superTurbo ban: the next press skips 4x and returns to normal', get(speedTier) === 'normal')
check('  and the ban is not confused with a turbo ban', get(rgJurisdiction).turboDisabled === false)

// A ban arriving AFTER the player already chose 4x must drop them to 2x, not
// to a standstill: the flag bans the top tier, not fast play.
jurisdictionFlags.set({})
forceNormalSpeed(); cycleSpeed(); cycleSpeed()
check('without the ban, 4x is reachable', get(speedTier) === 'super')
jurisdictionFlags.set({ disabledSuperTurbo: true })
check('a late ban drops 4x to 2x, not to normal', get(speedTier) === 'turbo')

// disabledSpacebar is read by App.svelte's key handler. Asserted against the
// SHIPPED source, because the defect was an absent reader and no store
// assertion can see one of those.
{
  const app = readFileSync('src/App.svelte', 'utf8')
  // Matches the READER, not one exact line shape. The original pattern pinned
  // `... spacebarDisabled) return` and broke on 2026-08-09 when the branch grew
  // a preventDefault, i.e. it failed on a STRICTER fix. A source assertion that
  // only accepts one spelling turns any improvement into a red test.
  checkThat('App.svelte reads spacebarDisabled in the key handler',
    /if \(\$rgJurisdiction\.spacebarDisabled\)/.test(app))
  // The ban must suppress the BROWSER's own activation too. Returning bare left
  // a focused SPIN button spinning on Space, which is the whole defect.
  checkThat('and it prevents the default, so a focused SPIN button cannot be '
    + 'activated by the browser',
    /\$rgJurisdiction\.spacebarDisabled\)\s*\{[\s\S]{0,900}?e\.preventDefault\(\)/.test(app))
  checkThat('and it gates the KEY, not the spin button',
    !/spacebarDisabled[\s\S]{0,400}data-testid="spin-button"/.test(app))
}

jurisdictionFlags.set({})
forceNormalSpeed()

console.log('='.repeat(64))
console.log('RESPONSIBLE GAMBLING: autoplay stop-conditions + limits + enforcement')
console.log('against the OFFICIAL jurisdiction flags (TR-042)')
console.log('='.repeat(64))
console.log(`checks passed: ${pass}`)
if (fail.length) {
  console.log('\nFAILURES:')
  for (const f of fail) console.log('  - ' + f)
  console.log('\nRG LOGIC: FAIL')
  process.exit(1)
}
console.log('\nRG LOGIC: PASS')
