<script lang="ts">
  // SessionPanel.svelte — responsible-gambling session display + reality check.
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
  import {
    rgSession, rgNetMicros, rgJurisdiction, realityCheckDue, ackRealityCheck,
    showSessionPanel,
  } from '../stores/responsibleGambling'
  import { currencyCode } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { formatBalance } from '../utils/currency'

  $: autoPinned = $rgJurisdiction.mandatorySessionDisplay
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
  $: netLabel = (net >= 0 ? '+' : '-') + formatBalance(Math.abs(net), cur)
  $: coinsWord = $isSocial ? 'COINS' : ''
</script>

{#if autoPinned}
  <!-- Persistent corner overlay - ONLY when the jurisdiction's own
       mandatorySessionDisplay flag demands it (2026-07-14c). Absent by
       default everywhere else; see .sp-sheet below for the on-demand path
       every player can reach via the HUD menu regardless of jurisdiction. -->
  <div class="sp" role="status" aria-label="Session information" data-testid="session-panel-pinned">
    <div class="sp-row"><span>TIME</span><span class="sp-val">{hh}:{mm}:{ss}</span></div>
    <div class="sp-row"><span>SPINS</span><span class="sp-val">{$rgSession.spins}</span></div>
    <div class="sp-row"><span>NET {coinsWord}</span><span class="sp-val" class:neg={net < 0} class:pos={net > 0}>{netLabel}</span></div>
  </div>
{/if}

{#if $showSessionPanel}
  <!-- On-demand sheet (2026-07-14c) - opened via the HUD menu's "Session"
       item in every layout mode, shows the exact same information the
       auto-pinned overlay does. Always reachable regardless of jurisdiction,
       since checking your own session stats is a reasonable thing to want
       even where it isn't mandated. -->
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="sp-sheet-backdrop" role="dialog" aria-modal="true" aria-label="Session information" data-testid="session-panel-sheet" on:click={closeSheet}>
    <div class="sp-sheet" on:click|stopPropagation>
      <div class="sp-sheet-head">
        <h2>SESSION</h2>
        <button class="sp-sheet-close" on:click={closeSheet} aria-label="Close">×</button>
      </div>
      <div class="sp-row"><span>TIME</span><span class="sp-val">{hh}:{mm}:{ss}</span></div>
      <div class="sp-row"><span>SPINS</span><span class="sp-val">{$rgSession.spins}</span></div>
      <div class="sp-row"><span>NET {coinsWord}</span><span class="sp-val" class:neg={net < 0} class:pos={net > 0}>{netLabel}</span></div>
    </div>
  </div>
{/if}

{#if $realityCheckDue}
  <div class="rc-backdrop" role="dialog" aria-modal="true" aria-label="Reality check">
    <div class="rc-modal">
      <h2>REALITY CHECK</h2>
      <p>You have been playing for {hh}:{mm}:{ss} over {$rgSession.spins} spins.</p>
      <p class="rc-net">Net this session: <strong class:neg={net < 0}>{netLabel}</strong></p>
      <button class="rc-ok" on:click={ackRealityCheck}>CONTINUE</button>
    </div>
  </div>
{/if}

<style>
  .sp {
    position: fixed;
    top: calc(1rem + env(safe-area-inset-top, 0px));
    right: calc(1rem + env(safe-area-inset-right, 0px));
    z-index: 56;
    display: flex; flex-direction: column; gap: 3px; min-width: 128px;
    padding: 8px 12px; border-radius: 9px; font-family: 'Orbitron', monospace;
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
  .rc-backdrop { position: fixed; inset: 0; z-index: 130; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.65); }
  .rc-modal { width: min(90vw, 360px); padding: 22px; border-radius: 14px; text-align: center; font-family: 'Orbitron', sans-serif; color: #fff; background: linear-gradient(160deg, #0c0c22, #08081a); border: 1px solid rgba(0,255,255,0.4); }
  .rc-modal h2 { color: #00ffff; font-size: 1.1rem; margin: 0 0 12px; }
  .rc-modal p { font-size: 0.85rem; opacity: 0.9; margin: 0 0 8px; }
  .rc-net strong { color: #58e; }
  .rc-net strong.neg { color: #ff6b6b; }
  .rc-ok { margin-top: 14px; padding: 10px 26px; border: none; border-radius: 8px; background: #00ffff; color: #06121a; font-weight: 800; cursor: pointer; }

  /* On-demand session sheet (2026-07-14c) - reuses .sp-row/.sp-val, own
     modal chrome matching .rc-modal's visual language. */
  .sp-sheet-backdrop {
    position: fixed; inset: 0; z-index: 130;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, 0.65);
  }
  .sp-sheet {
    width: min(90vw, 360px);
    padding: 20px 22px;
    border-radius: 14px;
    font-family: 'Orbitron', monospace;
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
