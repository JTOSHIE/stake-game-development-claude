<script lang="ts">
  /**
   * WinBanner.svelte — LAYOUT_SPEC banner: compact 380x96, centred over the
   * grid at stage (450,262), translucent with a gold rim, z100. Motion Polish
   * v2: tiered BIG / MEGA / EPIC celebrations (10x / 30x / 100x — the same
   * thresholds the autoplay-pause logic already uses), staged count-up
   * duration and escalating CSS particle bursts per tier. Auto-dismisses.
   * Mounted as a stage-level sibling in App.svelte (stage coordinates).
   */
  import { onDestroy } from 'svelte'
  import { winMultiplier, winAmount, isSpinning, currencyCode } from '../stores/gameStore'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { isSocial } from '../stores/socialMode'

  const BIG_WIN_THRESHOLD  = 10
  const MEGA_WIN_THRESHOLD = 30
  const EPIC_WIN_THRESHOLD = 100

  type Tier = 'big' | 'mega' | 'epic'

  interface Particle { x: number; y: number; size: number; delay: number; dur: number; color: string; angle: number }

  const TIER_COLORS: Record<Tier, string[]> = {
    big:  ['#00ffff', '#80ffff', '#ffffff'],
    mega: ['#ff00ff', '#ff88ff', '#ffd700', '#ffffff'],
    epic: ['#ffd700', '#ffec80', '#00ffff', '#ff00ff', '#ffffff'],
  }
  const TIER_PARTICLE_COUNT: Record<Tier, number> = { big: 14, mega: 28, epic: 48 }
  const TIER_COUNT_UP_MS:    Record<Tier, number> = { big: 1400, mega: 2000, epic: 2800 }

  let visible = false
  let tier: Tier = 'big'
  let displayAmount = 0
  let particles: Particle[] = []
  let dismissTimer: ReturnType<typeof setTimeout> | null = null
  let countUpFrame: number | null = null
  let lastShownWin = 0

  $: if ($winAmount > 0 && !$isSpinning && $winMultiplier >= BIG_WIN_THRESHOLD) {
    if ($winAmount !== lastShownWin) {
      lastShownWin = $winAmount
      const t: Tier = $winMultiplier >= EPIC_WIN_THRESHOLD ? 'epic'
        : $winMultiplier >= MEGA_WIN_THRESHOLD ? 'mega' : 'big'
      showBanner($winAmount, t)
    }
  }

  $: if ($isSpinning) {
    visible = false
    displayAmount = 0
    lastShownWin = 0
    particles = []
  }

  function makeParticles(count: number, colors: string[]): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 3 + Math.random() * 6,
      delay: Math.random() * 0.4,
      dur: 0.7 + Math.random() * 0.6,
      color: colors[i % colors.length],
      angle: Math.random() * 360,
    }))
  }

  function showBanner(winDollars: number, t: Tier): void {
    if (dismissTimer) clearTimeout(dismissTimer)
    if (countUpFrame) cancelAnimationFrame(countUpFrame)

    tier = t
    displayAmount = 0
    visible = true
    particles = makeParticles(TIER_PARTICLE_COUNT[t], TIER_COLORS[t])

    // Staged count-up — duration escalates with tier.
    const startTime = performance.now()
    const duration = TIER_COUNT_UP_MS[t]

    function countUp(): void {
      const elapsed = Math.min(performance.now() - startTime, duration)
      const progress = elapsed / duration
      displayAmount = winDollars * (1 - Math.pow(1 - progress, 3))
      if (progress < 1) {
        countUpFrame = requestAnimationFrame(countUp)
      } else {
        displayAmount = winDollars
        countUpFrame = null
      }
    }
    countUpFrame = requestAnimationFrame(countUp)

    dismissTimer = setTimeout(() => {
      visible = false
      displayAmount = 0
      particles = []
    }, duration + 2200)
  }

  onDestroy(() => {
    if (dismissTimer) clearTimeout(dismissTimer)
    if (countUpFrame) cancelAnimationFrame(countUpFrame)
  })

  $: tierLabel = tier === 'epic' ? (($isSocial ? 'EPIC PRIZE' : 'EPIC WIN'))
    : tier === 'mega' ? ($isSocial ? 'MEGA PRIZE' : 'MEGA WIN')
    : ($isSocial ? 'BIG PRIZE' : 'BIG WIN')
  $: amountLabel = formatBalance(Math.round(displayAmount * CURRENCY_SCALE), $currencyCode || 'USD')
