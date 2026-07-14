<script lang="ts">
  // SessionPanel.svelte — responsible-gambling session display + reality check.
  // Shows time played, spins, and net win/loss; pops a reality-check reminder at
  // the jurisdiction interval. Rendered only where the jurisdiction enables RG
  // (rgEnabled) - off by default so the Stake/crypto model is unaffected. Also
  // shown in DEV for testing. Temporary CSS. Money is integer micros.
  import { onMount, onDestroy } from 'svelte'
  import { rgSession, rgNetMicros, rgJurisdiction, realityCheckDue, ackRealityCheck } from '../stores/responsibleGambling'
  import { currencyCode } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { formatBalance } from '../utils/currency'

  export let devForce = false // show in dev even without jurisdiction flags
  $: show = $rgJurisdiction.rgEnabled || devForce

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

{#if show}
  <div class="sp" role="status" aria-label="Session information">
    <div class="sp-row"><span>TIME</span><span class="sp-val">{hh}:{mm}:{ss}</span></div>
    <div class="sp-row"><span>SPINS</span><span class="sp-val">{$rgSession.spins}</span></div>
    <div class="sp-row"><span>NET {coinsWord}</span><span class="sp-val" class:neg={net < 0} class:pos={net > 0}>{netLabel}</span></div>
  </div>

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
  .sp-row { display: flex; justify-content: space-between; gap: 12px; font-size: 0.6rem; letter-spacing: 0.04em; color: rgba(205,222,238,0.7); }
  .sp-val { color: #fff; font-variant-numeric: tabular-nums; }
  .sp-val.neg { color: #ff6b6b; }
  .sp-val.pos { color: #58e; }
  .rc-backdrop { position: fixed; inset: 0; z-index: 130; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.65); }
  .rc-modal { width: min(90vw, 360px); padding: 22px; border-radius: 14px; text-align: center; font-family: 'Orbitron', sans-serif; color: #fff; background: linear-gradient(160deg, #0c0c22, #08081a); border: 1px solid rgba(0,255,255,0.4); }
  .rc-modal h2 { color: #00ffff; font-size: 1.1rem; margin: 0 0 12px; }
  .rc-modal p { font-size: 0.85rem; opacity: 0.9; margin: 0 0 8px; }
  .rc-net strong { color: #58e; }
  .rc-net strong.neg { color: #ff6b6b; }
  .rc-ok { margin-top: 14px; padding: 10px 26px; border: none; border-radius: 8px; background: #00ffff; color: #06121a; font-weight: 800; cursor: pointer; }
</style>
