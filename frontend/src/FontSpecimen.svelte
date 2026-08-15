<script lang="ts">
  // FONT SPECIMEN. DEV ONLY. Evidence for an owner decision, nothing else.
  //
  // Everything money-shaped on this page goes through the SHIPPED formatters, and
  // the paytable values are the shipped ones, so what a candidate face is judged
  // on is the real string rather than lorem ipsum.
  import { onMount } from 'svelte'
  import { formatBalance, formatWin } from './lib/utils/currency'
  import { t } from './lib/i18n/translations'
  import type { Locale } from './lib/i18n/translations'

  const CANDIDATES = [
    { key: 'orbitron', label: 'Orbitron (incumbent, control)', stack: "'Orbitron'" },
    { key: 'oxanium', label: 'Oxanium', stack: "'Oxanium'" },
    { key: 'chakra-petch', label: 'Chakra Petch', stack: "'Chakra Petch'" },
    { key: 'saira', label: 'Saira', stack: "'Saira'" },
    { key: 'exo-2', label: 'Exo 2', stack: "'Exo 2'" },
    { key: 'rajdhani', label: 'Rajdhani', stack: "'Rajdhani'" },
    { key: 'michroma', label: 'Michroma', stack: "'Michroma'" },
  ]
  const LOCALES: Locale[] = ['en', 'ru', 'hi']

  // The shipped paytable, copied from PaytableModal.svelte:73 with its values
  // unchanged so the specimen shows the real table rather than a stand-in.
  const SYMBOLS = [
    { name: 'H1', pays: [1.5, 6, 22] },
    { name: 'H2', pays: [0.8, 3, 10] },
    { name: 'M1', pays: [0.45, 1.5, 5] },
    { name: 'M2', pays: [0.3, 1, 4] },
    { name: 'M3', pays: [0.2, 0.6, 2] },
    { name: 'L1', pays: [0.15, 0.45, 1.5] },
    { name: 'L2', pays: [0.1, 0.25, 0.8] },
    { name: 'L3', pays: [0.08, 0.2, 0.65] },
  ]

  // The widest values the money surfaces have been driven to in the gate family:
  // the ten-figure social balance from R061 and the max-win prize from R059.
  const WIDEST_BALANCE_MICROS = 996_622_600_00_0000
  const WIDEST_WIN_MICROS = 4_999_990_000_000
  const SUBCENT_WIN_MICROS = 800

  let face = CANDIDATES[0]
  let locale: Locale = 'en'
  let counting = 0
  let digitTable: { key: string; widths: number[]; uniform: boolean; spread: number; tnumChanges: boolean; tnumSpread: number }[] = []

  onMount(() => {
    const id = setInterval(() => { counting = (counting + 137_913) % 1_000_000_000 }, 60)
    // WAIT FOR THE WEBFONTS, and this is not a nicety. Measured on the first run
    // of this page: without it every face returned exactly 50.000px for all ten
    // digits, because the probe was still rendering in the fallback face. Seven
    // different faces agreeing to three decimal places is the tell that a
    // measurement is measuring the wrong thing.
    document.fonts.ready.then(() => setTimeout(() => { void measureDigits() }, 250))
    return () => clearInterval(id)
  })

  /**
   * TABULAR FIGURES, MEASURED RATHER THAN ASSUMED.
   *
   * Renders each of the ten digits on its own and compares advance widths. A face
   * whose ten digits share one width is tabular BY DRAWING, whether or not it
   * carries an OpenType `tnum` feature. TR-089 established that Orbitron ships no
   * GSUB features at all, so `font-variant-numeric: tabular-nums` is inert on it;
   * this is the measurement that says whether that matters.
   */
  async function measureDigits() {
    // FORCE EACH FACE TO LOAD BEFORE MEASURING IT. document.fonts.ready only
    // waits for the faces the page is ALREADY using, and a candidate that is not
    // the selected one is not used, so it stays unloaded and measures in the
    // fallback. That is exactly how the second run of this page returned 50.000
    // for six of seven faces while Orbitron, the mounted one, measured truly.
    await Promise.all(CANDIDATES.map((c) => document.fonts.load(`400 100px ${c.stack}`)))
    const out: typeof digitTable = []
    const probe = document.createElement('span')
    probe.style.cssText = 'position:absolute;visibility:hidden;font-size:100px;font-weight:400;white-space:pre;'
    document.body.appendChild(probe)
    for (const c of CANDIDATES) {
      probe.style.fontFamily = c.stack
      const widths: number[] = []
      for (let d = 0; d <= 9; d++) {
        probe.textContent = String(d)
        widths.push(+probe.getBoundingClientRect().width.toFixed(3))
      }
      const spread = +(Math.max(...widths) - Math.min(...widths)).toFixed(3)
      // AND THE SAME TEN DIGITS WITH tabular-nums ASKED FOR. If the widths move,
      // the face carries a real OpenType tnum feature; if they do not, the CSS
      // property is inert on it, which is what TR-089 established for Orbitron.
      probe.style.fontVariantNumeric = 'tabular-nums'
      const tnum: number[] = []
      for (let d = 0; d <= 9; d++) {
        probe.textContent = String(d)
        tnum.push(+probe.getBoundingClientRect().width.toFixed(3))
      }
      probe.style.fontVariantNumeric = 'normal'
      const tnumChanges = tnum.some((w, i) => Math.abs(w - widths[i]) > 0.01)
      const tnumSpread = +(Math.max(...tnum) - Math.min(...tnum)).toFixed(3)
      out.push({ key: c.key, widths, uniform: spread < 0.01, spread, tnumChanges, tnumSpread })
    }
    probe.remove()
    digitTable = out
  }

  const money = (micros: number) => formatBalance(micros, 'USD', locale)
  const win = (micros: number) => formatWin(micros, 'USD', locale)
