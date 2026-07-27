<script lang="ts">
  // FreeSpinsPresentation.svelte, plays back an Overdrive Free Spins round from
  // a PresentationScript (produced by roundInterpreter over the round events).
  // Temporary CSS presentation; final art/animation arrive in AssetForge v2 and
  // Motion Polish v2. Drives its own timed sequence; turbo shortens every step.
  //
  // Emits 'complete' with the total win (dollars) when the sequence finishes.
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { betAmount, currencyCode, isTurbo, locale } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { t, type GameMode } from '../i18n/translations'
  import { themeAssets } from '../stores/themeStore'
  import type { PresentationScript, PresentedSpin } from '../services/roundInterpreter'
  // TR-036 option (b), R2R-R JOB E. The SAME gauge as the base game, capped at
  // level 3 for a retrigger. See scatterEscalation.ts for why capped rather
  // than absent and rather than full.
  import {
    escalationFor, pulseLevelFor, holdMsFor, scaledHoldMs, scaledPulseMs,
    scatterEscalation, resetEscalation, RETRIGGER_MAX_LEVEL,
    type EscalationLevel,
  } from '../stores/scatterEscalation'
  import { speedTier } from '../stores/speedMode'
  import {
    writeCheckpoint, clearCheckpoint, figuresAt, BEFORE_FIRST_SPIN,
  } from '../stores/presentationCheckpoint'

  export let script: PresentationScript | null = null
  export let active = false
  // Reel Feel v3 warm-mount only (App.svelte's hidden always-active
  // pre-paint instance): the real click-to-continue gate below must never
  // auto-advance, but the invisible warm instance still needs to reach every
  // later stage once to pay the paint/decode cost - this flag lets it
  // synthesize the click immediately instead of waiting forever unclicked.
  export let skipContinueGate = false

  /**
   * TR-099. The official round identity this presentation belongs to, or null.
   *
   * NULL MEANS DO NOT CHECKPOINT, and that is the default on purpose. The
   * warm-mount instance, Bet Replay and mock rounds all present a script that
   * is not a live open round, and a cursor written from any of them would be a
   * checkpoint for a round the RGS is not holding. Only App.svelte's live
   * feature presentation passes a betID.
   */
  export let checkpointBetID: number | null = null

  /**
   * TR-099. When set, the auto-start below resumes at this free spin instead of
   * playing the entry sequence and every spin before it. Null is a normal
   * start, which is every live trigger and every replay.
   */
  export let resumeFromIndex: number | null = null

  function saveCheckpoint(freeSpinIndex: number): void {
    if (checkpointBetID === null || !script || !script.triggered) return
    writeCheckpoint({
      betID: checkpointBetID,
      phase: 'free',
      freeSpinIndex,
      ...figuresAt(script, freeSpinIndex),
    })
  }

  const dispatch = createEventDispatcher<{ complete: { totalWin: number } }>()

  let phase: 'idle' | 'entry' | 'spin' | 'end' = 'idle'
  // Overdrive transition sub-stages within 'entry' (Motion Polish v2): scatter
  // flare, screen dip, gauge slam-to-centre with the needle ripping to the
  // redline, spin-count text burst, then settle (fades, revealing the real
  // BonusInstrumentColumn already sitting in its column position underneath).
  let entryStage: 'flare' | 'dip' | 'gauge' | 'burst' | 'settle' = 'flare'
  let spinIndex = -1
  // Free spins awarded SO FAR (initial award, growing on each retrigger). Used
  // for the odometer so it never shows the post-retrigger total before it lands.
  let awardedTotal = 0
  let currentSpin: PresentedSpin | null = null
  // Exported (bindable) so BonusInstrumentColumn (LAYOUT_SPEC HUD) can drive
  // its gauge/odometer/plates from the same live values this overlay shows.
  export let displayMeter = 1
  export let spinsRemaining = 0
  export let runningTotalCentibets = 0
  // Bindable so App.svelte can drive the background crossfade and frame neon
  // hue-shift; false again once the 'end' phase starts, so the reverse shift
  // plays out behind the total-win summary rather than after it.
  export let overdriveVisualActive = false
  let showRetrigger = false
  let timer: ReturnType<typeof setTimeout> | null = null
  // OWNER AUDIT ROUND 2, item 1: the entry card never auto-advances past the
  // scatter-award reveal - it waits here for an explicit click, and nothing
  // in runEntrySequence's own timers (all turbo-aware via dur()) can bypass
  // it, so autoplay/turbo pause here exactly like a manual player would.
  let awaitingContinue = false
  // WIN BANNER V3 reuse (item 2): bound out to App.svelte, which mounts the
  // celebration <WinBanner> (explicit-trigger mode) as a stage-level sibling
  // of the base big-win instance - same component, same coordinate space.
  // endBannerTrigger is bumped once per feature-end reveal so the banner
  // shows again even if the amount happens to repeat.
  export let endBannerAmount = 0
  export let endBannerMultiplier = 0
  export let endBannerTrigger = 0
  // Bindable (OWNER AUDIT ROUND 2, item 4) so App.svelte can pick the right
  // FlameJets colourway / backdrop treatment for the actual entry type.
  export let isNitroEntry = false

  $: mode = ($isSocial ? 'social' : 'real') as GameMode
  $: lang = $locale
  // NITRO OVERDRIVE detection (ANIMATION UPLIFT PASS, 2026-07-16, item 2):
  // no explicit "which bet mode triggered this" field exists on
  // PresentationScript, so - consistent with the meter-seeding fix earlier
  // this project (the book's own data is the only source of truth for the
  // Overdrive meter) - a NITRO entry is identified the same way that fix's
  // own test assertions do: the first free spin's pre-win meter is already
  // >= 5 (only the pre-revved NITRO OVERDRIVE buy tier starts there).
  $: isNitroEntry = !!script && script.freeSpins.length > 0 && script.freeSpins[0].meterBefore >= 5
  // "NITRO OVERDRIVE" is a brand-style mode name, not localised anywhere
  // else in the UI (see fsModes.ts's FS_MODES - same convention as "Normal"/
  // "OVERBOOST"), so it isn't run through t() here either.
  $: entryTitleText = isNitroEntry ? 'NITRO OVERDRIVE' : t(lang, 'overdriveFreeSpins', mode)

  function dur(ms: number): number {
    return $isTurbo ? Math.max(120, Math.round(ms * 0.4)) : ms
  }

  function centibetsToMicros(cb: number): number {
    // cb = bet-multiple x 100; dollar win = (cb/100) * bet; micros = *SCALE
    return Math.round((cb / 100) * $betAmount * CURRENCY_SCALE)
  }
  function fmt(cb: number): string {
    return formatBalance(centibetsToMicros(cb), $currencyCode || 'USD')
  }

  function clear() {
    if (timer) { clearTimeout(timer); timer = null }
  }

  export function start() {
    clear()
    if (!script) { finish(); return }
    if (!script.triggered) {
      // Wincap walkthrough for a round that never entered the feature (a
      // plain base-game win reaching the cap): "how it happened" is just the
      // base spin's board, so show that, then the same total-win summary.
      phase = 'spin'
      currentSpin = script.baseSpin
      displayMeter = 1
      spinsRemaining = 0
      runningTotalCentibets = script.baseSpin.runningTotalCentibets
      showRetrigger = false
      timer = setTimeout(toEnd, dur(1800))
      return
    }
    phase = 'entry'
    spinIndex = -1
    displayMeter = 1
    runningTotalCentibets = script.baseSpin.runningTotalCentibets
    spinsRemaining = script.initialFreeSpins
    awardedTotal = script.initialFreeSpins
    showRetrigger = false
    overdriveVisualActive = true
    runEntrySequence()
  }

  /**
   * TR-099. Resume the feature at a spin boundary, skipping the entry sequence
   * and every spin already watched.
   *
   * `resumeFromIndex` is the first free spin to PLAY. Everything else is
   * DERIVED FROM THE SCRIPT rather than restored from storage, which is the
   * whole safety property of this feature: `nextSpin()` already reads the
   * meter, the running total and the spins remaining out of
   * `script.freeSpins[spinIndex]`, so setting the index is the entire resume.
   *
   * `awardedTotal` is the one value that is not on the spin itself, because it
   * accumulates. It is recomputed here from the retrigger entries BELOW the
   * cursor rather than stored, for the same reason: a number recovered from the
   * round cannot be stale, and a number recovered from storage can.
   */
  export function startFrom(resumeFromIndex: number) {
    clear()
    if (!script || !script.triggered || resumeFromIndex <= 0
        || resumeFromIndex >= script.freeSpins.length) {
      start()
      return
    }
    awardedTotal = script.initialFreeSpins
    for (let i = 0; i < resumeFromIndex; i++) {
      const r = script.freeSpins[i]?.retrigger
      if (r) awardedTotal = r.newTotal
    }
    displayMeter = script.freeSpins[resumeFromIndex].meterBefore
    runningTotalCentibets = script.freeSpins[resumeFromIndex - 1].runningTotalCentibets
    showRetrigger = false
    overdriveVisualActive = true
    spinIndex = resumeFromIndex - 1   // nextSpin() increments into the target
    nextSpin()
  }

  /** Overdrive transition (DESIGN_SYSTEM concept of record, retimed
   *  2026-07-16 for the ANIMATION UPLIFT PASS item 2 - "under 1.5 seconds
   *  total, never delays the first free spin beyond it"): scatter flare
   *  (flame jets ignite via overdriveVisualActive, already flipped in
   *  start() before this runs), screen dip, gauge slam-to-redline + the
   *  title card's own slam-in/shockwave (both land in the same 'gauge'
   *  stage so they read as one threshold moment rather than two separate
   *  beats), spin-count text burst, then a CLICK TO CONTINUE gate (OWNER
   *  AUDIT ROUND 2, item 1) - every stage up to the gate is turbo-aware via
   *  dur(), but the gate itself has no timer at all, so neither turbo nor
   *  autoplay can skip past the scatter-award reveal without an explicit
   *  click. 180+150+380+300 = 1010ms baseline (non-turbo) to reach the
   *  gate. */
  function runEntrySequence(): void {
    entryStage = 'flare'
    timer = setTimeout(() => {
      entryStage = 'dip'
      timer = setTimeout(() => {
        entryStage = 'gauge'
        timer = setTimeout(() => {
          entryStage = 'burst'
          timer = setTimeout(() => {
            awaitingContinue = true
            if (skipContinueGate) continueFromEntry()
          }, dur(300))
        }, dur(380))
      }, dur(150))
    }, dur(180))
  }

  function continueFromEntry(): void {
    if (!awaitingContinue) return
    awaitingContinue = false
    // TR-099, the first safe checkpoint. The player has accepted the entry, so
    // the feature is genuinely under way, and no free spin has run yet.
    saveCheckpoint(BEFORE_FIRST_SPIN)
    entryStage = 'settle'
    timer = setTimeout(nextSpin, dur(300))
  }

  // ── Retrigger escalation, TR-036 option (b) ────────────────────────────────
  //
  // WHY IT LIVES HERE AND NOT IN GameGrid. The free-spins overlay renders its
  // OWN board; GameGrid's reel-stop loop, which owns the base-game ladder, is
  // behind it and not running. Wiring the retrigger ladder into GameGrid would
  // have produced a beat the player cannot see, which is the dead-wiring shape
  // this project gates against. So the ladder runs where the reels the player
  // is actually watching are: here.
  //
  // The INTEGRITY PROPERTY is preserved exactly. `escalationFor` is still fed
  // only visibly landed scatters and reels still to come, and still cannot be
  // passed a board. Revealing this one spin reel by reel rather than all at once
  // is what makes "visibly landed" meaningful inside the overlay at all.
  //
  // Only a RETRIGGERING spin does this. Every other free spin reveals whole, as
  // it always has, because there is nothing to build toward.
  let revealedReels = 5          // how many reels of the current spin are shown
  let retriggerBeat = false      // true while the capped ladder is running
  export let onRetriggerBeat: ((active: boolean) => void) | null = null

  function setBeat(on: boolean): void {
    retriggerBeat = on
    onRetriggerBeat?.(on)
  }

  const sleep = (ms: number) => new Promise<void>((r) => { timer = setTimeout(r, ms) })

  async function runRetriggerLadder(spin: PresentedSpin): Promise<void> {
    const rows = visibleRows(spin.board)
    const speedFactor = get(speedTier) === 'super' ? 0.16 : get(isTurbo) ? 0.5 : 1
    revealedReels = 0
    resetEscalation()
    setBeat(true)

    let landed = 0
    for (let r = 0; r < rows.length; r++) {
      // Sustained tension BEFORE this reel commits. `rows.length - r` counts
      // this reel as still to come, which it is.
      const hold = escalationFor(landed, rows.length - r, 'retrigger')
      if (holdMsFor(hold) > 0) {
        scatterEscalation.set(hold)
        await sleep(scaledHoldMs(hold, speedFactor))
      }

      const before = landed
      revealedReels = r + 1
      landed += rows[r].filter((sym) => sym === 'S').length

      // Beat on the TRANSITION, so it fires when the scatter lands. Above the
      // cap there is no further beat: the retrigger announced itself at three.
      const pulse = pulseLevelFor(before, landed, 'retrigger')
      if (pulse !== null) {
        scatterEscalation.set(pulse)
        await sleep(scaledPulseMs(pulse, speedFactor))
      }

      scatterEscalation.set(escalationFor(landed, rows.length - 1 - r, 'retrigger'))
    }

    setBeat(false)
    resetEscalation()
  }

  function nextSpin() {
    if (!script) return finish()
    spinIndex += 1
    if (spinIndex >= script.freeSpins.length) { toEnd(); return }
    phase = 'spin'
    currentSpin = script.freeSpins[spinIndex]
    displayMeter = currentSpin.meterBefore
    // Grow the awarded total when this spin retriggered, then show spins
    // remaining (this spin included) against the total awarded so far, so the
    // odometer matches what the player has actually been given at this point.
    if (currentSpin.retrigger) awardedTotal = currentSpin.retrigger.newTotal
    spinsRemaining = Math.max(0, awardedTotal - spinIndex)
    runningTotalCentibets = currentSpin.runningTotalCentibets
    // The +5 pop waits for the ladder on a retriggering spin, so the build and
    // its payoff are not on screen at the same moment.
    showRetrigger = false
    revealedReels = 5

    const spin = currentSpin
    const thisIndex = spinIndex
    const advance = () => {
      showRetrigger = !!spin.retrigger
      // After a winning spin, animate the meter increment. Bigger wins dwell
      // longer so the connection (and, in a wincap round, the spin that reaches
      // the cap) is actually seen; small wins still move fast.
      const willInc = spin.meterAfter > spin.meterBefore
      const winMult = spin.spinWinCentibets / 100
      const holdWin = winMult > 0 ? Math.min(3200, 700 + winMult * 24) : 500
      timer = setTimeout(() => {
        if (willInc) displayMeter = spin.meterAfter
        // TR-099. The cursor moves only at a SPIN BOUNDARY, once this spin's
        // meter has landed and the figures on screen are exactly the script's
        // values for this index. Mid-animation is never a checkpoint, because
        // "half way through spin 4" is not a resumable position.
        saveCheckpoint(thisIndex)
        timer = setTimeout(nextSpin, dur(willInc ? 450 : 150))
      }, dur(holdWin))
    }

    if (spin.retrigger) {
      // TR-036 option (b). Reveal this one spin reel by reel and run the capped
      // ladder over it, then carry on exactly as before.
      runRetriggerLadder(spin).then(advance)
    } else {
      advance()
    }
  }

  function toEnd() {
    phase = 'end'
    // TR-099. The feature is over, so the cursor is cleared here rather than
    // only on settle: a checkpoint that outlives its round is a stale cursor
    // waiting to be matched against a future round.
    clearCheckpoint()
    currentSpin = null
    // Reverse the bg-crossfade/frame-hue shift behind the total win summary,
    // not after it.
    overdriveVisualActive = false
    // WIN BANNER V3 reuse (item 2): the App-level celebration <WinBanner>
    // owns the count-up/tier/dismiss timing entirely - bump the trigger to
    // show it; App.svelte chains its on:dismissed to onEndBannerDismissed()
    // below rather than a duplicated local timer.
    endBannerAmount = script ? (script.totalWinCentibets / 100) * $betAmount : 0
    endBannerMultiplier = script ? script.totalWinCentibets / 100 : 0
    endBannerTrigger += 1
  }

  /** Called by App.svelte once the celebration <WinBanner> it mounts (driven
   *  by endBannerAmount/endBannerMultiplier/endBannerTrigger above) has
   *  auto-dismissed - completes the round exactly as the old internal timer
   *  used to, just chained off the shared component's own timing instead of
   *  a duplicate. */
  export function onEndBannerDismissed(): void {
    finish()
  }

  function finish() {
    clear()
    clearCheckpoint()
    phase = 'idle'
    const totalWin = script ? (script.totalWinCentibets / 100) * $betAmount : 0
    dispatch('complete', { totalWin })
  }

  // Start automatically when activated with a script. TR-099: a resume enters
  // at a spin boundary instead, skipping the entry sequence the player already
  // watched. `startFrom` falls back to `start()` for any index it cannot use,
  // so a bad value degrades to today's behaviour rather than to a blank screen.
  $: if (active && script && phase === 'idle') {
    if (resumeFromIndex !== null) startFrom(resumeFromIndex)
    else start()
  }

  // Dev-only QA hook (OWNER AUDIT ROUND 2, item 1 hard assert): publishes the
  // live script + the spin index actually reached so a headless check can
  // read the DOM's displayed running total after each spin and independently
  // verify it equals the sum of spins 1..k, never the round's final total,
  // until the round has actually finished. Mirrors App.svelte's existing
  // dev-only __qaLog pattern.
  $: if (import.meta.env.DEV) {
    const w = window as unknown as { __qaFeatureScript?: unknown }
    w.__qaFeatureScript = script ? { script, spinIndex, phase } : null
  }

  // Free-spin board cells show the real symbol art (same exports the main reel
  // uses), not the id text. W/S map to the wild/scatter filenames.
  const SYM_FILE: Record<string, string> = { W: 'wild', S: 'scatter' }
  function symImg(sym: string): string {
    const f = SYM_FILE[sym] ?? sym.toLowerCase()
    return `${$themeAssets.assetBase}/symbols/${f}.png`
  }

  function visibleRows(board: PresentedSpin['board']): string[][] {
    // Board reels include padding rows; show the middle 4 where present.
    return board.map((reel) => {
      const names = reel.map((c) => c?.name ?? '')
      return names.length >= 6 ? names.slice(1, 5) : names.slice(0, 4)
    })
  }

  // ── Win-connection story: which cells make up the spin's wins ─────────────
  // A ways win with symbol S over `kind` reels lights every cell holding S (or a
  // wild) on reels 0..kind-1, so the player sees the connection across reels.
  function winningCells(rows: string[][], wins: PresentedSpin['wins']): Set<string> {
    const cells = new Set<string>()
    for (const win of wins) {
      const reels = Math.min(win.kind, rows.length)
      for (let r = 0; r < reels; r++) {
        for (let row = 0; row < rows[r].length; row++) {
          const sym = rows[r][row]
          if (sym === win.symbol || sym === 'W' || win.symbol === 'W') cells.add(`${r},${row}`)
        }
      }
    }
    return cells
  }
  // Recompute per shown spin so the highlight lands with the board.
  $: vrows = currentSpin ? visibleRows(currentSpin.board) : []
  $: winCells = currentSpin ? winningCells(vrows, currentSpin.wins) : new Set<string>()
  $: hasWin = !!currentSpin && currentSpin.wins.length > 0 && currentSpin.spinWinCentibets > 0

  onDestroy(clear)
