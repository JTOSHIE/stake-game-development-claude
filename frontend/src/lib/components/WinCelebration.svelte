<script lang="ts">
  /**
   * WinCelebration.svelte — Tiered win celebration overlays for Future Spinner
   *
   * Tiers (based on winMultiplier = totalWin / betAmount):
   *   small  1x –   4.9x  Brief 1s gold text flash. pointer-events: none.
   *   big    5x –  19.9x  Dark overlay, gold particles. Auto-hides after 3s or on click.
   *   mega  20x –  99.9x  Full overlay, magenta/purple. Auto-hides after 5s or on click.
   *   huge 100x+          Full overlay, cyan+magenta burst. Click to dismiss only.
   *
   * Particles are pure CSS animations — no external library.
   */

  import { onDestroy } from 'svelte'
  import { locale } from '../stores/gameStore'
  import { t } from '../i18n/translations'

  export let winMultiplier: number = 0

  // ── Types ────────────────────────────────────────────────────────────────────

  type Tier = 'small' | 'big' | 'mega' | 'huge'

  interface Particle {
    x:     number   // % from left edge of overlay
    y:     number   // % from top edge of overlay
    size:  number   // diameter in px
    delay: number   // animation-delay in seconds
    dur:   number   // animation-duration in seconds
    color: string   // CSS colour value
  }

  // ── State ────────────────────────────────────────────────────────────────────

  let visible:    boolean           = false
  let activeTier: Tier | null       = null
  let timer:      ReturnType<typeof setTimeout> | null = null
  let particles:  Particle[]        = []

  // ── Per-tier configuration ────────────────────────────────────────────────

  const COLORS: Record<Tier, string[]> = {
    small: [],
    big:   ['#ffd700', '#ffaa00', '#fff4a0', '#ffc832'],
    mega:  ['#ff00ff', '#cc00ff', '#ff88ff', '#ffd700', '#ff44cc'],
    huge:  ['#00ffff', '#ff00ff', '#ffd700', '#ffffff', '#00aaff', '#ff88ff'],
  }

  const COUNTS: Record<Tier, number> = {
    small: 0,
    big:   22,
    mega:  40,
    huge:  64,
  }

  // Duration range [base, base + spread] per tier — longer for more dramatic tiers
  const DUR_BASE:   Record<Tier, number> = { small: 0,   big: 0.8, mega: 1.0, huge: 1.2 }
  const DUR_SPREAD: Record<Tier, number> = { small: 0,   big: 0.7, mega: 0.9, huge: 1.2 }

  // ── Particle factory ──────────────────────────────────────────────────────

  function makeParts(tier: Tier): Particle[] {
    const colors = COLORS[tier]
    const count  = COUNTS[tier]
    return Array.from({ length: count }, (_, i) => ({
      x:     5  + Math.random() * 90,
      y:     5  + Math.random() * 85,
      size:  5  + Math.random() * 11,
      delay: Math.random() * 1.4,
      dur:   DUR_BASE[tier] + Math.random() * DUR_SPREAD[tier],
      color: colors[i % colors.length],
    }))
  }

  // ── Lifecycle helpers ─────────────────────────────────────────────────────

  function clearTimer(): void {
    if (timer !== null) { clearTimeout(timer); timer = null }
  }

  function dismiss(): void {
    clearTimer()
    visible    = false
    activeTier = null
    particles  = []
  }

  function show(tier: Tier, autoMs: number | null): void {
    clearTimer()
    activeTier = tier
    particles  = COUNTS[tier] > 0 ? makeParts(tier) : []
    visible    = true
    if (autoMs !== null) timer = setTimeout(dismiss, autoMs)
  }

  // ── Reactive: re-evaluate on every winMultiplier change ──────────────────
  // The $: block only depends on winMultiplier — dismiss() does not create a loop
  // because it only mutates local vars (visible, activeTier, etc.) which are not
  // read inside this block.

  $: {
    if      (winMultiplier >= 100) show('huge',  null)
    else if (winMultiplier >= 20)  show('mega',  5000)
    else if (winMultiplier >= 5)   show('big',   3000)
    else if (winMultiplier >= 1)   show('small', 1000)
    else                           dismiss()
  }

  onDestroy(clearTimer)

  // ── Keyboard dismiss ──────────────────────────────────────────────────────

  function handleKey(e: KeyboardEvent): void {
    if (activeTier !== 'small' && (e.key === 'Enter' || e.key === ' ')) dismiss()
  }
