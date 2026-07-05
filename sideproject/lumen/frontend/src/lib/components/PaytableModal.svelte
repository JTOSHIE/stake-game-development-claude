<script lang="ts">
  // PaytableModal.svelte — full-page paytable (LAYOUT_SPEC UX polish v2).
  // Fills ~92% of the 1280x720 stage (scales with S via the transformed
  // ancestor, which also re-anchors this modal's `position: fixed`). Big,
  // named symbol cards (240 exports) laid out 4-across, a THE BLOOM trigger
  // table, a WAYS TO WIN adjacency diagram, an Interface Guide, RTP for both
  // modes, and the existing seven-point disclaimer, all scrollable.
  import { showPaytable, betAmount, currencyCode } from '../stores/gameStore'
  import { themeAssets } from '../stores/themeStore'
  import { tr } from '../i18n/tr'
  import { isSocial } from '../stores/socialMode'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { playClick } from '../services/soundService'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { LUMEN_MODES, LUMEN_RTP_LABEL, LUMEN_MAX_WIN_LABEL } from '../config/lumenModes'

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
        '3, 4, or 5 Spore SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total play prize.',
        'Maximum prize per play is capped at 10,000× your total play.',
        'Malfunctions void all pays and plays.',
      ]
    : [
        'Wins pay left to right on adjacent reels starting from reel 1.',
        'Symbol values shown are per matching way; the total is that value times the number of ways times your bet.',
        'WILD substitutes for all symbols except SCATTER.',
        '3, 4, or 5 Spore SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.',
        'Maximum win per spin is capped at 10,000× your total bet.',
        'Malfunctions void all pays and plays.',
      ]

  $: disclaimerText = $isSocial
    ? 'Malfunction voids all prizes and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Prizes are settled according to the result returned by the Remote Game Server, not from events shown in the web browser. LUMEN™ is a trademark of its studio. © 2026. All rights reserved.'
    : 'Malfunction voids all wins and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Winnings are settled according to the result returned by the Remote Game Server, not from events shown in the web browser. LUMEN™ is a trademark of its studio. © 2026. All rights reserved.'

  // Symbol pay table — per-way multipliers, matching the validated maths in
  // games/lumen exactly. Final payout = paytable value x ways count x bet.
  // pays array is [_, _, 3-of, 4-of, 5-of]. Wild substitutes for all symbols
  // and has no independent pay; Scatter pays via the scatter table. Icons
  // resolve to the active theme's exact-size vector exports (large paytable
  // cells); see $themeAssets.assetBase. `title` is the themed player-facing
  // name; `code` is the internal reference tag shown small and dim.
  const SYMBOLS = [
    { title: 'Wild',        code: 'WILD', sub: 'Siphonophore', file: 'wild',    pays: [null, null, null, null, null] },
    { title: 'Scatter',     code: 'SCAT', sub: 'Spore',        file: 'scatter', pays: [null, null, null, null, null] },
    { title: 'Anglerfish',  code: 'H1',   sub: '',             file: 'h1',      pays: [null, null, 1.5,  6,    22]   },
    { title: 'Gulper Eel',  code: 'H2',   sub: '',             file: 'h2',      pays: [null, null, 0.8,  3,    10]   },
    { title: 'Nautilus',    code: 'M1',   sub: '',             file: 'm1',      pays: [null, null, 0.45, 1.5,  5]    },
    { title: 'Jellyfish',   code: 'M2',   sub: '',             file: 'm2',      pays: [null, null, 0.3,  1,    4]    },
    { title: 'Lanternfish', code: 'M3',   sub: '',             file: 'm3',      pays: [null, null, 0.2,  0.6,  2]    },
    { title: 'Isopod',      code: 'L1',   sub: '',             file: 'l1',      pays: [null, null, 0.15, 0.45, 1.5]  },
    { title: 'Deep Shrimp', code: 'L2',   sub: '',             file: 'l2',      pays: [null, null, 0.10, 0.25, 0.8]  },
    { title: 'Diatom',      code: 'L3',   sub: '',             file: 'l3',      pays: [null, null, 0.08, 0.20, 0.65] },
  ] as const

  // THE BLOOM trigger table (matches CLAUDE.md true game facts exactly).
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

  // BET MODES info page — rendered uniformly from the single source-of-truth
  // config (src/lib/config/lumenModes.ts). Buy modes are omitted where the
  // jurisdiction disables feature buys. All modes share the same 96.35% RTP.
  $: betModeCur = $currencyCode || 'USD'
  $: betModeRows = LUMEN_MODES
    .filter((m) => m.kind !== 'buy' || !$buyFeatureDisabled)
    .map((m) => ({
      label: m.label,
      blurb: m.blurb,
      costLabel: `${m.cost}× · ${formatBalance(Math.round($betAmount * m.cost * CURRENCY_SCALE), betModeCur)}`,
      rtp: LUMEN_RTP_LABEL,
    }))
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="modal-backdrop"
  role="dialog"
  aria-modal="true"
  aria-label={$tr('paytable')}
  tabindex="-1"
  on:click|self={close}
