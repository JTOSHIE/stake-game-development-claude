<script lang="ts">
  // OverdriveMeter.svelte — temporary CSS gauge for the Overdrive multiplier.
  // Positioned where the final boost-gauge art (AssetForge v2) will sit.
  // Purely presentational: given the current multiplier and spins remaining.
  export let multiplier: number = 1
  export let spinsRemaining: number = 0
  export let label: string = 'OVERDRIVE'
  export let spinsLabel: string = 'FREE SPINS'
  // Visual fill: cap the bar at a sensible reference; the number is authoritative.
  $: fillPct = Math.max(0, Math.min(100, ((multiplier - 1) / 15) * 100))
</script>

<div class="overdrive-meter" data-testid="overdrive-meter">
  <div class="od-label">{label}</div>
  <div class="od-mult" class:pulse={multiplier > 1}>{multiplier}×</div>
  <div class="od-bar"><div class="od-fill" style="width:{fillPct}%"></div></div>
  <div class="od-spins">{spinsRemaining} {spinsLabel}</div>
</div>

<style>
  .overdrive-meter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(8, 8, 26, 0.72);
    border: 1px solid var(--theme-primary, #16f2e0);
    box-shadow: 0 0 14px rgba(22, 242, 224, 0.35);
    font-family: 'Orbitron', sans-serif;
    color: var(--theme-primary, #16f2e0);
    min-width: 120px;
    user-select: none;
  }
  .od-label { font-size: 0.7rem; letter-spacing: 2px; opacity: 0.85; }
  .od-mult { font-size: 2rem; font-weight: 900; line-height: 1; color: var(--theme-secondary, #ff2ec4); }
  .od-mult.pulse { animation: odpulse 0.5s ease; }
  .od-bar { width: 100%; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.12); overflow: hidden; }
  .od-fill { height: 100%; background: var(--theme-primary, #16f2e0); transition: width 0.4s ease; }
  .od-spins { font-size: 0.75rem; letter-spacing: 1px; opacity: 0.9; }
  @keyframes odpulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.35); }
    100% { transform: scale(1); }
  }
</style>
