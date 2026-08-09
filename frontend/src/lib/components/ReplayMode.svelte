<script lang="ts">
  import { onMount } from 'svelte'
  import {
    parseReplayParams,
    fetchReplay,
    microsToDisplay,
    totalBetSpentMicros,
    currencySymbol,
  } from '../services/replayService'
  import { formatBalance, CURRENCY_SCALE, isVirtualCurrency } from '../utils/currency'
  import {
    replayParams,
    replayResponse,
    replayPhase,
    replayError,
  } from '../stores/replayStore'
  import GameGrid from './GameGrid.svelte'
  import WinDisplay from './WinDisplay.svelte'
  import WinPod from './WinPod.svelte'
  import FreeSpinsPresentation from './FreeSpinsPresentation.svelte'
  import MaxWinCelebration from './MaxWinCelebration.svelte'
  import { interpretEvents, type PresentationScript, type RawEvent } from '../services/roundInterpreter'
  import { socialAtBoot } from '../stores/socialMode'

  // Drive the animation pipeline by setting gameStore writables via their
  // public .set() API, gameStore.ts itself is NOT modified.
  import {
    boardSymbols,
    activeWins,
    scatterCount,
    winAmount,
    betAmount,
    currencyCode,
    isWincap,
    isSpinning,
    WINCAP,
  } from '../stores/gameStore'

  import type { ReplayParams, ReplayResponse } from '../services/replayService'

  // i18n, replay supports the ?lang= param; the disclaimer must follow it.
  import { t, type Locale, type GameMode } from '../i18n/translations'
  import { tr } from '../i18n/tr'
  import { resolveLaunchLocale } from '../stores/socialLocale'

  // Resolve the locale/mode eagerly so the disclaimer renders correctly even
  // during the initial loading phase (before onMount assigns `params`).
  const search = new URLSearchParams(window.location.search)
  // Same validator as the game route and as parseReplayParams, so the eager
  // first-paint locale cannot disagree with the one that arrives with `params`.
  const initialLang = resolveLaunchLocale(search.get('lang'), socialAtBoot) as Locale
  // R2R JOB 6 / TR-041. This derived the first-paint mode from the `social`
  // flag ALONE, so a replay URL carrying `currency=XSC` without the flag
  // painted the real-money disclaimer for one frame before the currency store
  // was written in startReplay. `socialAtBoot` resolves the flag AND the URL
  // currency at module load, before mount, which closes that frame.
  const initialMode: GameMode = socialAtBoot ? 'social' : 'real'

  // FIT THE GRID TO THE VIEWPORT, 2026-08-09.
  //
  // Published item "Supports Replays in Popout S view". GameGrid is a FIXED
  // 616x412 canvas. The GAME route handles that by scaling a fixed-size wrapper
  // through `--S`, computed in JS (App.svelte). The replay route never mirrored
  // it, so at Popout S (400x225) the grid laid out at its natural 616px inside a
  // 400px viewport: measured left -108, right 508, 64.9 per cent visible, and
  // because it is centred there is NO scroll position that shows all five reels.
  //
  // A CSS-only `min(1, calc(...))` was tried first and is a proven no-op, which
  // is why this computes the factor in script and why the fix was measured
  // rather than read.
  const GRID_W = 616
  const GRID_H = 412
  let replayFit = 1
  function recomputeFit(): void {
    if (typeof window === 'undefined') return
    // 2rem of breathing room, matching the container's own padding.
    const avail = Math.max(0, window.innerWidth - 32)
    replayFit = Math.min(1, avail / GRID_W)
  }
  if (typeof window !== 'undefined') recomputeFit()

  let params: ReplayParams | null = null
  let response: ReplayResponse | null = null
  let phase: 'loading' | 'ready' | 'playing' | 'complete' | 'error' = 'loading'
  let error: string | null = null
  let gridRef: GameGrid

  // Overdrive free-spins playback (feature rounds).
  let featureScript: PresentationScript | null = null
  let featureActive = false
  let featureResolve: (() => void) | null = null
  function onFeatureComplete(): void {
    featureActive = false
    const r = featureResolve
    featureResolve = null
    if (r) r()
  }

  // Wincap flow (applies to replay too): show the MAX WIN splash immediately,
  // wait for COLLECT, then present the complete round sequence, finishing on
  // the total win summary, same order as live play.
  let wincapCollectResolve: (() => void) | null = null
  function handleWincapCollect(): void {
    isWincap.set(false)
    const r = wincapCollectResolve
    wincapCollectResolve = null
    if (r) r()
  }

  onMount(async () => {
    try {
      const p = parseReplayParams()
      if (!p) {
        // Should never happen, App.svelte should only render this in replay mode.
        throw new Error('ReplayMode rendered outside of replay mode.')
      }
      params = p
      replayParams.set(p)

      const r = await fetchReplay(p)
      response = r
      replayResponse.set(r)
      phase = 'ready'
      replayPhase.set('ready')
    } catch (e: any) {
      // THE PLAYER-FACING STRING IS ALWAYS THE KEYED ONE, 2026-08-09.
      //
      // This used to paint `e.message` straight into .error-detail. That message
      // is built in replayService.fetchReplay as
      //   `Replay fetch failed (404 Not Found). URL: https://.../bet/replay/...`
      // so on any non-2xx the replay window showed a raw RGS URL, untranslated
      // and never vocabulary-scanned, whose path carries the segment `/bet/`.
      // In StakeUS social mode that put a restricted word on screen directly
      // beneath a carefully compliant disclaimer, against the published item
      // "Replay window does not contain restricted words". The social scan
      // covers KEYED strings, so a raw thrown message is invisible to it by
      // construction.
      //
      // The raw text is still available to a developer, just not to a player.
      if (import.meta.env.DEV) console.error('[replay] load failed:', e)
      error = $tr('replayLoadError')
      phase = 'error'
      replayPhase.set('error')
      replayError.set(error)
    }
  })

  onMount(() => {
    recomputeFit()
    window.addEventListener('resize', recomputeFit)
    return () => window.removeEventListener('resize', recomputeFit)
  })

  async function startReplay() {
    if (!response || !params) return
    phase = 'playing'
    replayPhase.set('playing')

    try {
      // ══════════════════════════════════════════════════════════════════════
      // R2R JOB 5, 2026-07-25. EVERY ROUND GOES THROUGH THE CANONICAL READER.
      // ══════════════════════════════════════════════════════════════════════
      //
      // Round-two reviewer 3's second BLOCKER. This function used the canonical
      // interpreter ONLY when the round carried a `freeSpinTrigger`. Every
      // ordinary round - every loss, every base win, every capped base round -
      // fell through to a search for three event types:
      //
      //   { type: 'board',   data: { symbols } }
      //   { type: 'win',     data: { symbol, kind, ways, payout } }
      //   { type: 'scatter', data: { count, ... } }
      //
      // None of them exists. They are the same invented schema PR #103 removed
      // from the live path, left behind here. Measured across the first 300
      // rounds of the shipped `books_base.jsonl.zst`: reveal 724, winInfo 499,
      // and board 0, win 0, scatter 0. So `board` resolved to `[]`, no reel
      // animation ran, `activeWins` was empty and `scatterCount` was 0: a
      // player replaying an ordinary win watched a static, empty grid. Bet
      // Replay is a mandatory platform requirement, which is why this is a
      // blocker rather than a defect.
      //
      // There is now ONE call to `interpretEvents` covering every round, and
      // the base-round mapping below is line-for-line the mapping
      // `rgsService._parsePlayResponse` performs, so replay and live cannot
      // disagree about what a round means. The `response.state.board` fallback
      // is gone too: it was a second invented shape, and falling back to one
      // invention when another is missing is not a fallback.
      const events: RawEvent[] = Array.isArray(response.state?.events)
        ? (response.state.events as RawEvent[])
        : []

      // Set bet + currency so amounts format correctly during playback.
      betAmount.set(microsToDisplay(params.amount))
      currencyCode.set(params.currency)

      const betDollars = microsToDisplay(params.amount)
      const script = interpretEvents(events)

      // --- Overdrive free-spins round -------------------------------------
      // If the replayed round triggered the feature, play the full free-spins
      // sequence via the shared interpreter and presentation overlay. The
      // disclaimer stays visible in every phase (rendered at the top).
      if (script.triggered) {
        const wincapNow = response.payoutMultiplier >= WINCAP
        if (wincapNow) {
          // Wincap flow applies in replay too: splash first, then on COLLECT
          // present the complete round sequence, finishing on the summary.
          isWincap.set(true)
          await new Promise<void>((resolve) => { wincapCollectResolve = resolve })
        }
        featureScript = script
        featureActive = true
        await new Promise<void>((resolve) => { featureResolve = resolve })
        winAmount.set(microsToDisplay(response.payoutMultiplier * params.amount))
        // MAX-WIN HOLD (owner's order, 2026-07-28): the terminal splash is
        // raised LAST, after the replay has already finished. Raising it before
        // the phase change left the overlay sitting over a replay that then
        // completed underneath it. Same reordering as the ordinary-round branch
        // below, where the gap was two seconds wide rather than one tick.
        phase = 'complete'
        replayPhase.set('complete')
        isWincap.set(wincapNow)
        return
      }

      // --- Ordinary round, from the canonical reader -----------------------
      const base = script.baseSpin

      // `reveal` carries SIX rows per reel: the visible 5x4 grid plus one
      // padding row above and below, used by the spin animation and never
      // shown. slice(1, -1) drops exactly one row at each end. Counting the
      // padding as real is the error behind the retracted six-scatter claim
      // (CLAUDE.md convention (l), worked example).
      const board: string[][] = base.board.map((reel) =>
        reel.slice(1, reel.length - 1).map((cell) => cell.name),
      )

      // Wins arrive in centibets (bet-multiples x100). `activeWins` holds
      // DOLLARS, which is what App.svelte puts there after a live spin. The
      // deleted code put micros here, from a field that never existed.
      const winEvents = base.wins.map((w) => ({
        symbol: w.symbol,
        kind:   w.kind,
        ways:   w.ways,
        payout: (w.winCentibets / 100) * betDollars,
      }))

      // Wincap flow (non-feature base round reaching the cap, see the
      // feature-round branch above for the more common triggered case):
      // splash first, wait for COLLECT, then the reel reveal below plays as
      // the "how it happened" presentation, finishing on the summary.
      const wincapNow = response.payoutMultiplier >= WINCAP
      if (wincapNow) {
        isWincap.set(true)
        await new Promise<void>((resolve) => { wincapCollectResolve = resolve })
      }

      // Drive the reel spin animation (identical pipeline to live game)
      isSpinning.set(true)
      if (gridRef && board.length > 0) {
        await gridRef.animateSpin(board)
      }
      isSpinning.set(false)

      // Populate result stores, exactly as App.svelte does post-spin
      boardSymbols.set(board)
      activeWins.set(winEvents)
      // The interpreter counts scatters on the VISIBLE window, not the padded
      // board, which is the same count the live path shows.
      scatterCount.set(base.scatterCount)
      // winAmount drives the derived winMultiplier (winAmount / betAmount)
      winAmount.set(microsToDisplay(response.payoutMultiplier * params.amount))

      // Let win-line and celebration animations complete
      await new Promise((r) => setTimeout(r, 2000))

      phase = 'complete'
      replayPhase.set('complete')

      // MAX-WIN HOLD (owner's order, 2026-07-28). This raise USED TO SIT ABOVE
      // the two seconds and the phase change, which is the owner's rule broken
      // on a mandatory approval surface: the celebration came back up after the
      // player had already collected it once, with nothing awaiting a second
      // COLLECT, and the replay then ran to completion behind it. A reviewer
      // watching Bet Replay saw a max-win splash that had quietly become the
      // end of the round while it was still on screen.
      //
      // Raised LAST instead of deleted, because ending a capped replay on the
      // max-win screen is a reasonable terminal state and this file's own
      // comment above says the presentation finishes on the summary. Now both
      // are true: the summary settles, the replay completes, and only then does
      // the splash come up, with nothing left to run underneath it.
      isWincap.set(wincapNow)
    } catch (e: any) {
      isSpinning.set(false)
      error = e?.message ?? $tr('replayPlaybackError')
      phase = 'error'
      replayPhase.set('error')
      replayError.set(error)
    }
  }

  function playAgain() {
    // Reset visible state and let user trigger startReplay again
    activeWins.set([])
    winAmount.set(0)
    isWincap.set(false)
    scatterCount.set(0)
    phase = 'ready'
    replayPhase.set('ready')
  }

  // Display helpers
  $: baseBet = params ? microsToDisplay(params.amount) : 0
  $: totalSpent = params && response
    ? microsToDisplay(totalBetSpentMicros(params.amount, response.costMultiplier))
    : 0
  // THE MULTIPLIER IS ALWAYS SHOWN, including at 1.0x. Guideline item 50 asks the
  // UI to display the bet cost AND the applied multiplier, and this used to read
  // `response.costMultiplier !== 1.0`, which made the branch DEAD for base and
  // cruise, the two 1.0x modes and the two a reviewer is most likely to replay.
  //
  // The committed capture at reports/screens/dtt-live-2026-07-26/ shows the cost
  // of that: the platform's own Bets panel reads "Cost multiplier x1.00" while our
  // overlay beside it, in the same viewport, said nothing. Suppressing a value the
  // platform displays next to us is the fastest way to fail an item we otherwise
  // meet.
  //
  // Rendered raw, as it always was. A two-decimal form would read closer to the
  // platform's own "x1.00", but machine_tell_gate correctly refuses toFixed() on
  // anything money-adjacent and a cosmetic match is not worth an allowlist entry.
  // The defect here was the SUPPRESSION, not the format.
  $: showCostMultiplier = response !== null

  // Disclaimer text, prefer parsed params once available, else the eager values.
  $: locale = (params?.lang ?? initialLang) as Locale
  $: mode = (params?.social ? 'social' : initialMode) as GameMode
  $: disclaimer = t(locale, 'replayDisclaimer', mode)
