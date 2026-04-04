<script lang="ts">
  import {
    betAmount, canSpin, canIncreaseBet, canSetMaxBet,
    isSpinning, isAutoPlay, autoPlayCount,
    isTurbo, isMuted, showPaytable,
    increaseBet, decreaseBet, setMaxBet, setMinBet,
    locale, currencyCode, BET_LEVELS,
  } from '../stores/gameStore'
  import { t } from '../i18n/translations'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { playClick } from '../services/soundService'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher<{ spin: void }>()

  const AUTO_OPTIONS = [10, 25, 50, 100]
  let showAutoMenu = false

  function handleSpin() {
    if ($canSpin) dispatch('spin')
  }

  function startAuto(count: number) {
    playClick()
    autoPlayCount.set(count)
    isAutoPlay.set(true)
    showAutoMenu = false
    dispatch('spin')
  }

  function stopAuto() {
    playClick()
    isAutoPlay.set(false)
    autoPlayCount.set(0)
  }

  function handleIncreaseBet() {
    playClick()
    increaseBet()
  }

  function handleDecreaseBet() {
    playClick()
    decreaseBet()
  }

  function handleMaxBet() {
    playClick()
    setMaxBet()
  }

  function toggleTurbo() {
    playClick()
    isTurbo.update(v => !v)
  }

  function toggleMute() {
    isMuted.update(v => !v)
  }

  function openPaytable() {
    playClick()
    showPaytable.set(true)
  }
</script>

