<script lang="ts">
  /**
   * WinBanner.svelte - LAYOUT_SPEC banner: compact 380x96, centred over the
   * grid at stage (450,262), translucent with a gold rim, z100. Motion Polish
   * v2: tiered BIG / MEGA / EPIC celebrations (10x / 30x / 100x - the same
   * thresholds the autoplay-pause logic already uses), staged count-up
   * duration and escalating CSS particle bursts per tier. Auto-dismisses.
   * Mounted as a stage-level sibling in App.svelte (stage coordinates).
   */
  import { onDestroy, onMount } from 'svelte'
  import { winMultiplier, winAmount, isSpinning, currencyCode } from '../stores/gameStore'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { isSocial } from '../stores/socialMode'
  import { overdriveVisual } from '../stores/overdriveVisual'
  import { themeAssets } from '../stores/themeStore'
  import { autofitText } from '../actions/autofitText'

  const BIG_WIN_THRESHOLD  = 10
  const MEGA_WIN_THRESHOLD = 30
  const EPIC_WIN_THRESHOLD = 100

  type Tier = 'big' | 'mega' | 'epic'

  interface Particle { x: number; y: number; size: number; delay: number; dur: number; color: string; angle: number }
  // Coin-fountain particle (ANIMATION UPLIFT PASS 2026-07-16, item 3): epic
  // tier only. Each coin gets its own upward-arc-then-fall trajectory via a
  // per-particle --dx/--peak custom property pair consumed by the
  // c1-coin-fountain keyframe, mirroring the existing --angle approach
  // makeParticles() already uses for the burst layer.
  interface Coin { x: number; dx: number; delay: number; dur: number; size: number; rot: number }

  let reduced = false
  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

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
  let coins: Coin[] = []
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
    coins = []
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

  // Coin fountain (ANIMATION UPLIFT PASS 2026-07-16, item 3): epic tier only
  // ("epic and max" - a true max/wincap win is >= EPIC_WIN_THRESHOLD whenever
  // it reaches this banner at all, so the epic tier already covers both).
  const COIN_COUNT = 16
  function makeCoins(): Coin[] {
    return Array.from({ length: COIN_COUNT }, () => ({
      x: 20 + Math.random() * 60,
      dx: -40 + Math.random() * 80,
      delay: Math.random() * 0.5,
      dur: 0.9 + Math.random() * 0.5,
      size: 16 + Math.random() * 14,
      rot: Math.random() * 360,
    }))
  }

  function showBanner(winDollars: number, t: Tier): void {
    if (dismissTimer) clearTimeout(dismissTimer)
    if (countUpFrame) cancelAnimationFrame(countUpFrame)

    tier = t
    displayAmount = 0
    visible = true
    particles = makeParticles(TIER_PARTICLE_COUNT[t], TIER_COLORS[t])
    coins = t === 'epic' && !reduced ? makeCoins() : []

    // Staged count-up - duration escalates with tier.
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
      coins = []
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
  $: multLabel = `${Math.round($winMultiplier)}x`
</script>

{#if visible}
  <div
    class="c1-win big-win-banner tier-{tier}"
    class:c1-win--overdrive={$overdriveVisual}
    class:active={visible}
    data-testid="win-banner"
  >
    {#if tier === 'epic' && !reduced}
      <div class="c1-chromatic-flash" data-testid="win-chromatic-flash" aria-hidden="true"></div>
    {/if}
    <div class="c1-plate-wrap">
      {#if !reduced}
        <img
          class="c1-shockwave"
          src="{$themeAssets.assetBase}/ui/particles/shock_ring.png"
          alt=""
          aria-hidden="true"
          data-testid="win-shockwave"
        />
      {/if}
      {#if coins.length > 0}
        <div class="c1-coin-layer" aria-hidden="true" data-testid="win-coin-fountain">
          {#each coins as c}
            <img
              class="c1-coin"
              src="{$themeAssets.assetBase}/ui/particles/coin.png"
              alt=""
              style="left:{c.x}%; width:{c.size}px; height:{c.size}px; --dx:{c.dx}px; --rot:{c.rot}deg; animation-delay:{c.delay}s; animation-duration:{c.dur}s;"
            />
          {/each}
        </div>
      {/if}
      <div class="c1-particle-layer" aria-hidden="true">
        {#each particles as p}
          <div
            class="c1-particle"
            style="
              left:{p.x}%; top:{p.y}%; width:{p.size}px; height:{p.size}px;
              background:{p.color}; box-shadow:0 0 {Math.round(p.size)}px {p.color};
              animation-delay:{p.delay}s; animation-duration:{p.dur}s; --angle:{p.angle}deg;
            "
            aria-hidden="true"
          ></div>
        {/each}
      </div>
      <div class="fs-plate">
        <span class="fs-rail"></span>
        <div class="fs-face">
          <div class="c1-tier-label">{tierLabel}</div>
          <div class="c1-amount fs-num" use:autofitText={amountLabel}>{amountLabel}</div>
          <div class="c1-mult fs-num">{multLabel} BET</div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ── 5 signature tokens (canonical, from CHROME_PRIMITIVES.md) ─────────── */
  .c1-win {
    --sig-cyan: var(--theme-primary, #00FFFF);
    --sig-magenta: var(--theme-secondary, #FF00FF);
    --sig-pink: #FF2EC4;
    --sig-gold: #FFD700;
    --sig-orange: #FF9A2E;
    --sig-green: #4EFF91;
    --acc: var(--sig-cyan);
    --acc2: var(--sig-pink);
  }
  .c1-win--overdrive { --acc: var(--sig-pink); --acc2: var(--sig-orange); }

  /* tier drives the plate signature colour; overdrive warms it */
  .tier-big  .fs-plate { --sig: var(--sig-cyan); }
  .tier-mega .fs-plate { --sig: var(--sig-pink); }
  .tier-epic .fs-plate { --sig: var(--sig-gold); }
  .c1-win--overdrive.tier-big  .fs-plate { --sig: var(--sig-pink); }
  .c1-win--overdrive.tier-mega .fs-plate { --sig: var(--sig-orange); }
  .c1-win--overdrive.tier-epic .fs-plate { --sig: var(--sig-orange); }

  /* ── Positioning: centred over the grid at stage (640, 310), z100 ─────── */
  .big-win-banner {
    position: absolute;
    left: 640px;
    top: 310px;
    transform: translate(-50%, -50%);
    z-index: 100;
    pointer-events: none;
    overflow: visible;
  }

  /* ── Primitives (verbatim canonical) ──────────────────────────────────── */
  .fs-plate {
    position: relative; --sig: var(--sig-cyan); padding: 2px;
    clip-path: polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px));
    background: linear-gradient(150deg, #eef5fa, #b3c6d2 15%, #63737f 37%, #2b363f 52%, #8499a8 72%, #dceaf2);
    box-shadow: 0 3px 10px rgba(0,0,0,.6), 0 0 9px color-mix(in srgb, var(--sig) 20%, transparent), inset 0 1px 0 rgba(255,255,255,.35);
  }
  .fs-plate > .fs-face {
    position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    /* NEON LIFT (2026-07-15): 12% -> 18% - a richer inner glow tint, same
       tier/theme colour tokens, no structural change to the escalation. */
    background: linear-gradient(160deg, color-mix(in srgb, var(--sig) 18%, transparent), transparent 44%), linear-gradient(180deg, #111a2b, #070b16);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.07), inset 0 -8px 18px rgba(0,0,0,.6);
  }
  .fs-rail {
    position: absolute; left: 2px; top: 9px; bottom: 9px; width: 3px; border-radius: 2px; z-index: 2;
    background: var(--sig); box-shadow: 0 0 8px var(--sig);
  }
  .fs-num { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }

  /* ── Tier escalation: bigger plate + bigger bloom, same tokens ────────── */
  .tier-big  .fs-face { width: 420px; padding: 34px 30px; }
  .tier-mega .fs-face { width: 500px; padding: 44px 36px; }
  .tier-epic .fs-face { width: 580px; padding: 54px 42px; }
  /* NEON LIFT (2026-07-15): a secondary purple/pink accent glow layered
     under each tier's own signature colour (unchanged from before), rather
     than replacing the existing cyan/pink/gold escalation - "richer"
     accents, not a different colour scheme. */
  .tier-big  .fs-plate { box-shadow: 0 3px 10px rgba(0,0,0,.6), 0 0 9px color-mix(in srgb, var(--sig) 20%, transparent), 0 0 30px color-mix(in srgb, var(--sig-pink) 16%, transparent), inset 0 1px 0 rgba(255,255,255,.35); }
  .tier-mega .fs-plate { box-shadow: 0 3px 14px rgba(0,0,0,.6), 0 0 22px color-mix(in srgb, var(--sig) 40%, transparent), 0 0 55px color-mix(in srgb, #a855f7 28%, transparent), inset 0 1px 0 rgba(255,255,255,.35); }
  .tier-epic .fs-plate { box-shadow: 0 4px 20px rgba(0,0,0,.65), 0 0 46px color-mix(in srgb, var(--sig) 55%, transparent), 0 0 95px color-mix(in srgb, var(--sig-cyan) 22%, transparent), 0 0 130px color-mix(in srgb, var(--sig-pink) 20%, transparent), inset 0 1px 0 rgba(255,255,255,.35); }

  .c1-tier-label { font-family: 'Orbitron', system-ui, sans-serif; font-weight: 900; letter-spacing: .18em; color: var(--acc); text-shadow: 0 0 12px color-mix(in srgb, var(--acc) 70%, transparent); text-transform: uppercase; }
  .tier-big  .c1-tier-label { font-size: 20px; }
  .tier-mega .c1-tier-label { font-size: 27px; }
  .tier-epic .c1-tier-label { font-size: 35px; }

  /* B1 sharp numeral: near-white fill, tight 3px halo, no wide double glow.
     OWNER AUDIT REMEDIATION B2: font-size scales down via the autofitText
     action's --autofit-scale so seven-digit wins ($1,000,000+) fit the
     fixed-width plate instead of overflowing/truncating. */
  .c1-amount {
    font-family: 'Orbitron', system-ui, sans-serif; font-weight: 900; color: #f4fbff;
    text-shadow: 0 0 3px var(--acc); letter-spacing: 2px; margin-top: 6px; white-space: nowrap;
    /* width:100% (not just max-width) is load-bearing: .fs-face is a flex
       column with align-items:center, so a child sizes to its own CONTENT
       by default - without an explicit width, clientWidth would equal the
       (unclamped) text's natural width and the autofitText action's own
       overflow check (scrollWidth > clientWidth) could never fire. */
    width: 100%; box-sizing: border-box; text-align: center;
    max-width: 100%; overflow: hidden;
  }
  .tier-big  .c1-amount { font-size: calc(46px * var(--autofit-scale, 1)); }
  .tier-mega .c1-amount { font-size: calc(60px * var(--autofit-scale, 1)); }
  .tier-epic .c1-amount { font-size: calc(76px * var(--autofit-scale, 1)); }
  .c1-mult { font-family: 'Orbitron', system-ui, sans-serif; font-weight: 800; font-size: 15px; letter-spacing: .16em; color: var(--sig-gold); margin-top: 8px; text-shadow: 0 0 8px color-mix(in srgb, var(--sig-gold) 55%, transparent); }

  /* ── Entry + pulse (ANIMATION UPLIFT PASS 2026-07-16, item 3: stronger
       slam-in overshoot - 0.4->1.1->1 instead of 0.5->1.06->1) ───────────── */
  .c1-plate-wrap { position: relative; animation: c1-enter .6s cubic-bezier(.34,1.56,.64,1) both; }
  .tier-epic .c1-plate-wrap { animation: c1-enter .6s cubic-bezier(.34,1.56,.64,1) both, c1-pulse 1.1s ease-in-out .6s infinite; }
  @keyframes c1-enter { 0% { opacity: 0; transform: scale(.4); } 55% { opacity: 1; transform: scale(1.1); } 100% { transform: scale(1); } }
  @keyframes c1-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }

  /* ── Expanding shock ring (ANIMATION UPLIFT PASS 2026-07-16, item 3): the
       shared shock_ring particle, scaled a little larger per tier so it
       feels proportionate to the plate it's bursting behind. ────────────── */
  .c1-shockwave {
    position: absolute; top: 50%; left: 50%; pointer-events: none; z-index: 1;
    transform: translate(-50%, -50%) scale(0.25); opacity: 0;
    animation: c1-shockwave-burst 0.6s ease-out both;
  }
  .tier-big  .c1-shockwave { width: 260px; height: 260px; }
  .tier-mega .c1-shockwave { width: 340px; height: 340px; }
  .tier-epic .c1-shockwave { width: 440px; height: 440px; }
  @keyframes c1-shockwave-burst {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.25); }
    15%  { opacity: 0.85; }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.6); }
  }

  /* ── Coin fountain (ANIMATION UPLIFT PASS 2026-07-16, item 3): epic tier
       only. Each coin rises on an arc (--dx horizontal drift, easing curve
       supplies the up-then-down feel) then fades near the bottom. ───────── */
  .c1-coin-layer { position: absolute; inset: 0; pointer-events: none; z-index: 4; overflow: visible; }
  .c1-coin {
    position: absolute; top: 60%; opacity: 0;
    animation-name: c1-coin-fountain; animation-timing-function: cubic-bezier(.25,.65,.4,1); animation-fill-mode: both;
  }
  @keyframes c1-coin-fountain {
    0%   { opacity: 0; transform: translate(0, 0) rotate(0deg); }
    10%  { opacity: 1; }
    55%  { transform: translate(calc(var(--dx) * 0.6), -140px) rotate(calc(var(--rot) * 0.6)); }
    100% { opacity: 0; transform: translate(var(--dx), 40px) rotate(var(--rot)); }
  }

  /* ── Chromatic flash frame (ANIMATION UPLIFT PASS 2026-07-16, item 3): a
       single quick RGB-channel-split flash on the epic/max tier, layered
       full-viewport so it reads as a screen-wide flash rather than just a
       plate effect. ──────────────────────────────────────────────────────── */
  .c1-chromatic-flash {
    position: fixed; inset: 0; z-index: 200; pointer-events: none;
    animation: c1-chromatic-flash 0.28s ease-out both;
    mix-blend-mode: screen;
  }
  @keyframes c1-chromatic-flash {
    0%   { opacity: 0; box-shadow: inset 6px 0 0 rgba(255,0,80,0), inset -6px 0 0 rgba(0,255,255,0); }
    12%  { opacity: 1; box-shadow: inset 6px 0 0 rgba(255,0,80,0.5), inset -6px 0 0 rgba(0,255,255,0.5); }
    100% { opacity: 0; box-shadow: inset 6px 0 0 rgba(255,0,80,0), inset -6px 0 0 rgba(0,255,255,0); }
  }

  /* ── Particles ────────────────────────────────────────────────────────── */
  .c1-particle-layer { position: absolute; inset: -50px; pointer-events: none; z-index: 3; }
  .c1-particle { position: absolute; border-radius: 50%; pointer-events: none; animation: c1-burst 1s ease-out forwards; }
  @keyframes c1-burst {
    0% { transform: scale(1.2) translate(0,0); opacity: 1; }
    100% { transform: scale(0) translate(calc(cos(var(--angle)) * 70px), calc(sin(var(--angle)) * -100px)); opacity: 0; }
  }

  /* ── Reduced motion guard ─────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .c1-plate-wrap, .tier-epic .c1-plate-wrap, .c1-particle { animation: none !important; }
    .c1-particle { opacity: 0; }
    .c1-shockwave, .c1-coin, .c1-chromatic-flash { display: none; }
  }
</style>
