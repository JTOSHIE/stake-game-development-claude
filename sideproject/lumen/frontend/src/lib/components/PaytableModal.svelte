<script lang="ts">
  // PaytableModal.svelte — full-page paytable (LAYOUT_SPEC UX polish v1).
  // Fills ~92% of the 1280x720 stage (scales with S via the transformed
  // ancestor, which also re-anchors this modal's `position: fixed`). Large
  // symbol cells (240 exports), an Overdrive trigger table, a WAYS TO WIN
  // adjacency diagram, RTP for both modes, and the existing seven-point
  // disclaimer, all scrollable.
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
    ? 'Malfunction voids all prizes and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Prizes are settled according to the result returned by the Remote Game Server, not from events shown in the web browser. Future Spinner™ and We Roll Spinners™ are trademarks of We Roll Spinners. © 2026 We Roll Spinners. All rights reserved.'
    : 'Malfunction voids all wins and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Winnings are settled according to the result returned by the Remote Game Server, not from events shown in the web browser. Future Spinner™ and We Roll Spinners™ are trademarks of We Roll Spinners. © 2026 We Roll Spinners. All rights reserved.'

  // Symbol pay table — per-way multipliers, matching the validated maths in
  // games/future_spinner/game_config.py exactly. Final payout = paytable value
  // x ways count x bet. pays array is [_, _, 3-of, 4-of, 5-of]. WILD substitutes
  // for all symbols and has no independent pay; SCAT pays via the scatter table.
  // Icons resolve to the active theme's AssetForge vector exports — the full
  // 240 export is used here (large paytable cells); see $themeAssets.assetBase.
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

  // Overdrive trigger table (matches CLAUDE.md true game facts exactly).
  const TRIGGER_TABLE = [
    { scatters: 3, spins: 8,  award: '1×' },
    { scatters: 4, spins: 12, award: '3×' },
    { scatters: 5, spins: 16, award: '10×' },
  ]

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
        <p class="htw-sub">All matching symbol positions count — no fixed paylines.</p>
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
        <p class="ways-caption">Reels 1, 2 and 3 hold the same symbol (highlighted) — a match, read left to right starting from reel 1. Reels 4 and 5 are not required.</p>

        <!-- Where 1,024 comes from + a worked multi-way example -->
        <div class="ways-math">
          <p class="ways-math-line">
            Every reel shows 4 symbols, so
            <span class="ways-math-eq">4 × 4 × 4 × 4 × 4 = 1,024</span>
            ways are active on every spin. There are no paylines and nothing to switch on — your stake always plays all 1,024 ways.
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

      <!-- Symbol pay table — large cells (240 exports) -->
      <div class="symbol-grid-section">
        <h3 class="rules-heading">Symbol Payouts</h3>
        <div class="symbol-grid">
          {#each SYMBOLS as sym}
            <div class="symbol-card">
              <img src="{$themeAssets.assetBase}/symbols/{sym.file}.png" alt={sym.name} class="sym-icon-lg" />
              <span class="sym-name-lg">{sym.name}</span>
              {#if sym.name === 'SCAT'}
                <span class="scatter-note-lg">3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins</span>
              {:else if sym.name === 'WILD'}
                <span class="scatter-note-lg">Substitutes for all symbols except SCATTER</span>
              {:else}
                <div class="pay-row-lg">
                  <span class="pay-count">3×</span><span class="pay-value">{sym.pays[2] ?? '—'}</span>
                </div>
                <div class="pay-row-lg">
                  <span class="pay-count">4×</span><span class="pay-value">{sym.pays[3] ?? '—'}</span>
                </div>
                <div class="pay-row-lg">
                  <span class="pay-count">5×</span><span class="pay-value">{sym.pays[4] ?? '—'}</span>
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

      <!-- ── Overdrive Free Spins feature ─────────────────────────── -->
      <div class="rules-section">
        <h3 class="rules-heading">{$tr('rulesOverdriveTitle')}</h3>

        <table class="trigger-table" aria-label="Overdrive trigger table">
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
    padding: 1.2rem 1.8rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ── How-to-win banner ────────────────────────────────────────────── */
  .how-to-win {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.9rem 1.1rem;
    background: rgba(0, 200, 255, 0.05);
    border: 1px solid rgba(0, 200, 255, 0.18);
    border-radius: 8px;
  }

  .htw-headline {
    font-size: 0.95rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.4;
    margin: 0;
  }

  .htw-sub {
    font-size: 0.8rem;
    color: rgba(160, 228, 255, 0.75);
    line-height: 1.35;
    margin: 0;
  }

  /* ── Ways callout ─────────────────────────────────────────────────── */
  .ways-callout {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.6rem 0.8rem;
    margin-top: 0.3rem;
    background: rgba(255, 200, 50, 0.06);
    border: 1px solid rgba(255, 200, 50, 0.2);
    border-radius: 6px;
  }

  .ways-number {
    font-size: 2.2rem;
    font-weight: 900;
    color: #ffd700;
    line-height: 1;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 18px rgba(255, 215, 0, 0.55);
  }

  .ways-label {
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: rgba(255, 200, 50, 0.65);
    margin-top: 2px;
  }

  /* ── WAYS TO WIN adjacency diagram ────────────────────────────────── */
  .ways-diagram-section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
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
    width: 56px;
    height: 56px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-weight: 900;
    font-size: 1.1rem;
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
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.2);
    padding: 0 0.4rem;
  }

  .way-arrow.matched {
    color: #00ffff;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  }

  .ways-caption {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.55);
    text-align: center;
    line-height: 1.4;
    margin: 0;
  }

  .ways-math {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.85rem 1rem;
    background: rgba(0, 255, 255, 0.04);
    border: 1px solid rgba(0, 255, 255, 0.18);
    border-radius: 8px;
  }

  .ways-math-line {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.72);
    line-height: 1.5;
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
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #0b0f1c;
    background: #00ffff;
    border-radius: 4px;
    padding: 0.05rem 0.4rem;
    margin-right: 0.35rem;
    vertical-align: 0.05em;
  }

  .ways-math-note {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.55);
  }

  /* ── Symbol grid — large 240px cells ──────────────────────────────── */
  .symbol-grid-section {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .symbol-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.7rem;
  }

  .symbol-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 0.8rem 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    transition: background 0.15s;
  }

  .symbol-card:hover { background: rgba(255, 255, 255, 0.06); }

  .sym-icon-lg {
    width: 84px;
    height: 84px;
    object-fit: contain;
  }

  .sym-name-lg {
    font-size: 0.8rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 0.06em;
  }

  .pay-row-lg {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    font-family: 'Courier New', monospace;
    font-variant-numeric: tabular-nums;
  }

  .pay-count {
    font-size: 0.62rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .pay-value {
    font-size: 0.85rem;
    font-weight: 700;
    color: #4eff91;
  }

  .scatter-note-lg {
    text-align: center;
    color: #a0e4ff;
    font-style: italic;
    font-size: 0.68rem;
    line-height: 1.35;
  }

  /* ── Rules ────────────────────────────────────────────────────────── */
  .rules-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .rules-heading {
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255, 200, 50, 0.7);
    font-weight: 700;
  }

  .rules-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0;
  }

  .rules-list li {
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.6);
    padding-left: 0.9rem;
    position: relative;
    line-height: 1.5;
  }

  .rules-list li::before {
    content: '›';
    position: absolute;
    left: 0;
    color: rgba(255, 200, 50, 0.5);
  }

  /* ── Overdrive trigger table ──────────────────────────────────────── */
  .trigger-table {
    width: 100%;
    max-width: 420px;
    border-collapse: collapse;
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }

  .trigger-table th {
    text-align: center;
    color: rgba(255, 200, 50, 0.6);
    font-size: 0.64rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0 0 0.4rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .trigger-table td {
    text-align: center;
    padding: 0.4rem 0;
    color: #a0e4ff;
    font-weight: 700;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  /* ── Buy price callout ────────────────────────────────────────────── */
  .buy-price-callout {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.9rem;
    background: rgba(255, 46, 196, 0.06);
    border: 1px solid rgba(255, 46, 196, 0.25);
    border-radius: 6px;
  }

  .buy-price-label {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 213, 74, 0.85);
    font-weight: 700;
  }

  .buy-price-value {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1rem;
    font-weight: 900;
    color: #ff2ec4;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 8px rgba(255, 46, 196, 0.5);
  }

  /* ── Bet modes list ───────────────────────────────────────────────── */
  .bet-modes-intro {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
    margin: 0 0 0.3rem;
  }

  .bet-modes-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .bet-mode-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0.9rem;
    background: rgba(0, 240, 255, 0.04);
    border: 1px solid rgba(0, 240, 255, 0.16);
    border-radius: 8px;
  }

  .bet-mode-main {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .bet-mode-name {
    font-size: 0.86rem;
    font-weight: 800;
    color: #eafcff;
    letter-spacing: 0.03em;
  }

  .bet-mode-blurb {
    font-size: 0.72rem;
    color: rgba(200, 230, 245, 0.65);
    line-height: 1.4;
  }

  .bet-mode-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.15rem;
    flex-shrink: 0;
  }

  .bet-mode-cost {
    font-size: 0.72rem;
    font-weight: 700;
    color: #ffd54a;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .bet-mode-rtp {
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    color: rgba(155, 236, 255, 0.7);
    white-space: nowrap;
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
    padding: 0.6rem 0.9rem;
    border: 1px solid rgba(255, 200, 50, 0.15);
    border-radius: 6px;
    background: rgba(255, 200, 50, 0.04);
  }

  .rtp-label {
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    color: rgba(255, 200, 50, 0.55);
    text-transform: uppercase;
    font-weight: 700;
  }

  .rtp-value {
    font-size: 1.05rem;
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
    font-size: 0.72rem;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.55);
    margin: 0;
    text-align: left;
  }

  /* ── Small viewports — tighter padding, single-column symbol grid ──── */
  @media (max-width: 500px) {
    .modal-body { padding: 0.9rem 1rem 1.4rem; gap: 1rem; }
    .symbol-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
    .sym-icon-lg { width: 64px; height: 64px; }
  }
</style>
