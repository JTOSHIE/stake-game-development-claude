<script lang="ts">
  /**
   * MaxWinCelebration.svelte - Dedicated full-screen overlay for the 5,000x wincap.
   *
   * Requires the player to explicitly click COLLECT to dismiss.
   * While visible, auto-play is already halted by App.svelte.
   * z-index 150 - above game UI (50) and PaytableModal (100), below LoadingScreen (200).
   */

  import { createEventDispatcher, onDestroy } from 'svelte'
  import { isSocial } from '../stores/socialMode'
  import { locale } from '../stores/gameStore'
  import { t, type GameMode } from '../i18n/translations'
  import { FS_MAX_WIN } from '../config/fsModes'
  import { setModalOpen, setGameBlocked } from '../stores/modalGuard'

  export let show: boolean = false

  // MAX-WIN HOLD (owner's order, 2026-07-28). This overlay is a blocking
  // surface and now says so itself, like every other one.
  //
  // It was the only blocking surface in the build that did NOT register. The
  // things that suppress themselves during the hold did it by naming `$isWincap`
  // in a hand-maintained list inside App.svelte, which is exactly the
  // arrangement modalGuard.ts was created to end: its own header records that a
  // hand-maintained list in one file cannot see private state in another and was
  // always going to drift. Registering here inverts the dependency for this
  // surface too, so anything added tomorrow that honours `anyModalOpen` honours
  // the max-win hold for free rather than by being told about it.
  //
  // NOTHING REGRESSES, checked rather than assumed: `anyModalOpen` has exactly
  // two production readers. The autoplay scheduler's fire-time re-check re-arms
  // instead of spinning, which is the wanted behaviour and is strictly safer
  // here; and the spacebar handler already returned early on `$isWincap`, so
  // this is belt and braces there and changes nothing.
  $: setModalOpen('max-win', show)
  $: setGameBlocked('max-win', show)
  onDestroy(() => { setModalOpen('max-win', false); setGameBlocked('max-win', false) })

  $: localeMode = ($isSocial ? 'social' : 'real') as GameMode

  const dispatch = createEventDispatcher<{ collect: void }>()

  // ── Particles ────────────────────────────────────────────────────────────────

  interface Particle {
    x:     number   // % left
    y:     number   // % top
    size:  number   // px
    delay: number   // s
    dur:   number   // s
    color: string
    angle: number   // deg - used for radial burst direction
  }

  const COLORS = [
    '#ffd700', '#ffec80', '#fff4c0',  // gold tones
    '#00ffff', '#80ffff',              // cyan
    '#ff00ff', '#ff88ff',              // magenta
    '#ffffff',                          // white flash
  ]

  function makeParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
      x:     10 + Math.random() * 80,
      y:     10 + Math.random() * 80,
      size:  4  + Math.random() * 10,
      delay: Math.random() * 1.6,
      dur:   1.0 + Math.random() * 1.4,
      color: COLORS[i % COLORS.length],
      angle: Math.random() * 360,
    }))
  }

  let particles: Particle[] = []
  $: if (show) particles = makeParticles(90)
  $: if (!show) particles = []

  // ── Keyboard dismiss ─────────────────────────────────────────────────────────
  function handleKey(e: KeyboardEvent): void {
    if (show && e.key === 'Enter') collect()
  }

  // FOCUS, so ENTER means exactly one thing. The overlay declares
  // `aria-modal="true"` but the stage behind it is not inert, so whatever the
  // player last focused stays focused and reachable underneath. ENTER then did
  // two things at once: this window handler collected, and the browser's own
  // default activated the focused background control in the same keystroke.
  //
  // Moving focus onto COLLECT the moment the overlay raises makes the key
  // unambiguous and puts the keyboard player on the one control the owner's
  // rule says can dismiss this. A full focus trap plus `inert` on the stage is
  // the complete answer and is NOT done here: it is an accessibility change
  // across a surface this job did not otherwise touch, and the audit method
  // already names accessibility as an unrun wave. Recorded rather than
  // half-done.
  let collectBtn: HTMLButtonElement | null = null
  $: if (show && collectBtn) collectBtn.focus()

  function collect(): void {
    dispatch('collect')
  }
</script>

<svelte:window on:keydown={handleKey} />

