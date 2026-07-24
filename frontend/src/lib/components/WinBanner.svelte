<script lang="ts">
  /**
   * WinBanner.svelte - WIN BANNER V3 (OWNER AUDIT ROUND 2, item 2): a
   * full-width neon band spanning the stage edge to edge, layered glow
   * borders top and bottom, reels visible above and below (replaces the
   * prior centred box that blocked the grid). Tiered BIG / MEGA / EPIC
   * celebrations (10x / 30x / 100x - the same thresholds the autoplay-pause
   * logic already uses), staged count-up duration and escalating CSS
   * particle bursts per tier. Auto-dismisses. Mounted as a stage-level
   * sibling in App.svelte (stage coordinates) for base-game big wins.
   *
   * Also serves as the feature-end celebration (item 1/2: "one end-of-
   * feature celebration ... used for base-game big wins and the
   * feature-end celebration alike"): FreeSpinsPresentation mounts its own
   * instance and drives it via the explicit `amount`/`multiplier`/`trigger`
   * props instead of the reactive $winAmount path, so the exact same visual
   * component covers both moments rather than a bespoke duplicate.
   */
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
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

  // OWNER AUDIT ROUND 2, item 1: suppresses the reactive (base-game) trigger
  // for one round - set true by App.svelte for the single settlement that
  // lands right after a feature finishes, so this instance doesn't pop a
  // SECOND celebration on top of the one FreeSpinsPresentation's own
  // explicit-trigger instance already showed.
  export let suppressed = false
  // Explicit-trigger mode: when the caller supplies a non-null `amount` and
  // bumps `trigger`, the banner shows THAT value/tier instead of watching
  // $winAmount. `multiplier` is the bet-multiple (drives tier + the "Nx BET"
  // line) - the tier ternary below already floors at 'big' for any amount
  // under the mega threshold, so an explicit trigger always renders a
  // genuine celebration even for a modest feature outcome, unlike the
  // reactive base-game path which shows no banner at all under 10x.
  export let amount: number | null = null
  export let multiplier: number | null = null
  export let trigger = 0

  // Fired when the banner auto-dismisses - lets an explicit-trigger caller
  // (FreeSpinsPresentation's feature-end celebration) chain its own
  // completion without duplicating the tier-duration constants here.
  const dispatch = createEventDispatcher<{ dismissed: void }>()

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
  let lastTrigger = 0
  // Shown multiplier for the "Nx BET" line - the explicit-trigger path
  // passes its own bet-multiple in (independent of $winMultiplier, which the
  // deferred settlement means is not yet valid during a feature).
  let shownMultiplier = 0

  // Explicit-trigger path (feature-end celebration) - independent of
  // $isSpinning/$winAmount entirely, since isSpinning is still true and
  // winAmount is still deliberately un-settled for the whole feature (see
  // App.svelte's settleRound() deferral).
  $: if (amount !== null && trigger !== lastTrigger) {
    lastTrigger = trigger
    const m = multiplier ?? 0
    const t: Tier = m >= EPIC_WIN_THRESHOLD ? 'epic' : m >= MEGA_WIN_THRESHOLD ? 'mega' : 'big'
    showBanner(amount, t, m)
  }

  // Reactive (base-game) path - unchanged behaviour, now also gated on
  // `suppressed` and skipped entirely once a caller has taken over via the
  // explicit-trigger props (amount !== null).
  $: if (amount === null && $winAmount > 0 && !$isSpinning && !suppressed && $winMultiplier >= BIG_WIN_THRESHOLD) {
    if ($winAmount !== lastShownWin) {
      lastShownWin = $winAmount
      const t: Tier = $winMultiplier >= EPIC_WIN_THRESHOLD ? 'epic'
        : $winMultiplier >= MEGA_WIN_THRESHOLD ? 'mega' : 'big'
      showBanner($winAmount, t, $winMultiplier)
    }
  }

  $: if (amount === null && $isSpinning) {
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

  function showBanner(winDollars: number, t: Tier, mult: number): void {
    if (dismissTimer) clearTimeout(dismissTimer)
    if (countUpFrame) cancelAnimationFrame(countUpFrame)

    tier = t
    shownMultiplier = mult
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
      dispatch('dismissed')
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
  $: multLabel = `${Math.round(shownMultiplier)}x`
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
        <span class="band-edge band-edge-top" aria-hidden="true"></span>
        <span class="band-edge band-edge-bottom" aria-hidden="true"></span>
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

  /* ── WIN BANNER V3 (OWNER AUDIT ROUND 2, item 2): full-width neon band,
       stage edge to edge, vertically centred on the grid at stage y=310 -
       no longer a centred box, so reels stay visible above and below. ──── */
  .big-win-banner {
    position: absolute;
    left: 0;
    right: 0;
    top: 310px;
    transform: translateY(-50%);
    width: 100%;
    z-index: 100;
    pointer-events: none;
    overflow: visible;
  }

  /* ── Primitives: a horizontal band, not a card - no clip-path corners
       (edge to edge reads as a strip, not a plate), layered glow BORDERS
       top and bottom instead of the previous single left rail. ─────────── */
  .fs-plate {
    position: relative; --sig: var(--sig-cyan); width: 100%;
    background: linear-gradient(150deg, #eef5fa, #b3c6d2 15%, #63737f 37%, #2b363f 52%, #8499a8 72%, #dceaf2);
    box-shadow: 0 3px 10px rgba(0,0,0,.6), 0 0 9px color-mix(in srgb, var(--sig) 20%, transparent);
  }
  .fs-plate > .fs-face {
    position: relative; display: flex; flex-direction: row; align-items: baseline; justify-content: center;
    width: 100%; box-sizing: border-box;
    /* NEON LIFT (2026-07-15): 12% -> 18% - a richer inner glow tint, same
       tier/theme colour tokens, no structural change to the escalation. */
    background: linear-gradient(160deg, color-mix(in srgb, var(--sig) 18%, transparent), transparent 44%), linear-gradient(180deg, #111a2b, #070b16);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.07), inset 0 -8px 18px rgba(0,0,0,.6);
  }
  /* Layered glow borders: a bright hairline plus a soft blurred halo on
     each edge of the band, so it reads as a lit neon tube top and bottom. */
  .band-edge {
    position: absolute; left: 0; right: 0; height: 3px; z-index: 2;
    background: var(--sig);
    box-shadow: 0 0 6px var(--sig), 0 0 18px color-mix(in srgb, var(--sig) 70%, transparent), 0 0 36px color-mix(in srgb, var(--sig) 40%, transparent);
  }
  .band-edge-top { top: 0; }
  .band-edge-bottom { bottom: 0; }
  .fs-num { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }

  /* ── Tier escalation: taller band + bigger bloom, same tokens ─────────── */
  .tier-big  .fs-face { min-height: 110px; padding: 18px 60px; gap: 32px; }
  .tier-mega .fs-face { min-height: 140px; padding: 22px 60px; gap: 36px; }
  .tier-epic .fs-face { min-height: 170px; padding: 26px 60px; gap: 40px; }
  /* NEON LIFT (2026-07-15): a secondary purple/pink accent glow layered
     under each tier's own signature colour (unchanged from before), rather
     than replacing the existing cyan/pink/gold escalation - "richer"
     accents, not a different colour scheme. */
  .tier-big  .fs-plate { box-shadow: 0 3px 10px rgba(0,0,0,.6), 0 0 9px color-mix(in srgb, var(--sig) 20%, transparent), 0 0 30px color-mix(in srgb, var(--sig-pink) 16%, transparent); }
  .tier-mega .fs-plate { box-shadow: 0 3px 14px rgba(0,0,0,.6), 0 0 22px color-mix(in srgb, var(--sig) 40%, transparent), 0 0 55px color-mix(in srgb, #a855f7 28%, transparent); }
  .tier-epic .fs-plate { box-shadow: 0 4px 20px rgba(0,0,0,.65), 0 0 46px color-mix(in srgb, var(--sig) 55%, transparent), 0 0 95px color-mix(in srgb, var(--sig-cyan) 22%, transparent), 0 0 130px color-mix(in srgb, var(--sig-pink) 20%, transparent); }

  .c1-tier-label { font-family: 'Orbitron', system-ui, sans-serif; font-weight: 900; letter-spacing: .18em; color: var(--acc); text-shadow: 0 0 12px color-mix(in srgb, var(--acc) 70%, transparent); text-transform: uppercase; white-space: nowrap; }
  .tier-big  .c1-tier-label { font-size: 22px; }
  .tier-mega .c1-tier-label { font-size: 28px; }
  .tier-epic .c1-tier-label { font-size: 36px; }

  /* B1 sharp numeral: near-white fill, tight 3px halo, no wide double glow.
     OWNER AUDIT REMEDIATION B2: font-size scales down via the autofitText
     action's --autofit-scale so seven-digit wins ($1,000,000+) fit the
     band instead of overflowing/truncating. Fixed max-width (not 100% of a
     flex row) since the band now lays tier/amount/mult out horizontally. */
  .c1-amount {
    font-family: 'Orbitron', system-ui, sans-serif; font-weight: 900; color: #f4fbff;
    text-shadow: 0 0 3px var(--acc); letter-spacing: 2px; white-space: nowrap;
    width: min(46vw, 640px); box-sizing: border-box; text-align: center;
    max-width: min(46vw, 640px); overflow: hidden;
  }
  .tier-big  .c1-amount { font-size: calc(50px * var(--autofit-scale, 1)); }
  .tier-mega .c1-amount { font-size: calc(64px * var(--autofit-scale, 1)); }
  .tier-epic .c1-amount { font-size: calc(80px * var(--autofit-scale, 1)); }
  .c1-mult { font-family: 'Orbitron', system-ui, sans-serif; font-weight: 800; font-size: 16px; letter-spacing: .16em; color: var(--sig-gold); text-shadow: 0 0 8px color-mix(in srgb, var(--sig-gold) 55%, transparent); white-space: nowrap; }

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

  /* ── Portrait/narrow resize (OWNER AUDIT ROUND 2, item 2 stress proof):
     the band's OUTER background still spans the full 1280 stage-coordinate
     width (bleeding past the cropped portrait viewport's edges either
     side, same as every other LAYOUT_SPEC stage element), but the CONTENT
     row was sized for landscape and clipped its own text against the
     narrow real viewport at $1,000,000-scale wins. Below 500px (matches
     PaytableModal/MaxWinCelebration's existing breakpoint), stack the tier
     label / amount / multiplier vertically instead of side by side, and
     give each a real viewport-relative width/font-size so it fits
     comfortably centred in the visible (cropped) window regardless of the
     underlying stage width. ─────────────────────────────────────────── */
  @media (max-width: 500px) {
    .fs-face { flex-direction: column !important; align-items: center !important; gap: 4px; padding: 14px 4vw !important; }
    .c1-tier-label { font-size: 20px !important; }
    .c1-amount {
      width: 88vw; max-width: 88vw;
      font-size: calc(clamp(26px, 9vw, 46px) * var(--autofit-scale, 1)) !important;
    }
    .c1-mult { font-size: 13px !important; }
    .tier-big  .fs-face, .tier-mega .fs-face, .tier-epic .fs-face { min-height: 0; }
  }

  /* ── Reduced motion guard ─────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .c1-plate-wrap, .tier-epic .c1-plate-wrap, .c1-particle { animation: none !important; }
    .c1-particle { opacity: 0; }
    .c1-shockwave, .c1-coin, .c1-chromatic-flash { display: none; }
  }
</style>
