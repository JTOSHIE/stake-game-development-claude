<script lang="ts">
  import { winAmount, betAmount, isWincap, scatterCount, locale, currencyCode } from '../stores/gameStore'
  import { t } from '../i18n/translations'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { onDestroy } from 'svelte'



  let targetValue  = 0
  let displayValue = 0
  let animFrame: number
  let animating    = false

  // Start a new count-up only when winAmount goes positive.
  // Never reset mid-animation — wait until animation finishes.
  $: if ($winAmount > 0 && $winAmount !== targetValue) {
    targetValue = $winAmount
    startCountUp(targetValue)
  } else if ($winAmount === 0 && !animating) {
    targetValue  = 0
    displayValue = 0
  }

  // Derive tier from targetValue (not the derived $winMultiplier store) so
  // colour/label stays correct for the full duration of the count-up animation,
  // even after winAmount has been reset to 0 for the next spin.
  $: winTier = (() => {
    const mult = $betAmount > 0 ? targetValue / $betAmount : 0
    if (mult >= 50) return 'mega'
    if (mult >= 10) return 'big'
    if (mult >= 1)  return 'gold'
    if (mult > 0)   return 'green'
    return 'none'
  })()

  // Keep scatter labels and wincap flag for the label area
  $: scatterKey = $scatterCount >= 5 ? 'scatter5'
                : $scatterCount === 4 ? 'scatter4'
                : $scatterCount === 3 ? 'scatter3'
                : null

  function startCountUp(target: number): void {
    cancelAnimationFrame(animFrame)
    animating      = true
    const start    = performance.now()
    const duration = 600

    function tick(now: number): void {
      const progress = Math.min((now - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      displayValue   = target * eased
      if (progress < 1) {
        animFrame = requestAnimationFrame(tick)
      } else {
        displayValue = target
        animating    = false
      }
    }

    animFrame = requestAnimationFrame(tick)
  }

  onDestroy(() => cancelAnimationFrame(animFrame))
</script>

{#if winTier !== 'none'}
  <div class="win-panel win-{winTier}" class:wincap-active={$isWincap}>

    <!-- Win category label (BIG WIN / MEGA WIN / scatter / wincap / idle) -->
    {#if winTier === 'mega'}
      <div class="win-label mega">MEGA WIN!</div>
    {:else if winTier === 'big'}
      <div class="win-label big">BIG WIN!</div>
    {:else if $isWincap}
      <div class="win-label wincap">{t($locale, 'wincap')}</div>
    {:else if scatterKey}
      <div class="win-label scatter">{t($locale, scatterKey)}</div>
    {:else}
      <div class="win-label idle">{t($locale, 'win')}</div>
    {/if}

    <!-- Count-up amount -->
    <div class="win-amount">
      {formatBalance(Math.round(displayValue * CURRENCY_SCALE), $currencyCode)}
    </div>

  </div>
{:else}
  <!-- Zero-win state: dim panel matching original layout -->
  <div class="win-panel win-idle">
    <div class="win-label idle">{t($locale, 'win')}</div>
    <div class="win-amount win-amount--empty">—</div>
  </div>
{/if}

<style>
  .win-panel {
    min-width: 200px;
    height: auto;
    padding: 0 1.2rem;
    border-radius: 8px;

    /* CSS-only dark glass panel — no background image */
    background: linear-gradient(135deg,
      rgba(20, 0, 30, 0.92) 0%,
      rgba(40, 0, 50, 0.88) 50%,
      rgba(20, 0, 30, 0.92) 100%
    );
    border: 1px solid rgba(255, 0, 255, 0.4);
    box-shadow:
      0 0 12px rgba(255, 0, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);

    font-family: 'Orbitron', 'Courier New', monospace;
    font-weight: 900;
    transition: filter 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-height: 56px;
  }

  .win-panel { outline: none; }

  .win-idle {
    opacity: 0.4;
  }

  .wincap-active {
    filter: drop-shadow(0 0 14px rgba(255, 215, 0, 0.9));
  }

  /* ── Amount ──────────────────────────────────────────────────────────────── */
  .win-amount {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.1rem;
    font-weight: 900;
    color: #FF00FF;
    text-shadow: 0 0 8px #FF00FF, 0 0 16px rgba(255, 0, 255, 0.4);
    letter-spacing: 2px;
    line-height: 1.3;
  }

  .win-amount--empty {
    color: rgba(255, 255, 255, 0.35);
    text-shadow: none;
  }

  .win-green  .win-amount { color: #FF00FF; text-shadow: 0 0 8px #FF00FF, 0 0 16px rgba(255, 0, 255, 0.4); }
  .win-gold   .win-amount { color: #FF00FF; text-shadow: 0 0 12px #FF00FF, 0 0 16px rgba(255, 0, 255, 0.4); }
  .win-big    .win-amount { color: #FF00FF; text-shadow: 0 0 15px #FF00FF, 0 0 16px rgba(255, 0, 255, 0.4); animation: pulse-glow 1.2s infinite; }
  .win-mega   .win-amount { color: #FF00FF; text-shadow: 0 0 20px #FF00FF, 0 0 16px rgba(255, 0, 255, 0.4); animation: pulse-glow 1.2s infinite; }

  /* Wincap overrides gold on the amount */
  .wincap-active .win-amount { color: #ffd700; text-shadow: 0 0 14px rgba(255,215,0,0.9); animation: pulse 0.6s ease-in-out infinite alternate; }

  /* ── Labels ──────────────────────────────────────────────────────────────── */
  .win-label {
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    font-weight: 700;
    text-transform: uppercase;
    line-height: 1;
  }

  .win-label.idle    { color: rgba(255,255,255,0.35); }
  .win-label.scatter { color: #a0e4ff; }
  .win-label.wincap  { color: #ffd700; }
  .win-label.big  {
    font-size: 1.2rem;
    color: #ff00ff;
    text-shadow: 0 0 20px #ff00ff;
    animation: label-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .win-label.mega {
    font-size: 1.2rem;
    color: #00ffff;
    text-shadow: 0 0 30px #00ffff;
    animation: label-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  /* ── Keyframes ───────────────────────────────────────────────────────────── */
  @keyframes pulse-glow {
    0%, 100% { text-shadow: 0 0 10px currentColor; }
    50%       { text-shadow: 0 0 25px currentColor, 0 0 50px currentColor; }
  }

  @keyframes pulse {
    from { transform: scale(1); }
    to   { transform: scale(1.1); }
  }

  @keyframes label-in {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
</style>
