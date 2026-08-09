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
  import { themeAssets } from '../stores/themeStore'
  import { tr } from '../i18n/tr'
  import { isSocial } from '../stores/socialMode'
  // The single social-aware vocabulary layer (R2R JOB 6 / TR-041).
  import { sv } from '../i18n/vocabulary'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { playClick } from '../services/soundService'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { overdriveVisual } from '../stores/overdriveVisual'
  import { FS_MODES, fsRtpLabel, fsMaxWinLabel, fsCostLabel, maxWinVsBaseBetLabel } from '../config/fsModes'

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

  // JOB 2, 2026-07-28. The body is now one key in all sixteen locales. The
  // TRADEMARK SENTENCE is deliberately NOT translated and is appended here: it
  // names the marks as registered and the copyright line is a legal notice,
  // both of which are asserted in the language they were filed in. Translating
  // a trademark notice weakens it, so this split is intentional rather than a
  // string that was missed.
  $: disclaimerText = $tr('disclaimerBody')
    + ' Future Spinner\u2122 and We Roll Spinners\u2122 are trademarks of We Roll Spinners.'
    + ' \u00A9 2026 We Roll Spinners. All rights reserved.'

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
    { kind: 'img',  files: ['feature_button.png'], nameKey: 'guideFeaturesName',  descKey: 'guideFeaturesDesc' },
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

  $: buyPriceLabel = formatBalance(Math.round($betAmount * 100 * CURRENCY_SCALE), $currencyCode || 'USD', $locale)

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
                <span class="fs-ways-num fs-num">1,024</span>
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
                      <div class="fs-pay-row"><span class="fs-pay-count">3×</span><span class="fs-pay-val fs-num">{sym.pays[2] ?? '-'}</span></div>
                      <div class="fs-pay-row"><span class="fs-pay-count">4×</span><span class="fs-pay-val fs-num">{sym.pays[3] ?? '-'}</span></div>
                      <div class="fs-pay-row"><span class="fs-pay-count">5×</span><span class="fs-pay-val fs-num">{sym.pays[4] ?? '-'}</span></div>
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
              <tr><th>Scatters</th><th>{$tr('colFreeSpins')}</th><th>{$tr('colInstantAward')}</th></tr>
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
                      <span class="fs-mode-stat-value fs-num">{fsCostLabel(m.cost, $locale)}</span>
                      <span class="fs-mode-stat-subvalue fs-num">{modePrice(m.cost)}</span>
                    </div>
                    <div class="fs-mode-stat">
                      <span class="fs-mode-stat-label">RTP</span>
                      <span class="fs-mode-stat-value fs-num">{fsRtpLabel($locale)}</span>
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
                      <span class="fs-mode-stat-value fs-num">{fsMaxWinLabel($locale)}</span>
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
                <div class="fs-guide-icon" class:fs-guide-icon--set={g.files.length > 1}>
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
          <p class="fs-disc">
            Autoplay can be set to stop automatically on any win, when the
            Overdrive feature triggers, or once a loss limit you choose is
            reached, and can always be stopped manually at any time. A session
            summary (time played, spins, net result) is available from the
            menu.
          </p>
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

  /* Swappable schemes, identical token set to the HUD (template layer). */
  .fs-pt.scheme-trap  { --sig-cyan: #39ff14; --sig-pink: #ff7a1a; --sig-gold: #ebff5a; --sig-orange: #ff6600; --sig-green: #b6ff3c; }
  .fs-pt.scheme-oil   { --sig-cyan: #ff8a3d; --sig-pink: #d9a86a; --sig-gold: #f5d061; --sig-orange: #ff5a1f; --sig-green: #f0b24a; }
  .fs-pt.scheme-pitch { --sig-cyan: #2fd24f; --sig-pink: #ffd700; --sig-gold: #ede7c8; --sig-orange: #4ce06b; --sig-green: #5be07a; }
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
    padding: 2px;
    clip-path: polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px));
    background: linear-gradient(150deg, #eef5fa, #b3c6d2 15%, #63737f 37%, #2b363f 52%, #8499a8 72%, #dceaf2);
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.6),
      0 0 9px color-mix(in srgb, var(--sig) 20%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.35);
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
    background:
      linear-gradient(160deg, color-mix(in srgb, var(--sig) 12%, transparent), transparent 44%),
      linear-gradient(180deg, #111a2b, #070b16);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), inset 0 -8px 18px rgba(0, 0, 0, 0.6);
  }
  .fs-rail {
    position: absolute;
    left: 2px;
    top: 9px;
    bottom: 9px;
    width: 3px;
    border-radius: 2px;
    z-index: 2;
    background: var(--sig);
    box-shadow: 0 0 8px var(--sig);
  }
  .fs-knob {
    border-radius: 50%;
    padding: 3px;
    position: relative;
    background: conic-gradient(from 216deg, #e7f1f7, #93a7b5, #39454f, #728593, #eef5fa, #4f5f6b, #a9bcc8, #e7f1f7);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.55);
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
    --sig: var(--sig-gold);
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
    border-bottom: 1px solid color-mix(in srgb, var(--sig-gold) 22%, transparent);
    flex-shrink: 0;
  }
  .fs-pt-title {
    font-size: 1.35rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    background: linear-gradient(135deg, var(--sig-gold), var(--sig-orange));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .fs-pt-close { width: 38px; height: 38px; padding: 3px; border: none; cursor: pointer; flex-shrink: 0; }
  .fs-pt-close > .fs-face { color: #cfe6f2; font-size: 0.9rem; }
  .fs-pt-close:hover > .fs-face { color: #fff; filter: brightness(1.2); }
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
    color: color-mix(in srgb, var(--sig-gold) 78%, #fff);
  }

  /* how-to-win + ways callout */
  .fs-htw { --sig: var(--sig-cyan); }
  .fs-htw > .fs-face { padding: 16px 20px; gap: 6px; flex-direction: column; align-items: flex-start; }
  .fs-htw h4 { font-size: 1rem; font-weight: 700; color: #fff; line-height: 1.4; margin: 0; }
  .fs-htw p { font-size: 0.82rem; color: color-mix(in srgb, var(--sig-cyan) 60%, #fff); margin: 0; }
  .fs-ways-callout {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    margin-top: 6px; align-self: center; padding: 10px 24px; --sig: var(--sig-gold);
  }
  .fs-ways-callout > .fs-face { padding: 8px 22px; }
  .fs-ways-num { font-size: 2.3rem; font-weight: 900; line-height: 1; color: #fff2c2; text-shadow: 0 0 3px var(--sig-gold); }
  .fs-ways-lbl { font-size: 0.62rem; letter-spacing: 0.22em; color: color-mix(in srgb, var(--sig-gold) 70%, #fff); }

  /* ways diagram */
  .fs-ways-diagram { --sig: var(--sig-cyan); }
  .fs-ways-diagram > .fs-face { flex-direction: row; gap: 0; padding: 14px 18px; }
  .fs-way-cell {
    width: 56px; height: 56px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 1.1rem; color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.04); border: 2px solid rgba(255, 255, 255, 0.12);
  }
  .fs-way-cell.matched {
    color: var(--acc); border-color: var(--acc);
    background: color-mix(in srgb, var(--acc) 10%, transparent);
    box-shadow: 0 0 14px color-mix(in srgb, var(--acc) 45%, transparent);
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
  .fs-mode-stat-value {
    font-size: 0.72rem; font-weight: 700; color: color-mix(in srgb, var(--sig) 55%, #fff);
    white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
  }
  .fs-mode-stat-subvalue {
    font-size: 0.6rem; font-weight: 600; color: rgba(230, 240, 250, 0.65);
    white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Interface Guide ──────────────────────────────────────────────── */
  .fs-guide-list { display: flex; flex-direction: column; gap: 10px; }
  .fs-guide-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 16px;
    background: color-mix(in srgb, var(--sig-cyan) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--sig-cyan) 16%, transparent);
    border-radius: 10px;
  }
  .fs-guide-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.1);
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
  .fs-pt--overdrive .fs-pt-panel { --sig: var(--sig-pink); }
  .fs-pt--overdrive .fs-pt-panel .fs-rail { box-shadow: 0 0 12px var(--sig-pink), 0 0 22px color-mix(in srgb, var(--sig-orange) 40%, transparent); }
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
</style>
