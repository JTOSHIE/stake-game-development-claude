<script lang="ts">
  // FeatureMenu.svelte — the SINGLE entry point for every LUMEN bet mode.
  //
  // One glowing FEATURES icon (reuses the LUMEN feature_button.png art) opens a
  // modal: a shared bet selector on top, then a scrollable list of cards — one
  // per mode from the source-of-truth config (src/lib/config/lumenModes.ts).
  //   · standing card (Surface) — informational, shows when it is the active base.
  //   · enhancer card (Deep Dive) — ON/OFF toggle bound to standingMode.
  //   · buy cards (Bloom / Abyssal Bloom) — cost (x bet) + ACTIVATE button that
  //     dispatches a 'buy' event the App routes to handleBuy(<mode id>).
  // A BET MODES button opens the info page (the paytable's Bet Modes section).
  //
  // Because everything renders from LUMEN_MODES, toggling a mode in/out later is
  // a one-line edit in the config — this component needs no change.
  import { createEventDispatcher } from 'svelte'
  import { LUMEN_MODES, LUMEN_RTP_LABEL } from '../config/lumenModes'
  import type { LumenMode } from '../config/lumenModes'
  import { standingMode, type BuyMode } from '../stores/betMode'
  import {
    betAmount, currencyCode, isSpinning, balance,
    increaseBet, decreaseBet, canIncreaseBet, showPaytable,
  } from '../stores/gameStore'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { themeAssets } from '../stores/themeStore'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { playClick } from '../services/soundService'

  const dispatch = createEventDispatcher<{ buy: BuyMode }>()

  let open = false

  $: cur = $currencyCode || 'USD'
  $: base = $themeAssets.assetBase
  const price = (cost: number) =>
    formatBalance(Math.round($betAmount * cost * CURRENCY_SCALE), cur)

  // Per-id icon (the config shape carries no icon; map it here). Buys use the
  // feature art; enhancer uses the scatter; the base uses the glow orb.
  const ICON: Record<string, string> = {
    surface: 'symbols/l3.png',
    deepdive: 'symbols/scatter.png',
    bloom: 'ui/feature_button.png',
    abyssalbloom: 'ui/feature_button.png',
  }
  const iconFor = (m: LumenMode) => `${base}/${ICON[m.id] ?? 'ui/feature_button.png'}`

  // Buy cards are hidden entirely where the jurisdiction disables feature buys.
  $: cards = LUMEN_MODES.filter((m) => m.kind !== 'buy' || !$buyFeatureDisabled)

  function openMenu(): void { if (!$isSpinning) { playClick(); open = true } }
  function close(): void { playClick(); open = false }

  function toggleEnhancer(m: LumenMode): void {
    playClick()
    standingMode.update((cur) => (cur === m.id ? 'surface' : (m.id as 'deepdive')))
  }

  function activateBuy(m: LumenMode): void {
    if ($isSpinning) return
    const cost = $betAmount * m.cost
    if ($balance < cost) return
    playClick()
    open = false
    dispatch('buy', m.id as BuyMode)
  }

  function openBetModesInfo(): void {
    playClick()
    open = false
    showPaytable.set(true)
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && open) close()
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- ── Single FEATURES entry icon (right of the frame) ─────────────────────── -->
<div class="feature-entry" data-testid="feature-menu-entry">
  <button
    class="entry-btn"
    on:click={openMenu}
    disabled={$isSpinning}
    aria-label="Features and bet modes"
    aria-haspopup="dialog"
    aria-expanded={open}
  >
    <img src="{base}/ui/feature_button.png" alt="" draggable="false" />
  </button>
  <div class="entry-label">FEATURES</div>
</div>