<div class="control-bar">

  <!-- ── Utility row: Turbo / Mute / Info ─────────────────────────────────── -->
  <div class="utility-row">
    <button
      class="util-btn"
      class:util-active={$isTurbo}
      on:click={toggleTurbo}
      disabled={$isSpinning}
      aria-label="Toggle turbo mode"
      title="Turbo"
    >⚡</button>

    <button
      class="util-btn"
      class:util-active={!$isMuted}
      on:click={toggleMute}
      aria-label={$isMuted ? 'Unmute' : 'Mute'}
      title={$isMuted ? 'Unmute' : 'Mute'}
    >{$isMuted ? '🔇' : '🔊'}</button>

    <button
      class="util-btn"
      on:click={openPaytable}
      disabled={$isSpinning}
      aria-label={t($locale, 'paytable')}
      title={t($locale, 'paytable')}
    >ℹ</button>
  </div>

  <!-- ── Main controls row ────────────────────────────────────────────────── -->
  <div class="main-row">

  <!-- ── Left cluster: Bet selector + Min/Max ─────────────────────────────── -->
  <div class="bet-cluster">

    <!-- Bet selector panel (image background) -->
    <div class="bet-selector-panel">
      <button class="nudge-btn" on:click={handleDecreaseBet} disabled={$isSpinning} aria-label="Decrease bet">−</button>

      <div class="bet-value-wrap">
        <div class="bet-text-pill">
          <span class="bet-label">{t($locale, 'bet')}</span>
          <span class="bet-value">{formatBalance($betAmount * CURRENCY_SCALE, $currencyCode)}</span>
        </div>
      </div>

      <button class="nudge-btn" on:click={handleIncreaseBet} disabled={$isSpinning || !$canIncreaseBet} aria-label="Increase bet">+</button>
    </div>

    <!-- Max Bet image button -->
    <button class="maxbet-btn" on:click={handleMaxBet} disabled={$isSpinning || !$canSetMaxBet} aria-label={t($locale, 'maxBet')}>
      <img src="/assets/symbols/ui_maxbet_button_variant_02.png" alt="Max Bet" draggable="false" />
      <span class="maxbet-label">MAX</span>
    </button>
  </div>

  <!-- ── Centre: Spin button (image) ─────────────────────────────────────── -->
  <div class="spin-wrap">
    <button
      class="img-btn spin-btn"
      class:spinning={$isSpinning}
      disabled={!$canSpin}
      on:click={handleSpin}
      aria-label={t($locale, 'spin')}
    >
      <img
        src="/assets/ui/spin_button.png"
        alt={t($locale, 'spin')}
        draggable="false"
      />
      {#if $isSpinning}
        <span class="spin-overlay">⟳</span>
      {/if}
    </button>
  </div>

  <!-- ── Right cluster: Autoplay + Buy Bonus ──────────────────────────────── -->
  <div class="aux-cluster">

    <!-- Autoplay image button -->
    <div class="auto-wrapper">
      {#if $isAutoPlay}
        <button class="img-btn auto-btn active" on:click={stopAuto} aria-label="Stop autoplay">
          <img src="/assets/ui/btn_menu.png" alt="Autoplay" draggable="false" />
          <span class="auto-label">AUTO</span>
          <span class="auto-count">{$autoPlayCount}</span>
        </button>
      {:else}
        <button
          class="img-btn auto-btn"
          on:click={() => showAutoMenu = !showAutoMenu}
          disabled={$isSpinning}
          aria-label={t($locale, 'autoPlay')}
        >
          <img src="/assets/ui/btn_menu.png" alt="Autoplay" draggable="false" />
          <span class="auto-label">AUTO</span>
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

  </div>

  </div><!-- /main-row -->
</div>

<style>
  /* ── Bar container ──────────────────────────────────────────────────────── */
  .control-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 1rem 0.8rem;
    /* Semi-transparent dark strip — keeps art visible through it */
    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 100%);
    border-top: 1px solid rgba(255, 200, 50, 0.12);
    flex-shrink: 0;
    position: relative;
  }

  /* ── Utility row ─────────────────────────────────────────────────────────── */
  .utility-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .util-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    font-size: 0.9rem;
    width: 30px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    padding: 0;
    line-height: 1;
  }

  .util-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
    filter: brightness(1.1);
  }

  .util-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    filter: grayscale(0.4);
  }

  .util-btn.util-active {
    background: rgba(255, 200, 50, 0.12);
    border-color: rgba(255, 200, 50, 0.35);
    color: #ffc832;
  }

  /* Inner buttons row (bet + spin + aux) — three clear zones */
  .main-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 0 12px;
    gap: 0;
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
    opacity: 0.45;
    cursor: not-allowed;
    filter: grayscale(0.4);
  }

  /* ── Spin button ─────────────────────────────────────────────────────────── */
  .spin-btn {
    width: 96px;
    height: 96px;
    flex-shrink: 0;
    border-radius: 50%;
    box-shadow:
      0 0 20px rgba(0, 255, 255, 0.4),
      0 0 40px rgba(0, 255, 255, 0.2);
    transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
  }

  .spin-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow:
      0 0 30px rgba(255, 0, 255, 0.6),
      0 0 60px rgba(255, 0, 255, 0.3);
    filter: brightness(1.2) drop-shadow(0 0 12px rgba(255, 0, 255, 0.8));
  }

  .spin-btn:active:not(:disabled) {
    transform: scale(0.96);
    transition-duration: 0.05s;
  }

  .spin-btn:disabled {
    opacity: 0.4;
    filter: grayscale(0.6);
    box-shadow: none;
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

  /* ── Left zone — bet cluster ────────────────────────────────────────────── */
  .bet-cluster {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 0 0 auto;
  }

  /* Bet selector: image panel as background frame */
  .bet-selector-panel {
    display: flex;
    align-items: center;
    gap: 0;

    background-image: url('/assets/ui/btn_bet_display_v2.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-color: transparent;
    border: none;
    box-shadow: none;

    width: 148px;
    height: 48px;
    padding: 0 2px;
  }

  .nudge-btn {
    background-color: transparent;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border: none;
    color: transparent;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    min-width: 52px;
    min-height: 52px;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: opacity 0.1s, transform 0.1s, filter 0.1s;
    flex-shrink: 0;
  }

  .nudge-btn[aria-label="Decrease bet"] {
    background-image: url('/assets/ui/btn_bet_minus_v2.png');
  }

  .nudge-btn[aria-label="Increase bet"] {
    background-image: url('/assets/ui/btn_bet_plus_v2.png');
  }

  .nudge-btn:hover:not(:disabled) {
    transform: scale(1.06);
    filter: brightness(1.2) drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
  }

  .nudge-btn:active:not(:disabled) {
    transform: scale(0.95);
    transition-duration: 0.05s;
  }

  .nudge-btn:disabled { opacity: 0.45; cursor: not-allowed; filter: grayscale(0.4); }

  .bet-value-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Dark pill — same treatment as BalanceDisplay for consistent contrast */
  .bet-text-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    background: rgba(0, 0, 0, 0.60);
    border-radius: 4px;
    padding: 2px 6px;
  }

  .bet-label {
    font-size: 0.52rem;
    letter-spacing: 0.12em;
    color: rgba(255, 200, 50, 0.90);
    text-transform: uppercase;
    line-height: 1;
    display: block;
  }

  .bet-value {
    font-size: 0.98rem;
    font-weight: 700;
    color: #fff;
    font-family: 'Courier New', monospace;
    line-height: 1.2;
    display: block;
  }

  /* Max Bet button — cyberpunk styled with label */
  .maxbet-btn {
    width: 56px;
    height: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    filter: drop-shadow(0 0 6px rgba(0, 255, 255, 0.35));
    transition: filter 0.15s, transform 0.1s;
  }

  .maxbet-btn img {
    width: 40px;
    height: 28px;
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
  }

  .maxbet-label {
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: rgba(0, 255, 255, 0.8);
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
  }

  .maxbet-btn:hover:not(:disabled) {
    filter: brightness(1.2) drop-shadow(0 0 12px rgba(0, 255, 255, 0.7));
    transform: scale(1.06);
  }

  .maxbet-btn:active:not(:disabled) {
    transform: scale(0.95);
    transition-duration: 0.05s;
  }

  .maxbet-btn:disabled { opacity: 0.45; cursor: not-allowed; filter: grayscale(0.4); }

  /* ── Centre zone — spin button ─────────────────────────────────────────── */
  .spin-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 0 16px;
  }

  /* ── Right zone — utility cluster ──────────────────────────────────────── */
  .aux-cluster {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  /* Autoplay button */
  .auto-wrapper { position: relative; }

  .auto-btn {
    width: 56px;
    height: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .auto-label {
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: rgba(0, 255, 255, 0.7);
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
  }

  .auto-btn.active .auto-label {
    color: #00ffff;
    text-shadow: 0 0 6px rgba(0, 255, 255, 0.8);
  }

  /* Active auto-play: cyan glow */
  .auto-btn.active img {
    filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8));
    animation: pulse-glow 1s ease-in-out infinite alternate;
  }

  @keyframes pulse-glow {
    to { filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.3)); }
  }

  /* Remaining spin count badge */
  .auto-count {
    position: absolute;
    top: 2px;
    right: 4px;
    background: #00ffff;
    color: #000020;
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

</style>