</script>

{#if active && script}
  <div class="fs-overlay" data-testid="freespins-overlay" role="dialog" aria-label="Overdrive Free Spins">
    {#if phase === 'entry'}
      <div class="fs-entry-stage stage-{entryStage}" data-testid="overdrive-entry">
        <div class="entry-scatter-flare" aria-hidden="true"></div>
        <img class="entry-smoke-wisp entry-smoke-a" src="{$themeAssets.assetBase}/ui/particles/smoke_puff.png" alt="" aria-hidden="true" />
        <img class="entry-smoke-wisp entry-smoke-b" src="{$themeAssets.assetBase}/ui/particles/smoke_puff.png" alt="" aria-hidden="true" />
        <div class="entry-dip" aria-hidden="true"></div>
        <div class="entry-gauge-wrap" aria-hidden="true">
          <img class="entry-gauge-face" src="{$themeAssets.assetBase}/ui/gauge_face.png" alt="" />
          <img class="entry-gauge-needle" src="{$themeAssets.assetBase}/ui/gauge_needle.png" alt="" />
        </div>
        <img class="entry-shockwave" src="{$themeAssets.assetBase}/ui/particles/shock_ring.png" alt="" aria-hidden="true" data-testid="entry-shockwave" />
        <div class="entry-title" data-testid="entry-title">{entryTitleText}</div>
        <!-- OWNER AUDIT ROUND 3, item 3: the award text and the CLICK TO
             CONTINUE gate now stack in one flex column anchored to the
             card's lower border, instead of two independently-floating
             bottom:N% elements that could overlap once the gate button's
             own touch-target height grew (Round 2 fix) - flex guarantees a
             real gap between them regardless of viewport, by construction. -->
        <div class="entry-bottom-group">
          <div class="entry-burst-text">+{script.initialFreeSpins} {t(lang, 'freeSpins', mode)}</div>
          {#if awaitingContinue}
            <button
              type="button"
              class="entry-continue"
              data-testid="entry-continue"
              on:click={continueFromEntry}
            >
              {t(lang, 'featureContinue', mode)}
            </button>
          {/if}
        </div>
      </div>
    {:else if phase === 'spin' && currentSpin}
      <div class="fs-stage">
        <!-- No top-right meter overlay here (OWNER AUDIT ROUND 2, item 3:
             "remove the top-right overlay panel from the feature entirely,
             reels at maximum size") - the live meter/spins/total-win values
             are bound out to BonusInstrumentColumn (App.svelte), the single
             source of in-feature instrumentation for both layouts. -->
        <div class="fs-board" class:has-win={hasWin} class:fs-beat={retriggerBeat}
             style="--fs-esc: {$scatterEscalation}">
          {#each vrows as reel, reelIdx}
            <!-- During the retrigger ladder the reels arrive one at a time, so
                 "visibly landed" means something inside this overlay. Every
                 other spin has revealedReels at 5 and renders whole. -->
            <div class="fs-reel" class:fs-reel-pending={reelIdx >= revealedReels}>
              {#each reel as sym, rowIdx}
                <div
                  class="fs-cell"
                  class:scatter={sym === 'S'}
                  class:wild={sym === 'W'}
                  class:win={winCells.has(reelIdx + ',' + rowIdx)}
                  class:dim={hasWin && !winCells.has(reelIdx + ',' + rowIdx)}
                >
                  <img src={symImg(sym)} alt={sym} draggable="false" />
                </div>
              {/each}
            </div>
          {/each}
          <!-- Win value pops over the highlighted connection (what you just won
               this spin); the running TOTAL WIN stays in the instrument column. -->
          {#if hasWin}
            {#key spinIndex}
              <div class="fs-spin-win">
                {fmt(currentSpin.spinWinCentibets)}{#if currentSpin.meterBefore > 1}<span class="fs-spin-mult"> ×{currentSpin.meterBefore}</span>{/if}
              </div>
            {/key}
          {/if}
          <!-- Retrigger notice (OWNER AUDIT ROUND 2, item 3): layered at the
               reel edge, outside the grid, small but alive - not a big
               centred banner. -->
          {#if showRetrigger}
            {#key spinIndex}
              <div class="fs-retrigger" data-testid="retrigger-pop">+5 {t(lang, 'freeSpins', mode)}</div>
            {/key}
          {/if}
        </div>
      </div>
    {:else if phase === 'end'}
      <!-- WIN BANNER V3 reuse (item 2): the actual celebration is the exact
           same neon-band <WinBanner> base-game big wins use, mounted as a
           stage-level sibling in App.svelte (bound out via endBannerAmount/
           endBannerMultiplier/endBannerTrigger below) so it shares the same
           full-width stage coordinate space rather than this dialog's own
           scaled grid-slot box. This dialog only shows the small title. -->
      <div class="fs-end">
        <div class="fs-title">{t(lang, 'featureComplete', mode)}</div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .fs-overlay {
    position: absolute; inset: 0; z-index: 80;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at center, rgba(8,8,26,0.72), rgba(4,4,14,0.92));
    font-family: 'Orbitron', sans-serif; color: #fff; text-align: center;
  }
  .fs-entry, .fs-end { display: flex; flex-direction: column; gap: 10px; }

  /* TR-036 option (b): a reel that has not landed yet during the retrigger
     ladder. Dimmed and blurred rather than removed, so the grid keeps its
     shape and only the outcome is withheld. */
  .fs-reel-pending { opacity: 0.28; filter: blur(3px) saturate(0.5); }
  .fs-reel { transition: opacity 160ms ease, filter 160ms ease; }
  /* The board itself lifts while the capped ladder runs, so the build reads on
     the surface the player is watching rather than only on the frame jets. */
  .fs-board.fs-beat {
    box-shadow: 0 0 0 2px rgba(0, 255, 255, calc(0.18 + 0.12 * var(--fs-esc, 0))),
                0 0 34px rgba(0, 255, 255, calc(0.10 + 0.10 * var(--fs-esc, 0)));
    transition: box-shadow 200ms ease;
  }
  .fs-title { font-size: 2rem; font-weight: 900; color: var(--theme-primary, #16f2e0); letter-spacing: 3px; text-shadow: 0 0 18px var(--theme-primary, #16f2e0); }
  .fs-sub { font-size: 1.2rem; color: var(--theme-secondary, #ff2ec4); }

  /* ── Overdrive transition (Motion Polish v2), staged entry sequence ───── */
  .fs-entry-stage { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

  .entry-scatter-flare {
    position: absolute; inset: -20%; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.55) 0%, rgba(255, 215, 0, 0.15) 40%, transparent 70%);
    opacity: 0; transition: opacity 0.25s ease;
  }
  .stage-flare .entry-scatter-flare, .stage-dip .entry-scatter-flare { opacity: 1; }

  .entry-dip {
    position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .stage-dip .entry-dip { opacity: 0.55; }

  .entry-gauge-wrap {
    position: relative; width: 240px; height: 240px; opacity: 0; transform: scale(0.4);
    transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .stage-gauge .entry-gauge-wrap, .stage-burst .entry-gauge-wrap { opacity: 1; transform: scale(1); }
  .stage-settle .entry-gauge-wrap { opacity: 0; transform: scale(1.18); transition: opacity 0.5s ease, transform 0.5s ease; }

  .entry-gauge-face, .entry-gauge-needle {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;
  }
  .entry-gauge-needle {
    transform-origin: 50% 50%; transform: rotate(-75deg);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .stage-gauge .entry-gauge-needle, .stage-burst .entry-gauge-needle { transform: rotate(0deg); }

  /* Smoke wisps (ANIMATION UPLIFT PASS 2026-07-16, item 2): a couple of
     smoke_puff particles drifting up during the flare/dip stages, tying the
     flame-jet ignition (FlameJets, synced via overdriveVisualActive) to a
     bit of atmosphere on the title-card overlay itself. */
  .entry-smoke-wisp {
    position: absolute; width: 90px; height: 90px; object-fit: contain; opacity: 0; pointer-events: none;
  }
  .entry-smoke-a { left: 30%; bottom: 38%; }
  .entry-smoke-b { left: 62%; bottom: 42%; animation-delay: 0.1s; }
  .stage-flare .entry-smoke-wisp, .stage-dip .entry-smoke-wisp { animation: smoke-rise 0.9s ease-out both; }

  @keyframes smoke-rise {
    0%   { opacity: 0; transform: translateY(10px) scale(0.7); }
    30%  { opacity: 0.5; }
    100% { opacity: 0; transform: translateY(-60px) scale(1.3); }
  }

  /* Title card (ANIMATION UPLIFT PASS 2026-07-16, item 2): slams in with the
     same overshoot curve as the gauge, exactly on the 'gauge' stage
     transition so the meter and the title read as one threshold moment. */
  .entry-title {
    position: absolute; top: 12%; left: 0; right: 0;
    font-size: 1.5rem; font-weight: 900; letter-spacing: 0.15em;
    color: var(--theme-primary, #16f2e0); text-shadow: 0 0 18px var(--theme-primary, #16f2e0);
    opacity: 0; transform: scale(0.4);
    transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .stage-gauge .entry-title, .stage-burst .entry-title { opacity: 1; transform: scale(1); }
  .stage-settle .entry-title { opacity: 0; transform: scale(1.08); }

  /* Shockwave ring (ANIMATION UPLIFT PASS 2026-07-16, item 2): the shared
     shock_ring particle, centred on the whole stage (same centre as the
     gauge) so it reads as one impact burst behind the title and gauge,
     expanding and fading right as they slam in. */
  .entry-shockwave {
    position: absolute; top: 50%; left: 50%; width: 260px; height: 260px;
    transform: translate(-50%, -50%) scale(0.2); opacity: 0; pointer-events: none;
  }
  .stage-gauge .entry-shockwave { animation: shockwave-burst 0.5s ease-out both; }

  @keyframes shockwave-burst {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
    15%  { opacity: 0.9; }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
  }

  /* Bottom group (OWNER AUDIT ROUND 3, item 3): anchored to the card's own
     lower border (bottom:2%, close to the edge rather than floating well
     above it), a flex column so the award text and the continue button
     stack with a real, guaranteed gap - they can never overlap regardless
     of the button's own height or the viewport's aspect ratio, unlike two
     independent bottom:N% elements. */
  .entry-bottom-group {
    position: absolute; left: 0; right: 0; bottom: 2%;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }

  .entry-burst-text {
    font-size: 2.1rem; font-weight: 900; color: #ffd700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.9);
    opacity: 0; transform: scale(0.5);
    transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .stage-burst .entry-burst-text { opacity: 1; transform: scale(1); }
  .stage-settle .entry-burst-text { opacity: 0; }

  /* CLICK TO CONTINUE gate (OWNER AUDIT ROUND 2, item 1) - sits below the
     burst text, appears the instant the gate opens (no entrance delay of
     its own beyond that), 44px+ touch target throughout. */
  .entry-continue {
    position: relative;
    display: flex; align-items: center; justify-content: center;
    /* This button lives inside the LAYOUT_SPEC 1280x720 stage coordinate
       system, which portrait scales down well below 1:1 (as low as ~0.58x
       measured on iPhone 14 portrait) - a plain 48px min-height rendered on
       screen at only ~28px, under the 44px touch-target floor
       (portrait_layout_conformance.mjs's touchTargetAudit caught this).
       96px pre-scale clears 44px on screen even at that smallest observed
       scale, with margin.

       TR-085, 2026-07-27: that reasoning was right and its scale was wrong.
       LANDSCAPE scales further than portrait ever does. Measured rendered
       heights of this 96-unit button: iPhone 14 portrait 55.8px, Pixel 7
       portrait 61.8px, but Pixel 7 landscape 32.1px and iPhone 14 landscape
       29.8px, the last of those a stage scale of 0.3104. So the button was
       under the floor on both landscape profiles while passing on both
       portrait ones, which is why the audit that found it only sees it
       sometimes. */
    min-height: 96px; padding: 0 28px;
    font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 900; letter-spacing: 0.12em;
    color: #0a0614; background: linear-gradient(180deg, #ffe98a, #ffd700 60%, #d9a81e);
    border: none; border-radius: 999px; cursor: pointer;
    box-shadow: 0 0 18px rgba(255, 215, 0, 0.75), 0 3px 8px rgba(0, 0, 0, 0.6);
    animation: continue-pulse 1.1s ease-in-out infinite;
  }
  /* The compact-visual-with-extended-hit pattern, as `.m-fm-entry` in
     FeatureMenu.svelte uses it: the visual keeps its size, the pseudo-element
     carries the touch target past the floor.

     Raising min-height instead would need about 142 units to clear 44px at the
     0.3104 landscape scale, and that extra third would be spent on desktop and
     portrait too, where the button is already generously sized. A control that
     must be enormous everywhere to be tappable somewhere is the wrong fix.

     28 units each side, derived not guessed: 96 + 56 = 152 units, which at the
     smallest measured scale of 0.3104 renders 47.2px against the 44px floor,
     roughly 7 per cent of margin. VERTICAL ONLY, because width was never the
     problem: the narrowest measured visual is 78.6px, comfortably clear, and
     widening the target sideways would push it under neighbouring layout for
     no gain. Nothing beside or above it in `.entry-bottom-group` is
     interactive, so the extension cannot swallow another control's press. */
  .entry-continue::after { content: ''; position: absolute; inset: -28px 0; }
  .entry-continue:hover, .entry-continue:focus-visible { filter: brightness(1.08); }
  @keyframes continue-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

  @media (prefers-reduced-motion: reduce) {
    .entry-scatter-flare, .entry-dip, .entry-gauge-wrap, .entry-gauge-needle, .entry-title, .entry-burst-text {
      transition: none;
    }
    .entry-smoke-wisp, .entry-shockwave { display: none; }
    .entry-continue { animation: none; }
    .fs-cell.win { animation: none; }
    .fs-spin-win { animation: none; }
    .fs-retrigger { animation: none; }
  }
  /* OWNER AUDIT ROUND 3, item 8: this width cap (92vw, a REAL viewport unit)
     was written as if this subtree renders at native browser scale, but it
     actually sits inside .grid-scale's fixed 616x412 stage-coordinate box,
     transformed to fit the viewport by an ancestor - 92vw could clip the
     616px-wide board below its real size depending on viewport width
     (exactly the residual shrink this item's hard assert catches). The
     board now sizes to its own content (616px) with no artificial cap. */
  .fs-stage { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  /* No top-right meter overlay any more (item 3) - the board sits centred,
     at maximum size, nothing dodging an overlay box.
     OWNER AUDIT ROUND 3, item 8: this DOM-mocked board is a separate
     representation from GameGrid.svelte's real PIXI canvas (not the same
     element re-skinned) - it was never actually sized to match it, so even
     though both sit inside the same 616x412 .grid-scale box, this board's
     old 72x72-cell/10px-gap geometry produced a 400x318 footprint, ~65%/77%
     of GameGrid's real 616x412 canvas (CELL_W=120, CELL_H=100, GAP=4 - see
     GameGrid.svelte). Cell/gap here now use those EXACT same numbers, so
     5*120 + 4*4 = 616 and 4*100 + 3*4 = 412 - byte-identical footprint,
     verified by hud_reel_size_check.mjs. */
  .fs-board { position: relative; display: flex; gap: 4px; }
  .fs-reel { display: flex; flex-direction: column; gap: 4px; }
  .fs-cell {
    position: relative;
    width: 120px; height: 100px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14);
    font-size: 1.1rem; font-weight: 700; color: #cfe;
    transition: opacity 0.2s ease;
  }
  .fs-cell img { width: 92%; height: 92%; object-fit: contain; display: block; }
  .fs-cell.scatter { border-color: var(--theme-secondary, #ff2ec4); box-shadow: 0 0 10px var(--theme-secondary, #ff2ec4); }
  .fs-cell.wild { border-color: var(--theme-primary, #16f2e0); }
  /* Win-connection story: winners light up + pulse, non-winners dim back so the
     connecting symbols across the reels read clearly. */
  .fs-cell.dim { opacity: 0.26; }
  .fs-cell.win {
    border-color: #ffd54a; z-index: 2;
    box-shadow: 0 0 16px 2px rgba(255, 213, 74, 0.8), inset 0 0 12px rgba(255, 213, 74, 0.4);
    animation: fs-win-pulse 0.7s ease-in-out infinite;
  }
  .fs-cell.win img { filter: brightness(1.15) drop-shadow(0 0 7px rgba(255, 213, 74, 0.85)); }
  @keyframes fs-win-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
  /* Win value callout on the connection (what you won this spin). */
  .fs-spin-win {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    z-index: 5; pointer-events: none;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2.1rem; font-weight: 900; color: #ffd54a;
    text-shadow: 0 0 14px rgba(255, 180, 0, 0.95), 0 2px 5px rgba(0, 0, 0, 0.9);
    padding: 0.15em 0.5em; border-radius: 10px;
    background: radial-gradient(ellipse at center, rgba(8, 6, 18, 0.7) 0%, rgba(8, 6, 18, 0) 72%);
    animation: fs-winpop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .fs-spin-mult { color: var(--theme-secondary, #ff2ec4); font-size: 1.4rem; }
  @keyframes fs-winpop {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  /* Retrigger notice (OWNER AUDIT ROUND 2, item 3): layered at the reel
     edge, OUTSIDE the grid (not a big centred banner blocking play) - a
     small pill that scale-ins with a glow over ~900ms, then holds briefly
     before the {#key spinIndex} block tears it down on the next spin. */
  .fs-retrigger {
    position: absolute; top: 50%; right: -14px; transform: translate(100%, -50%);
    z-index: 6; pointer-events: none; white-space: nowrap;
    font-size: 0.85rem; font-weight: 900; letter-spacing: 0.06em;
    color: #fff; padding: 6px 14px; border-radius: 999px;
    background: linear-gradient(135deg, rgba(255, 46, 196, 0.92), rgba(22, 242, 224, 0.85));
    box-shadow: 0 0 10px rgba(255, 46, 196, 0.8), 0 0 22px rgba(255, 46, 196, 0.45);
    animation: rtpop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes rtpop {
    0%   { transform: translate(100%, -50%) scale(0.3); opacity: 0; box-shadow: 0 0 0 rgba(255, 46, 196, 0); }
    45%  { transform: translate(100%, -50%) scale(1.15); opacity: 1; box-shadow: 0 0 16px rgba(255, 46, 196, 0.9), 0 0 30px rgba(255, 46, 196, 0.55); }
    100% { transform: translate(100%, -50%) scale(1); opacity: 1; box-shadow: 0 0 10px rgba(255, 46, 196, 0.8), 0 0 22px rgba(255, 46, 196, 0.45); }
  }
</style>
