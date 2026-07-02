<script lang="ts">
  import { showPaytable } from '../stores/gameStore'
  import { tr } from '../i18n/tr'
  import { isSocial } from '../stores/socialMode'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { playClick } from '../services/soundService'

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
  const SYMBOLS = [
    { name: 'WILD', src: '/assets/symbols/wild_cyberpunk_logo_variant_04.png',                  pays: [null, null, null, null, null] },
    { name: 'SCAT', src: '/assets/symbols/scatter_energy_burst_variant_01.png',                 pays: [null, null, null, null, null] },
    { name: 'H1',   src: '/assets/symbols/h1_futuristic_rim_variant_02.png',                    pays: [null, null, 1.5,  6,    22]   },
    { name: 'H2',   src: '/assets/symbols/h2_neon_turbocharger_variant_01.png',                 pays: [null, null, 0.8,  3,    10]   },
    { name: 'M1',   src: '/assets/symbols/m1_holographic_grille_variant_09_original.png',       pays: [null, null, 0.45, 1.5,  5]    },
    { name: 'M2',   src: '/assets/symbols/m2_glowing_exhaust_variant_01.png',                   pays: [null, null, 0.3,  1,    4]    },
    { name: 'M3',   src: '/assets/symbols/m3_holographic_steering_wheel_variant_03.png',        pays: [null, null, 0.2,  0.6,  2]    },
    { name: 'L1',   src: '/assets/symbols/l1_chrome_lug_nut_variant_05.png',                    pays: [null, null, 0.15, 0.45, 1.5]  },
    { name: 'L2',   src: '/assets/symbols/l2_chrome_spark_plug_variant_05.png',                 pays: [null, null, 0.10, 0.25, 0.8]  },
    { name: 'L3',   src: '/assets/symbols/l3_neon_piston_variant_08.png',                       pays: [null, null, 0.08, 0.20, 0.65] },
  ] as const
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="modal-backdrop"
  role="dialog"
  aria-modal="true"
  aria-label={$tr('paytable')}
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

      <!-- Symbol pay table -->
      <table class="pay-table" aria-label="Symbol payouts">
        <thead>
          <tr>
            <th class="col-sym">Symbol</th>
            <th class="col-match">3×</th>
            <th class="col-match">4×</th>
            <th class="col-match">5×</th>
          </tr>
        </thead>
        <tbody>
          {#each SYMBOLS as sym}
            <tr class="sym-row">
              <td class="sym-cell">
                <img src={sym.src} alt={sym.name} class="sym-icon" />
                <span class="sym-name">{sym.name}</span>
              </td>
              {#if sym.name === 'SCAT'}
                <td colspan="3" class="scatter-note">3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins</td>
              {:else if sym.name === 'WILD'}
                <td colspan="3" class="scatter-note">Substitutes for all symbols except SCATTER</td>
              {:else}
                <td class="pay-cell">{sym.pays[2] ?? '—'}</td>
                <td class="pay-cell">{sym.pays[3] ?? '—'}</td>
                <td class="pay-cell">{sym.pays[4] ?? '—'}</td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>

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
        <ul class="rules-list">
          <li>{$tr('rulesOverdriveTrigger')}</li>
          <li>{$tr('rulesOverdriveMeter')}</li>
          <li>{$tr('rulesOverdriveRetrigger')}</li>
          {#if !$buyFeatureDisabled}
            <li>{$tr('rulesOverdriveBuy')}</li>
          {/if}
          <li>{$tr('rulesOverdriveModes')}</li>
        </ul>
      </div>

      <!-- ── RTP ─────────────────────────────────────────────────── -->
      <div class="rtp-row">
        <span class="rtp-label">THEORETICAL RTP</span>
        <span class="rtp-value">96.35%</span>
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
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(3px);
    padding: 1rem;
  }

  /* ── Panel ────────────────────────────────────────────────────────── */
  .modal-panel {
    background: linear-gradient(160deg, #0c0c22 0%, #08081a 100%);
    border: 1px solid rgba(255, 200, 50, 0.25);
    border-radius: 12px;
    width: 100%;
    max-width: 480px;
    max-height: 86dvh;
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
    padding: 0.9rem 1.2rem;
    border-bottom: 1px solid rgba(255, 200, 50, 0.12);
    flex-shrink: 0;
  }

  .modal-title {
    font-size: 1.1rem;
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
    width: 28px;
    height: 28px;
    cursor: pointer;
    font-size: 0.75rem;
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
    padding: 1rem 1.2rem 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  /* ── How-to-win banner ────────────────────────────────────────────── */
  .how-to-win {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.7rem 0.9rem;
    background: rgba(0, 200, 255, 0.05);
    border: 1px solid rgba(0, 200, 255, 0.18);
    border-radius: 8px;
  }

  .htw-headline {
    font-size: 0.82rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.4;
    margin: 0;
  }

  .htw-sub {
    font-size: 0.72rem;
    color: rgba(160, 228, 255, 0.75);
    line-height: 1.35;
    margin: 0;
  }

  /* ── Ways callout ─────────────────────────────────────────────────── */
  .ways-callout {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 0.6rem;
    margin-top: 0.3rem;
    background: rgba(255, 200, 50, 0.06);
    border: 1px solid rgba(255, 200, 50, 0.2);
    border-radius: 6px;
  }

  .ways-number {
    font-size: 2rem;
    font-weight: 900;
    color: #ffd700;
    line-height: 1;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 18px rgba(255, 215, 0, 0.55);
  }

  .ways-label {
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    color: rgba(255, 200, 50, 0.65);
    margin-top: 2px;
  }

  /* ── Pay table ────────────────────────────────────────────────────── */
  .pay-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
  }

  .pay-table th {
    text-align: left;
    color: rgba(255, 200, 50, 0.6);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0 0 0.4rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .col-sym   { width: 46%; }
  .col-match { width: 18%; text-align: center; }

  .sym-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.1s;
  }

  .sym-row:hover { background: rgba(255, 255, 255, 0.03); }

  .sym-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0;
  }

  .sym-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .sym-name {
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 0.05em;
  }

  .pay-cell {
    text-align: center;
    color: #4eff91;
    font-family: 'Courier New', monospace;
    font-weight: 700;
    padding: 0.35rem 0;
  }

  .scatter-note {
    text-align: center;
    color: #a0e4ff;
    font-style: italic;
    font-size: 0.72rem;
    padding: 0.35rem 0;
  }

  /* ── Rules ────────────────────────────────────────────────────────── */
  .rules-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .rules-heading {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255, 200, 50, 0.7);
    font-weight: 700;
  }

  .rules-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0;
  }

  .rules-list li {
    font-size: 0.76rem;
    color: rgba(255, 255, 255, 0.6);
    padding-left: 0.9rem;
    position: relative;
    line-height: 1.45;
  }

  .rules-list li::before {
    content: '›';
    position: absolute;
    left: 0;
    color: rgba(255, 200, 50, 0.5);
  }

  /* ── RTP row ──────────────────────────────────────────────────────── */
  .rtp-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.8rem;
    border: 1px solid rgba(255, 200, 50, 0.15);
    border-radius: 6px;
    background: rgba(255, 200, 50, 0.04);
  }

  .rtp-label {
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    color: rgba(255, 200, 50, 0.55);
    text-transform: uppercase;
    font-weight: 700;
  }

  .rtp-value {
    font-size: 1rem;
    font-weight: 900;
    color: #ffd700;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }

  /* ── Disclaimer ───────────────────────────────────────────────────── */
  .disclaimer-section {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .disclaimer-text {
    font-size: 0.68rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.55);
    margin: 0;
    text-align: left;
  }
</style>
