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
  import { formatBalance, CURRENCY_SCALE, formatWin, winFractionDigits } from '../utils/currency'
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
  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
  $: amountLabel = formatWin(Math.round(displayAmount * CURRENCY_SCALE), $currencyCode || 'USD', $locale, null, amountDigits)
  // Split for the per-digit boxes below. Derived rather than done in the
  // template so the character list is computed once per value change.
  $: amountChars = [...amountLabel].map((c) => ({ c, digit: c >= '0' && c <= '9' }))
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
          <div class="c1-amount fs-num" use:autofitText={amountLabel} data-testid="win-amount">
            {#each amountChars as ch}<span class="c1-ch" class:c1-digit={ch.digit}>{ch.c}</span>{/each}
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

  .c1-tier-label { font-family: var(--fs-font-display); font-weight: 900; letter-spacing: .18em; color: var(--acc); text-shadow: 0 0 12px color-mix(in srgb, var(--acc) 70%, transparent); text-transform: uppercase; white-space: nowrap; }
  .tier-big  .c1-tier-label { font-size: 22px; }
  .tier-mega .c1-tier-label { font-size: 28px; }
  .tier-epic .c1-tier-label { font-size: 36px; }

  /* B1 sharp numeral: near-white fill, tight 3px halo, no wide double glow.
     OWNER AUDIT REMEDIATION B2: font-size scales down via the autofitText
     action's --autofit-scale so seven-digit wins ($1,000,000+) fit the
     band instead of overflowing/truncating. Fixed max-width (not 100% of a
     flex row) since the band now lays tier/amount/mult out horizontally. */
  .c1-amount {
    font-family: var(--fs-font-display); font-weight: 900; color: #f4fbff;
    text-shadow: 0 0 3px var(--acc); letter-spacing: 2px; white-space: nowrap;
    width: min(46vw, 640px); box-sizing: border-box; text-align: center;
    max-width: min(46vw, 640px); overflow: hidden;
  }
  /* 0.834em is Orbitron's WIDEST digit advance (834 of its 1000 unitsPerEm,
     shared by `0` and `8`), measured on the shipped woff rather than guessed, so
     every digit fits its box and no digit is clipped. Centred, because a digit
     narrower than the box should sit in the middle of it rather than against one
     edge. TR-089. */
  .c1-amount .c1-digit { display: inline-block; width: 0.834em; text-align: center; }
  .tier-big  .c1-amount { font-size: calc(50px * var(--autofit-scale, 1)); }
  .tier-mega .c1-amount { font-size: calc(64px * var(--autofit-scale, 1)); }
  .tier-epic .c1-amount { font-size: calc(80px * var(--autofit-scale, 1)); }
  .c1-mult { font-family: var(--fs-font-display); font-weight: 800; font-size: 16px; letter-spacing: .16em; color: var(--sig-gold); text-shadow: 0 0 8px color-mix(in srgb, var(--sig-gold) 55%, transparent); white-space: nowrap; }
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