</script>

{#if visible && activeTier !== null}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="win-celebration tier-{activeTier}"
    role={activeTier !== 'small' ? 'button' : undefined}
    tabindex={activeTier !== 'small' ? 0 : undefined}
    aria-label={activeTier !== 'small' ? 'Dismiss win celebration' : undefined}
    on:click={() => { if (activeTier !== 'small') dismiss() }}
    on:keydown={handleKey}
  >

    <!-- ── CSS Particles (big / mega / huge only) ─────────────────────── -->
    {#each particles as p}
      <div
        class="particle"
        style="left:{p.x}%;top:{p.y}%;width:{p.size}px;height:{p.size}px;background:{p.color};animation-delay:{p.delay}s;animation-duration:{p.dur}s;box-shadow:0 0 {Math.round(p.size * 0.8)}px {p.color};"
      ></div>
    {/each}

    <!-- ── Win text ───────────────────────────────────────────────────── -->
    <div class="win-text-wrap">
      {#if activeTier === 'small'}
        <span class="win-text small-text">{t($locale, 'win')}!</span>
      {:else if activeTier === 'big'}
        <span class="win-text big-text">{t($locale, 'bigWin')}</span>
      {:else if activeTier === 'mega'}
        <span class="win-text mega-text">{t($locale, 'megaWin')}</span>
      {:else}
        <span class="win-text huge-text">{t($locale, 'hugeWin')}</span>
      {/if}
    </div>

    <!-- ── Dismiss hint (not on auto-hiding small flash) ─────────────── -->
    {#if activeTier !== 'small'}
      <div class="dismiss-hint">{t($locale, 'close')}</div>
    {/if}

  </div>
{/if}

<style>
  /* ── Base overlay ──────────────────────────────────────────────────────── */
  .win-celebration {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* Small tier: transparent, non-interactive so game remains playable */
    pointer-events: none;
  }

  /* Non-small tiers block interaction and invite a click to dismiss */
  .win-celebration:not(.tier-small) {
    pointer-events: auto;
    cursor: pointer;
  }

  /* ── Tier backgrounds ─────────────────────────────────────────────────── */
  .tier-big {
    background: rgba(0, 0, 0, 0.72);
  }

  .tier-mega {
    background: radial-gradient(
      ellipse at center,
      rgba(90, 0, 90, 0.92) 0%,
      rgba(18, 0, 42, 0.97) 100%
    );
  }

  .tier-huge {
    background: radial-gradient(
      ellipse at center,
      rgba(0, 28, 80, 0.93) 0%,
      rgba(28, 0, 70, 0.97) 100%
    );
  }

  /* ── Particles ─────────────────────────────────────────────────────────── */
  .particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    /* Default rise animation; duration/delay overridden by inline style */
    animation: particle-rise 1s ease-out forwards;
  }

  /* Huge tier: more explosive burst movement */
  .tier-huge .particle {
    animation-name: particle-burst;
  }

  @keyframes particle-rise {
    0%   { transform: translateY(0)     scale(1);   opacity: 1;   }
    60%  {                                           opacity: 0.8; }
    100% { transform: translateY(-110px) scale(0);  opacity: 0;   }
  }

  @keyframes particle-burst {
    0%   { transform: scale(1.5)  translateY(0);     opacity: 1;   }
    25%  { transform: scale(2.5)  translateY(-20px); opacity: 0.9; }
    100% { transform: scale(0)    translateY(-145px); opacity: 0;  }
  }

  /* ── Win text container ────────────────────────────────────────────────── */
  .win-text-wrap {
    position: relative;
    z-index: 2;
    text-align: center;
    user-select: none;
    padding: 0 1rem;
  }

  /* ── Shared text base ──────────────────────────────────────────────────── */
  .win-text {
    display: block;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    /* Impact gives that punchy slot-machine punch; fall back to heavy system fonts */
    font-family: Impact, 'Arial Black', 'Segoe UI Black', system-ui, sans-serif;
    line-height: 1;
  }

  /* ── Small: non-blocking upward flash ─────────────────────────────────── */
  .small-text {
    font-size: clamp(2rem, 6vw, 3.5rem);
    color: #ffd700;
    text-shadow:
      0 0  8px #fff8c0,
      0 0 18px rgba(255, 215, 0, 1),
      0 0 35px rgba(255, 200, 0, 0.85),
      0 0 60px rgba(255, 160, 0, 0.5);
    animation: flash-small 0.95s ease-out forwards;
  }

  @keyframes flash-small {
    0%   { opacity: 0; transform: scale(0.5)  translateY(0);    }
    25%  { opacity: 1; transform: scale(1.15) translateY(-12px); }
    65%  { opacity: 1; transform: scale(1.0)  translateY(-20px); }
    100% { opacity: 0; transform: scale(0.8)  translateY(-34px); }
  }

  /* ── Big Win: deep gold neon glow ──────────────────────────────────────── */
  .big-text {
    font-size: clamp(2.8rem, 9vw, 5.5rem);
    color: #ffe566;
    text-shadow:
      0 0  4px #fff8d0,
      0 0 12px #ffd700,
      0 0 28px rgba(255, 200, 0, 1),
      0 0 55px rgba(255, 160, 0, 0.85),
      0 0 90px rgba(255, 100, 0, 0.55),
      0 4px 0   rgba(0, 0, 0, 0.7);
    animation: bounce-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  /* ── Mega Win: magenta/purple neon flare ──────────────────────────────── */
  .mega-text {
    font-size: clamp(3.2rem, 11vw, 7rem);
    color: #ff88ff;
    text-shadow:
      0 0  4px #fff0ff,
      0 0 12px #ff44ff,
      0 0 28px rgba(255, 0, 255, 1),
      0 0 55px rgba(200, 0, 255, 0.85),
      0 0 90px rgba(140, 0, 200, 0.6),
      0 4px 0   rgba(0, 0, 0, 0.7);
    animation: bounce-in 0.60s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  /* ── Huge Win: cyan → magenta → gold gradient, larger scale ───────────── */
  .huge-text {
    font-size: clamp(3.5rem, 13vw, 9rem);
    background: linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #ffd700 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    /* Multiple drop-shadows build the composite neon corona */
    filter:
      drop-shadow(0 0  4px rgba(255, 255, 255, 0.9))
      drop-shadow(0 0 14px rgba(0,   255, 255, 1))
      drop-shadow(0 0 30px rgba(0,   200, 255, 0.9))
      drop-shadow(0 0 55px rgba(255,   0, 255, 0.75))
      drop-shadow(0 0 90px rgba(180,   0, 220, 0.5))
      drop-shadow(0  4px 0   rgba(0,   0,   0, 0.75));
    animation: scale-huge 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes bounce-in {
    0%   { opacity: 0; transform: scale(0.2);  }
    55%  { opacity: 1; transform: scale(1.2);  }
    75%  {             transform: scale(0.92); }
    100% {             transform: scale(1.0);  }
  }

  @keyframes scale-huge {
    0%   { opacity: 0; transform: scale(0.05); }
    50%  { opacity: 1; transform: scale(1.3);  }
    70%  {             transform: scale(0.88); }
    88%  {             transform: scale(1.06); }
    100% {             transform: scale(1.0);  }
  }

  /* ── Dismiss hint ──────────────────────────────────────────────────────── */
  .dismiss-hint {
    margin-top: 2rem;
    font-size: 0.78rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.42);
    /* Fade in after the text animation completes */
    animation: hint-fadein 1s 0.7s ease both;
    user-select: none;
  }

  @keyframes hint-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
</style>
