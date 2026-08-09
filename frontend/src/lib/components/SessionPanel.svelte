<script lang="ts">
  // SessionPanel.svelte, responsible-gambling session display + reality check.
  // Shows time played, spins, and net win/loss; pops a reality-check reminder at
  // the jurisdiction interval. Money is integer micros.
  //
  // 2026-07-14c: the persistent TIME/SPINS/NET corner overlay used to show
  // whenever rgEnabled (or devForce) was true - intrusive in every layout,
  // including the new grid-first portrait composition, and present far more
  // often than any jurisdiction actually requires. Now split in two:
  //   - autoPinned: the corner overlay, shown ONLY when the jurisdiction's
  //     own mandatorySessionDisplay flag demands a persistently-visible
  //     session display (a real, distinct requirement in some markets, not
  //     the general rgEnabled switch).
  //   - the same information is ALWAYS reachable on demand as a sheet via the
  //     HUD menu's "Session" item (all three layout modes), which sets the
  //     shared showSessionPanel store this component reads.
  import { onMount, onDestroy } from 'svelte'
  import { tr } from '../i18n/tr'
  // t() is used directly for the reality-check body: $tr cannot carry the
  // {time} and {amount} parameters the master sentence interpolates.
  import { t } from '../i18n/translations'
  import {
    rgSession, rgNetMicros, rgJurisdiction, realityCheckDue, ackRealityCheck,
    showSessionPanel,
  } from '../stores/responsibleGambling'
  import { setModalOpen } from '../stores/modalGuard'
  import { isAutoPlay, autoPlayCount, locale } from '../stores/gameStore'

  // Fable's masters, 2026-07-25: "Stop playing" halts autoplay and returns to
  // idle. Acknowledging the check is not enough on its own - a reality check
  // that dismisses itself while autoplay keeps spinning is not a control, it is
  // a notification. App.svelte cancels any pending autoplay continuation the
  // moment isAutoPlay goes false, so clearing it here is sufficient to idle.
  function stopPlaying(): void {
    isAutoPlay.set(false)
    autoPlayCount.set(0)
    ackRealityCheck()
  }
  function continuePlaying(): void {
    ackRealityCheck()
  }
  import { currencyCode } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { formatBalance, formatWin } from '../utils/currency'

  $: autoPinned = $rgJurisdiction.mandatorySessionDisplay

  // A reality check demands acknowledgement, so it must suppress the spacebar
  // and pause autoplay. The on-demand sheet blocks too while it is open.
  $: setModalOpen('reality-check', $realityCheckDue)
  $: setModalOpen('session-panel', $showSessionPanel)
  function closeSheet(): void { showSessionPanel.set(false) }

  let nowMs = perf()
  let timer: ReturnType<typeof setInterval>
  function perf(): number {
    return typeof performance !== 'undefined' ? performance.now() : 0
  }
  onMount(() => {
    timer = setInterval(() => (nowMs = perf()), 1000)
  })
  onDestroy(() => clearInterval(timer))

  $: elapsedS = Math.max(0, Math.floor((nowMs - $rgSession.startMs) / 1000))
  $: hh = String(Math.floor(elapsedS / 3600)).padStart(2, '0')
  $: mm = String(Math.floor((elapsedS % 3600) / 60)).padStart(2, '0')
  $: ss = String(elapsedS % 60).padStart(2, '0')
  $: cur = $currencyCode || 'USD'
  $: net = $rgNetMicros
  $: netLabel = (net >= 0 ? '+' : '-') + formatWin(Math.abs(net), cur, $locale)
  // Was `$isSocial ? 'COINS' : ''`, the same duplicated-layer shape TR-091 is
  // about, hiding in the script block where even the widened gate cannot see it.
  // SOCIAL_OVERRIDES already maps `balance` to COINS in every locale, so this
  // asks for it rather than restating it in English.
  $: coinsWord = $isSocial ? $tr('balance') : ''
</script>

