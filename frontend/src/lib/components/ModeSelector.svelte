<script lang="ts">
  // ModeSelector.svelte — PRODUCTION standing-mode selector + buy tiers for the
  // shipped subset (see docs/SHIP_CONFIG.md): Cruise / Normal / Double Chance,
  // plus Bonus (100x) and Super (300x) buys. Sets the standingMode store used by
  // normal spins; buy buttons dispatch a 'buy' event the App routes to handleBuy.
  // Temporary CSS (final art in AssetForge v2). Buys hidden where jurisdiction bans them.
  import { createEventDispatcher } from 'svelte'
  import { standingMode, type StandingMode, type BuyMode } from '../stores/betMode'
  import { betAmount, currencyCode, isSpinning } from '../stores/gameStore'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'

  const dispatch = createEventDispatcher<{ buy: BuyMode }>()

  // Shipped standing modes (subset of the library).
  const MODES: { id: StandingMode; label: string; cost: number }[] = [
    { id: 'cruise', label: 'CRUISE',       cost: 1.0 },
    { id: 'base',   label: 'NORMAL',       cost: 1.0 },
    { id: 'ante',   label: 'DOUBLE',       cost: 1.5 },
  ]
  const BUYS: { id: BuyMode; label: string; cost: number }[] = [
    { id: 'bonus',    label: 'BUY',   cost: 100 },
    { id: 'superbuy', label: 'SUPER', cost: 300 },
  ]
  $: cur = $currencyCode || 'USD'
  const price = (m: number) => formatBalance(Math.round($betAmount * m * CURRENCY_SCALE), cur)
</script>

<div class="ms">
  <div class="ms-seg" role="group" aria-label="Play mode">
    {#each MODES as m}
      <button class="ms-mode" class:active={$standingMode === m.id}
              on:click={() => standingMode.set(m.id)} disabled={$isSpinning}
              aria-pressed={$standingMode === m.id}>
        <span class="ms-lbl">{m.label}</span>
        <span class="ms-cost">{m.cost}x</span>
      </button>
    {/each}
  </div>
  {#if !$buyFeatureDisabled}
    <div class="ms-buys">
      {#each BUYS as b}
        <button class="ms-buy" on:click={() => dispatch('buy', b.id)} disabled={$isSpinning}>
          <span class="ms-lbl">{b.label}</span>
          <span class="ms-price">{price(b.cost)}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .ms {
    display: flex; flex-direction: column; gap: 6px;
    font-family: 'Orbitron', sans-serif;
  }
  .ms-seg {
    display: inline-flex; border-radius: 10px; overflow: hidden;
    border: 1px solid rgba(0, 255, 255, 0.3); background: rgba(6, 12, 22, 0.85);
  }
  .ms-mode {
    display: flex; flex-direction: column; align-items: center; gap: 1px; cursor: pointer;
    padding: 6px 12px; border: 0; border-right: 1px solid rgba(0, 255, 255, 0.15);
    background: transparent; color: rgba(205, 222, 238, 0.8);
    transition: background 0.15s, color 0.15s;
  }
  .ms-mode:last-child { border-right: 0; }
  .ms-mode.active { background: rgba(0, 255, 255, 0.16); color: #aefcff; box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.2); }
  .ms-mode:disabled { opacity: 0.5; cursor: default; }
  .ms-lbl { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.04em; }
  .ms-cost { font-size: 0.56rem; color: #ffd54a; font-variant-numeric: tabular-nums; }
  .ms-buys { display: inline-flex; gap: 6px; }
  .ms-buy {
    display: flex; flex-direction: column; align-items: center; gap: 1px; cursor: pointer;
    padding: 6px 14px; border-radius: 9px;
    background: linear-gradient(160deg, #2a0d3a, #12071e);
    border: 1px solid var(--theme-secondary, #ff2ec4); color: var(--theme-secondary, #ff2ec4);
    box-shadow: 0 0 10px rgba(255, 46, 196, 0.3);
  }
  .ms-buy:disabled { opacity: 0.5; cursor: default; }
  .ms-buy .ms-lbl { font-size: 0.68rem; }
  .ms-price { font-size: 0.56rem; color: #ffd54a; font-variant-numeric: tabular-nums; }
</style>
