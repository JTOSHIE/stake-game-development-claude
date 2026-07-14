<script lang="ts">
  // PaytableModal.svelte — full-page paytable, B3 reskin.
  // Rebuilt on the B1 chrome vocabulary (.fs-plate / .fs-rail / .fs-knob /
  // .fs-face): a single brushed-steel instrument plate holding the how-to-win
  // banner, the WAYS TO WIN adjacency diagram, the symbol payouts grid, the
  // rules, the Overdrive trigger table + buy callout, the RTP rows and the
  // seven-point disclaimer, all scrollable. Fills ~92% of the fixed 1280x720
  // stage (scales with S via the transformed ancestor, which also re-anchors
  // this modal's `position: fixed`). All colour comes from the 5 scheme tokens,
  // so a new skin is one scheme block; base and Overdrive states are supported.
  // Fonts are the globally self-hosted Orbitron (@fontsource, see main.ts) — no
  // external font CDN (Stake Engine compliance).
  import { showPaytable, betAmount, currencyCode } from '../stores/gameStore'
  import { themeAssets } from '../stores/themeStore'
  import { tr } from '../i18n/tr'
  import { isSocial } from '../stores/socialMode'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { playClick } from '../services/soundService'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { overdriveVisual } from '../stores/overdriveVisual'
  import { FS_MODES, FS_RTP_LABEL, FS_MAX_WIN_LABEL } from '../config/fsModes'

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
  $: waysLabel = $isSocial ? 'WAYS' : 'WAYS TO WIN'

  $: rulesList = $isSocial
    ? [
        'Prizes pay left to right on adjacent reels starting from reel 1.',
        'Symbol values shown are per matching way; the total is that value times the number of ways times your play.',
        'WILD substitutes for all symbols except SCATTER.',
        '3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total play prize.',
        'Maximum prize per play is capped at 5,000× your total play.',
        'Malfunctions void all pays and plays.',
      ]
    : [
        'Wins pay left to right on adjacent reels starting from reel 1.',
        'Symbol values shown are per matching way; the total is that value times the number of ways times your bet.',
        'WILD substitutes for all symbols except SCATTER.',
        '3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.',
        'Maximum win per spin is capped at 5,000× your total bet.',
        'Malfunctions void all pays and plays.',
      ]

  $: disclaimerText = $isSocial
    ? 'Malfunction voids all prizes and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Prizes are settled according to the result returned by the Remote Game Server, not from events shown in the web browser. Future Spinner™ and We Roll Spinners™ are trademarks of We Roll Spinners. © 2026 We Roll Spinners. All rights reserved.'
    : 'Malfunction voids all wins and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Winnings are settled according to the result returned by the Remote Game Server, not from events shown in the web browser. Future Spinner™ and We Roll Spinners™ are trademarks of We Roll Spinners. © 2026 We Roll Spinners. All rights reserved.'

  // Symbol pay table — per-way multipliers, matching the validated maths in
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

  // Interface Guide — each game control with its rendered UI art and a
  // one-line description. `kind: 'img'` rows use the theme's UI PNGs; `kind:
  // 'pill'` rows have no dedicated art and render a styled text token instead.
  const INTERFACE_GUIDE = [
    { kind: 'img',  file: 'spin_button.png',   name: 'Spin',         desc: 'Start a spin at the current bet.' },
    { kind: 'img',  file: 'btn_bet_plus.png',  name: 'Increase Bet', desc: 'Raise your bet to the next level.' },
    { kind: 'img',  file: 'btn_bet_minus.png', name: 'Decrease Bet', desc: 'Lower your bet to the previous level.' },
    { kind: 'img',  file: 'feature_button.png',name: 'Features',     desc: 'Open the FEATURES menu to pick a bet mode or buy the feature.' },
    { kind: 'img',  file: 'btn_autoplay.png',  name: 'Autoplay',     desc: 'Spin automatically with optional loss and win limits.' },
    { kind: 'img',  file: 'btn_menu.png',      name: 'Menu',         desc: 'Open the menu for the paytable and sound settings.' },
    { kind: 'pill', label: 'TURBO',            name: 'Turbo',        desc: 'Speed up spins.' },
    { kind: 'pill', label: 'MAX',              name: 'Max Bet',      desc: 'Bet the maximum.' },
  ] as const

  // Buy price — 100x current bet, only meaningful where the buy is not disabled.
  $: buyPriceLabel = formatBalance(Math.round($betAmount * 100 * CURRENCY_SCALE), $currencyCode || 'USD')

  // Bet Modes section — every mode priced against the current bet, straight from
  // the single source of truth (config/fsModes.ts). Placeholder modes (maths not
  // yet shipped) are tagged "coming soon"; RTP is the same across all modes.
  $: modePrice = (cost: number) =>
    formatBalance(Math.round($betAmount * cost * CURRENCY_SCALE), $currencyCode || 'USD')
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="fs-pt"
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
          <span class="fs-face">✕</span>
        </button>
      </div>

      <!-- ── Scrollable body ───────────────────────────────────────── -->
      <div class="fs-pt-body">

        <!-- How-to-win banner + ways callout -->
        <div class="fs-htw fs-plate">
          <div class="fs-face">
            <h4>Match symbols on adjacent reels starting from reel 1 (left to right).</h4>
            <p>All matching symbol positions count — no fixed paylines.</p>
            <div class="fs-ways-callout fs-plate">
              <div class="fs-face">
                <span class="fs-ways-num fs-num">1,024</span>
                <span class="fs-ways-lbl">{waysLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- WAYS TO WIN — adjacent-reels diagram, reads left to right from reel 1 -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:10px;">{waysLabel}</h3>
          <div class="fs-ways-diagram fs-plate" role="img" aria-label="A matching way reads left to right across adjacent reels, starting from reel 1">
            <div class="fs-face">
              {#each [1, 2, 3, 4, 5] as reelNum, i}
                <div style="display:flex;align-items:center;">
                  <div class="fs-way-cell" class:matched={i < 3}>{reelNum}</div>
                  {#if i < 4}
                    <span class="fs-way-arrow" class:matched={i < 2}>→</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
          <p class="fs-caption">Reels 1, 2 and 3 hold the same symbol (highlighted) — a match, read left to right from reel 1. Reels 4 and 5 are not required.</p>
        </div>

        <!-- Symbol payouts -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:10px;">Symbol Payouts</h3>
          <div class="fs-sym-grid">
            {#each SYMBOLS as sym}
              <div class="fs-sym-card fs-plate {TIER_CLASS[sym.name]}">
                <div class="fs-face">
                  <img src="{$themeAssets.assetBase}/symbols/{sym.file}.png" alt={sym.name} />
                  <span class="fs-sym-name">{sym.name}</span>
                  {#if sym.name === 'SCAT'}
                    <span class="fs-sym-note">3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins</span>
                  {:else if sym.name === 'WILD'}
                    <span class="fs-sym-note">Substitutes for all symbols except SCATTER</span>
                  {:else}
                    <div class="fs-pay-rows">
                      <div class="fs-pay-row"><span class="fs-pay-count">3×</span><span class="fs-pay-val fs-num">{sym.pays[2] ?? '—'}</span></div>
                      <div class="fs-pay-row"><span class="fs-pay-count">4×</span><span class="fs-pay-val fs-num">{sym.pays[3] ?? '—'}</span></div>
                      <div class="fs-pay-row"><span class="fs-pay-count">5×</span><span class="fs-pay-val fs-num">{sym.pays[4] ?? '—'}</span></div>
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
          <table class="fs-trig" aria-label="Overdrive trigger table">
            <thead>
              <tr><th>Scatters</th><th>Free Spins</th><th>Instant Award</th></tr>
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

        <!-- Bet Modes — every mode from the single source of truth (fsModes.ts).
             All five are live since FeatureMath v2 (2026-07-07): Normal, Cruise,
             OVERBOOST, Buy Overdrive, NITRO OVERDRIVE. All share the same
             96.35% RTP; the `soon` tag/branch remains for any future mode
             added ahead of its maths shipping. -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:10px;">Bet Modes</h3>
          <div class="fs-modes">
            {#each FS_MODES as m (m.id)}
              <div class="fs-mode-row fs-plate tone-{m.kind}" class:soon={!m.available}>
                <div class="fs-face">
                  <div class="fs-mode-main">
                    <div class="fs-mode-name-row">
                      <span class="fs-mode-name">{m.label}</span>
                      {#if !m.available}
                        <span class="fs-mode-soon">coming soon</span>
                      {/if}
                    </div>
                    <p class="fs-mode-blurb">{m.blurb}</p>
                  </div>
                  <div class="fs-mode-meta">
                    <span class="fs-mode-cost fs-num">{m.cost}× · {modePrice(m.cost)}</span>
                    <span class="fs-mode-rtp">RTP {FS_RTP_LABEL} · Max Win {FS_MAX_WIN_LABEL}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- ── Interface Guide — every game control explained ────────────── -->
        <div data-testid="interface-guide">
          <h3 class="fs-heading" style="margin-bottom:10px;">Interface Guide</h3>
          <div class="fs-guide-list">
            {#each INTERFACE_GUIDE as g}
              <div class="fs-guide-row">
                <div class="fs-guide-icon">
                  {#if g.kind === 'img'}
                    <img src="{$themeAssets.assetBase}/ui/{g.file}" alt={g.name} class="fs-guide-img" />
                  {:else}
                    <span class="fs-guide-pill">{g.label}</span>
                  {/if}
                </div>
                <div class="fs-guide-text">
                  <span class="fs-guide-name">{g.name}</span>
                  <span class="fs-guide-desc">{g.desc}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- RTP — identical across all five modes (0.5% cross-mode rule) + max win -->
        <div class="fs-rtp">
          <div class="fs-rtp-row fs-plate"><div class="fs-face"><span class="fs-rtp-lbl">RTP (All 5 Modes)</span><span class="fs-rtp-val fs-num">{FS_RTP_LABEL}</span></div></div>
          <div class="fs-rtp-row fs-plate"><div class="fs-face"><span class="fs-rtp-lbl">Max Win</span><span class="fs-rtp-val fs-num">{FS_MAX_WIN_LABEL}</span></div></div>
        </div>

        <!-- Responsible play — the autoplay stop-conditions actually available
             in the HUD's auto-menu (HudOverlay.svelte's startAuto()). Kept
             factual and scoped to what the player can actually set here. -->
        <div>
          <h3 class="fs-heading" style="margin-bottom:6px;">Responsible Play</h3>
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
          <h3 class="fs-heading" style="margin-bottom:6px;">Disclaimer</h3>
          <p class="fs-disc">{disclaimerText}</p>
        </div>

      </div><!-- /fs-pt-body -->
    </div><!-- /fs-face -->
  </div><!-- /fs-pt-panel -->
</div>

<style>
  /* ==========================================================================
     FUTURE SPINNER — B3 PAYTABLE RESKIN
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
    /* Fixed (not absolute): App.svelte's transform:scale re-anchors position:fixed
       descendants to the 1280x720 stage, so this covers the stage exactly. */
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(3px);
    font-family: 'Orbitron', system-ui, sans-serif;
  }

  /* Swappable schemes — identical token set to the HUD (template layer). */
  .fs-pt.scheme-trap  { --sig-cyan: #39ff14; --sig-pink: #ff7a1a; --sig-gold: #ebff5a; --sig-orange: #ff6600; --sig-green: #b6ff3c; }
  .fs-pt.scheme-oil   { --sig-cyan: #ff8a3d; --sig-pink: #d9a86a; --sig-gold: #f5d061; --sig-orange: #ff5a1f; --sig-green: #f0b24a; }
  .fs-pt.scheme-pitch { --sig-cyan: #2fd24f; --sig-pink: #ffd700; --sig-gold: #ede7c8; --sig-orange: #4ce06b; --sig-green: #5be07a; }
  .fs-pt--overdrive   { --acc: var(--sig-pink); --acc2: var(--sig-orange); }

  /* ---- shared chrome primitives (same as B1) ---- */
  .fs-plate {
    position: relative;
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
  .fs-way-arrow { font-size: 1.3rem; padding: 0 8px; color: rgba(255, 255, 255, 0.2); }
  .fs-way-arrow.matched { color: var(--acc); text-shadow: 0 0 8px var(--acc); }
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

  /* Bet Modes */
  .fs-modes { display: flex; flex-direction: column; gap: 10px; }
  .fs-mode-row { --sig: var(--sig-cyan); }
  .fs-mode-row.tone-standing { --sig: var(--sig-cyan); }
  .fs-mode-row.tone-enhancer { --sig: var(--sig-orange); }
  .fs-mode-row.tone-buy { --sig: var(--sig-pink); }
  .fs-mode-row > .fs-face { flex-direction: row; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 18px; }
  .fs-mode-row.soon { filter: grayscale(0.5) brightness(0.74); opacity: 0.72; }
  .fs-mode-main { flex: 1; min-width: 0; text-align: left; }
  .fs-mode-name-row { display: flex; align-items: center; gap: 0.5rem; }
  .fs-mode-name { font-size: 0.9rem; font-weight: 800; letter-spacing: 0.04em; color: #fff; }
  .fs-mode-soon {
    font-size: 0.5rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    color: #d8e2ea; background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px; padding: 0.12rem 0.5rem; white-space: nowrap;
  }
  .fs-mode-blurb { font-size: 0.74rem; color: rgba(255, 255, 255, 0.6); line-height: 1.4; margin: 0.24rem 0 0; }
  .fs-mode-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .fs-mode-cost { font-size: 0.78rem; font-weight: 700; color: #ffd66a; white-space: nowrap; }
  .fs-mode-rtp { font-size: 0.6rem; letter-spacing: 0.06em; text-transform: uppercase; color: color-mix(in srgb, var(--sig-gold) 55%, #fff); white-space: nowrap; }

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
  .fs-guide-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem 0.6rem;
    font-family: 'Orbitron', sans-serif;
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
  }
</style>