{#if autoPinned}
  <!-- Persistent corner overlay - ONLY when the jurisdiction's own
       mandatorySessionDisplay flag demands it (2026-07-14c). Absent by
       default everywhere else; see .sp-sheet below for the on-demand path
       every player can reach via the HUD menu regardless of jurisdiction. -->
  <div class="sp" role="status" aria-label={$tr('rgSessionTitle')} data-testid="session-panel-pinned">
    <div class="sp-row"><span>{$tr('hudTime')}</span><span class="sp-val">{hh}:{mm}:{ss}</span></div>
    <div class="sp-row"><span>{$tr('hudSpins')}</span><span class="sp-val">{$rgSession.spins}</span></div>
    <div class="sp-row"><span>{$tr('sessionNet')} {coinsWord}</span><span class="sp-val" class:neg={net < 0} class:pos={net > 0}>{netLabel}</span></div>
  </div>
{/if}

{#if $showSessionPanel}
  <!-- On-demand sheet (2026-07-14c) - opened via the HUD menu's "Session"
       item in every layout mode, shows the exact same information the
       auto-pinned overlay does. Always reachable regardless of jurisdiction,
       since checking your own session stats is a reasonable thing to want
       even where it isn't mandated. -->
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="sp-sheet-backdrop fs-scrim" role="dialog" aria-modal="true" aria-label={$tr('rgSessionTitle')} data-testid="session-panel-sheet" on:click={closeSheet}>
    <div class="sp-sheet" on:click|stopPropagation>
      <div class="sp-sheet-head">
        <h2>{$tr('rgSessionTitle')}</h2>
        <!-- Was the multiplication sign `×`, U+00D7. Orbitron carries it, so this
             was never a font leak, but it made three modals close with two
             different affordances, and it spent the same glyph the paytable and
             the mode cards use to mean "times". One drawn cross now, matching
             PaytableModal and FeatureMenu. QUALITY_CHARTER.md Q-05. -->
        <button class="sp-sheet-close" on:click={closeSheet} aria-label={$tr('a11yClose')}>
          <svg class="sp-close-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <!-- Fable's masters, 2026-07-25: five rows, in this order. The panel
           previously showed three and hardcoded "NET" in English. -->
      <div class="sp-row"><span>{$tr('rgTimePlayed')}</span><span class="sp-val">{hh}:{mm}:{ss}</span></div>
      <div class="sp-row"><span>{$tr('rgSpinsPlayed')}</span><span class="sp-val">{$rgSession.spins}</span></div>
      <div class="sp-row"><span>{$tr('rgTotalWagered')}</span><span class="sp-val">{formatBalance($rgSession.wageredMicros, cur, $locale)}</span></div>
      <div class="sp-row"><span>{$tr('rgTotalWon')}</span><span class="sp-val">{formatBalance($rgSession.wonMicros, cur, $locale)}</span></div>
      <div class="sp-row"><span>{$tr('rgNetResult')}</span><span class="sp-val" class:neg={net < 0} class:pos={net > 0}>{netLabel}</span></div>
    </div>
  </div>
{/if}

{#if $realityCheckDue}
  <div class="rc-backdrop fs-scrim" role="dialog" aria-modal="true" aria-label={$tr('rgRealityCheckTitle')}>
    <div class="rc-modal">
      <h2>{$tr('rgRealityCheckTitle')}</h2>
      <!-- The body is one interpolated sentence, exactly as supplied. It was
           previously two hardcoded English sentences that no locale could
           translate. $tr cannot carry params, so t() is called directly. -->
      <p data-testid="reality-check-body">
        {t($locale, 'rgRealityCheckBody', $isSocial ? 'social' : 'real', { time: `${hh}:${mm}:${ss}`, amount: netLabel })}
      </p>
      <div class="rc-actions">
        <button class="rc-ok" on:click={continuePlaying} data-testid="rc-continue">{$tr('rgContinuePlaying')}</button>
        <button class="rc-stop" on:click={stopPlaying} data-testid="rc-stop">{$tr('rgStopPlaying')}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .rc-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .rc-stop {
    padding: 9px 18px; border-radius: 8px; cursor: pointer;
    font-family: var(--fs-font-numeric); font-size: 12px; letter-spacing: 0.04em;
    background: rgba(30, 8, 12, 0.9); color: #ffd9d9;
    border: 1px solid rgba(255, 90, 90, 0.55);
  }
  .rc-stop:hover { background: rgba(52, 12, 18, 0.95); }

  .sp {
    position: fixed;
    top: calc(1rem + env(safe-area-inset-top, 0px));
    right: calc(1rem + env(safe-area-inset-right, 0px));
    z-index: 56;
    display: flex; flex-direction: column; gap: 3px; min-width: 128px;
    padding: 8px 12px; border-radius: 9px; font-family: var(--fs-font-numeric);
    background: rgba(6, 12, 22, 0.9); border: 1px solid rgba(0, 255, 255, 0.25); color: #cde;
  }
  /* 2026-07-14c: bumped from 0.6rem (9.6px, under the 11px legibility floor
     this project gates elsewhere) to 11px now that this row markup is also
     used in the on-demand sheet below - a genuinely reachable modal in every
     layout, not just a small corner overlay, so it gets the same floor. */
  .sp-row { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; letter-spacing: 0.04em; color: rgba(205,222,238,0.7); }
  .sp-val { color: #fff; font-variant-numeric: tabular-nums; font-size: 13px; }
  .sp-val.neg { color: #ff6b6b; }
  .sp-val.pos { color: #58e; }
  .rc-backdrop { z-index: 130; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.65); }
  .rc-modal { width: min(90vw, 360px); padding: 22px; border-radius: 14px; text-align: center; font-family: var(--fs-font-display); color: #fff; background: linear-gradient(160deg, #0c0c22, #08081a); border: 1px solid rgba(0,255,255,0.4); }
  .rc-modal h2 { color: #00ffff; font-size: 1.1rem; margin: 0 0 12px; }
  .rc-modal p { font-size: 0.85rem; opacity: 0.9; margin: 0 0 8px; }
  .rc-ok { margin-top: 14px; padding: 10px 26px; border: none; border-radius: 8px; background: #00ffff; color: #06121a; font-weight: 800; cursor: pointer; }

  /* On-demand session sheet (2026-07-14c) - reuses .sp-row/.sp-val, own
     modal chrome matching .rc-modal's visual language. */
  .sp-sheet-backdrop { z-index: 130;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, 0.65);
  }
  .sp-sheet {
    width: min(90vw, 360px);
    padding: 20px 22px;
    border-radius: 14px;
    font-family: var(--fs-font-numeric);
    color: #cde;
    background: linear-gradient(160deg, #0c0c22, #08081a);
    border: 1px solid rgba(0, 255, 255, 0.4);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .sp-sheet-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 6px;
  }
  .sp-sheet-head h2 { color: #00ffff; font-size: 1rem; letter-spacing: 0.08em; margin: 0; }
  .sp-close-glyph { width: 1.1em; height: 1.1em; display: block; margin: 0 auto; }
  .sp-close-glyph path { fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; }
  .sp-sheet-close {
    /* 44px, not a smaller "icon button" size - a real touch target, same
       floor this project holds every interactive element to. */
    width: 44px; height: 44px; min-width: 44px;
    border: none; border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: #cde;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }
</style>
