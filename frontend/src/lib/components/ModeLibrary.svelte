<script lang="ts">
  // ModeLibrary.svelte — DEV-only panel exposing the full 11-mode template library
  // so every bet mode can be played/tested. Standing modes set the store used by
  // normal spins; buy tiers dispatch a 'buy' event the App routes to handleBuy.
  // Not shipped to players (mounted behind import.meta.env.DEV); a production skin
  // exposes only the subset it ships. Temporary CSS.
  import { createEventDispatcher } from 'svelte'
  import { standingMode, STANDING_MODES, BUY_MODES, type BuyMode } from '../stores/betMode'
  import { betAmount, currencyCode, isSpinning } from '../stores/gameStore'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'

  const dispatch = createEventDispatcher<{ buy: BuyMode }>()
  let open = true
  $: cur = $currencyCode || 'USD'
  const price = (mult: number) => formatBalance(Math.round($betAmount * mult * CURRENCY_SCALE), cur)
</script>

<div class="ml" class:collapsed={!open}>
  <button class="ml-head" on:click={() => (open = !open)}>
    MODE LIBRARY <span class="ml-tag">DEV</span><span class="ml-chev">{open ? '−' : '+'}</span>
  </button>
  {#if open}
    <div class="ml-body">
      <div class="ml-sec">STANDING (cost x bet)</div>
      <div class="ml-grid">
        {#each STANDING_MODES as m}
          <button class="ml-btn" class:active={$standingMode === m.id}
                  on:click={() => standingMode.set(m.id)} disabled={$isSpinning} title={m.note}>
            <span class="ml-lbl">{m.label}</span>
            <span class="ml-cost">{m.cost}x · {price(m.cost)}</span>
          </button>
        {/each}
      </div>
      <div class="ml-sec">BUY (guaranteed feature)</div>
      <div class="ml-grid">
        {#each BUY_MODES as b}
          <button class="ml-btn buy" on:click={() => dispatch('buy', b.id)} disabled={$isSpinning} title={b.note}>
            <span class="ml-lbl">{b.label}</span>
            <span class="ml-cost">{b.cost}x · {price(b.cost)}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .ml {
    position: fixed; top: 1rem; left: 1rem; z-index: 58; width: 216px;
    font-family: 'Orbitron', monospace; color: #cde;
    background: rgba(6, 12, 22, 0.92); border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 10px; overflow: hidden; box-shadow: 0 0 16px rgba(0, 0, 0, 0.5);
  }
  .ml-head {
    width: 100%; display: flex; align-items: center; gap: 6px; cursor: pointer;
    padding: 7px 10px; font-size: 0.68rem; font-weight: 900; letter-spacing: 0.06em;
    color: #00ffff; background: rgba(0, 255, 255, 0.06); border: 0;
  }
  .ml-tag { font-size: 0.52rem; background: #00ffff; color: #06121a; border-radius: 3px; padding: 0 4px; }
  .ml-chev { margin-left: auto; font-size: 0.9rem; }
  .ml-body { padding: 8px; }
  .ml-sec { font-size: 0.55rem; letter-spacing: 0.08em; color: rgba(205, 222, 238, 0.6); margin: 4px 2px; }
  .ml-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 6px; }
  .ml-btn {
    display: flex; flex-direction: column; align-items: flex-start; gap: 1px; cursor: pointer;
    padding: 5px 7px; border-radius: 7px; text-align: left;
    background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(0, 255, 255, 0.2); color: #cde;
  }
  .ml-btn.buy { border-color: rgba(255, 46, 196, 0.4); }
  .ml-btn.active { background: rgba(0, 255, 255, 0.14); border-color: #00ffff; box-shadow: 0 0 8px rgba(0, 255, 255, 0.4); }
  .ml-btn:disabled { opacity: 0.5; cursor: default; }
  .ml-lbl { font-size: 0.64rem; font-weight: 700; }
  .ml-cost { font-size: 0.52rem; color: #ffd54a; font-variant-numeric: tabular-nums; }
  .collapsed { width: auto; }
</style>
