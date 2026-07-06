<script lang="ts">
  // C1 preview harness (dev/screenshot only, NOT part of the production build).
  // Forces each win-tier celebration via the PUBLIC .set() API of the gameStore
  // writables so the reskinned WinBanner / MaxWinCelebration render for capture.
  import { onMount } from 'svelte'
  import WinBanner from './lib/components/WinBanner.svelte'
  import MaxWinCelebration from './lib/components/MaxWinCelebration.svelte'
  import { winAmount, betAmount, isSpinning, isWincap, currencyCode } from './lib/stores/gameStore'
  import { overdriveVisual } from './lib/stores/overdriveVisual'

  let tier: 'big' | 'mega' | 'epic' | 'max' = 'big'
  let showMax = false

  // bet $20 so winMultiplier (derived = win / bet) lands on a representative
  // value per tier: 240/20=12x (big), 900/20=45x (mega), 2400/20=120x (epic).
  const TARGET: Record<string, { win: number; over: boolean }> = {
    big:  { win: 240,   over: false },
    mega: { win: 900,   over: false },
    epic: { win: 2400,  over: false },
    max:  { win: 100000, over: true },
  }

  onMount(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('tier')
    if (t === 'big' || t === 'mega' || t === 'epic' || t === 'max') tier = t

    currencyCode.set('USD')
    betAmount.set(20)
    isSpinning.set(false)
    overdriveVisual.set(TARGET[tier].over)

    if (tier === 'max') {
      winAmount.set(TARGET.max.win)
      isWincap.set(true)
      showMax = true
    } else {
      winAmount.set(TARGET[tier].win)
      isWincap.set(false)
    }
  })

  function noop(): void {}
</script>

<div class="c1-preview-stage">
  {#if tier !== 'max'}
    <WinBanner />
  {:else}
    <MaxWinCelebration show={showMax} on:collect={noop} />
  {/if}
</div>

<style>
  :global(html), :global(body) { margin: 0; background: #05070d; }
  .c1-preview-stage {
    position: relative;
    width: 1280px;
    height: 720px;
    margin: 0 auto;
    overflow: hidden;
    background: radial-gradient(ellipse at 50% 40%, #0e1526, #05070d 70%);
  }
</style>
