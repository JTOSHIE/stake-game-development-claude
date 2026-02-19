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

  <!-- Bet controls -->
  <div class="bet-controls">
    <button class="btn small" on:click={setMinBet} disabled={$isSpinning}>MIN</button>
    <button class="btn small" on:click={decreaseBet} disabled={$isSpinning}>−</button>
    <span class="bet-value">${$betAmount.toFixed(2)}</span>
    <button class="btn small" on:click={increaseBet} disabled={$isSpinning}>+</button>
    <button class="btn small" on:click={setMaxBet}   disabled={$isSpinning}>MAX</button>
  </div>

  <!-- Spin button -->
  <button
    class="spin-btn"
    class:spinning={$isSpinning}
    disabled={!$canSpin}
    on:click={handleSpin}
    aria-label={t($locale, 'spin')}
  >
    {#if $isSpinning}
      <span class="spin-icon">⟳</span>
    {:else}
      {t($locale, 'spin')}
    {/if}
  </button>

  <!-- Auto-play / Buy-Bonus controls -->
  <div class="aux-controls">

    <!-- Auto-play -->
    {#if $isAutoPlay}
      <button class="btn auto active" on:click={stopAuto}>
        AUTO {$autoPlayCount}
      </button>
    {:else}
      <div class="auto-wrapper">
        <button class="btn small" on:click={() => showAutoMenu = !showAutoMenu} disabled={$isSpinning}>
          {t($locale, 'autoPlay')}
        </button>
        {#if showAutoMenu}
          <div class="auto-menu">
            {#each AUTO_OPTIONS as n}
              <button class="menu-item" on:click={() => startAuto(n)}>{n}</button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Buy Bonus -->
    <button
      class="btn bonus"
      on:click={handleBuyBonus}
      disabled={!$canBuyBonus}
      title={t($locale, 'buyBonusDesc')}
    >
      {t($locale, 'buyBonus')}
    </button>
  </div>
</div>

<style>
  .control-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(0,0,0,0.6);
    border-top: 1px solid rgba(255,200,50,0.15);
  }

  .bet-controls {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .bet-value {
    min-width: 64px;
    text-align: center;
    color: #fff;
    font-size: 1rem;
    font-weight: 700;
    font-family: 'Courier New', monospace;
  }

  .btn {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    color: #ccc;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.4rem 0.7rem;
    letter-spacing: 0.05em;
    transition: background 0.15s, color 0.15s;
  }

  .btn:hover:not(:disabled) {
    background: rgba(255,200,50,0.15);
    color: #ffc832;
    border-color: rgba(255,200,50,0.4);
  }

  .btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .btn.bonus {
    border-color: rgba(160,228,255,0.4);
    color: #a0e4ff;
  }

  .btn.auto.active {
    border-color: #4eff91;
    color: #4eff91;
    animation: blink 1s ease-in-out infinite alternate;
  }

  @keyframes blink {
    to { opacity: 0.5; }
  }

  .spin-btn {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, #ffe066, #e6a800);
    border: 3px solid #ffd700;
    color: #1a1000;
    font-size: 0.9rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(255,200,50,0.4);
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .spin-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255,200,50,0.7);
  }

  .spin-btn:active:not(:disabled) {
    transform: scale(0.96);
  }

  .spin-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .spin-btn.spinning .spin-icon {
    display: inline-block;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .aux-controls {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: center;
  }

  .auto-wrapper { position: relative; }

  .auto-menu {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a2e;
    border: 1px solid rgba(255,200,50,0.3);
    border-radius: 6px;
    overflow: hidden;
    z-index: 10;
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
  }

  .menu-item:hover { background: rgba(255,200,50,0.15); }
</style>
