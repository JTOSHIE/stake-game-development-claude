<script lang="ts">
  import {
    betAmount, canSpin, canBuyBonus, isSpinning, isAutoPlay,
    autoPlayCount, buyBonusActive,
    increaseBet, decreaseBet, setMaxBet, setMinBet,
    locale, BET_LEVELS,
  } from '../stores/gameStore'
  import { t } from '../i18n/translations'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher<{ spin: void; buyBonus: void }>()

  const AUTO_OPTIONS = [10, 25, 50, 100]
  let showAutoMenu = false

  function handleSpin() {
    if ($canSpin) dispatch('spin')
  }

  function handleBuyBonus() {
    if ($canBuyBonus) {
      buyBonusActive.set(true)
      dispatch('buyBonus')
    }
  }

  function startAuto(count: number) {
    autoPlayCount.set(count)
    isAutoPlay.set(true)
    showAutoMenu = false
    dispatch('spin')
  }

  function stopAuto() {
    isAutoPlay.set(false)
    autoPlayCount.set(0)
  }
</script>

<div class="control-bar">

  <!-- ── Left cluster: Bet selector + Min/Max ─────────────────────────────── -->
  <div class="bet-cluster">

    <!-- Bet selector panel (image background) -->
    <div class="bet-selector-panel">
      <button class="nudge-btn" on:click={decreaseBet} disabled={$isSpinning} aria-label="Decrease bet">−</button>

      <div class="bet-value-wrap">
        <span class="bet-label">{t($locale, 'bet')}</span>
        <span class="bet-value">${$betAmount.toFixed(2)}</span>
      </div>

      <button class="nudge-btn" on:click={increaseBet} disabled={$isSpinning} aria-label="Increase bet">+</button>
    </div>

    <!-- Max Bet image button -->
    <button class="img-btn maxbet-btn" on:click={setMaxBet} disabled={$isSpinning} aria-label={t($locale, 'maxBet')}>
      <img src="/assets/symbols/ui_maxbet_button_variant_02.png" alt="Max Bet" draggable="false" />
    </button>
  </div>

  <!-- ── Centre: Spin button (image) ─────────────────────────────────────── -->
  <button
    class="img-btn spin-btn"
    class:spinning={$isSpinning}
    disabled={!$canSpin}
    on:click={handleSpin}
    aria-label={t($locale, 'spin')}
  >
    <img
      src="/assets/symbols/ui_spin_button_variant_03.png"
      alt={t($locale, 'spin')}
      draggable="false"
    />
    {#if $isSpinning}
      <span class="spin-overlay">⟳</span>
    {/if}
  </button>

  <!-- ── Right cluster: Autoplay + Buy Bonus ──────────────────────────────── -->
  <div class="aux-cluster">

    <!-- Autoplay image button -->
    <div class="auto-wrapper">
      {#if $isAutoPlay}
        <button class="img-btn auto-btn active" on:click={stopAuto} aria-label="Stop autoplay">
          <img src="/assets/symbols/ui_autoplay_button_variant_02_original.png" alt="Autoplay" draggable="false" />
          <span class="auto-count">{$autoPlayCount}</span>
        </button>
      {:else}
        <button
          class="img-btn auto-btn"
          on:click={() => showAutoMenu = !showAutoMenu}
          disabled={$isSpinning}
          aria-label={t($locale, 'autoPlay')}
        >
          <img src="/assets/symbols/ui_autoplay_button_variant_02_original.png" alt="Autoplay" draggable="false" />
        </button>
        {#if showAutoMenu}
          <div class="auto-menu">
            {#each AUTO_OPTIONS as n}
              <button class="menu-item" on:click={() => startAuto(n)}>{n}</button>
            {/each}
          </div>
        {/if}
      {/if}
    </div>

    <!-- Buy Bonus text button (no dedicated image asset) -->
    <button
      class="bonus-btn"
      on:click={handleBuyBonus}
      disabled={!$canBuyBonus}
      title={t($locale, 'buyBonusDesc')}
      aria-label={t($locale, 'buyBonus')}
    >
      {t($locale, 'buyBonus')}
    </button>
  </div>
</div>

<style>
  /* ── Bar container ──────────────────────────────────────────────────────── */
  .control-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
    padding: 0.6rem 1rem 0.8rem;
    /* Semi-transparent dark strip — keeps art visible through it */
    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 100%);
    border-top: 1px solid rgba(255, 200, 50, 0.12);
    flex-shrink: 0;
    position: relative;
  }

  /* ── Generic image-button reset ─────────────────────────────────────────── */
  .img-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s, filter 0.15s;
  }

  .img-btn img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    /* Prevent browser drag ghost */
    user-select: none;
    -webkit-user-drag: none;
  }

  .img-btn:hover:not(:disabled) {
    filter: brightness(1.15) drop-shadow(0 0 8px rgba(255,200,50,0.5));
  }

  .img-btn:active:not(:disabled) {
    transform: scale(0.93);
  }

  .img-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* ── Spin button ─────────────────────────────────────────────────────────── */
  .spin-btn {
    width: 96px;
    height: 96px;
    flex-shrink: 0;
  }

  .spin-btn.spinning img {
    animation: spin-img 0.7s linear infinite;
  }

  @keyframes spin-img {
    to { transform: rotate(360deg); }
  }

  /* Rotating glyph overlay shown during spin */
  .spin-overlay {
    position: absolute;
    font-size: 2rem;
    color: rgba(255,255,255,0.9);
    animation: spin-img 0.5s linear infinite;
    pointer-events: none;
  }

  /* ── Bet cluster ─────────────────────────────────────────────────────────── */
  .bet-cluster {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  /* Bet selector: image panel as background frame */
  .bet-selector-panel {
    display: flex;
    align-items: center;
    gap: 0;

    background-image: url('/assets/symbols/ui_bet_selector_variant_04_original.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;

    width: 140px;
    height: 44px;
    padding: 0 6px;
  }

  .nudge-btn {
    background: none;
    border: none;
    color: #ffc832;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    padding: 0 6px;
    line-height: 1;
    transition: color 0.1s, transform 0.1s;
    flex-shrink: 0;
  }

  .nudge-btn:hover:not(:disabled) {
    color: #fff;
    transform: scale(1.2);
  }

  .nudge-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .bet-value-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1.15;
  }

  .bet-label {
    font-size: 0.52rem;
    letter-spacing: 0.12em;
    color: rgba(255, 200, 50, 0.65);
    text-transform: uppercase;
  }

  .bet-value {
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
    font-family: 'Courier New', monospace;
  }

  /* Max Bet image button */
  .maxbet-btn {
    width: 80px;
    height: 28px;
  }

  /* ── Right cluster ────────────────────────────────────────────────────────── */
  .aux-cluster {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  /* Autoplay button */
  .auto-wrapper { position: relative; }

  .auto-btn {
    width: 80px;
    height: 44px;
  }

  /* Active auto-play: gold glow */
  .auto-btn.active img {
    filter: drop-shadow(0 0 8px rgba(78, 255, 145, 0.8));
    animation: pulse-glow 1s ease-in-out infinite alternate;
  }

  @keyframes pulse-glow {
    to { filter: drop-shadow(0 0 4px rgba(78, 255, 145, 0.3)); }
  }

  /* Remaining spin count badge */
  .auto-count {
    position: absolute;
    top: 2px;
    right: 4px;
    background: #4eff91;
    color: #001a09;
    font-size: 0.65rem;
    font-weight: 800;
    border-radius: 10px;
    padding: 0 4px;
    pointer-events: none;
  }

  /* Auto-play count dropdown */
  .auto-menu {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 10, 30, 0.95);
    border: 1px solid rgba(255, 200, 50, 0.3);
    border-radius: 8px;
    overflow: hidden;
    z-index: 20;
    min-width: 70px;
  }

  .menu-item {
    display: block;
    width: 100%;
    padding: 0.4rem 1rem;
    background: none;
    border: none;
    color: #ffc832;
    cursor: pointer;
    font-size: 0.85rem;
    text-align: center;
    transition: background 0.1s;
  }

  .menu-item:hover { background: rgba(255, 200, 50, 0.15); }

  /* ── Buy Bonus text button (no dedicated image) ──────────────────────────── */
  .bonus-btn {
    background: rgba(160, 228, 255, 0.08);
    border: 1px solid rgba(160, 228, 255, 0.35);
    color: #a0e4ff;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 0.3rem 0.7rem;
    text-transform: uppercase;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    width: 80px;
  }

  .bonus-btn:hover:not(:disabled) {
    background: rgba(160, 228, 255, 0.18);
    border-color: #a0e4ff;
    color: #fff;
  }

  .bonus-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
