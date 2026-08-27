<script lang="ts">
  // PaytableModal.svelte, full-page paytable, B3 reskin.
  // Rebuilt on the B1 chrome vocabulary (.fs-plate / .fs-rail / .fs-knob /
  // .fs-face): a single brushed-steel instrument plate holding the how-to-win
  // banner, the WAYS TO WIN adjacency diagram, the symbol payouts grid, the
  // rules, the Overdrive trigger table + buy callout, the RTP rows and the
  // seven-point disclaimer, all scrollable. Fills ~92% of the fixed 1280x720
  // stage (scales with S via the transformed ancestor, which also re-anchors
  // this modal's `position: fixed`). All colour comes from the 5 scheme tokens,
  // so a new skin is one scheme block; base and Overdrive states are supported.
  // Fonts are the globally self-hosted Orbitron (@fontsource, see main.ts), no
  // external font CDN (Stake Engine compliance).
  import { showPaytable, betAmount, currencyCode, locale } from '../stores/gameStore'
  import { autofitText } from '../actions/autofitText'
  import { themeAssets } from '../stores/themeStore'
  import { tr } from '../i18n/tr'
  import { isSocial } from '../stores/socialMode'
  // The single social-aware vocabulary layer (R2R JOB 6 / TR-041).
  import { sv } from '../i18n/vocabulary'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { playClick } from '../services/soundService'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { spinCostMicros } from '../stores/buyAffordability'
  import { overdriveVisual } from '../stores/overdriveVisual'
  import { FS_MODES, fsRtpLabel, fsMaxWinLabel, fsCostLabel } from '../config/fsModes'

  function close(): void {
    playClick()
    showPaytable.set(false)
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') close()
  }

  // Social-aware prose. In social mode, gambling framing (win/wins/winnings,
  // bet) switches to social framing (prize/prizes, play), keeping the seven
  // disclaimer points intact.
  $: waysLabel = $tr('waysLabel')

  // JOB 2, 2026-07-28. Was two parallel arrays of English literals, branched on
  // $isSocial in the component. That did the social swap and never the locale
  // swap, so the RULES, the one block an approval reviewer is guaranteed to
  // open, read English in all sixteen locales. Both swaps now come from the
  // locale layer through one $tr call per line, and the social wording rulings
  // recorded here (TR-041: "pay" and "pays" are themselves restricted terms,
  // so the social lines are authored rather than mechanically substituted)
  // survive as the social variants of these same keys in prose.ts PROSE_SOCIAL.
  $: rulesList = [
    $tr('rulesWaysPay'),
    $tr('rulesSymbolValues'),
    $tr('rulesWildSub'),
    $tr('rulesScatterMult'),
    $tr('rulesMaxWin'),
    $tr('rulesMalfunction'),
  ]

  // R077, 2026-08-21. The disclaimer body IS the whole disclaimer, and it is
  // the platform's mandated text and NOTHING ELSE (disclaimer.ts, single
  // source, byte-identical in all sixteen locales and both modes, ending at
  // its own closing line). NOTHING MAY BE APPENDED HERE, and the history is
  // why the rule is written this strongly rather than left to taste: from
  // 2026-07-28 this site concatenated two hardcoded English trademark
  // sentences onto a translated body, which no markup gate could see because
  // the join happened in the script; R076 removed both and moved one sentence
  // into the body; R077 removed that one too, on the owner's production
  // evidence that the platform's own live games ship the paragraph bare.
  // A render-site append is invisible to the source pins, so it is the one
  // form of this defect that could return quietly. Keep this a bare read.
  $: disclaimerText = $tr('disclaimerBody')

  // Symbol pay table, per-way multipliers, matching the validated maths in
  // games/future_spinner/game_config.py exactly. Final payout = paytable value
  // x ways count x bet. pays array is [_, _, 3-of, 4-of, 5-of]. WILD substitutes
  // for all symbols and has no independent pay; SCAT pays via the scatter table.
  // Icons resolve to the active theme's AssetForge vector exports; see
  // $themeAssets.assetBase.
  const SYMBOLS = [
    { name: 'WILD', file: 'wild',    pays: [null, null, null, null, null] },
    { name: 'SCAT', file: 'scatter', pays: [null, null, null, null, null] },
    { name: 'H1',   file: 'h1',      pays: [null, null, 1.5,  6,    22]   },
    { name: 'H2',   file: 'h2',      pays: [null, null, 0.8,  3,    10]   },
    { name: 'M1',   file: 'm1',      pays: [null, null, 0.45, 1.5,  5]    },
    { name: 'M2',   file: 'm2',      pays: [null, null, 0.3,  1,    4]    },
    { name: 'M3',   file: 'm3',      pays: [null, null, 0.2,  0.6,  2]    },
    { name: 'L1',   file: 'l1',      pays: [null, null, 0.15, 0.45, 1.5]  },
    { name: 'L2',   file: 'l2',      pays: [null, null, 0.10, 0.25, 0.8]  },
    { name: 'L3',   file: 'l3',      pays: [null, null, 0.08, 0.20, 0.65] },
  ] as const

  // Per-tier accent (drives the plate bloom + note colour via --sig).
  const TIER_CLASS: Record<string, string> = {
    WILD: 'tier-w', SCAT: 'tier-s',
    H1: 'tier-h', H2: 'tier-h',
    M1: 'tier-m', M2: 'tier-m', M3: 'tier-m',
    L1: 'tier-l', L2: 'tier-l', L3: 'tier-l',
  }

  // Overdrive trigger table (matches CLAUDE.md true game facts exactly).
  const TRIGGER_TABLE = [
    { scatters: 3, spins: 8,  award: '1×' },
    { scatters: 4, spins: 12, award: '3×' },
    { scatters: 5, spins: 16, award: '10×' },
  ]

  // Interface Guide, each game control with its rendered UI art and a
  // one-line description. `kind: 'img'` rows use the theme's UI PNGs; `kind:
  // 'pill'` rows have no dedicated art and render a styled text token instead.
  // R2R JOB 6 / TR-041. Every `name` and `desc` below was a hardcoded literal
  // that rendered identically in social mode, so the guide read "Increase Bet",
  // "Max Bet", "Bet the maximum" and "pick a bet mode or buy the feature" to a
  // stake.us player. It is now routed through the single vocabulary layer, so
  // adding a row cannot reintroduce the problem: `sv()` applies to whatever the
  // row says.
  // FS VISUAL FIXPACK JOB 2: `file` became `files`, a list, because the speed
  // control now needs three. Every other row carries a one-item list rather
  // than a second optional shape, so the markup has one branch and not two.
  const INTERFACE_GUIDE_RAW = [
    { kind: 'img',  files: ['spin_button.png'],    nameKey: 'guideSpinName',      descKey: 'guideSpinDesc' },
    { kind: 'img',  files: ['btn_bet_plus.png'],   nameKey: 'guideBetPlusName',   descKey: 'guideBetPlusDesc' },
    { kind: 'img',  files: ['btn_bet_minus.png'],  nameKey: 'guideBetMinusName',  descKey: 'guideBetMinusDesc' },
    // R125: WAS `feature_button.png`, a 224x224 painted machine badge produced by
    // the manifest/build.py path. Every other row in this guide is a headless crop
    // of the live control (regen_interface_guide_icons.mjs), so this was the only
    // row that could drift away from the button it documents - and it had: the
    // live FEATURES control is a dark-glass pill carrying the inline car-grille
    // glyph, and the guide was showing a player an ornate plate that does not
    // exist anywhere in the game. Now captured from `.fm-entry-pill` like the rest.
    // `wide` because the pill is 2.95:1, not square - see .fs-guide-icon--wide.
    // feature_button.png is NOT orphaned by this: it still renders as the buy
    // dialog's header art (BuyBonus.svelte:117), which is its other role.
    { kind: 'img',  files: ['btn_features.png'], wide: true,
      nameKey: 'guideFeaturesName',  descKey: 'guideFeaturesDesc' },
    { kind: 'img',  files: ['btn_autoplay.png'],   nameKey: 'guideAutoplayName',  descKey: 'guideAutoplayDesc' },
    { kind: 'img',  files: ['btn_menu.png'],       nameKey: 'guideMenuName',      descKey: 'guideMenuDesc' },
    // OWNER AUDIT ROUND 3, item 5: Turbo and Max were text pills with no
    // captured icon at all - now real live-component captures (each its own
    // distinct selector, see regen_interface_guide_icons.mjs), consistent
    // with every other control in this guide.
    //
    // FS VISUAL FIXPACK JOB 2 (owner ruling, 2026-07-27): the control lost its
    // "1x / 2x / 4x" numeral and now says which speed it is by INTENSIFYING.
    // A guide row showing one state would therefore be showing the player the
    // one thing this control is not about, so the row shows all three captures
    // in order. They are real crops of the live control at each speed
    // (regen_interface_guide_icons.mjs cycles it between captures), so the
    // guide cannot drift from the button the way a hand-drawn icon would.
    { kind: 'img',  files: ['btn_turbo.png', 'btn_turbo_2.png', 'btn_turbo_3.png'],
      nameKey: 'guideTurboName', descKey: 'guideTurboDesc' },
    { kind: 'img',  files: ['btn_max.png'],        nameKey: 'guideMaxName',       descKey: 'guideMaxDesc' },
  ] as const

  // JOB 2, 2026-07-28. Was English literals run through `sv()`, so the social
  // swap happened and the LOCALE swap never did: sixteen locales read this
  // guide in English. Both swaps now come from the one table via `$tr`.
  $: INTERFACE_GUIDE = INTERFACE_GUIDE_RAW.map((row) => ({
    ...row,
    name: $tr(row.nameKey),
    desc: $tr(row.descKey),
  }))

  // Buy price, 100x current bet, only meaningful where the buy is not disabled.
  // THE RULES MUST NOT ADVERTISE WHAT THE JURISDICTION FORBIDS. 2026-08-09.
  //
  // FeatureMenu already filters buy tiers out of its cards when the flag is set
  // (FeatureMenu.svelte:82). This modal iterated FS_MODES unfiltered, so with
  // disabledBuyFeature a player read a rules screen offering Buy Overdrive at
  // 100x and NITRO at 400x, went to the FEATURES menu, and found neither. The
  // same expression is used deliberately, so the two surfaces cannot drift into
  // disagreeing about what this session offers.
  $: visibleModes = FS_MODES.filter((m) => m.kind !== 'buy' || !$buyFeatureDisabled)

  $: buyPriceLabel = formatBalance(spinCostMicros($betAmount, 'bonus'), $currencyCode || 'USD', $locale)

  // Bet Modes section, every mode priced against the current bet, straight from
  // the single source of truth (config/fsModes.ts). Placeholder modes (maths not
  // yet shipped) are tagged "coming soon"; RTP is the same across all modes.
  $: modePrice = (cost: number) =>
    formatBalance(Math.round($betAmount * cost * CURRENCY_SCALE), $currencyCode || 'USD', $locale)
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="fs-pt fs-scrim"
  class:fs-pt--overdrive={$overdriveVisual}
  role="dialog"
  aria-modal="true"
  aria-label={$tr('paytable')}
  tabindex="-1"
  on:click|self={close}