</script>

<div class="specimen" style="--face: {face.stack}" data-face={face.key} data-locale={locale}>
  <header class="bar">
    <strong>FONT SPECIMEN</strong>
    <span class="warn">dev only, never shipped</span>
    <label>face
      <select bind:value={face} data-testid="face-select">
        {#each CANDIDATES as c}<option value={c}>{c.label}</option>{/each}
      </select>
    </label>
    <label>locale
      <select bind:value={locale} data-testid="locale-select">
        {#each LOCALES as l}<option value={l}>{l}</option>{/each}
      </select>
    </label>
  </header>

  <section class="grid">
    <div class="card">
      <h2>{t(locale, 'balance')} / {t(locale, 'win')} / {t(locale, 'bet')}</h2>
      <div class="row"><span class="lbl">{t(locale, 'balance')}</span><span class="val cyan">{money(WIDEST_BALANCE_MICROS)}</span></div>
      <div class="row"><span class="lbl">{t(locale, 'win')}</span><span class="val pink">{win(WIDEST_WIN_MICROS)}</span></div>
      <div class="row"><span class="lbl">{t(locale, 'bet')}</span><span class="val gold">{money(125_000)}</span></div>
      <div class="row"><span class="lbl">sub-cent {t(locale, 'win')}</span><span class="val pink">{win(SUBCENT_WIN_MICROS)}</span></div>
      <div class="row"><span class="lbl">counting</span><span class="val cyan" data-testid="counter">{money(counting * 1000)}</span></div>
    </div>

    <div class="card">
      <h2>{t(locale, 'paytable')}</h2>
      <table class="pay">
        <thead><tr><th>sym</th><th>3x</th><th>4x</th><th>5x</th></tr></thead>
        <tbody>
          {#each SYMBOLS as s}
            <tr><td>{s.name}</td>{#each s.pays as p}<td class="num">{p.toLocaleString(locale, { minimumFractionDigits: 2 })}</td>{/each}</tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="card wide">
      <h2>digit advance widths at 100px, measured from the DOM</h2>
      <table class="pay">
        <thead><tr><th>face</th>{#each [0,1,2,3,4,5,6,7,8,9] as d}<th>{d}</th>{/each}<th>spread</th><th>tabular by drawing</th><th>tnum moves it</th><th>spread with tnum</th></tr></thead>
        <tbody>
          {#each digitTable as r}
            <tr class:me={r.key === face.key}>
              <td>{r.key}</td>
              {#each r.widths as w}<td class="num">{w.toFixed(1)}</td>{/each}
              <td class="num">{r.spread.toFixed(2)}</td>
              <td data-testid="tabular-{r.key}">{r.uniform ? 'YES' : 'NO'}</td>
              <td data-testid="tnum-{r.key}">{r.tnumChanges ? 'YES' : 'NO'}</td>
              <td class="num">{r.tnumSpread.toFixed(2)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</div>

<style>
  .specimen { font-family: var(--face), sans-serif; background: #070b16; color: #dfe9f5; min-height: 100vh; padding: 16px; }
  .bar { display: flex; gap: 18px; align-items: center; margin-bottom: 14px; font-size: 13px; }
  .warn { color: #ff8a3d; letter-spacing: .08em; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .card { background: #0c1424; border: 1px solid #1e2c44; border-radius: 10px; padding: 14px; }
  .card.wide { grid-column: 1 / -1; }
  h2 { font-size: 13px; letter-spacing: .1em; opacity: .75; margin: 0 0 10px; font-weight: 700; }
  .row { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; border-bottom: 1px solid #16233a; gap: 20px; }
  .lbl { font-size: 12px; opacity: .7; }
  .val { font-size: 30px; font-weight: 900; }
  .cyan { color: #00ffff; } .pink { color: #ff2ec4; } .gold { color: #ffcf4a; }
  table.pay { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.pay th, table.pay td { padding: 4px 6px; border-bottom: 1px solid #16233a; text-align: left; }
  td.num, th { font-variant-numeric: tabular-nums; }
  td.num { text-align: right; }
  tr.me { background: #14243c; }
</style>
