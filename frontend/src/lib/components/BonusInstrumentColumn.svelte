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

  // Needle sweeps roughly -110deg (low) to +110deg (high) through the top,
  // normalised against the same reference ceiling as the legacy OverdriveMeter
  // fill bar (15x above the 1x floor) — purely a visual sweep, not physical.
  $: needleDeg = -110 + Math.max(0, Math.min(1, (multiplier - 1) / 15)) * 220

  $: totalWinLabel = formatBalance(
    Math.round((runningTotalCentibets / 100) * $betAmount * CURRENCY_SCALE),
    $currencyCode || 'USD',
  )
</script>

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
</style>
