<script lang="ts">
  // HudOverlay.svelte — LAYOUT_SPEC v3.1 generic HUD panel.
  // Reskin-free per DESIGN_SYSTEM (the only themed accent inside it is TURBO,
  // which reuses the existing turbo treatment with an engage glow). Replaces
  // the retired ControlBar: bet ladder, spin, autoplay, turbo/speed, and the
  // hamburger menu (paytable + mute) all live here now.
  import { createEventDispatcher } from 'svelte'
  import {
    betAmount, balance, canSpin, currencyCode,
    isSpinning, isAutoPlay, autoPlayCount,
    isMuted, showPaytable, winAmount, BET_LEVELS,
  } from '../stores/gameStore'
  import { rgsBetLevels } from '../stores/rgsBetLevels'
  import { speedTier, cycleSpeed } from '../stores/speedMode'
  import { tr } from '../i18n/tr'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { playClick } from '../services/soundService'

  const dispatch = createEventDispatcher<{ spin: void }>()

  const AUTO_OPTIONS = [10, 25, 50, 100]
  let showAutoMenu = false
  let showMenu = false

  // ── Bet ladder — ported from the retired ControlBar unchanged ────────────
  $: activeLevels = $rgsBetLevels.length > 0 ? $rgsBetLevels : BET_LEVELS

  function nearestLevel(levels: number[], value: number): number {
    return levels.reduce(
      (best, lvl) => (Math.abs(lvl - value) < Math.abs(best - value) ? lvl : best),
      levels[0],
    )
  }

  $: if (activeLevels.length > 0 && !activeLevels.includes($betAmount)) {
    betAmount.set(nearestLevel(activeLevels, $betAmount))
  }

  $: curIndex = activeLevels.indexOf($betAmount)
  $: canIncrease =
    curIndex > -1 &&
    curIndex < activeLevels.length - 1 &&
    activeLevels[curIndex + 1] <= $balance
  $: canDecrease = curIndex > 0

  function handleSpin() {
    if ($canSpin) dispatch('spin')
  }

  function increaseBet() {
    playClick()
    const idx = activeLevels.indexOf($betAmount)
    if (idx > -1 && idx < activeLevels.length - 1 && activeLevels[idx + 1] <= $balance) {
      betAmount.set(activeLevels[idx + 1])
    }
  }

  function decreaseBet() {
    playClick()
    const idx = activeLevels.indexOf($betAmount)
    if (idx > 0) betAmount.set(activeLevels[idx - 1])
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

  function toggleAutoMenu() {
    if ($isAutoPlay) { stopAuto(); return }
    showAutoMenu = !showAutoMenu
  }

  function toggleTurbo() {
    playClick()
    cycleSpeed()
  }

  function toggleMenu() {
    showMenu = !showMenu
  }

  function openPaytable() {
    playClick()
    showPaytable.set(true)
    showMenu = false
  }

  function toggleMute() {
    isMuted.update((v) => !v)
  }

  $: balanceLabel = formatBalance(Math.round($balance * CURRENCY_SCALE), $currencyCode || 'USD')
  $: betLabel     = formatBalance(Math.round($betAmount * CURRENCY_SCALE), $currencyCode || 'USD')
  $: winLabel     = formatBalance(Math.round($winAmount * CURRENCY_SCALE), $currencyCode || 'USD')
</script>

<!-- HUD panel — spec x 320..960, y 560..648, radius 18, z 60 -->
<div class="hud-panel" data-testid="hud-panel">
  <button
    class="turbo-btn"
    class:engaged={$speedTier !== 'normal'}
    on:click={toggleTurbo}
    disabled={$isSpinning}
    aria-label="Cycle speed (Normal / Turbo / Super Turbo)"
    title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}
  >
    <span class="turbo-glyph">⚡</span>
    <span class="turbo-tier">{$speedTier === 'normal' ? '1×' : $speedTier === 'turbo' ? '2×' : '4×'}</span>
  </button>

  <div class="menu-wrapper">
    <button class="hamburger-btn" on:click={toggleMenu} aria-label="Menu" aria-expanded={showMenu}>
      <span class="bar"></span><span class="bar"></span><span class="bar"></span>
    </button>
    {#if showMenu}
      <div class="hud-menu" role="menu">
        <button class="hud-menu-item" role="menuitem" on:click={openPaytable}>{$tr('paytable')}</button>
        <button class="hud-menu-item" role="menuitem" on:click={toggleMute}>
          {$isMuted ? 'Unmute' : 'Mute'} {$isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    {/if}
  </div>

  <div class="hud-box balance-box">
    <span class="hud-label">{$tr('balance')}</span>
    <span class="hud-value cyan">{balanceLabel}</span>
  </div>

  <div class="hud-box win-box">
    <span class="hud-label">{$tr('win')}</span>
    <span class="hud-value magenta">{winLabel}</span>
  </div>

  <div class="hud-box bet-box">
    <span class="hud-label">{$tr('bet')}</span>
    <span class="hud-value gold">{betLabel}</span>
    <div class="bet-arrows">
      <button class="bet-arrow" on:click={increaseBet} disabled={$isSpinning || !canIncrease} aria-label="Increase bet">▲</button>
      <button class="bet-arrow" on:click={decreaseBet} disabled={$isSpinning || !canDecrease} aria-label="Decrease bet">▼</button>
    </div>
  </div>
</div>

<!-- SPIN — spec centre (970,604), 84 diameter, clear of the bet arrows -->
<button
  class="spin-btn"
  class:spinning={$isSpinning}
  disabled={!$canSpin}
  on:click={handleSpin}
  aria-label={$tr('spin')}
  data-testid="spin-button"
>
  <span class="spin-glyph">{$isSpinning ? '⟳' : '▶'}</span>
  <span class="spin-text">{$tr('spin')}</span>
</button>

<!-- AUTOPLAY — spec centre (902,672), 48, below the bar -->
<div class="autoplay-wrapper">
  <button
    class="autoplay-btn"
    class:active={$isAutoPlay}
    on:click={toggleAutoMenu}
    disabled={$isSpinning && !$isAutoPlay}
    aria-label={$tr('autoPlay')}
  >
    {#if $isAutoPlay}
      <span class="autoplay-count">{$autoPlayCount}</span>
    {:else}
      <span class="autoplay-glyph">∞</span>
    {/if}
  </button>
  {#if showAutoMenu}
    <div class="auto-menu" role="menu">
      {#each AUTO_OPTIONS as n}
        <button class="auto-menu-item" role="menuitem" on:click={() => startAuto(n)}>{n}</button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .hud-panel {
    position: absolute;
    left: 320px;
    top: 560px;
    width: 640px;
    height: 88px;
    z-index: 60;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(4, 6, 18, 0.82) 0%, rgba(8, 12, 30, 0.72) 100%);
    border: 1px solid color-mix(in srgb, var(--theme-primary, #00ffff) 30%, transparent);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
  }

  /* ── TURBO — the one themed accent inside the generic panel ────────────── */
  .turbo-btn {
    flex-shrink: 0;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.45);
    border: 2px solid rgba(255, 154, 46, 0.4);
    color: rgba(255, 200, 120, 0.75);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    cursor: pointer;
    transition: border-color 0.15s, filter 0.15s;
  }
  .turbo-btn .turbo-glyph { font-size: 1.4rem; line-height: 1; }
  .turbo-btn .turbo-tier { font-size: 0.55rem; font-weight: 700; letter-spacing: 0.08em; }
  .turbo-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .turbo-btn.engaged {
    border-color: #ff9a2e;
    color: #ffc87a;
    box-shadow: 0 0 16px rgba(255, 154, 46, 0.7), 0 0 32px rgba(255, 100, 20, 0.4);
    animation: turbo-flame 0.8s ease-in-out infinite alternate;
  }
  @keyframes turbo-flame {
    from { filter: brightness(1); }
    to   { filter: brightness(1.35); }
  }

  /* ── Hamburger + menu ───────────────────────────────────────────────────── */
  .menu-wrapper { position: relative; flex-shrink: 0; }
  .hamburger-btn {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.18);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
  }
  .hamburger-btn .bar {
    display: block;
    width: 20px;
    height: 2px;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 1px;
  }
  .hud-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    min-width: 140px;
    background: rgba(6, 6, 18, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    overflow: hidden;
    z-index: 65;
  }
  .hud-menu-item {
    display: block;
    width: 100%;
    padding: 0.5rem 0.9rem;
    background: none;
    border: none;
    color: #fff;
    text-align: left;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .hud-menu-item:hover { background: rgba(255, 255, 255, 0.08); }

  /* ── BALANCE / WIN / BET boxes ──────────────────────────────────────────── */
  .hud-box {
    flex-shrink: 0;
    height: 60px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 0 6px;
  }
  .balance-box { width: 170px; }
  .win-box     { width: 140px; }
  .bet-box     { width: 136px; flex-direction: row; gap: 6px; justify-content: space-between; padding: 0 8px 0 10px; }

  .hud-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
  }

  .hud-value {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
  .hud-value.cyan    { color: #00ffff; text-shadow: 0 0 8px rgba(0, 255, 255, 0.6); }
  .hud-value.magenta { color: #ff2ec4; text-shadow: 0 0 8px rgba(255, 46, 196, 0.6); }
  .hud-value.gold    { color: #ffd700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }

  .bet-box .hud-label,
  .bet-box .hud-value {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .bet-box .hud-value { font-size: 0.85rem; }

  /* Stacked cyan bet arrows — fully visible, given the freed panel width */
  .bet-arrows {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .bet-arrow {
    width: 22px;
    height: 17px;
    background: rgba(0, 255, 255, 0.08);
    border: 1px solid rgba(0, 255, 255, 0.4);
    border-radius: 3px;
    color: #00ffff;
    font-size: 0.55rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  .bet-arrow:disabled { opacity: 0.35; cursor: not-allowed; }
  .bet-arrow:hover:not(:disabled) { background: rgba(0, 255, 255, 0.18); }

  /* ── SPIN — clean generic treatment, breaks past the panel's right edge ── */
  .spin-btn {
    position: absolute;
    left: 928px;
    top: 562px;
    width: 84px;
    height: 84px;
    z-index: 60;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #1c3a3a, #041014 70%);
    border: 3px solid var(--theme-primary, #00ffff);
    color: var(--theme-primary, #00ffff);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    cursor: pointer;
    box-shadow: 0 0 18px color-mix(in srgb, var(--theme-primary, #00ffff) 55%, transparent);
    transition: transform 0.12s ease, box-shadow 0.15s ease;
  }
  .spin-btn .spin-glyph { font-size: 1.5rem; line-height: 1; }
  .spin-btn .spin-text { font-size: 0.5rem; font-weight: 700; letter-spacing: 0.1em; }
  .spin-btn:hover:not(:disabled) { transform: scale(1.05); }
  .spin-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
  .spin-btn.spinning .spin-glyph { animation: spin-rotate 0.7s linear infinite; }
  @keyframes spin-rotate { to { transform: rotate(360deg); } }

  /* ── AUTOPLAY — spec centre (902,672), 48, below the bar ────────────────── */
  .autoplay-wrapper {
    position: absolute;
    left: 878px;
    top: 648px;
    width: 48px;
    height: 48px;
    z-index: 60;
  }
  .autoplay-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.45);
    border: 2px solid rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.75);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-weight: 700;
  }
  .autoplay-btn.active {
    border-color: var(--theme-primary, #00ffff);
    color: var(--theme-primary, #00ffff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-primary, #00ffff) 60%, transparent);
  }
  .autoplay-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .autoplay-count { font-size: 0.95rem; }
  .autoplay-glyph { font-size: 1.1rem; }

  .auto-menu {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 10, 30, 0.96);
    border: 1px solid rgba(255, 200, 50, 0.3);
    border-radius: 8px;
    overflow: hidden;
    z-index: 65;
    min-width: 64px;
  }
  .auto-menu-item {
    display: block;
    width: 100%;
    padding: 0.35rem 0.8rem;
    background: none;
    border: none;
    color: #ffc832;
    cursor: pointer;
    font-size: 0.8rem;
    text-align: center;
  }
  .auto-menu-item:hover { background: rgba(255, 200, 50, 0.15); }
</style>