</script>

<div class="replay-container">
  <!-- Replay disclaimer, always visible, Stake Engine compliance. Makes clear
       this is a non-interactive replay of a past round with no real wager. -->
  <div class="replay-disclaimer" role="note">{disclaimer}</div>

  <!-- Wincap flow applies in replay too: splash first, then COLLECT reveals
       the full round sequence (see startReplay). -->
  <MaxWinCelebration show={$isWincap} on:collect={handleWincapCollect} />

  {#if phase === 'loading'}
    <div class="replay-status loading">{$tr('replayLoading')}</div>
  {:else if phase === 'error'}
    <div class="replay-status error">
      <div class="error-title">{$tr('replayFailed')}</div>
      <div class="error-detail">{error}</div>
    </div>
  {:else if params && response}
    <!-- Game grid is always shown once data is ready -->
    <div class="grid-area" style="--replay-S: {replayFit}">
      <GameGrid bind:this={gridRef} />
      <FreeSpinsPresentation
        script={featureScript}
        active={featureActive}
        on:complete={onFeatureComplete}
      />
      <!-- THE POD BELONGS TO THE GRID BOX. WinPod is position:absolute with
           `right: -220px; top: 50%`, and its own comment says those resolve
           against the grid. Rendered inside `.win-area` they did not: that is a
           200x56 box BELOW the grid, so `right:-220px` put the pod 188px INSIDE
           the 616px grid's span and `top:50%` centred 320px of pod on 56px of
           readout. Measured after driving a replay to completion: 188x108 over
           the reel grid and 46x62 over the whole height of REPLAY AGAIN, and at
           Popout S it pushed document scrollWidth to 520 against a 400px
           viewport. replay_fit_gate asserts that overflow but stops at the READY
           phase, where .win-area is not mounted, so it could not see it.
           2026-08-10. -->
      {#if phase === 'complete' || phase === 'playing'}
        <WinPod />
      {/if}
    </div>

    <!-- Win amount display once replay has played out -->
    {#if phase === 'complete' || phase === 'playing'}
      <div class="win-area">
        <WinDisplay />
      </div>
    {/if}

    <!-- Replay controls (compliant with Stake Engine spec) -->
    <div class="replay-controls">
      {#if phase === 'ready'}
        <button class="replay-btn start-replay" on:click={startReplay}>
          <div class="btn-line-1">{t(params.lang as Locale, 'hudStartReplay', mode)}</div>
          <div class="btn-line-2">Mode: <strong>{params.mode}</strong></div>
        </button>
      {:else if phase === 'playing'}
        <div class="replay-status playing">{$tr('replayingRound')}</div>
      {:else if phase === 'complete'}
        <button class="replay-btn play-again" on:click={playAgain}>
          {t(params.lang as Locale, 'replayAgain', mode)}
        </button>
      {/if}
    </div>

    <!-- THE REPLAY FIGURES, and they are deliberately OUTSIDE every phase branch.
         S2-C006. These lived inside `{#if phase === 'ready'}` as the start
         button's third line, so the moment a reviewer pressed Start they
         vanished and never came back. The platform asks for them in the state
         AFTER the replay has run, not only before it:
           approval_guidelines_game_replay_requirements.md:134
             "Show results - Display bet cost, payout, and win amount"
           approval_guidelines_game_replay_requirements.md:113
             "Display final results - Keep the win amount and outcome visible"
         So guideline item 50 was satisfied in the ready phase and by nothing at
         all in the playing and complete phases, which is exactly the phase a
         reviewer looks at when they check the result against the Bets panel.

         Hoisted here beside the currency display, which is already
         phase-independent for the same reason. The button is left as the
         button. Commit ae40604's rule that the multiplier shows even at 1.0x
         is unchanged and still carried by showCostMultiplier below. -->
    <!-- Grouped so the new row costs one tight inner gap instead of a second
         1.5rem container gap. The figures and the currency line are read
         together anyway: they are the money facts a reviewer checks against the
         platform's own Bets panel. -->
    <div class="replay-meta">
      <div class="replay-figures">
        {mode === 'social' ? 'Play' : 'Bet'}: <strong>{formatBalance(Math.round(baseBet * CURRENCY_SCALE), params.currency, params.lang)}</strong>
        {#if showCostMultiplier}
          × {response.costMultiplier} {mode === 'social' ? '=' : 'cost ='}
          <strong>{formatBalance(Math.round(totalSpent * CURRENCY_SCALE), params.currency, params.lang)}</strong>
        {/if}
      </div>

    <!-- Currency display. The replay spec's UI Simplification table lists
         "Currency display" under Keep/Show, so this stays. Two constraints
         apply on top of it, both fixed 2026-07-25:
           1. Virtual currencies must show the player-facing symbol, never the
              raw platform code. Printing "XSC" at a player is exactly what the
              jurisdiction rules prohibit.
           2. The word "currency" is itself on the stake.us prohibited-terms
              table (currency -> token), so the label switches in social mode. -->
    <div class="currency-display">
      {mode === 'social' ? 'Token' : 'Currency'}:
      <strong>{isVirtualCurrency(params.currency)
        ? currencySymbol(params.currency, params.lang)
        : params.currency}</strong>
      </div>
    </div>
  {/if}
</div>

<style>
  .replay-container {
    /* TR-076. Positioned above App.svelte's fixed .bg-layer (z-index 0), the
       same relationship .game-stage (z-index 2) has in normal play. Without
       this the backdrop painted over the whole replay UI, leaving START
       REPLAY a shadow under the dark overlay. */
    position: relative;
    z-index: 2;
    width: 100%;
    /* MIN-height, not height. With `height: 100vh` and `justify-content:
       center`, content taller than the viewport overflows BOTH ways, and the
       top half is permanently unreadable because scrollTop cannot go negative.
       That put the compliance disclaimer out of reach at 1024x576 and below,
       and adding the S2-C006 figures row would have done the same at 1280x720.
       Measured, not reasoned: reports/screens/replay-figures/ carries the
       frames and the fit ledger is quoted in the commit.
       With min-height the container grows to its content, centring still
       applies whenever there is spare room, and every overflow goes downward
       where a scroll can reach it. */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* SAFE centring, corrected 2026-07-31. Plain `justify-content: center`
       reproduces, one level down, the exact defect the comment above describes
       for `height: 100vh`: once the content is taller than the box, centring
       splits the overflow BOTH ways and the top half becomes unreachable,
       because this route does not scroll (App.svelte puts `overflow: hidden` on
       body). `min-height` alone does not prevent that, it only delays it until
       the content grows, which is what the win area does after the replay plays.

       `safe` is the purpose-built keyword: it centres while there is room and
       falls back to start alignment the moment the content would overflow.
       Measured on dist after this change: the disclaimer is fully visible at 8
       of 8 presets in the ready phase and 8 of 8 after playing. */
    justify-content: safe center;
    gap: 1.5rem;
    padding: 2rem 1rem;
    box-sizing: border-box;
    background: #060610;
    font-family: var(--fs-font-display);
    color: #00FFFF;
  }

  .replay-disclaimer {
    flex: 0 0 auto;
    max-width: 560px;
    text-align: center;
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.4;
    color: #FFD700;
    background: rgba(255, 215, 0, 0.08);
    border: 1px solid rgba(255, 215, 0, 0.35);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    letter-spacing: 0.01em;
  }

  .grid-area {
    position: relative;
    flex: 0 0 auto;
    width: 616px;
    height: 412px;
    transform: scale(var(--replay-S, 1));
    transform-origin: top center;
    /* A transform does not change the LAID-OUT box, so without these the column
       still reserves 616x412 and the row still overflows. Negative margins
       collapse the box to the scaled size: full height removed below, and half
       the removed width on each side, which keeps `top center` centred.
       Deliberately NOT `.grid-area > :global(*)`: that also hits .fs-overlay,
       which is position:absolute inset:0 and would be scaled twice. */
    margin-bottom: calc((var(--replay-S, 1) - 1) * 412px);
    margin-left: calc((var(--replay-S, 1) - 1) * 308px);
    margin-right: calc((var(--replay-S, 1) - 1) * 308px);
  }

  .win-area {
    position: relative;
  }

  .replay-controls {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .replay-btn {
    background: linear-gradient(135deg, #00FFFF, #FF00FF);
    color: #060610;
    font-family: var(--fs-font-display);
    font-weight: 700;
    border: none;
    border-radius: 12px;
    padding: 1.25rem 2.5rem;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 0 24px rgba(0, 255, 255, 0.4);
    text-align: center;
    min-width: 280px;
  }

  .replay-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 32px rgba(255, 0, 255, 0.5);
  }

  .replay-btn:active {
    transform: translateY(0);
  }

  .btn-line-1 {
    font-size: 1.5rem;
    font-weight: 900;
    margin-bottom: 0.5rem;
    letter-spacing: 0.1em;
  }

  /* .btn-line-3 was removed with the figures it carried. Svelte prunes unused
     selectors and warns on them, so the rule goes with the markup rather than
     being left behind as a dead selector. */
  .btn-line-2 {
    font-size: 0.875rem;
    font-weight: 400;
    margin-top: 0.25rem;
  }

  .play-again {
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    padding: 1rem 3rem;
  }

  .replay-status {
    font-family: var(--fs-font-display);
    font-size: 1.25rem;
    text-align: center;
  }

  .replay-status.loading {
    color: #00FFFF;
  }

  .replay-status.error {
    color: #FF6666;
  }

  .replay-status.playing {
    color: #FF00FF;
    font-weight: 700;
  }

  .error-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .error-detail {
    font-size: 0.875rem;
    font-weight: 400;
    opacity: 0.85;
    max-width: 480px;
  }

  /* One tight group rather than two container-gap children. The container gap
     is 1.5rem, so adding the figures as a sibling would have cost 24px of gap
     on top of the row itself, on a surface already overflowing at four of the
     eight required presets. */
  .replay-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
  }

  /* The figures a reviewer checks against the platform's own Bets panel. Sized
     and weighted a step above the currency line because this is the required
     content of guideline item 50, not a supporting label, and it now has to
     read on its own rather than as the third line of a large button. */
  .replay-figures {
    font-family: var(--fs-font-display);
    font-size: 1rem;
    font-weight: 700;
    color: #FFD700;
    text-align: center;
  }

  .currency-display {
    font-size: 0.875rem;
    color: #FFD700;
    opacity: 0.8;
  }

  /* Mobile adjustments per Stake Engine viewport spec
     (Mobile S 320×568 is the smallest required size) */
  @media (max-width: 480px) {
    .replay-container {
      padding: 1rem 0.5rem;
      gap: 1rem;
    }
    .replay-disclaimer {
      font-size: 0.75rem;
      padding: 0.625rem 0.75rem;
    }
    .replay-btn {
      min-width: 240px;
      padding: 1rem 1.5rem;
    }
    .btn-line-1 {
      font-size: 1.25rem;
    }
  }
</style>