>
  <div class="modal-panel">

    <!-- ── Header ──────────────────────────────────────────────────── -->
    <div class="modal-header">
      <h2 class="modal-title">{$tr('paytable')}</h2>
      <button class="close-btn" on:click={close} aria-label={$tr('close')}>✕</button>
    </div>

    <!-- ── Scrollable body ─────────────────────────────────────────── -->
    <div class="modal-body">

      <!-- How-to-win banner -->
      <div class="how-to-win">
        <p class="htw-headline">Match symbols on adjacent reels starting from reel 1 (left to right).</p>
        <p class="htw-sub">All matching symbol positions count. There are no fixed paylines.</p>
        <div class="ways-callout">
          <span class="ways-number">1,024</span>
          <span class="ways-label">{waysLabel}</span>
        </div>
      </div>

      <!-- WAYS TO WIN — adjacent-reels diagram, reads left to right from reel 1 -->
      <div class="ways-diagram-section">
        <h3 class="rules-heading">{waysLabel}</h3>
        <div class="ways-diagram" role="img" aria-label="A matching way reads left to right across adjacent reels, starting from reel 1">
          {#each [1, 2, 3, 4, 5] as reelNum, i}
            <div class="way-step">
              <div class="way-cell" class:matched={i < 3}>
                <span class="way-reel-num">{reelNum}</span>
              </div>
              {#if i < 4}
                <span class="way-arrow" class:matched={i < 2}>→</span>
              {/if}
            </div>
          {/each}
        </div>
        <p class="ways-caption">Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left to right starting from reel 1. Reels 4 and 5 are not required.</p>

        <!-- Where 1,024 comes from + a worked multi-way example -->
        <div class="ways-math">
          <p class="ways-math-line">
            Every reel shows 4 symbols, so
            <span class="ways-math-eq">4 × 4 × 4 × 4 × 4 = 1,024</span>
            ways are active on every spin. There are no paylines and nothing to switch on, so your stake always plays all 1,024 ways.
          </p>
          <p class="ways-math-line">
            <span class="ways-math-tag">Example</span>
            the same symbol lands on 2 positions of reel 1, 1 of reel 2 and 3 of reel 3.
            That is <span class="ways-math-eq">2 × 1 × 3 = 6</span> winning ways, each paying that symbol's per-way value.
          </p>
          <p class="ways-math-line ways-math-note">
            The payouts below are shown per way. Your total win adds up every winning way on the spin.
          </p>
        </div>
      </div>

      <!-- Symbol pay table — big, named cards, 4 across (2 on narrow) -->
      <div class="symbol-grid-section" data-testid="symbol-payouts">
        <h3 class="rules-heading">Symbol Payouts</h3>
        <p class="symbol-grid-intro">Values shown are per matching way. Your total win adds up every winning way on the spin.</p>
        <div class="symbol-grid">
          {#each SYMBOLS as sym}
            <div class="symbol-card" class:feature-card={sym.code === 'WILD' || sym.code === 'SCAT'}>
              <div class="sym-art">
                <img src="{$themeAssets.assetBase}/symbols/{sym.file}.png" alt={sym.title} class="sym-icon-lg" />
              </div>
              <div class="sym-head">
                <span class="sym-name-lg">{sym.title}</span>
                {#if sym.sub}<span class="sym-sub">{sym.sub}</span>{/if}
                <span class="sym-code">{sym.code}</span>
              </div>
              {#if sym.code === 'SCAT'}
                <span class="scatter-note-lg">3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins</span>
              {:else if sym.code === 'WILD'}
                <span class="scatter-note-lg">Substitutes for all symbols except Scatter</span>
              {:else}
                <div class="pay-strip">
                  <div class="pay-cell">
                    <span class="pay-count">3×</span><span class="pay-value">{sym.pays[2] ?? '-'}</span>
                  </div>
                  <div class="pay-cell">
                    <span class="pay-count">4×</span><span class="pay-value">{sym.pays[3] ?? '-'}</span>
                  </div>
                  <div class="pay-cell">
                    <span class="pay-count">5×</span><span class="pay-value">{sym.pays[4] ?? '-'}</span>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- ── Rules ───────────────────────────────────────────────── -->
      <div class="rules-section">
        <h3 class="rules-heading">{$tr('rules')}</h3>
        <ul class="rules-list">
          {#each rulesList as rule}
            <li>{rule}</li>
          {/each}
        </ul>
      </div>

      <!-- ── THE BLOOM free spins feature ─────────────────────────── -->
      <div class="rules-section">
        <h3 class="rules-heading">{$tr('rulesOverdriveTitle')}</h3>

        <table class="trigger-table" aria-label="THE BLOOM trigger table">
          <thead>
            <tr>
              <th>Scatters</th>
              <th>Free Spins</th>
              <th>Instant Award</th>
            </tr>
          </thead>
          <tbody>
            {#each TRIGGER_TABLE as row}
              <tr>
                <td>{row.scatters}</td>
                <td>{row.spins}</td>
                <td>{row.award}</td>
              </tr>
            {/each}
          </tbody>
        </table>

        <ul class="rules-list">
          <li>{$tr('rulesOverdriveMeter')}</li>
          <li>{$tr('rulesOverdriveRetrigger')}</li>
          <li>{$tr('rulesOverdriveAnte')}</li>
          {#if !$buyFeatureDisabled}
            <li>{$tr('rulesOverdriveBuy')}</li>
          {/if}
          <li>{$tr('rulesOverdriveModes')}</li>
        </ul>

        {#if !$buyFeatureDisabled}
          <div class="buy-price-callout">
            <span class="buy-price-label">{$tr('buyFeature')}</span>
            <span class="buy-price-value">{buyPriceLabel}</span>
          </div>
        {/if}
      </div>

      <!-- ── BET MODES — every mode listed uniformly (from the config) ─── -->
      <div class="rules-section" data-testid="bet-modes-section">
        <h3 class="rules-heading">Bet Modes</h3>
        <p class="bet-modes-intro">
          Every mode plays the same 1,024-ways game and The Bloom feature, and
          returns the same {LUMEN_RTP_LABEL} RTP. Pick a mode from the FEATURES menu.
        </p>
        <div class="bet-modes-list">
          {#each betModeRows as m}
            <div class="bet-mode-row">
              <div class="bet-mode-main">
                <span class="bet-mode-name">{m.label}</span>
                <span class="bet-mode-blurb">{m.blurb}</span>
              </div>
              <div class="bet-mode-meta">
                <span class="bet-mode-cost">{m.costLabel}</span>
                <span class="bet-mode-rtp">RTP {m.rtp}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- ── Interface Guide — every game control explained ──────── -->
      <div class="rules-section" data-testid="interface-guide">
        <h3 class="rules-heading">Interface Guide</h3>
        <div class="guide-list">
          {#each INTERFACE_GUIDE as g}
            <div class="guide-row">
              <div class="guide-icon">
                {#if g.kind === 'img'}
                  <img src="{$themeAssets.assetBase}/ui/{g.file}" alt={g.name} class="guide-img" />
                {:else}
                  <span class="guide-pill">{g.label}</span>
                {/if}
              </div>
              <div class="guide-text">
                <span class="guide-name">{g.name}</span>
                <span class="guide-desc">{g.desc}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- ── RTP + max win — all modes ───────────────────────────── -->
      <div class="rtp-grid">
        <div class="rtp-row">
          <span class="rtp-label">ALL MODES RTP</span>
          <span class="rtp-value">{LUMEN_RTP_LABEL}</span>
        </div>
        <div class="rtp-row">
          <span class="rtp-label">MAX WIN</span>
          <span class="rtp-value">{LUMEN_MAX_WIN_LABEL}</span>
        </div>
      </div>

      <!-- ── Disclaimer (Stake Engine seven-point requirement) ────── -->
      <div class="disclaimer-section">
        <h3 class="rules-heading">Disclaimer</h3>
        <p class="disclaimer-text">{disclaimerText}</p>
      </div>

    </div><!-- /modal-body -->
  </div><!-- /modal-panel -->
</div>

<style>
  /* ── Backdrop ─────────────────────────────────────────────────────── */
  /* Sized against the 1280x720 stage design units — App.svelte's .game-wrapper
     has `transform: scale(S)`, which re-anchors `position: fixed` descendants
     to its own (pre-transform) box, so this backdrop covers exactly the
     1280x720 stage and everything below scales with it automatically. */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(3px);
  }

  /* ── Panel — fills ~92% of the stage ──────────────────────────────── */
  .modal-panel {
    background: linear-gradient(160deg, #0c0c22 0%, #08081a 100%);
    border: 1px solid rgba(255, 200, 50, 0.25);
    border-radius: 16px;
    width: 92%;
    max-width: 1178px;
    height: 92%;
    max-height: 662px;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 0 40px rgba(0, 0, 0, 0.8),
      0 0 0 1px rgba(255, 200, 50, 0.08) inset;
    overflow: hidden;
  }

  /* ── Header ───────────────────────────────────────────────────────── */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.6rem;
    border-bottom: 1px solid rgba(255, 200, 50, 0.12);
    flex-shrink: 0;
  }

  .modal-title {
    font-size: 1.3rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    background: linear-gradient(135deg, #ffd700, #ff8c00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .close-btn {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }

  .close-btn:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.5);
  }

  /* ── Body ─────────────────────────────────────────────────────────── */
  .modal-body {
    overflow-y: auto;
    padding: 1.6rem 2.2rem 2.6rem;
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
  }

  /* ── How-to-win banner ────────────────────────────────────────────── */
  .how-to-win {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 1.3rem 1.5rem;
    background: rgba(0, 200, 255, 0.05);
    border: 1px solid rgba(0, 200, 255, 0.18);
    border-radius: 10px;
  }

  .htw-headline {
    font-size: 1.15rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.45;
    margin: 0;
  }

  .htw-sub {
    font-size: 0.95rem;
    color: rgba(160, 228, 255, 0.8);
    line-height: 1.4;
    margin: 0;
  }

  /* ── Ways callout ─────────────────────────────────────────────────── */
  .ways-callout {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.8rem 1rem;
    margin-top: 0.5rem;
    background: rgba(255, 200, 50, 0.06);
    border: 1px solid rgba(255, 200, 50, 0.2);
    border-radius: 8px;
  }

  .ways-number {
    font-size: 2.8rem;
    font-weight: 900;
    color: #ffd700;
    line-height: 1;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 18px rgba(255, 215, 0, 0.55);
  }

  .ways-label {
    font-size: 0.85rem;
    letter-spacing: 0.2em;
    color: rgba(255, 200, 50, 0.7);
    margin-top: 4px;
  }

  /* ── WAYS TO WIN adjacency diagram ────────────────────────────────── */
  .ways-diagram-section {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .ways-diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
  }

  .way-step {
    display: flex;
    align-items: center;
  }

  .way-cell {
    width: 68px;
    height: 68px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-weight: 900;
    font-size: 1.35rem;
    color: rgba(255, 255, 255, 0.3);
    transition: all 0.2s;
  }

  .way-cell.matched {
    background: rgba(0, 255, 255, 0.1);
    border-color: #00ffff;
    color: #00ffff;
    box-shadow: 0 0 14px rgba(0, 255, 255, 0.45);
  }

  .way-reel-num { line-height: 1; }

  .way-arrow {
    font-size: 1.6rem;
    color: rgba(255, 255, 255, 0.2);
    padding: 0 0.5rem;
  }

  .way-arrow.matched {
    color: #00ffff;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  }

  .ways-caption {
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    line-height: 1.5;
    margin: 0;
  }

  .ways-math {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.15rem 1.3rem;
    background: rgba(0, 255, 255, 0.04);
    border: 1px solid rgba(0, 255, 255, 0.18);
    border-radius: 10px;
  }

  .ways-math-line {
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.6;
    margin: 0;
  }

  .ways-math-eq {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-weight: 900;
    color: #00ffff;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
    white-space: nowrap;
  }

  .ways-math-tag {
    display: inline-block;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-weight: 900;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #0b0f1c;
    background: #00ffff;
    border-radius: 4px;
    padding: 0.1rem 0.5rem;
    margin-right: 0.45rem;
    vertical-align: 0.05em;
  }

  .ways-math-note {
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.62);
  }

  /* ── Symbol grid — big named cards, 4 across ──────────────────────── */
  .symbol-grid-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .symbol-grid-intro {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.62);
    line-height: 1.5;
    margin: 0;
  }

  .symbol-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.1rem;
  }

  .symbol-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    padding: 1.4rem 1rem 1.2rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    transition: background 0.15s, border-color 0.15s;
  }

  .symbol-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(0, 229, 255, 0.3);
  }

  .symbol-card.feature-card {
    background: rgba(0, 229, 255, 0.05);
    border-color: rgba(0, 229, 255, 0.28);
  }

  .sym-art {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 168px;
  }

  .sym-icon-lg {
    width: 160px;
    height: 160px;
    object-fit: contain;
    filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.45));
  }

  .sym-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
  }

  .sym-name-lg {
    font-size: 1.15rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.02em;
    text-align: center;
  }

  .sym-sub {
    font-size: 0.85rem;
    font-style: italic;
    color: rgba(160, 228, 255, 0.85);
  }

  .sym-code {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
  }

  .pay-strip {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    margin-top: 0.15rem;
  }

  .pay-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    flex: 1;
    padding: 0.4rem 0.2rem;
    background: rgba(0, 0, 0, 0.22);
    border-radius: 8px;
  }

  .pay-count {
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.45);
  }

  .pay-value {
    font-size: 1.05rem;
    font-weight: 800;
    color: #4eff91;
    font-family: 'Courier New', monospace;
    font-variant-numeric: tabular-nums;
  }

  .scatter-note-lg {
    text-align: center;
    color: #a0e4ff;
    font-style: italic;
    font-size: 0.88rem;
    line-height: 1.5;
  }

  /* ── Rules ────────────────────────────────────────────────────────── */
  .rules-section {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .rules-heading {
    font-size: 1.1rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255, 200, 50, 0.85);
    font-weight: 800;
  }

  .rules-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 0;
  }

  .rules-list li {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.68);
    padding-left: 1.1rem;
    position: relative;
    line-height: 1.6;
  }

  .rules-list li::before {
    content: '›';
    position: absolute;
    left: 0;
    color: rgba(255, 200, 50, 0.5);
  }

  /* ── THE BLOOM trigger table ──────────────────────────────────────── */
  .trigger-table {
    width: 100%;
    max-width: 480px;
    border-collapse: collapse;
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
  }

  .trigger-table th {
    text-align: center;
    color: rgba(255, 200, 50, 0.7);
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0 0 0.6rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .trigger-table td {
    text-align: center;
    padding: 0.55rem 0;
    color: #a0e4ff;
    font-weight: 700;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  /* ── Buy price callout ────────────────────────────────────────────── */
  .buy-price-callout {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.1rem;
    background: rgba(255, 46, 196, 0.06);
    border: 1px solid rgba(255, 46, 196, 0.25);
    border-radius: 8px;
  }

  .buy-price-label {
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 213, 74, 0.9);
    font-weight: 700;
  }

  .buy-price-value {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.2rem;
    font-weight: 900;
    color: #ff2ec4;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 8px rgba(255, 46, 196, 0.5);
  }

  /* ── Bet modes list ───────────────────────────────────────────────── */
  .bet-modes-intro {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.66);
    line-height: 1.55;
    margin: 0 0 0.3rem;
  }

  .bet-modes-list {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .bet-mode-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 1.2rem;
    background: rgba(0, 240, 255, 0.04);
    border: 1px solid rgba(0, 240, 255, 0.16);
    border-radius: 10px;
  }

  .bet-mode-main {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .bet-mode-name {
    font-size: 1.05rem;
    font-weight: 800;
    color: #eafcff;
    letter-spacing: 0.03em;
  }

  .bet-mode-blurb {
    font-size: 0.88rem;
    color: rgba(200, 230, 245, 0.7);
    line-height: 1.45;
  }

  .bet-mode-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .bet-mode-cost {
    font-size: 0.9rem;
    font-weight: 700;
    color: #ffd54a;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .bet-mode-rtp {
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    color: rgba(155, 236, 255, 0.75);
    white-space: nowrap;
  }

  /* ── Interface Guide ──────────────────────────────────────────────── */
  .guide-list {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .guide-row {
    display: flex;
    align-items: center;
    gap: 1.1rem;
    padding: 0.75rem 1rem;
    background: rgba(0, 229, 255, 0.03);
    border: 1px solid rgba(0, 229, 255, 0.14);
    border-radius: 10px;
  }

  .guide-icon {
    flex-shrink: 0;
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  .guide-img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }

  .guide-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.35rem 0.7rem;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.8rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #05070f;
    background: linear-gradient(135deg, #00e5ff, #00b3d6);
    border-radius: 999px;
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.45);
  }

  .guide-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    min-width: 0;
    text-align: left;
  }

  .guide-name {
    font-size: 1rem;
    font-weight: 800;
    color: #eafcff;
    letter-spacing: 0.02em;
  }

  .guide-desc {
    font-size: 0.9rem;
    color: rgba(200, 230, 245, 0.68);
    line-height: 1.45;
  }

  /* ── RTP grid ─────────────────────────────────────────────────────── */
  .rtp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.6rem;
  }

  .rtp-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.1rem;
    border: 1px solid rgba(255, 200, 50, 0.15);
    border-radius: 8px;
    background: rgba(255, 200, 50, 0.04);
  }

  .rtp-label {
    font-size: 0.85rem;
    letter-spacing: 0.12em;
    color: rgba(255, 200, 50, 0.65);
    text-transform: uppercase;
    font-weight: 700;
  }

  .rtp-value {
    font-size: 1.3rem;
    font-weight: 900;
    color: #ffd700;
    font-family: 'Courier New', monospace;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }

  /* ── Disclaimer ───────────────────────────────────────────────────── */
  .disclaimer-section {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .disclaimer-text {
    font-size: 0.85rem;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.58);
    margin: 0;
    text-align: left;
  }

  /* ── Narrow viewports — 2-across symbol grid, tighter padding ──────── */
  @media (max-width: 720px) {
    .modal-body { padding: 1.1rem 1.2rem 1.8rem; gap: 1.8rem; }
    .symbol-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 480px) {
    .sym-art { height: 132px; }
    .sym-icon-lg { width: 124px; height: 124px; }
  }
</style>
