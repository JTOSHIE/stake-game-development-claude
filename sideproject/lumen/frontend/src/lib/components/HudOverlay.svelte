<script lang="ts">
  // HudOverlay.svelte — LAYOUT_SPEC v3.2 AMENDMENT: fixed-field HUD.
  // Reskin-free per DESIGN_SYSTEM (the only themed accent is TURBO, which
  // reuses the existing turbo treatment with an engage glow). Every field
  // inside the panel is a fixed box that never moves or resizes as its value
  // grows (stress-tested against $10,000.00 balance / $5,000.00 win /
  // $5,000.00 bet); every numeric value uses tabular numerals.
  import { createEventDispatcher, onMount } from 'svelte'
  import {
    betAmount, balance, canSpin, currencyCode,
    isSpinning, isAutoPlay, autoPlayCount,
    isMuted, showPaytable, winAmount, BET_LEVELS, locale,
  } from '../stores/gameStore'
  import { rgsBetLevels } from '../stores/rgsBetLevels'
  import { speedTier, cycleSpeed } from '../stores/speedMode'
  import { tr } from '../i18n/tr'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { playClick } from '../services/soundService'
  import { autoplayLimits, rgJurisdiction } from '../stores/responsibleGambling'

  const dispatch = createEventDispatcher<{ spin: void; slam: void }>()

  // Dev-only test hook: exposes the store objects so headless verification
  // (frontend/scripts/layout_v1_audit.mjs, qa_soak.mjs) can inject stress
  // values / drive the locale-social-speed matrix without any production
  // code path. Never present in a production build (import.meta.env.DEV is
  // false there).
  onMount(() => {
    if (import.meta.env.DEV) {
      ;(window as unknown as { __testStores?: unknown }).__testStores =
        { balance, betAmount, winAmount, rgsBetLevels, locale, speedTier }
    }
  })

  const AUTO_OPTIONS = [10, 25, 50, 100]
  let showAutoMenu = false
  // Responsible-gambling autoplay stop-conditions (see stores/responsibleGambling).
  let stopOnWin = false
  let stopOnFeature = true
  let lossLimitOn = false
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

  // Pressing SPIN mid-spin slam-stops all reels instantly (Motion Polish v2,
  // reel feel item 1); the outcome is already determined, this only fast
  // forwards the presentation. Otherwise behaves as a normal spin request.
  function handleSpin() {
    if ($isSpinning) {
      dispatch('slam')
    } else if ($canSpin) {
      dispatch('spin')
    }
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

  // MAX bet (v3.3) — highest affordable ladder level, consistent with the
  // affordability guard the increase arrow already uses.
  $: maxLevel = (() => {
    const affordable = activeLevels.filter((l) => l <= $balance)
    return affordable.length ? affordable[affordable.length - 1] : activeLevels[0]
  })()
  $: canSetMax = curIndex > -1 && $betAmount !== maxLevel

  function setMaxBet() {
    playClick()
    if ($betAmount !== maxLevel) betAmount.set(maxLevel)
  }

  function startAuto(count: number) {
    playClick()
    autoplayLimits.set({
      count,
      stopOnAnyWin: stopOnWin,
      singleWinLimitMult: 0,
      stopOnFeature,
      lossLimitMicros: lossLimitOn ? Math.round($betAmount * count * CURRENCY_SCALE) : 0,
    })
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

<!-- HUD panel — v3.2 x 296..984 (688 wide), y 560..648, radius 18, z 60 -->
<div class="hud-panel" data-testid="hud-panel"></div>

<!-- TURBO — v3.2: OUTSIDE the panel, centre (268,604) -->
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

<!-- Hamburger + menu — fixed at x 344 -->
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

<!-- BALANCE — fixed box x 400, width 200 -->
<div class="hud-box balance-box" data-testid="hud-balance">
  <span class="hud-label">{$tr('balance')}</span>
  <span class="hud-value cyan">{balanceLabel}</span>
</div>

<!-- WIN — fixed box x 616, width 150 -->
<div class="hud-box win-box" data-testid="hud-win">
  <span class="hud-label">{$tr('win')}</span>
  <span class="hud-value magenta">{winLabel}</span>
</div>

<!-- BET — fixed box x 782, width 120, value right-aligned -->
<div class="hud-box bet-box" data-testid="hud-bet">
  <span class="hud-label">{$tr('bet')}</span>
  <span class="hud-value gold">{betLabel}</span>
</div>

<!-- Stacked cyan bet arrows — own FIXED column x 906 (v3.3), independent of the BET box -->
<div class="bet-arrows" data-testid="bet-arrows">
  <button class="bet-arrow" on:click={increaseBet} disabled={$isSpinning || !canIncrease} aria-label="Increase bet">▲</button>
  <button class="bet-arrow" on:click={decreaseBet} disabled={$isSpinning || !canDecrease} aria-label="Decrease bet">▼</button>
</div>

<!-- MAX chip — v3.6: relocated to the FAR LEFT of the HUD (between TURBO and the
     menu), clear of the SPIN button; was jammed against the SPIN hit circle in
     v3.3 to v3.5 (a mis-tap hazard). Tabular numerals, never repositioned by
     content; wired to the max-bet ladder logic. -->
<button
  class="max-chip"
  on:click={setMaxBet}
  disabled={$isSpinning || !canSetMax}
  aria-label="Max bet"
  data-testid="max-chip"
><span class="max-chip-face">MAX</span></button>

<!-- SPIN — v3.2: centre (1004,604), 84 diameter. Stays clickable mid-spin
     (slam-stop, Motion Polish v2) even though $canSpin is false while spinning. -->
<button
  class="spin-btn"
  class:spinning={$isSpinning}
  disabled={$isSpinning ? false : !$canSpin}
  on:click={handleSpin}
  aria-label={$tr('spin')}
  data-testid="spin-button"
>
  <span class="spin-glyph">{$isSpinning ? '⟳' : '▶'}</span>
  <span class="spin-text">{$tr('spin')}</span>
</button>

<!-- AUTOPLAY — v3.2: centre (936,672), 48. Hidden where the jurisdiction bans
     autoplay (UKGC, enforced May 2026). -->
{#if !$rgJurisdiction.autoplayDisabled}
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
      <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnWin} /> Stop on win</label>
      <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnFeature} /> Stop on feature</label>
      <label class="auto-menu-toggle"><input type="checkbox" bind:checked={lossLimitOn} /> Loss limit</label>
      <div class="auto-menu-sep">Spins</div>
      {#each AUTO_OPTIONS as n}
        <button class="auto-menu-item" role="menuitem" on:click={() => startAuto(n)}>{n}</button>
      {/each}
    </div>
  {/if}
</div>
{/if}

<style>
  /* Numeric HUD values never reflow as digits grow. */
  .hud-value {
    font-variant-numeric: tabular-nums;
  }

  .hud-panel {
    position: absolute;
    left: 296px;
    top: 560px;
    width: 688px;
    height: 88px;
    z-index: 60;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(4, 6, 18, 0.82) 0%, rgba(8, 12, 30, 0.72) 100%);
    border: 1px solid color-mix(in srgb, var(--theme-primary, #00ffff) 30%, transparent);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    pointer-events: none;
  }

  /* ── TURBO — v3.2: OUTSIDE the panel, centre (268,604) ──────────────────── */
  .turbo-btn {
    position: absolute;
    left: 232px;
    top: 568px;
    width: 72px;
    height: 72px;
    z-index: 60;
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
  .turbo-btn .turbo-tier { font-size: 0.55rem; font-weight: 700; letter-spacing: 0.08em; font-variant-numeric: tabular-nums; }
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

  /* ── Hamburger + menu — fixed at x 344 ──────────────────────────────────── */
  .menu-wrapper {
    position: absolute;
    left: 344px;
    top: 584px;
    width: 40px;
    height: 40px;
    z-index: 60;
  }
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

  /* ── BALANCE / WIN / BET — CSS-drawn angular neon boxes (cyberpunk) ───────
     A 2px magenta->cyan gradient bezel with cut corners, a deep gradient fill
     and a soft pink glow; framed and thicker than the old flat panels, sharing
     the instrument-plate design language. Fixed geometry, never reflow. */
  .hud-box {
    position: absolute;
    top: 573px;
    height: 62px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 0 8px;
    background: linear-gradient(135deg, #ff2ec4 0%, #16f2e0 58%, #ff2ec4 100%);
    clip-path: polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px));
    filter: drop-shadow(0 0 6px rgba(255, 46, 196, 0.5));
  }
  .hud-box::before {
    content: '';
    position: absolute;
    inset: 2px;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    background:
      linear-gradient(160deg, rgba(255, 46, 196, 0.12), transparent 45%),
      linear-gradient(180deg, rgba(20, 11, 36, 0.95) 0%, rgba(8, 6, 16, 0.97) 100%);
  }
  .balance-box { left: 400px; width: 200px; }
  .win-box     { left: 616px; width: 150px; }
  .bet-box     { left: 782px; width: 120px; align-items: flex-end; padding-right: 12px; }

  .hud-label {
    position: relative;
    z-index: 1;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: rgba(190, 240, 255, 0.6);
    text-transform: uppercase;
  }

  .hud-value {
    position: relative;
    z-index: 1;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
  .hud-value.cyan    { color: #00ffff; text-shadow: 0 0 8px rgba(0, 255, 255, 0.6); }
  .hud-value.magenta { color: #ff2ec4; text-shadow: 0 0 8px rgba(255, 46, 196, 0.6); }
  .hud-value.gold    { color: #ffd700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }

  /* BET value right-aligned within its fixed 120 width, per AMENDMENT v3.2 */
  .bet-box .hud-label,
  .bet-box .hud-value {
    text-align: right;
    width: 100%;
  }

  /* Stacked cyan bet arrows — own FIXED column x 906 (v3.3), independent of BET box */
  .bet-arrows {
    position: absolute;
    left: 906px;
    top: 578px;
    width: 26px;
    height: 52px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .bet-arrow {
    width: 44px;
    height: 24px;
    background: rgba(0, 255, 255, 0.08);
    border: 1px solid rgba(0, 255, 255, 0.4);
    border-radius: 4px;
    color: #00ffff;
    font-size: 0.65rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  .bet-arrow:disabled { opacity: 0.35; cursor: not-allowed; }
  .bet-arrow:hover:not(:disabled) { background: rgba(0, 255, 255, 0.18); }

  /* MAX chip (v3.6) — relocated to the FAR LEFT, in the 40px gap between the
     TURBO button (right edge x304) and the hamburger menu (left edge x344). The
     26x44 button is centred in that gap (x311 to 337), clearing TURBO and the
     menu by ~7px each and sitting nowhere near the SPIN circle (centre 1004,
     r42). The visible chip keeps its v3.3 geometry (24x26, centred). Baseline
     y604 unchanged. This removes the v3.3 to v3.5 SPIN-adjacency mis-tap hazard. */
  .max-chip {
    position: absolute;
    left: 311px;
    top: 582px;
    width: 26px;
    height: 44px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .max-chip:disabled { cursor: not-allowed; }
  .max-chip-face {
    width: 24px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(0, 255, 255, 0.5);
    border-radius: 6px;
    background: rgba(0, 40, 60, 0.55);
    color: #9fefff;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.46rem;
    font-weight: 700;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
    transition: background 0.15s, filter 0.15s;
  }
  .max-chip:hover:not(:disabled) .max-chip-face { background: rgba(0, 255, 255, 0.18); filter: brightness(1.15); }
  .max-chip:disabled .max-chip-face { opacity: 0.35; }

  /* ── SPIN — v3.2: centre (1004,604) ──────────────────────────────────────── */
  .spin-btn {
    position: absolute;
    left: 962px;
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

  /* ── AUTOPLAY — v3.2: centre (936,672), 48 ───────────────────────────────── */
  .autoplay-wrapper {
    position: absolute;
    left: 912px;
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
  .autoplay-count { font-size: 0.95rem; font-variant-numeric: tabular-nums; }
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
  .auto-menu-toggle {
    display: flex; align-items: center; gap: 6px;
    padding: 0.28rem 0.7rem; font-size: 0.64rem; color: #cde; cursor: pointer; white-space: nowrap;
  }
  .auto-menu-toggle input { accent-color: #00ffff; }
  .auto-menu-sep {
    padding: 0.28rem 0.7rem 0.1rem; font-size: 0.54rem; letter-spacing: 0.06em;
    color: rgba(205,222,238,0.55); border-top: 1px solid rgba(255,255,255,0.1); margin-top: 2px;
  }
</style>
