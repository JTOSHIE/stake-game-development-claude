<script lang="ts">
  // FeatureMenu.svelte - the SINGLE entry point for every Future Spinner bet
  // mode. One FEATURES knob (right of the frame, where the old FeatureButton
  // sat) opens a brushed-steel modal built on the shared .fs-plate / .fs-knob /
  // .fs-rail chrome vocabulary (matches HudOverlay + PaytableModal):
  //   - a shared bet selector row on top (reads betAmount / currencyCode);
  //   - a scrollable card list, one card per mode from the source-of-truth
  //     config (config/fsModes.ts), each an .fs-plate in the mode's signature
  //     tone. Card behaviour keys off kind:
  //       standing : ACTIVE if it is the current standing mode, else SELECT.
  //       enhancer : an ON/OFF role="switch" toggle.
  //       buy      : cost + ACTIVATE button that dispatches 'buy' with the mode.
  //   - modes with available:false render DIMMED with a "COMING SOON" tag and
  //     are non-interactive (never select a standing mode nor fire a buy).
  //
  // Because everything renders from FS_MODES, flipping a mode live later is a
  // one-line edit in the config - this component needs no change.
  import { createEventDispatcher } from 'svelte'
  import { FS_MODES, FS_RTP_LABEL, modeLabel, modeBlurb } from '../config/fsModes'
  import type { FsMode } from '../config/fsModes'
  import { standingMode, type BetMode } from '../stores/betMode'
  import { isSocial } from '../stores/socialMode'
  import {
    betAmount, currencyCode, isSpinning, balance,
    increaseBet, decreaseBet, canIncreaseBet, showPaytable,
  } from '../stores/gameStore'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { playClick } from '../services/soundService'

  const dispatch = createEventDispatcher<{ buy: BetMode }>()

  // Portrait layout mode (2026-07-14 portrait pass): renders a compact,
  // native-DOM-scale trigger (reachable above the HUD controls row) instead
  // of the LAYOUT_SPEC absolute-positioned .fm-entry knob below. The modal
  // itself (.fm) is unchanged either way - it correctly covers the true
  // viewport once the caller (App.svelte) stops giving .game-wrapper a scale
  // transform in portrait mode.
  export let portrait = false
  // Landscape compact HUD pass (2026-07-14b): renders an icon-only 48px
  // round trigger as a flex item alongside HudOverlay's compact strip in
  // App.svelte's .native-hud-slot.compact-landscape row. Same modal, same
  // reasoning as portrait above - only the trigger's own markup/CSS differs.
  export let compactLandscape = false

  let open = false

  $: cur = $currencyCode || 'USD'
  const price = (cost: number) =>
    formatBalance(Math.round($betAmount * cost * CURRENCY_SCALE), cur)

  // Buy cards are hidden entirely where the jurisdiction disables feature buys,
  // exactly as the current FeatureButton / BuyBonus do.
  $: cards = FS_MODES.filter((m) => m.kind !== 'buy' || !$buyFeatureDisabled)
  // FEATURES MENU RESTRUCTURE (2026-07-15, item 4): two labelled sections -
  // SPIN MODES (standing + enhancer kinds: Normal, Cruise, OVERBOOST) and
  // BUY FEATURES (buy kind: Buy Overdrive, NITRO OVERDRIVE) - both derived
  // from the same `cards` array/order, so FS_MODES stays the single source
  // of truth and adding a mode still needs no template change, just the
  // right `kind`.
  $: spinModeCards = cards.filter((m) => m.kind !== 'buy')
  $: buyFeatureCards = cards.filter((m) => m.kind === 'buy')

  // A standing card is active when its serverMode is the selected standing mode.
  const isActiveStanding = (m: FsMode, sel: BetMode) => sel === m.serverMode
  // An enhancer is on when its serverMode is the selected standing mode.
  const isEnhancerOn = (m: FsMode, sel: BetMode) => sel === m.serverMode

  // FEATURES entry chip reflects the active standing/enhancer mode (cost
  // visibility, Fable 2026-07-07 item 0): OVERBOOST needs a persistent,
  // clearly-labelled state since it changes the real per-spin debit; Cruise
  // only needs a subtle label since its cost is unchanged at 1.0x.
  $: entryActiveLabel = $standingMode === 'antelite' ? 'OVERBOOST' : $standingMode === 'cruise' ? 'CRUISE' : ''

  function openMenu(): void { if (!$isSpinning) { playClick(); open = true } }
  function close(): void { playClick(); open = false }

  function selectStanding(m: FsMode): void {
    if (!m.available || $isSpinning) return
    playClick()
    standingMode.set(m.serverMode)
  }

  function toggleEnhancer(m: FsMode): void {
    if (!m.available || $isSpinning) return
    playClick()
    standingMode.update((sel) => (sel === m.serverMode ? 'base' : m.serverMode))
  }

  function activateBuy(m: FsMode): void {
    // Only live buy modes ever dispatch. Placeholder buys are non-interactive.
    if (!m.available || $isSpinning) return
    if ($balance < $betAmount * m.cost) return
    playClick()
    open = false
    dispatch('buy', m.serverMode)
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

{#if portrait}
  <!-- Portrait native-scale trigger - reachable above the HUD controls row,
       native CSS px throughout (never stage-scaled). -->
  <button
    class="p-fm-entry"
    class:mode-enhancer={$standingMode === 'antelite'}
    on:click={openMenu}
    disabled={$isSpinning}
    aria-label="Features and bet modes"
    aria-haspopup="dialog"
    aria-expanded={open}
    data-testid="feature-menu-button"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
    <span class="p-fm-entry-label">FEATURES</span>
    {#if entryActiveLabel}
      <span
        class="p-fm-entry-active"
        class:enhancer={$standingMode === 'antelite'}
        data-testid="feature-menu-active-mode"
      >{entryActiveLabel}</span>
    {/if}
  </button>
{:else if compactLandscape}
  <!-- Compact-landscape native-scale trigger (2026-07-14b) - a flex item
       alongside HudOverlay's .c-hud strip, icon-only (no room for the
       "FEATURES" text label at this width budget), still >=44px effective.
       No active-mode badge here (unlike the portrait/landscape triggers) -
       HudOverlay's own .c-mode-badge on the bet stat cell already shows
       OVERBOOST/CRUISE in the same visible row, so a second indicator here
       would be redundant and, at this button's size, would either sit below
       the 11px legibility floor or overflow the 76px strip height. -->
  <button
    class="c-fm-entry"
    class:mode-enhancer={$standingMode === 'antelite'}
    on:click={openMenu}
    disabled={$isSpinning}
    aria-label="Features and bet modes"
    aria-haspopup="dialog"
    aria-expanded={open}
    data-testid="feature-menu-button"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
  </button>
{:else}
<!-- ── Single FEATURES entry (right of the frame, old FeatureButton spot) ───── -->
<div class="fm-entry" data-testid="feature-menu-entry">
  <button
    class="fm-entry-knob fs-knob"
    class:mode-enhancer={$standingMode === 'antelite'}
    on:click={openMenu}
    disabled={$isSpinning}
    aria-label="Features and bet modes"
    aria-haspopup="dialog"
    aria-expanded={open}
    data-testid="feature-menu-button"
  >
    <span class="fs-face">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
    </span>
  </button>
  <div class="fm-entry-label">FEATURES</div>
  {#if entryActiveLabel}
    <div
      class="fm-entry-active"
      class:enhancer={$standingMode === 'antelite'}
      data-testid="feature-menu-active-mode"
    >{entryActiveLabel}</div>
  {/if}
</div>
{/if}

<!-- ── Modal ───────────────────────────────────────────────────────────────── -->
{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="fm"
    role="dialog"
    aria-modal="true"
    aria-label="Features"
    tabindex="-1"
    on:click|self={close}
  >
    <div class="fm-panel fs-plate">
      <span class="fs-rail"></span>
      <div class="fs-face">

        <!-- Header -->
        <div class="fm-head">
          <h2 class="fm-title">FEATURES</h2>
          <button class="fm-close fs-knob" on:click={close} aria-label="Close" data-testid="feature-menu-close">
            <span class="fs-face">✕</span>
          </button>
        </div>

        <!-- Shared bet selector row -->
        <div class="fm-betbar fs-plate">
          <div class="fs-face">
            <span class="fm-betlabel">BET</span>
            <button class="fm-step" on:click={decreaseBet} disabled={$isSpinning} aria-label="Decrease bet">-</button>
            <span class="fm-betval fs-num" data-testid="feature-menu-bet">{price(1)}</span>
            <button class="fm-step" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBet} aria-label="Increase bet">+</button>
          </div>
        </div>

        <!-- Two labelled sections (2026-07-15 neon polish pass, item 4):
             SPIN MODES (standing + enhancer kinds) then a visual separator
             then BUY FEATURES (buy kind) - both rendered from the same
             config-driven card markup via a shared snippet-like block below,
             so adding a mode is still a one-line FS_MODES edit. -->
        <div class="fm-cards" data-testid="feature-menu-cards">
          <div class="fm-section-label">SPIN MODES</div>
          {#each spinModeCards as m (m.id)}
            {@const active = isActiveStanding(m, $standingMode)}
            {@const enhOn = isEnhancerOn(m, $standingMode)}
            <div
              class="fm-card fs-plate tone-{m.kind}"
              class:active={m.available && m.kind === 'standing' && active}
              class:dimmed={!m.available}
              data-testid="feature-card-{m.id}"
            >
              <div class="fs-face">
                <div class="fm-card-main">
                  <div class="fm-name-row">
                    <span class="fm-name">{modeLabel(m, $isSocial)}</span>
                    {#if !m.available}
                      <span class="fm-soon">COMING SOON</span>
                    {:else}
                      <span class="fm-vol">{m.volatility}</span>
                    {/if}
                  </div>
                  <p class="fm-blurb">{modeBlurb(m, $isSocial)}</p>
                </div>

                <div class="fm-action">
                  <span class="fm-cost fs-num">{m.cost}× bet</span>

                  {#if !m.available}
                    <span class="fm-tag" aria-hidden="true">SOON</span>
                  {:else if m.kind === 'standing'}
                    {#if active}
                      <span class="fm-active-tag" data-testid="standing-active-{m.id}">ACTIVE</span>
                    {:else}
                      <button
                        class="fm-select"
                        on:click={() => selectStanding(m)}
                        disabled={$isSpinning}
                        data-testid="standing-select-{m.id}"
                      >SELECT</button>
                    {/if}
                  {:else}
                    <button
                      class="fm-toggle"
                      class:on={enhOn}
                      role="switch"
                      aria-checked={enhOn}
                      on:click={() => toggleEnhancer(m)}
                      disabled={$isSpinning}
                      data-testid="enhancer-toggle-{m.id}"
                    >{enhOn ? 'ON' : 'OFF'}</button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}

          <div class="fm-section-separator" role="separator" aria-hidden="true"></div>
          <div class="fm-section-label">BUY FEATURES</div>
          {#each buyFeatureCards as m (m.id)}
            <div
              class="fm-card fs-plate tone-{m.kind}"
              class:dimmed={!m.available}
              data-testid="feature-card-{m.id}"
            >
              <div class="fs-face">
                <div class="fm-card-main">
                  <div class="fm-name-row">
                    <span class="fm-name">{modeLabel(m, $isSocial)}</span>
                    {#if !m.available}
                      <span class="fm-soon">COMING SOON</span>
                    {:else}
                      <span class="fm-vol">{m.volatility}</span>
                    {/if}
                  </div>
                  <p class="fm-blurb">{modeBlurb(m, $isSocial)}</p>
                </div>

                <div class="fm-action">
                  <span class="fm-cost fs-num">{m.cost}× · {price(m.cost)}</span>

                  {#if !m.available}
                    <span class="fm-tag" aria-hidden="true">SOON</span>
                  {:else}
                    <button
                      class="fm-activate"
                      on:click={() => activateBuy(m)}
                      disabled={$isSpinning || $balance < $betAmount * m.cost}
                      data-testid="activate-{m.id}"
                    >ACTIVATE</button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Footer -->
        <div class="fm-foot">
          <span class="fm-rtp">All modes · RTP {FS_RTP_LABEL}</span>
          <button class="fm-info-btn" on:click={openBetModesInfo} data-testid="open-bet-modes-info">BET MODES</button>
        </div>

      </div><!-- /fs-face -->
    </div><!-- /fm-panel -->
  </div>
{/if}

<style>
  /* ==========================================================================
     FUTURE SPINNER - FEATURES MENU
     Built on the shared chrome vocabulary (.fs-plate / .fs-knob / .fs-rail /
     .fs-face) so it reads as part of the same instrument set as the HUD and
     the paytable. Svelte scopes styles per component, so the chrome primitives
     are re-declared here (identical to HudOverlay / PaytableModal). One
     signature colour per card tone; base + gold/cyan/pink signature tokens.
     ========================================================================== */

  /* token scope */
  .fm-entry,
  .p-fm-entry,
  .c-fm-entry,
  .fm {
    --sig-cyan: var(--theme-primary, #00ffff);
    --sig-pink: #ff2ec4;
    --sig-gold: #ffd700;
    --sig-orange: #ff9a2e;
    --sig-green: #4eff91;
    --acc: var(--sig-cyan);
  }

  /* ---- shared chrome primitives (same as HudOverlay / PaytableModal) ---- */
  .fs-plate {
    position: relative;
    --sig: var(--sig-cyan);
    padding: 2px;
    clip-path: polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px));
    background: linear-gradient(150deg, #eef5fa, #b3c6d2 15%, #63737f 37%, #2b363f 52%, #8499a8 72%, #dceaf2);
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.6),
      0 0 9px color-mix(in srgb, var(--sig) 20%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }
  .fs-plate > .fs-face {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    background:
      linear-gradient(160deg, color-mix(in srgb, var(--sig) 12%, transparent), transparent 44%),
      linear-gradient(180deg, #111a2b, #070b16);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), inset 0 -8px 18px rgba(0, 0, 0, 0.6);
  }
  .fs-rail {
    position: absolute;
    left: 2px;
    top: 16px;
    bottom: 16px;
    width: 4px;
    border-radius: 2px;
    z-index: 2;
    background: var(--sig-gold);
    box-shadow: 0 0 10px var(--sig-gold);
  }
  .fs-knob {
    border-radius: 50%;
    padding: 3px;
    position: relative;
    background: conic-gradient(from 216deg, #e7f1f7, #93a7b5, #39454f, #728593, #eef5fa, #4f5f6b, #a9bcc8, #e7f1f7);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.55);
  }
  .fs-knob > .fs-face {
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: radial-gradient(circle at 36% 28%, #1a3640, #06131c 72%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.14), inset 0 -6px 12px rgba(0, 0, 0, 0.7);
  }
  .fs-num { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }

  /* ---- entry knob: right of the frame (mirrors the old FeatureButton spot) - */
  .fm-entry {
    position: absolute;
    left: 966px;
    top: 238px;
    width: 160px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .fm-entry-knob {
    width: 96px;
    height: 96px;
    padding: 4px;
    border: none;
    cursor: pointer;
    transition: transform 0.12s ease, filter 0.15s ease;
    filter: drop-shadow(0 0 12px color-mix(in srgb, var(--sig-cyan) 45%, transparent));
    animation: fm-entry-glow 3s ease-in-out infinite;
  }
  .fm-entry-knob > .fs-face {
    background: radial-gradient(circle at 36% 28%, #10303a, #05121b 72%);
  }
  .fm-entry-knob svg { width: 34px; height: 34px; fill: none; stroke: var(--sig-cyan); stroke-width: 2.2; stroke-linecap: round; filter: drop-shadow(0 0 5px var(--sig-cyan)); }
  .fm-entry-knob:hover:not(:disabled) { transform: scale(1.05); }
  .fm-entry-knob:disabled { opacity: 0.5; cursor: not-allowed; }
  @keyframes fm-entry-glow {
    0%, 100% { filter: drop-shadow(0 0 10px color-mix(in srgb, var(--sig-cyan) 40%, transparent)); }
    50%      { filter: drop-shadow(0 0 20px color-mix(in srgb, var(--sig-pink) 60%, transparent)); }
  }
  /* OVERBOOST engaged: the entry knob glows orange (matching the enhancer
     card's tone) instead of the default cyan/pink pulse, so the FEATURES
     chip itself reflects the toggle state at a glance (cost-visibility item). */
  .fm-entry-knob.mode-enhancer {
    animation: none;
    filter: drop-shadow(0 0 14px color-mix(in srgb, var(--sig-orange) 55%, transparent));
  }
  .fm-entry-knob.mode-enhancer svg { stroke: var(--sig-orange); filter: drop-shadow(0 0 5px var(--sig-orange)); }
  .fm-entry-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.62rem; font-weight: 800; letter-spacing: 0.14em;
    text-transform: uppercase; color: color-mix(in srgb, var(--sig-cyan) 30%, #fff);
    text-shadow: 0 0 8px color-mix(in srgb, var(--sig-cyan) 60%, transparent);
    white-space: nowrap;
  }
  /* Active standing/enhancer mode label under the FEATURES chip - subtle for
     Cruise (cost unchanged), a clearly-labelled persistent pill for OVERBOOST
     (real per-spin cost change while ON). */
  .fm-entry-active {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.56rem; font-weight: 800; letter-spacing: 0.1em;
    text-transform: uppercase; white-space: nowrap;
    padding: 2px 8px; border-radius: 999px;
    color: color-mix(in srgb, var(--sig-cyan) 35%, #fff);
    background: rgba(0, 240, 255, 0.08);
    border: 1px solid color-mix(in srgb, var(--sig-cyan) 40%, transparent);
  }
  .fm-entry-active.enhancer {
    color: #1a0d02;
    background: var(--sig-orange);
    border-color: var(--sig-orange);
    box-shadow: 0 0 10px color-mix(in srgb, var(--sig-orange) 55%, transparent);
  }

  /* ---- modal shell ---- */
  .fm {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(3px);
    font-family: 'Orbitron', system-ui, sans-serif;
    animation: fm-fade 0.18s ease;
  }
  @keyframes fm-fade { from { opacity: 0; } to { opacity: 1; } }

  .fm-panel {
    width: 92%;
    max-width: 560px;
    max-height: 88%;
    --sig: var(--sig-gold);
    animation: fm-pop 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .fm-panel > .fs-face {
    max-height: 88vh;
    overflow: hidden;
  }
  @keyframes fm-pop { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }

  /* header */
  .fm-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 22px;
    border-bottom: 1px solid color-mix(in srgb, var(--sig-gold) 22%, transparent);
    flex-shrink: 0;
  }
  .fm-title {
    font-size: 1.2rem; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;
    background: linear-gradient(135deg, var(--sig-gold), var(--sig-orange));
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  }
  .fm-close { width: 34px; height: 34px; padding: 3px; border: none; cursor: pointer; flex-shrink: 0; }
  .fm-close > .fs-face { color: #cfe6f2; font-size: 0.82rem; }
  .fm-close:hover > .fs-face { color: #fff; filter: brightness(1.2); }

  /* bet selector row */
  .fm-betbar { margin: 14px 20px 0; --sig: var(--sig-cyan); flex-shrink: 0; }
  .fm-betbar > .fs-face { flex-direction: row; align-items: center; gap: 0.8rem; padding: 8px 16px; }
  .fm-betlabel { font-size: 0.58rem; letter-spacing: 0.16em; color: color-mix(in srgb, var(--sig-cyan) 45%, #fff); }
  .fm-step {
    width: 30px; height: 30px; border-radius: 8px; cursor: pointer;
    background: rgba(0, 240, 255, 0.08); border: 1px solid color-mix(in srgb, var(--sig-cyan) 45%, transparent);
    color: color-mix(in srgb, var(--sig-cyan) 25%, #fff); font-size: 1.1rem; font-weight: 900; line-height: 1;
    display: flex; align-items: center; justify-content: center;
  }
  .fm-step:disabled { opacity: 0.35; cursor: default; }
  .fm-betval {
    margin-left: auto; min-width: 84px; text-align: right;
    font-size: 0.98rem; font-weight: 900; color: #fff2c2; text-shadow: 0 0 3px var(--sig-gold);
  }

  /* card list */
  .fm-cards {
    overflow-y: auto; padding: 14px 20px; margin-top: 4px;
    display: flex; flex-direction: column; gap: 10px;
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--acc) 45%, transparent) transparent;
  }
  .fm-cards::-webkit-scrollbar { width: 8px; }
  .fm-cards::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--acc) 40%, transparent); border-radius: 4px; }

  /* Section labels + separator (2026-07-15, item 4): SPIN MODES / BUY
     FEATURES - the first label sits flush at the top of the scroll area
     (no extra top margin), the second is preceded by a visual rule. */
  .fm-section-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.66rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;
    color: color-mix(in srgb, var(--sig-gold) 45%, #fff);
    text-shadow: 0 0 8px color-mix(in srgb, var(--sig-gold) 40%, transparent);
    padding: 2px 2px 0;
  }
  .fm-section-separator {
    height: 1px;
    margin: 4px 2px 0;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--sig-gold) 55%, transparent) 20%, color-mix(in srgb, var(--sig-gold) 55%, transparent) 80%, transparent);
  }

  .fm-card { --sig: var(--sig-cyan); }
  .fm-card.tone-standing { --sig: var(--sig-cyan); }
  .fm-card.tone-enhancer { --sig: var(--sig-orange); }
  .fm-card.tone-buy { --sig: var(--sig-pink); }
  .fm-card > .fs-face { flex-direction: row; align-items: center; gap: 0.85rem; padding: 12px 14px; }
  .fm-card.active > .fs-face {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.07),
      inset 0 -8px 18px rgba(0, 0, 0, 0.6),
      inset 0 0 0 1px color-mix(in srgb, var(--sig-cyan) 60%, transparent),
      0 0 14px color-mix(in srgb, var(--sig-cyan) 25%, transparent);
  }
  .fm-card.dimmed { filter: grayscale(0.55) brightness(0.72); opacity: 0.7; }

  .fm-card-main { flex: 1; min-width: 0; text-align: left; }
  .fm-name-row { display: flex; align-items: center; gap: 0.5rem; }
  .fm-name { font-size: 0.94rem; font-weight: 800; color: #eafcff; letter-spacing: 0.03em; }
  .fm-vol {
    font-size: 0.5rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    color: color-mix(in srgb, var(--sig) 45%, #fff);
    border: 1px solid color-mix(in srgb, var(--sig) 45%, transparent); border-radius: 999px;
    padding: 0.12rem 0.5rem; white-space: nowrap;
  }
  .fm-soon {
    font-size: 0.5rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    color: #d8e2ea; background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px;
    padding: 0.12rem 0.55rem; white-space: nowrap;
  }
  .fm-blurb { font-size: 0.72rem; color: rgba(200, 230, 245, 0.68); line-height: 1.4; margin: 0.24rem 0 0; }

  .fm-action { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; flex-shrink: 0; }
  .fm-cost { font-size: 0.6rem; color: #ffd66a; white-space: nowrap; }
  .fm-select, .fm-activate, .fm-toggle {
    min-width: 86px; padding: 0.42rem 0.7rem; border-radius: 8px; cursor: pointer;
    font-family: inherit; font-size: 0.66rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .fm-select {
    background: rgba(0, 240, 255, 0.08); border: 1px solid color-mix(in srgb, var(--sig-cyan) 50%, transparent);
    color: color-mix(in srgb, var(--sig-cyan) 25%, #fff);
  }
  .fm-select:hover:not(:disabled) { background: rgba(0, 240, 255, 0.16); }
  .fm-select:disabled { opacity: 0.45; cursor: default; }
  .fm-active-tag {
    font-size: 0.6rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
    color: color-mix(in srgb, var(--sig-cyan) 25%, #fff); text-shadow: 0 0 8px color-mix(in srgb, var(--sig-cyan) 60%, transparent);
    padding: 0.42rem 0.2rem;
  }
  .fm-toggle {
    min-width: 62px; border-radius: 999px;
    background: rgba(255, 255, 255, 0.05); border: 1px solid color-mix(in srgb, var(--sig-orange) 45%, transparent);
    color: color-mix(in srgb, var(--sig-orange) 35%, #fff);
  }
  .fm-toggle.on {
    background: var(--sig-orange); border-color: var(--sig-orange); color: #1a0d02;
    box-shadow: 0 0 12px color-mix(in srgb, var(--sig-orange) 55%, transparent);
  }
  .fm-toggle:disabled { opacity: 0.55; cursor: default; }
  .fm-activate {
    background: linear-gradient(160deg, var(--sig-pink), #a01e8f); border: none; color: #fff;
    box-shadow: 0 0 12px color-mix(in srgb, var(--sig-pink) 40%, transparent);
  }
  .fm-activate:hover:not(:disabled) { filter: brightness(1.1); }
  .fm-activate:disabled { opacity: 0.45; cursor: default; box-shadow: none; }
  .fm-tag {
    font-size: 0.55rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(216, 226, 234, 0.7); padding: 0.42rem 0.4rem;
  }

  /* footer */
  .fm-foot {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 22px; flex-shrink: 0;
    border-top: 1px solid color-mix(in srgb, var(--sig-gold) 18%, transparent);
  }
  .fm-rtp { font-size: 0.64rem; letter-spacing: 0.06em; color: color-mix(in srgb, var(--sig-gold) 50%, #fff); }
  .fm-info-btn {
    padding: 0.42rem 0.9rem; border-radius: 8px; cursor: pointer;
    font-family: inherit; font-size: 0.64rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    background: rgba(255, 215, 0, 0.08); border: 1px solid color-mix(in srgb, var(--sig-gold) 45%, transparent);
    color: color-mix(in srgb, var(--sig-gold) 35%, #fff);
  }
  .fm-info-btn:hover { background: rgba(255, 215, 0, 0.16); }

  @media (prefers-reduced-motion: reduce) {
    .fm, .fm-panel, .fm-entry-knob { animation: none; }
  }

  /* Portrait native-scale trigger (2026-07-14 portrait pass) - fully
     self-contained, native CSS px throughout, no LAYOUT_SPEC coordinates. */
  .p-fm-entry {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 14px;
    margin: 0 12px 8px;
    width: calc(100% - 24px);
    /* NEON LIFT (2026-07-15): persistent bright magenta/pink border glow,
       not just a flat 1px outline - the FEATURES bar is the entry point to
       every bet mode and reads as a plain rectangle without it. */
    border: 1.5px solid color-mix(in srgb, var(--sig-pink, #ff2ec4) 55%, transparent);
    border-radius: 10px;
    background: linear-gradient(160deg, rgba(255, 46, 196, 0.1), rgba(6, 9, 20, 0.9));
    box-shadow:
      0 0 12px color-mix(in srgb, var(--sig-pink, #ff2ec4) 45%, transparent),
      inset 0 0 10px color-mix(in srgb, var(--sig-pink, #ff2ec4) 14%, transparent);
    color: color-mix(in srgb, var(--sig-pink, #ff2ec4) 25%, #fff);
    cursor: pointer;
    font-family: 'Orbitron', system-ui, sans-serif;
  }
  .p-fm-entry:disabled { opacity: 0.5; cursor: not-allowed; }
  .p-fm-entry svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
  .p-fm-entry-label {
    font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  }
  .p-fm-entry-active {
    font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 2px 8px; border-radius: 999px;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid color-mix(in srgb, var(--sig-cyan, #00ffff) 40%, transparent);
  }
  .p-fm-entry-active.enhancer {
    color: #1a0d02;
    background: var(--sig-orange, #ff9a2e);
    border-color: var(--sig-orange, #ff9a2e);
  }
  .p-fm-entry.mode-enhancer {
    border-color: color-mix(in srgb, var(--sig-orange, #ff9a2e) 55%, transparent);
  }

  /* Compact-landscape native-scale trigger (2026-07-14b) - icon-only round
     button, sized to match HudOverlay's .c-round-btn family (44px) but a
     touch larger (48px) since it's the entry point to every bet mode. */
  .c-fm-entry {
    position: relative;
    flex: 0 0 auto;
    align-self: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border: 1.5px solid color-mix(in srgb, var(--sig-pink, #ff2ec4) 50%, transparent);
    border-radius: 50%;
    background: radial-gradient(circle at 36% 28%, #2a1030, #05121b 72%);
    /* NEON LIFT (2026-07-15): persistent pink glow, matching the portrait bar. */
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 0 10px color-mix(in srgb, var(--sig-pink, #ff2ec4) 40%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .c-fm-entry svg { width: 20px; height: 20px; fill: none; stroke: var(--sig-pink, #ff2ec4); stroke-width: 2.2; stroke-linecap: round; }
  .c-fm-entry:disabled { opacity: 0.5; cursor: not-allowed; }
  .c-fm-entry.mode-enhancer {
    box-shadow: 0 0 12px color-mix(in srgb, var(--sig-orange, #ff9a2e) 55%, transparent);
  }
  .c-fm-entry.mode-enhancer svg { stroke: var(--sig-orange, #ff9a2e); }
</style>