</script>

{#if visible}
  <div class="big-win-banner tier-{tier}" class:active={visible} data-testid="win-banner">
    {#each particles as p}
      <div
        class="banner-particle"
        style="
          left:{p.x}%; top:{p.y}%; width:{p.size}px; height:{p.size}px;
          background:{p.color}; box-shadow:0 0 {Math.round(p.size)}px {p.color};
          animation-delay:{p.delay}s; animation-duration:{p.dur}s; --angle:{p.angle}deg;
        "
        aria-hidden="true"
      ></div>
    {/each}
    <div class="tier-label">{tierLabel}</div>
    <div class="win-amount">{amountLabel}</div>
  </div>
{/if}

<style>
  /* Compact 380x96, centred over the grid at stage (450,262), z100 */
  .big-win-banner {
    position: absolute;
    left: 450px;
    top: 262px;
    width: 380px;
    height: 96px;
    z-index: 100;
    pointer-events: none;
    overflow: visible;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(10, 8, 0, 0.55) 0%, rgba(25, 20, 0, 0.45) 100%);
    border: 2px solid rgba(255, 215, 0, 0.75);
    box-shadow: 0 0 24px rgba(255, 215, 0, 0.35), inset 0 0 20px rgba(255, 215, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.3s ease-in;
  }

  .big-win-banner.active {
    opacity: 1;
    animation: bannerPulse 2s ease-in-out infinite;
  }

  /* Escalating intensity per tier */
  .big-win-banner.tier-mega { border-color: rgba(255, 0, 255, 0.8); box-shadow: 0 0 32px rgba(255, 0, 255, 0.45), inset 0 0 20px rgba(255, 0, 255, 0.1); }
  .big-win-banner.tier-epic { border-color: rgba(255, 215, 0, 0.95); box-shadow: 0 0 48px rgba(255, 215, 0, 0.6), 0 0 90px rgba(0, 255, 255, 0.25), inset 0 0 24px rgba(255, 215, 0, 0.15); }

  @keyframes bannerPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
  .big-win-banner.tier-epic.active { animation: bannerPulse 1.1s ease-in-out infinite; }

  .tier-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.85rem;
    font-weight: 900;
    letter-spacing: 0.16em;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  }
  .tier-mega .tier-label { color: #ff2ec4; text-shadow: 0 0 10px rgba(255, 46, 196, 0.85); }
  .tier-epic .tier-label { color: #ffd700; text-shadow: 0 0 14px rgba(255, 215, 0, 0.95), 0 0 26px rgba(0, 255, 255, 0.5); }

  .win-amount {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2rem;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    color: #00FFFF;
    text-shadow: 0 0 15px #00FFFF, 0 0 30px #00FFFF;
    letter-spacing: 4px;
    white-space: nowrap;
  }

  /* ── Escalating particle burst ────────────────────────────────────────── */
  .banner-particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: banner-burst-out 1s ease-out forwards;
  }
  @keyframes banner-burst-out {
    0%   { transform: scale(1.2) translate(0, 0); opacity: 1; }
    100% { transform: scale(0) translate(calc(cos(var(--angle)) * 60px), calc(sin(var(--angle)) * -90px)); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .big-win-banner, .big-win-banner.active, .big-win-banner.tier-epic.active { animation: none; }
    .banner-particle { animation: none; opacity: 0; }
  }
</style>
