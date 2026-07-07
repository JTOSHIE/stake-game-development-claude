<script lang="ts">
  // CellModifier.svelte — mechanic-agnostic per-cell overlay. Renders a small
  // badge on a grid cell for any per-cell modifier a mechanic produces: a wild
  // multiplier (xN), a prize value, an upgrade marker, etc. Keeping this generic
  // means a new mechanic (multiplier wilds, symbol upgrades, collect symbols)
  // adds DATA, not a new presentation pipeline - directly addressing the
  // "ways-only frontend assumptions" pitfall. Position is expressed as a cell
  // (reel, row); the parent grid supplies the pixel geometry via CSS variables.
  export let kind: 'mult' | 'prize' | 'upgrade' = 'mult'
  export let value: number = 0
  /** 0-based cell coordinates; the grid maps these to --cell-x / --cell-y. */
  export let reel: number = 0
  export let row: number = 0

  $: label = kind === 'mult' ? `x${value}` : kind === 'prize' ? `${value}` : '+'
</script>

<div
  class="cell-mod {kind}"
  style="--reel:{reel}; --row:{row};"
  role="img"
  aria-label={kind === 'mult' ? `multiplier ${value} times` : `${kind} ${value}`}
>
  <span class="cell-mod-label">{label}</span>
</div>

<style>
  .cell-mod {
    position: absolute;
    /* The grid sets --cell-w/--cell-h/--grid-gap; we place by cell index. */
    left: calc(var(--reel) * (var(--cell-w, 0px) + var(--grid-gap, 0px)));
    top: calc(var(--row) * (var(--cell-h, 0px) + var(--grid-gap, 0px)));
    width: var(--cell-w, 0px);
    height: var(--cell-h, 0px);
    display: flex; align-items: flex-end; justify-content: center;
    pointer-events: none;
    animation: cm-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .cell-mod-label {
    font-family: 'Orbitron', sans-serif; font-weight: 900;
    font-size: 0.9rem; padding: 2px 7px; margin-bottom: 6px; border-radius: 8px;
    color: #06121a;
  }
  .mult .cell-mod-label { background: #ff00ff; box-shadow: 0 0 12px rgba(255, 0, 255, 0.7); color: #fff; }
  .prize .cell-mod-label { background: #ffd54a; box-shadow: 0 0 12px rgba(255, 213, 74, 0.7); }
  .upgrade .cell-mod-label { background: #00ffff; box-shadow: 0 0 12px rgba(0, 255, 255, 0.7); }

  @keyframes cm-pop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @media (prefers-reduced-motion: reduce) { .cell-mod { animation: none; } }
</style>
