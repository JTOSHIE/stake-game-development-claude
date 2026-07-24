<script lang="ts">
  // BonusInstrumentColumn.svelte — LAYOUT_SPEC bonus instrument column
  // (Overdrive only). gauge_face + a separately rotating gauge_needle sprite
  // driven by the live meter, a FREE SPINS field, and TOTAL WIN on the
  // instrument plate export — all fed by the same live values
  // FreeSpinsPresentation drives (bound in App.svelte).
  //
  // OWNER AUDIT ROUND 2, item 3 relayout: the gauge no longer carries its
  // own spin-count text (that was the odometer window baked into the dial)
  // - FreeSpinsPresentation's own top-right overlay meter is gone entirely
  // (reels at maximum size), and this column is now the single source of
  // in-feature instrumentation for both layouts. Desktop/landscape order is
  // tachometer, FREE SPINS, TOTAL WIN, with the pre-existing MULTIPLIER
  // plate pushed down after them (still shown, just no longer first).
  // Portrait shows exactly two fields: OVERDRIVE FREE SPINS count and
  // TOTAL WIN (no multiplier field - the tachometer is a landscape-only
  // centrepiece per the brief).
  import { onMount } from 'svelte'
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

  let reduced = false
  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // Needle sweeps roughly -110deg (low) to +110deg (high) through the top,
  // normalised against the same reference ceiling as the legacy OverdriveMeter
  // fill bar (15x above the 1x floor) — purely a visual sweep, not physical.
  $: needleDeg = -110 + Math.max(0, Math.min(1, (multiplier - 1) / 15)) * 220
  // Colour-graded glow (item 3: "needle sweep on meter change, colour-graded
  // glow"): green at the floor, cyan mid-range, magenta once the meter is
  // running hot - same tier language the rest of the HUD uses.
  $: needleGlow = multiplier >= 10 ? '#ff2ec4' : multiplier >= 4 ? '#16f2e0' : '#4eff91'

  $: totalWinLabel = formatBalance(
    Math.round((runningTotalCentibets / 100) * $betAmount * CURRENCY_SCALE),
    $currencyCode || 'USD',
  )
</script>

{#if compact}
  <!-- Compact portrait strip (2026-07-15, condensed 2026-07-24b to exactly
       two fields per the owner-audit relayout: OVERDRIVE FREE SPINS count
       and TOTAL WIN - the multiplier readout is a landscape-only tachometer
       concern now). Fully self-contained, native CSS px throughout, no
       LAYOUT_SPEC absolute coordinates - geometrically guaranteed on-screen
       since it's a normal-flow native-DOM element, not part of the scaled
       canvas. -->
  <div class="pm-strip" data-testid="bonus-instrument-column">
    <div class="pm-cell" data-testid="odometer">
      <span class="pm-label">OVERDRIVE FREE SPINS</span>
      <span class="pm-value cyan">{spinsRemaining}</span>
    </div>
    <div class="pm-cell" data-testid="feature-total-win">
      <span class="pm-label">TOTAL WIN</span>
      <span class="pm-value gold">{totalWinLabel}</span>
    </div>
  </div>
{:else}
  <!-- Desktop/landscape column (relayout 2026-07-24b): tachometer, FREE
       SPINS, TOTAL WIN, then the pre-existing MULTIPLIER plate pushed down
       after them. The gauge is now the animated neon centrepiece itself -
       no spin-count text baked into the dial any more. -->
  <div class="instrument-column" data-testid="bonus-instrument-column">
    <div class="gauge" class:reduced style="width:232px;height:232px; --needle-glow:{needleGlow};">
      <img class="gauge-face" src="{$themeAssets.assetBase}/ui/gauge_face.png" alt="" draggable="false" />
      <img
        class="gauge-needle"
        src="{$themeAssets.assetBase}/ui/gauge_needle.png"
        alt=""
        draggable="false"
        style="transform: rotate({needleDeg}deg);"
      />
    </div>

    <div class="plate" data-testid="odometer">
      <span class="plate-label">FREE SPINS</span>
      <span class="plate-value">{spinsRemaining}</span>
    </div>

    <div class="plate" data-testid="feature-total-win">
      <span class="plate-label">TOTAL WIN</span>
      <span class="plate-value">{totalWinLabel}</span>
    </div>

    <div class="plate">
      <span class="plate-label">MULTIPLIER</span>
      <span class="plate-value">{multiplier}×</span>
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
  /* Tachometer neon centrepiece (OWNER AUDIT ROUND 2, item 3): a livelier
     overshoot sweep on every meter change (not a plain linear snap), plus a
     colour-graded glow (--needle-glow, set from the multiplier tier) that
     brightens along with the sweep. Reduced-motion gets a static fallback -
     the needle still points at the right value, it just never animates or
     glows. */
  .gauge-needle {
    transform-origin: 50% 50%;
    transition: transform 0.6s cubic-bezier(0.22, 1.65, 0.32, 1), filter 0.5s ease;
    filter: drop-shadow(0 0 10px var(--needle-glow, #4eff91)) drop-shadow(0 0 22px color-mix(in srgb, var(--needle-glow, #4eff91) 55%, transparent));
  }
  .gauge.reduced .gauge-needle {
    transition: none;
    filter: drop-shadow(0 0 4px var(--needle-glow, #4eff91));
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
    /* Two fields only now (item 3), one of which is the longer "OVERDRIVE
       FREE SPINS" label - let it wrap onto a second line rather than
       force-nowrap/overflow; the cell has no fixed height so it grows. */
    white-space: normal;
    line-height: 1.2;
    text-align: center;
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
