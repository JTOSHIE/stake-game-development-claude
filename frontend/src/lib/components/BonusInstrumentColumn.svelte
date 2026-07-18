<script lang="ts">
  // BonusInstrumentColumn.svelte — LAYOUT_SPEC bonus instrument column
  // (Overdrive only). gauge_face + a separately rotating gauge_needle sprite
  // driven by the live meter, an odometer spins-remaining window, and
  // MULTIPLIER / TOTAL WIN on the instrument plate export — all fed by the
  // same live values FreeSpinsPresentation drives (bound in App.svelte).
  import { betAmount, currencyCode } from '../stores/gameStore'
  import { themeAssets } from '../stores/themeStore'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'

  export let multiplier = 1
  export let spinsRemaining = 0
  export let runningTotalCentibets = 0
  // Portrait Overdrive meter decoupling (2026-07-15 neon polish pass, item 2):
  // when true, renders a native-DOM-scale compact horizontal strip docked
  // between the grid and the FEATURES bar (App.svelte's .native-hud-slot,
  // first child when featureActive) instead of the LAYOUT_SPEC
  // absolute-positioned gauge column below. Landscape and desktop are
  // unchanged - same decoupling pattern as HudOverlay/FeatureMenu's
  // `portrait` prop, applied here to close the gap the portrait v2 session
  // report disclosed (the gauge column previously fell fully outside the
  // visible viewport window on at least one tested profile during Overdrive).
  export let compact = false

  // Needle sweeps roughly -110deg (low) to +110deg (high) through the top,
  // normalised against the same reference ceiling as the legacy OverdriveMeter
  // fill bar (15x above the 1x floor) — purely a visual sweep, not physical.
  $: needleDeg = -110 + Math.max(0, Math.min(1, (multiplier - 1) / 15)) * 220

  $: totalWinLabel = formatBalance(
    Math.round((runningTotalCentibets / 100) * $betAmount * CURRENCY_SCALE),
    $currencyCode || 'USD',
  )
</script>