>
  <div class="fs-pt-panel fs-plate">
    <span class="fs-rail"></span>
    <div class="fs-face">

      <!-- ── Header ──────────────────────────────────────────────────── -->
      <div class="fs-pt-head">
        <h2 class="fs-pt-title">{$tr('paytable')}</h2>
        <button class="fs-pt-close fs-knob" on:click={close} aria-label={$tr('close')}>
          <!-- Was `✕`, U+2715, which the Orbitron subset does not carry, so the
               close control on a mandatory information surface rendered in the
               operating system's font. QUALITY_CHARTER.md Q-05. -->
          <span class="fs-face"><svg class="fs-close-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></span>
        </button>
      </div>

      <!-- ── Scrollable body ───────────────────────────────────────── -->
      <div class="fs-pt-body">

        <!-- How-to-win banner + ways callout -->
        <div class="fs-htw fs-plate">
          <div class="fs-face">
            <h4>{$tr('waysHeading')}</h4>
            <p>{$tr('waysBody')}</p>
            <div class="fs-ways-callout fs-plate">
              <div class="fs-face">
                <!-- R047 TASK 1 (TR-125): 4 rows ^ 5 reels = 1024 ways,
                     rendered per locale grouping (de 1.024; fi, fr and ru
                     1 024) through the same toLocaleString convention as
                     every other figure on this surface. -->
                <span class="fs-ways-num fs-num">{(1024).toLocaleString($locale)}</span>
                <span class="fs-ways-lbl">{waysLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- WAYS TO WIN, adjacent-reels diagram, reads left to right from reel 1 -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:10px;">{waysLabel}</h3>
          <div class="fs-ways-diagram fs-plate" role="img" aria-label={$tr('a11yWaysDiagram')}>
            <div class="fs-face">
              {#each [1, 2, 3, 4, 5] as reelNum, i}
                <div style="display:flex;align-items:center;">
                  <div class="fs-way-cell" class:matched={i < 3}>{reelNum}</div>
                  {#if i < 4}
                    <span class="fs-way-arrow" class:matched={i < 2}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5" /></svg></span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
          <p class="fs-caption">{$tr('waysDiagramCaption')}</p>
        </div>

        <!-- Symbol payouts -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:10px;">{$tr('symbolPayoutsHeading')}</h3>
          <div class="fs-sym-grid">
            {#each SYMBOLS as sym}
              <div class="fs-sym-card fs-plate {TIER_CLASS[sym.name]}">
                <div class="fs-face">
                  <img src="{$themeAssets.assetBase}/symbols/{sym.file}.png" alt={sym.name} />
                  <span class="fs-sym-name">{sym.name}</span>
                  {#if sym.name === 'SCAT'}
                    <span class="fs-sym-note">{$tr('scatterSummary')}</span>
                  {:else if sym.name === 'WILD'}
                    <span class="fs-sym-note">{$tr('wildSubstitutes')}</span>
                  {:else}
                    <div class="fs-pay-rows">
                      <!-- R047 TASK 1 (TR-125): pays values render their
                           locale decimal form (0.65 -> 0,65 in the ten
                           comma-decimal locales), same convention as the
                           mode cards beside them. -->
                      <div class="fs-pay-row"><span class="fs-pay-count">3×</span><span class="fs-pay-val fs-num">{sym.pays[2]?.toLocaleString($locale, { maximumFractionDigits: 2 }) ?? '-'}</span></div>
                      <div class="fs-pay-row"><span class="fs-pay-count">4×</span><span class="fs-pay-val fs-num">{sym.pays[3]?.toLocaleString($locale, { maximumFractionDigits: 2 }) ?? '-'}</span></div>
                      <div class="fs-pay-row"><span class="fs-pay-count">5×</span><span class="fs-pay-val fs-num">{sym.pays[4]?.toLocaleString($locale, { maximumFractionDigits: 2 }) ?? '-'}</span></div>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Rules -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:8px;">{$tr('rules')}</h3>
          <ul class="fs-rules">
            {#each rulesList as rule}
              <li>{rule}</li>
            {/each}
          </ul>
        </div>

        <!-- Overdrive Free Spins feature -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:10px;">{$tr('rulesOverdriveTitle')}</h3>
          <table class="fs-trig" aria-label={$tr('a11yOverdriveTable')}>
            <thead>
              <tr><th>{$tr('colScatters')}</th><th>{$tr('colFreeSpins')}</th><th>{$tr('colInstantAward')}</th></tr>
            </thead>
            <tbody>
              {#each TRIGGER_TABLE as row}
                <tr><td>{row.scatters}</td><td>{row.spins}</td><td>{row.award}</td></tr>
              {/each}
            </tbody>
          </table>

          <ul class="fs-rules" style="margin-top:12px;">
            <li>{$tr('rulesOverdriveMeter')}</li>
            <li>{$tr('rulesOverdriveRetrigger')}</li>
            <!-- TR-036 option (b) / R2R1 F-07. The disclosure half of the
                 retrigger finding: a player who sees a full build on entry and
                 a shorter one on retrigger should be told why, or the
                 difference reads as a glitch. Routed through the JOB 6
                 vocabulary layer like every other composed player string. -->
            <li>{sv($tr('rulesOverdriveRetriggerBuild'), $isSocial)}</li>
            {#if !$buyFeatureDisabled}
              <li>{$tr('rulesOverdriveBuy')}</li>
            {/if}
            <li>{$tr('rulesOverdriveModes')}</li>
          </ul>

          {#if !$buyFeatureDisabled}
            <div class="fs-buy fs-plate" style="margin-top:14px;">
              <div class="fs-face">
                <span class="fs-buy-lbl">{$tr('buyFeature')}</span>
                <span class="fs-buy-val fs-num">{buyPriceLabel}</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Bet Modes, every mode from the single source of truth (fsModes.ts).
             All five are live since FeatureMath v2 (2026-07-07): Normal, Cruise,
             OVERBOOST, Buy Overdrive, NITRO OVERDRIVE. All share the same
             96.35% RTP; the `soon` tag/branch remains for any future mode
             added ahead of its maths shipping.
             2026-07-15 neon polish pass, item 6: reformatted from a
             left-justified row list into centred mode cards (name, cost,
             RTP, max win) - rest of the paytable is unchanged. -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:10px;">{$tr('betModesHeading')}</h3>
          <div class="fs-mode-cards">
            {#each visibleModes as m (m.id)}
              <div class="fs-mode-card fs-plate tone-{m.kind}" class:soon={!m.available}>
                <div class="fs-face">
                  <div class="fs-mode-card-name-row">
                    <span class="fs-mode-name">{$tr(m.labelKey)}</span>
                    {#if !m.available}
                      <span class="fs-mode-soon">{$tr('comingSoonLower')}</span>
                    {/if}
                  </div>
                  <div class="fs-mode-card-stats">
                    <div class="fs-mode-stat">
                      <span class="fs-mode-stat-label">{$tr('costLabel')}</span>
                      <!-- Stacked, not "1.25x · $1.25" on one line - the
                         100x/400x buy tiers' dollar figures truncated with
                         an ellipsis in the 3-column card grid's narrow cost
                         column (caught via a committed screenshot, not
                         assumed from the CSS). -->
                      <span class="fs-mode-stat-value fs-num" use:autofitText={fsCostLabel(m.cost, $locale)} data-money="num">{fsCostLabel(m.cost, $locale)}</span>
                      <span class="fs-mode-stat-subvalue fs-num" use:autofitText={modePrice(m.cost)} data-money="cur">{modePrice(m.cost)}</span>
                    </div>
                    <div class="fs-mode-stat">
                      <span class="fs-mode-stat-label">RTP</span>
                      <span class="fs-mode-stat-value fs-num" use:autofitText={fsRtpLabel($locale)} data-money="num">{fsRtpLabel($locale)}</span>
                    </div>
                    <div class="fs-mode-stat">
                      <!-- ROUND 4 item 4: per-mode card, quoted against the BASE
                           bet since each card shows its own cost multiplier. The
                           general rules row below deliberately keeps the short
                           form.
                           TR-037: the qualifier lives in the LABEL, not the
                           value. Rendering "5,000x base bet" as the value clipped
                           it to "5,000x ba..." on every card, hiding the very
                           figure the platform requires to be displayed. -->
                      <span class="fs-mode-stat-label">{$tr('maxWinLabel')}</span>
                      <span class="fs-mode-stat-value fs-num" use:autofitText={fsMaxWinLabel($locale)} data-money="num">{fsMaxWinLabel($locale)}</span>
                    </div>
                  </div>
                  <p class="fs-mode-blurb">{$tr(m.blurbKey)}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- ── Interface Guide, every game control explained ────────────── -->
        <div data-testid="interface-guide">
          <p class="fs-mode-footnote">{$tr('maxWinFootnote')}</p>

          <h3 class="fs-heading" style="margin-bottom:10px;">{$tr('interfaceGuideHeading')}</h3>
          <div class="fs-guide-list">
            {#each INTERFACE_GUIDE as g}
              <div class="fs-guide-row">
                <div class="fs-guide-icon" class:fs-guide-icon--set={g.files.length > 1}
                     class:fs-guide-icon--wide={'wide' in g && g.wide}>
                  <!-- R10, 2026-07-27: the former {:else} branch rendered a
                       `kind: 'pill'` text token via `g.label`. OWNER AUDIT ROUND 3
                       item 5 converted Turbo and Max to real captures, so ALL
                       eight INTERFACE_GUIDE entries are `kind: 'img'` and the
                       branch became unreachable. It survived as dead markup
                       referencing a `label` field no entry has, which is what the
                       type error was reporting. Removed rather than silenced. -->
                  {#each g.files as f, i (f)}
                    <!-- Only the first image is named. The other two are the
                         SAME control in another state, so repeating the name
                         would have a screen reader announce one control three
                         times; the description carries what they show. -->
                    <img
                      src="{$themeAssets.assetBase}/ui/{f}"
                      alt={i === 0 ? g.name : ''}
                      aria-hidden={i === 0 ? undefined : 'true'}
                      class="fs-guide-img"
                    />
                  {/each}
                </div>
                <div class="fs-guide-text">
                  <span class="fs-guide-name">{g.name}</span>
                  <span class="fs-guide-desc">{g.desc}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- RTP, identical across all five modes (0.5% cross-mode rule) + max win -->
        <div class="fs-rtp">
          <div class="fs-rtp-row fs-plate"><div class="fs-face"><span class="fs-rtp-lbl">{$tr('rtpAllModes')}</span><span class="fs-rtp-val fs-num">{fsRtpLabel($locale)}</span></div></div>
          <div class="fs-rtp-row fs-plate"><div class="fs-face"><span class="fs-rtp-lbl">{$tr('maxWinLabel')}</span><span class="fs-rtp-val fs-num">{fsMaxWinLabel($locale)}</span></div></div>
        </div>

        <!-- Responsible play, the autoplay stop-conditions actually available
             in the HUD's auto-menu (HudOverlay.svelte's startAuto()). Kept
             factual and scoped to what the player can actually set here. -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:6px;">{$tr('responsiblePlayHeading')}</h3>
          <p class="fs-disc">{$tr('responsiblePlayBody')}</p>
        </div>

        <!-- Disclaimer (Stake Engine seven-point requirement) -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:6px;">{$tr('disclaimerHeading')}</h3>
          <p class="fs-disc">{disclaimerText}</p>
        </div>

      </div><!-- /fs-pt-body -->
    </div><!-- /fs-face -->
  </div><!-- /fs-pt-panel -->
</div>

<style>
  /* R068 bidi isolation, the "where needed" of the stage pin: sentence
     elements take their base direction from their own first strong character
     (unicode-bidi: plaintext), so Arabic prose reads natively (trailing
     punctuation at its correct end) inside the ltr-pinned stage, while every
     Latin-script locale resolves ltr and renders byte-identically. Box
     geometry stays pinned; this affects only inline bidi ordering. */
  /* R078, 2026-08-21: .fs-disc JOINS THE LIST, and the reason is worth stating
     because the brief that ordered it and the measurement disagree in a useful
     direction. .fs-disc carries TWO paragraphs: the responsible-play body,
     which is genuinely translated, and the platform-mandated disclaimer, which
     has been English in all sixteen locales since R076. Measured at lang=ar,
     comparing the final character against the first (direction-invariant, so
     the oracle does not depend on where the run sits in its box):
       responsible play, before: last char RIGHT of first, the wrong end
       responsible play, after:  last char LEFT of first, correct RTL reading
       the disclaimer, before and after: identical, firstX 0, lastX 887.3
     So this fixes a live Arabic defect in the neighbouring paragraph, the one
     sentence class R068's sweep missed, and is provably a no-op for the
     mandated English block, which the ltr stage pin already rendered correctly.
     Held by direction_parity_gate check D, seeded by lifting the class.

     AND THE SWEEP WENT WIDER THAN THE BRIEF, which is surfaced in the session
     report per convention (n) rather than decided quietly. Measuring .fs-disc
     meant enumerating every Arabic sentence leaf in this modal, and 13 of 32
     read at the wrong end, not one: .fs-mode-blurb, .fs-mode-footnote and
     .fs-guide-desc were missed by the R068 sweep exactly as .fs-disc was. They
     join the rule here. The change is measured zero-risk for the fifteen
     Latin-script locales (identical geometry with and without) and a strict
     repair for ar, it is one selector list, and the owner is about to submit
     this build with the rules screen being the surface a reviewer opens first.
     Check D now asserts the MECHANISM over the whole class rather than over an
     enumerated list, so the next element added to this modal cannot repeat the
     miss silently. */
  .fs-htw h4, .fs-htw p, .fs-caption, .fs-sym-note, .fs-rules li,
  .fs-disc, .fs-mode-blurb, .fs-mode-footnote, .fs-guide-desc { unicode-bidi: plaintext; }

  /* TR-037: the max-win qualifier as one footnote under the mode grid. Repeating
     it in five column labels clipped every one of them; a four-column stat row
     has no width for a qualified label. */
  .fs-mode-footnote {
    margin: 10px 0 18px;
    font-size: 11px;
    line-height: 1.4;
    color: rgba(190, 214, 230, 0.72);
    font-family: var(--fs-font-numeric);
    letter-spacing: 0.02em;
  }

  /* ==========================================================================
     FUTURE SPINNER: B3 PAYTABLE RESKIN
     Same chrome vocabulary as B1 (.fs-plate / .fs-knob / .fs-rail). All colour
     comes from the 5 scheme tokens; base + Overdrive + scheme-driven.
     ========================================================================== */
  .fs-pt {
    --sig-cyan: var(--theme-primary, #00ffff);
    --sig-pink: #ff2ec4;
    --sig-gold: #ffd700;
    --sig-orange: #ff9a2e;
    --sig-green: #4eff91;
    --navy: #060610;
    --acc: var(--sig-cyan);
    --acc2: var(--sig-pink);
    /* FS VISUAL FIXPACK JOB 4: geometry moved to the shared .fs-scrim class in
       app.css. This comment used to read "App.svelte's transform:scale
       re-anchors position:fixed descendants to the 1280x720 stage, so this
       covers the stage exactly", which was an accurate description of the
       defect: covering the stage exactly leaves the letterbox bands bare at
       every window shape that is not 16:9. This element now supplies only its
       paint and its layout. */
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(3px);
    font-family: var(--fs-font-display);
  }

  /* R135: THE THREE SWAPPABLE SCHEME RULES ARE GONE, HERE AND IN HudOverlay.
     Nothing in the repository ever added those classes to any element, so Svelte pruned all six
     rules out of the bundle and they were three of the four standing css_unused_selector build
     warnings. RESKIN_BOUNDARY.md GAP 2 already records this class of thing: the repository looks
     multi-theme and in the shipped build it is not.
     They are deleted rather than left as a hook, because a hook needs a WRITER before it needs
     CSS, and CSS with no writer is the "documented as live, inert in pixels" third state this
     project has now banned. If a scheme swap is wanted, the code that applies the class comes
     first and these rules come back with it. */
  .fs-pt--overdrive   { --acc: var(--sig-pink); --acc2: var(--sig-orange); }

  /* ---- shared chrome primitives (same as B1) ---- */
  /* FS VISUAL FIXPACK JOB 3: THE FILL NOW FOLLOWS THE FRAME.
     The plate is a two-part primitive: this element is the brushed-chrome
     FRAME, and its `.fs-face` child is the dark FILL that carries the content.
     The frame was a block container, so the fill was only ever as tall as its
     own content. That is invisible everywhere the frame is content-sized too,
     and wrong the moment the frame is stretched by something else.
     `.fs-sym-grid` stretches its items to the row height, so on a row where
     another card is taller, a shorter card's fill stopped where its text
     stopped and the chrome gradient showed through beneath it.
     Measured at 1200x675 before the fix, Symbol Payouts row 1: every card frame
     197.4px; H1, H2, M1 and M2 fills 193.6px, which is the frame less its 2px
     of padding on each side; WILD's fill 170.3px, leaving 23.0px of exposed
     chrome, and SCAT's 156.6px, leaving 36.8px. Those are the two the owner
     reported, and they are the two whose content is a short note rather than
     three payout rows.
     Making the frame a flex container and the fill a stretching item fixes the
     class rather than those two cards: any plate, any content length, any
     locale, the fill is the frame. Held by paytable_card_fill_gate.mjs. */
  .fs-plate {
    position: relative;
    display: flex;
    --sig: var(--sig-cyan);
    /* R120: this is the paytable's OWN COPY of the six-stop brushed-metal
       bezel R119 removed from the HUD. docs/design/CHROME_PRIMITIVES.md was
       scoped to keep it canonical HERE, on the assumption the paytable would
       stay on the old language; the R120 brief asks for the opposite, so the
       copy follows the shell and that scoping note is now corrected. */
    padding: 1px;
    clip-path: polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px));
    background: var(--hud-border-strong);
    box-shadow: var(--hud-shadow);
  }
  .fs-plate > .fs-face {
    position: relative;
    /* The fill is one flex item filling the frame. min-width:0 so a long word
       in any locale wraps inside the fill instead of widening it. */
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    background: var(--hud-surface-sunken);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 0 12px rgba(0, 0, 0, 0.45);
  }
  .fs-rail {
    position: absolute;
    left: 1px;
    top: 9px;
    bottom: 9px;
    width: 3px;
    border-radius: 2px;
    z-index: 2;
    /* Neutral at rest, like every rail in the shell. The panel's own rail is
       the exception: it keeps the accent, because it is the modal's identity
       edge and the one place the accent is spent here. */
    background: var(--hud-border-strong);
    box-shadow: none;
  }
  .fs-pt-panel > .fs-rail { background: var(--sig); box-shadow: 0 0 8px color-mix(in srgb, var(--sig) 45%, transparent); }
  .fs-knob {
    border-radius: 50%;
    padding: 1px;
    position: relative;
    background: var(--hud-border);
    box-shadow: var(--hud-shadow-soft);
  }
  .fs-knob > .fs-face {
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: radial-gradient(circle at 36% 28%, #1a3640, #06131c 72%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.14), inset 0 -6px 12px rgba(0, 0, 0, 0.7);
  }
  .fs-num { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }

  /* ---- panel: one big instrument plate ---- */
  .fs-pt-panel {
    position: relative;
    width: 92%;
    max-width: 1178px;
    height: 92%;
    max-height: 662px;
    /* Was gold, the only gold surface in the game outside the win colours. */
    --sig: var(--hud-accent);
    display: flex;
    flex-direction: column;
  }
  .fs-pt-panel > .fs-face {
    position: absolute;
    inset: 2px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    overflow: hidden;
  }
  .fs-pt-panel .fs-rail { top: 16px; bottom: 16px; width: 4px; box-shadow: 0 0 10px var(--sig-gold); }

  /* header */
  .fs-pt-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 26px;
    border-bottom: 1px solid var(--hud-border);
    flex-shrink: 0;
  }
  .fs-pt-title {
    font-size: 1.35rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    /* A gold-to-orange gradient clipped to the title text. The shell's rule is
       that headings are text, not decoration. */
    color: var(--hud-text);
  }
  /* R120: was 38x38, under docs/HUD_SPEC.md's own 44px touch floor, and NO gate
     measures it - the spec's rule 3 scopes to the HUD banner, so the modal's
     close never came under it. Raised to 44, which is the figure this project
     adopted from Apple's HIG and holds itself to elsewhere. Geometry outside the
     locked HUD, so nothing in HUD_SPEC moves. */
  .fs-pt-close { width: 44px; height: 44px; padding: 1px; border: none; cursor: pointer; flex-shrink: 0; }
  .fs-pt-close > .fs-face { color: var(--hud-text-dim); font-size: 0.9rem; }
  .fs-pt-close:hover > .fs-face { color: var(--hud-text); }
  /* Sized in em off the font-size the glyph used, and stroked in currentColor,
     so the existing colour and hover rules above keep working untouched. */
  .fs-close-glyph { width: 1.05em; height: 1.05em; display: block; }
  .fs-close-glyph path { fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; }

  /* body */
  .fs-pt-body {
    overflow-y: auto;
    padding: 20px 30px 30px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--acc) 45%, transparent) transparent;
  }
  .fs-pt-body::-webkit-scrollbar { width: 8px; }
  .fs-pt-body::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--acc) 40%, transparent); border-radius: 4px; }

  .fs-heading {
    font-size: 0.8rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--hud-text-dim);
  }

  /* how-to-win + ways callout */
  .fs-htw { --sig: var(--hud-accent); }
  .fs-htw > .fs-face { padding: 16px 20px; gap: 6px; flex-direction: column; align-items: flex-start; }
  .fs-htw h4 { font-size: 1rem; font-weight: 700; color: #fff; line-height: 1.4; margin: 0; }
  .fs-htw p { font-size: 0.82rem; color: color-mix(in srgb, var(--sig-cyan) 60%, #fff); margin: 0; }
  .fs-ways-callout {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    margin-top: 6px; align-self: center; padding: 10px 24px; --sig: var(--hud-accent);
  }
  .fs-ways-callout > .fs-face { padding: 8px 22px; }
  /* 1,024 is the single biggest number in this modal and it was gold-on-metal,
     the loudest thing left after the panel came down. It is a VALUE, so it gets
     the same near-white every other value in the game now gets. */
  .fs-ways-num { font-size: 2.3rem; font-weight: 900; line-height: 1; color: var(--hud-text); text-shadow: none; }
  .fs-ways-lbl { font-size: 0.62rem; letter-spacing: 0.22em; color: var(--hud-text-dim); }

  /* ways diagram */
  .fs-ways-diagram { --sig: var(--hud-accent); }
  .fs-ways-diagram > .fs-face { flex-direction: row; gap: 0; padding: 14px 18px; }
  .fs-way-cell {
    width: 56px; height: 56px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 1.1rem; color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.04); border: 2px solid rgba(255, 255, 255, 0.12);
  }
  .fs-way-cell.matched {
    color: var(--hud-accent); border-color: var(--hud-accent);
    background: color-mix(in srgb, var(--hud-accent) 10%, transparent);
    box-shadow: 0 0 14px color-mix(in srgb, var(--hud-accent) 45%, transparent);
  }
  .fs-way-arrow { font-size: 1.3rem; padding: 0 8px; color: rgba(255, 255, 255, 0.2); display: inline-flex; align-items: center; }
  /* The arrow was `→`, U+2192, absent from the Orbitron subset. Drawn now, and
     the matched glow moves from text-shadow to drop-shadow because a stroked
     path takes the second and not the first. QUALITY_CHARTER.md Q-06. */
  .fs-way-arrow svg { width: 1em; height: 1em; display: block; }
  .fs-way-arrow svg path { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .fs-way-arrow.matched { color: var(--acc); filter: drop-shadow(0 0 8px var(--acc)); }
  .fs-caption { font-size: 0.72rem; color: rgba(255, 255, 255, 0.55); text-align: center; line-height: 1.4; margin: 6px 0 0; }

  /* symbol grid */
  .fs-sym-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
  .fs-sym-card { --sig: var(--sig-cyan); }
  .fs-sym-card.tier-h { --sig: var(--sig-gold); }
  .fs-sym-card.tier-m { --sig: var(--sig-cyan); }
  .fs-sym-card.tier-l { --sig: #8fa6b4; }
  .fs-sym-card.tier-w { --sig: var(--sig-pink); }
  .fs-sym-card.tier-s { --sig: var(--sig-orange); }
  .fs-sym-card > .fs-face { padding: 14px 10px; gap: 6px; align-items: center; }
  .fs-sym-card img { width: 78px; height: 78px; object-fit: contain; filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5)); }
  .fs-sym-name { font-size: 0.82rem; font-weight: 800; letter-spacing: 0.08em; color: #fff; }
  .fs-pay-rows { display: flex; flex-direction: column; gap: 2px; width: 100%; padding: 0 14px; }
  .fs-pay-row { display: flex; align-items: baseline; justify-content: space-between; }
  .fs-pay-count { font-size: 0.62rem; color: rgba(255, 255, 255, 0.42); letter-spacing: 0.05em; }
  .fs-pay-val { font-size: 0.9rem; font-weight: 700; color: color-mix(in srgb, var(--sig-green) 30%, #fff); text-shadow: 0 0 3px color-mix(in srgb, var(--sig-green) 55%, transparent); }
  .fs-sym-note { font-size: 0.68rem; font-style: italic; text-align: center; line-height: 1.35; color: color-mix(in srgb, var(--sig) 55%, #fff); }

  /* rules */
  .fs-rules { list-style: none; display: flex; flex-direction: column; gap: 6px; padding: 0; margin: 0; }
  .fs-rules li { font-size: 0.84rem; color: rgba(255, 255, 255, 0.62); padding-left: 16px; position: relative; line-height: 1.5; }
  .fs-rules li::before { content: '›'; position: absolute; left: 0; color: color-mix(in srgb, var(--sig-gold) 60%, transparent); }

  /* trigger table */
  .fs-trig { width: 100%; max-width: 440px; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  .fs-trig th {
    font-size: 0.64rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0 0 6px;
    color: color-mix(in srgb, var(--sig-gold) 62%, #fff); border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .fs-trig td {
    text-align: center; padding: 8px 0; font-weight: 700;
    color: color-mix(in srgb, var(--acc) 40%, #fff); border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* buy callout */
  .fs-buy { --sig: var(--sig-pink); align-self: stretch; }
  .fs-buy > .fs-face { flex-direction: row; align-items: center; justify-content: space-between; padding: 12px 20px; }
  .fs-buy-lbl { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; color: color-mix(in srgb, var(--sig-gold) 82%, #fff); }
  .fs-buy-val { font-size: 1.1rem; font-weight: 900; color: #ffd6f2; text-shadow: 0 0 3px var(--sig-pink); }

  /* Bet Modes (2026-07-15 neon polish pass, item 6): centred mode cards in
     a responsive grid, replacing the old left-justified row list. */
  .fs-mode-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
  .fs-mode-card { --sig: var(--sig-cyan); }
  .fs-mode-card.tone-standing { --sig: var(--sig-cyan); }
  .fs-mode-card.tone-enhancer { --sig: var(--sig-orange); }
  .fs-mode-card.tone-buy { --sig: var(--sig-pink); }
  .fs-mode-card > .fs-face {
    flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 16px 14px;
  }
  .fs-mode-card.soon { filter: grayscale(0.5) brightness(0.74); opacity: 0.72; }
  .fs-mode-card-name-row { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
  .fs-mode-name { font-size: 0.9rem; font-weight: 800; letter-spacing: 0.04em; color: #fff; }
  .fs-mode-soon {
    font-size: 0.5rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    color: #d8e2ea; background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px; padding: 0.12rem 0.5rem; white-space: nowrap;
  }
  .fs-mode-blurb { font-size: 0.74rem; color: rgba(255, 255, 255, 0.6); line-height: 1.4; margin: 0; }
  .fs-mode-card-stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;
    padding-top: 8px; border-top: 1px solid color-mix(in srgb, var(--sig) 25%, transparent);
  }
  .fs-mode-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0; }
  .fs-mode-stat-label {
    font-size: 0.56rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(200, 220, 235, 0.6); white-space: nowrap;
  }
  /* R059 GOVERNING RULE: ellipsis on money is banned; these two carried it
     over the buy tiers' PRICE cell, the exact class the card's own stacked
     layout comment was written against. The values now fit through
     autofitText with the scale multiplied in. */
  .fs-mode-stat-value {
    font-size: calc(0.72rem * var(--autofit-scale, 1)); font-weight: 700; color: color-mix(in srgb, var(--sig) 55%, #fff);
    white-space: nowrap; max-width: 100%; overflow: hidden;
  }
  .fs-mode-stat-subvalue {
    font-size: calc(0.6rem * var(--autofit-scale, 1)); font-weight: 600; color: rgba(230, 240, 250, 0.65);
    white-space: nowrap; max-width: 100%; overflow: hidden;
  }

  /* ── Interface Guide ──────────────────────────────────────────────── */
  .fs-guide-list { display: flex; flex-direction: column; gap: 10px; }
  .fs-guide-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 16px;
    /* R120: the interface-guide rows were the ONE surface in this modal that
       shared no vocabulary with anything else - a flat cyan-tinted box, while
       every other row in here is a plate. Now the same sunken glass and neutral
       hairline as the rest of the shell. */
    background: var(--hud-surface-sunken);
    border: 1px solid var(--hud-border);
    border-radius: 10px;
  }
  .fs-guide-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--hud-surface-raised);
    border: 1px solid var(--hud-border);
    border-radius: 8px;
  }
  .fs-guide-img { width: 44px; height: 44px; object-fit: contain; }

  /* FS VISUAL FIXPACK JOB 2: the speed row shows three captures, one per speed,
     so its slot widens rather than squeezing three icons into a 56px box. The
     row is `min-width: 0` on its text side, so the description reflows instead
     of pushing the panel wider; verified at Popout S, where the paytable is at
     its narrowest. */
  .fs-guide-icon--set {
    width: auto;
    gap: 6px;
    padding: 0 8px;
  }
  .fs-guide-icon--set .fs-guide-img { width: 34px; height: 34px; }
  @media (max-width: 420px) {
    .fs-guide-icon--set { gap: 4px; padding: 0 5px; }
    .fs-guide-icon--set .fs-guide-img { width: 28px; height: 28px; }
  }

  /* R125. The FEATURES control is a 130x44 pill, not a round button, so only its
     SLOT widens - the image keeps the same 44px height every other row uses, and
     releases its width instead. Nothing about its scale is special-cased: the
     capture fills 82.0% of its frame's height, which sits between spin_button
     (84.0%) and btn_turbo (76.0%), so at a shared 44px it renders a control of
     the same visible size as its neighbours rather than a larger or smaller one.
     Measured from the shipped files, not assumed.
     Width: 44 x 2.25 aspect = 99px + 16px padding = 115px, which is NARROWER
     than the three-up speed row's slot (130px) that this list already carries
     and that is already proven at Popout S. The text side of the row is
     `min-width: 0`, so the description reflows rather than widening the panel. */
  .fs-guide-icon--wide { width: auto; padding: 0 8px; }
  .fs-guide-icon--wide .fs-guide-img { width: auto; height: 44px; }
  @media (max-width: 420px) {
    .fs-guide-icon--wide { padding: 0 5px; }
    .fs-guide-icon--wide .fs-guide-img { height: 36px; }
  }
  .fs-guide-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem 0.6rem;
    font-family: var(--fs-font-display);
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #05070f;
    background: linear-gradient(135deg, var(--sig-cyan), color-mix(in srgb, var(--sig-cyan) 60%, #0090aa));
    border-radius: 999px;
    box-shadow: 0 0 10px color-mix(in srgb, var(--sig-cyan) 45%, transparent);
  }
  .fs-guide-text { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 0; text-align: left; }
  .fs-guide-name { font-size: 0.86rem; font-weight: 800; color: #fff; letter-spacing: 0.02em; }
  .fs-guide-desc { font-size: 0.76rem; color: rgba(255, 255, 255, 0.6); line-height: 1.4; }

  /* RTP */
  .fs-rtp { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
  .fs-rtp-row { --sig: var(--sig-gold); }
  .fs-rtp-row > .fs-face { flex-direction: row; align-items: center; justify-content: space-between; padding: 12px 18px; }
  .fs-rtp-lbl { font-size: 0.66rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; color: color-mix(in srgb, var(--sig-gold) 58%, #fff); }
  .fs-rtp-val { font-size: 1.1rem; font-weight: 900; color: #fff2c2; text-shadow: 0 0 3px var(--sig-gold); }

  .fs-disc { font-size: 0.72rem; line-height: 1.55; color: rgba(255, 255, 255, 0.5); margin: 0; }

  /* Overdrive: whole modal warms, gold rail -> magenta bloom */
  /* The modal keeps its Overdrive signal, now through the same accent the rest
     of the shell flips to, and without the second orange bloom. */
  .fs-pt--overdrive .fs-pt-panel { --sig: var(--theme-secondary, #FF2EC4); }
  .fs-pt--overdrive .fs-pt-panel .fs-rail { box-shadow: 0 0 10px color-mix(in srgb, var(--sig) 55%, transparent); }
  .fs-pt--overdrive .fs-pt-body { filter: saturate(1.06) hue-rotate(-4deg); }

  /* small viewports */
  @media (max-width: 500px) {
    .fs-pt-body { padding: 14px 16px 20px; gap: 16px; }
    .fs-sym-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
    .fs-sym-card img { width: 64px; height: 64px; }
    /* 2026-07-14 portrait pass: the 5-cell ways-to-win adjacency diagram
       (5x56px cells + 4 arrows, ~464px total) overflowed at 390-430px
       viewports, cropping the outer cells - caught via the committed
       portrait-v1 paytable screenshot. Shrunk to fit within the panel's
       ~92%-width content box on real phones. */
    .fs-way-cell { width: 40px; height: 40px; font-size: 0.95rem; }
    .fs-way-arrow { font-size: 1.05rem; padding: 0 4px; }
    .fs-ways-diagram > .fs-face { padding: 12px 8px; }
  }

  /* R059 TASK 4: Mobile S. At 320 wide the 40px step above still overflowed
     the plate's content box and the CENTRED flex row split the overflow both
     ways, cropping the LEADING 1 (the owner's capture; the same
     centred-overflow trap the replay container's own comment records). Two
     repairs: a tighter step so the sequence physically fits 320, and `safe`
     centring so if anything ever overflows again it is the trailing edge a
     reader can infer, never the leading digit that anchors the sequence. */
  @media (max-width: 360px) {
    .fs-way-cell { width: 32px; height: 32px; font-size: 0.8rem; flex: 0 0 auto; }
    .fs-way-arrow { font-size: 0.85rem; padding: 0 2px; }
    .fs-ways-diagram > .fs-face { padding: 10px 4px; justify-content: safe center; min-width: 0; }
  }
</style>
