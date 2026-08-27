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
  import { formatBalance, formatBalanceCompact, CURRENCY_SCALE, formatWin, winFractionDigits } from '../utils/currency'
  import { isSocial } from '../stores/socialMode'
  import { boughtRound } from '../stores/boughtRound'
  import { locale } from '../stores/gameStore'
  import { t } from '../i18n/translations'
  // The single social-aware vocabulary layer (R2R JOB 6 / TR-041).
  import { sv } from '../i18n/vocabulary'
  import { overdriveVisual } from '../stores/overdriveVisual'
  import { themeAssets } from '../stores/themeStore'
  import { autofitText } from '../actions/autofitText'
  // MID-01: the ONE win count-up clock and the ONE duration rule, shared with
  // HudOverlay.svelte. The thresholds and TIER_COUNT_UP_MS were declared here
  // and are now imported, so there is exactly one declaration of each.
  import {
    BIG_WIN_THRESHOLD, MEGA_WIN_THRESHOLD, EPIC_WIN_THRESHOLD,
    TIER_COUNT_UP_MS, createWinCountUp, sharedWinCountUp,
    type WinTier,
  } from '../stores/winCountUp'

  type Tier = WinTier

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
  // R133. This READ the query once and never listened, so a player who changed the setting
  // mid-session got a stale flag: turning reduced motion OFF permanently lost the shockwave, the
  // sixteen-coin fountain and the epic chromatic flash for the rest of the session, because those
  // three are behind {#if !reduced} and never re-entered the DOM. Turning it ON left the flag false
  // so they DID render, and only the CSS block below caught them. Measured both directions.
  onMount(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced = mq.matches
    const onChange = (e: MediaQueryListEvent) => { reduced = e.matches }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  })

  const TIER_COLORS: Record<Tier, string[]> = {
    big:  ['#00ffff', '#80ffff', '#ffffff'],
    mega: ['#ff00ff', '#ff88ff', '#ffd700', '#ffffff'],
    epic: ['#ffd700', '#ffec80', '#00ffff', '#ff00ff', '#ffffff'],
  }
  const TIER_PARTICLE_COUNT: Record<Tier, number> = { big: 14, mega: 28, epic: 48 }

  let visible = false
  let tier: Tier = 'big'
  let particles: Particle[] = []
  let coins: Coin[] = []
  let dismissTimer: ReturnType<typeof setTimeout> | null = null
  let lastShownWin = 0

  // MID-01. The reactive (base-game) path READS the shared count-up, which the
  // HUD WIN pod also reads, so the two cannot show different dollar amounts on
  // any frame. The explicit-trigger path animates a DIFFERENT figure by design
  // (FreeSpinsPresentation's own settled feature total, while `$winAmount` is
  // still deliberately un-settled), so it gets its own instance from the same
  // factory: one clock implementation and one duration rule, two values only
  // where two values are the point.
  const ownCountUp = createWinCountUp()
  $: displayAmount = amount === null ? $sharedWinCountUp : $ownCountUp
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

    tier = t
    shownMultiplier = mult
    visible = true
    particles = makeParticles(TIER_PARTICLE_COUNT[t], TIER_COLORS[t])
    coins = t === 'epic' && !reduced ? makeCoins() : []

    // MID-01. Staged count-up, duration escalating with tier, now from the ONE
    // rule in `stores/winCountUp.ts` rather than a constant table declared here.
    //
    // On the REACTIVE path the shared instance is already counting: the store
    // module drives it from `$winAmount`, so this banner and the HUD WIN pod are
    // reading the same number, and starting a second tween here is exactly the
    // defect being removed. Only the explicit-trigger path owns a clock, because
    // only it is animating a figure the HUD is not showing.
    //
    // The tier, not the multiplier, sets the length here: the explicit path
    // floors at 'big' for any feature outcome, so a 3x feature-end banner still
    // runs the full 1400ms rather than the 424ms its multiplier would imply.
    // On the reactive path the tier and the multiplier agree by construction,
    // because both derive from the same three thresholds.
    const explicitTrigger = amount !== null
    if (explicitTrigger) {
      ownCountUp.snap(0)
      ownCountUp.to(winDollars, mult, TIER_COUNT_UP_MS[t])
    }

    dismissTimer = setTimeout(() => {
      visible = false
      particles = []
      coins = []
      // Zero this instance's OWN figure only. The shared value belongs to the
      // HUD too, and the WIN pod must keep showing the win after the
      // celebration dismisses.
      if (explicitTrigger) ownCountUp.snap(0)
      dispatch('dismissed')
    }, TIER_COUNT_UP_MS[t] + 2200)
  }

  onDestroy(() => {
    if (dismissTimer) clearTimeout(dismissTimer)
    ownCountUp.cancel()
  })

  // JOB 2, 2026-07-28. Was three hardcoded English pairs in a component-script
  // ternary, which reviewer 3 cited at WinBanner.svelte:195-207 and which the
  // Arabic live frame 085921_frame.png shows rendering "BIG WIN" over an Arabic
  // HUD. The social swap now comes from the same table as the locale swap, so
  // the most prominent surface in the game is keyed like everything else.
  $: tierLabel = t($locale, tier === 'epic' ? 'tierEpicWin' : tier === 'mega' ? 'tierMegaWin' : 'tierBigWin', $isSocial ? 'social' : 'real')
  // Pinned from the settled target (`amount` when this banner owns its count-up,
  // otherwise the shared $winAmount), never from the eased frame. See HudOverlay.
  $: settledAmount = amount === null ? $winAmount : amount
  $: amountDigits = winFractionDigits(Math.round(settledAmount * CURRENCY_SCALE), $currencyCode || 'USD')
  // R060 COMPACT TIER (Fable ruling): when even the fit floor cannot hold the
  // full string in the box this mount actually got (the replay grid gives the
  // band 616px where the live stage gives 1280, and the owner's captures
  // showed the amount cut to leading digits there), the label switches to the
  // popout's compact formatter with the marker intact, never a double-clipped
  // fragment. The action reports the condition via the fitoverflow event; the
  // switch is keyed on the SETTLED value so a mid-count frame cannot flap it.
  let amountCompact = false
  $: settledAmount, amountCompact = false // a new round retries the full form
  $: amountLabel = amountCompact
    ? formatBalanceCompact(Math.round(displayAmount * CURRENCY_SCALE), $currencyCode || 'USD', $locale)
    : formatWin(Math.round(displayAmount * CURRENCY_SCALE), $currencyCode || 'USD', $locale, null, amountDigits)
  function onFitOverflow(e: CustomEvent<{ overflowing: boolean }>): void {
    if (e.detail.overflowing && !amountCompact) amountCompact = true
  }
  // TR-117 glyph half / ledger MID-02, 2026-07-29. This was an ASCII letter `x`
  // (U+0078) on 60 of the 519 stream-test frames, while the paytable, the mode
  // cards, the feature menu and MaxWinCelebration all write the multiplication
  // sign. Charter Q-26 exists to record that the Q-12 glyph sweep was
  // incomplete and enumerates four survivors, all in `fsModes.ts`; this was a
  // fifth, in a component, which is why a config-and-prose search missed it.
  $: multLabel = `${Math.round(shownMultiplier)}×`
  // R2R JOB 6 / TR-041 gave this line its social swap. TR-117 locale half /
  // TR-104, 2026-07-29, gives it the LOCALE swap it never had: `sv()` swapped
  // BET for PLAY and left every one of the sixteen locales reading English, so
  // frames 430 and 482 show a correctly localised `GROSSER GEWINN` and
  // `فوز كبير` beside an English `16x BET`. `t()` consults SOCIAL_OVERRIDES
  // first, so this one call does the social swap AND the locale swap, exactly
  // as MaxWinCelebration.svelte:159 already does for the same word under
  // TR-091. The `bet` key already existed in all sixteen locales in the
  // ALL-CAPS shape, so no new key and no translation work was needed.
  $: multUnitLabel = t($locale, 'bet', $isSocial ? 'social' : 'real')

  // ── FEATURE PRICE, JOB 3(f) / TR-068 ───────────────────────────────────────
  //
  // Fable's ruling, option (a) refined: the gross WIN readout above is
  // RETAINED and the headline multiplier stays against the BET LEVEL, both
  // because they are the genre convention and a reviewer expecting them would
  // read a net figure as wrong. This SECONDARY line is the whole change: on a
  // bought round only, the banner states what the round cost beside what it
  // paid, so a $57,215 "win" on a $200,000 purchase reads as what it is.
  //
  // Base rounds are untouched: `$boughtRound` is null for every ordinary spin,
  // so nothing renders and nothing shifts.
  //
  // The price comes from `spinCostMicros`, the same function `BuyBonus.svelte`
  // prices the confirm dialog from, so the figure here and the figure the
  // player agreed to cannot disagree. It is passed as micros and formatted
  // once, here, rather than carried as a formatted string.
  //
  // Routed through `sv()` as the ruling requires. Nothing in "FEATURE PRICE" is
  // on the platform's restricted table today, so this is a no-op in social mode
  // right now; it is wired anyway because the table is the platform's to change
  // and a label that is not routed is a label nobody will remember to route.
  $: featurePriceLabel = $boughtRound
    ? sv(t($locale, 'featurePrice', $isSocial ? 'social' : 'real'), $isSocial)
    : ''
  $: featurePriceValue = $boughtRound
    ? formatBalance($boughtRound.priceMicros, $currencyCode || 'USD', $locale)
    : ''
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
      <!-- R113. Painted tier energy behind the band. First in DOM at z-index 0,
           so it paints under .fs-plate (z-index auto) while the shockwave at
           z-index 1 still bursts over the top. Kept under reduced motion as a
           still image: it is art, not movement, and removing it would strip the
           tier identity rather than calm it. -->
      <img
        class="c1-tier-burst"
        src="{$themeAssets.assetBase}/ui/win/{tier === 'big' ? 'burst_big' : tier === 'mega' ? 'bloom_mega' : 'burst_epic'}.png"
        alt=""
        aria-hidden="true"
        data-testid="win-tier-burst"
      />
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
          <!-- TR-089. Each DIGIT gets a fixed-width box so the count-up cannot
               shimmy as it rolls. It needs one because `font-variant-numeric:
               tabular-nums` on .fs-num is INERT against Orbitron: that property
               maps to the OpenType `tnum` feature and Orbitron ships no GSUB
               features at all. Measured on the shipped woff, the digit advances
               are 834 391 830 826 730 830 820 660 834 828 of 1000, so `1` is
               less than half the width of `0` and a rolling total visibly
               danced. Non-digits keep their natural width: only the digits need
               to be monospaced, and boxing the currency symbol and separators
               too would space them oddly. -->
          <div class="c1-amount fs-num" use:autofitText={amountLabel} data-money="cur" data-testid="win-amount" on:fitoverflow={onFitOverflow}>
            {amountLabel}
          </div>
          <div class="c1-mult fs-num">{multLabel} {multUnitLabel}</div>
          {#if $boughtRound}
            <div class="c1-price fs-num" data-testid="win-feature-price">
              <span class="c1-price-label">{featurePriceLabel}</span>
              <span class="c1-price-value">{featurePriceValue}</span>
            </div>
          {/if}
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
  /* R133: --tint joins --sig here. The face tint was a flat 18% at every tier, and at MEGA that
     produced a band DARKER THAN THE REELS IT COVERED: measured mean luminance 35.7 for the band
     against 37.7 for the strip of game behind it, so the celebration made that part of the screen
     dimmer than the spin it was celebrating. Big was 47.5 against 41.3 and epic 46.6 against 36.2,
     both correctly brighter. Mega is lifted, and the ladder now rises across all three. */
  .tier-big  .fs-plate { --sig: var(--sig-cyan); --tint: 20%; --pulse: 1.010; }
  .tier-mega .fs-plate { --sig: var(--sig-pink); --tint: 32%; --pulse: 1.014; }
  .tier-epic .fs-plate { --sig: var(--sig-gold); --tint: 26%; --pulse: 1.020; }
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
  /* R133: THE SIX-STOP CHROME GRADIENT THAT USED TO SIT HERE WAS DEAD PAINT AND IS GONE.
     It was 100% occluded by its own coincident child .fs-face: forcing magenta on this element
     changed 0 of 212,480 measured pixels, while forcing it on .fs-face changed 94.29%. So the
     "plate" supplied no material, no bevel and no highlight, because none of it was ever visible.
     It is DELETED rather than REVEALED, and that is the opposite of the obvious repair: rendered
     at the size it is actually drawn, with the face lifted off, the gradient is a milky grey
     plastic sheet with one diagonal sweep, and it destroys the amount's contrast. The material
     now lives on .fs-face, where it can be seen. */
  .fs-plate {
    position: relative; --sig: var(--sig-cyan); width: 100%;
    background: none;
    /* R133: THE BAND NOW HAS ENDS. It was the only element in the game drawing a full-width
       straight rule (strongest horizontal luminance seam 64.7 / 59.8 / 71.3 against 29.2 for the
       untouched game and 27.2 for MaxWinCelebration), and it had no left or right edge at all:
       the horizontal gradient across the outer 40px was 1.8 to 2.8 per pixel against 47.8 to 70.1
       vertically at the rules, a 20x to 37x asymmetry. Two hard edges saying STRIP and none saying
       OBJECT is the grammar of a cookie bar.
       A MASK CLIPS EVERYTHING THE MASKED ELEMENT PAINTS OUTSIDE ITS BORDER BOX, and that is the
       whole difficulty. Measured with a 40px solid probe ring outside this box: 46,080px unmasked,
       12px with a plain mask, 45,573px with border-radius instead.
       MY FIRST ATTEMPT AT THIS WAS WRONG AND THE RECORD SHOULD SAY SO. It kept the glow on this
       element and reached for `mask-clip: no-clip`, which works in Chromium and Firefox. In
       WebKit, Safari's engine, `no-clip` PARSES, CSS.supports reports it, the computed value reads
       back `no-clip`, and the glow is clipped anyway: deleting the epic tier's entire 46/95/130px
       halo changed ZERO pixels of a WebKit frame. Every feature detection a developer would reach
       for said it was working. `-webkit-mask-clip: no-clip` is not even valid syntax in Chromium or
       WebKit, so the compatibility belt beside it was dead text.
       THE STRUCTURAL FIX INSTEAD OF THE CLEVER ONE: nothing that has to paint outside this box
       lives on this element any more. The tier glow moves up to .c1-plate-wrap, which is the same
       rect and is NOT masked, so it survives in every engine with no feature reliance at all. This
       element keeps only the mask, and the mask now only has to do what a mask is good at.
       The full-opacity plateau starts at 72px, which clears both the centred burst and the tier
       label: at epic the label's own ink begins at x=97, and an earlier 132px plateau put it
       INSIDE the ramp and faded live text onto the moving game behind it. */
    -webkit-mask-image: var(--band-fade);
    mask-image: var(--band-fade);
  }
  .c1-win {
    /* R133, CORRECTED: the plateau starts at 72px, not 132px. My first version checked that the
       plateau cleared the centred BURST and never checked the TEXT. At epic the tier label's ink
       begins at x=97, which sat inside a 132px ramp at a measured mask alpha of 0.847, so live
       text was being faded onto the moving game behind it and "EPIC WIN" fell to 3.96:1. */
    --band-fade: linear-gradient(90deg, transparent 0, rgba(0,0,0,.30) 14px, #000 72px,
                                 #000 calc(100% - 72px), rgba(0,0,0,.30) calc(100% - 14px), transparent 100%);
  }
  /* R133: THE FACE IS A SCRIM NOW, NOT A SLAB, AND THAT IS THE HEADLINE FIX.
     This gradient was OPAQUE, and .c1-tier-burst sat at z-index 0 underneath it, so the band
     covered the celebration's own art: burst_big contributed ZERO of 86,400 pixels inside the BIG
     band against a 99.937% positive control, 60.88% of bloom_mega's energy was behind the plate,
     and 50.75% of burst_epic's luminous energy was thrown away INCLUDING ITS BRIGHTEST ROW. The
     art erupted above and below the strip and put nothing inside it. Rendered, that is a censor
     bar across a firework, and it is why the band read as a label pasted over a picture.
     The alpha is carried on the DARK layer only, so the tier tint above it is undiluted, and the
     scrim is still dark enough to hold the amount: contrast is re-measured per tier in the report.
     THE SECOND HALF OF THE FIX IS THE STACK, made explicit below rather than left to DOM order.
     The burst goes UNDER the plate and the plate goes over it, so the art reads THROUGH the band
     while the text still paints on top of the art. Masking a hole in the burst was the other
     candidate and was rejected: the burst is centred, so a centred hole discards precisely its
     brightest core. */
  .fs-plate > .fs-face {
    position: relative; display: flex; flex-direction: row; align-items: baseline; justify-content: center;
    width: 100%; box-sizing: border-box;
    /* R133 colour-mix fallback, plain declaration first: an engine without color-mix keeps a real
       scrim instead of losing the band entirely. */
    background: linear-gradient(180deg, rgba(17,26,43,.80), rgba(7,11,22,.90));
    background:
      linear-gradient(160deg, color-mix(in srgb, var(--sig) var(--tint, 18%), transparent), transparent 44%),
      linear-gradient(180deg, rgba(17,26,43,.80), rgba(7,11,22,.90));
    /* R133: a real bevel, on the element that can actually be seen. The top hairline was .07 and
       there was no bottom edge at all, which is why the band had no thickness. */
    box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -1px 0 rgba(0,0,0,.9), inset 0 -8px 18px rgba(0,0,0,.55);
  }
  /* R133 EXPLICIT PAINT ORDER for the banner's layers. Every one of these carried a z-index
     already except .fs-plate, which relied on DOM order, and that omission is what put the tier
     art behind the band. Written out so the next change to this file cannot re-create it. */
  .fs-plate { z-index: 2; }
  /* Layered glow borders: a bright hairline plus a soft blurred halo on
     each edge of the band, so it reads as a lit neon tube top and bottom. */
  /* R133. Two changes, both measured.
     A WHITE-HOT CORE, because a real neon tube has one and because it is how you equalise
     PERCEIVED brightness across hues. The three tier rules measured 200.8 (cyan), 101.3 (pink) and
     208.0 (gold): the middle rung of a three-rung ladder was half the brightness of the rung below
     it, purely because magenta is intrinsically darker than cyan and gold. The core fixes that
     without touching tier identity, since the halo either side stays the tier's own colour.
     AND THE RULE NOW FADES WITH THE OBJECT. The glow moves from box-shadow to drop-shadow because
     the two follow different things: box-shadow follows the BORDER BOX, so it stayed a full-width
     bar however the band was masked, while drop-shadow follows the rendered ALPHA, so a rule whose
     background fades at the ends gets a glow that fades with it. Belt and braces with the plate's
     own mask above: if `mask-clip: no-clip` ever degrades to border-box on another engine, the
     rule and its halo still resolve at the ends and only the plate's tier glow is lost.
     Measured at the far end, x0-10: 182.45 before, 27.38 after, against an unchanged 181 at centre. */
  .band-edge {
    position: absolute; left: 0; right: 0; height: 3px; z-index: 2;
    /* R133 colour-mix fallback: the plain declaration FIRST, the color-mix one immediately after.
       A declaration is all-or-nothing, so an engine without color-mix keeps the first and still
       gets a lit rule. My first version folded the color-mix into the only declaration, and on
       such an engine the band AND both rules vanished, where HEAD had only lost its glows. */
    background: linear-gradient(180deg, #fff, var(--sig) 60%);
    background: linear-gradient(180deg, #fff, color-mix(in srgb, var(--sig) 88%, #fff) 55%, var(--sig));
    /* R133: THE GLOW GOES BACK TO box-shadow AND THIS ELEMENT IS NO LONGER MASKED ITSELF.
       My first version gave it mask-image plus filter: drop-shadow, and the mask's default
       mask-clip: border-box clipped the filter output to this element's own 3px box. Measured in
       Chromium, WebKit and Firefox: removing the glow entirely changed ZERO pixels outside the
       band, and so did replacing it with a 40px pure-white drop-shadow AND a 40px pure-white
       box-shadow. At HEAD the same glow was worth 68,709 to 69,416 pixels. So the first version
       deleted a real, large halo and replaced it with nothing, while the comment beside it claimed
       the halo still resolved. It inherits the fade from its masked .fs-plate parent instead, which
       is what makes the rule taper without this element needing a mask of its own. */
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
  /* R133: these three moved to .c1-plate-wrap, which is unmasked. Kept as this note rather than
     deleted silently, because the ladder is load-bearing and a reader looking for it here should
     be told where it went and why. */

  /* R131: THE WORD THAT NAMES THE TIER NOW CARRIES THE TIER'S COLOUR.
     This read `var(--acc)`, the banner's fixed house accent, which is cyan and does
     not vary. Everything around it already varies: .band-edge, the .fs-plate glow and
     the .fs-face inner tint all use `--sig`, set per tier to cyan / pink / gold. So
     the label was the one element out of step, and it was the one element whose JOB
     is to say which tier this is - "MEGA WIN" rendered cyan inside magenta rules, and
     "EPIC WIN" cyan inside gold ones. `--sig` is set on .fs-plate and this element is
     inside it, so the token is already in scope and this is a swap, not new plumbing.
     Contrast was re-measured on the composited pixels after the change; the figures
     are in the R131 section of the session report. */
  /* R133: THE TIER LABEL IS THE ELEMENT THAT BROKE, AND ONLY THE AMOUNT HAD BEEN CHECKED.
     Against the new translucent scrim "MEGA WIN" measured 3.53:1 and "EPIC WIN" 3.96:1, both under
     the 4.5:1 working bar, where at HEAD they were 5.26 and 10.89. The amount was fine at
     8.02-9.41 and it was the only thing measured, which is exactly the shape of mistake this
     project keeps recording: the surface that was checked passed, and it was not the surface at
     risk. The label is smaller, thinner, and the one piece of text coloured --sig, which varies.
     The arithmetic says why it was always the vulnerable one: #FF2EC4 has relative luminance
     0.272, so it clears 4.5:1 only while the backdrop stays under 0.0216, a flat sRGB grey of 40,
     and a translucent scrim over a live moving game cannot promise that.
     The existing shadow was a pure GLOW, which brightens the surround and works against contrast.
     A dark contact shadow goes UNDER it, so the glyph carries its own dark backing wherever it
     lands, and the tier glow is kept for the look. */
  .c1-tier-label {
    font-family: var(--fs-font-display); font-weight: 900; letter-spacing: .18em;
    text-transform: uppercase; white-space: nowrap;
    /* R133: THE LABEL IS LIFTED 20% TOWARD WHITE, AND THAT REVISES AN R131 DECISION, SO HERE IS WHY.
       R131 gave this element `color: var(--sig)` deliberately, so the word naming the tier carries
       the tier's own colour, and that reasoning still stands: the hue is unchanged and #FF58D0
       still reads as the mega magenta beside magenta rules.
       What changed underneath it is the backdrop. Against R133's translucent scrim the pure token
       measured 4.11:1 at mega, under the 4.5:1 working bar, with 112 full-coverage pixels failing.
       The arithmetic says it is mega specifically and it says why: #FF2EC4 has relative luminance
       0.2720, so it needs the backdrop under 0.0216 to clear 4.5:1, and the measured backdrop is
       0.0283. Cyan and gold sit far higher and were never at risk (11.56 and 6.97 measured).
       Lifting the colour was chosen over darkening the scrim because darkening the scrim undoes the
       very thing this pass exists to do, which is let the tier art read through the band. Measured
       after the lift: mega 4.82, big 11.66, epic 7.38.
       The plain declaration comes first so an engine without color-mix keeps a lit label. */
    color: var(--sig);
    color: color-mix(in srgb, var(--sig) 80%, #fff);
    /* A DARK CONTACT SHADOW UNDER THE TIER GLOW. The shadow here used to be glow only, which
       brightens the surround and works against legibility; the dark pair goes underneath so the
       glyph carries its own backing wherever the scrim lets the game through. */
    text-shadow: 0 1px 2px rgba(0,0,0,.98), 0 0 5px rgba(0,0,0,.92), 0 0 14px color-mix(in srgb, var(--sig) 70%, transparent);
  }
  .tier-big  .c1-tier-label { font-size: 22px; }
  .tier-mega .c1-tier-label { font-size: 28px; }
  .tier-epic .c1-tier-label { font-size: 36px; }

  /* B1 sharp numeral: near-white fill, tight 3px halo, no wide double glow.
     OWNER AUDIT REMEDIATION B2: font-size scales down via the autofitText
     action's --autofit-scale so seven-digit wins ($1,000,000+) fit the
     band instead of overflowing/truncating. Fixed max-width (not 100% of a
     flex row) since the band now lays tier/amount/mult out horizontally. */
  /* R131: THE FACE IS --fs-font-numeric, AND UNTIL NOW IT WAS NOT. See the block
     below, which retired the per-digit boxes on the premise that this had already
     happened. It had not: this rule still said var(--fs-font-display), which IS
     Orbitron, the face that block names as the reason the boxes were needed. So the
     compensation was removed and the condition it compensated for was left in place.

     MEASURED BEFORE THE SWAP, at a FIXED digit count, so none of it is the number
     legitimately getting longer:
         big  4 digits  glyph width swing  35.84px   left edge slid  17.92px
         mega 4 digits                     89.05px                   43.60px
         epic 5 digits                    108.70px                   54.29px
     The amount visibly slid left and right through every count-up.

     AND THE GATE THAT EXISTS TO CATCH THIS COULD NOT SEE IT. win_countup_steady_gate
     builds its OWN probe element rather than reading this one, and that probe asks
     for the NUMERIC token while its deliberately-failing seed asks for the DISPLAY
     token. So it proved Exo 2 is steady and Orbitron is not, and passed - while the
     element it speaks for rendered in Orbitron. Its own header claims it measures
     "the face the money surfaces actually render in"; for this surface that was
     false. A gate that reconstructs the thing it guards can be green over a live
     defect, which is a failure this project has now recorded more than once.
     (The two tokens are named in words rather than written out above, because
     machine_tell_gate reads a token name following a font declaration in ANY text,
     including a comment, as a literal font stack - the same class of trip R130 hit
     by quoting a capitalised word near a rendered constant.) */
  .c1-amount {
    font-family: var(--fs-font-numeric); font-weight: 900; color: #f4fbff;
    text-shadow: 0 0 3px var(--acc); letter-spacing: 2px; white-space: nowrap;
    width: min(46vw, 640px); box-sizing: border-box; text-align: center;
    max-width: min(46vw, 640px); overflow: hidden;
  }
  /* THE PER-DIGIT BOXES ARE RETIRED, R071 TASK 4, and the reason is recorded
     rather than the rule quietly deleted. TR-089 boxed every digit at 0.834em,
     Orbitron's widest advance, because Orbitron's digits span 44.30px at 100px
     and carry no OpenType tnum, so `font-variant-numeric: tabular-nums` on
     .fs-num was inert and a rolling total visibly danced. The owner's R071
     ruling moves every money and counting surface to Exo 2, which HAS a real
     tnum: the same measurement takes its digits from a 21.69 spread to 0.50.
     The compensation was per-site and the face is not, so the mechanism goes
     and the property does the work. win_countup_steady_gate.mjs asserts the
     OUTCOME, equal advances and no drift, with the display face as its seed. */
  .tier-big  .c1-amount { font-size: calc(50px * var(--autofit-scale, 1)); }
  .tier-mega .c1-amount { font-size: calc(64px * var(--autofit-scale, 1)); }
  .tier-epic .c1-amount { font-size: calc(80px * var(--autofit-scale, 1)); }
  /* R131: THE MULTIPLIER WAS THE ONE THING THAT DID NOT ESCALATE. Measured across
     the three tiers before the change: the band grew 111 -> 140 -> 172px, the label
     22 -> 28 -> 36px and the amount 50 -> 64 -> 80px, while this sat at a flat 16px
     at every tier. At epic that put a 16px "250x BET" beside an 80px amount - a 5:1
     ratio - and the multiplier is the number that says how big the win actually was.
     Now 16 -> 20 -> 26, which tracks the label's own 1.00 / 1.27 / 1.64 ladder.
     Only the SIZE changes. It stays GOLD at every tier rather than taking `--sig`,
     because gold is this game's constant value colour: it means "this is what the win
     was worth" regardless of tier, and holding it fixed is what keeps the multiplier
     separate from the tier furniture at big (cyan rules) and mega (magenta rules).
     At EPIC the two coincide, since `--sig` is gold there anyway - so at that tier the
     choice is moot and the label and the multiplier read as matching bookends around
     the white amount. Stated plainly because an earlier draft of this comment argued
     that taking `--sig` would dissolve the multiplier into the epic rules, which is
     not true: it is already gold there, so `--sig` would have changed nothing. */
  .c1-mult { font-family: var(--fs-font-display); font-weight: 800; font-size: 16px; letter-spacing: .16em; color: var(--sig-gold); text-shadow: 0 0 8px color-mix(in srgb, var(--sig-gold) 55%, transparent); white-space: nowrap; }
  .tier-big  .c1-mult { font-size: 16px; }
  .tier-mega .c1-mult { font-size: 20px; }
  .tier-epic .c1-mult { font-size: 26px; }
  /* SECONDARY by design, TR-068. Deliberately quieter than the amount and the
     multiplier above it: the ruling retains the gross WIN as the headline, and
     a price line competing with it for attention would be option (b), the net
     presentation Fable declined. Muted, smaller, wide-tracked, and it sits
     below rather than beside, so nothing above it moves when it appears. */
  .c1-price {
    display: flex; align-items: baseline; justify-content: center; gap: 8px;
    margin-top: 4px;
    font-family: var(--fs-font-display);
    white-space: nowrap;
  }
  .c1-price-label {
    font-weight: 700; font-size: 10px; letter-spacing: .18em;
    color: rgba(190, 232, 255, 0.72);
  }
  .c1-price-value {
    font-weight: 800; font-size: 13px; letter-spacing: .04em;
    color: rgba(230, 245, 255, 0.92);
    font-variant-numeric: tabular-nums;
  }

  /* ── Entry + pulse (ANIMATION UPLIFT PASS 2026-07-16, item 3: stronger
       slam-in overshoot - 0.4->1.1->1 instead of 0.5->1.06->1) ───────────── */
  /* R133: THE TIER GLOW LADDER LIVES HERE NOW, not on .fs-plate, and this element is deliberately
     unmasked. Same rect, so it renders identically, but nothing clips it. See the note on .fs-plate
     for the WebKit failure that forced this. */
  .tier-big  .c1-plate-wrap { box-shadow: 0 3px 10px rgba(0,0,0,.6), 0 0 9px color-mix(in srgb, var(--sig-cyan) 20%, transparent), 0 0 30px color-mix(in srgb, var(--sig-pink) 16%, transparent); }
  .tier-mega .c1-plate-wrap { box-shadow: 0 3px 14px rgba(0,0,0,.6), 0 0 22px color-mix(in srgb, var(--sig-pink) 40%, transparent), 0 0 55px color-mix(in srgb, #a855f7 28%, transparent); }
  .tier-epic .c1-plate-wrap { box-shadow: 0 4px 20px rgba(0,0,0,.65), 0 0 46px color-mix(in srgb, var(--sig-gold) 55%, transparent), 0 0 95px color-mix(in srgb, var(--sig-cyan) 22%, transparent), 0 0 130px color-mix(in srgb, var(--sig-pink) 20%, transparent); }
  .c1-plate-wrap { position: relative; animation: c1-enter .6s cubic-bezier(.34,1.56,.64,1) both;
    /* R060 TASK 1: the band's layout keys on the width this mount actually
       received, not the viewport. The live stage hands the banner 1280px and
       nothing changes there; the replay mounts it inside the 616px grid box,
       where the viewport-keyed narrow block below never fired and the flex
       row squeezed the amount to a 63px window (measured: scrollWidth 222
       against clientWidth 63 at the floor scale, the owner's leading-digit
       captures). A container query keys the same treatment on the box. */
    container-type: inline-size;
  }
  @container (max-width: 700px) {
    .fs-plate > .fs-face { flex-direction: column; align-items: center; gap: 4px; padding: 14px 4cqw; }
    /* R133: the font-size here was INERT. `.c1-amount` is (0,1,0) and lost every time to
       `.tier-big/.tier-mega/.tier-epic .c1-amount` at (0,2,0), so with the container forced to
       616px and to 400px the computed size stayed at the tier's 50px rather than the 46px and
       36px this clamp asks for. Tier-scoping it makes it (0,2,0), which TIES those rules and wins
       on source order, because this block is later in the file. The width and max-width beside it
       were never affected: `.c1-amount` at (0,1,0) is the only rule setting either. */
    .c1-amount { width: 88cqw; max-width: 88cqw; }
    .tier-big .c1-amount, .tier-mega .c1-amount, .tier-epic .c1-amount {
      font-size: calc(clamp(26px, 9cqw, 46px) * var(--autofit-scale, 1));
    }
    .tier-big .fs-face, .tier-mega .fs-face, .tier-epic .fs-face { min-height: 0; }
  }
  /* R133: THE BANNER WAS A STILL IMAGE FOR MOST OF ITS LIFE, and that is the measured reason it
     read as a notification rather than a celebration. Every transient finished by about 1400ms
     (chromatic flash dark by 250ms, shockwave by 700ms, particles and coins by 1400ms) while the
     banner lives 3600 / 4200 / 5000ms, so nothing at all changed for 61% / 67% / 72% of the time a
     player was looking at it. At mega and epic the celebration was over BEFORE the count-up landed:
     motion ended at 1400ms against count-ups running to 2000 and 2800ms. Integrated motion energy
     over the band rect measured 13.6 / 26.7 / 81.6 against MaxWinCelebration's 255.6, and epic beat
     the other two for exactly one reason: it was the ONLY tier with anything sustained.
     So the pulse now runs at every tier, and it is SLOWER AND SMALLER than the one epic had:
     2.4s against 1.1s, and 1.010 to 1.020 against a flat 1.03. That direction is deliberate. The
     standing mandate refuses anything a reviewer could call ticking, and the fix for a dead tail is
     a slow breath, not a faster twitch. It is also why epic's own amplitude comes DOWN: a 1.03
     scale on the 172px epic band walked its painted top edge toward the HUD row that must stay at
     zero changed pixels, and 1.020 walks it less far than what shipped. */
  /* R133, CORRECTED: THE PULSE RUNS ON .fs-plate, NOT ON THE WRAPPER, AND THAT IS TWO FIXES IN ONE
     LINE.
     (1) The per-tier --pulse ladder was INERT in my first version. --pulse is declared on
         .tier-* .fs-plate, and I applied the keyframe to .c1-plate-wrap, which is .fs-plate's
         ANCESTOR. Custom properties inherit downward only, so the computed --pulse on the wrapper
         was empty at every tier and all three tiers pulsed at the var() fallback 1.012. Measured
         matrix(1.012) at big, mega AND epic, while the comment beside it claimed epic reached
         1.020. Declaring and consuming on the SAME element is what makes the ladder real.
     (2) The wrapper contains .c1-tier-burst, so pulsing the wrapper SCALED THE BURST, and the
         burst is the one layer this pass deliberately grew. At epic that pushed the burst's bottom
         edge onto the HUD WIN pod: 560px x 1.045 breathe x 1.012 pulse = 592px, centred on stage
         y=310, bottom at y606 against a pod starting at y573. Measured on the live page, the pod
         went from 0 changed pixels to 56 with a peak channel delta of 167, which is a visible mark
         on a money readout. .fs-plate does not contain the burst, so the band can breathe without
         the art growing into the HUD. */
  .fs-plate { animation: c1-pulse 2.4s ease-in-out .6s infinite; }
  @keyframes c1-enter { 0% { opacity: 0; transform: scale(.4); } 55% { opacity: 1; transform: scale(1.1); } 100% { transform: scale(1); } }
  @keyframes c1-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(var(--pulse, 1.012)); } }

  /* ── Expanding shock ring (ANIMATION UPLIFT PASS 2026-07-16, item 3): the
       shared shock_ring particle, scaled a little larger per tier so it
       feels proportionate to the plate it's bursting behind. ────────────── */
  /* ── Tier energy (R113) ──────────────────────────────────────────────────
     The band was a flat dark bar with a coloured rule: correct, tiered and
     completely inert. These are the celebration package's text-free bursts,
     which is the only part of it that can ship, since every frame carrying a
     painted "BIG WIN" would render English in the fifteen locales that
     translate that label.

     R115: EVERY TIER NOW HAS ITS OWN ART. R113 had mega and epic sharing one
     bloom at two strengths, because the kit of the day simply had no mega asset.
     The text-free kit does, and it is a different SHAPE rather than a different
     size: a mechanical iris against the spiky bursts either side of it, so the
     three tiers read as three things instead of one thing growing. */
  .c1-tier-burst {
    position: absolute; top: 50%; left: 50%; z-index: 1;
    pointer-events: none;
    transform: translate(-50%, -50%);
    mix-blend-mode: screen;
    opacity: var(--burst-op);
    /* R133: a slow breathe across the whole celebration, in the manner of MaxWinCelebration's own
       c1-max-bloom-breathe. See the tail note on .c1-plate-wrap for why. */
    animation: c1-burst-in 0.75s ease-out both, c1-burst-breathe 2.8s ease-in-out 0.75s infinite;
  }
  /* R133: THE MEGA RUNG WAS INVERTED AND IT WAS SITTING IN THESE THREE LINES. Mega was drawn at
     420px against big's 430px, so the MIDDLE tier of a three-tier ladder was drawn SMALLER than
     the tier below it, for a win 5.48x larger. Measured painted silhouette confirmed it: big 344px,
     mega 314px, epic 539px. bloom_mega.png is natively 819x819, the LARGEST of the three rasters,
     and it was drawn the smallest. Mega now sits between its neighbours in both size and opacity.
     The opacities move to a custom property so the breathe keyframe can return to each tier's own
     resting value instead of a literal. */
  .tier-big  .c1-tier-burst { width: 430px; height: 430px; --burst-op: 0.90; }
  .tier-mega .c1-tier-burst { width: 500px; height: 500px; --burst-op: 0.95; }
  /* R133, CORRECTED: epic returns to the 540px it shipped at. Growing it to 560 moved the burst's
     bottom edge from y580 to y590 against a HUD WIN pod that starts at y573, and epic was already
     the only tier close to it. Mega was the broken rung and mega is what needed the size; epic did
     not, and the ladder holds at 430 / 500 / 540 without spending the margin. */
  .tier-epic .c1-tier-burst { width: 540px; height: 540px; --burst-op: 0.92; }
  /* R133: the 100% block was EMPTY. That was harmless while this was the only animation on the
     element, because an empty final keyframe simply holds the underlying value, but a second
     animation now composites onto the same two properties and an implicit endpoint is exactly the
     kind of thing that resolves differently once it is no longer alone. Stated explicitly. */
  @keyframes c1-burst-in {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.55); }
    100% { opacity: var(--burst-op); transform: translate(-50%, -50%) scale(1); }
  }
  /* R133, CORRECTED: this breathes OPACITY ONLY. It used to breathe scale as well, to 1.045, and
     that was the larger half of the HUD-pod bleed above: a burst that grows is a burst whose
     bottom edge moves, and this one is centred on the stage rather than on the band. Opacity moves
     no edges, so the sustained life survives and the geometry is pinned to the resting size. */
  @keyframes c1-burst-breathe {
    0%, 100% { opacity: var(--burst-op); }
    50%      { opacity: calc(var(--burst-op) * 0.74); }
  }

  /* R133: was z-index 1, which sat ABOVE the plate only because the plate had no z-index of its
     own and lost on DOM order. The plate is now explicitly 2, so this is explicitly 3 and the ring
     still bursts over the band exactly as it did. */
  .c1-shockwave {
    position: absolute; top: 50%; left: 50%; pointer-events: none; z-index: 3;
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
  .c1-coin-layer { position: absolute; inset: 0; pointer-events: none; z-index: 5; overflow: visible; }
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
       single quick RGB-channel-split flash on the epic/max tier, drawn on the
       band's own left and right edges. It said "full-viewport ... rather than
       just a plate effect"; it has always been the plate effect, for the
       containing-block reason set out on the rule below. ─────────────────── */
  /* R132: `position: absolute`, AND THE DECLARATION NOW MATCHES THE RENDERING.
     This said `position: fixed`, and the comment above still described a
     "full-viewport" flash. It was never either. .big-win-banner sets
     transform: translateY(-50%), and a transformed element is the containing
     block for its FIXED descendants, so this resolved to the banner's own box:
     measured live at epic, 1280x172 at y224, byte-identical to the banner's rect
     rather than the 1280x720 viewport it asked for. `absolute` against the same
     absolutely-positioned banner gives the identical rect and is what the code
     was doing all along.

     IT IS NOT DEAD CODE, AND THAT WAS WORTH CHECKING BEFORE DELETING IT. Pinned
     at its own 12% keyframe peak, with every other animation paused and the
     count-up text frozen so the control read a true zero, the element paints a
     visible chromatic split on the band's left and right edges: mean delta 39.95
     over the left 8px strip and 63.06 over the right, peaks 60.7 and 89.3. A
     first measurement of mine reported no detectable pixels and was wrong - the
     0.28s animation had already run to opacity 0 before that screenshot, so it
     sampled an element that had finished.

     LEFT AT BANNER SCALE ON PURPOSE. Promoting it to a true full-stage layer
     needs the element hoisted out of this component, since no CSS escapes a
     transformed ancestor's containing block, and the result would be a 6px fringe
     at the extreme screen edges - further from the celebration and weaker than
     the band-edge split it currently draws. The effect reads; only its label was
     wrong. */
  .c1-chromatic-flash {
    position: absolute; inset: 0; z-index: 200; pointer-events: none;
    animation: c1-chromatic-flash 0.28s ease-out both;
    mix-blend-mode: screen;
  }
  @keyframes c1-chromatic-flash {
    0%   { opacity: 0; box-shadow: inset 6px 0 0 rgba(255,0,80,0), inset -6px 0 0 rgba(0,255,255,0); }
    12%  { opacity: 1; box-shadow: inset 6px 0 0 rgba(255,0,80,0.5), inset -6px 0 0 rgba(0,255,255,0.5); }
    100% { opacity: 0; box-shadow: inset 6px 0 0 rgba(255,0,80,0), inset -6px 0 0 rgba(0,255,255,0); }
  }

  /* ── Particles ────────────────────────────────────────────────────────── */
  .c1-particle-layer { position: absolute; inset: -50px; pointer-events: none; z-index: 4; }
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
    /* R133: `gap: 4px` was INERT here for the same reason, and this one had a measured cost.
       `.fs-face` is (0,1,0) and lost to `.tier-* .fs-face { gap: 32/36/40px }` at (0,2,0), so the
       stacked narrow layout ran a 32px gap it never asked for: 32 stage px of empty band between
       the tier word and the amount and another 32 between the amount and the multiplier, which is
       why three elements read as three separate announcements instead of one lockup. Forcing the
       declared value measured the cost exactly: the band drops 209 to 153 at 500px wide, 206 to 150
       at 480 and 194 to 138 at 390. Fifty-six stage pixels of unnecessary band at every narrow
       width, and every one of them covers grid and hero. Marked important to match its neighbours
       in this block, which already win that way. */
    .fs-face { flex-direction: column !important; align-items: center !important; gap: 4px !important; padding: 14px 4vw !important; }
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
    /* The burst stays: it is a still painting, and it is what makes the tier
       legible at a glance. Only its entrance is dropped. */
    /* R133: THIS BLOCK USED TO NEUTRALISE BY ENUMERATION, AND AN ENUMERATION FAILS OPEN.
       It named .c1-tier-burst, .c1-plate-wrap, .tier-epic .c1-plate-wrap and .c1-particle, so any
       NEWLY animated selector in this component was live under reduced motion by default and
       nothing would have said so. R133 adds two animations, and rather than adding two names to a
       list that will go stale again, the whole subtree is neutralised. A future animation here is
       covered on the day it is written instead of on the day somebody remembers this block.
       The burst holds its resting opacity through var(--burst-op) on the base rule, so killing the
       animation leaves it painted rather than invisible, which is the behaviour that was measured
       and kept: 0 animations in the banner subtree and 0.00px of geometric deviation. */
    .c1-win, .c1-win * { animation: none !important; }
    .c1-particle { opacity: 0; }
    .c1-shockwave, .c1-coin, .c1-chromatic-flash { display: none; }
  }
</style>