<!-- ── Modal ───────────────────────────────────────────────────────────────── -->
{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="fm-backdrop" role="dialog" aria-modal="true" aria-label="Features" tabindex="-1" on:click|self={close}>
    <div class="fm-panel">
      <div class="fm-header">
        <h2 class="fm-title">FEATURES</h2>
        <button class="fm-close" on:click={close} aria-label="Close">✕</button>
      </div>

      <!-- Shared bet selector on top -->
      <div class="fm-betbar">
        <span class="fm-betlabel">BET</span>
        <button class="fm-step" on:click={decreaseBet} disabled={$isSpinning} aria-label="Decrease bet">−</button>
        <span class="fm-betval" data-testid="feature-menu-bet">{formatBalance(Math.round($betAmount * CURRENCY_SCALE), cur)}</span>
        <button class="fm-step" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBet} aria-label="Increase bet">+</button>
      </div>

      <!-- Scrollable card list, rendered from the config -->
      <div class="fm-cards" data-testid="feature-menu-cards">
        {#each cards as m (m.id)}
          {@const isActiveStanding = $standingMode === m.id}
          <div class="fm-card" class:active={isActiveStanding} class:buy={m.kind === 'buy'}>
            <img class="fm-icon" src={iconFor(m)} alt="" draggable="false" />
            <div class="fm-info">
              <div class="fm-name-row">
                <span class="fm-name">{m.label}</span>
                <span class="fm-vol">{m.volatility}</span>
              </div>
              <p class="fm-blurb">{m.blurb}</p>
            </div>
            <div class="fm-action">
              <span class="fm-cost">{m.cost}× · {price(m.cost)}</span>
              {#if m.kind === 'enhancer'}
                <button
                  class="fm-toggle" class:on={isActiveStanding}
                  role="switch" aria-checked={isActiveStanding}
                  on:click={() => toggleEnhancer(m)} disabled={$isSpinning}
                  data-testid="enhancer-toggle-{m.id}"
                >{isActiveStanding ? 'ON' : 'OFF'}</button>
              {:else if m.kind === 'buy'}
                <button
                  class="fm-activate"
                  on:click={() => activateBuy(m)}
                  disabled={$isSpinning || $balance < $betAmount * m.cost}
                  data-testid="activate-{m.id}"
                >ACTIVATE</button>
              {:else}
                <span class="fm-standing-tag">{isActiveStanding ? 'ACTIVE' : 'BASE'}</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <div class="fm-footer">
        <span class="fm-rtp">All modes · RTP {LUMEN_RTP_LABEL}</span>
        <button class="fm-info-btn" on:click={openBetModesInfo} data-testid="open-bet-modes-info">BET MODES</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ── Entry icon — right of the frame (mirrors the old FeatureButton spot) ── */
  .feature-entry {
    position: absolute;
    left: 966px;
    top: 238px;
    width: 160px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .entry-btn {
    width: 160px; height: 160px;
    background: none; border: none; padding: 0; cursor: pointer;
    transition: transform 0.12s ease, filter 0.15s ease;
  }
  .entry-btn img {
    width: 100%; height: 100%; object-fit: contain; display: block;
    filter: drop-shadow(0 0 12px rgba(0, 240, 255, 0.5));
    animation: entry-glow 3s ease-in-out infinite;
  }
  @keyframes entry-glow {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.45)); }
    50%      { filter: drop-shadow(0 0 22px rgba(255, 46, 196, 0.7)); }
  }
  .entry-btn:hover:not(:disabled) { transform: scale(1.05); filter: brightness(1.15); }
  .entry-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .entry-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: #9becff;
    text-shadow: 0 0 8px rgba(0, 240, 255, 0.7);
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    .entry-btn img { animation: none; }
  }

  /* ── Modal ──────────────────────────────────────────────────────────────── */
  .fm-backdrop {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
    background: rgba(2, 6, 14, 0.82); backdrop-filter: blur(3px);
    animation: fm-fade 0.18s ease;
  }
  @keyframes fm-fade { from { opacity: 0; } to { opacity: 1; } }
  .fm-panel {
    width: 92%; max-width: 560px; max-height: 88%;
    display: flex; flex-direction: column;
    background: linear-gradient(165deg, #071324 0%, #040a16 100%);
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), 0 0 28px rgba(0, 240, 255, 0.15) inset;
    font-family: 'Orbitron', 'Segoe UI', sans-serif;
    animation: fm-pop 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes fm-pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  .fm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.95rem 1.3rem; border-bottom: 1px solid rgba(0, 240, 255, 0.14);
    flex-shrink: 0;
  }
  .fm-title {
    font-size: 1.15rem; font-weight: 900; letter-spacing: 0.16em;
    background: linear-gradient(135deg, #4ff6ff, #ff2ec4);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .fm-close {
    background: none; border: 1px solid rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.7); border-radius: 50%;
    width: 30px; height: 30px; cursor: pointer; font-size: 0.8rem;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .fm-close:hover { color: #fff; border-color: rgba(255, 255, 255, 0.5); }

  /* Shared bet selector */
  .fm-betbar {
    display: flex; align-items: center; gap: 0.8rem;
    padding: 0.7rem 1.3rem; flex-shrink: 0;
    border-bottom: 1px solid rgba(0, 240, 255, 0.1);
    background: rgba(0, 240, 255, 0.04);
  }
  .fm-betlabel {
    font-size: 0.62rem; letter-spacing: 0.14em; color: rgba(155, 236, 255, 0.65);
  }
  .fm-step {
    width: 30px; height: 30px; border-radius: 8px; cursor: pointer;
    background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.4);
    color: #9becff; font-size: 1.1rem; font-weight: 900; line-height: 1;
    display: flex; align-items: center; justify-content: center;
  }
  .fm-step:disabled { opacity: 0.35; cursor: default; }
  .fm-betval {
    min-width: 84px; text-align: center;
    font-size: 0.95rem; font-weight: 900; color: #ffd54a;
    font-variant-numeric: tabular-nums; text-shadow: 0 0 8px rgba(255, 213, 74, 0.4);
  }

  /* Card list */
  .fm-cards {
    overflow-y: auto; padding: 0.9rem 1.1rem;
    display: flex; flex-direction: column; gap: 0.7rem;
  }
  .fm-card {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.7rem 0.85rem; border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(0, 240, 255, 0.18);
    transition: border-color 0.15s, background 0.15s;
  }
  .fm-card.buy { border-color: rgba(255, 46, 196, 0.35); }
  .fm-card.active {
    border-color: #4ff6ff; background: rgba(0, 240, 255, 0.1);
    box-shadow: 0 0 14px rgba(0, 240, 255, 0.3);
  }
  .fm-icon { width: 52px; height: 52px; object-fit: contain; flex-shrink: 0; }
  .fm-info { flex: 1; min-width: 0; }
  .fm-name-row { display: flex; align-items: center; gap: 0.5rem; }
  .fm-name {
    font-size: 0.92rem; font-weight: 800; color: #eafcff; letter-spacing: 0.03em;
  }
  .fm-vol {
    font-size: 0.54rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    color: #ffb1ef; background: rgba(255, 46, 196, 0.14);
    border: 1px solid rgba(255, 46, 196, 0.35); border-radius: 999px;
    padding: 0.1rem 0.5rem; white-space: nowrap;
  }
  .fm-blurb {
    font-size: 0.72rem; color: rgba(200, 230, 245, 0.7); line-height: 1.4;
    margin: 0.2rem 0 0;
  }
  .fm-action {
    display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem;
    flex-shrink: 0;
  }
  .fm-cost {
    font-size: 0.62rem; color: #ffd54a; font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .fm-toggle {
    min-width: 58px; padding: 0.35rem 0.6rem; border-radius: 999px; cursor: pointer;
    font-family: inherit; font-size: 0.66rem; font-weight: 800; letter-spacing: 0.08em;
    background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.4);
    color: rgba(155, 236, 255, 0.7);
  }
  .fm-toggle.on {
    background: #4ff6ff; border-color: #4ff6ff; color: #04121c;
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
  }
  .fm-toggle:disabled { opacity: 0.5; cursor: default; }
  .fm-activate {
    min-width: 88px; padding: 0.4rem 0.7rem; border-radius: 8px; cursor: pointer;
    font-family: inherit; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.06em;
    background: linear-gradient(160deg, #ff2ec4, #a01e8f); border: none; color: #ffffff;
    box-shadow: 0 0 12px rgba(255, 46, 196, 0.4);
  }
  .fm-activate:disabled { opacity: 0.45; cursor: default; box-shadow: none; }
  .fm-standing-tag {
    font-size: 0.58rem; font-weight: 800; letter-spacing: 0.1em;
    color: #9becff; opacity: 0.85;
  }

  .fm-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1.3rem; flex-shrink: 0;
    border-top: 1px solid rgba(0, 240, 255, 0.12);
  }
  .fm-rtp { font-size: 0.66rem; letter-spacing: 0.06em; color: rgba(155, 236, 255, 0.6); }
  .fm-info-btn {
    padding: 0.4rem 0.9rem; border-radius: 8px; cursor: pointer;
    font-family: inherit; font-size: 0.66rem; font-weight: 800; letter-spacing: 0.08em;
    background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.4); color: #9becff;
  }
  .fm-info-btn:hover { background: rgba(0, 240, 255, 0.16); }

  @media (prefers-reduced-motion: reduce) {
    .fm-backdrop, .fm-panel { animation: none; }
  }
</style>