{#if show}
  <div class="c1-win c1-win--overdrive max-win-overlay c1-max fs-scrim" role="dialog" aria-modal="true" aria-label={t($locale, 'a11yMaxWinReached', localeMode)}>

    <!-- Rotating halo ring behind everything -->
    <div class="c1-halo halo-ring" aria-hidden="true"></div>

    <!-- Particle field -->
    <div class="c1-particle-layer" aria-hidden="true">
      {#each particles as p}
        <div
          class="c1-particle particle"
          style="
            left:{p.x}%;
            top:{p.y}%;
            width:{p.size}px;
            height:{p.size}px;
            background:{p.color};
            box-shadow:0 0 {Math.round(p.size)}px {p.color};
            animation-delay:{p.delay}s;
            animation-duration:{p.dur}s;
            --angle:{p.angle}deg;
          "
          aria-hidden="true"
        ></div>
      {/each}
    </div>

    <!-- Content -->
    <div class="c1-max-content content">

      <!-- Three drawn stars. This was `★ ★ ★`, U+2605, which the shipped
           Orbitron subset does not carry (183 codepoints, verified against
           frontend/dist/assets/orbitron-latin-400-normal-*.woff), so the crown
           on the single most photographed surface in the game rendered in
           whatever the operating system fell back to. QUALITY_CHARTER.md Q-04. -->
      <div class="c1-crown crown" aria-hidden="true">
        {#each [0, 1, 2] as i}
          <svg class="c1-crown-star" viewBox="0 0 24 24" style="--i:{i}">
            <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z" />
          </svg>
        {/each}
      </div>

      <h1 class="c1-max-headline headline">{t($locale, 'hudMaxWin', localeMode)}<br>{t($locale, 'maxWinReached', localeMode)}</h1>

      <div class="c1-max-multwrap multiplier-wrap">
        <!-- A letter `x` here while the paytable, the mode cards and the feature
             menu all write the multiplication sign `×` (U+00D7, which Orbitron
             carries). Same quantity, two glyphs, two screens: the mandate's
             "decimal or currency formats that disagree". QUALITY_CHARTER.md Q-12. -->
        <!-- R047 TASK 1 (TR-125 class): the wincap figure renders per locale
             grouping through the shared FS_MAX_WIN constant, found by the new
             template-figure scan on its first real run over the tree. -->
        <span class="c1-max-mult fs-num">{FS_MAX_WIN.toLocaleString($locale)}</span><span class="c1-max-x">×</span>
        <!-- Was `{$isSocial ? 'PLAY' : 'BET'}`. Same duplicated layer as
             FeatureMenu's: `t()` consults SOCIAL_OVERRIDES first, so this one
             call does the social swap AND the locale swap. TR-091. -->
        <span class="c1-max-betlabel">{t($locale, 'bet', localeMode)}</span>
      </div>

      <button class="c1-collect collect-btn" bind:this={collectBtn} on:click={collect} aria-label={t($locale, 'a11yCollectMaxWin', localeMode)} data-testid="max-win-collect">
        {t($locale, 'collect', localeMode)}
      </button>

      <p class="c1-hint hint" aria-live="polite">{t($locale, 'maxWinHint', localeMode)}</p>

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
  /* MAX uses the Overdrive pair as its live accents */
  .c1-win--overdrive { --acc: var(--sig-pink); --acc2: var(--sig-orange); }

  /* ── Overlay ────────────────────────────────────────────────────────────── */
  .c1-max {
    z-index: 150;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: radial-gradient(
      ellipse at center,
      rgba(20, 8, 50, 0.97) 0%,
      rgba(6, 4, 20, 0.99) 100%
    );
    /* Ease the backdrop in (the winning hit was already dwelt on beneath) so the
       celebration does not snap over the board. */
    animation: c1-fadein 0.55s ease both;
  }
  @keyframes c1-fadein { from { opacity: 0; } to { opacity: 1; } }

  /* ── Rotating halo ring ─────────────────────────────────────────────────── */
  .c1-halo {
    position: absolute;
    inset: -10%;
    border-radius: 50%;
    pointer-events: none;
    background: conic-gradient(
      from 0deg,
      transparent 0%,
      color-mix(in srgb, var(--sig-gold) 18%, transparent) 15%,
      color-mix(in srgb, var(--sig-cyan) 22%, transparent) 30%,
      color-mix(in srgb, var(--sig-pink) 18%, transparent) 45%,
      transparent 60%,
      color-mix(in srgb, var(--sig-gold) 14%, transparent) 75%,
      color-mix(in srgb, var(--sig-cyan) 18%, transparent) 90%,
      transparent 100%
    );
    animation: c1-halo-spin 6s linear infinite;
  }
  @keyframes c1-halo-spin { to { transform: rotate(360deg); } }

  /* ── Particles ──────────────────────────────────────────────────────────── */
  .c1-particle-layer { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
  .c1-particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: c1-burst 1s ease-out forwards;
  }
  @keyframes c1-burst {
    0%   { transform: scale(1.2) translate(0, 0); opacity: 1; }
    100% { transform: scale(0) translate(calc(cos(var(--angle)) * 80px), calc(sin(var(--angle)) * -120px)); opacity: 0; }
  }

  .fs-num { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }

  /* ── Content container ──────────────────────────────────────────────────── */
  .c1-max-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 0 1.5rem;
    text-align: center;
    animation: c1-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes c1-enter {
    0%   { opacity: 0; transform: scale(0.4);  }
    60%  { opacity: 1; transform: scale(1.08); }
    100% {             transform: scale(1.0);  }
  }

  /* ── Crown stars ────────────────────────────────────────────────────────── */
  .c1-crown {
    color: var(--sig-gold);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.4em;
  }
  /* Sized and glowing to match the former 22px glyph run with its 0.4em
     letter-spacing, so the composition is unchanged and only the rendering
     path is: a drawn path in the brand's own gold rather than a font glyph
     the brand face does not carry. */
  .c1-crown-star {
    width: 22px;
    height: 22px;
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--sig-gold) 80%, transparent));
  }
  .c1-crown-star path { fill: var(--sig-gold); }

  /* ── Headline ───────────────────────────────────────────────────────────── */
  .c1-max-headline {
    font-family: var(--fs-font-display);
    font-weight: 900;
    font-size: 82px;
    line-height: 0.95;
    text-transform: uppercase;
    color: #fff8e0;
    margin: 6px 0;
    text-shadow:
      0 0 4px #fff,
      0 0 18px var(--acc),
      0 0 44px color-mix(in srgb, var(--acc) 70%, transparent),
      0 0 92px color-mix(in srgb, var(--acc2) 42%, transparent);
  }

  /* ── Multiplier ─────────────────────────────────────────────────────────── */
  .c1-max-multwrap {
    display: flex;
    align-items: baseline;
    gap: 0.1em;
    margin-top: 4px;
  }
  .c1-max-mult {
    font-family: var(--fs-font-display);
    font-weight: 900;
    font-size: 96px;
    color: var(--sig-gold);
    line-height: 1;
    text-shadow: 0 0 3px #fff, 0 0 16px color-mix(in srgb, var(--sig-gold) 80%, transparent);
  }
  .c1-max-x {
    font-family: var(--fs-font-display);
    font-size: 46px;
    color: var(--sig-orange);
    align-self: flex-end;
    padding-bottom: 0.12em;
  }
  .c1-max-betlabel {
    font-family: var(--fs-font-display);
    font-size: 22px;
    letter-spacing: 0.2em;
    color: color-mix(in srgb, var(--sig-orange) 72%, transparent);
    align-self: flex-end;
    padding-bottom: 0.28em;
  }

  /* ── COLLECT button ─────────────────────────────────────────────────────── */
  .c1-collect {
    margin-top: 16px;
    padding: 14px 48px;
    font-family: var(--fs-font-display);
    font-weight: 900;
    font-size: 18px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #0a0510;
    background: linear-gradient(135deg, var(--sig-gold), var(--sig-orange) 50%, var(--sig-gold));
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow:
      0 0 24px color-mix(in srgb, var(--sig-gold) 70%, transparent),
      0 4px 0 rgba(0, 0, 0, 0.5);
    transition: box-shadow 0.1s, transform 0.08s;
  }
  .c1-collect:hover {
    box-shadow:
      0 0 34px color-mix(in srgb, var(--sig-gold) 92%, transparent),
      0 4px 0 rgba(0, 0, 0, 0.5);
  }
  .c1-collect:active { transform: translateY(2px) scale(0.97); }

  /* ── Hint text ──────────────────────────────────────────────────────────── */
  .c1-hint {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.3);
    margin: 6px 0 0;
    user-select: none;
  }

  /* ── Portrait/narrow resize (OWNER AUDIT ROUND 2, item 3): the headline +
     "5,000x" numeral were fixed desktop sizes with no narrow-viewport rule
     at all, overflowing on phone widths - scaled down to fit, same
     proportions, same 500px breakpoint PaytableModal already uses. ────── */
  @media (max-width: 500px) {
    .c1-max-headline { font-size: 42px; margin: 4px 0; }
    .c1-max-mult { font-size: 50px; }
    .c1-max-x { font-size: 24px; }
    .c1-max-betlabel { font-size: 13px; }
    .c1-collect { padding: 12px 36px; font-size: 15px; }
  }

  /* ── Reduced motion guard ─────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .c1-max, .c1-halo, .c1-max-content, .c1-particle { animation: none !important; }
    .c1-particle { opacity: 0; }
  }
</style>