{#if compact}
  <!-- Compact portrait strip (2026-07-15) - fully self-contained, native CSS
       px throughout, no LAYOUT_SPEC absolute coordinates. Three cells:
       multiplier, spins remaining, total win - geometrically guaranteed
       on-screen since it's a normal-flow native-DOM element, not part of
       the scaled canvas. -->
  <div class="pm-strip" data-testid="bonus-instrument-column">
    <div class="pm-cell">
      <span class="pm-label">OVERDRIVE</span>
      <span class="pm-value pink">{multiplier}×</span>
    </div>
    <div class="pm-cell" data-testid="odometer">
      <span class="pm-label">SPINS</span>
      <span class="pm-value cyan">{spinsRemaining}</span>
    </div>
    <div class="pm-cell">
      <span class="pm-label">TOTAL WIN</span>
      <span class="pm-value gold">{totalWinLabel}</span>
    </div>
  </div>
{:else}
  <div class="instrument-column" data-testid="bonus-instrument-column">
    <div class="gauge" style="width:232px;height:232px;">
      <img class="gauge-face" src="{$themeAssets.assetBase}/ui/gauge_face.png" alt="" draggable="false" />
      <img
        class="gauge-needle"
        src="{$themeAssets.assetBase}/ui/gauge_needle.png"
        alt=""
        draggable="false"
        style="transform: rotate({needleDeg}deg);"
      />
      <div class="odometer" data-testid="odometer">
        <span class="odometer-value">{spinsRemaining}</span>
        <span class="odometer-label">SPINS</span>
      </div>
    </div>

    <div class="plate">
      <span class="plate-label">MULTIPLIER</span>
      <span class="plate-value">{multiplier}×</span>
    </div>

    <div class="plate">
      <span class="plate-label">TOTAL WIN</span>
      <span class="plate-value">{totalWinLabel}</span>
    </div>
  </div>
{/if}

<style>
  /* Column overall bounds: x 1000..1262, y 96.. (gauge top) through the
     stacked plates beneath — see LAYOUT_SPEC. */
  .instrument-column {
    position: absolute;
    left: 1000px;
    top: 96px;
    width: 262px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;
  }

  .gauge {
    position: relative;
    margin-left: 18px; /* gauge sits at spec x 1018 within the 1000-wide column */
  }
  .gauge-face,
  .gauge-needle {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .gauge-needle {
    transform-origin: 50% 50%;
    transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.4, 1);
  }

  /* Odometer spins-remaining window — dark fill, gold bezel, crimson inner frame */
  .odometer {
    position: absolute;
    left: 50%;
    bottom: 22%;
    transform: translateX(-50%);
    width: 70px;
    height: 30px;
    background: #0a0604;
    border: 2px solid #d9a81e;
    border-radius: 4px;
    box-shadow: inset 0 0 0 2px #7a1018, inset 0 0 8px rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  .odometer-value {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1rem;
    font-weight: 900;
    color: #ff7a2e;
    text-shadow: 0 0 6px rgba(255, 122, 46, 0.8);
  }
  .odometer-label {
    font-size: 0.4rem;
    letter-spacing: 0.1em;
    color: rgba(255, 215, 0, 0.8);
  }

  /* MULTIPLIER / TOTAL WIN — CSS-drawn angular instrument frame (cyberpunk):
     a 2px magenta->cyan gradient bezel with cut corners, a deep gradient fill,
     a left accent rail and a neon glow. Replaces the thin flat plate export. */
  .plate {
    position: relative;
    width: 262px;
    height: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    /* the bezel: gradient shows through as a 2px frame around ::before */
    background: linear-gradient(135deg, #ff2ec4 0%, #16f2e0 55%, #ff2ec4 100%);
    clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px));
    filter: drop-shadow(0 0 7px rgba(255, 46, 196, 0.55));
  }
  /* interior fill, inset by the bezel width */
  .plate::before {
    content: '';
    position: absolute;
    inset: 2px;
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    background:
      linear-gradient(160deg, rgba(255, 46, 196, 0.14), transparent 42%),
      linear-gradient(180deg, rgba(26, 15, 46, 0.97) 0%, rgba(10, 7, 20, 0.98) 100%);
  }
  /* left accent rail + faint scan sheen */
  .plate::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
    background: linear-gradient(180deg, #16f2e0, #ff2ec4);
    box-shadow: 0 0 6px rgba(22, 242, 224, 0.7);
  }
  .plate-label,
  .plate-value { position: relative; z-index: 1; }
  .plate-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 12px;
    letter-spacing: 0.16em;
    color: rgba(180, 240, 255, 0.72);
    text-transform: uppercase;
  }
  .plate-value {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 30px;
    font-weight: 900;
    color: #ffd54a;
    text-shadow: 0 0 10px rgba(255, 213, 74, 0.7);
    line-height: 1;
    /* Large-win totals (up to the 5,000x wincap) can outgrow the plate at the
       nominal 30px size — clip rather than overflow into neighbouring HUD text. */
    max-width: 230px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Compact portrait strip (2026-07-15 neon polish pass) - native px
     throughout, docked between the grid and the FEATURES bar. */
  .pm-strip {
    display: flex;
    flex-direction: row;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
    /* 3px, not 8px: on the tightest tested profile (iPhone 14 portrait,
       height-capped), the extra strip pushed .game-wrapper's content ~5px
       past the viewport - measured via scrollHeight/clientHeight, not
       assumed - this trim closes that gap without shrinking the cells. */
    padding: 3px 12px 0;
    pointer-events: none;
  }
  .pm-cell {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 6px 4px;
    min-height: 48px;
    border-radius: 8px;
    background: linear-gradient(160deg, rgba(255, 46, 196, 0.12), transparent 60%), #150c1e;
    border: 1px solid rgba(255, 46, 196, 0.35);
    box-shadow: 0 0 10px rgba(255, 46, 196, 0.2);
  }
  .pm-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(230, 200, 255, 0.7);
    white-space: nowrap;
  }
  .pm-value {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 15px;
    font-weight: 800;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pm-value.pink { color: #ff6fe0; text-shadow: 0 0 8px rgba(255, 46, 196, 0.6); }
  .pm-value.cyan { color: #6ff2ff; text-shadow: 0 0 8px rgba(22, 242, 224, 0.5); }
  .pm-value.gold { color: #ffd54a; text-shadow: 0 0 8px rgba(255, 213, 74, 0.5); }
</style>
